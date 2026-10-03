# **Propuesta de Arquitectura y Análisis Tecnológico** Plataforma de Ahorro y Optimización de Compras en Supermercados 

Asignatura: Taller de Integración 

**Equipo de Desarrollo** (6 Integrantes) Metodología Scrum — 20 horas/persona por Sprint (120 hrs/sprint total) 

8 de septiembre de 2026 

##### **Resumen** 

Este documento presenta la propuesta técnica y arquitectónica para el desarrollo de un sistema web orientado al ahorro en supermercados, integración de recetas con inteligencia artificial (IA), comparación de precios mediante _web scraping_ y optimización de rutas de compra. Se detalla una arquitectura basada en microservicios contenedorizados con Docker, dise˜nada estratégicamente para maximizar la productividad de un equipo de 6 integrantes bajo la metodología Scrum. Adicionalmente, se incluye un análisis comparativo exhaustivo de ventajas y desventajas tecnológicas abarcando el _Frontend_ , _Backend_ , Bases de Datos y herramientas de _Scraping_ . 

**Índice** 

|**1. Introducción y Alcance del Proyecto**|**2**|
|---|---|
|**2. Arquitectura de Microservicios y Docker**|**2**|
|2.1. Distribución de Servicios . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . .<br>2|
|2.2. Infraestructura en Docker . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . .<br>2|
|**3. Análisis Comparativo de Tecnologías**|**3**|
|3.1. Frontend (Interfaz de Usuario)<br>. . . . . . . . . . . . . . . . . . .|. . . . . . . . .<br>3|
|3.2. Backend y APIs. . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . .<br>3|
|3.3. Bases de Datos . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . .<br>3|
|3.4. Herramientas de Web Scraping . . . . . . . . . . . . . . . . . . .|. . . . . . . . .<br>4|
|**4. Planificación de Sprints en Scrum (Roadmap)**|**4**|
|**5. Conclusión**|**4**|



1 

## **1 Introducción y Alcance del Proyecto** 

El proyecto tiene como objetivo resolver la problemática de dispersión de precios e ineficiencia en las compras de supermercado. La solución integra: 

- **Web Scraping:** Extracción automatizada de productos, precios y ofertas desde múltiples supermercados. 

- **Asistente de IA:** Generación de recetas personalizadas y recomendación de canastas de compra optimizadas. 

- **Optimización de Rutas y Costos:** Algoritmo para determinar la combinación óptima de supermercados y la ruta geográfica más conveniente. 

**Autenticación SSO:** Inicio de sesión simplificado a través de Google OAuth 2.0. 

Dado el límite de tiempo de **20 horas por persona por sprint** (120 horas efectivas por mes para el equipo), la arquitectura debe priorizar la modularidad, el desacoplamiento y la velocidad de desarrollo. 

## **2 Arquitectura de Microservicios y Docker** 

Para evitar conflictos de integración ( _git merge conflicts_ ) y permitir que los 6 integrantes trabajen en paralelo, se adopta una arquitectura de microservicios desacoplados. 

### **2.1 Distribución de Servicios** 

1. **API Gateway / Router:** Punto de entrada único. Gestiona el enrutamiento de peticiones, validación de tokens JWT y CORS. 

2. **Servicio de Autenticación y Usuarios (** `auth-service` **):** Gestión de perfiles, integración con Google SSO y almacenamiento de listas de compras de usuarios. 

3. **Servicio de Catálogo y Scraping (** `catalog-service` **):** Ejecución de tareas asíncronas para la extracción e historial de precios de supermercados. 

4. **Servicio de Inteligencia Artificial (** `ai-service` **):** Conexión con LLM (OpenAI / Gemini) para interpretar solicitudes de recetas y estructurar listas de productos. 

5. **Servicio de Optimización de Rutas (** `route-service` **):** Algoritmos de optimización (ej. Problema del Vendedor Viajero / TSP) para calcular el menor costo monetario y de transporte. 

### **2.2 Infraestructura en Docker** 

Toda la aplicación se despliega mediante `docker-compose` , garantizando entornos de desarrollo idénticos para todo el equipo. 

|`/proyecto -integracion`|
|---|
|`docker -compose.yml`|
|`api -gateway/`|
|`service -auth/`|
|`service -catalog/`|
|`service -ai/`|
|`service -routes/`|



2 

## **3 Análisis Comparativo de Tecnologías** 

A continuación, se evalúan las alternativas tecnológicas considerando el balance entre curva de aprendizaje, velocidad de implementación y mantenibilidad. 

### **3.1 Frontend (Interfaz de Usuario)** 

