package ${packageName}.service;

import ${packageName}.dao.${ClassName}Dao;
import ${packageName}.domain.bo.${ClassName}Bo;
import ${packageName}.domain.vo.${ClassName}Vo;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ${functionName} 业务能力服务。
 *
 * <p>Service 只承载业务规则和外部端口适配，持久化查询统一委托 DAO。</p>
 *
 * @author ${author}
 * @date ${datetime}
 */
@RequiredArgsConstructor
@Service
public class ${ClassName}Service {

    private final ${ClassName}Dao ${className}Dao;

    /**
     * 查询 ${functionName}。
     *
     * @param ${pkColumn.javaField} 主键
     * @return ${functionName}
     */
    public ${ClassName}Vo queryById(${pkColumn.javaType} ${pkColumn.javaField}) {
        return ${className}Dao.queryById(${pkColumn.javaField});
    }

<#if table.crud>
    /**
     * 分页查询 ${functionName}。
     *
     * @param command 查询条件
     * @param pageQuery 分页参数
     * @return 分页结果
     */
    public PageResult<${ClassName}Vo> queryPageList(${ClassName}Bo command, PageQuery pageQuery) {
        return ${className}Dao.queryPageList(command, pageQuery);
    }
</#if>

    /**
     * 查询 ${functionName} 列表。
     *
     * @param command 查询条件
     * @return 查询结果
     */
    public List<${ClassName}Vo> queryList(${ClassName}Bo command) {
        return ${className}Dao.queryList(command);
    }

    /**
     * 新增 ${functionName} 记录并返回操作结果。
     *
     * @param command 新增命令
     * @return 是否新增成功
     */
    public Boolean create(${ClassName}Bo command) {
        return ${className}Dao.insert(command);
    }

    /**
     * 更新 ${functionName} 记录并返回操作结果。
     *
     * @param command 修改命令
     * @return 是否修改成功
     */
    public Boolean update(${ClassName}Bo command) {
        return ${className}Dao.update(command);
    }

    /**
     * 删除 ${functionName} 记录并返回操作结果。
     *
     * @param ${pkColumn.javaField}s 待删除主键
     * @return 是否删除成功
     */
    public Boolean remove(${pkColumn.javaType}[] ${pkColumn.javaField}s) {
        return ${className}Dao.remove(${pkColumn.javaField}s);
    }
}
