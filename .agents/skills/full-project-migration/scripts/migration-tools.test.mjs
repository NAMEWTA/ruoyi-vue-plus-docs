import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const stageScript = path.join(scriptRoot, 'stage-project-copy.mjs');
const verifyScript = path.join(scriptRoot, 'verify-migration-layout.mjs');

function write(root, relativePath, value = '') {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}

function createSource(root) {
  write(root, '.git/config', 'ignored');
  write(root, '.gitmodules', 'ignored');
  write(root, '.gitignore', 'node_modules/\n');
  write(root, 'frontend/package.json', '{"name":"@new/app"}\n');
  write(root, 'frontend/pnpm-lock.yaml', 'lockfileVersion: 9\n');
  write(root, 'frontend/src/untracked.ts', 'export const copied = true;\n');
  write(root, 'frontend/node_modules/example/index.js', 'ignored');
  write(root, 'backend/pom.xml', '<project/>\n');
  write(root, 'backend/mvnw', '#!/bin/sh\n');
  write(root, 'backend/target/output.jar', 'ignored');
  write(root, 'backend/nested/.git', 'gitdir: elsewhere\n');
  write(root, 'speculo/.speculo/back/snapshot.json', 'ignored');
  write(root, 'specdev-worktree/task/source.txt', 'ignored');
}

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
}

test('暂存复制保留项目文件，并排除仓库元数据和生成产物', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'full-project-migration-'));
  try {
    const source = path.join(temporaryRoot, 'source');
    const staging = path.join(temporaryRoot, 'staging');
    fs.mkdirSync(source);
    createSource(source);

    const copy = run(stageScript, ['--source', source, '--staging', staging]);
    assert.equal(copy.status, 0, copy.stderr);
    assert.ok(fs.existsSync(path.join(staging, 'frontend/src/untracked.ts')));
    assert.ok(!fs.existsSync(path.join(staging, '.git')));
    assert.ok(!fs.existsSync(path.join(staging, '.gitmodules')));
    assert.ok(!fs.existsSync(path.join(staging, 'frontend/node_modules')));
    assert.ok(!fs.existsSync(path.join(staging, 'backend/target')));
    assert.ok(!fs.existsSync(path.join(staging, 'backend/nested/.git')));
    assert.ok(!fs.existsSync(path.join(staging, 'speculo/.speculo/back')));
    assert.ok(!fs.existsSync(path.join(staging, 'specdev-worktree')));

    const verify = run(verifyScript, [
      '--root', staging,
      '--frontend', 'frontend',
      '--backend', 'backend',
      '--forbid-name', 'legacy-project',
    ]);
    assert.equal(verify.status, 0, verify.stderr);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test('暂存复制拒绝已存在或位于源目录内部的目标路径', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'full-project-migration-'));
  try {
    const source = path.join(temporaryRoot, 'source');
    const existing = path.join(temporaryRoot, 'existing');
    fs.mkdirSync(source);
    fs.mkdirSync(existing);

    const existingResult = run(stageScript, ['--source', source, '--staging', existing]);
    assert.notEqual(existingResult.status, 0);
    assert.match(existingResult.stderr, /已存在/);

    const nestedResult = run(stageScript, ['--source', source, '--staging', path.join(source, 'nested')]);
    assert.notEqual(nestedResult.status, 0);
    assert.match(nestedResult.stderr, /不得位于源目录内部/);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test('布局验证拒绝 Git 元数据、生成产物和旧路径标识', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'full-project-migration-'));
  try {
    createSource(temporaryRoot);
    const verify = run(verifyScript, [
      '--root', temporaryRoot,
      '--frontend', 'frontend',
      '--backend', 'backend',
      '--forbid-name', 'nested',
    ]);
    assert.notEqual(verify.status, 0);
    assert.match(verify.stderr, /禁止包含 Git 元数据/);
    assert.match(verify.stderr, /禁止包含生成或一次性路径/);
    assert.match(verify.stderr, /仍存在旧路径标识/);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
