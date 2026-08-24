#!/usr/bin/env python3
"""Collect reproducible upstream-fork evidence without touching product worktrees."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from collections.abc import Iterable
from datetime import datetime
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
STATE_RELATIVE_PATH = Path("docs/upstream/upstream-sync-state.json")
REPOSITORIES: dict[str, dict[str, str]] = {
    "backend": {
        "path": "ruoyi-vue-plus-namewta",
        "product_ref": "refs/heads/main",
        "origin_product_ref": "refs/remotes/origin/main",
        "upstream_ref": "refs/remotes/upstream/6.X",
        "mirror_ref": "refs/heads/6.X",
        "baseline_tag_ref": "refs/tags/namewta-base-upstream-6x",
    },
    "frontend": {
        "path": "plus-ui-namewta",
        "product_ref": "refs/heads/main",
        "origin_product_ref": "refs/remotes/origin/main",
        "upstream_ref": "refs/remotes/upstream/6.X-Vue",
        "mirror_ref": "refs/heads/6.X-Vue",
        "baseline_tag_ref": "refs/tags/namewta-base-upstream-6x-vue",
    },
}
RISK_RULES: tuple[tuple[str, re.Pattern[str]], ...] = (
    (
        "authentication/session",
        re.compile(
            r"(^|/)([^/]*(Auth|Login|Register|Session|SaToken)[^/]*|"
            r"(auth|login|register|session|satoken)([._/-]|$))"
        ),
    ),
    (
        "Client/RBAC/menu",
        re.compile(
            r"(^|/)([^/]*(Client|Role|Permission|Menu|UserType|SysUser)[^/]*|"
            r"(client|role|permission|menu|user|userType)([._/-]|$))"
        ),
    ),
    (
        "OSS/upload",
        re.compile(
            r"(^|/)([^/]*(OSS|Oss|Upload|FileUpload|ImageUpload)[^/]*|"
            r"(oss|upload|fileupload|imageupload)([._/-]|$))"
        ),
    ),
    (
        "notification",
        re.compile(
            r"(^|/)([^/]*(Notify|Notice|Mail|SMS|Sms)[^/]*|"
            r"(notify|notice|mail|sms)([._/-]|$))"
        ),
    ),
    (
        "workflow",
        re.compile(
            r"(^|/)([^/]*(Workflow|WarmFlow)[^/]*|(workflow|warmflow)([._/-]|$))"
        ),
    ),
    (
        "SQL/data migration",
        re.compile(r"(^|/)(script/sql|[^/]+\.sql$)", re.IGNORECASE),
    ),
    (
        "build/dependency",
        re.compile(
            r"(^|/)(pom\.xml|package\.json|pnpm-lock\.yaml|mvnw|\.mvn)(/|$)",
            re.IGNORECASE,
        ),
    ),
)


class SyncError(RuntimeError):
    """A contract violation that must stop ref or state updates."""


def now_rfc3339() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run_command(
    cwd: Path,
    args: list[str],
    *,
    allowed: Iterable[int] = (0,),
    timeout: int = 120,
) -> subprocess.CompletedProcess[str]:
    try:
        result = subprocess.run(
            args,
            cwd=cwd,
            text=True,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise SyncError(f"command timed out in {cwd}: {' '.join(args)}") from exc
    if result.returncode not in set(allowed):
        detail = result.stderr.strip() or result.stdout.strip() or "no output"
        raise SyncError(
            f"command failed ({result.returncode}) in {cwd}: {' '.join(args)}\n{detail}"
        )
    return result


def git(
    repo: Path,
    *args: str,
    allowed: Iterable[int] = (0,),
    timeout: int = 120,
) -> subprocess.CompletedProcess[str]:
    return run_command(repo, ["git", *args], allowed=allowed, timeout=timeout)


def ensure_repository(path: Path) -> None:
    result = git(path, "rev-parse", "--is-inside-work-tree")
    if result.stdout.strip() != "true":
        raise SyncError(f"not a Git worktree: {path}")


def resolve(repo: Path, ref: str, *, required: bool = True) -> str | None:
    result = git(repo, "rev-parse", "--verify", f"{ref}^{{commit}}", allowed=(0, 128))
    if result.returncode == 0:
        return result.stdout.strip()
    if required:
        raise SyncError(f"missing commit ref in {repo}: {ref}")
    return None


def is_ancestor(repo: Path, ancestor: str, descendant: str) -> bool:
    result = git(
        repo, "merge-base", "--is-ancestor", ancestor, descendant, allowed=(0, 1)
    )
    return result.returncode == 0


def unique_merge_base(repo: Path, left: str, right: str) -> str:
    output = git(repo, "merge-base", "--all", left, right).stdout.splitlines()
    bases = [line.strip() for line in output if line.strip()]
    if len(bases) != 1:
        raise SyncError(
            f"expected one merge base in {repo}, found {len(bases)} for {left} and {right}"
        )
    return bases[0]


def commit_parents(repo: Path, commit: str) -> list[str]:
    line = git(repo, "show", "-s", "--format=%P", commit).stdout.strip()
    return line.split() if line else []


def dirty_paths(repo: Path) -> list[str]:
    raw = git(repo, "status", "--porcelain=v1", "-z").stdout
    tokens = raw.split("\0")
    paths: set[str] = set()
    index = 0
    while index < len(tokens):
        token = tokens[index]
        index += 1
        if not token:
            continue
        if len(token) < 4:
            continue
        status = token[:2]
        paths.add(token[3:])
        if ("R" in status or "C" in status) and index < len(tokens) and tokens[index]:
            paths.add(tokens[index])
            index += 1
    return sorted(paths)


def rev_counts(repo: Path, left: str, right: str) -> dict[str, int]:
    output = git(
        repo, "rev-list", "--left-right", "--count", f"{left}...{right}"
    ).stdout
    values = output.split()
    if len(values) != 2:
        raise SyncError(f"unexpected rev-list count output in {repo}: {output!r}")
    return {"left_only": int(values[0]), "right_only": int(values[1])}


def fetch_remote(repo: Path, remote: str, *, tags: bool) -> tuple[bool, str | None]:
    args = ["fetch", "--prune"]
    if tags:
        args.append("--tags")
    args.append(remote)
    result = git(repo, *args, allowed=range(256), timeout=180)
    if result.returncode == 0:
        return True, None
    detail = (
        result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}"
    )
    return False, detail


def refresh_refs(root: Path) -> dict[str, dict[str, Any]]:
    results: dict[str, dict[str, Any]] = {}
    parent_ok, parent_error = fetch_remote(root, "origin", tags=False)
    results["workspace"] = {"origin": parent_ok, "origin_error": parent_error}
    for repository, config in REPOSITORIES.items():
        repo = root / config["path"]
        origin_ok, origin_error = fetch_remote(repo, "origin", tags=False)
        upstream_ok, upstream_error = fetch_remote(repo, "upstream", tags=True)
        results[repository] = {
            "origin": origin_ok,
            "origin_error": origin_error,
            "upstream": upstream_ok,
            "upstream_error": upstream_error,
        }
    return results


def checked_out_worktree(repo: Path, branch_ref: str) -> Path | None:
    output = git(repo, "worktree", "list", "--porcelain").stdout
    current_path: Path | None = None
    for line in output.splitlines():
        if line.startswith("worktree "):
            current_path = Path(line.removeprefix("worktree "))
        elif line == f"branch {branch_ref}" and current_path is not None:
            return current_path
        elif not line:
            current_path = None
    return None


def preflight_advances(items: list[tuple[Path, str, str, str]]) -> list[dict[str, Any]]:
    actions: list[dict[str, Any]] = []
    for repo, local_ref, target_ref, label in items:
        local_sha = resolve(repo, local_ref)
        target_sha = resolve(repo, target_ref)
        assert local_sha and target_sha
        if local_sha == target_sha:
            actions.append({"label": label, "status": "already-current", "repo": repo})
            continue
        if not is_ancestor(repo, local_sha, target_sha):
            raise SyncError(
                f"ref is not fast-forwardable for {label}: {local_ref}={local_sha}, "
                f"{target_ref}={target_sha}"
            )
        worktree = checked_out_worktree(repo, local_ref)
        if worktree is not None and dirty_paths(worktree):
            raise SyncError(f"checked-out branch is dirty for {label}: {worktree}")
        actions.append(
            {
                "label": label,
                "status": "pending",
                "repo": repo,
                "local_ref": local_ref,
                "target_ref": target_ref,
                "local_sha": local_sha,
                "target_sha": target_sha,
                "worktree": worktree,
            }
        )
    return actions


def apply_advances(actions: list[dict[str, Any]]) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for action in actions:
        if action["status"] == "already-current":
            results.append({"label": action["label"], "status": "already-current"})
            continue
        repo: Path = action["repo"]
        worktree: Path | None = action["worktree"]
        if worktree is not None:
            git(worktree, "merge", "--ff-only", action["target_ref"])
        else:
            git(
                repo,
                "update-ref",
                action["local_ref"],
                action["target_sha"],
                action["local_sha"],
            )
        results.append(
            {
                "label": action["label"],
                "status": "advanced",
                "from": action["local_sha"],
                "to": action["target_sha"],
            }
        )
    return results


def advance_requested_refs(
    root: Path, mirrors: bool, products: bool
) -> list[dict[str, str]]:
    items: list[tuple[Path, str, str, str]] = []
    if mirrors:
        for repository, config in REPOSITORIES.items():
            items.append(
                (
                    root / config["path"],
                    config["mirror_ref"],
                    config["upstream_ref"],
                    f"{repository} mirror",
                )
            )
    if products:
        items.append(
            (
                root,
                "refs/heads/main",
                "refs/remotes/origin/main",
                "workspace product",
            )
        )
        for repository, config in REPOSITORIES.items():
            items.append(
                (
                    root / config["path"],
                    config["product_ref"],
                    config["origin_product_ref"],
                    f"{repository} product",
                )
            )
    return apply_advances(preflight_advances(items))


def bootstrap_integration(
    repo: Path,
    product_sha: str,
    upstream_sha: str,
    baseline_tag_sha: str,
    timestamp: str,
) -> dict[str, Any]:
    range_spec = f"{baseline_tag_sha}..{product_sha}"
    merges = git(
        repo, "rev-list", "--first-parent", "--merges", range_spec
    ).stdout.splitlines()
    for merge_commit in merges:
        parents = commit_parents(repo, merge_commit)
        for parent in parents[1:]:
            if is_ancestor(repo, parent, upstream_sha):
                return {
                    "upstream_sha": parent,
                    "product_merge_commit_sha": merge_commit,
                    "source": "graph_merge",
                    "confirmed_at": timestamp,
                }
    merge_base = unique_merge_base(repo, product_sha, upstream_sha)
    return {
        "upstream_sha": merge_base,
        "product_merge_commit_sha": None,
        "source": "derived_merge_base",
        "confirmed_at": timestamp,
    }


def validate_saved_integration(
    repo: Path,
    integration: dict[str, Any],
    product_sha: str,
    upstream_sha: str,
) -> None:
    integrated_sha = integration.get("upstream_sha")
    if not isinstance(integrated_sha, str) or not integrated_sha:
        raise SyncError(f"malformed saved integration in {repo}: missing upstream_sha")
    resolve(repo, integrated_sha)
    if not is_ancestor(repo, integrated_sha, product_sha):
        raise SyncError(
            f"saved upstream checkpoint is no longer in product history in {repo}: {integrated_sha}"
        )
    if not is_ancestor(repo, integrated_sha, upstream_sha):
        raise SyncError(
            f"observed upstream history does not contain saved checkpoint in {repo}: "
            f"{integrated_sha} !<= {upstream_sha}"
        )
    merge_commit = integration.get("product_merge_commit_sha")
    if merge_commit:
        resolve(repo, merge_commit)
        if not is_ancestor(repo, merge_commit, product_sha):
            raise SyncError(
                f"saved integration merge is no longer in product history in {repo}: {merge_commit}"
            )


def parse_commits(repo: Path, start: str, end: str) -> list[dict[str, str]]:
    if start == end:
        return []
    fmt = "%H%x1f%h%x1f%ad%x1f%s"
    output = git(
        repo,
        "log",
        "--reverse",
        f"--format={fmt}",
        "--date=short",
        f"{start}..{end}",
    ).stdout
    commits: list[dict[str, str]] = []
    for line in output.splitlines():
        parts = line.split("\x1f", 3)
        if len(parts) == 4:
            commits.append(
                {
                    "sha": parts[0],
                    "short_sha": parts[1],
                    "date": parts[2],
                    "subject": parts[3],
                }
            )
    return commits


def parse_name_status(repo: Path, start: str, end: str) -> list[dict[str, Any]]:
    if start == end:
        return []
    raw = git(repo, "diff", "--name-status", "-z", "--find-renames", start, end).stdout
    tokens = raw.split("\0")
    files: list[dict[str, Any]] = []
    index = 0
    while index < len(tokens):
        status = tokens[index]
        index += 1
        if not status:
            continue
        if index >= len(tokens):
            raise SyncError(f"malformed name-status output in {repo}")
        first_path = tokens[index]
        index += 1
        if status.startswith(("R", "C")):
            if index >= len(tokens):
                raise SyncError(f"malformed rename output in {repo}")
            new_path = tokens[index]
            index += 1
            files.append({"status": status, "old_path": first_path, "path": new_path})
        else:
            files.append({"status": status, "old_path": None, "path": first_path})
    return files


def parse_numstat(repo: Path, start: str, end: str) -> dict[str, dict[str, str]]:
    if start == end:
        return {}
    raw = git(repo, "diff", "--numstat", "-z", "--find-renames", start, end).stdout
    tokens = raw.split("\0")
    stats: dict[str, dict[str, str]] = {}
    index = 0
    while index < len(tokens):
        token = tokens[index]
        index += 1
        if not token:
            continue
        parts = token.split("\t", 2)
        if len(parts) != 3:
            raise SyncError(f"malformed numstat output in {repo}: {token!r}")
        added, deleted, path = parts
        if path:
            stats[path] = {"additions": added, "deletions": deleted}
            continue
        if index + 1 >= len(tokens):
            raise SyncError(f"malformed rename numstat output in {repo}")
        index += 1  # old path
        new_path = tokens[index]
        index += 1
        stats[new_path] = {"additions": added, "deletions": deleted}
    return stats


def changed_path_set(repo: Path, start: str, end: str) -> set[str]:
    return {item["path"] for item in parse_name_status(repo, start, end)}


def risk_categories(path: str) -> list[str]:
    return [name for name, pattern in RISK_RULES if pattern.search(path)]


def merge_tree(repo: Path, product_sha: str, upstream_sha: str) -> dict[str, Any]:
    result = git(
        repo,
        "merge-tree",
        "--write-tree",
        "--messages",
        product_sha,
        upstream_sha,
        allowed=(0, 1),
    )
    stage_pattern = re.compile(r"^\d{6} [0-9a-f]{40,64} [123]\t(.+)$")
    conflict_paths: set[str] = set()
    messages: list[str] = []
    lines = result.stdout.splitlines()
    tree_sha = (
        lines[0].strip()
        if lines and re.fullmatch(r"[0-9a-f]{40,64}", lines[0].strip())
        else None
    )
    for line in lines[1:]:
        match = stage_pattern.match(line)
        if match:
            conflict_paths.add(match.group(1))
        elif line.startswith(("CONFLICT", "Auto-merging")):
            messages.append(line)
    status = "clean" if result.returncode == 0 else "conflicted"
    if result.returncode == 1 and not conflict_paths:
        status = "conflicted-unparsed"
    return {
        "status": status,
        "exit_code": result.returncode,
        "tree_sha": tree_sha,
        "conflict_paths": sorted(conflict_paths),
        "messages": messages,
    }


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {
            "schema_version": SCHEMA_VERSION,
            "updated_at": None,
            "repositories": {},
            "runs": [],
            "integration_events": [],
        }
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SyncError(f"cannot read state file {path}: {exc}") from exc
    if data.get("schema_version") != SCHEMA_VERSION:
        raise SyncError(
            f"unsupported state schema in {path}: {data.get('schema_version')!r}"
        )
    for key in ("repositories", "runs", "integration_events"):
        if key not in data or not isinstance(
            data[key], dict if key == "repositories" else list
        ):
            raise SyncError(f"malformed state file {path}: {key}")
    return data


def atomic_write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", dir=path.parent
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def atomic_write_json(path: Path, data: dict[str, Any]) -> None:
    atomic_write_text(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def sanitize_topic(topic: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", topic.strip().lower()).strip("-")
    if not normalized:
        raise SyncError("topic must contain ASCII letters or digits")
    return normalized


def choose_report_dir(root: Path, date: str, topic: str) -> Path:
    base = root / "docs/upstream" / f"{date}_{topic}"
    candidate = base
    counter = 2
    while candidate.exists():
        candidate = Path(f"{base}-{counter:02d}")
        counter += 1
    return candidate


def classify_files(
    files: list[dict[str, Any]], stats: dict[str, dict[str, str]]
) -> None:
    for item in files:
        item.update(stats.get(item["path"], {"additions": "?", "deletions": "?"}))
        item["risk_categories"] = risk_categories(item["path"])


def collect_repository(
    root: Path,
    repository: str,
    config: dict[str, str],
    state: dict[str, Any],
    freshness: str,
    fetch_error: str | None,
    timestamp: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    repo = root / config["path"]
    ensure_repository(repo)
    product_sha = resolve(repo, config["product_ref"])
    origin_product_sha = resolve(repo, config["origin_product_ref"], required=False)
    upstream_sha = resolve(repo, config["upstream_ref"])
    mirror_sha = resolve(repo, config["mirror_ref"])
    baseline_tag_sha = resolve(repo, config["baseline_tag_ref"])
    assert product_sha and upstream_sha and mirror_sha and baseline_tag_sha

    repository_state = state["repositories"].get(repository, {})
    for field in (
        "path",
        "product_ref",
        "origin_product_ref",
        "upstream_ref",
        "mirror_ref",
        "baseline_tag_ref",
    ):
        saved_value = repository_state.get(field)
        if saved_value is not None and saved_value != config[field]:
            raise SyncError(
                f"saved repository config mismatch for {repository}.{field}: "
                f"{saved_value!r} != {config[field]!r}"
            )
    integration = repository_state.get("last_confirmed_integration")
    if integration:
        validate_saved_integration(repo, integration, product_sha, upstream_sha)
    else:
        integration = bootstrap_integration(
            repo, product_sha, upstream_sha, baseline_tag_sha, timestamp
        )
    integrated_sha = integration["upstream_sha"]
    merge_base_sha = unique_merge_base(repo, product_sha, upstream_sha)
    commits = parse_commits(repo, integrated_sha, upstream_sha)
    files = parse_name_status(repo, integrated_sha, upstream_sha)
    stats = parse_numstat(repo, integrated_sha, upstream_sha)
    classify_files(files, stats)
    upstream_paths = {item["path"] for item in files}
    product_paths = changed_path_set(repo, integrated_sha, product_sha)
    dirty = dirty_paths(repo)
    conflict = merge_tree(repo, product_sha, upstream_sha)
    conflict_paths = set(conflict["conflict_paths"])
    overlap_paths = sorted(upstream_paths & product_paths)
    automatic_overlap_paths = sorted(set(overlap_paths) - conflict_paths)
    dirty_overlap_paths = sorted(upstream_paths & set(dirty))
    risk_paths = [
        {"path": item["path"], "categories": item["risk_categories"]}
        for item in files
        if item["risk_categories"]
    ]
    shortstat = ""
    if integrated_sha != upstream_sha:
        shortstat = git(
            repo, "diff", "--shortstat", integrated_sha, upstream_sha
        ).stdout.strip()

    observation = {
        "repository": repository,
        "path": config["path"],
        "freshness": freshness,
        "fetch_error": fetch_error,
        "product_sha": product_sha,
        "origin_product_sha": origin_product_sha,
        "mirror_sha": mirror_sha,
        "observed_upstream_sha": upstream_sha,
        "baseline_tag_sha": baseline_tag_sha,
        "merge_base_sha": merge_base_sha,
        "last_confirmed_integration": integration,
        "product_vs_upstream": rev_counts(repo, product_sha, upstream_sha),
        "product_vs_origin": (
            rev_counts(repo, product_sha, origin_product_sha)
            if origin_product_sha
            else None
        ),
        "dirty_paths": dirty,
        "upstream_commits": commits,
        "upstream_files": files,
        "upstream_shortstat": shortstat,
        "product_overlap_paths": overlap_paths,
        "automatic_overlap_paths": automatic_overlap_paths,
        "dirty_overlap_paths": dirty_overlap_paths,
        "risk_paths": risk_paths,
        "merge_tree": conflict,
    }
    new_repository_state = {
        "path": config["path"],
        "product_ref": config["product_ref"],
        "origin_product_ref": config["origin_product_ref"],
        "upstream_ref": config["upstream_ref"],
        "mirror_ref": config["mirror_ref"],
        "baseline_tag_ref": config["baseline_tag_ref"],
        "last_confirmed_integration": integration,
        "last_observation": {
            "observed_at": timestamp,
            "freshness": freshness,
            "product_sha": product_sha,
            "origin_product_sha": origin_product_sha,
            "mirror_sha": mirror_sha,
            "observed_upstream_sha": upstream_sha,
            "merge_base_sha": merge_base_sha,
        },
    }
    return observation, new_repository_state


def markdown_text(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def markdown_path(path: str) -> str:
    sanitized = path.replace("`", "").replace("|", "\\|").replace("\n", " ")
    return f"`{sanitized}`"


def render_diff_report(run: dict[str, Any]) -> str:
    lines = [
        "# 上游增量 Diff 报告",
        "",
        f"- 运行 ID：`{run['run_id']}`",
        f"- 生成时间：`{run['created_at']}`",
        f"- 主题：`{run['topic']}`",
        "- 口径：已确认集成上游点到本次观测上游点；不以镜像分支位置替代集成点。",
        "",
    ]
    for repository in ("backend", "frontend"):
        item = run["repositories"][repository]
        integration = item["last_confirmed_integration"]
        lines.extend(
            [
                f"## {repository}",
                "",
                "| 固定项 | 值 |",
                "|---|---|",
                f"| 产品 SHA | `{item['product_sha']}` |",
                f"| 已集成上游 SHA | `{integration['upstream_sha']}` |",
                f"| 集成识别方式 | `{integration['source']}` |",
                f"| 产品 merge commit | `{integration.get('product_merge_commit_sha') or 'null'}` |",
                f"| 观测上游 SHA | `{item['observed_upstream_sha']}` |",
                f"| merge-base | `{item['merge_base_sha']}` |",
                f"| mirror SHA | `{item['mirror_sha']}` |",
                f"| freshness | `{item['freshness']}` |",
                "",
            ]
        )
        if item["fetch_error"]:
            lines.extend([f"> 上游刷新失败：{markdown_text(item['fetch_error'])}", ""])
        commits = item["upstream_commits"]
        lines.extend([f"### 上游新增提交（{len(commits)}）", ""])
        if commits:
            for commit in commits:
                lines.append(
                    f"- `{commit['short_sha']}` {commit['date']} {markdown_text(commit['subject'])}"
                )
        else:
            lines.append("- 无新增上游提交。")
        lines.extend(["", "### 文件 Diff", ""])
        lines.append(f"统计：{item['upstream_shortstat'] or '0 files changed'}")
        lines.append("")
        files = item["upstream_files"]
        if files:
            lines.extend(
                [
                    "| 状态 | 文件 | 新增 | 删除 | 风险分类 |",
                    "|---|---|---:|---:|---|",
                ]
            )
            for changed in files:
                display_path = changed["path"]
                if changed.get("old_path"):
                    display_path = f"{changed['old_path']} -> {display_path}"
                categories = ", ".join(changed["risk_categories"]) or "-"
                lines.append(
                    f"| `{changed['status']}` | {markdown_path(display_path)} | "
                    f"{changed['additions']} | {changed['deletions']} | {markdown_text(categories)} |"
                )
        else:
            lines.append("无文件变化。")
        lines.extend(["", "### 产品重叠面", ""])
        overlaps = item["product_overlap_paths"]
        if overlaps:
            lines.extend(f"- {markdown_path(path)}" for path in overlaps)
        else:
            lines.append("- 上游增量与产品自集成点后的文件变化无路径重叠。")
        lines.extend(["", "### 高风险上游路径", ""])
        if item["risk_paths"]:
            for risk in item["risk_paths"]:
                lines.append(
                    f"- {markdown_path(risk['path'])}: {markdown_text(', '.join(risk['categories']))}"
                )
        else:
            lines.append(
                "- 未命中内置热点分类；仍需按 customization map 复核长期不变量。"
            )
        lines.extend(
            [
                "",
                "### 复现命令",
                "",
                "```bash",
                f"git -C {item['path']} log --oneline {integration['upstream_sha']}..{item['observed_upstream_sha']}",
                f"git -C {item['path']} diff --name-status {integration['upstream_sha']}..{item['observed_upstream_sha']}",
                f"git -C {item['path']} diff {integration['upstream_sha']}..{item['observed_upstream_sha']} -- <path>",
                "```",
                "",
            ]
        )
    lines.extend(
        [
            "## 结论边界",
            "",
            "本报告提供完整文件清单与可复现固定点，不内嵌无限制完整 patch。代码级结论必须使用上述固定 SHA 的路径级 diff 补证。",
            "",
        ]
    )
    return "\n".join(lines)


def append_path_list(lines: list[str], paths: list[str], empty_text: str) -> None:
    if paths:
        lines.extend(f"- {markdown_path(path)}" for path in paths)
    else:
        lines.append(f"- {empty_text}")


def render_conflict_report(run: dict[str, Any]) -> str:
    lines = [
        "# 上游合并冲突客观报告",
        "",
        f"- 运行 ID：`{run['run_id']}`",
        f"- 生成时间：`{run['created_at']}`",
        "- 模拟方式：`git merge-tree --write-tree --messages <product-sha> <upstream-sha>`",
        "- 工作树说明：模拟只使用提交固定点；未提交修改不进入 merge-tree。",
        "",
    ]
    for repository in ("backend", "frontend"):
        item = run["repositories"][repository]
        tree = item["merge_tree"]
        lines.extend(
            [
                f"## {repository}",
                "",
                "| 固定项 | 值 |",
                "|---|---|",
                f"| 产品 SHA | `{item['product_sha']}` |",
                f"| 上游 SHA | `{item['observed_upstream_sha']}` |",
                f"| merge-base | `{item['merge_base_sha']}` |",
                f"| merge-tree 状态 | `{tree['status']}` |",
                f"| merge-tree exit code | `{tree['exit_code']}` |",
                f"| 结果 tree | `{tree.get('tree_sha') or 'null'}` |",
                f"| Git 确认冲突数 | `{len(tree['conflict_paths'])}` |",
                "",
                "### Git 确认冲突",
                "",
            ]
        )
        append_path_list(lines, tree["conflict_paths"], "Git 未报告文本或树冲突。")
        if tree["messages"]:
            lines.extend(["", "merge-tree 消息：", "", "```text"])
            lines.extend(tree["messages"])
            lines.extend(["```", ""])
        else:
            lines.append("")
        lines.extend(["### 可自动合并的双方重叠", ""])
        append_path_list(
            lines,
            item["automatic_overlap_paths"],
            "没有双方同时修改但可自动合并的路径。",
        )
        lines.extend(["", "### 定制合同风险", ""])
        if item["risk_paths"]:
            for risk in item["risk_paths"]:
                lines.append(
                    f"- {markdown_path(risk['path'])}: {markdown_text(', '.join(risk['categories']))}"
                )
        else:
            lines.append("- 未命中内置热点分类；仍须核对 customization map。")
        lines.extend(["", "### 未提交工作树重叠", ""])
        append_path_list(
            lines,
            item["dirty_overlap_paths"],
            "未提交路径与本次上游增量无交集。",
        )
        lines.extend(["", "### 工作树状态", ""])
        append_path_list(lines, item["dirty_paths"], "工作树 clean。")
        lines.extend(["", "### 复现命令", "", "```bash"])
        lines.append(
            f"git -C {item['path']} merge-tree --write-tree --messages "
            f"{item['product_sha']} {item['observed_upstream_sha']}"
        )
        lines.extend(["```", ""])
    lines.extend(
        [
            "## 局限",
            "",
            "`merge-tree` 只能描述冻结提交的 Git 文本/树合并结果。零文本冲突不代表编译、运行时、API、权限、SQL 迁移或业务语义安全；必须继续执行 customization map 复核与项目质量门禁。",
            "",
        ]
    )
    return "\n".join(lines)


def workspace_observation(root: Path) -> dict[str, Any]:
    ensure_repository(root)
    product_sha = resolve(root, "refs/heads/main")
    origin_sha = resolve(root, "refs/remotes/origin/main", required=False)
    assert product_sha
    return {
        "product_sha": product_sha,
        "origin_product_sha": origin_sha,
        "product_vs_origin": rev_counts(root, product_sha, origin_sha)
        if origin_sha
        else None,
        "dirty_paths": dirty_paths(root),
    }


def state_path(root: Path, value: str | None) -> Path:
    candidate = root / STATE_RELATIVE_PATH if value is None else root / Path(value)
    resolved = candidate.resolve()
    try:
        resolved.relative_to(root.resolve())
    except ValueError as exc:
        raise SyncError(
            f"state file must stay under repository root: {resolved}"
        ) from exc
    return resolved


def assess(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    ensure_repository(root)
    for config in REPOSITORIES.values():
        ensure_repository(root / config["path"])
    topic = sanitize_topic(args.topic)
    timestamp = now_rfc3339()
    date = args.date or timestamp[:10]
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        raise SyncError(f"date must use YYYY-MM-DD: {date!r}")
    fetch_results: dict[str, dict[str, Any]] = {}
    if args.fetch:
        fetch_results = refresh_refs(root)
    advance_results = advance_requested_refs(
        root, mirrors=args.advance_mirrors, products=args.advance_products
    )
    path = state_path(root, args.state_file)
    state = load_state(path)
    repository_observations: dict[str, Any] = {}
    new_repository_states: dict[str, Any] = {}
    for repository, config in REPOSITORIES.items():
        fetch_item = fetch_results.get(repository, {})
        if not args.fetch:
            freshness = "cached"
            fetch_error = None
        elif fetch_item.get("upstream"):
            freshness = "fresh"
            fetch_error = None
        else:
            freshness = "stale"
            fetch_error = fetch_item.get("upstream_error") or "upstream fetch failed"
        observation, repository_state = collect_repository(
            root,
            repository,
            config,
            state,
            freshness,
            fetch_error,
            timestamp,
        )
        repository_observations[repository] = observation
        new_repository_states[repository] = repository_state

    report_dir = choose_report_dir(root, date, topic)
    run_id = f"{timestamp.replace(':', '')}-{report_dir.name}"
    run = {
        "run_id": run_id,
        "created_at": timestamp,
        "topic": topic,
        "report_dir": str(report_dir.relative_to(root)),
        "fetch_requested": bool(args.fetch),
        "fetch_results": fetch_results,
        "advance_results": advance_results,
        "workspace": workspace_observation(root),
        "repositories": repository_observations,
    }
    if args.dry_run:
        print(json.dumps(run, ensure_ascii=False, indent=2))
        return 0

    report_dir.mkdir(parents=True, exist_ok=False)
    atomic_write_text(report_dir / "diff_report.md", render_diff_report(run))
    atomic_write_text(report_dir / "conflict_report.md", render_conflict_report(run))
    state["repositories"].update(new_repository_states)
    state["runs"].append(run)
    state["updated_at"] = timestamp
    atomic_write_json(path, state)
    print(
        json.dumps(
            {"state": str(path), "report_dir": str(report_dir)}, ensure_ascii=False
        )
    )
    return 0


def record_integration(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    config = REPOSITORIES[args.repository]
    repo = root / config["path"]
    ensure_repository(repo)
    path = state_path(root, args.state_file)
    state = load_state(path)
    if not path.exists():
        raise SyncError(f"state file does not exist; run assess first: {path}")
    if not args.verification:
        raise SyncError("at least one --verification evidence string is required")
    merge_sha = resolve(repo, args.merge_commit)
    upstream_sha = resolve(repo, args.upstream_sha)
    product_sha = resolve(repo, config["product_ref"])
    observed_upstream_sha = resolve(repo, config["upstream_ref"])
    assert merge_sha and upstream_sha and product_sha and observed_upstream_sha
    if not is_ancestor(repo, merge_sha, product_sha):
        raise SyncError(f"merge commit is not reachable from product main: {merge_sha}")
    parents = commit_parents(repo, merge_sha)
    if len(parents) < 2:
        raise SyncError(f"integration commit is not a merge commit: {merge_sha}")
    if upstream_sha not in parents[1:]:
        raise SyncError(
            f"upstream SHA is not an exact non-first parent of merge commit: {upstream_sha}"
        )
    if not is_ancestor(repo, upstream_sha, observed_upstream_sha):
        raise SyncError(
            f"recorded upstream SHA is not in current upstream history: {upstream_sha}"
        )
    timestamp = now_rfc3339()
    integration = {
        "upstream_sha": upstream_sha,
        "product_merge_commit_sha": merge_sha,
        "source": "recorded_merge",
        "confirmed_at": timestamp,
        "verification": list(args.verification),
    }
    repository_state = state["repositories"].get(args.repository)
    if not repository_state:
        raise SyncError(
            f"repository state missing; run assess first: {args.repository}"
        )
    repository_state["last_confirmed_integration"] = integration
    event = {
        "repository": args.repository,
        "recorded_at": timestamp,
        "product_sha": product_sha,
        "merge_commit_sha": merge_sha,
        "upstream_sha": upstream_sha,
        "verification": list(args.verification),
    }
    state["integration_events"].append(event)
    state["updated_at"] = timestamp
    atomic_write_json(path, state)
    print(json.dumps(event, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Assess NAMEWTA upstream forks and persist graph-backed integration checkpoints."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    assess_parser = subparsers.add_parser(
        "assess", help="Generate diff/conflict reports"
    )
    assess_parser.add_argument("--root", default=".", help="Parent repository root")
    assess_parser.add_argument("--topic", required=True, help="ASCII topic slug")
    assess_parser.add_argument("--date", help="Report date override (YYYY-MM-DD)")
    assess_parser.add_argument("--state-file", help="State path relative to root")
    assess_parser.add_argument(
        "--fetch", action="store_true", help="Refresh origin/upstream refs"
    )
    assess_parser.add_argument(
        "--advance-mirrors", action="store_true", help="Fast-forward local mirror refs"
    )
    assess_parser.add_argument(
        "--advance-products",
        action="store_true",
        help="Fast-forward local main refs from origin",
    )
    assess_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print snapshot JSON without writing reports/state",
    )
    assess_parser.set_defaults(handler=assess)

    record_parser = subparsers.add_parser(
        "record-integration", help="Record a verified upstream merge checkpoint"
    )
    record_parser.add_argument("--root", default=".", help="Parent repository root")
    record_parser.add_argument(
        "--repository", choices=sorted(REPOSITORIES), required=True
    )
    record_parser.add_argument("--merge-commit", required=True)
    record_parser.add_argument("--upstream-sha", required=True)
    record_parser.add_argument("--verification", action="append", required=True)
    record_parser.add_argument("--state-file", help="State path relative to root")
    record_parser.set_defaults(handler=record_integration)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.handler(args)
    except SyncError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
