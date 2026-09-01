#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson, requireArg } from './lib.mjs';

export function verifyState(state) {
  const errors = [];
  const requiredServices = state.requiredServices ?? ['mysql', 'redis', 'minio', 'backend1', 'backend2', 'frontend', 'ingress'];
  for (const name of requiredServices) {
    const service = state.services?.[name];
    if (!service) errors.push(`缺少服务状态：${name}`);
    else if (!['healthy', 'running'].includes(service.status)) errors.push(`服务 ${name} 状态异常：${service.status}`);
  }

  const publishedPorts = state.publishedPorts ?? [];
  const owners = new Map();
  for (const item of publishedPorts) {
    if (owners.has(item.port)) errors.push(`端口 ${item.port} 同时属于 ${owners.get(item.port)} 与 ${item.owner}`);
    owners.set(item.port, item.owner);
  }

  if (state.oss?.enabledDefaultCount !== 1) errors.push('启用的默认 OSS 配置必须恰好一个');
  if (state.oss?.privateDefaultCount !== 1) errors.push('默认 OSS 配置必须为 PRIVATE（access_policy=0）');
  if (state.oss?.anonymousDenied !== true) errors.push('MinIO 私有探针必须拒绝匿名访问');
  if (state.oss?.signedUrlWorks !== true) errors.push('MinIO 短时签名链接验证未通过');
  if (state.oss?.signedUrlExpired !== true) errors.push('MinIO 签名链接过期验证未通过');

  if (state.nacos?.enabled) {
    const digests = state.nacos.backendDigests ?? [];
    if (digests.length < 2 || new Set(digests).size !== 1) errors.push('两套后端实例的 Nacos 配置摘要未收敛');
    if ((state.nacos.adminUserCount ?? 0) < 1) errors.push('Nacos 缺少启用的管理员账号');
    if ((state.nacos.configReaderUserCount ?? 0) < 1) errors.push('Nacos 缺少独立的应用只读配置账号');
  }

  for (const [name, endpoint] of Object.entries(state.endpoints ?? {})) {
    if (endpoint.required !== false && !endpoint.ok) errors.push(`入口 ${name} 验证失败：${endpoint.status ?? '无状态'}`);
  }
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const stateFile = requireArg(args, 'state');
    const errors = verifyState(readJson(stateFile));
    if (errors.length) {
      for (const error of errors) console.error(`[失败] ${error}`);
      process.exitCode = 1;
    } else {
      console.log(`[通过] 部署状态满足全部门禁：${stateFile}`);
    }
  } catch (error) {
    console.error(`[错误] ${error.message}`);
    process.exitCode = 1;
  }
}
