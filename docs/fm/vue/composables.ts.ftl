import type { FormInstance } from 'element-plus';
import { reactive, ref, type Ref } from 'vue';

type TableRef<T> = { toggleRowExpansion(row: T, expanded: boolean): void };

export function useLoading(initialValue = false) {
  const loading = ref(initialValue);
  const setLoading = (value: boolean) => { loading.value = value; };
  const withLoading = async <T>(task: () => Promise<T>): Promise<T> => {
    loading.value = true;
    try { return await task(); } finally { loading.value = false; }
  };
  return { loading, setLoading, withLoading };
}

export function useSearchToggle(initialValue = true) {
  return { showSearch: ref(initialValue) };
}

export function useSearchReset<T extends object>(options: {
  queryFormRef: Ref<FormInstance | undefined>;
  queryParams?: Ref<T>;
  pageNumKey?: keyof T;
  pageSizeKey?: keyof T;
  initialPageSize?: number;
  resetExtras?: () => void;
  afterReset?: () => void;
}) {
  const resetQuery = () => {
    options.queryFormRef.value?.resetFields();
    if (options.queryParams?.value && options.pageNumKey) {
      (options.queryParams.value as Record<keyof T, unknown>)[options.pageNumKey] = 1;
    }
    if (options.queryParams?.value && options.pageSizeKey && options.initialPageSize !== undefined) {
      (options.queryParams.value as Record<keyof T, unknown>)[options.pageSizeKey] = options.initialPageSize;
    }
    options.resetExtras?.();
    options.afterReset?.();
  };
  return { resetQuery };
}

export function useFormDialog<T extends object>(options: {
  form: Ref<T>;
  formRef?: Ref<FormInstance | undefined>;
  initialFormData: T;
}) {
  const dialog = reactive({ visible: false, title: '' });
  const resetForm = () => {
    options.form.value = { ...options.initialFormData };
    options.formRef?.value?.resetFields();
    options.formRef?.value?.clearValidate();
  };
  const showDialog = (title: string) => { dialog.title = title; dialog.visible = true; };
  const openDialog = (title: string) => { resetForm(); showDialog(title); };
  const closeDialog = () => { dialog.visible = false; };
  return { dialog, resetForm, openDialog, showDialog, closeDialog };
}

export function useTableSelection<T, ID extends string | number>(getRowId: (row: T) => ID) {
  const ids = ref<ID[]>([]) as Ref<ID[]>;
  const single = ref(true);
  const multiple = ref(true);
  const handleSelectionChange = (selection: T[]) => {
    ids.value = selection.map(getRowId);
    single.value = selection.length !== 1;
    multiple.value = selection.length === 0;
  };
  return { ids, single, multiple, handleSelectionChange };
}

export function useDateRangeQuery(propName: string) {
  const dateRange = ref<[string, string]>(['', '']);
  const applyDateRange = <T extends { params?: Record<string, unknown> }>(query: T): T => {
    const params = query.params ?? {};
    params[`begin${r'${propName}'}`] = dateRange.value[0];
    params[`end${r'${propName}'}`] = dateRange.value[1];
    query.params = params;
    return query;
  };
  const resetDateRange = () => { dateRange.value = ['', '']; };
  return { dateRange, applyDateRange, resetDateRange };
}

export function useTreeTableExpand<T extends { children?: T[] }>(options: {
  tableRef: Ref<TableRef<T> | undefined>;
  data: Ref<T[]>;
}) {
  const isExpandAll = ref(true);
  const toggleRows = (rows: T[], expanded: boolean) => rows.forEach(row => {
    options.tableRef.value?.toggleRowExpansion(row, expanded);
    if (row.children?.length) toggleRows(row.children, expanded);
  });
  const handleToggleExpandAll = () => {
    isExpandAll.value = !isExpandAll.value;
    toggleRows(options.data.value, isExpandAll.value);
  };
  return { isExpandAll, handleToggleExpandAll };
}

export function buildTree<T extends object>(data: T[], idKey: string, parentIdKey: string): T[] {
  const nodes = new Map<unknown, T>();
  const roots: T[] = [];
  data.forEach(item => {
    (item as Record<string, unknown>).children = [];
    nodes.set((item as Record<string, unknown>)[idKey], item);
  });
  data.forEach(item => {
    const parent = nodes.get((item as Record<string, unknown>)[parentIdKey]);
    if (!parent) roots.push(item);
    else ((parent as Record<string, unknown>).children as T[]).push(item);
  });
  return roots;
}
