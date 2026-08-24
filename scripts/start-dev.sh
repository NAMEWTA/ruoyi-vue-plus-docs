#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
workspace_root=$(cd -- "${script_dir}/.." && pwd)
frontend_dir="${workspace_root}/plus-ui-namewta"
backend_dir="${workspace_root}/ruoyi-vue-plus-namewta"
backend_local_config="ruoyi-admin/src/main/resources/application-local.yml"

fail() {
  local message=${1}
  local status=${2:-1}
  echo "错误：${message}" >&2
  exit "${status}"
}

require_command() {
  local command_name=${1}
  command -v "${command_name}" >/dev/null 2>&1 || fail "未找到命令 ${command_name}，请先完成本机开发环境配置。"
}

ensure_port_available() {
  local port=${1}
  local service_name=${2}

  if ! command -v lsof >/dev/null 2>&1; then
    if (exec 3<>"/dev/tcp/127.0.0.1/${port}") 2>/dev/null; then
      fail "${service_name} 端口 ${port} 已被占用，且当前环境无法显示占用进程。"
    fi
    return
  fi

  local listeners
  listeners=$(lsof -nP -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -n "${listeners}" ]]; then
    echo "错误：${service_name} 端口 ${port} 已被占用，未启动新进程。" >&2
    echo "${listeners}" >&2
    exit 1
  fi
}

start_frontend() {
  require_command corepack
  [[ -f "${frontend_dir}/package.json" ]] || fail "前端目录不完整：${frontend_dir}"
  [[ -f "${frontend_dir}/pnpm-lock.yaml" ]] || fail "缺少前端 lockfile：${frontend_dir}/pnpm-lock.yaml"
  ensure_port_available 80 "前端"

  cd "${frontend_dir}"
  echo "正在安装前端依赖（严格使用 pnpm lockfile）..."
  corepack pnpm install --frozen-lockfile
  echo "正在前台启动前端，启动后请访问 http://localhost/，按 Ctrl+C 停止..."
  export BROWSER=none
  exec corepack pnpm dev --strictPort
}

start_backend() {
  require_command git
  require_command java
  [[ -x "${backend_dir}/mvnw" ]] || fail "后端 Maven Wrapper 不存在或不可执行：${backend_dir}/mvnw"
  [[ -s "${backend_dir}/${backend_local_config}" ]] || fail "缺少非空的本地后端配置：${backend_dir}/${backend_local_config}"
  if ! git -C "${backend_dir}" check-ignore -q -- "${backend_local_config}"; then
    fail "本地后端配置未被 Git 忽略，请先修复 secret 边界：${backend_dir}/${backend_local_config}"
  fi
  ensure_port_available 8080 "后端"

  cd "${backend_dir}"
  echo "正在刷新后端本地 Maven reactor（跳过自动测试）..."
  ./mvnw clean install -Dmaven.test.skip=true -Plocal
  cd ruoyi-admin
  echo "正在以前台 dev,local profiles 启动后端，按 Ctrl+C 停止..."
  exec ../mvnw spring-boot:run \
    -Dmaven.test.skip=true \
    -Pdev \
    -Dspring-boot.run.profiles=dev,local
}

echo "请选择要启动的本地测试服务："
echo "1、启动前端"
echo "2、启动后端"
printf "请输入选项 [1-2]："
if ! IFS= read -r choice; then
  fail "未读取到启动选项。" 2
fi

case "${choice}" in
  1)
    start_frontend
    ;;
  2)
    start_backend
    ;;
  *)
    fail "无效选项：${choice}（只能输入 1 或 2）。" 2
    ;;
esac
