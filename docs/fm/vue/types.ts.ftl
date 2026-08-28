export type Identifier = string | number;
export type IdentifierList = Identifier | readonly Identifier[];

export interface ApiResponse<T = unknown> {
  code?: number;
  data?: T;
  msg?: string;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface BaseEntity {
  createBy?: string | number;
  createDept?: string | number;
  createTime?: string;
  params?: Record<string, unknown>;
  remark?: string;
  updateBy?: string | number;
  updateTime?: string;
}

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  orderByColumn?: string;
  isAsc?: string;
  params?: Record<string, unknown>;
}

export interface ${BusinessName}VO {
<#list columns as column>
<#if column.list || column.pk || column.insert || column.edit>
  /**
   * ${column.columnComment}
   */
  ${column.javaField}: ${column.tsType};
<#if column.htmlType == "imageUpload">
  /**
   * ${column.columnComment}Url
   */
  ${column.javaField}Url: string;
</#if>
</#if>
</#list>
<#if table.tree>
  /**
   * 子对象
   */
  children: ${BusinessName}VO[];
</#if>
}

export interface ${BusinessName}Form extends BaseEntity {
<#list columns as column>
<#if column.insert || column.edit || column.pk>
  /**
   * ${column.columnComment}
   */
  ${column.javaField}?: ${column.tsType}<#if column.htmlType == "checkbox"> | string[]</#if>;
</#if>
</#list>
}

export interface ${BusinessName}Query<#if !table.tree> extends PageQuery</#if> {
<#list columns as column>
<#if column.query>
  /**
   * ${column.columnComment}
   */
  ${column.javaField}?: ${column.tsType};
</#if>
</#list>
  /**
   * 日期范围参数
   */
  params?: Record<string, unknown>;
}
