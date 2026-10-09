import argparse
import http.cookiejar
import json
import urllib.error
import urllib.request
import uuid

parser = argparse.ArgumentParser(description='Comparar API directa y Gateway sobre fixtures de prueba.')
parser.add_argument('--backend-url', default='http://127.0.0.1:8080')
parser.add_argument('--gateway-url', default='http://127.0.0.1:8082')
parser.add_argument('--write-fixtures', action='store_true', help='Crear usuario, trabajo y producto; usar solo una base aislada de prueba.')
args = parser.parse_args()
DIRECT = args.backend_url.rstrip('/')
GATEWAY = args.gateway_url.rstrip('/')
checks = []


def client():
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), urllib.request.HTTPCookieProcessor(jar))
    return opener, jar


def request(base, path, method='GET', data=None, opener=None, headers=None):
    if opener is None:
        opener = client()[0]
    headers = dict(headers or {})
    if data is not None:
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(base + path, method=method, headers=headers, data=None if data is None else json.dumps(data).encode())
    try:
        response = opener.open(req, timeout=5)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read()
        try:
            body = json.loads(body)
        except (ValueError, TypeError):
            pass
        return response.status, dict(response.headers), body


def compare(path, status, method='GET'):
    direct = request(DIRECT, path, method)
    gateway = request(GATEWAY, path, method)
    assert direct[0] == gateway[0] == status, 'Status changed for ' + path
    if path in ('/health', '/api/v1/health'):
        direct[2].pop('timestamp', None)
        gateway[2].pop('timestamp', None)
        assert gateway[2]['checks'] == {'database': 'ok', 'redis': 'ok'}
    assert direct[2] == gateway[2], 'Response changed for ' + path
    assert gateway[1].get('X-Request-Id') or gateway[1].get('X-Request-ID'), 'Missing request ID'
    checks.append(method + ' ' + path + ': compatible')
    return gateway[2]


compare('/', 200)
compare('/health', 200)
compare('/api/v1/health', 200)
page = compare('/api/v1/productos?page=1&limit=5', 200)
assert len(page['data']) == 5
product_id = page['data'][0]['id']
compare('/api/v1/productos/' + product_id, 200)
compare('/api/v1/productos/buscar?q=leche&page=1&limit=5', 200)
compare('/api/v1/productos/buscar?q=le', 400)
compare('/api/v1/auth/me', 401)
compare('/api/v1/admin/productos', 401)
compare('/ruta-inexistente', 404)
compare('/api/v1/productos', 405, 'PUT')
compare('/swagger/doc.json', 200)

origin = {'Origin': 'https://frontend.example', 'Access-Control-Request-Method': 'POST'}
direct = request(DIRECT, '/api/v1/auth/login', 'OPTIONS', headers=origin)
proxied = request(GATEWAY, '/api/v1/auth/login', 'OPTIONS', headers=origin)
assert direct[0] == proxied[0] == 204
for key in ('Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods'):
    assert direct[1][key] == proxied[1][key]
checks.append('OPTIONS login: CORS compatible')

if not args.write_fixtures:
    print(json.dumps({'task': 'SUP-264', 'passed': len(checks), 'failed': 0, 'checks': checks}, ensure_ascii=False, indent=2))
    raise SystemExit(0)

opener, jar = client()
email = 'sup264.' + uuid.uuid4().hex[:8] + '@example.test'
registration = {'correo': email, 'password': 'Sup264FixturePassword123!', 'nombre_completo': 'Fixture SUP264'}
status, headers, registered = request(GATEWAY, '/api/v1/auth/register', 'POST', registration, opener)
assert status == 201, 'Registration through gateway failed'
assert any(c.name == 'jwt' and c.has_nonstandard_attr('HttpOnly') for c in jar), 'Registration cookie changed'
checks.append('POST register: 201 and HttpOnly session cookie')

status, _, login = request(GATEWAY, '/api/v1/auth/login', 'POST', {'correo': email, 'password': registration['password']}, opener)
assert status == 200 and login['correo'] == email, 'Login through gateway failed'
checks.append('POST login: valid credentials accepted')
direct = request(DIRECT, '/api/v1/auth/me', opener=opener)
proxied = request(GATEWAY, '/api/v1/auth/me', opener=opener)
assert direct[0] == proxied[0] == 200 and direct[2] == proxied[2]
checks.append('GET profile: cookie accepted directly and through gateway')
direct = request(DIRECT, '/api/v1/admin/productos', opener=opener)
proxied = request(GATEWAY, '/api/v1/admin/productos', opener=opener)
assert direct[0] == proxied[0] == 403 and direct[2] == proxied[2]
checks.append('GET administration: non-admin denied consistently')

status, _, job = request(GATEWAY, '/api/v1/scraper/trabajos', 'POST', {'cadena_id': 1, 'supermercado': 'Jumbo'})
assert status == 201 and job['estado'] == 'en_progreso', 'Job creation failed'
checks.append('POST job: 201 and expected state')
job_path = '/api/v1/scraper/trabajos/' + job['id']
compare(job_path, 200)
payload = {'sucursal_id': 1, 'supermercado': 'Jumbo', 'productos': [{'sku': 'SUP264-FIXTURE', 'producto': 'Leche Fixture SUP264', 'precio_normal': 1234, 'en_stock': True}]}
status, _, ingested = request(GATEWAY, job_path + '/productos', 'POST', payload)
assert status == 200 and ingested['precios_registrados'] == 1, 'Fixture ingestion failed'
checks.append('POST fixture ingestion: one price recorded')
search = compare('/api/v1/productos/buscar?q=Fixture', 200)
assert any(p['nombre'] == 'Leche Fixture SUP264' for p in search['data']), 'Ingested product not visible'
status, _, finished = request(GATEWAY, job_path + '/finalizar', 'PUT', {'estado': 'completado', 'elementos_extraidos': 1})
assert status == 200 and finished['estado'] == 'completado', 'Job finalization failed'
compare(job_path, 200)
checks.append('PUT job finalization: completed state visible')

print(json.dumps({'task': 'SUP-264', 'passed': len(checks), 'failed': 0, 'checks': checks}, ensure_ascii=False, indent=2))
