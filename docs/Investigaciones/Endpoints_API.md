Taller de Integración 

Vicente Matus 



<!-- Start of picture text -->
AB UNIVERSIDAD<br>N TEMUCOCATOLICA DE<br><!-- End of picture text -->

# **Documento de Sistematización: Endpoints API** 

Taller de Integración III 

**Integrantes:** Renato Carrasco Marcelo Matamala Vicente Matus Daniela Romero Fabian Sanchez Esban Vejar 

Septiembre de 2026 

1 

Taller de Integración 

Vicente Matus 

## **1. Especificación de Endpoints (API Gateway)** 

A continuación se detallan los endpoints RESTful expuestos por el API Gateway, el cual está desarrollado en **Golang** para garantizar alta concurrencia y bajo consumo de recursos. Estos servicios se comunican directamente con el Frontend (React) y están agrupados según el dominio lógico al que pertenecen y el actor que los consume. 

### **1.1. Módulo de Autenticación y Perfil Extendido** 

|**Método**|**Endpoint**|**Descripción**|**Actor**|
|---|---|---|---|
|**POST**|`/api/v1/auth/login`|Autenticación y generación<br>de JWT.|Usu. Reg.|
|**POST**|`/api/v1/auth/register`|Registro inicial en la plata-<br>forma.|Invitado|
|**POST**|`/api/v1/auth/forgot-pass`|`word`<br>Envío de correo para recu-<br>peración.|Invitado|
|**POST**|`/api/v1/admin/login`|Validación de credenciales<br>de administrador.|Super Admin|
|**GET**|`/api/v1/usuarios/me`|Obtiene perfil y preferencias<br>dietéticas.|Usu. Reg.|
|**POST**|`/api/v1/usuarios/me/dire`|`cciones`<br>Guarda ubicaciones geoes-<br>paciales frecuentes.|Usu. Reg.|
|**POST**|`/api/v1/usuarios/me/tran`|`sporte`<br>Configura rendimiento o ta-<br>rifa de pasaje.|Usu. Reg.|
|**POST**|`/api/v1/usuarios/me/tarj`|`etas`<br>Agrega tarjetas de fidelidad<br>(ej. Mi Club).|Usu. Reg.|



Cuadro 1: Endpoints de Identidad, Cuentas y Configuración de Perfil. 

2 

Taller de Integración 

Vicente Matus 

### **1.2. Módulo de Catálogo, IA y Recetas** 

|**Método**|**Endpoint**|**Descripción**|**Actor**|
|---|---|---|---|
|**GET**|`/api/v1/productos/search`|Búsqueda<br>parametrizada<br>(q, categoría).|Invitado|
|**GET**|`/api/v1/categorias`|Lista jerarquía de categorías<br>y marcas.|Invitado|
|**GET**|`/api/v1/sucursales`|Obtiene ubicaciones y hora-<br>rios de tiendas.|Invitado|
|**POST**|`/api/v1/ia/chat`|Prompt IA para sugerencias<br>y reemplazos.|Usu. Reg.|
|**POST**|`/api/v1/recetas`|Guarda receta sugerida por<br>la IA.|Usu. Reg.|



Cuadro 2: Endpoints de Catálogo e Inteligencia Artificial. 

### **1.3. Módulo de Listas y Optimización Espacial** 

|**Método**|**Endpoint**|**Descripción**|**Actor**|
|---|---|---|---|
|**GET**|`/api/v1/listas`|Obtiene todas las listas del<br>usuario.|Usu. Reg.|
|**POST**|`/api/v1/listas`|Crea una nueva lista de<br>compras vacía.|Usu. Reg.|
|**POST**|`/api/v1/listas/{id}/artic`|`ulos`<br>Añade o actualiza un pro-<br>ducto en la lista.|Usu. Reg.|
|**POST**|`/api/v1/rutas/optimizar`|Ejecuta matriz TSP y cálcu-<br>lo de ahorro.|Usu. Reg.|
|**GET**|`/api/v1/rutas/historial`|Obtiene ejecuciones de ru-<br>tas pasadas.|Usu. Reg.|



Cuadro 3: Endpoints de Listas de Compras y Motor Lógico. 

3 

Taller de Integración 

Vicente Matus 

### **1.4. Módulo de Administración (Panel Super Admin)** 

|**Método**|**Endpoint**|**Descripción**|**Actor**|
|---|---|---|---|
|**PUT**|`/api/v1/admin/fuentes`|Modificar estado de fuentes<br>de scraping.|Super Admin|
|**POST**|`/api/v1/admin/scraping/tr`|`igger`<br>Encolar tarea de extracción<br>asíncrona.|Super Admin|
|**GET**|`/api/v1/admin/usuarios`|Listado completo de cuentas<br>del sistema.|Super Admin|
|**PATCH**|`/api/v1/admin/usuarios/{i`|`d}`<br>Activar o desactivar cuenta<br>de usuario.|Super Admin|
|**POST**|`/api/v1/admin/productos/e`|`quivalencias`<br>Vincular productos para su<br>homologación.|Super Admin|
|**GET**|`/api/v1/admin/metrics`|Datos consolidados para el<br>Dashboard.|Super Admin|



Cuadro 4: Endpoints del Panel de Administración y Monitoreo. 

4 

