package ${packageName}.controller.${controllerSurface};

import ${packageName}.domain.bo.${ClassName}Bo;
import ${packageName}.domain.vo.${ClassName}Vo;
import ${packageName}.usecase.${ClassName}UseCase;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.web.core.BaseController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ${functionName} ${controllerSurface} 接口。
 *
 * <p>Controller 只负责 HTTP 参数校验和响应包装，业务处理统一交给 UseCase。</p>
 *
 * @author ${author}
 * @date ${datetime}
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/${moduleName}/${businessName}")
public class ${ClassName}Controller extends BaseController {

    private final ${ClassName}UseCase ${className}UseCase;

    /**
     * 查询 ${functionName} 列表。
     *
     * @param command 查询条件
     * @param pageQuery 分页参数
     * @return 查询结果
     */
    @GetMapping("/list")
<#if table.crud>
    public R<PageResult<${ClassName}Vo>> list(${ClassName}Bo command, PageQuery pageQuery) {
        return R.ok(${className}UseCase.queryPageList(command, pageQuery));
    }
<#else>
    public R<List<${ClassName}Vo>> list(${ClassName}Bo command) {
        return R.ok(${className}UseCase.queryList(command));
    }
</#if>

    /**
     * 获取 ${functionName} 详情。
     *
     * @param ${pkColumn.javaField} 主键
     * @return 详情响应
     */
    @GetMapping("/{${pkColumn.javaField}}")
    public R<${ClassName}Vo> getInfo(@PathVariable ${pkColumn.javaType} ${pkColumn.javaField}) {
        return R.ok(${className}UseCase.queryById(${pkColumn.javaField}));
    }

    /**
     * 新增 ${functionName}。
     *
     * @param command 新增命令
     * @return 操作结果
     */
    @PostMapping
    public R<Void> add(@RequestBody ${ClassName}Bo command) {
        return toAjax(${className}UseCase.create(command));
    }

    /**
     * 修改 ${functionName}。
     *
     * @param command 修改命令
     * @return 操作结果
     */
    @PostMapping("/edit")
    public R<Void> edit(@RequestBody ${ClassName}Bo command) {
        return toAjax(${className}UseCase.update(command));
    }

    /**
     * 删除 ${functionName}。
     *
     * @param ${pkColumn.javaField}s 待删除主键
     * @return 操作结果
     */
    @PostMapping("/remove/{${pkColumn.javaField}s}")
    public R<Void> remove(@PathVariable ${pkColumn.javaType}[] ${pkColumn.javaField}s) {
        return toAjax(${className}UseCase.remove(${pkColumn.javaField}s));
    }
}
