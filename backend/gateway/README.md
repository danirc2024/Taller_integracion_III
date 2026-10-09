# Gateway transparente — SUP-264

Servicio Go independiente que reenvía las solicitudes al backend actual. Esta
primera extracción conserva autenticación, catálogo y scraping en `backend/api`.
La Gateway no tiene conexión PostgreSQL, Redis ni dependencias de negocio.

## Ejecutar

Requiere Go 1.26 y un backend en ejecución. Desde `backend/gateway`:

```bash
BACKEND_URL=http://127.0.0.1:8080 go run ./cmd/gateway
```

Escucha por defecto en el puerto 8082. Para validar localmente:

```bash
curl -fsS http://127.0.0.1:8082/_gateway/live
curl -fsS http://127.0.0.1:8082/api/v1/health
curl -fsS 'http://127.0.0.1:8082/api/v1/productos?page=1&limit=5'
```

`/_gateway/live` comprueba únicamente el proceso de la Gateway. Las rutas `/`,
`/health`, `/api/v1/health`, `/swagger/*` y todas las rutas de negocio se envían al
backend sin sustituir sus respuestas. En `/api/v1/health`, verificar también los
campos de PostgreSQL y Redis: un HTTP 200 no demuestra que esas dependencias estén
disponibles.

## Configuración

| Variable | Valor por defecto | Uso |
|---|---|---|
| `BACKEND_URL` | Obligatoria | Origen HTTP/HTTPS, por ejemplo `http://127.0.0.1:8080`; sin credenciales, prefijo de ruta, query o fragmento |
| `GATEWAY_LISTEN_ADDR` | `:8082` | Dirección de escucha; usar `127.0.0.1:8082` para restringirla a la máquina local |
| `GATEWAY_REQUEST_TIMEOUT` | `30s` | Tiempo máximo de la solicitud proxificada |
| `GATEWAY_DIAL_TIMEOUT` | `5s` | Límite para conexión y handshake TLS con el backend |
| `GATEWAY_RESPONSE_HEADER_TIMEOUT` | `10s` | Espera de headers después de enviar la solicitud al backend |
| `GATEWAY_READ_HEADER_TIMEOUT` | `5s` | Lectura de headers del cliente |
| `GATEWAY_IDLE_TIMEOUT` | `60s` | Conexión entrante inactiva |
| `GATEWAY_SHUTDOWN_TIMEOUT` | `10s` | Espera de solicitudes activas al recibir SIGINT/SIGTERM |
| `GATEWAY_TRUSTED_PROXIES` | Vacío | IPs/CIDRs de proxies de entrada confiables, separados por coma |

Los timeouts deben ser duraciones positivas de Go, como `500ms` o `30s`. Una
configuración inválida impide el arranque. El servidor también limita la lectura
del request completo al tiempo configurado de solicitud. No apuntar `BACKEND_URL`
a la propia Gateway. Los HTTPS del backend conservan verificación TLS; las
conexiones internas no usan automáticamente el proxy de salida de la máquina.

## Transparencia y seguridad de la entrada

- Conserva método, path codificado, query, cuerpo, Host, códigos y representación
  de respuesta. Propaga cookies, Authorization, CORS, redirects y headers de la
  aplicación. Los headers de salto HTTP se gestionan con `httputil.ReverseProxy`.
- CORS, autenticación, autorización y rate limiting continúan en el backend;
  esta tarea no introduce contadores duplicados ni cambia permisos.
- Acepta un `X-Request-ID` de hasta 128 caracteres ASCII alfanuméricos, `.`, `_`
  o `-`; genera uno si falta o es inválido. Lo propaga al backend, respuesta y
  logs JSON. No registra query, cookies, Authorization ni cuerpos.
- Elimina `X-User-ID` y `X-Role` del cliente: no constituyen identidad verificada.
- Reconstruye los headers `X-Forwarded-*`. Sin proxies confiables configurados,
  usa la IP de la conexión y el protocolo real de entrada. Si el peer inmediato
  es confiable, recorre la cadena de IPs desde la derecha hasta el primer salto
  no confiable, para que un cliente no pueda falsificar la primera IP.
- Antes de colocarla detrás de Nginx/Ingress, configurar los CIDRs/IPs reales de
  ese proxy; no confiar en todas las redes. De lo contrario el rate limiter
  existente verá la IP del proxy en vez de la del cliente. El backend también
  debe configurar sus proxies confiables al integrar el despliegue.

Los GET/HEAD/OPTIONS/TRACE reutilizan conexiones al backend. Para los demás
métodos se abre una conexión HTTP/1 por solicitud: se evita que el transporte
reenvíe una escritura ante un fallo de una conexión reutilizada, incluso con
`Idempotency-Key`. Esto agrega costo de conexión a las escrituras; medirlo en
SUP-265. La Gateway no implementa reintentos de negocio.

Si no se puede conectar al backend, devuelve HTTP 502 con `backend_unavailable`.
Un timeout antes de empezar la respuesta devuelve HTTP 504 con `backend_timeout`.
Ambos contienen `request_id`, sin detalles internos en la respuesta. Los códigos
de error enviados por el backend se conservan. Una respuesta cuyo cuerpo ya
empezó no puede cambiar a 504: al vencer el plazo se interrumpe la transferencia.
El cierre del cliente cancela la solicitud al backend.

## Pruebas

Desde `backend/gateway`:

```bash
go test -race ./...
go vet ./...
go build ./cmd/gateway
```

Las pruebas usan servidores HTTP locales y cubren transparencia de requests y
respuestas, cookies, estados de error del backend, compresión, redirects, IPs de
proxies confiables, correlación sin credenciales en logs, conexión fallida,
timeout, cancelación y escrituras sin replay.

La comprobación funcional de SUP-264 además debe comparar las rutas actuales
directas y proxificadas con fixtures aislados: catálogo, búsqueda/detalle, salud,
registro/login/perfil, administración y ciclo de trabajos/ingesta. No ejecutar
escrituras de prueba en producción ni lanzar spiders reales para esta validación.

Desde `backend/gateway`, el script de humo usa Python 3 estándar:

```bash
python3 tests/smoke_api.py --backend-url http://127.0.0.1:8080 --gateway-url http://127.0.0.1:8082
```

Espera los datos semilla del repositorio (al menos cinco productos). Por defecto
comprueba contratos sin crear fixtures. Para validar también registro, login,
permisos, ingesta y cierre de trabajos, apuntar el backend a una base **aislada de
prueba** e incluir `--write-fixtures`. Ese modo crea usuarios y datos; no los
elimina automáticamente. Eliminar la base de prueba después de detener el
backend. Los ejemplos usan Python 3 aunque el comando disponible sea `python`.

No basta con una salida exitosa de los tests del proxy para afirmar compatibilidad
del backend real. Registrar resultados de ambas suites y del humo por separado.

## Alcance y retorno al estado anterior

SUP-264 agrega el proxy, su configuración y sus pruebas. Dockerfiles, Compose,
CI, Services/Ingress y despliegue en clúster corresponden a SUP-265; no se cambian
en esta tarea. No se modifica el backend existente ni se migra su base de datos.

Hasta la integración, el frontend y el bot conservan su entrada actual. Para
probar el proxy se usa explícitamente el puerto 8082. El retorno local consiste
en detener la Gateway y usar nuevamente el puerto/destino del backend; no hay
datos que restaurar. Antes de un cambio de entrada en el clúster, SUP-265 debe
probar el retorno del Service/Ingress con las imágenes existentes.
