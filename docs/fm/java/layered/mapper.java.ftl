package ${packageName}.mapper;

import ${packageName}.domain.${ClassName};
import ${packageName}.domain.model.read.${ClassName}Row;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;

/**
 * ${functionName} 持久化映射器。
 *
 * <p>分层 Mapper 只向 DAO 暴露实体和读模型，不直接暴露 HTTP VO。</p>
 *
 * @author ${author}
 * @date ${datetime}
 */
public interface ${ClassName}Mapper extends BaseMapperPlus<${ClassName}, ${ClassName}Row> {

}
