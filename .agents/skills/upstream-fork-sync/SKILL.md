---
name: upstream-fork-sync
description: Safely assess and synchronize the ruoyi-vue-plus-docs upstream forks, persist actual integration checkpoints, and generate upstream diff and merge-conflict reports. Use for upstream 6.X or 6.X-Vue refreshes and integrations, not ordinary feature-branch merges.
---

# Upstream Fork Sync

Keep three facts separate for each product repository: the latest fetched upstream tip, the local mirror tip, and the upstream commit actually integrated into product `main`. Fetching or fast-forwarding a mirror never advances the integrated checkpoint.

## Required context

1. Read the repository `AGENTS.md`, `.agents/skills/engineering-standards/SKILL.md`, and `docs/upstream/customization-map.md` before assessing or integrating.
2. Read [repository-contract.md](references/repository-contract.md) for repository/ref ownership and side-effect gates.
3. Read [state-schema.md](references/state-schema.md) before bootstrapping, repairing, or recording state.
4. Read [report-contract.md](references/report-contract.md) when generating or reviewing reports.

## Assess

Run from the parent repository root. Use an ASCII kebab-case topic.

```bash
node .agents/skills/upstream-fork-sync/scripts/upstream-sync.mjs assess \
  --root . \
  --topic <topic>
```

The default is offline: it uses existing refs, atomically replaces `state.json`, `diff_report.md`, and `conflict_report.md` under `docs/upstream/current/`, then atomically replaces the compact `docs/upstream/upstream-sync-state.json` current pointer. Git history owns previous assessments; the working tree keeps only the current report.

- Add `--fetch` when the user asked to refresh network refs. A failed upstream fetch produces `freshness: stale`; never describe cached refs as latest.
- Add `--advance-mirrors` only to fast-forward the local `6.X` and `6.X-Vue` mirror refs after fetch/preflight.
- Add `--advance-products` only when the user asked to synchronize local product branches with `origin/main`. It is fast-forward-only and refuses dirty checked-out worktrees.
- Use `--dry-run` to inspect the complete snapshot as JSON without writing reports or state.

After generation, inspect every reported conflict and high-risk overlap with exact `git diff <base>..<target> -- <path>` evidence. Use `customization-map.md` as the stable source checklist, then enrich the generated `现状 Merge 清单` only with conclusions supported by the frozen SHAs. Keep textual/tree conflicts, automatically merged overlaps, customization-contract risks, and dirty-worktree overlaps in separate categories. Never copy run-specific SHAs, dirty paths, conflict lists, or conclusions into `customization-map.md` or the global JSON.

## Integrate

Assessment does not authorize a product merge, commit, push, tag change, submodule pointer update, or cleanup. Obtain explicit authorization for the frozen product/upstream SHAs before those actions.

For an authorized integration:

1. Integrate backend and frontend independently in recoverable candidate branches/worktrees; preserve a `--no-ff` merge commit.
2. Resolve reported conflicts and recheck every affected invariant in `docs/upstream/customization-map.md`.
3. Run the applicable frontend/backend quality gates from the engineering standards. Do not treat skipped or unrun checks as passed.
4. Advance product `main` only after candidate verification and authorization. Update the parent submodule pointers last.
5. Record the new checkpoint only after the merge commit is reachable from product `main` and the supplied upstream SHA is one of its non-first parents:

```bash
node .agents/skills/upstream-fork-sync/scripts/upstream-sync.mjs record-integration \
  --root . \
  --change current \
  --repository <backend|frontend> \
  --merge-commit <full-sha> \
  --upstream-sha <full-sha> \
  --verification '<command>: exit 0'
```

`--change` defaults to the global `current_change`, which is `current` after assessment. Recording updates the current report's `main_merge_sha` and the compact global checkpoint; verification evidence remains command output or belongs in the current reports, not either JSON. Rerun `assess` only when a new upstream comparison is needed.

## Stop conditions

Stop without changing refs or state when the mirror is not an ancestor of the fetched upstream ref, the saved checkpoint is absent from product history, the saved upstream SHA is not an ancestor of the observed upstream tip, there are multiple merge bases, or any target ref is missing. Report the exact repository, refs, and SHAs that require manual reconciliation.
