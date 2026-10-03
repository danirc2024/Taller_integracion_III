::: titlepage
**Marco Legal y Propuesta de
Términos y Condiciones de Uso de la
Plataforma RutaAhorro**
**Primera versión**
Daniela Romero
Renato Carrasco
Vicente Matus
Esban Vejar

*Documento de investigación y propuesta preliminar. Su contenido deberá
ser revisado jurídicamente antes de utilizarse como instrumento
contractual definitivo.*
:::

# Introducción

RutaAhorro es una plataforma web orientada a facilitar la comparación de
productos entre distintos supermercados, considerando tanto el precio de
los productos como el costo asociado al desplazamiento del usuario.

La plataforma concentra información proveniente de distintas fuentes
para permitir la consulta de productos, comparación de precios, gestión
de listas de compra, utilización de un asistente basado en Inteligencia
Artificial y, posteriormente, cálculo de alternativas de compra
considerando costos de desplazamiento.

Debido a que la plataforma concentra información estructurada y
procesada, existe el riesgo de que terceros intenten automatizar el
acceso a sus servicios con el objetivo de copiar masivamente el
catálogo, precios, disponibilidad, resultados de búsqueda u otra
información proporcionada por la API.

Por esta razón, la protección frente al scraping no debe depender de una
única medida. Se propone una estrategia de defensa por capas que combine
mecanismos técnicos, control de acceso, detección de comportamientos
automatizados y un marco contractual explícito.

# Objetivo del marco de protección

El objetivo de este documento es establecer una propuesta de mecanismos
destinados a:

- limitar la extracción automatizada y masiva de información desde
  RutaAhorro;
- proteger los puntos de acceso críticos de la plataforma;
- diferenciar el comportamiento de usuarios legítimos respecto de
  patrones automatizados o abusivos;
- restringir el acceso según el tipo de usuario;
- detectar intentos de extracción sistemática;
- establecer consecuencias frente al incumplimiento de las condiciones
  de uso;
- complementar las medidas técnicas mediante una base contractual y
  jurídica.

La estrategia propuesta no pretende garantizar que ningún mecanismo
automatizado pueda acceder a la plataforma. Su objetivo es aumentar el
costo y dificultad de la extracción masiva, detectar comportamientos
abusivos y limitar el impacto que estos puedan generar sobre el sistema.

# Marco jurídico aplicable

La estrategia anti-scraping debe distinguir entre las obligaciones
jurídicas aplicables a la plataforma y las medidas técnicas utilizadas
para proteger sus servicios.

## Ley N° 21.459: delitos informáticos

La Ley N° 21.459 regula conductas relacionadas con delitos informáticos,
incluyendo determinadas formas de acceso ilícito a sistemas
informáticos.

Para RutaAhorro, esta normativa resulta relevante principalmente desde
la perspectiva de la protección de los mecanismos de acceso y de la
diferenciación entre un acceso autorizado y uno realizado excediendo las
autorizaciones correspondientes.

Sin embargo, esta ley no debe interpretarse como una prohibición general
del scraping ni como una autorización general para extraer información
disponible públicamente. La aplicación de sus disposiciones dependerá de
las circunstancias concretas del acceso realizado.

Por esta razón, la plataforma deberá evitar presentar el scraping de
sitios externos como una actividad automáticamente ilícita y deberá
evaluar individualmente las condiciones aplicables a cada fuente.

## Ley N° 17.336: propiedad intelectual

La Ley N° 17.336 resulta relevante para distinguir entre los datos
individuales utilizados por RutaAhorro y los elementos que pueden
constituir una creación protegible.

La existencia de un precio, nombre de producto o característica
comercial no implica por sí sola que ese dato individual sea una obra
protegida por derecho de autor. Sin embargo, determinadas compilaciones,
estructuras, selecciones u organizaciones de información pueden
encontrarse protegidas cuando cumplen los requisitos establecidos por la
legislación.

Por lo tanto, la protección de RutaAhorro no debe basarse exclusivamente
en afirmar que todos los datos almacenados son propiedad intelectual de
la plataforma.

