# **Informe de Protección de Datos e Información del Usuario** 

Daniela Romero 

26 de agosto de 2026 

#### **Resumen** 

Este informe detalla la arquitectura de seguridad y la estrategia de protección de datos de la plataforma web de comparación de precios, asistencia de recetas por IA y optimización de rutas. Se definen los mecanismos de autenticación y autorización mediante OAuth 2.0, OIDC y RBAC, justificando la gestión de sesiones mediante un esquema dual de tokens (JWT de corta duración y Refresh Tokens rotatorios con renovación silenciosa). Asimismo, se detallan los mecanismos de cifrado en tránsito, reposo y gestión de secretos. 

## **1. Introducción y Requisitos de Seguridad** 

La plataforma desarrollada permite a los consumidores optimizar su presupuesto mediante la consulta de precios scrapeados en tiempo real, la generación de recetas vía IA y el cálculo de rutas eficientes. Al manipular datos de ubicación, patrones de consumo y credenciales, se vuelve imperativo definir una estrategia de seguridad robusta, gratuita y viable para un equipo universitario. 

## **2. Estrategia de Autenticación y Autorización** 

### **2.1. OAuth 2.0 + OpenID Connect (OIDC)** 

Se implementa OAuth 2.0 con OIDC para permitir el inicio de sesión mediante proveedores externos (Google). Esto delega la gestión de credenciales sensibles a infraestructuras consolidadas, reduciendo la superficie de ataque y simplificando el cumplimiento de privacidad. 

### **2.2. Control de Acceso Basado en Roles (RBAC)** 

Se establece una matriz de autorización segmentada en tres roles, validada mediante _middlewares_ en el servidor desarrollado en Go: 

1 

|**Rol**|**Descripción**|**Permisos y Casos de Uso**|
|---|---|---|
|**Guest**|Usuario no autenticado<br>(Invitado)|**CU-01:** Búsqueda y comparación de pre-<br>cios.**CU-02:**Consultas básicas al asisten-<br>te de recetas por IA (con _rate-limiting_).|
|**User**|Usuario<br>registrado<br>au-<br>tenticado|Todos los permisos de Guest + **CU-03:**<br>Listas de compras persistentes. **CU-04:**<br>Optimización de rutas de transporte.**CU-**<br>**05:** Historial y alertas.|
|**SuperAdmin**|Administrador del siste-<br>ma|Todos los permisos de User + **CU-06:**<br>Monitoreo del módulo de scraping. **CU-**<br>**07:** Auditoría y métricas de la API Go.|



Cuadro 1: Matriz de roles, permisos y casos de uso del sistema. 

## **3. Gestión de Tokens, Sesiones y Experiencia de Usuario** 

### **3.1. Mecanismo Dual: Access Token + Refresh Token Rotatorio** 

Para mitigar riesgos de secuestro de sesión ( _Session Hijacking_ ) sin perjudicar la usabilidad durante los desplazamientos de los usuarios, se adopta el estándar recomendado por OWASP: 

- **Access Token (JWT - Vida corta: 10 a 15 minutos):** Token firmado digitalmente por la API en Go. Autoriza las peticiones en los endpoints protegidos. Su corta duración minimiza la ventana de exposición en caso de interceptación. 

- **Refresh Token Rotatorio (Vida larga: 7 días):** Se almacena en el navegador mediante una cookie con los atributos `HttpOnly` , `Secure` y `SameSite=Strict` , imposibilitando su lectura mediante scripts maliciosos ( _XSS_ ). 

### **3.2. Garantía de Continuidad en Desplazamientos (Silent Refresh)** 

Dado que el traslado de un usuario hacia un supermercado puede demorar 20 minutos o más, la expiración del Access Token de 15 minutos **no interrumpe la sesión** : 

1. Cuando el Access Token expira durante el trayecto, la API en Go responde con un código `401 Unauthorized` . 

2. Un interceptor en el Frontend (React) captura la respuesta en segundo plano de forma imperceptible para el usuario. 

3. El Frontend utiliza la cookie del Refresh Token para solicitar automáticamente un nuevo Access Token. 

4. La sesión se mantiene activa indefinidamente durante las compras sin requerir que el usuario vuelva a ingresar sus credenciales. 

2 

## **4. Protección de Datos, Cifrado y Operación** 

### **4.1. Cifrado en Tránsito y Reposo** 

- **Cifrado en Tránsito (TLS/HTTPS):** Uso obligatorio de HTTPS mediante certificados gratuitos de Let’s Encrypt para cifrar todo el tráfico entre la aplicación web y los microservicios. 

- **Hashing de Contrase˜nas (Argon2id):** Para autenticación local opcional, se utiliza el algoritmo Argon2id, resistente a ataques por fuerza bruta mediante GPU/ASIC. 

### **4.2. Gestión de Secretos e Infraestructura** 

Todas las claves de firma JWT, secretos de OAuth e API Keys de proveedores de IA ( `GEMINI API` ~~`K`~~ `EY` , `GROQ API` ~~`K`~~ `EY` ) se gestionan exclusivamente mediante variables de entorno ( `.env` ) aisladas en los contenedores Docker, previniendo su fuga en repositorios de código. 

## **5. Conclusión** 

La estrategia presentada combina el cumplimiento de estándares internacionales de seguridad (OAuth 2.0, JWT, Argon2id) con la realidad operativa de un proyecto universitario. La implementación de la renovación silenciosa de tokens resuelve el problema de los tiempos de traslado del usuario, garantizando una experiencia fluida y protegida. 

## **Referencias** 

- [1] Hardt, D. (2012). _The OAuth 2.0 Authorization Framework_ . RFC 5749, IETF. `https: //datatracker.ietf.org/doc/html/rfc6749` 

- [2] OWASP Foundation. (2023). _JSON Web Token Cheat Sheet for Java and Go_ . OWASP Cheat Sheet Series. `https://cheatsheetseries.owasp.org/` 

- [3] Biryukov, A., Dinu, D., & Khovratovich, D. (2015). _Argon2: new generation for password hashing_ . Password Hashing Competition. 

- [4] National Institute of Standards and Technology (NIST). (2020). _Digital Identity Guidelines: Authentication and Lifecycle Management_ . NIST Special Publication 80063B. 

3 

