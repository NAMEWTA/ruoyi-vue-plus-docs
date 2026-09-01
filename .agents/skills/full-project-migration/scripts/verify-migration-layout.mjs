#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const forbiddenGeneratedNames = new Set([
  '.flattened-pom.xml',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'specdev-worktree',
  'target',
  'test-results',
]);

function usage() {
  console.log(`用法：
  node verify-migration-layout.mjs --root <target-root> \\
    --frontend <frontend-directory> --backend <backend-directory> \\
    [--forbid-name <old-path-token>]...

检查迁移后的结构不变量。本工具不判断剩余文本引用属于项目自有内容、
第三方依赖还是上游归属。`);
}

function parseArgs(argv) {
  const result = { forbiddenNames: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      usage();
      process.exit(0);
    }
    if (!['--root', '--frontend', '--backend', '--forbid-name'].includes(argument)) {
      throw new Error(`未知参数：${argument}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`参数缺少值：${argument}`);
    }
    if (argument === '--forbid-name') {
      result.forbiddenNames.push(value.toLowerCase());
    } else {
      result[argument.slice(2)] = value;
    }
    index += 1;
  }
  return result;
}

function assertRequiredFile(root, relativePath, failures) {
  const candidate = path.join(root, relativePath);
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    failures.push(`缺少必需文件：${relativePath}`);
  }
}

function walk(root, current, forbiddenNames, failures, counters) {
  const entries = fs.readdirSync(current, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    const lowerRelative = relative.toLowerCase();
    counters.entries += 1;

    if (entry.name === '.git' || entry.name === '.gitmodules') {
      failures.push(`禁止包含 Git 元数据：${relative}`);
      continue;
    }
    if (forbiddenGeneratedNames.has(entry.name)) {
      failures.push(`禁止包含生成或一次性路径：${relative}`);
      continue;
    }
    for (const forbiddenName of forbiddenNames) {
      if (lowerRelative.split('/').some((segment) => segment.includes(forbiddenName))) {
        failures.push(`仍存在旧路径标识 "${forbiddenName}"：${relative}`);
        break;
      }
    }

    if (entry.isSymbolicLink()) {
      const target = fs.readlinkSync(absolute);
      const resolved = path.resolve(path.dirname(absolute), target);
      const rootRelative = path.relative(root, resolved);
      if (path.isAbsolute(target) || rootRelative === '..' || rootRelative.startsWith(`..${path.sep}`)) {
        failures.push(`符号链接指向迁移仓库外部：${relative} -> ${target}`);
      }
      continue;
    }
    if (entry.isDirectory()) {
      walk(root, absolute, forbiddenNames, failures, counters);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.root || !args.frontend || !args.backend) {
    usage();
    throw new Error('必须同时提供 --root、--frontend 和 --backend。');
  }

  const root = fs.realpathSync(args.root);
  const failures = [];
  const counters = { entries: 0 };

  assertRequiredFile(root, '.gitignore', failures);
  assertRequiredFile(root, path.join(args.frontend, 'package.json'), failures);
  assertRequiredFile(root, path.join(args.frontend, 'pnpm-lock.yaml'), failures);
  assertRequiredFile(root, path.join(args.backend, 'pom.xml'), failures);
  assertRequiredFile(root, path.join(args.backend, 'mvnw'), failures);
  walk(root, root, args.forbiddenNames, failures, counters);

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    throw new Error(`迁移布局验证失败，共发现 ${failures.length} 个问题。`);
  }

  console.log(`迁移布局验证通过：共检查 ${counters.entries} 个条目，未发现 Git 元数据或生成产物。`);
}

try {
  main();
} catch (error) {
  console.error(`verify-migration-layout: ${error.message}`);
  process.exitCode = 1;
}
