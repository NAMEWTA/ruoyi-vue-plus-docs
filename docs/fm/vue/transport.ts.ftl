import type { OpenApiSchema } from '@namewta/api-contracts';
import type { ${BusinessName}VO } from './types';

export type ${BusinessName}Transport = OpenApiSchema<'${ClassName}Vo'>;

export function project${BusinessName}Transport(value: ${BusinessName}Transport): ${BusinessName}VO {
  return {
<#list columns as column>
<#if column.list || column.pk || column.insert || column.edit>
    ${column.javaField}: value.${column.javaField} as ${BusinessName}VO['${column.javaField}'],
<#if column.htmlType == "imageUpload">
    ${column.javaField}Url: value.${column.javaField}Url ?? '',
</#if>
</#if>
</#list>
<#if table.tree>
    children: ((value as ${BusinessName}Transport & { children?: ${BusinessName}Transport[] }).children ?? [])
      .map(project${BusinessName}Transport)
</#if>
  };
}
