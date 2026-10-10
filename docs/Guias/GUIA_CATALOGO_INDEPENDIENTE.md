# SUP-267: Catálogo y precios como servicio independiente

## Resultado y transición

`backend/catalogo` tiene módulo Go, binario, dependencias, pruebas e imagen Docker
propios. Contiene únicamente consultas de productos, precios, historial y datos
administrativos. No incorpora registro, login, usuarios, trabajos ni cola Redis.

SUP-266 está integrado en `develop-refactor` mediante `b2d1b5f` (PR #93).
La rama de esta tarea es `backend/refactor/sup-267-extraer-catalogo-vmatus`, creada
desde esa integración y no desde los commits previos al squash.

En esta etapa la API conserva sus rutas y su implementación anterior de Catálogo
para comparar contratos y mantener operativo el frontend. La Gateway continúa
enviando todo a `api-backend`. La activación del nuevo destino y los despliegues
pertenecen a SUP-268; al efectuar ese corte se retirará la implementación anterior
de consultas de Catálogo de la API. Esta duplicación es transitoria.

Scraping conserva el escritor de productos y precios hasta SUP-269. No se cambia
su cola ni se ejecutan migraciones sobre los datos actuales en SUP-267.

## Organización

```text
backend/catalogo/
├── go.mod, go.sum                  # Módulo independiente; sin replace a la API
├── cmd/catalogo/main.go            # Arranque, PostgreSQL y cierre ordenado
├── internal/
│   ├── domain/                    # DTO y puerto ProductoRepository
│   ├── services/                  # Casos de uso, filtros y paginación
│   ├── repositories/              # Consultas SQL mediante GORM
│   ├── handlers/                  # Contratos HTTP de productos
│   ├── auth/                      # Verificación del contrato JWT de Identidad
│   ├── middleware/                # Permisos y respuestas de error
│   ├── server/                    # Rutas, CORS, salud y correlación
│   ├── config/                    # Configuración por entorno
│   ├── utils/                     # Sanitización local compatible
│   └── tests/                     # Pruebas de negocio, HTTP y dependencias
├── tests/                         # Fixtures SQL y comparación HTTP de contratos
├── Dockerfile                     # Targets test y runtime
└── .env.example
```

No hay biblioteca común de dominios ni imports de otros servicios. El contrato
de persistencia reside en el dominio; los servicios no importan el adaptador
GORM. Las pruebas de dependencias detectan imports hacia otros servicios, Redis
y adaptadores desde negocio. Los mapeos, consultas SQL, reglas de filtrado y
respuestas se extraen conservando su comportamiento actual.

## Rutas

| Método | Ruta | Acceso y comportamiento |
|---|---|---|
| GET | `/api/v1/productos` | Público; listado, filtros y paginación actuales |
| GET | `/api/v1/productos/buscar` | Público; búsqueda con mínimo de 3 caracteres |
| GET | `/api/v1/productos/:id` | Público; detalle e historial actuales |
| GET | `/api/v1/admin/productos` | Cookie JWT válida y rol `admin` |
| GET | `/api/v1/admin/productos/` | Misma protección y respuesta administrativa |
| GET | `/_catalogo/live` | Vida del proceso, independiente de PostgreSQL |
| GET | `/_catalogo/ready` | Conexión PostgreSQL; 503 si falla |
| GET | `/health` | Alias de readiness del nuevo servicio |

El `/api/v1/health` público permanece en la API actual. Los healthchecks de
Catálogo no reemplazan ese contrato. Readiness consulta PostgreSQL con un límite
de dos segundos; comprueba conectividad, no la integridad completa del esquema.

Las rutas de autenticación, scraping, IA y rutas no existen en este servicio.
Los errores 404/405, CORS, campos JSON y permisos administrativos conservan el
comportamiento de los endpoints extraídos.

## Autenticación y datos

Catálogo verifica directamente la cookie `jwt`, firma HS256, expiración y rol.
Estos requisitos corresponden a los tokens que emite Identidad actualmente.
Un visitante obtiene 401; un usuario registrado obtiene 403 en administración.
No se aceptan identidades o roles declarados en `X-User-ID`/`X-User-Role`.

`JWT_SECRET` es obligatorio y no tiene fallback. Se comparte temporalmente con
Identidad: al conocer un secreto HMAC, un verificador técnicamente también puede
firmar. Migrar a claves asimétricas/JWKS requerirá una tarea de compatibilidad y
rotación; no se incorpora implícitamente en esta extracción. El nuevo verificador
rechaza algoritmos distintos de HS256 y tokens sin expiración; la API heredada
acepta otros HMAC y no exige ese claim. Los tokens reales del emisor actual son
HS256 con expiración y se comprueban en las pruebas de integración.

Las consultas sólo leen estas tablas existentes:

- `scraper.productos_crudos`.
- `scraper.capturas_precios`.
- `scraper.sucursales_supermercado`.
- `scraper.cadenas_supermercado`.

No hay `AutoMigrate`, creación de usuarios ni escrituras de ingesta. En las
pruebas aisladas Catálogo usa un rol PostgreSQL con lectura de estas cuatro
tablas y sin acceso a `api.usuarios`. Esto comprueba sus necesidades mínimas;
el provisionamiento de roles y permisos en entornos existentes sigue siendo
responsabilidad de SUP-271, sin cambiar usuarios de base de datos reales aquí.

## Configuración y operación

| Variable | Valor predeterminado / requisito |
|---|---|
| `DB_URL` | Obligatoria; PostgreSQL con el esquema existente |
| `JWT_SECRET` | Obligatoria; misma clave que Identidad |
| `PORT` | `8080` |
| `DB_MAX_OPEN_CONNS` | `10` por proceso |
| `DB_MAX_IDLE_CONNS` | `5`, sin superar las conexiones abiertas |
| `DB_CONN_MAX_LIFETIME` | `30m` |

Se lee el entorno del proceso. Para ejecución local, seguir
`backend/catalogo/README.md`; el ejemplo utiliza 8083 para evitar el puerto de la
API. No arrancar el servicio con valores de ejemplo contra una base compartida.

El servidor limita lectura de cabeceras a 5 s, lectura/escritura a 30 s e
inactividad a 60 s. Propaga el contexto HTTP a las consultas SQL y permite un
cierre ordenado de hasta 15 s. No reintenta consultas automáticamente.

Los logs JSON contienen servicio, ID de petición, método, ruta registrada,
estado y duración. Se preserva un `X-Request-ID` válido recibido desde Gateway;
se genera uno cuando falta o tiene formato/longitud inválidos. No se registran
cookies, JWT ni cadenas de conexión en esos logs.

La imagen runtime usa UID/GID 65532, sin privilegios, y el humo la ejecuta con
filesystem de sólo lectura y capabilities retiradas. El target `test` ejecuta
pruebas con detector de carreras y vet. La CA opcional de construcción se monta
como secreto BuildKit; la imagen runtime conserva el bundle estándar.

## Pruebas y CI

Desde `backend/catalogo`:

```bash
go test -race ./...
go vet ./...
go build -o /tmp/catalogo ./cmd/catalogo
```

Desde la raíz:

```bash
bash scripts/smoke_catalogo_compose.sh
```

El script crea proyecto, red, volumen, usuarios y credenciales de prueba propios;
los elimina al terminar. No inicia workers, no usa la base del equipo y no visita
supermercados. Compara la API de referencia y Catálogo sobre el mismo fixture,
incluyendo administración con JWT emitido realmente por Identidad, permisos,
filtros, paginación, precios e historial.

Después detiene la API y Redis y comprueba que Catálogo sigue respondiendo.
Finalmente detiene PostgreSQL y comprueba liveness 200 y readiness 503.
`SUP267_SKIP_BUILD=1` permite reutilizar imágenes locales verificadas;
`SUP267_API_PORT`/`SUP267_CATALOGO_PORT` cambian los puertos de prueba. El script
respeta el origen de `SUP267_CA_BUNDLE`, usa una copia temporal única dentro del
repositorio para BuildKit y elimina sólo su propia copia.

`catalogo-checks.yml` ejecuta pruebas, límites de dependencias, vet, compilación y
contratos. `docker-publish.yml` incorpora la imagen
`ghcr.io/danirc2024/taller_integracion_iii-catalogo` al flujo de publicación de
las ramas de integración/producción. Esta tarea prepara el pipeline; no ejecuta
una publicación manual ni modifica despliegues del clúster.

## Brechas funcionales previas

La comparación registra, sin modificar silenciosamente durante la extracción:

- Las consultas actuales eligen la última captura sin aplicar una política de
  caducidad. El fixture con precio de diez días sigue siendo visible en ambos
  servicios. RN-01/RN-02 necesitan una política de vigencia acordada.
- El listado público procesa `en_stock` pero el repositorio no aplica ese filtro.
  El listado administrativo sí lo aplica.
- El historial actual es público; aún no exige un derecho Premium para RN-19.

Estas brechas no quedan resueltas por crear otro proceso. Deben registrarse como
cambios funcionales con sus criterios y contratos correspondientes.

## Activación y rollback de SUP-268

Para completar el corte: configurar el destino de Catálogo en Gateway, conservar
las rutas anteriores para los clientes, probar permisos y fallos por destino,
añadir Compose/Kubernetes/recursos y comprobar el escalado independiente. Sólo
entonces retirar las consultas antiguas de la API.

Antes del corte, basta detener Catálogo para volver al estado previo: la entrada
pública sigue usando la API. Tras el corte, el rollback debe restaurar el
enrutamiento a una imagen de API que conserve el lector compatible. No hay
migraciones SQL que revertir en SUP-267.

## Comprobaciones realizadas

- 47 resultados Go aprobados, incluyendo subpruebas, con detector de carreras;
  vet y compilación aprobados.
- Imagen runtime propia construida y target Docker `test` aprobado; UID/GID
  `65532:65532` comprobado en la configuración de la imagen.
- 34 comprobaciones de contratos y datos contra la API de referencia aprobadas.
- 5 comprobaciones con API/Redis detenidos y 2 con PostgreSQL detenido aprobadas.
- Usuario lector de Catálogo sin lectura de usuarios ni escritura de productos
  o capturas comprobado en la base de prueba.
- Workflows validados con `actionlint`; DTO, consultas SQL, handlers, reglas de
  negocio y sanitización conservados respecto de la implementación extraída.

La validación se realizó en recursos locales aislados y las imágenes usadas
corresponden al código comprobado. El nuevo workflow todavía no se ha ejecutado
en GitHub, no se ha publicado la imagen y no se ha desplegado en el clúster.
