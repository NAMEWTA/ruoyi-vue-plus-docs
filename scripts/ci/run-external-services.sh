#!/usr/bin/env bash
set -euo pipefail

workspace_root=$(git rev-parse --show-toplevel)
run_suffix=${GITHUB_RUN_ID:-$$}
run_suffix=${run_suffix//[^a-zA-Z0-9]/}
network="namewta-ci-$run_suffix"
redis_container="namewta-redis-$run_suffix"
mysql_container="namewta-mysql-$run_suffix"
minio_container="namewta-minio-$run_suffix"
redis_port=${NAMEWTA_CI_REDIS_PORT:-16379}
mysql_port=${NAMEWTA_CI_MYSQL_PORT:-13306}
minio_port=${NAMEWTA_CI_MINIO_PORT:-19000}

cleanup() {
  docker rm -f "$redis_container" "$mysql_container" "$minio_container" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker network create "$network" >/dev/null
docker run -d --name "$redis_container" --network "$network" -p "$redis_port:6379" redis:8.6.3 >/dev/null
docker run -d --name "$mysql_container" --network "$network" -p "$mysql_port:3306" \
  -e MYSQL_ROOT_PASSWORD=namewta-ci -e MYSQL_DATABASE=namewta_ci mysql:8.4.9 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci >/dev/null
docker run -d --name "$minio_container" --network "$network" -p "$minio_port:9000" \
  -e MINIO_ROOT_USER=namewta -e MINIO_ROOT_PASSWORD=namewta123 \
  pgsty/minio:RELEASE.2026-08-04T00-00-00Z server --address ':9000' /data >/dev/null

for _ in {1..60}; do
  docker exec "$redis_container" redis-cli ping 2>/dev/null | grep -q PONG && break
  sleep 1
done
docker exec "$redis_container" redis-cli ping | grep -q PONG

for _ in {1..90}; do
  docker exec "$mysql_container" mysqladmin ping -h 127.0.0.1 -uroot -pnamewta-ci --silent && break
  sleep 1
done
docker exec "$mysql_container" mysqladmin ping -h 127.0.0.1 -uroot -pnamewta-ci --silent

for _ in {1..60}; do
  curl --fail --silent "http://127.0.0.1:$minio_port/minio/health/ready" >/dev/null && break
  sleep 1
done
curl --fail --silent "http://127.0.0.1:$minio_port/minio/health/ready" >/dev/null

cd "$workspace_root/ruoyi-vue-plus-namewta"
./mvnw -pl ruoyi-admin -am test \
  -Dtest=RedisNotifyIdempotencyStoreIntegrationTest,RedisOssUploadTicketStoreIntegrationTest,NotifyMonitorMySqlIntegrationTest,MinioOssClientIntegrationTest,BusinessMenuRetirementMySqlIntegrationTest \
  -Dsurefire.failIfNoSpecifiedTests=false \
  -Dnotify.redis.integration.port="$redis_port" \
  -Doss.upload.redis.integration.port="$redis_port" \
  -Dnotify.mysql.integration.url="jdbc:mysql://127.0.0.1:$mysql_port/namewta_ci?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai" \
  -Dnotify.mysql.integration.username=root \
  -Dnotify.mysql.integration.password=namewta-ci \
  -Doss.minio.integration.endpoint="http://127.0.0.1:$minio_port" \
  -Doss.minio.integration.access-key=namewta \
  -Doss.minio.integration.secret-key=namewta123