La protección debe considerar, entre otros elementos:

- software desarrollado por el equipo;
- interfaz y elementos originales de presentación;
- estructura y organización propia de la información;
- bases de datos y mecanismos de organización cuando corresponda;
- contenido original desarrollado para la plataforma;
- algoritmos, configuraciones y componentes internos que no sean
  públicos.

## Ley N° 19.628: protección de datos personales

La Ley N° 19.628 resulta relevante principalmente respecto de la
información asociada a los usuarios de RutaAhorro.

Los precios y características comerciales de productos no constituyen,
por regla general, datos personales por el solo hecho de ser publicados
por un supermercado. Sin embargo, RutaAhorro puede procesar información
asociada a sus usuarios, por ejemplo, cuentas, preferencias, listas de
compra o información utilizada durante determinadas operaciones.

Por esta razón, los Términos y Condiciones deberán complementarse con
una política de privacidad independiente.

## Ley N° 19.496: protección de los consumidores

La normativa de protección al consumidor resulta relevante para la forma
en que RutaAhorro presenta información comercial, precios, condiciones
de utilización y contratación electrónica.

Los Términos y Condiciones deberán ser presentados de forma clara,
accesible y previa a la aceptación del usuario cuando correspondan a
condiciones contractuales.

La normativa no debe interpretarse como una autorización automática para
realizar scraping de sitios de terceros.

# Aceptación de los Términos y Condiciones

Se propone utilizar un mecanismo de aceptación explícita del tipo
*clickwrap*.

Durante el registro de una cuenta, el usuario deberá visualizar un
enlace a los Términos y Condiciones y aceptar expresamente su contenido
mediante una casilla de verificación.

La aceptación deberá quedar asociada, cuando técnicamente sea posible,
a:

- identificador de la cuenta;
- fecha y hora de aceptación;
- versión de los Términos y Condiciones;
- versión de la Política de Privacidad correspondiente;
- registro técnico necesario para acreditar la aceptación.

Este mecanismo resulta preferible al denominado *browsewrap*, donde las
condiciones se consideran aceptadas únicamente por navegar por el sitio.

# Estrategia técnica de protección frente al scraping

La protección propuesta para RutaAhorro se estructura en distintas
capas. Estas medidas no cumplen exactamente la misma función: algunas
previenen, otras dificultan, otras detectan y otras permiten responder
ante comportamientos abusivos.

  **Mecanismo**                 **Función principal**                      **Tipo de protección**

---

  Rate Limiting                 Limitar cantidad de solicitudes            Prevención
  HMAC                          Proteger determinados endpoints            Autenticación / integridad
  JA3/JA4 y Fingerprinting      Detectar clientes o patrones sospechosos   Detección
  Turnstile / CAPTCHA           Verificar sesiones sospechosas             Mitigación
  Canary Tokens / Honeytokens   Detectar extracción automatizada           Detección
  Términos y Condiciones        Establecer prohibiciones contractuales     Protección jurídica
  RBAC                          Limitar funcionalidades según el rol       Control de acceso

  : Capas propuestas de protección anti-scraping.

## Rate Limiting mediante ventana deslizante

El *Rate Limiting* constituye una de las principales medidas preventivas
para evitar que un cliente realice una cantidad excesiva de solicitudes
en un período corto.

Se propone utilizar un algoritmo de ventana deslizante (*Sliding
Window*) utilizando Redis como almacén distribuido de contadores.

Las solicitudes pueden asociarse a distintos identificadores,
dependiendo del contexto:

- dirección IP;
- token de autenticación;
- identificador de usuario;
- cliente o sesión.

Por ejemplo, si un endpoint tiene configurado un límite de 60
solicitudes por minuto y el cliente supera dicho límite, el sistema
puede responder con:

    HTTP 429 Too Many Requests
    Retry-After: 30

Los límites definitivos deberán determinarse posteriormente mediante
pruebas de carga y análisis del comportamiento esperado de los usuarios.

