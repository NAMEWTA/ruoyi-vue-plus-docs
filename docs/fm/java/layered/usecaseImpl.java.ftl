package ${packageName}.usecase.impl;

import ${packageName}.domain.bo.${ClassName}Bo;
import ${packageName}.domain.vo.${ClassName}Vo;
import ${packageName}.service.${ClassName}Service;
import ${packageName}.usecase.${ClassName}UseCase;
import com.baomidou.dynamic.datasource.annotation.DSTransactional;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ${functionName} 应用用例实现。
 *
 * <p>该类只做入口参数到 Service 的编排，不持有查询条件或持久化实现细节。</p>
 *
 * @author ${author}
 * @date ${datetime}
 */
@RequiredArgsConstructor
@Service
public class ${ClassName}UseCaseImpl implements ${ClassName}UseCase {

    private final ${ClassName}Service ${className}Service;

    /**
     * 查询 ${functionName}。
     *
     * @param ${pkColumn.javaField} 主键
     * @return ${functionName}
     */
    @Override
    public ${ClassName}Vo queryById(${pkColumn.javaType} ${pkColumn.javaField}) {
        return ${className}Service.queryById(${pkColumn.javaField});
    }

<#if table.crud>
    /**
     * 分页查询 ${functionName}。
     *
     * @param command 查询条件
     * @param pageQuery 分页参数
     * @return 分页结果
     */
    @Override
    public PageResult<${ClassName}Vo> queryPageList(${ClassName}Bo command, PageQuery pageQuery) {
        return ${className}Service.queryPageList(command, pageQuery);
    }
</#if>

    /**
     * 查询 ${functionName} 列表。
     *
     * @param command 查询条件
     * @return 查询结果
     */
    @Override
    public List<${ClassName}Vo> queryList(${ClassName}Bo command) {
        return ${className}Service.queryList(command);
    }

    /**
     * 新增 ${functionName}。
     *
     * @param command 新增命令
     * @return 是否新增成功
     */
    @Override
    @DSTransactional
    public Boolean create(${ClassName}Bo command) {
        return ${className}Service.create(command);
    }

    /**
     * 修改 ${functionName}。
     *
     * @param command 修改命令
     * @return 是否修改成功
     */
    @Override
    @DSTransactional
    public Boolean update(${ClassName}Bo command) {
        return ${className}Service.update(command);
    }

    /**
     * 删除 ${functionName}。
     *
     * @param ${pkColumn.javaField}s 待删除主键
     * @return 是否删除成功
     */
    @Override
    @DSTransactional
    public Boolean remove(${pkColumn.javaType}[] ${pkColumn.javaField}s) {
        return ${className}Service.remove(${pkColumn.javaField}s);
    }
}
