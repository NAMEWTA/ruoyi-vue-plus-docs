# Repository Contract

## Repository map

| ID | Path | Product branch | Origin tracking ref | Upstream tracking ref | Local mirror | Immutable baseline tag |
|---|---|---|---|---|---|---|
| `backend` | `ruoyi-vue-plus-namewta` | `main` | `origin/main` | `upstream/6.X` | `6.X` | `namewta-base-upstream-6x` |
| `frontend` | `plus-ui-namewta` | `main` | `origin/main` | `upstream/6.X-Vue` | `6.X-Vue` | `namewta-base-upstream-6x-vue` |

The parent repository has only `origin/main`; it owns documentation and submodule gitlinks, not child source history.

## Ref invariants

- `main` contains product work. Never put product commits on a mirror.
- Mirrors advance only when their current tips are ancestors of the fetched upstream tips.
- Baseline tags never move.
- Do not push to `upstream`. Pushing a mirror or product ref to `origin` requires separate explicit authorization.
- Do not automatically stash, reset, clean, rebase, force-update, delete branches/worktrees, commit, merge, or update submodule pointers.
- A dirty worktree does not prevent commit-based assessment. It blocks advancing a checked-out product branch and must be represented separately in the conflict report.

## Refresh semantics

`--fetch` fetches parent `origin`, each child `origin`, and each child `upstream`. Upstream freshness is per repository:

- `fresh`: that repository's upstream fetch succeeded in this run.
- `cached`: no network refresh was requested.
- `stale`: refresh was requested but failed; the report uses the remaining local remote-tracking ref.

`--advance-mirrors` and `--advance-products` run a complete preflight before updating any requested local ref. Checked-out branches use `git merge --ff-only`; non-checked-out branches use a compare-and-swap `git update-ref`. Divergence stops the whole advance phase.

## Integration checkpoint discovery

When no valid saved checkpoint exists:

1. Inspect first-parent product merge commits after the immutable baseline tag.
2. Select the newest merge whose non-first parent is an ancestor of the observed upstream tip.
3. Record that merge's upstream parent as `integrated_upstream_sha` and the merge itself as `integration_commit_sha`.
4. If there is no qualifying product merge, use the unique `merge-base(product, upstream)` and mark the source `derived_merge_base`.

Never infer an integrated checkpoint from the mirror tip alone. Cherry-picked patches may be reported separately, but do not advance the graph checkpoint because patch equivalence is not ancestry.