Esta medida se relaciona directamente con RNF-12, que establece que el
sistema deberá proteger los puntos de acceso críticos frente a intentos
reiterados de acceso automatizado o ataques de fuerza bruta.

## Autenticación y firmado de solicitudes mediante HMAC

Para determinados endpoints sensibles puede utilizarse un mecanismo de
firmado HMAC-SHA256.

La solicitud puede incluir información como:

- método HTTP;
- ruta solicitada;
- timestamp;
- nonce;
- otros parámetros relevantes.

El servidor verifica posteriormente la firma antes de procesar la
solicitud.

Un esquema conceptual sería:

    HMAC-SHA256(
        secret,
        method + path + timestamp + nonce
    )

El timestamp y el nonce permiten incorporar mecanismos destinados a
evitar la reutilización de solicitudes previamente capturadas.

No obstante, este mecanismo no debe considerarse una protección absoluta
contra scraping. Si una aplicación cliente necesita disponer de un
secreto para generar las firmas, dicho secreto debe considerarse
potencialmente recuperable por un atacante con suficiente capacidad.

Por esta razón, HMAC se propone como una capa complementaria para
endpoints específicos y no como sustituto de autenticación, control de
acceso y rate limiting.

## Fingerprinting TLS y comportamiento HTTP

Otra capa de detección consiste en analizar características del cliente
durante el establecimiento de la conexión y las solicitudes HTTP.

Entre las señales que pueden utilizarse se encuentran:

- huellas TLS como JA3 o JA4;
- características de HTTP/2;
- User-Agent;
- frecuencia de solicitudes;
- secuencia de endpoints consultados;
- patrones temporales de las solicitudes.

Por ejemplo, una solicitud que declara corresponder a un navegador
convencional pero presenta características compatibles con una
biblioteca automatizada puede clasificarse como tráfico de mayor riesgo.

Esta técnica no debe utilizarse como prueba absoluta de que un cliente
es un scraper, ya que las huellas pueden modificarse o compartirse entre
distintos clientes.

Por ello, su utilización se propone como una señal adicional para
alimentar las reglas del WAF o del sistema de detección.

## Desafíos conductuales y CAPTCHA invisible

Ante comportamientos considerados sospechosos, RutaAhorro puede
incorporar mecanismos como Cloudflare Turnstile u otros sistemas de
validación equivalentes.

La idea consiste en no imponer una prueba adicional a todos los
usuarios, sino solicitar una validación adicional cuando el sistema
detecte señales de automatización.

Por ejemplo, una combinación de:

- alta frecuencia de solicitudes;
- navegación poco compatible con el comportamiento normal;
- múltiples solicitudes en intervalos extremadamente regulares;
- ausencia de determinadas características esperadas del cliente;

podría aumentar el nivel de validación requerido.

El objetivo es agregar fricción al tráfico automatizado sin afectar
innecesariamente a los usuarios legítimos.

## Canary Tokens y Honeytokens

Los *Canary Tokens* o *Honeytokens* constituyen una medida de detección
activa.

Consisten en elementos especialmente preparados para permitir detectar
comportamientos que normalmente no deberían producirse durante una
utilización legítima de la plataforma.

Por ejemplo, podría existir un identificador o recurso interno que no
sea necesario para la navegación normal del usuario. Si dicho recurso es
solicitado de forma inesperada, el sistema puede registrar el evento
como una señal de posible extracción automatizada.

Una implementación de este tipo debe diseñarse cuidadosamente para
evitar que el mecanismo interfiera con usuarios legítimos o exponga
información interna.

Por esta razón, se recomienda utilizar estos elementos principalmente
como mecanismo de detección y generación de alertas, y no como único
criterio para bloquear automáticamente una dirección IP.

## Términos y Condiciones como barrera jurídica

Las medidas técnicas anteriores deben complementarse con Términos y
Condiciones de Uso que establezcan explícitamente las actividades
prohibidas.

Entre ellas se propone incluir:

- extracción masiva de información;
- utilización de bots, crawlers o scrapers para obtener información de
  RutaAhorro;
- automatización de consultas fuera de los mecanismos proporcionados por
  la plataforma;
