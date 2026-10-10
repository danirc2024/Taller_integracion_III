#!/usr/bin/env bash
set -euo pipefail

# Uses a unique project, database volume, network and generated test credentials.
# No bot/worker is launched; fixture ingestion never visits a supermarket.
repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
test_dir=$(mktemp -d)
test_project="sup265-$(python3 -c 'import uuid; print(uuid.uuid4().hex[:10])')"
export SUP265_NETWORK="${test_project}-net"
export SUP265_INIT_DIR="${test_dir}/db-init"
test_env="${test_dir}/test.env"
rollback_file="${repo_root}/docker-compose.gateway-rollback.yml"

compose() {
  env -u DB_USER -u DB_PASSWORD -u DB_NAME -u JWT_SECRET -u GOOGLE_CLIENT_ID \
    -u GATEWAY_TRUSTED_PROXIES \
    docker compose --project-name "$test_project" --env-file "$test_env" \
    -f "$repo_root/docker-compose.yml" -f "$repo_root/docker-compose.gateway-test.yml" "$@"
}

cleanup() {
  compose down --volumes --remove-orphans >/dev/null 2>&1 || true
  docker network rm "$SUP265_NETWORK" >/dev/null 2>&1 || true
  rm -rf "$test_dir"
}

finish() {
  test_status=$?
  if (( test_status != 0 )); then
    compose logs --no-color --tail 80 db redis go_service gateway frontend || true
  fi
  cleanup
  exit "$test_status"
}
trap finish EXIT

docker network create "$SUP265_NETWORK" >/dev/null
test_subnet=$(docker network inspect "$SUP265_NETWORK" --format '{{(index .IPAM.Config 0).Subnet}}')
# Let Docker choose a free subnet, then declare it explicitly: Docker requires
# user-configured IPAM for the fixed IP used to trust only the test frontend.
docker network rm "$SUP265_NETWORK" >/dev/null
docker network create --subnet "$test_subnet" "$SUP265_NETWORK" >/dev/null
SUP265_FRONTEND_IP=$(python3 - "$test_subnet" <<'PY'
import ipaddress, sys
network = ipaddress.ip_network(sys.argv[1])
assert network.num_addresses > 12, 'Insufficient addresses in test network'
print(network.network_address + 10)
PY
)
export SUP265_FRONTEND_IP
mkdir -p "$SUP265_INIT_DIR"
chmod 755 "$test_dir" "$SUP265_INIT_DIR"
cp "$repo_root"/infrastructure/db/*.sql "$SUP265_INIT_DIR/"
chmod 644 "$SUP265_INIT_DIR"/*.sql
python3 - "$test_env" "$SUP265_FRONTEND_IP" <<'PY'
from pathlib import Path
import secrets, sys
p = Path(sys.argv[1])
p.write_text('DB_USER=sup265\nDB_NAME=sup265\nDB_PASSWORD=' + secrets.token_hex(24) +
             '\nJWT_SECRET=' + secrets.token_hex(32) + '\nGOOGLE_CLIENT_ID=\n' +
             'GATEWAY_TRUSTED_PROXIES=' + sys.argv[2] + '\n')
p.chmod(0o600)
PY

if [ -f /etc/ssl/certs/ca-certificates.crt ]; then
  cp /etc/ssl/certs/ca-certificates.crt "$test_dir/ca.crt"
else
  touch "$test_dir/ca.crt"
fi
export SUP265_CA_BUNDLE="$test_dir/ca.crt"

compose config --quiet
if [[ "${SUP265_SKIP_BUILD:-0}" != 1 ]]; then
  compose build --build-arg HTTP_PROXY --build-arg HTTPS_PROXY --build-arg NO_PROXY --build-arg http_proxy --build-arg https_proxy --build-arg no_proxy go_service gateway frontend
fi
compose up -d --wait --wait-timeout 180 db redis go_service gateway frontend

backend_url="http://127.0.0.1:${SUP265_BACKEND_PORT:-18080}"
gateway_url="http://127.0.0.1:${SUP265_GATEWAY_PORT:-18082}"
frontend_url="http://127.0.0.1:${SUP265_FRONTEND_PORT:-13000}"
python3 "$repo_root/backend/gateway/tests/smoke_api.py" \
  --backend-url "$backend_url" --gateway-url "$gateway_url" --write-fixtures
python3 - "$frontend_url" <<'PY'
import json, sys, time, urllib.request
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
origin = sys.argv[1]
for attempt in range(30):
    try:
        with opener.open(origin + '/', timeout=3) as response:
            assert b'<html' in response.read().lower()
        break
    except (OSError, AssertionError):
        if attempt == 29:
            raise
        time.sleep(0.5)
with opener.open(origin + '/api/v1/productos?limit=5', timeout=5) as response:
    assert response.status == 200
    assert len(json.load(response)['data']) == 5
    assert response.headers.get('X-Request-ID'), 'Frontend is bypassing Gateway'
print('Frontend HTML and Nginx → Gateway → API: passed')
PY

# Recreate only the routing layer and clients, preserving the test DB.
compose -f "$rollback_file" up -d --wait --wait-timeout 180 go_service gateway frontend
# A depends_on change does not force Compose to recreate Nginx; it caches the
# upstream address at startup. Recreate this client after the alias has moved.
compose -f "$rollback_file" up -d --no-deps --force-recreate --wait --wait-timeout 60 frontend
compose -f "$rollback_file" stop gateway
python3 "$repo_root/backend/gateway/tests/smoke_api.py" \
  --backend-url "$backend_url" --gateway-url "$frontend_url" --api-only --direct-entrypoint
python3 - "$frontend_url" <<'PY'
import json, sys, urllib.request
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
with opener.open(sys.argv[1] + '/api/v1/productos?limit=5', timeout=5) as response:
    assert len(json.load(response)['data']) == 5
    assert not response.headers.get('X-Request-ID'), 'Rollback still routes through Gateway'
print('Rollback Nginx → API with Gateway stopped: passed')
PY
