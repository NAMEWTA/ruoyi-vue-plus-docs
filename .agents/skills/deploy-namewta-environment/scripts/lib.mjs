import fs from 'node:fs';
import path from 'node:path';

export const MODES = new Set(['audit', 'takeover', 'fresh-dev', 'release-prod', 'upgrade', 'rollback']);
export const ENVIRONMENTS = new Set(['dev', 'prod']);

export function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`无法识别的参数：${token}`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`参数 --${key} 缺少值`);
    result[key] = value;
    index += 1;
  }
  return result;
}

export function requireArg(args, key) {
  if (!args[key]) throw new Error(`缺少必需参数 --${key}`);
  return path.resolve(args[key]);
}

export function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`无法读取 JSON 文件 ${file}：${error.message}`);
  }
}

export function readEnv(file) {
  const result = {};
  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split(/\r?\n/u)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

export function get(object, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current?.[key], object);
}

export function isPlaceholder(value) {
  if (typeof value !== 'string') return false;
  return /请替换|请仅在本地替换|replace-|managed-by|由 Fileterm 托管或/u.test(value);
}

export function validateProfile(profile) {
  const errors = [];
  const required = [
    'deployment.name', 'deployment.mode', 'deployment.environment', 'deployment.releaseId',
    'server.host', 'server.sshPort', 'server.sshUser', 'server.root',
    'network.dockerNetwork', 'network.serverName', 'network.ports',
    'routes.adminPrefix', 'services.mysqlDatabase', 'services.mysqlUser',
    'services.minioBucket', 'services.minioEndpoint', 'services.minioDiagnosticObject'
  ];
  for (const key of required) {
    const value = get(profile, key);
    if (value === undefined || value === null || value === '') errors.push(`缺少字段 ${key}`);
  }

  if (profile.schemaVersion !== 1) errors.push('schemaVersion 必须为 1');
  if (!MODES.has(profile.deployment?.mode)) errors.push(`不支持的部署模式：${profile.deployment?.mode}`);
  if (!ENVIRONMENTS.has(profile.deployment?.environment)) errors.push(`不支持的环境：${profile.deployment?.environment}`);
  if (isPlaceholder(profile.deployment?.releaseId)) errors.push('deployment.releaseId 仍是占位值');

  const root = profile.server?.root;
  if (typeof root === 'string') {
    if (!path.posix.isAbsolute(root)) errors.push('server.root 必须是绝对路径');
    if (['/', '/root', '/home', '/Users'].includes(root) || root.includes('$') || root.includes('..')) {
      errors.push(`server.root 不安全：${root}`);
    }
  }

  const sshPort = profile.server?.sshPort;
  if (!Number.isInteger(sshPort) || sshPort < 1 || sshPort > 65535) errors.push('server.sshPort 必须是 1-65535 的整数');

  const ports = profile.network?.ports ?? {};
  const used = new Map();
  for (const [name, port] of Object.entries(ports)) {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push(`端口 ${name} 必须是 1-65535 的整数`);
      continue;
    }
    if (used.has(port)) errors.push(`端口 ${port} 被 ${used.get(port)} 和 ${name} 重复使用`);
    used.set(port, name);
  }

  if (profile.services?.nacosInternalOnly && (Object.values(ports).includes(8848) || Object.values(ports).includes(9848))) {
    errors.push('nacosInternalOnly=true 时不得发布宿主机 8848/9848');
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/u.test(profile.routes?.adminPrefix ?? '')) {
    errors.push('routes.adminPrefix 只能包含字母、数字和连字符，且不含首尾斜杠');
  }
  return errors;
}

export function validateSecrets(secrets, { allowManagedSsh = true } = {}) {
  const required = [
    'mysqlRootPassword', 'mysqlAppPassword', 'redisPassword', 'minioRootUser',
    'minioRootPassword', 'monitorUsername', 'monitorPassword', 'grafanaUsername', 'grafanaPassword'
  ];
  const errors = [];
  for (const key of required) {
    if (!secrets[key] || isPlaceholder(secrets[key])) errors.push(`敏感字段 ${key} 缺失或仍是占位值`);
  }
  if (!allowManagedSsh && (!secrets.sshPassword || isPlaceholder(secrets.sshPassword))) {
    errors.push('敏感字段 sshPassword 缺失或仍是占位值');
  }
  return errors;
}

export function secretsFromEnv(env) {
  return {
    sshPassword: env.SSH_PASSWORD,
    mysqlRootPassword: env.MYSQL_ROOT_PASSWORD,
    mysqlAppPassword: env.MYSQL_APP_PASSWORD,
    redisPassword: env.REDIS_PASSWORD,
    minioRootUser: env.MINIO_ROOT_USER,
    minioRootPassword: env.MINIO_ROOT_PASSWORD,
    nacosDatabaseUser: env.NACOS_DB_USER,
    nacosDatabasePassword: env.NACOS_DB_PASSWORD,
    nacosUsername: env.NACOS_CONFIG_USERNAME,
    nacosPassword: env.NACOS_CONFIG_PASSWORD,
    nacosAuthToken: env.NACOS_AUTH_TOKEN,
    nacosIdentityKey: env.NACOS_AUTH_IDENTITY_KEY,
    nacosIdentityValue: env.NACOS_AUTH_IDENTITY_VALUE,
    monitorUsername: env.MONITOR_USERNAME,
    monitorPassword: env.MONITOR_PASSWORD,
    grafanaUsername: env.GRAFANA_ADMIN_USER,
    grafanaPassword: env.GRAFANA_ADMIN_PASSWORD
  };
}

export function renderTemplate(template, values) {
  const missing = new Set();
  const rendered = template.replace(/\{\{([A-Za-z0-9]+)\}\}/gu, (_, key) => {
    if (values[key] === undefined || values[key] === null) {
      missing.add(key);
      return `{{${key}}}`;
    }
    return String(values[key]);
  });
  if (missing.size) throw new Error(`模板缺少变量：${[...missing].join(', ')}`);
  return rendered;
}

export function writePrivateFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, content, { encoding: 'utf8', mode: 0o600 });
  fs.chmodSync(file, 0o600);
}

export function yamlSingleQuote(value) {
  return String(value).replaceAll("'", "''");
}

export function markdownCell(value) {
  return String(value ?? '未提供').replaceAll('|', '\\|').replaceAll('\n', '<br>');
}