- extracción sistemática de catálogos;
- extracción sistemática de precios o disponibilidad;
- utilización abusiva de los endpoints;
- intento de eludir mecanismos de autenticación, autorización o
  limitación de solicitudes;
- ingeniería inversa destinada a obtener o reconstruir componentes
  internos protegidos, salvo cuando la legislación aplicable establezca
  una excepción.

La aceptación de estas condiciones deberá realizarse mediante un
mecanismo explícito durante el registro cuando corresponda.

Los Términos y Condiciones no sustituyen las medidas técnicas. Su
función es establecer claramente las condiciones bajo las cuales se
permite utilizar el servicio y proporcionar un marco contractual para
responder ante incumplimientos.

# Control de acceso según tipo de usuario

La protección anti-scraping debe integrarse con el modelo de acceso
definido por RN-11.

Actualmente la documentación del proyecto contempla distintos actores
con diferentes niveles de acceso.

La ejecución del scraping de las fuentes externas corresponde a una
funcionalidad administrativa. En los requerimientos actuales, RF-01.5
establece esta operación para el Super Admin.
:contentReference\[oaicite:3\]index=3

De esta forma, un usuario normal no debería disponer de los permisos
necesarios para ejecutar directamente los mecanismos internos de
extracción.

# Protección de endpoints y API

Los endpoints de RutaAhorro deberán clasificarse según su nivel de
sensibilidad.

Se propone diferenciar:

1. endpoints públicos de consulta;
2. endpoints que requieren autenticación;
3. endpoints asociados a funcionalidades de usuario;
4. endpoints administrativos;
5. endpoints internos entre servicios.

Los endpoints administrativos e internos no deberán exponerse
innecesariamente a Internet.

Además, los límites de solicitudes deberán ser diferentes según el tipo
de operación.

Por ejemplo, una consulta individual de producto no necesariamente
debería tener el mismo límite que una operación de búsqueda compleja o
un cálculo de optimización.

Esta separación permite proteger los recursos más costosos sin
perjudicar las operaciones normales.

# Esquema de mitigación y respuesta

La respuesta frente a comportamiento sospechoso deberá ser progresiva.

Se propone el siguiente esquema conceptual:

1. **Exceso de solicitudes:** aplicar Rate Limiting y responder
   mediante HTTP 429 cuando corresponda.
2. **Comportamiento sospechoso:** aumentar el nivel de validación y,
   cuando corresponda, solicitar una validación adicional mediante
   Turnstile u otro mecanismo equivalente.
3. **Persistencia del comportamiento:** registrar el evento, aumentar
   las restricciones y limitar temporalmente el acceso.
4. **Intento de acceso no autorizado:** rechazar la solicitud y
   registrar el evento de seguridad.
5. **Violación de los Términos y Condiciones:** suspender o revocar las
   credenciales correspondientes de acuerdo con las condiciones
   establecidas y la legislación aplicable.
6. **Detección mediante Honeytoken:** generar una alerta y realizar una
   evaluación antes de aplicar medidas de bloqueo permanentes.

Un bloqueo automático permanente basado únicamente en una señal
individual no se recomienda, debido al riesgo de falsos positivos.

# Relación con las Reglas de Negocio y Requisitos

La estrategia propuesta se relaciona directamente con los requisitos
existentes del proyecto.

  **ID**    **Elemento**                            **Relación con anti-scraping**

---

  RN-11     Control de acceso y modelo de usuario   Define las funcionalidades disponibles según el tipo de usuario y restringe las operaciones que requieren autenticación.
  RN-14     Capacidad de procesamiento              Permite limitar operaciones que superen la capacidad de procesamiento configurada.
  RNF-11    Transmisión segura                      Protege las comunicaciones entre cliente y servidor.
  RNF-12    Protección frente a automatización      Establece directamente la necesidad de proteger puntos críticos frente a intentos automatizados reiterados.
  RF-01.3   Gestión de credenciales                 Permite implementar autenticación y control de acceso.
  RF-01.5   Ejecutar Web Scraping                   Restringe la ejecución del proceso de extracción a las funciones administrativas definidas.
  RF-04.3   Monitoreo del sistema                   Permite visualizar indicadores relacionados con el funcionamiento del scraping y otros componentes.
  RF-04.4   Gestión de fuentes y usuarios           Permite administrar fuentes de información y cuentas según los permisos definidos.

