insert into sys_menu
    (menu_id, client_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache,
     menu_type, visible, status, perms, icon, active_menu, ext, create_dept, create_by, create_time, remark)
values
    (2100700000000000001, 1762000000000000001, '三方接口管理', 1761400000000000001, 14, 'third', null, '', 'N', 'Y', 'M', '0', '0', '', 'connection', '', '', 1761000000000000103, 1761100000000000001, sysdate(), '第三方 HTTP 供应商与接口管理'),
    (2100700000000000011, 1762000000000000001, '供应商管理', 2100700000000000001, 1, 'provider', 'third/provider/index', '', 'N', 'Y', 'C', '0', '0', 'third:provider:list', 'cloudy', '', '', 1761000000000000103, 1761100000000000001, sysdate(), '供应商开关、Base URL 与限额'),
    (2100700000000000012, 1762000000000000001, '接口管理', 2100700000000000001, 2, 'endpoint', 'third/endpoint/index', '', 'N', 'Y', 'C', '0', '0', 'third:endpoint:list', 'link', '', '', 1761000000000000103, 1761100000000000001, sysdate(), '接口路径、白名单与覆盖配置'),
    (2100700000000000013, 1762000000000000001, '凭据管理', 2100700000000000001, 3, 'credential', 'third/credential/index', '', 'N', 'Y', 'C', '0', '0', 'third:credential:list', 'lock', '', '', 1761000000000000103, 1761100000000000001, sysdate(), '密文凭据摘要与轮换版本'),
    (2100700000000000014, 1762000000000000001, '调用明细', 2100700000000000001, 4, 'invocation', 'third/invocation/index', '', 'N', 'Y', 'C', '0', '0', 'third:invocation:list', 'list', '', '', 1761000000000000103, 1761100000000000001, sysdate(), '出站 HTTP 脱敏调用明细'),
    (2100700000000000015, 1762000000000000001, '调用统计', 2100700000000000001, 5, 'statistics', 'third/statistics/index', '', 'N', 'Y', 'C', '0', '0', 'third:statistics:list', 'chart', '', '', 1761000000000000103, 1761100000000000001, sysdate(), '供应商与接口维度聚合统计');
