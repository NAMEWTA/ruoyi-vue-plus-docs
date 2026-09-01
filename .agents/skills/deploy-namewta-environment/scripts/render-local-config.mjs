#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseArgs, readJson, renderTemplate, requireArg, validateProfile, validateSecrets,
  writePrivateFile, yamlSingleQuote
} from './lib.mjs';

try {
  const args = parseArgs(process.argv.slice(2));
  const profile = readJson(requireArg(args, 'profile'));
  const secrets = readJson(requireArg(args, 'secrets'));
  const output = requireArg(args, 'output');
  const errors = [...validateProfile(profile), ...validateSecrets(secrets)];
  if (errors.length) throw new Error(errors.join('；'));

  const templates = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/templates');
  const ports = profile.network.ports;
  const common = {
    bindHost: profile.network.bindHost,
    serverRoot: profile.server.root,
    dockerNetwork: profile.network.dockerNetwork,
    environment: profile.deployment.environment,
    adminPrefix: profile.routes.adminPrefix,
    ingressHttpPort: ports.ingressHttp,
    ingressHttpsPort: ports.ingressHttps,
    adminWebPort: ports.adminWeb,
    backend1Port: ports.backend1,
    redisPort: ports.redis,
    serverName: profile.network.serverName,
    serverHost: profile.server.host,
    mysqlDatabase: profile.services.mysqlDatabase,
    mysqlUser: profile.services.mysqlUser,
    redisDatabase: profile.services.redisDatabase,
    minioEndpoint: profile.services.minioEndpoint,
    minioBucket: profile.services.minioBucket,
    minioDiagnosticObject: profile.services.minioDiagnosticObject,
    nacosNamespace: profile.services.nacosNamespace,
    monitorRoute: profile.routes.monitor,
    snailJobRoute: profile.routes.snailJob,
    snailAiRoute: profile.routes.snailAi,
    nacosRoute: profile.routes.nacos,
    ...Object.fromEntries(Object.entries(secrets).map(([key, value]) => [key, yamlSingleQuote(value)]))
  };
  common.jdbcUrl = `jdbc:mysql://${profile.server.host}:${ports.mysql}/${profile.services.mysqlDatabase}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=GMT%2B8&autoReconnect=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true`;

  const outputs = [
    ['release.env.template', 'release.env'],
    ['application-local.yml.template', 'application-local.yml'],
    ['admin-web.env.development.local.template', 'admin-web.env.development.local']
  ];
  for (const [templateName, outputName] of outputs) {
    const template = fs.readFileSync(path.join(templates, templateName), 'utf8');
    writePrivateFile(path.join(output, outputName), renderTemplate(template, common));
    console.log(`[生成] ${path.join(output, outputName)}（权限 0600）`);
  }
} catch (error) {
  console.error(`[错误] ${error.message}`);
  process.exitCode = 1;
}
