#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  markdownCell, parseArgs, readEnv, readJson, renderTemplate, requireArg,
  secretsFromEnv, validateProfile, writePrivateFile
} from './lib.mjs';
import { verifyState } from './verify-deployment-state.mjs';

function credential(value, managedText = '由托管凭据工具保管，当前未读取') {
  return value || managedText;
}

function serviceRows(state) {
  const rows = Object.entries(state.services ?? {}).map(([name, item]) =>
    `| ${markdownCell(name)} | ${markdownCell(item.status)} | ${markdownCell(item.version ?? item.image ?? '未记录')} |`
  );
  return ['| 服务 | 状态 | 版本或镜像 |', '|---|---|---|', ...rows].join('\n');
}

try {
  const args = parseArgs(process.argv.slice(2));
  const profile = readJson(requireArg(args, 'profile'));
  const state = readJson(requireArg(args, 'state'));
  const output = requireArg(args, 'output');
  const profileErrors = validateProfile(profile);
  if (profileErrors.length) throw new Error(profileErrors.join('；'));

  let secrets = {};
  if (args.secrets) secrets = readJson(path.resolve(args.secrets));
  else if (args['env-file']) secrets = secretsFromEnv(readEnv(path.resolve(args['env-file'])));

  const verificationErrors = verifyState(state);
  const host = profile.server.host;
  const ports = profile.network.ports;
  const base = `${profile.network.tlsEnabled ? 'https' : 'http'}://${profile.network.serverName}:${profile.network.tlsEnabled ? ports.ingressHttps : ports.ingressHttp}`;
  const endpointRows = [
    ['统一入口', `${base}/${profile.routes.adminPrefix}/`, ports.ingressHttp],
    ['后端实例 1', `http://${host}:${ports.backend1}`, ports.backend1],
    ['后端实例 2', `http://${host}:${ports.backend2}`, ports.backend2],
    ['MySQL', `${host}:${ports.mysql}`, ports.mysql],
    ['Redis', `${host}:${ports.redis}`, ports.redis],
    ['MinIO API', `${host}:${ports.minioApi}`, ports.minioApi],
    ['MinIO 控制台', `${host}:${ports.minioConsole}`, ports.minioConsole],
    ['监控', `${base}${profile.routes.monitor}`, ports.monitor],
    ['Grafana', `http://${host}:${ports.grafana}`, ports.grafana],
    ['Nacos', `${base}${profile.routes.nacos}`, '仅内部容器端口']
  ].map(([name, address, port]) => `| ${name} | ${address} | ${port} |`);

  const credentialRows = [
    ['SSH', profile.server.sshUser, credential(secrets.sshPassword, profile.server.credentialSource || '由托管凭据工具保管')],
    ['MySQL root', 'root', credential(secrets.mysqlRootPassword)],
    ['MySQL 应用', profile.services.mysqlUser, credential(secrets.mysqlAppPassword)],
    ['Redis', '无独立用户名', credential(secrets.redisPassword)],
    ['MinIO', secrets.minioRootUser ?? '未记录', credential(secrets.minioRootPassword)],
    ['Nacos 数据库', secrets.nacosDatabaseUser ?? '未记录', credential(secrets.nacosDatabasePassword)],
    ['Nacos', secrets.nacosUsername ?? '未记录', credential(secrets.nacosPassword)],
    ['Nacos 服务鉴权令牌', '不适用', credential(secrets.nacosAuthToken)],
    ['Nacos 服务身份', credential(secrets.nacosIdentityKey), credential(secrets.nacosIdentityValue)],
    ['Monitor', secrets.monitorUsername ?? '未记录', credential(secrets.monitorPassword)],
    ['Grafana', secrets.grafanaUsername ?? '未记录', credential(secrets.grafanaPassword)],
    ['业务管理端', '由 sys_user 管理', '密码为不可逆摘要，不在部署文件保存明文'],
    ['SnailJob / SnailAI', '由各服务运行配置管理', '当前发布 env 未提供独立控制台密码，生产交付前必须核对']
  ].map((row) => `| ${row.map(markdownCell).join(' | ')} |`);

  const values = {
    deploymentName: profile.deployment.name,
    generatedAt: new Date().toISOString(),
    mode: profile.deployment.mode,
    environment: profile.deployment.environment,
    releaseId: profile.deployment.releaseId,
    verificationStatus: verificationErrors.length ? '未通过' : (state.risks?.length ? '有条件通过（存在待复核项）' : '通过'),
    serverSection: [
      `- 服务器：\`${profile.server.sshUser}@${host}:${profile.server.sshPort}\``,
      `- 授权根目录：\`${profile.server.root}\``,
      `- Docker 网络：\`${profile.network.dockerNetwork}\``,
      `- 持久化目录：\`${profile.server.root}/{mysql,redis,minio,nacos,loki,grafana,prometheus}\``,
      '- 敏感配置权限：`0600`'
    ].join('\n'),
    endpointSection: ['| 用途 | 地址 | 端口 |', '|---|---|---|', ...endpointRows].join('\n'),
    credentialSection: ['> 本文件包含敏感信息，仅限本机保存，权限必须为 `0600`。', '', '| 系统 | 账号 | 密码或保管位置 |', '|---|---|---|', ...credentialRows].join('\n'),
    serviceSection: serviceRows(state),
    verificationSection: verificationErrors.length
      ? verificationErrors.map((item) => `- 未通过：${item}`).join('\n')
      : '- 全部自动化状态门禁通过。\n- 详细采集时间：`' + markdownCell(state.capturedAt ?? '未记录') + '`',
    upgradeSection: [
      '1. 记录当前清单、Schema、配置摘要与活动指针。',
      '2. 备份配置、数据库、对象存储元数据和当前发布，并验证备份。',
      '3. 构建前后端，生成清单与 SHA-256，传输到新暂存目录。',
      '4. 先执行兼容迁移，再逐个滚动后端，最后发布前端。',
      '5. 重跑登录、业务 API、OSS 签名、Nacos、入口和监控门禁。',
      '6. 提升活动指针并生成新的升级记录。'
    ].join('\n'),
    rollbackSection: [
      `- 上一发布：\`${markdownCell(state.rollback?.previousReleaseId ?? '未登记')}\``,
      `- 回滚命令：\`${markdownCell(state.rollback?.command ?? '未登记，发布前必须补齐')}\``,
      '- Schema 兼容时先回滚应用与配置；恢复数据必须单独授权。',
      '- 禁止执行 `docker compose down -v`。'
    ].join('\n'),
    riskSection: (state.risks?.length ? state.risks : ['当前无已登记风险']).map((item) => `- ${markdownCell(item)}`).join('\n')
  };

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const template = fs.readFileSync(path.resolve(scriptDir, '../assets/templates/deployment-report.md.template'), 'utf8');
  writePrivateFile(output, renderTemplate(template, values));
  console.log(`[生成] 私密部署交接文档：${output}（权限 0600，内容未回显）`);
  if (verificationErrors.length) process.exitCode = 2;
} catch (error) {
  console.error(`[错误] ${error.message}`);
  process.exitCode = 1;
}
