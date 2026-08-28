import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const releaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dockerRoot = path.join(releaseRoot, 'docker');

function read(relativePath, root = releaseRoot) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('deployment is split into exactly four compose categories', () => {
  const expected = [
    'docker-compose-backend.yml',
    'docker-compose-frontend.yml',
    'docker-compose-infrastructure.yml',
    'docker-compose-observability.yml',
  ];
  const actual = fs.readdirSync(dockerRoot)
    .filter((name) => name.startsWith('docker-compose-') && name.endsWith('.yml'))
    .sort();

  assert.deepEqual(actual, expected);
  for (const filename of actual) {
    const compose = read(`docker/${filename}`);
    assert.match(compose, /external: true/);
    assert.match(compose, /NAMEWTA_NETWORK/);
  }
});

test('frontend compose provides LB, TLS profile, and independent app nginx', () => {
  const compose = read('docker/docker-compose-frontend.yml');
  assert.match(compose, /^  nginx-lb:$/m);
  assert.match(compose, /^  nginx-lb-tls:$/m);
  assert.match(compose, /profiles: \[tls\]/);
  assert.match(compose, /^  nginx-admin-web:$/m);
  assert.match(compose, /ADMIN_WEB_PREFIX:\?ADMIN_WEB_PREFIX is required/);
  assert.match(compose, /NGINX_ENVSUBST_FILTER: "\^\(APP_\|BACKEND_\|LB_\)"/);
});

test('nginx templates preserve prefix stripping and protect actuator', () => {
  for (const filename of ['nginx-lb-http.conf.template', 'nginx-lb-tls.conf.template']) {
    const config = read(`docker/frontend/nginx/lb/${filename}`);
    assert.match(config, /proxy_pass http:\/\/app_admin_web\/;/);
    assert.match(config, /APP_UPSTREAMS:/);
    assert.match(config, /APP_ROUTES:/);
    assert.match(config, /actuator/);
    assert.match(config, /return 403;/);
  }

  const app = read('docker/frontend/nginx/apps/nginx-admin-web.conf.template');
  assert.match(app, /location ~ \^\/(?:\\\$\{APP_PREFIX\}\/)?/);
  assert.match(app, /proxy_pass http:\/\/backend_server;/);
  assert.match(app, /try_files \$uri \$uri\/ \/index\.html;/);
});

