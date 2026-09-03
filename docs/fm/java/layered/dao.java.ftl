package ${packageName}.dao;

import ${packageName}.domain.${ClassName};
import ${packageName}.domain.bo.${ClassName}Bo;
import ${packageName}.domain.model.read.${ClassName}Row;
import ${packageName}.domain.vo.${ClassName}Vo;
import ${packageName}.mapper.${ClassName}Mapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

/**
 * ${functionName} 数据访问对象。
 *
 * @author ${author}
 * <p>DAO 统一封装查询条件、分页、锁语义和 Mapper 调用，并在本边界将读模型转换为 VO。</p>
 *
 * @date ${datetime}
 */
@RequiredArgsConstructor
@Repository
public class ${ClassName}Dao {

    private final ${ClassName}Mapper ${className}Mapper;

    /**
     * 按主键查询 ${functionName}。
     *
     * @param ${pkColumn.javaField} 主键
     * @return ${functionName}，不存在时返回 {@code null}
     */
    public ${ClassName}Vo queryById(${pkColumn.javaType} ${pkColumn.javaField}) {
        ${ClassName}Row row = ${className}Mapper.selectVoById(${pkColumn.javaField});
        return MapstructUtils.convert(row, ${ClassName}Vo.class);
    }

<#if table.crud>
    /**
     * 按查询条件分页查询 ${functionName}。
     *
     * @param command 查询条件
     * @param pageQuery 分页参数
     * @return 分页结果
     */
    public PageResult<${ClassName}Vo> queryPageList(${ClassName}Bo command, PageQuery pageQuery) {
        Page<${ClassName}Row> result = ${className}Mapper.selectVoPage(pageQuery.build(),
            Wrappers.lambdaQuery(${ClassName}.class));
        return PageResult.build(MapstructUtils.convert(result.getRecords(), ${ClassName}Vo.class), result.getTotal());
    }
</#if>

    /**
     * 按查询条件查询 ${functionName} 列表。
     *
     * @param command 查询条件
     * @return 查询结果
     */
    public List<${ClassName}Vo> queryList(${ClassName}Bo command) {
        List<${ClassName}Row> rows = ${className}Mapper.selectVoList(Wrappers.lambdaQuery(${ClassName}.class));
        return MapstructUtils.convert(rows, ${ClassName}Vo.class);
    }

    /**
     * 持久化新增命令。
     *
     * @param command 新增命令
     * @return 是否新增成功
     */
    public Boolean insert(${ClassName}Bo command) {
        return ${className}Mapper.insert(MapstructUtils.convert(command, ${ClassName}.class)) > 0;
    }

    /**
     * 持久化修改命令。
     *
     * @param command 修改命令
     * @return 是否修改成功
     */
    public Boolean update(${ClassName}Bo command) {
        return ${className}Mapper.updateById(MapstructUtils.convert(command, ${ClassName}.class)) > 0;
    }

    /**
     * 按主键批量删除数据。
     *
     * @param ${pkColumn.javaField}s 待删除主键
     * @return 是否删除成功
     */
    public Boolean remove(${pkColumn.javaType}[] ${pkColumn.javaField}s) {
        return ${className}Mapper.deleteByIds(Arrays.asList(${pkColumn.javaField}s)) > 0;
    }
}
