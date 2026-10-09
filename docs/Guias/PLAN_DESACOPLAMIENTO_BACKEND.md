# Backlog: desacoplamiento del backend

Rama de integración: `develop-refactor`, creada desde `develop` (base inicial `5db3d25fc7fa8220ff94c545fda5a9b6bf213e63`).
Objetivo: desplegar y escalar por separado catálogo, identidad y coordinación de scraping, conservando los contratos públicos actuales.

## Flujo acordado

- Cada tarea de implementación parte de la última `develop-refactor`.
- Ramas con formato `[área]/[tipo]/[tarea]-[nombre]`; el alias confirmado del responsable es `vmatus`. Ejemplo: `backend/refactor/extraer-catalogo-vmatus`.
- PR hacia `develop-refactor`, con objetivo, cambios, validación, riesgos y rollback.
- Mantener la aprobación de un compañero, resolución de conversaciones y Squash and merge de la guía del equipo.
- `develop-refactor` es la excepción de integración solicitada por el usuario; el destino habitual `develop` se reemplaza por ella durante esta migración.
- Integración final a `develop` mediante PR cuando cumpla los criterios conjuntos. Promoción a producción en un paso posterior.
- No desplegar automáticamente sobre el entorno activo del clúster. Preparar validación en un entorno de prueba y documentar los pasos.
- Las ramas nuevas aún no están cubiertas por docker-publish.yml. Agregar validación de PR y decidir publicación de imágenes de prueba sin publicar desde PR no confiables.

## Registro por tarea

Copiar estos campos a la herramienta Scrum:

- ID y título:
- Responsable:
- Estado: pendiente / en progreso / revisión / bloqueada / terminada
- Objetivo:
- Estimación inicial de esfuerzo humano:
- Tiempo humano real empleado (guía, revisión, prueba y documentación):
- Rama:
- PR:
- Commit integrado:
- Entorno y comandos de prueba:
- Evidencias/resultados:
- Bloqueos:

Las estimaciones anteriores corresponden a ejecución humana del trabajo. Con implementación asistida se ajustarán tras cada PR. No registrar estimación ni tiempo de ejecución del asistente como horas humanas realizadas. Story points y horas no se convierten automáticamente.

## RF-01 — Establecer pruebas y métricas de referencia

Objetivo: disponer de evidencia antes de modificar la arquitectura.
Alcance: tests existentes de Go; contratos de catálogo, identidad e ingesta; arranque local con PostgreSQL y Redis; identificar pruebas representativas de frontend y bot. Medir carga por endpoint cuando haya un entorno autorizado disponible.
Aceptación:
- Tests ejecutados con resultado y conteo; fallos previos separados de regresiones.
- Salud comprobada por dependencia, no solo código HTTP.
- Datos de prueba conocidos y respuestas públicas documentadas.
- Cuando se mida carga: registrar RPS, duración, latencia p95, errores, réplicas, CPU y conexiones a BD.
Dependencias: resolver descarga de Go bloqueada por storage.googleapis.com si persiste.

## RF-02 — Definir contratos y propiedad de datos

Objetivo: precisar los límites antes de extraer código.
Alcance: decisión de arquitectura; rutas compatibles; servicio propietario de cada tabla; dependencias y claves foráneas; autenticación entre servicios; errores, timeouts, reintentos e idempotencia de ingesta.
Aceptación:
- Diagramas actual y objetivo.
- Contratos de consulta, ingesta y trabajos documentados.
- Separación explícita entre extracción de procesos y migración posterior de datos.
- No introducir bases nuevas, eventos o cambios de esquema sin una necesidad y estrategia de migración verificadas.
Dependencia: RF-01.

## RF-03 — Extraer catálogo y precios

Objetivo: atender consultas de productos con un proceso independiente.
Alcance: mover handlers/services/repositories de productos a servicio propio; catálogo público y administración; integración del enrutamiento público; imagen propia y Compose local.
Aceptación:
- Frontend mantiene sus URLs y formatos de respuesta.
- Catálogo arranca con configuración propia y pruebas relevantes pasan.
- Rutas administrativas siguen protegidas por identidad/rol verificables.
- API antigua deja de ejecutar la lógica extraída, conservando identidad y scraping durante la transición.
- Consultas a catálogo funcionan a través de la entrada pública con datos de prueba.
- Propiedad temporal de tablas compartidas documentada; no afirmar desacoplamiento completo de datos.
Dependencia: RF-02.
PR: dividir extracción e integración si ambas unidades pueden mantenerse funcionales.

