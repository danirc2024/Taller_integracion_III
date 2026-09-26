# Investigación de Mecanismos Anti-Scraping y Estrategia de Protección de Datos Propios

**Fecha:** 14 de septiembre de 2026

## 1. Contexto del Negocio y Propuesta de Valor

Nuestra plataforma integra un ecosistema de alto valor compuesto por tres componentes técnicos clave:

1. **Motor de Inteligencia Artificial para Recetas:** modelo generativo/recomendador de menús e insumos adaptados a restricciones nutricionales y presupuestarias del usuario.
2. **Modelo de Optimización de Transporte:** algoritmo de ruteo vehicular (*Vehicle Routing Problem with Time Windows*, VRPTW) para minimizar costos logísticos y tiempos de desplazamiento entre supermercados.
3. **Catálogo Consolidado de Precios:** pipeline de extracción continua (web scraping y ETL) sobre múltiples cadenas de retail.

Dado que los datos de precios e inventario alimentan directamente la IA y el motor de ruteo, este catálogo estructurado representa la principal ventaja competitiva de la plataforma. Por ello, es imperativo implementar barreras técnicas avanzadas que impidan a competidores o bots de extracción masiva consumir nuestros endpoints y apropiarse del catálogo sin asumir los costos de infraestructura y mantenimiento de datos.

## 2. Evaluación Técnica de Mecanismos Anti-Scraping

### 2.1. Rate Limiting Basado en Algoritmos de Ventana Deslizante

#### Funcionamiento técnico

Implementación del algoritmo *Sliding Window Counter* sobre un almacén en memoria distribuido (Redis). Controla la tasa de peticiones por identificador único (IP, token JWT o cliente), calculando la densidad de solicitudes dentro de una ventana temporal móvil.

#### Ejemplo de implementación

Un cliente envía solicitudes a `/api/v1/products`. El API Gateway intercepta la llamada, consulta Redis mediante la clave `rate:ip:192.168.1.1` y verifica el contador. Si supera el límite de 60 peticiones por minuto, el servidor responde con el estado HTTP `429 Too Many Requests`, acompañado del encabezado `Retry-After: 30`.

### 2.2. Autenticación y Firmado de Peticiones mediante HMAC

#### Funcionamiento técnico

Protección de endpoints REST mediante firmas criptográficas HMAC-SHA256. Cada solicitud generada por la aplicación legítima calcula un digest que incluye la URI, un *timestamp* (para mitigar ataques de repetición) y un *nonce* único, firmado mediante una clave secreta empaquetada en la aplicación.

#### Ejemplo de implementación

Un cliente legítimo realiza un `GET /api/v1/catalog`. La aplicación genera el encabezado:

```text
X-Signature: HMAC-SHA256(secret, verb + path + timestamp + nonce)
```

Si un bot intenta consultar el endpoint usando un cliente HTTP plano, como cURL o la librería Requests de Python, sin calcular la firma dinámica exacta, la API rechaza la llamada con el código `401 Unauthorized`.

### 2.3. Análisis de Huella Digital TLS (JA3/JA4) y Fingerprinting HTTP/2

#### Funcionamiento técnico

Identificación del cliente a nivel de las capas de sesión y aplicación. Durante el saludo TLS (*TLS Handshake*), el servidor genera una firma JA3 basada en la versión SSL/TLS, los cifrados soportados, las extensiones y las curvas elípticas. Esto permite distinguir navegadores reales de bibliotecas de automatización como Puppeteer, Playwright, Scrapy o Selenium.

#### Ejemplo de implementación

Un scraper simula el encabezado `User-Agent: Mozilla/5.0... (Windows NT 10.0)`. Sin embargo, al inspeccionar el paquete TLS en el WAF, la firma JA3 generada corresponde a la librería `python-requests`. Al detectar la discrepancia entre el User-Agent y la firma TLS, la conexión se bloquea en la capa perimetral.

### 2.4. Desafíos Conductuales y Proof-of-Work (CAPTCHA Invisible)

#### Funcionamiento técnico

Integración de servicios de validación sin fricción, como Cloudflare Turnstile o reCAPTCHA v3. Estos servicios evalúan métricas conductuales en el cliente (movimiento del cursor, eventos DOM y renderizado WebGL) y pueden ejecutar pequeños desafíos criptográficos *Proof-of-Work* en segundo plano mediante WebAssembly.

#### Ejemplo de implementación

Si una sesión registra peticiones con intervalos estrictos y matemáticamente constantes, el frontend solicita un token de validación emitido por Turnstile. Si el script *headless* no procesa el código JavaScript o falla la prueba sintética, el token no se adjunta y la API invalida el acceso.

### 2.5. Inserción de Canary Tokens y Honeytokens en la Capa de Datos

#### Funcionamiento técnico

Técnica de detección activa (*Deception Technology*). Consiste en inyectar elementos invisibles en el DOM (`style="display:none;"`) o llaves sintéticas ocultas dentro del JSON de la respuesta.

#### Ejemplo de implementación

La API retorna un listado de productos incluyendo el campo señuelo `metadata_ref: /api/v1/internal/canary-tracker`. Un usuario legítimo mediante la UI jamás disparará una llamada a esa ruta. Si un scraper automatizado parsea el JSON e intenta recorrer de forma recursiva todos los enlaces presentes, al tocar dicha URL señuelo, el servidor registra la IP y la añade automáticamente a una lista negra a nivel de firewall (iptables o reglas del WAF).