Los requerimientos del proyecto establecen que RNF-12 debe proteger los
puntos de acceso críticos frente a intentos reiterados de acceso
automatizado.

Asimismo, RF-04.3 contempla un panel de monitoreo relacionado con la
tasa de éxito y error del scraping, mientras RF-04.4 contempla la
gestión de fuentes y usuarios.

# Protección de los resultados de optimización

Además del catálogo, RutaAhorro genera resultados procesados por su
propia lógica, incluyendo alternativas de compra que consideran
productos, precios y costos de desplazamiento.

La plataforma define como objetivo que la alternativa de compra minimice
el costo total considerando estas variables.

Por esta razón, determinados endpoints relacionados con la optimización
podrían requerir mecanismos adicionales de protección, especialmente
cuando una consulta implique un procesamiento costoso.

El rate limiting y los límites de tamaño de entrada permiten reducir el
riesgo de que estos servicios sean utilizados para generar una carga
excesiva sobre el sistema.

# Scraping de fuentes externas

Debe distinguirse entre:

1. proteger RutaAhorro frente al scraping realizado por terceros; y
2. realizar scraping desde RutaAhorro hacia sitios de terceros.

El hecho de que RutaAhorro establezca mecanismos anti-scraping no
significa que pueda aplicar exactamente las mismas reglas a todas las
fuentes externas.

Para cada fuente deberán evaluarse individualmente aspectos como:

- condiciones de uso del sitio;
- existencia de autenticación;
- mecanismos técnicos destinados a impedir accesos automatizados;
- frecuencia de actualización;
- cantidad de solicitudes necesarias;
- estabilidad del método de extracción;
- información estrictamente necesaria para el funcionamiento de
  RutaAhorro.

La propia documentación del proyecto ya establece que el módulo de
extracción debe incorporar pausas entre solicitudes y buenas prácticas
para evitar sobrecargar los servidores de los supermercados.

Por tanto, el diseño del scraping de RutaAhorro debe considerar tanto la
necesidad de obtener información como el impacto generado sobre las
fuentes consultadas.

# Precios, disponibilidad y actualización

La información utilizada por RutaAhorro se encuentra sujeta a cambios,
especialmente en materia de precios, promociones y disponibilidad.

RN-01 establece que los precios obtenidos desde las fuentes tendrán un
período de vigencia determinado y que, una vez superado, dejarán de
considerarse vigentes. RN-02 establece que los productos sin
disponibilidad no podrán utilizarse como alternativas válidas de compra.

Por esta razón, se propone incorporar en los Términos y Condiciones un
aviso indicando que:

> Los precios, promociones y disponibilidad mostrados por RutaAhorro
> corresponden a información recopilada y procesada desde las fuentes
> integradas a la plataforma. Debido a que dicha información puede
> cambiar, el precio y disponibilidad efectivos corresponden a los
> informados por el establecimiento al momento de realizar la compra.
> RutaAhorro no garantiza que una promoción, precio o disponibilidad se
> mantenga sin modificaciones después de su actualización.

Este aviso deberá complementar, y no sustituir, los mecanismos de
validación y vigencia definidos por el sistema.

# Propuesta de cláusula anti-scraping

Como base para una futura versión de los Términos y Condiciones se
propone la siguiente cláusula:

> **Uso automatizado y extracción de información.**
>
> Queda prohibido utilizar robots, bots, crawlers, scrapers, scripts,
> herramientas automatizadas o mecanismos equivalentes para realizar
> extracciones masivas o sistemáticas de información desde RutaAhorro,
> salvo cuando dicha actividad haya sido expresamente autorizada por la
> plataforma.
>
> La prohibición comprende, entre otras actividades, la extracción
> automatizada de catálogos, precios, disponibilidad, identificadores,
> resultados de búsqueda, metadatos, endpoints o información
> estructurada generada o proporcionada por la plataforma.
>
> También queda prohibido intentar eludir o desactivar mecanismos de
> autenticación, autorización, limitación de solicitudes o controles de
> seguridad implementados por RutaAhorro.
>
> El incumplimiento de estas condiciones podrá dar lugar a medidas
> técnicas y contractuales, incluyendo limitación de solicitudes,
> suspensión o revocación de credenciales, bloqueo temporal de acceso y
> otras medidas permitidas por la legislación aplicable.

La redacción definitiva deberá ser revisada jurídicamente antes de su
implementación.

# Estructura propuesta para los Términos y Condiciones

La versión definitiva de los Términos y Condiciones podría organizarse
de la siguiente manera:

1. Identificación del proveedor y descripción del servicio.
2. Definiciones.
3. Aceptación de los Términos y Condiciones.
4. Registro y gestión de cuentas.
5. Tipos de usuarios y permisos.
6. Uso permitido de la plataforma.
7. Uso automatizado y política anti-scraping.
8. Límites de utilización de la API.
9. Propiedad intelectual y elementos protegibles.
10. Información proveniente de terceros.
11. Funcionamiento del asistente de Inteligencia Artificial.
12. Precios, promociones y disponibilidad.
13. Resultados de optimización y rutas.
14. Limitaciones de responsabilidad.
15. Suspensión y terminación de cuentas.
16. Medidas frente al incumplimiento.
17. Modificaciones de los Términos.
18. Política de privacidad.
19. Legislación aplicable y jurisdicción.
20. Información de contacto.

# Conclusiones

La protección de RutaAhorro frente al scraping requiere una estrategia
combinada y no una única herramienta.

El Rate Limiting constituye una primera barrera para limitar la cantidad
de solicitudes. La autenticación y el control de acceso restringen las
funcionalidades disponibles según el tipo de usuario. Los mecanismos de
fingerprinting permiten identificar señales de automatización, mientras
que herramientas como Turnstile pueden introducir una validación
adicional ante comportamientos sospechosos.

Por otra parte, los Canary Tokens y Honeytokens pueden utilizarse como
mecanismos de detección, mientras que los Términos y Condiciones
establecen las reglas contractuales que determinan qué usos están
permitidos.

Esta estrategia se encuentra alineada con RN-11 y RNF-12, que establecen
respectivamente el control de acceso según el tipo de usuario y la
protección de puntos críticos frente a accesos automatizados reiterados.

Finalmente, debe distinguirse entre la protección de la propia
plataforma frente a terceros y el scraping realizado por RutaAhorro
sobre fuentes externas. Este último deberá evaluarse individualmente
para cada fuente, considerando sus condiciones de acceso, mecanismos
técnicos y requisitos legales aplicables.

La estrategia propuesta constituye una primera base técnica y jurídica
para el proyecto y deberá ser validada posteriormente mediante pruebas
de seguridad, pruebas de carga y revisión jurídica especializada.

# Referencias

1. Biblioteca del Congreso Nacional de Chile. *Ley N° 21.459: Establece
   normas sobre delitos informáticos, deroga la Ley N° 19.223 y
   modifica otros cuerpos legales con el objeto de adecuarlos al
   Convenio de Budapest.*
2. Biblioteca del Congreso Nacional de Chile. *Ley N° 17.336 sobre
   Propiedad Intelectual.*
3. Biblioteca del Congreso Nacional de Chile. *Ley N° 19.628 sobre
   Protección de la Vida Privada.*
4. Biblioteca del Congreso Nacional de Chile. *Ley N° 19.496: Establece
   normas sobre protección de los derechos de los consumidores.*
5. Biblioteca del Congreso Nacional de Chile. *Ley N° 19.799 sobre
   documentos electrónicos, firma electrónica y servicios de
   certificación de dicha firma.*
6. Documentación técnica del proyecto RutaAhorro. *Requerimientos
   Funcionales, Reglas de Negocio y Requerimientos No Funcionales.*