|**Tecnología**|**Ventajas**|**Desventajas**|
|---|---|---|
|**React / Vue.js**|||
||Interfaz rica, dinámica e in-<br>teractiva (SPA).<br>Componentización y amplio<br>ecosistema.<br>Estándar de la industria.|Mayor tiempo de configura-<br>ción inicial (CORS, gestión<br>de estado).<br>Curva de aprendizaje si el<br>equipo no lo domina.|
|**Django Templates + HTMX**|Desarrollo ultra rápido en<br>Python.<br>Cero complejidad de build<br>tools JS.<br>Integración nativa con la au-<br>tenticación.|Menos adecuado para compo-<br>nentes de mapas interactivos<br>muy complejos.<br>Renderizado del lado del ser-<br>vidor.|
|**Streamlit / Dash**|100 % Python, prototipado<br>en horas.<br>Ideal para dashboards rápi-<br>dos.|Muy rígido visualmente.<br>Dificultad para integrar Goo-<br>gle SSO nativo y flujos com-<br>plejos de cliente.|



Cuadro 1: Comparativa de alternativas de Frontend. 

**Recomendación de Frontend:** Si el equipo tiene experiencia previa en JavaScript, utilizar **React / Vue.js** separado. Si el tiempo de entrega es muy ajustado, **Django Templates + HTMX** permitirá entregar un producto completamente funcional dentro de las 20 horas por sprint. 

### **3.2 Backend y APIs** 

**Recomendación de Backend:** Usar **FastAPI** para los microservicios de IA, Rutas y Catalog, y **Django** (o FastAPI) para el servicio de Autenticación e integración de Google SSO. 

### **3.3 Bases de Datos** 

**PostgreSQL (Relacional) —** **_Opción Recomendada_ :** 

- _Ventajas:_ Excelente soporte para transacciones relacionales, integración con ORMs de Python y soporte de la extensión **PostGIS** para cálculos geoespaciales y rutas de supermercados. 

- _Desventajas:_ Esquema estricto que requiere migraciones bien planificadas. 

#### **MongoDB (NoSQL):** 

3 

|**Tecnología**|**Ventajas**|**Desventajas**|
|---|---|---|
|**FastAPI**|||
||Asíncrono, de altísimo rendimiento.<br>Documentación automática (OpenA-<br>PI/Swagger).|Requiere configurar manualmente el<br>ORM y autenticación.|
||Ideal para microservicios.||
|**Django / DRF**|||
||”Baterías incluidas”(ORM, Admin,<br>SSO).<br>Estructura rígida que previene desor-<br>den.|Más pesado que FastAPI.<br>Curva de aprendizaje del ORM es-<br>pecífico.|
|**Flask**|||
||Súper liviano y flexible.<br>Facilidad de inicio.|Falta de convenciones; propenso a<br>desorganización en equipos de 6 per-<br>sonas.|



Cuadro 2: Comparativa de alternativas de Backend. 

- _Ventajas:_ Esquema flexible, útil para datos no estructurados provenientes del web scraping. 

- _Desventajas:_ Menor eficiencia en consultas relacionales complejas entre usuarios, listas de compras y supermercados. 

### **3.4 Herramientas de Web Scraping** 

   - **BeautifulSoup + Requests:** Ligero y rápido, pero ineficaz ante sitios renderizados dinámicamente con JavaScript. 

   - **Scrapy:** Framework completo e industrial para scraping masivo asíncrono. Ideal para el `catalog-service` . 

   - **Playwright / Selenium:** Permite automatizar navegadores reales para superar bloqueos y dinámicas complejas con JavaScript, aunque consume más recursos en servidor. 

- **4 Planificación de Sprints en Scrum (Roadmap)** 

Para optimizar las **120 horas/hombre totales por Sprint**, se propone la siguiente división: 

## **5 Conclusión** 

La combinación de una arquitectura de microservicios contenerizada con Docker, la velocidad de desarrollo de FastAPI/Django, y la potencia de PostgreSQL representa la mejor estrategia tecnológica para el proyecto. Esta propuesta garantiza que el equipo pueda avanzar de manera autónoma y paralela, respetando estrictamente la carga horaria presupuestada por Sprint. 

4 

|**Sprint**|**Objetivo Principal**|**Entregables Claves**|
|---|---|---|
|**Sprint 1**|Infraestructura y MVP Base|Configuración de Docker Compose y repositorios Git.<br>`auth-service` con Google SSO.<br>Scraper inicial para 1 supermercado.|
|**Sprint 2**|Integración de IA y Catálogo|Base de datos de catálogo unificada.<br>`ai-service` para consulta de recetas y generación de<br>listas.|
|||Interfaz web base integrada con el Gateway.|
|**Sprint 3**|Optimización y Pulido|`route-service` implementando algoritmo TSP / opti-<br>mización de costos.|
|||Pruebas de integración finales y despliegue del prototi-<br>po.|



Cuadro 3: Roadmap propuesto para los Sprints de Scrum. 

5 

