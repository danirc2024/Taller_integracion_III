Especificación Formal de Reglas de Negocio 

V1.3 - Sprint 0 

# **Especificación Formal de Reglas de Negocio** 

Sprint 0 – Versión 1.3 

**Ingeniería Civil en informatica** 

Daniela Romero Renato Carrasco Esban Vejar 

Vicente Matus Marcelo Matamala Fabian Sanchez 

7 de septiembre de 2026 

## **1. Propósito y Alcance** 

Este documento establece las políticas, restricciones lógicas y cálculos inmutables que gobiernan la Plataforma de Optimización de Compras. Su propósito es servir como contrato de arquitectura (Línea Base), asegurando la consistencia y la trazabilidad estricta entre los Requisitos Funcionales (RF) y la implementación técnica. Esta versión consolida el proceso de _Requirements Scrubbing_ alineado al SWEBOK V4.0, fijando la viabilidad económica del proyecto (TCO), el modelo de Crowdsourcing, y unificando el motor de resolución logística. 

## **2. Regla Central (RN-00)** 

|**ID**|**Nombre de la Regla**|**Restricción Lógica (Definición**<br>**Técnica)**|**RF Relac.**|**Estado**|
|---|---|---|---|---|
|RN-00|Definición de Mejor<br>Alternativa|La mejor alternativa de compra se<br>calcula minimizando la función<br>de costo total (_Precio_<br>_Productos_+<br>_Costo_<br>_Desplazamiento_), sujeto a la<br>disponibilidad de stock<br>confirmada y ajustado según el<br>límite presupuestario,<br>restricciones dietéticas y medio<br>de transporte configurados por el<br>usuario.|RF-01<br>(Optimización)|[Mantenida]|



## **3. Catálogo de Reglas de Negocio (RN)** 

1 

Especificación Formal de Reglas de Negocio 

V1.3 - Sprint 0 

|**ID**|**Nombre**|**Restricción Lógica (Regla)**|**Justificación**|**RF Relac.**|**Estado**|
|---|---|---|---|---|---|
|RN-01|Vigencia de<br>Precios|Los precios extraídos tendrán<br>una validez sujeta al período<br>de frescura configurado.<br>Superado este plazo, el<br>sistema invalidará el dato,<br>ocultándolo y bloqueándolo.|Parametrizable.<br>Define el<br>comportamiento<br>frente al dato<br>obsoleto.|RF-02 (Sync)|[Mantenida]|
|RN-02|Tratamiento<br>de Stock|Ante la ausencia de stock, el<br>sistema invalidará el precio,<br>excluirá el ítem de la ruta y<br>emitirá una alerta visual.|Consistencia. Cierra<br>el flujo evitando<br>eliminaciones<br>silenciosas.|RF-02<br>(Stock)|[Mantenida]|
|RN-06|Validación IA|El backend (Etapa 2) detectará<br>quiebres de stock antes de<br>invocar la Etapa 3, inyectando<br>la advertencia al prompt para<br>evitar alucinaciones.|Corrección lógica:<br>Evita contradicción<br>Backend/IA.|RF-05<br>(Asistente<br>IA)|[Mantenida]|
|RN-07|Límite de<br>Locales|El algoritmo limitará la ruta a<br>un número máximo de puntos<br>de venta definible por<br>configuración.|Viabilidad logística.|RF-01 (Algo-<br>ritmos)|[Mantenida]|
|RN-08|Umbral<br>Rentabilidad|Solo se sugerirá una ruta<br>multiparada si el ahorro neto<br>proyectado supera el umbral<br>configurado.|Evita micro-ahorros<br>ineficientes.|RF-01 (Algo-<br>ritmos)|[Mantenida]|
|RN-11|Control y<br>Modelo|Segmentado en: ’Guest’ (solo<br>lectura), ’User’ (cuota<br>estándar IA) y ’Colaborador’<br>(cuota extendida por<br>validación). Acciones<br>protegidas ejecutadas por<br>invitados redirigen a<br>autenticación obligatoria.|Seguridad perimetral<br>y viabilidad<br>económica (TCO<br>cero).|RF-06<br>(Accesos)|[Modificada]|
|RN-14|Capacidad<br>Proceso|El motor rechazará cálculos si<br>la lista excede la capacidad<br>máxima de procesamiento<br>configurada.|Prevención DoS y<br>protección de<br>memoria.|RF-07 (Ren-<br>dimiento)|[Mantenida]|
|RN-20|Monto<br>Mínimo|La ruta se habilitará solo si el<br>subtotal supera el monto<br>mínimo. Si es inferior, se<br>bloqueará sugiriendo agregar<br>ítems.|Viabilidad<br>económica.|RF-07 (Ren-<br>dimiento)|[Mantenida]|
|RN-22|Medio<br>Transporte|Requiere parametrización<br>obligatoria del medio de<br>transporte para convertir<br>distancia a costo.|Condición<br>matemática<br>obligatoria para la<br>RN-00.|RF-04<br>(Perfil)|[Mantenida]|



2 

Especificación Formal de Reglas de Negocio 

V1.3 - Sprint 0 

## **4. Anexo Técnico: Políticas de Operación** 

- **4.1 4.1. Patrón Anti-Alucinación (3 Etapas - Cortocircuito Integrado)** 

   **1. Etapa 1 (IA):** Extracción determinística ( _function calling_ ) de filtros y entidades desde lenguaje natural. 

   **2. Etapa 2 (Backend Python):** Filtrado real contra base de datos. Si no hay stock, se inyecta como dato negativo al prompt de Etapa 3. **Cortocircuito:** Si hay cero resultados, el backend interrumpe y devuelve mensaje local, ahorrando cuota API (Economía de Software). 

   **3. Etapa 3 (IA):** Redacción restringida al set real validado en Etapa 2. La IA no consulta la base de datos. 

- **4.2 4.2. Estrategia de Seguridad** 

      - **Tokens:** Access Token (15 min) para endpoints protegidos; Refresh Token (7 días, HttpOnly/Secure) para renovación silenciosa. 

      - **RBAC:** Control de acceso basado en roles verificado obligatoriamente mediante middleware en API Go. 

- **4.3 4.3. Motor de Cálculo (Grafos y Logística Unificada)** 

      - **Stack Arquitectónico:** OpenTripPlanner (OTP) con OpenStreetMap + GTFS DTPR (Temuco), acoplado a Google OR-Tools. 

      - **Condición de cálculo:** Requiere perfil de consumo del usuario (RN-22). 

      - **Función de Costo Objetivo:** _Total_ = _Precio Productos_ + _Costo Logistico_ . 

      - **Cálculo Condicional Logístico:** 

         - **Vehículo particular:** _Costo Logistico_ = ( _Distancia_ / _Rendimiento KmL_ ) _× Precio Combustible_ . El combustible se actualiza con API CNE. 

         - **Transporte público:** _Costo Logistico_ se basa en tiempos de OTP. Excluye tramos menores al umbral de caminata. _Tari f a Fija_ base del pasaje es variable de entorno. 

3 

