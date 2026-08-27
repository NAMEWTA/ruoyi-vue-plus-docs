import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const validatorPath = join(toolDirectory, "validate-specdev.mjs");

function createSpecOnlyChange() {
  const root = mkdtempSync(join(tmpdir(), "speculo-spec-stage-"));
  const changeName = "2026-08-25-validator-stage";
  const change = join(root, changeName);
  mkdirSync(change);

  writeFileSync(
    join(change, ".status.json"),
    `${JSON.stringify({
      schema_version: 6,
      artifact: "change-status",
      change: changeName,
      change_status: "active",
      current_work: "specdev/spec",
      works_run: [],
      claimed_investigations: [],
      execution_authorization: {
        implementation_commit: {
          status: "not-authorized",
          source: null,
          granted_at: null,
          scope: "Ticket implementation commits",
        },
        local_candidate_integration: {
          status: "not-authorized",
          source: null,
          granted_at: null,
          scope: "Lead-owned local integration",
        },
        source_cleanup: {
          status: "not-authorized",
          source: null,
          granted_at: null,
          scope: "Source cleanup",
        },
      },
      leadership: {
        current: "validator-test",
        epoch: 1,
        assigned_at: "2026-08-25T00:00:00+0800",
        history: [],
      },
      created_at: "2026-08-25T00:00:00+0800",
      updated_at: "2026-08-25T00:00:00+0800",
      completed_at: null,
      archived: false,
      archive_path: null,
      blockers: [],
      deviations: [],
      worktrees: [],
    }, null, 2)}\n`,
  );

  writeFileSync(
    join(change, "spec.md"),
    `---
schema_version: 3
artifact: spec
change: ${changeName}
status: ready
ready_for_tickets: true
sources:
  - USER-DECISION:validator-stage-regression
---

# Spec: Validator stage regression

## 1. 问题与目标

Spec must validate before downstream Tickets exist.

## 2. 解决方案与外部行为

Keep Spec validation independent from Ticket coverage validation.

## 4. 验收合同

| ID | Result |
|---|---|
| AC-001 | Spec stage succeeds without Tickets. |

## 5. 范围

Only stage-sensitive validation.

## 9. 验证策略

Run the validator at the requested stage.

### 未决问题

无。
`,
  );

  return { root, change };
}

function runValidator(stage, change) {
  return spawnSync(process.execPath, [validatorPath, "--stage", stage, change], {
    encoding: "utf8",
  });
}

test("spec stage does not require downstream Ticket coverage", () => {
  const fixture = createSpecOnlyChange();
  try {
    const result = runValidator("spec", fixture.change);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.doesNotMatch(
      `${result.stdout}\n${result.stderr}`,
      /acceptance contracts are not covered by Tickets/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("tickets stage still requires Ticket coverage", () => {
  const fixture = createSpecOnlyChange();
  try {
    const result = runValidator("tickets", fixture.change);
    assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /Spec acceptance contracts are not covered by Tickets: \["AC-001"\]/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