test('both load balancers serve the internal no-cache maintenance page for upstream errors', () => {
  const compose = read('docker/docker-compose-frontend.yml');
  const maintenanceMount = /\.\/frontend\/nginx\/html\/nginx-lb:\/usr\/share\/nginx\/html\/nginx-lb:ro/g;
  assert.equal(compose.match(maintenanceMount)?.length, 2);

  const maintenancePage = read('docker/frontend/nginx/html/nginx-lb/system-updating.html');
  assert.match(maintenancePage, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(maintenancePage, /系统正在更新中/);
  assert.doesNotMatch(maintenancePage, /<(?:script|img)\b|https?:\/\//i);
  assert.match(read('.gitignore'), /!docker\/frontend\/nginx\/html\/nginx-lb\/system-updating\.html/);

  for (const filename of ['nginx-lb-http.conf.template', 'nginx-lb-tls.conf.template']) {
    const config = read(`docker/frontend/nginx/lb/${filename}`);
    assert.match(config, /proxy_intercept_errors on;/);
    assert.match(config, /error_page 404 500 502 503 504 \/nginx-lb\/system-updating\.html;/);
    assert.match(
      config,
      /location = \/nginx-lb\/system-updating\.html \{\s+internal;\s+root \/usr\/share\/nginx\/html;\s+charset utf-8;\s+add_header Cache-Control "no-store, no-cache, must-revalidate" always;\s+\}/,
    );
  }
});

test('committed env file contains placeholders instead of runtime secrets', () => {
  const env = read('.env.example');
  for (const key of [
    'MYSQL_ROOT_PASSWORD',
    'MYSQL_APP_PASSWORD',
    'REDIS_PASSWORD',
    'MONITOR_PASSWORD',
    'GRAFANA_ADMIN_PASSWORD',
  ]) {
    assert.match(env, new RegExp(`^${key}=replace-`, 'm'));
  }
  assert.match(env, /^MYSQL_DATABASE=ry-namewta$/m);
  assert.match(env, /^MINIO_ROOT_USER=namewta$/m);
  assert.match(read('.gitignore'), /^\.env$/m);
});

test('MySQL initialization targets one protected ry-namewta database', () => {
  const script = read('scripts/init-mysql-container.sh');
  const releaseScript = read('scripts/release-manage.sh');
  const expectedSql = [
    '10-ruoyi-base.sql',
    '20-ry-job.sql',
    '30-ry-workflow.sql',
    '40-ry-ai.sql',
    '50-namewta-ddl.sql',
    '60-namewta-dml.sql',
  ];

  assert.match(script, /database.*== ry-namewta/);
  assert.match(script, /refusing existing database/);
  assert.match(script, /EXPECTED_TABLES=86/);
  assert.match(script, /--default-character-set=utf8mb4/);
  assert.match(script, /access_policy='2'/);
  assert.doesNotMatch(script, /--force/);
  for (const filename of expectedSql) {
    assert.match(script, new RegExp(filename.replaceAll('.', '\\.')));
    assert.match(releaseScript, new RegExp(filename.replaceAll('.', '\\.')));
  }

  for (const composeName of [
    'docker/docker-compose-infrastructure.yml',
    'docker/docker-compose-backend.yml',
  ]) {
    assert.match(read(composeName), /MYSQL_DATABASE:-ry-namewta/);
    assert.doesNotMatch(read(composeName), /MYSQL_DATABASE:-ry-vue/);
  }
});

test('reserved ingress routes cannot be used as an app prefix', () => {
  const script = read('scripts/release-manage.sh');
  for (const route of ['admin', 'monitor', 'snail-job', 'snail-ai', 'dev-api', 'prod-api', 'actuator']) {
    assert.match(script, new RegExp(`\\b${route.replace('-', '\\-')}\\b`));
  }
});

test('add_app.py registers a buildable app across compose and both LBs', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'namewta-release-test-'));
  try {
    fs.cpSync(releaseRoot, path.join(tempRoot, 'release-artifacts'), { recursive: true });
    const appRoot = path.join(tempRoot, 'plus-ui-namewta/apps/client-web');
    fs.mkdirSync(appRoot, { recursive: true });
    fs.writeFileSync(
      path.join(appRoot, 'package.json'),
      '{"name":"@namewta/client-web","scripts":{"build:dev":"vite","build:prod":"vite"}}\n',
    );

    execFileSync('python3', [
      path.join(tempRoot, 'release-artifacts/skills/ruoyi-namewta-nginx-config/scripts/add_app.py'),
      '--repo-root', tempRoot,
      '--app', 'client-web',
      '--prefix', 'client',
      '--port', '41081',
    ], { stdio: 'pipe' });

    const compose = read('docker/docker-compose-frontend.yml', path.join(tempRoot, 'release-artifacts'));
    assert.match(compose, /^  nginx-client-web:$/m);
    assert.match(compose, /CLIENT_WEB_PREFIX/);
    assert.match(compose, /CLIENT_WEB_PORT:-41081/);
    for (const filename of ['nginx-lb-http.conf.template', 'nginx-lb-tls.conf.template']) {
      const lb = read(
        `docker/frontend/nginx/lb/${filename}`,
        path.join(tempRoot, 'release-artifacts'),
      );
      assert.match(lb, /upstream app_client_web/);
      assert.match(lb, /location \/\$\{APP_CLIENT_WEB_PREFIX\}\//);
    }
    assert.ok(fs.existsSync(path.join(
      tempRoot,
      'release-artifacts/docker/frontend/nginx/apps/nginx-client-web.conf.template',
    )));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('docker manager forwards an optional logs service on macOS-compatible bash', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'namewta-docker-cli-test-'));
  try {
    const fakeDocker = path.join(tempRoot, 'docker');
    fs.writeFileSync(fakeDocker, '#!/bin/sh\nprintf "%s\\n" "$*"\n');
    fs.chmodSync(fakeDocker, 0o755);
    const output = execFileSync(
      'bash',
      [path.join(releaseRoot, 'scripts/docker-manage.sh'), 'logs', 'backend', 'ruoyi-server1'],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${tempRoot}:${process.env.PATH}`,
          RELEASE_ENV_FILE: path.join(releaseRoot, '.env.example'),
        },
      },
    );
    assert.match(output, /logs -f --tail 200 ruoyi-server1/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
