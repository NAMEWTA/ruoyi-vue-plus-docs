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

function createGoalPlanLimitChange(configuredAttempts, planAttempts) {
  const root = mkdtempSync(join(tmpdir(), "speculo-goal-plan-limit-"));
  const changeName = "2026-08-31-validator-integration-limit";
  const stateRoot = join(root, ".speculo", "specdev");
  const change = join(stateRoot, "changes", changeName);
  mkdirSync(join(change, "ticket"), { recursive: true });

  writeFileSync(
    join(stateRoot, "config.json"),
    `${JSON.stringify({
      schema_version: 5,
      interaction_language: "zh-CN",
      artifact_language: "zh-CN",
      git: { default_branch: "main" },
      execution: {
        max_implementation_agents: 1,
        max_integration_attempts: configuredAttempts,
        deep_ticket_human_approval: true,
        shared_path_owner: "explicit",
      },
      verification: { test: null, typecheck: null, lint: null, build: null },
      planning: {
        default_depth: "standard",
        require_ready_gate: true,
        require_evidence: true,
        ui_prototype_default_variants: 1,
        ui_prototype_max_variants: 1,
      },
    }, null, 2)}\n`,
  );

  writeFileSync(
    join(change, ".status.json"),
    `${JSON.stringify({
      schema_version: 6,
      artifact: "change-status",
      change: changeName,
      change_status: "active",
      current_work: "specdev/goal-plan",
      works_run: ["specdev/spec", "specdev/tickets"],
      claimed_investigations: [],
      execution_authorization: {
        implementation_commit: {
          status: "authorized",
          source: "validator-test",
          granted_at: "2026-08-31T00:00:00+08:00",
          scope: "Ticket implementation commits",
        },
        local_candidate_integration: {
          status: "authorized",
          source: "validator-test",
          granted_at: "2026-08-31T00:00:00+08:00",
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
        current: "validator-test:/root",
        epoch: 1,
        assigned_at: "2026-08-31T00:00:00+08:00",
        history: [],
      },
      created_at: "2026-08-31T00:00:00+08:00",
      updated_at: "2026-08-31T00:00:00+08:00",
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
sources: [USER-DECISION:validator-integration-limit]
---

# Spec: Integration limit validation

## 1. 问题与目标

Validate integration attempt limits.

## 2. 解决方案与外部行为

Allow explicitly configured unlimited attempts.

## 4. 验收合同

| ID | Result |
|---|---|
| AC-001 | Attempt policy validates. |

## 5. 范围

Validator fixture only.

## 9. 验证策略

Run the Goal Plan validator.

### 未决问题

无。
`,
  );

  writeFileSync(
    join(change, "ticket", "01-integration-limit.md"),
    `---
schema_version: 3
artifact: ticket
change: ${changeName}
id: T-01
title: Validate integration limit
status: ready
planning_depth: deep
planning_depth_reason: Validator execution contract.
ready: true
risk: high
blocked_by: []
contract_ids: [AC-001]
owner: validator-test:/root
expected_changes: ["<Path>fixture/limit</Path>"]
writable_paths: ["<Path>fixture/limit</Path>"]
read_only_paths: []
shared_paths: []
shared_path_owners: []
---

# Ticket T-01

## 1. 战略与来源

Validate the Goal Plan limit contract.

## 2. 决策状态

Unlimited is represented by null.

## 3. 范围边界

Validator fixture only.

## 4. 要构建什么

A validation fixture.

## 5. 实现契约

The fixture owns only its declared path and validator behavior.

## 6. 执行路线

Create the fixture, run validation, and inspect the exit status.

## 7. 路径访问契约

Only the fixture path is writable.

## 8. 验证矩阵

| Behavior | Command | Expected |
|---|---|---|
| Integration attempt policy | Run validate-specdev at goal-plan stage | The configured policy is enforced. |

- **E2E disposition:** not-required; validator process coverage is sufficient.
- **Execution environment:** source-worktree test fixture.

## 9. 发布、迁移与恢复

No release or migration occurs; remove the temporary fixture after validation.

## 10. 验收标准

- [ ] AC-001 is validated.
`,
  );

  writeFileSync(
    join(change, "tickets-map.md"),
    `---
schema_version: 3
artifact: tickets-map
change: ${changeName}
status: ready
---

# Tickets Map

## 2. 执行清单

T-01 is ready.

## 3. 依赖 DAG

T-01.

## 4. 合同覆盖矩阵

AC-001 -> T-01.

## 5. 并行与路径所有权

T-01 owns the fixture path.
`,
  );

  const serializedPlanAttempts = planAttempts === null ? "null" : String(planAttempts);
  writeFileSync(
    join(change, "goal-plan.md"),
    `---
schema_version: 6
artifact: goal-plan
change: ${changeName}
status: ready
modes: [high-assurance]
orchestration: lead-directed
lead: validator-test:/root
implementation_agent_limit: 1
integration_attempt_limit: ${serializedPlanAttempts}
ticket_workspace_policy: required
integration_gate: candidate-merge
ready_for_execution: true
---

# Goal Plan

## 1. Outcome and Authority

Validate limit semantics.

## 2. Execution Graph

T-01 is the only Ticket.

## 3. Gates and Completion Evidence

Validation output closes the Gate.

## 4. Execution and Integration Protocol

### Lead Orchestration

Implementation subagents: one. Read-only agents remain read-only. Dispatch is execution-time dynamic.

### Ticket Workspace and Integration

The source worktree 不运行 E2E. Local candidate integration and parent update is Lead-owned.

### Authorization Matrix

Implementation commit is authorized.

## 5. Constraints, Risk and Recovery

Failures do not advance the parent.

## 6. Progress and Decisions

The Plan is Ready.

## Assumptions

None.
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

test("goal-plan accepts unlimited attempts when config is unlimited", () => {
  const fixture = createGoalPlanLimitChange(null, null);
  try {
    const result = runValidator("goal-plan", fixture.change);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("goal-plan rejects unlimited attempts when config has a finite maximum", () => {
  const fixture = createGoalPlanLimitChange(3, null);
  try {
    const result = runValidator("goal-plan", fixture.change);
    assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /unlimited integration attempts exceed configured max_integration_attempts 3/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
