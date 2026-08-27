# State Schema

State schema version 2 separates the compact current pointer from each assessment's evidence. Git history remains the authority for ancestry.

## Top-level fields

```json
{
  "schema_version": 2,
  "updated_at": "RFC-3339 timestamp",
  "current_change": "current",
  "repositories": {
    "backend": {
      "integrated_upstream_sha": "full SHA",
      "main_merge_sha": "full SHA or null",
      "observed_upstream_sha": "full SHA"
    },
    "frontend": {}
  }
}
```

The global file is only the current synchronization index:

- `integrated_upstream_sha`: upstream point already proven in product `main`.
- `main_merge_sha`: product merge commit that integrated that point, or `null` for a graph-derived merge-base.
- `observed_upstream_sha`: frozen upstream target of the current assessment.
- `current_change`: directory owning the detailed state and reports.

It must not contain run history, ref configuration, dirty paths, file inventories, conflict data, verification logs, or integration events.

## Per-change state

`docs/upstream/current/state.json` contains only:

```json
{
  "created_at": "RFC-3339 timestamp",
  "repositories": {
    "backend": {
      "upstream_sha": "full SHA selected for this merge",
      "main_merge_sha": "full SHA or null"
    }
  }
}
```

Only repositories with an upstream delta are listed. `main_merge_sha` stays `null` until the exact upstream target has been merged into product `main` and recorded. Detailed facts remain in the two Markdown reports.

## Update rules

- `assess` may create an initial graph-derived checkpoint, replace the current report directory, and replace the global current index.
- Fetching, advancing mirrors, generating reports, or observing a new upstream target must not change `integrated_upstream_sha`.
- `record-integration` requires a merge commit reachable from `refs/heads/main`, an exact non-first parent equal to `--upstream-sha`, and at least one verification evidence string.
- It must also match the frozen `upstream_sha` in the selected change state before filling `main_merge_sha` and advancing the global checkpoint.
- Schema v1 is accepted only for in-memory migration to the compact v2 structure; unknown versions and malformed state are rejected.
- Schema v2 rejects extra top-level or repository fields so detailed run evidence cannot leak back into the global index.
- Write both reports and per-change state before replacing the global JSON. A failed run must not advance the global pointer.
