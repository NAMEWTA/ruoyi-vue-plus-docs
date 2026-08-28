import type { ${BusinessName}Service } from '@namewta/domain-${moduleName}/${businessName}';
<#if needEditor || needFileUpload || needImagePreview || needImageUpload>
import type { Component } from 'vue';
</#if>
<#if needDict>
import type { Ref } from 'vue';

export interface ${BusinessName}DictOption {
  label: string;
  value: string;
}
</#if>

export interface ${BusinessName}WebRuntime {
  service: ${BusinessName}Service;
  confirm(message: string): Promise<void>;
  success(message: string): void;
<#if enableExport>
  download(url: string, params: unknown, fileName: string): Promise<void> | void;
</#if>
<#if needDict>
  dicts(...types: string[]): Record<string, Readonly<Ref<${BusinessName}DictOption[]>>>;
</#if>
<#if needParseTime>
  formatTime(value: unknown, format: string): string;
</#if>
<#if needImagePreview>
  imagePreview: Component;
</#if>
<#if needImageUpload>
  imageUpload: Component;
</#if>
<#if needFileUpload>
  fileUpload: Component;
</#if>
<#if needEditor>
  editor: Component;
</#if>
}

export function require${BusinessName}WebRuntime(
  runtime: ${BusinessName}WebRuntime | undefined
): ${BusinessName}WebRuntime {
  if (!runtime) throw new Error('${BusinessName}WebRuntime is required');
  return runtime;
}
