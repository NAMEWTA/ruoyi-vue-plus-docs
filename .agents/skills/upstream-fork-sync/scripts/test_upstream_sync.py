#!/usr/bin/env python3
"""Behavior tests for upstream_sync.py using isolated temporary Git repositories."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT_PATH = Path(__file__).with_name("upstream_sync.py")
SPEC = importlib.util.spec_from_file_location("upstream_sync", SCRIPT_PATH)
assert SPEC and SPEC.loader
SYNC = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SYNC)


def command(cwd: Path, *args: str) -> str:
    result = subprocess.run(
        list(args),
        cwd=cwd,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise AssertionError(
            f"command failed ({result.returncode}) in {cwd}: {' '.join(args)}\n"
            f"stdout={result.stdout}\nstderr={result.stderr}"
        )
    return result.stdout.strip()


def init_repo(path: Path) -> None:
    path.mkdir(parents=True)
    command(path, "git", "init", "-b", "main")
    command(path, "git", "config", "user.name", "Skill Test")
    command(path, "git", "config", "user.email", "skill-test@example.invalid")


def commit_file(repo: Path, relative: str, content: str, message: str) -> str:
    target = repo / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    command(repo, "git", "add", relative)
    command(repo, "git", "commit", "-m", message)
    return command(repo, "git", "rev-parse", "HEAD")


def set_tracking_refs(
    repo: Path, product_sha: str, upstream_ref: str, upstream_sha: str
) -> None:
    command(repo, "git", "update-ref", "refs/remotes/origin/main", product_sha)
    command(repo, "git", "update-ref", upstream_ref, upstream_sha)


class WorkspaceFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        init_repo(root)
        self.parent_sha = commit_file(root, "parent.txt", "parent\n", "parent base")
        command(root, "git", "update-ref", "refs/remotes/origin/main", self.parent_sha)
        self.backend = root / "ruoyi-vue-plus-namewta"
        self.frontend = root / "plus-ui-namewta"
        self.backend_upstream_1, self.backend_upstream_2, self.backend_merge = (
            self._backend()
        )
        self.frontend_base = self._frontend()

    def _backend(self) -> tuple[str, str, str]:
        repo = self.backend
        init_repo(repo)
        base = commit_file(repo, "base.txt", "base\n", "base")
        command(repo, "git", "tag", "namewta-base-upstream-6x", base)
        command(repo, "git", "branch", "6.X", base)
        command(repo, "git", "switch", "6.X")
        upstream_1 = commit_file(repo, "upstream-one.txt", "one\n", "upstream one")
        command(repo, "git", "switch", "main")
        commit_file(repo, "product.txt", "product\n", "product change")
        command(repo, "git", "merge", "--no-ff", upstream_1, "-m", "merge upstream one")
        merge_commit = command(repo, "git", "rev-parse", "HEAD")
        command(repo, "git", "switch", "6.X")
        upstream_2 = commit_file(repo, "upstream-two.txt", "two\n", "upstream two")
        command(repo, "git", "switch", "main")
        product_sha = command(repo, "git", "rev-parse", "HEAD")
        set_tracking_refs(repo, product_sha, "refs/remotes/upstream/6.X", upstream_2)
        return upstream_1, upstream_2, merge_commit

    def _frontend(self) -> str:
        repo = self.frontend
        init_repo(repo)
        base = commit_file(repo, "base.txt", "base\n", "base")
        command(repo, "git", "tag", "namewta-base-upstream-6x-vue", base)
        command(repo, "git", "branch", "6.X-Vue", base)
        product_sha = commit_file(repo, "product.txt", "product\n", "product change")
        set_tracking_refs(repo, product_sha, "refs/remotes/upstream/6.X-Vue", base)
        return base


class UpstreamSyncTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name) / "workspace"
        self.fixture = WorkspaceFixture(self.root)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def run_cli(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT_PATH), *args],
            text=True,
            capture_output=True,
            check=False,
        )

    def test_dry_run_derives_graph_merge_and_merge_base(self) -> None:
        result = self.run_cli(
            "assess",
            "--root",
            str(self.root),
            "--topic",
            "fixture",
            "--date",
            "2026-08-24",
            "--dry-run",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        snapshot = json.loads(result.stdout)
        backend = snapshot["repositories"]["backend"]
        frontend = snapshot["repositories"]["frontend"]
        self.assertEqual(
            backend["last_confirmed_integration"]["upstream_sha"],
            self.fixture.backend_upstream_1,
        )
        self.assertEqual(
            backend["last_confirmed_integration"]["product_merge_commit_sha"],
            self.fixture.backend_merge,
        )
        self.assertEqual(backend["last_confirmed_integration"]["source"], "graph_merge")
        self.assertEqual(
            [c["sha"] for c in backend["upstream_commits"]],
            [self.fixture.backend_upstream_2],
        )
        self.assertEqual(
            frontend["last_confirmed_integration"]["source"], "derived_merge_base"
        )
        self.assertEqual(
            frontend["last_confirmed_integration"]["upstream_sha"],
            self.fixture.frontend_base,
        )

    def test_assess_writes_reports_and_append_only_runs(self) -> None:
        for expected_suffix in ("2026-08-24_fixture", "2026-08-24_fixture-02"):
            result = self.run_cli(
                "assess",
                "--root",
                str(self.root),
                "--topic",
                "fixture",
                "--date",
                "2026-08-24",
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            output = json.loads(result.stdout)
            self.assertTrue(output["report_dir"].endswith(expected_suffix))
            report_dir = Path(output["report_dir"])
            self.assertTrue((report_dir / "diff_report.md").is_file())
            self.assertTrue((report_dir / "conflict_report.md").is_file())
            diff_report = (report_dir / "diff_report.md").read_text(encoding="utf-8")
            conflict_report = (report_dir / "conflict_report.md").read_text(
                encoding="utf-8"
            )
            self.assertIn(self.fixture.backend_upstream_2, diff_report)
            self.assertIn("Git 确认冲突数 | `0`", conflict_report)
        state = json.loads(
            (self.root / "docs/upstream/upstream-sync-state.json").read_text(
                encoding="utf-8"
            )
        )
        self.assertEqual(state["schema_version"], 1)
        self.assertEqual(len(state["runs"]), 2)
        self.assertEqual(len({run["run_id"] for run in state["runs"]}), 2)
        self.assertEqual(
            state["repositories"]["backend"]["last_confirmed_integration"][
                "upstream_sha"
            ],
            self.fixture.backend_upstream_1,
        )

    def test_record_integration_requires_reachable_exact_merge_parent(self) -> None:
        first = self.run_cli(
            "assess",
            "--root",
            str(self.root),
            "--topic",
            "record",
            "--date",
            "2026-08-24",
        )
        self.assertEqual(first.returncode, 0, first.stderr)
        command(
            self.fixture.backend,
            "git",
            "merge",
            "--no-ff",
            self.fixture.backend_upstream_2,
            "-m",
            "merge upstream two",
        )
        merge_sha = command(self.fixture.backend, "git", "rev-parse", "HEAD")
        result = self.run_cli(
            "record-integration",
            "--root",
            str(self.root),
            "--repository",
            "backend",
            "--merge-commit",
            merge_sha,
            "--upstream-sha",
            self.fixture.backend_upstream_2,
            "--verification",
            "tests: exit 0",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        state = json.loads(
            (self.root / "docs/upstream/upstream-sync-state.json").read_text(
                encoding="utf-8"
            )
        )
        integration = state["repositories"]["backend"]["last_confirmed_integration"]
        self.assertEqual(integration["source"], "recorded_merge")
        self.assertEqual(integration["upstream_sha"], self.fixture.backend_upstream_2)
        self.assertEqual(len(state["integration_events"]), 1)

    def test_merge_tree_reports_content_conflict(self) -> None:
        repo = Path(self.temporary.name) / "conflict"
        init_repo(repo)
        base = commit_file(repo, "shared.txt", "base\n", "base")
        command(repo, "git", "branch", "upstream", base)
        commit_file(repo, "shared.txt", "product\n", "product")
        product_sha = command(repo, "git", "rev-parse", "HEAD")
        command(repo, "git", "switch", "upstream")
        upstream_sha = commit_file(repo, "shared.txt", "upstream\n", "upstream")
        result = SYNC.merge_tree(repo, product_sha, upstream_sha)
        self.assertEqual(result["status"], "conflicted")
        self.assertEqual(result["exit_code"], 1)
        self.assertEqual(result["conflict_paths"], ["shared.txt"])

    def test_mirror_advances_only_by_fast_forward(self) -> None:
        command(
            self.fixture.backend,
            "git",
            "branch",
            "-f",
            "6.X",
            self.fixture.backend_upstream_1,
        )
        results = SYNC.advance_requested_refs(self.root, mirrors=True, products=False)
        self.assertEqual(
            command(self.fixture.backend, "git", "rev-parse", "refs/heads/6.X"),
            self.fixture.backend_upstream_2,
        )
        self.assertEqual(
            next(item for item in results if item["label"] == "backend mirror")[
                "status"
            ],
            "advanced",
        )

    def test_product_advance_refuses_dirty_checked_out_branch(self) -> None:
        backend = self.fixture.backend
        product_sha = command(backend, "git", "rev-parse", "refs/heads/main")
        tree_sha = command(backend, "git", "rev-parse", f"{product_sha}^{{tree}}")
        origin_sha = command(
            backend,
            "git",
            "commit-tree",
            tree_sha,
            "-p",
            product_sha,
            "-m",
            "origin ahead",
        )
        command(backend, "git", "update-ref", "refs/remotes/origin/main", origin_sha)
        (backend / "dirty.txt").write_text("dirty\n", encoding="utf-8")
        with self.assertRaises(SYNC.SyncError):
            SYNC.advance_requested_refs(self.root, mirrors=False, products=True)
        self.assertEqual(
            command(backend, "git", "rev-parse", "refs/heads/main"), product_sha
        )

    def test_diverged_mirror_stops_before_ref_updates(self) -> None:
        backend = self.fixture.backend
        base = command(backend, "git", "rev-parse", "namewta-base-upstream-6x")
        tree_sha = command(backend, "git", "rev-parse", f"{base}^{{tree}}")
        divergent_sha = command(
            backend,
            "git",
            "commit-tree",
            tree_sha,
            "-p",
            base,
            "-m",
            "diverged mirror",
        )
        command(backend, "git", "update-ref", "refs/heads/6.X", divergent_sha)
        with self.assertRaises(SYNC.SyncError):
            SYNC.advance_requested_refs(self.root, mirrors=True, products=False)
        self.assertEqual(
            command(backend, "git", "rev-parse", "refs/heads/6.X"), divergent_sha
        )

    def test_state_path_cannot_escape_repository(self) -> None:
        with self.assertRaises(SYNC.SyncError):
            SYNC.state_path(self.root, "../outside.json")


if __name__ == "__main__":
    unittest.main(verbosity=2)
