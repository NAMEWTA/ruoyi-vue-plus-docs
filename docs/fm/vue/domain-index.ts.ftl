export { create${BusinessName}Service, type ${BusinessName}Service } from './service';
export type { ${BusinessName}Transport } from './transport';
export type {
  ApiResponse,
  Identifier,
  IdentifierList,
  PageResult,
  ${BusinessName}Form,
  ${BusinessName}Query,
  ${BusinessName}VO
} from './types';

export const ${businessName}Resource = Object.freeze({
  controller: '${ClassName}Controller',
  basePath: '/${moduleName}/${businessName}'
});
