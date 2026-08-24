# Report Contract

## Output location

Each assessment creates:

```text
docs/upstream/YYYY-MM-DD_<ascii-kebab-topic>/
|-- state.json
|-- diff_report.md
`-- conflict_report.md
```

If the directory already exists, append `-02`, `-03`, and so on. `state.json` holds only creation time, frozen upstream targets, and resulting product merge SHAs. Reports are in Chinese and identify all refs with full SHAs.

All dynamic inventories belong in this directory. Do not persist dirty paths, changed files, conflicts, fetch details, or run history in `upstream-sync-state.json`; do not write them into `customization-map.md`.

## Diff report

For backend and frontend, include:

- checkpoint source, integrated upstream SHA, observed upstream SHA, product SHA, merge base and freshness;
- ordered upstream-only commits in `integrated_upstream_sha..observed_upstream_sha`;
- complete name-status and numstat file inventory;
- upstream paths also modified by the product since the checkpoint;
- paths matching authentication, authorization, Client, menu, SQL, OSS, notification, workflow, dependency, or build hotspots;
- reproducible Git commands using the frozen SHAs.
- a `现状 Merge 清单` summarizing commit/file counts, Git conflicts, customization-risk paths, and current disposition for each repository.

The script creates the objective checklist baseline. The agent then maps affected paths back to the stable `customization-map.md` invariants and adds only path-diff-supported semantic conclusions. The report does not embed an unbounded full patch.

## Conflict report

Use `git merge-tree --write-tree --messages <product-sha> <upstream-sha>` so assessment does not modify the index or worktree. The command may write unreachable tree objects to the Git object database; it does not create a product merge or move refs.

Keep these categories separate:

1. `Git confirmed conflicts`: unmerged paths/stages returned by merge-tree.
2. `Automatically mergeable overlaps`: both product and new upstream changed the path, but merge-tree did not report a tree/text conflict.
3. `Customization contract risks`: high-risk upstream paths requiring semantic review even without overlap.
4. `Dirty worktree overlaps`: uncommitted paths intersecting the upstream delta; excluded from the commit-based simulation.

Always create the conflict report. Zero textual conflicts must be stated as zero, not omitted or described as a safe merge. Note that merge-tree cannot detect compilation, runtime, API, SQL migration, authorization, or behavioral regressions.
