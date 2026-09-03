import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(skillRoot, '../../..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  if (!existsSync(path)) {
    fail(`缺少文件: ${path}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

const requiredReferences = [
  'architecture.md',
  'module-layout.md',
  'implementation.md',
  'mapper-and-sql.md',
  'framework-usage.md',
  'verification.md',
];
const requiredFiles = [
  'SKILL.md',
  ...requiredReferences.map(name => `references/${name}`),
  'scripts/validate-skill.mjs',
  'scripts/validate-module-mode.mjs',
];

for (const relativePath of requiredFiles) {
  read(join(skillRoot, relativePath));
}

const skillSource = read(join(skillRoot, 'SKILL.md'));
const frontmatterMatch = skillSource.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatterMatch) {
  fail('SKILL.md 缺少有效 frontmatter');
} else {
  const keys = frontmatterMatch[1]
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.slice(0, line.indexOf(':')).trim());
  if (JSON.stringify(keys.sort()) !== JSON.stringify(['description', 'name'])) {
    fail(`frontmatter 只允许 name 和 description，当前为: ${keys.join(', ')}`);
  }
  if (!frontmatterMatch[1].includes('name: ruoyi-backend-development')) {
    fail('frontmatter name 必须与 Skill 目录名一致');
  }
}

const markdownFiles = requiredFiles.filter(path => extname(path) === '.md');
const allMarkdown = markdownFiles
  .map(relativePath => read(join(skillRoot, relativePath)))
  .join('\n');

const requiredTokens = [
  'docs/fm/java/domain.java.ftl',
  'docs/fm/java/bo.java.ftl',
  'docs/fm/java/vo.java.ftl',
  'docs/fm/java/mapper.java.ftl',
  'docs/fm/java/service.java.ftl',
  'docs/fm/java/serviceImpl.java.ftl',
  'docs/fm/java/controller.java.ftl',
  'docs/fm/xml/mapper.xml.ftl',
  'docs/fm/sql/mysql.sql.ftl',
  'controller/admin',
  'controller/anonymous',
  'service/impl',
  '不注入具体 `*ServiceImpl`',
  'classic',
  'layered',
  'UseCase -> Service -> DAO -> Mapper',
  'Controller/Listener/API Adapter -> UseCase -> Service -> DAO -> Mapper -> XML',
  'adapter/{api,gateway,provider,store}',
  '`support` 不得声明 Spring Bean 或 I/O',
  'Service 不调用 Service',
  'PageResult<Row>',
  '@DSTransactional',
  'layered 模式禁止 `IService` 和 `ServiceImpl`',
  'BaseMapperPlus<Entity, Row>',
  'domain/model/read',
  '`*DataSupport`',
  '@SaIgnore',
  'BaseMapperPlus -> wrapper/QueryBuilder -> MPJ -> XML',
  '50-namewta-ddl.sql',
  '60-namewta-dml.sql',
  'JsonUtils',
  'RedisUtils',
  'LoginHelper',
  'OssFactory',
  'NotifyDispatcher',
  'validate-module-mode.mjs',
];
for (const token of requiredTokens) {
  if (!allMarkdown.includes(token)) fail(`Skill 文档缺少强制合同: ${token}`);
}

for (const relativePath of markdownFiles) {
  const source = read(join(skillRoot, relativePath));
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of source.matchAll(linkPattern)) {
    const target = match[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const resolved = resolve(dirname(join(skillRoot, relativePath)), target);
    if (!existsSync(resolved)) fail(`${relativePath} 包含失效链接: ${match[1]}`);
  }
}

const fmRoot = join(workspaceRoot, 'docs/fm');
const expectedTemplates = [
  'java/domain.java.ftl',
  'java/bo.java.ftl',
  'java/vo.java.ftl',
  'java/mapper.java.ftl',
  'java/service.java.ftl',
  'java/serviceImpl.java.ftl',
  'java/controller.java.ftl',
  'java/read.java.ftl',
  'java/layered/controller.java.ftl',
  'java/layered/usecase.java.ftl',
  'java/layered/usecaseImpl.java.ftl',
  'java/layered/service.java.ftl',
  'java/layered/dao.java.ftl',
  'java/layered/mapper.java.ftl',
  'xml/mapper.xml.ftl',
  'sql/mysql.sql.ftl',
];
for (const template of expectedTemplates) read(join(fmRoot, template));

const sqlTemplates = existsSync(join(fmRoot, 'sql'))
  ? readdirSync(join(fmRoot, 'sql')).filter(name => name.endsWith('.ftl')).sort()
  : [];
if (JSON.stringify(sqlTemplates) !== JSON.stringify(['mysql.sql.ftl'])) {
  fail(`docs/fm/sql 只允许 mysql.sql.ftl，当前为: ${sqlTemplates.join(', ')}`);
}

const catalog = JSON.parse(read(join(fmRoot, 'catalog.json')) || '{}');
const mysqlCatalog = catalog.templates?.find(item => item.source === 'sql/mysql.sql.ftl');
const expectedSqlTarget = 'release-artifacts/docker/infrastructure/mysql/init/60-namewta-dml.sql';
if (catalog.schemaVersion !== 4 || mysqlCatalog?.target !== expectedSqlTarget || mysqlCatalog?.writeMode !== 'merge') {
  fail('docs/fm catalog 未声明 MySQL 模板以 merge 方式进入 60-namewta-dml.sql');
}

for (const name of ['50-namewta-ddl.sql', '60-namewta-dml.sql']) {
  read(join(workspaceRoot, 'release-artifacts/docker/infrastructure/mysql/init', name));
}

const moduleModes = join(workspaceRoot, '.agents/skills/engineering-standards/references/project/03-backend-module-modes.md');
if (!existsSync(moduleModes)) fail(`缺少后端模块模式登记表: ${moduleModes}`);

const systemRoot = join(
  workspaceRoot,
  'ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system',
);
for (const directory of ['controller', 'domain/bo', 'domain/vo', 'mapper', 'service/impl']) {
  if (!existsSync(join(systemRoot, directory))) fail(`ruoyi-system 规范证据目录不存在: ${directory}`);
}
if (!existsSync(join(workspaceRoot, 'ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/resources/mapper/system'))) {
  fail('ruoyi-system Mapper XML 规范证据目录不存在');
}

if (failures.length) {
  failures.forEach(message => process.stderr.write(`ERROR: ${message}\n`));
  process.exit(1);
}

process.stdout.write(`Validated ${requiredFiles.length} backend Skill files and ${expectedTemplates.length} exact templates.\n`);
