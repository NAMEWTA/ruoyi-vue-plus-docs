#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const excludedNames = new Set([
  '.DS_Store',
  '.cache',
  '.flattened-pom.xml',
  '.git',
  '.gitmodules',
  '.idea',
  '.pnpm-store',
  '.turbo',
  '.vite',
  'coverage',
  'dist',
  'logs',
  'node_modules',
  'playwright-report',
  'specdev-worktree',
  'target',
  'test-results',
]);

function usage() {
  console.log(`用法：
  node stage-project-copy.mjs --source <source-root> --staging <new-staging-path>

复制当前项目工作树，但不复制 Git 元数据、依赖、构建产物、日志、缓存或
一次性工作树。暂存路径必须尚不存在。`);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      usage();
      process.exit(0);
    }
    if (argument !== '--source' && argument !== '--staging') {
      throw new Error(`未知参数：${argument}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`参数缺少值：${argument}`);
    }
    result[argument.slice(2)] = value;
    index += 1;
  }
  return result;
}

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function shouldCopy(sourceRoot, sourcePath) {
  const relative = path.relative(sourceRoot, sourcePath);
  if (relative === '') {
    return true;
  }

  const basename = path.basename(sourcePath);
  if (excludedNames.has(basename) || basename.endsWith('.log')) {
    return false;
  }

  const normalized = relative.split(path.sep).join('/');
  return normalized !== '.codex/config.toml'
    && normalized !== 'speculo/.speculo/back'
    && !normalized.startsWith('speculo/.speculo/back/');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source || !args.staging) {
    usage();
    throw new Error('必须同时提供 --source 和 --staging。');
  }

  const source = fs.realpathSync(args.source);
  const requestedStaging = path.resolve(args.staging);
  const requestedParent = path.dirname(requestedStaging);

  if (!fs.statSync(source).isDirectory()) {
    throw new Error(`源路径不是目录：${source}`);
  }
  if (!fs.existsSync(requestedParent) || !fs.statSync(requestedParent).isDirectory()) {
    throw new Error(`暂存目录的父目录不存在：${requestedParent}`);
  }

  const stagingParent = fs.realpathSync(requestedParent);
  const staging = path.join(stagingParent, path.basename(requestedStaging));
  if (fs.existsSync(staging)) {
    throw new Error(`暂存路径已存在：${staging}`);
  }
  if (isWithin(source, staging)) {
    throw new Error(`暂存目录不得位于源目录内部：${staging}`);
  }

  console.log(`复制源目录：  ${source}`);
  console.log(`创建暂存目录：${staging}`);
  fs.cpSync(source, staging, {
    recursive: true,
    force: false,
    errorOnExist: true,
    preserveTimestamps: true,
    dereference: false,
    filter: (sourcePath) => shouldCopy(source, sourcePath),
  });
  console.log('暂存副本创建完成，未包含 Git 元数据或生成产物。');
}

try {
  main();
} catch (error) {
  console.error(`stage-project-copy: ${error.message}`);
  process.exitCode = 1;
}
