import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function files(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const templates = files(root)
  .filter(path => path.endsWith('.ftl'))
  .map(path => relative(root, path))
  .sort();
const catalog = JSON.parse(readFileSync(join(root, 'catalog.json'), 'utf8'));
const catalogTemplates = catalog.templates.map(item => item.source).sort();

if (JSON.stringify(templates) !== JSON.stringify(catalogTemplates)) {
  failures.push('catalog.json 与实际 .ftl 文件清单不一致');
}

const vueSource = templates
  .filter(path => path.startsWith('vue/'))
  .map(path => readFileSync(join(root, path), 'utf8'))
  .join('\n');
for (const forbidden of ["@/api", "@/hooks", "@/plugins", "@/utils", 'AxiosPromise', 'requestDownload']) {
  if (vueSource.includes(forbidden)) failures.push(`Vue 模板仍包含 App 私有依赖: ${forbidden}`);
}

const allSource = templates.map(path => readFileSync(join(root, path), 'utf8')).join('\n');
for (const forbidden of ["method: 'put'", "method: 'delete'", "method: 'patch'", '@PutMapping', '@DeleteMapping']) {
  if (allSource.includes(forbidden)) failures.push(`CRUD 模板仍包含禁用 method: ${forbidden}`);
}

const controller = readFileSync(join(root, 'java/controller.java.ftl'), 'utf8');
const postMappings = [...controller.matchAll(/@PostMapping(?:\([^\n]*\))?/g)].length;
const logs = [...controller.matchAll(/@Log\(/g)].length;
if (postMappings !== logs) failures.push(`Java POST/@Log 数量不一致: POST=${postMappings}, Log=${logs}`);

const resourceFieldPredicate = '<#if column.list || column.pk || column.insert || column.edit>';
for (const path of ['java/vo.java.ftl', 'react/types.ts.ftl', 'vue/transport.ts.ftl', 'vue/types.ts.ftl']) {
  if (!readFileSync(join(root, path), 'utf8').includes(resourceFieldPredicate)) {
    failures.push(`${path} 未覆盖列表、主键和可编辑资源字段`);
  }
}

const vueTypes = readFileSync(join(root, 'vue/types.ts.ftl'), 'utf8');
if (!vueTypes.includes('<#if column.insert || column.edit || column.pk>')) {
  failures.push('vue/types.ts.ftl 的 Form 未覆盖主键字段');
}

const composables = readFileSync(join(root, 'vue/composables.ts.ftl'), 'utf8');
if (/`(?:begin|end)\$\{propName\}`/.test(composables)) {
  failures.push('vue/composables.ts.ftl 包含未转义的 TypeScript 模板插值');
}

if (failures.length) {
  failures.forEach(message => process.stderr.write(`ERROR: ${message}\n`));
  process.exit(1);
}

process.stdout.write(`Validated ${templates.length} FreeMarker templates.\n`);