## RF-04 — Desplegar y validar escalado de catálogo

Objetivo: demostrar que catálogo puede replicarse independientemente.
Alcance: CI, imagen, Deployment, Service, probes, requests/limits, HPA, enrutamiento y configuración del entorno de prueba.
Aceptación:
- CI valida PR dirigidos a develop-refactor.
- Imagen por servicio identificable por commit.
- Health/readiness distinguen dependencias necesarias.
- Prueba de carga documentada: escala catálogo; observar y explicar comportamiento de API/entrada y PostgreSQL.
- Pool de conexiones y límites coherentes con máximo de réplicas y recursos del clúster.
- Rollback ensayado y contratos públicos compatibles.
Dependencia: RF-03 y disponibilidad de clúster de prueba.
RF-01 a RF-04 constituyen el primer incremento: catálogo independiente. Estimación previa global: 70–105 horas-persona con contingencia; se recalibrará para trabajo asistido.

## RF-05 — Extraer identidad

Objetivo: separar registro, login y perfiles del resto del backend.
Alcance: handlers/services/repository de usuarios; JWT y Google login; configuración propia; Compose, imagen y Kubernetes.
Aceptación:
- Registro, login, perfil y actualización conservan contratos y comportamiento.
- JWT/cookies siguen funcionando con frontend, catálogo y administración.
- Cada servicio verifica la autorización que le corresponde; no confía en headers de usuario arbitrarios.
- Identidad controla los datos de usuarios y sus permisos de acceso.
- Pruebas de autenticación/RBAC y regresión pasan; rollback documentado.
Dependencias: RF-04 y contrato de identidad de RF-02.

## RF-06 — Extraer coordinación de scraping e ingesta

Objetivo: independizar trabajos/colas y asignar productos/precios al catálogo.
Alcance: creación, consulta, ejecución y finalización de trabajos; cola Redis; worker Python; clientes HTTP; compatibilidad con bot Discord; contrato de ingesta hacia catálogo.
Aceptación:
- Flujo de prueba completo: trabajo → cola → worker → ingesta → consulta de precios → finalización.
- Fixture/local fake evita depender de scraping real para validar integración.
- Timeouts, reenvío de lotes y fallos parciales tienen comportamiento definido y probado.
- Ingesta idempotente bajo reintentos.
- Worker y bot mantienen funcionamiento y no necesitan acceder a tablas privadas.
- Jobs y productos/precios tienen propietarios explícitos; migraciones y permisos revisados.
Dependencias: RF-03 y RF-02. Puede diseñarse antes de RF-05 si reduce acoplamiento sin bloquear identidad.

## RF-07 — Finalizar entrada y límites de datos

Objetivo: eliminar responsabilidades de negocio residuales de la API central.
Alcance: retirar lógica ya migrada; decidir entrada Nginx/Ingress o Gateway Go; mantener rutas, CORS y políticas comunes; cerrar dependencias SQL entre dominios; actualizar documentación y pruebas conjuntas.
Aceptación:
- Gateway propia, si se conserva, no tiene repositorios de negocio ni conexión a PostgreSQL.
- Cambios de esquema privados no exigen cambiar consultas SQL de otros servicios.
- Local y entorno de prueba del clúster ejecutan la misma arquitectura lógica.
- Regresión conjunta, carga y recuperación revisadas; rollback viable.
- PR de integración develop-refactor → develop con evidencia y aprobación del equipo.
Dependencias: RF-04, RF-05 y RF-06.

## Fuera del alcance inicial

Implementar funcionalidades nuevas de IA/rutas, integrar proveedores externos, introducir Kafka, separar físicamente cada PostgreSQL y desplegar a producción. Se crean tareas adicionales si el equipo decide incluirlas.
