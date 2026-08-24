# State Schema

The durable state is `docs/upstream/upstream-sync-state.json`, schema version 1. It is an audit index, not a replacement for Git history.

## Top-level fields

```json
{
  "schema_version": 1,
  "updated_at": "RFC-3339 timestamp",
  "repositories": {
    "backend": {},
    "frontend": {}
  },
  "runs": [],
  "integration_events": []
}
```

Each repository contains immutable ref configuration plus:

- `last_confirmed_integration.upstream_sha`: upstream parent proven to be in product history.
- `last_confirmed_integration.product_merge_commit_sha`: merge commit or `null` for a bootstrapped merge-base.
- `last_confirmed_integration.source`: `graph_merge`, `derived_merge_base`, or `recorded_merge`.
- `last_observation`: the most recent frozen product, origin, mirror, upstream and merge-base SHAs.

Each run stores the report directory, freshness, dirty state, ahead/behind counts, upstream commits/files, overlap categories, conflict paths, and the exact baseline/target SHAs. Runs are append-only.

## Update rules

- `assess` may create an initial graph-derived checkpoint and update observations/runs.
- Fetching, advancing mirrors, generating reports, or observing a new upstream target must not change an existing `last_confirmed_integration`.
- `record-integration` requires a merge commit reachable from `refs/heads/main`, an exact non-first parent equal to `--upstream-sha`, and at least one verification evidence string.
- Reject unknown schema versions, malformed state, missing Git objects, rewritten upstream ancestry, or checkpoints no longer reachable from product `main`.
- Write both reports first, then replace the JSON atomically. A failed run must not append a success record.
