Taller de Integración 

Vicente Matus 



<!-- Start of picture text -->
AB UNIVERSIDAD<br>N TEMUCOCATOLICA DE<br><!-- End of picture text -->

# **Documento de Sistematización: Requerimientos Funcionales** 

Taller de Integración 

**Integrantes:** Renato Carrasco Marcelo Matamala Vicente Matus Daniela Romero Fabian Sanchez Esban Vejar 

Septiembre de 2026 

1 

Taller de Integración 

Vicente Matus 

## **Índice** 

**1. Requerimientos Funcionales (RF) 1** 1.1. MVP Etapa 1: Catálogo, Autenticación y Listas (Sprints 1 y 2) . . . . . . 1 1.2. MVP Etapa 2: Motor de Optimización y Administración (Sprints 3 y 4) . . 2 

i 

Taller de Integración 

Vicente Matus 

## **1. Requerimientos Funcionales (RF)** 

Los requerimientos funcionales han sido definidos asegurando una trazabilidad estricta con las Reglas de Negocio (RN) y el Diagrama de Casos de Uso. Todo el ciclo de desarrollo a lo largo de los 4 Sprints constituye la construcción del **Producto Mínimo Viable (MVP)** , asumiendo integración continua entre Frontend y Backend. 

**_Nota de Herencia y Control de Acceso (RN-11):_** El actor _Usuario registrado_ hereda de forma implícita todos los permisos de lectura e interacción del actor _Invitado_ . A su vez, el _Usuario Colaborador_ hereda todas las capacidades del _Usuario registrado_ . 

### **1.1. MVP Etapa 1: Catálogo, Autenticación y Listas (Sprints 1 y 2)** 

Esta etapa consolida la base de datos, el acceso seguro, la gestión del perfil (incluyendo restricciones alimentarias), la interacción inicial con el asistente de Inteligencia Artificial y el sistema de misiones crowdsourced. 

1 

Taller de Integración 

Vicente Matus 

|**ID**|**Acción / Nom-**<br>**bre**|**Descripción de la Funcio-**<br>**nalidad y Trazabilidad**|**Sprint**|**Actor**|
|---|---|---|---|---|
|**RF-01.1**|Buscar<br>y<br>filtrar<br>catálogo|Buscar productos y aplicar fil-<br>tros básicos. El sistema oculta-<br>rá ítems que superen el período<br>de vigencia (RN-01).|1|Invitado|
|**RF-01.2**|Consultar catálo-<br>go y redirigir|Mostrar vista individual del<br>producto (precio, formato) y<br>proveer enlace directo a la<br>fuente.|1|Invitado|
|**RF-01.3**|Gestión<br>de<br>cre-<br>denciales|Registro de cuenta, inicio de<br>sesión seguro y flujo de recu-<br>peración de contraseña.|1|Invitado,<br>Usu. Reg.|
|**RF-01.4**|Configurar prefe-<br>rencias|Elegir y modificar preferencias<br>dietéticas en el perfil para aco-<br>tar sugerencias futuras.|1|Invitado,<br>Usu. Reg.|
|**RF-01.5**|Ejecutar<br>Web<br>Scraping|Accionar la API Piloto para<br>extracción de precios en tiem-<br>po real.|1|Super Admin|
|**RF-02.1**|Guardar elemen-<br>tos|Crear listas y añadir ítems. El<br>sistema excluirá productos sin<br>stock (RN-02).|2|Usuario regis-<br>trado|
|**RF-02.2**|Asistente IA (Re-<br>cetas)|Recibir solicitudes de recetas<br>y filtrar resultados según el<br>perfil dietético del usuario. El<br>backend validará el stock real<br>(RN-06).|2|Usuario regis-<br>trado|
|**RF-02.3**|Completar misio-<br>nes de validación|Reportar la fidelidad de pre-<br>cios, stock o costos logísticos<br>tras una compra, acumulando<br>puntos para la IA (RN-25, RN-<br>26).|2|Usu. Colabo-<br>rador|
|**RF-02.4**|Consultar estado<br>de colaborador|Panel para revisar nivel de mi-<br>siones, tiempo de vigencia res-<br>tante y saldo de tokens de IA<br>disponibles (RN-25).|2|Usu. Colabo-<br>rador|



Cuadro 1: Requerimientos Funcionales - MVP Sprints 1 y 2. 

### **1.2. MVP Etapa 2: Motor de Optimización y Administración (Sprints 3 y 4)** 

Esta etapa despliega el núcleo matemático (cruzando logística y finanzas) y proporciona al administrador las herramientas de monitoreo y homologación de datos. 

2 

Taller de Integración 

Vicente Matus 

|**ID**|**Acción / Nom-**<br>**bre**|**Descripción de la Funcio-**<br>**nalidad y Trazabilidad**|**Sprint**|**Actor**|
|---|---|---|---|---|
|**RF-03.1**|Configurar trasla-<br>do|Seleccionar medio de trasla-<br>do y definir costo/rendimiento<br>para la conversión monetaria<br>(RN-22).|3|Usuario regis-<br>trado|
|**RF-03.2**|Definir ubicación|Ingresar, validar la ubicación<br>inicial y definir el rango a re-<br>correr.|3|Usuario regis-<br>trado|
|**RF-03.3**|Optimizar ruta de<br>compra|Minimizar la función de costo<br>total sugiriendo la compra en<br>tienda única o multitienda, su-<br>jeta al monto mínimo y ahorro<br>(RN-00, RN-08).|3|Usuario regis-<br>trado|
|**RF-03.4**|Ver<br>horarios<br>de<br>tiendas|Visualizar los horarios de aper-<br>tura y cierre de las sucursales<br>involucradas en la ruta.|3|Usuario regis-<br>trado|
|**RF-04.1**|Mostrar<br>resulta-<br>dos|Desplegar la alternativa sugi-<br>riendo el desglose de productos<br>y la ruta en un mapa.|4|Usuario regis-<br>trado|
|**RF-04.2**|Homologar<br>catá-<br>logo|Definir igualdad entre produc-<br>tos de distintas fuentes pa-<br>ra permitir la comparación de<br>precios.|4|Super Admin|
|**RF-04.3**|Monitoreo del sis-<br>tema|Visualizar dashboard con la ta-<br>sa de éxito/error de scraping,<br>uso de tokens IA, ahorro pro-<br>medio y productos más agre-<br>gados.|4|Super Admin|
|**RF-04.4**|Gestión de fuen-<br>tes y usuarios|Agregar, eliminar o actualizar<br>fuentes de scraping. Desacti-<br>var, activar y listar cuentas<br>(RN-11).|4|Super Admin|



Cuadro 2: Requerimientos Funcionales - MVP Sprints 3 y 4. 

3 