### 2.6. Marco Legal: Términos y Condiciones de Uso (ToS)

Establecimiento de una barrera legal explícita mediante cláusulas anti-scraping en los Términos y Condiciones de Uso del servicio. Define el carácter no autorizado de la extracción automatizada, la ingeniería inversa y el uso de robots sobre el catálogo de precios, sirviendo como respaldo legal para la suspensión de cuentas y acciones por incumplimiento contractual.

#### Ejemplo de implementación

Durante el flujo de registro o inicio de sesión (RF-01.3), se exige la aceptación de una cláusula de tipo *clickwrap*:

> Queda estrictamente prohibida la extracción masiva, crawling o scraping del catálogo mediante scripts o herramientas automatizadas.

## 3. Matriz Comparativa de Mecanismos Defensivos

| Mecanismo | Capa OSI / Nivel | Impacto UX | Falsos positivos | Dificultad |
|---|---|---:|---:|---:|
| Rate Limiting (Redis) | Capa 7 (Aplicación) | Nulo | Muy bajo | Baja |
| Firmado HMAC | Capa 7 (API REST) | Nulo | Nulo | Media |
| Huella TLS (JA3/JA4) | Capa 5/7 (Sesión/Aplicación) | Nulo | Bajo | Media |
| Turnstile / PoW | Capa 7 (Cliente JS) | Mínimo | Muy bajo | Media |
| Honeytokens | Capa 7 (Persistencia) | Nulo | Nulo | Baja |
| Términos y Condiciones (ToS) | Capa legal / contractual | Nulo | Nulo | Muy baja |

## 4. Estrategia Recomendada, Reglas de Negocio y Requisitos Funcionales

### Alineación con reglas de negocio (RN) y requisitos funcionales (RF)

Para asegurar la viabilidad del proyecto y el cumplimiento de las especificaciones del sistema, la arquitectura anti-scraping y de protección de datos se acopla formalmente a las reglas de negocio y requisitos funcionales:

- **RN-11 (Control y Modelo de Accesos - RBAC) y respaldo legal:** la seguridad perimetral se apoya en los Términos y Condiciones aceptados obligatoriamente durante el registro (RF-01.3). La API Go valida el modelo de accesos segmentando los perfiles:
  - **Guest / Invitado:** permisos limitados a la consulta y búsqueda del catálogo (RF-01.1 y RF-01.2). Está sujeto a tasas de transferencia estrictas por IP. Las acciones protegidas requieren autenticación.
  - **Usuario registrado:** autenticación obligatoria mediante Access Tokens (15 minutos de expiración) y Refresh Tokens (7 días de vigencia, con banderas HttpOnly y Secure). Permite acceder a la optimización de compras (RF-03.3) e interactuar con la IA de recetas (RF-02.2) bajo cuota estándar.
  - **Usuario colaborador:** acceso a cuotas extendidas de IA mediante la realización de misiones colaborativas de validación de precios y stock (RF-02.3 y RF-02.4).
  - **Super Admin / Admin:** permiso exclusivo para ejecutar la API piloto de web scraping (RF-01.5), homologar el catálogo (RF-04.2), gestionar fuentes (RF-04.4) y monitorear el dashboard de tasas de éxito y error de extracción (RF-04.3).
- **RN-14 (Capacidad de Procesamiento y Prevención DoS):** el motor de cálculo rechaza peticiones si la lista de productos excede la capacidad máxima de procesamiento configurada. Esta regla complementa la protección contra scrapers que intenten saturar la memoria del servidor (RF-07).
- **RN-01 (Vigencia de Precios) y RN-02 (Tratamiento de Stock):** los datos de precios e inventario extraídos mediante scraping cuentan con un período de frescura definido (RF-01.1). Superado este plazo o ante la ausencia comprobada de stock, el dato se invalida y bloquea.
- **RN-06 (Patrón Anti-Alucinación y Validación Backend):** en las consultas de recetas con IA (RF-02.2), la Etapa 2 (backend Python) valida la existencia real de stock en la base de datos antes de invocar el modelo generativo (Etapa 3). Si se detecta un quiebre de stock total, el backend aplica un cortocircuito que interrumpe la ejecución.
- **RN-00, RN-07, RN-08 y RN-22 (Motor de Optimización Logística):** la resolución de rutas óptimas mediante OpenTripPlanner y Google OR-Tools cruza precios y distancias (RF-03.3 y RF-04.1). La API que expone estos resultados está protegida por firmado HMAC para evitar la extracción sistemática de matrices de precios multitienda.

### Esquema de mitigación y sanción progresiva

1. **Exceso de tasa de solicitudes (RN-14):** respuesta HTTP `429 Too Many Requests`, indicando el tiempo de espera mediante la cabecera `Retry-After`.
2. **Anomalía de huella TLS o intento de extracción anónima (RN-11):** activación automática de un desafío Cloudflare Turnstile o redirección obligatoria al inicio de sesión.
3. **Activación de honeytoken, violación de ToS o acceso no autorizado a endpoints (RF-01.5):** bloqueo de la IP en el WAF durante 24 horas, revocación contractual del Refresh Token y alerta automática en el dashboard de monitoreo de administración (RF-04.3).
