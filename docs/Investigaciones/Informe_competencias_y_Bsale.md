# **Análisis de Competencia** 

Aplicaciones de comparación de precios y rutas de compra en supermercados 

Taller de Integración III 

Integrantes: Daniela Romero - Fabian Sanchez - Renato Carrasco - Marcelo Matamala - Vicente Matus - Esban Vejar 

## **Índice** 

|**1. Metodología**|**3**|
|---|---|
|**2. Evaluación por aplicación**|**3**|
|2.1. CarriApp (Chile, RM/zona central) . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>3|
|2.2. Knasta (Chile, Colombia, Perú, México) . . . . . . . . . . . . . . . .|. . . . . . .<br>3|
|2.3. AhorraPo (Chile) . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>3|
|2.4. Grocery Routes (EEUU) . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>4|
|2.5. GroceryChop (EEUU) . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>4|
|2.6. CartSage (EEUU)<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>4|
|2.7. PreciosGanga (Chile) . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>4|
|**3. Comparación resumida**|**4**|
|**4. Lo que ninguna de las 7 tiene**|**5**|
|**5. Funciones que sí conviene adoptar**|**5**|
|**6. Recomendaciones concretas**|**5**|
|**7. Competidores indirectos (sustitutos)**|**6**|
|7.1. Apps de última milla . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>6|
|7.2. Suscripciones de supermercado<br>. . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>6|
|**8. Modelos de negocio y experiencia de usuario (UX)**|**7**|
|8.1. Modelos de negocio . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>7|
|8.2. Patrones de UX observados<br>. . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>7|
|**9. SERNAC — Observatorio de Precios**|**7**|
|**10.Escalabilidad técnica y ventaja regional**|**8**|
|10.1. El vacío regional de CarriApp . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>8|
|10.2. Estabilidad de servicio y tolerancia a fallos . . . . . . . . . . . . . . .|. . . . . . .<br>8|
|10.3. Límites algorítmicos de Grocery Routes<br>. . . . . . . . . . . . . . . .|. . . . . . .<br>8|
|**11.Bsale y herramientas de gestión para el retailer**|**8**|
|11.1. Qué es y modelo de negocio . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>9|
|<br>11.2. Funcionalidades principales<br>. . . . . . . . . . . . . . . . . . . . . . .|. . . . . . .<br>9|
|11.3. Por qué no es competencia del proyecto<br>. . . . . . . . . . . . . . . .|. . . . . . .<br>9|
|**12.Costo dinámico de combustible en el motor de rutas**|**9**|



2 

## **1 Metodología** 

Este análisis combina dos fuentes: una búsqueda web de aplicaciones internacionales que usan el patrón precio + ruta óptima, que es el diferenciador central del proyecto, y una prueba directa de cada plataforma chilena por parte del equipo, incluyendo intentos reales de login, revisión de cobertura geográfica y una evaluación de qué tan lejos o cerca está cada una de lo que el proyecto ya tiene planeado. 

La prueba directa terminó siendo la fuente más valiosa. Fue la que encontró cosas que una búsqueda web no muestra, como que CartSage pide permisos de administrador al iniciar sesión (un riesgo real de privacidad, no solo una opinión), o que PreciosGanga ni siquiera deja crear una cuenta. 

## **2 Evaluación por aplicación** 

### **2.1 CarriApp (Chile, RM/zona central)** 

Es la aplicación con más funciones de todas las evaluadas. Se conecta directamente a las cuentas de supermercado del usuario (Tottus, Jumbo, Líder, Unimarc) y arma el carrito automáticamente dentro de la página del supermercado elegido, considerando un monto mínimo de compra de $20.000. Cuando un producto no está disponible sugiere reemplazos, y guarda tanto el precio actual como un promedio a 3 meses por producto, lo que permite ver si conviene comprar ahora o esperar una oferta. 

También separa los resultados por sector (despensa, panadería, fiambrería, limpieza), deja buscar por clase o marca, y tiene un algoritmo que evalúa qué tienda ofrece mejor precio y disponibilidad real de lo pedido, no solo precio en el papel. Considera además suscripciones y descuentos de las tiendas que el usuario tenga activas, con seguimiento del ahorro acumulado. 

Su límite más importante es geográfico: solo cubre la Región Metropolitana y la zona central, fuera de eso no existe. Tampoco calcula ruta física ni distancia real entre tiendas, solo optimiza precio, el mismo vacío que comparten el resto de las aplicaciones evaluadas. 

### **2.2 Knasta (Chile, Colombia, Perú, México)** 

Es un comparador multipaís y multicategoría. Su fuerza frente a las demás es la cantidad de locales cubiertos (ABC, Paris, Falabella, Reuse, PC Factory, Santa Isabel, entre muchos otros), más amplio que CarriApp en cobertura de tiendas, aunque menos profundo en funciones de optimización específicas de supermercado. 

Un dato relevante para la parte del informe sobre proveedores de IA: Knasta se promociona activamente como comparador con IA, así que ya existe competencia directa usando IA para este tipo de comparación, no es un territorio inexplorado. 

### **2.3 AhorraPo (Chile)** 

Permite crear distintos tipos de canastas de compra y exportarlas a PDF. Tiene un algoritmo que se comporta como IA para optimizar precios, aunque no queda claro si es IA real o una heurística más simple. No tiene función de rutas ni comparación ruta/precio, igual que el resto de las aplicaciones evaluadas. 

3 

### **2.4 Grocery Routes (EEUU)** 

Es, de todas las evaluadas, la única que efectivamente calcula algún tipo de ruta óptima: compara precios entre tiendas cercanas y sugiere comprar todo en una tienda o dividir en dos para maximizar el ahorro. 

El problema es que es exclusiva de App Store, no existe versión para Android ni versión web. Además, su noción de “ruta” es simple, divide el carrito en una o dos tiendas, no hace ningún cálculo geográfico real de distancia o tiempo como el que plantea este proyecto con PostGIS. 

### **2.5 GroceryChop (EEUU)** 

Tiene IA conversacional, pero está pensada exclusivamente para Estados Unidos: los códigos postales de otros países no son reconocidos por la plataforma, así que en la práctica no se puede usar desde Chile. 

### **2.6 CartSage (EEUU)** 

Es de pago, con una prueba gratuita que exige iniciar sesión. Al hacerlo, la plataforma pidió permisos de administrador, una señal de alerta real para una aplicación de comparación de precios que no debería necesitar ese nivel de acceso. Por eso no fue posible evaluar el resto de su funcionalidad. 

La lección para el proyecto es directa: nunca pedir permisos elevados ni forzar login para funciones básicas gratuitas, es exactamente el tipo de práctica que genera desconfianza y aleja usuarios. 

### **2.7 PreciosGanga (Chile)** 

Tiene una funcionalidad muy básica, no muy distinta de lo que el proyecto ya tiene planeado. El problema más grave que encontramos al probarla fue que no se pudo ni siquiera iniciar sesión en la plataforma. 

## **3 Comparación resumida** 

|**Aplicación**|**Compara**<br>**precio**|**Calcula ruta**|**IA**|**Cobertura / riesgo**|
|---|---|---|---|---|
|CarriApp|Sí (la más<br>completa)|No|Sí (busca mejor<br>tienda)|Solo RM / zona central|
|Knasta|Sí (multicate-<br>goría)|No|Sí (declarado)|Chile, Colombia, Perú, Mé-<br>xico|
|AhorraPo|Sí|No|Posible (no con-<br>firmado)|Chile|
|Grocery Routes|Sí|Sí (división 1-2<br>tiendas)|No declarado|Solo App Store, EEUU|
|GroceryChop|Sí|No|Sí (conversacio-<br>nal)|Solo EEUU, sin códigos<br>postales de otros países|



4 

|**Aplicación**|**Compara**<br>**precio**|**Calcula ruta**|**IA**|**Cobertura / riesgo**|
|---|---|---|---|---|
|CartSage|No evaluable|Sí (declarado)|No evaluable|Pide permisos de admin al<br>|
|||||ingresar|
|PreciosGanga|Sí (básico)|No|No|No permite iniciar sesión|



## **4 Lo que ninguna de las 7 tiene** 

Ninguna de las siete cruza el ahorro de precio con el costo real de desplazamiento: combustible, tiempo, transporte público. Ni siquiera CarriApp, que es la más completa en precio, lo hace y Grocery Routes solo divide el carrito en una o dos tiendas sin ningún cálculo geográfico real. Esto confirma que el objetivo central del proyecto, visto en la sección de fundamentación, sigue siendo un vacío real y no algo que la competencia ya resolvió. 

Tampoco hay ninguna que cuantifique cuánto se desplazó realmente el usuario, ni que revise los horarios de cierre de las tiendas antes de sugerir una ruta, con el riesgo de mandarlo a un lugar que va a estar cerrado. 

## **5 Funciones que sí conviene adoptar** 

Varias funciones que ya tiene validadas la competencia conviene sumarlas al proyecto. La posibilidad de crear listas o canastas, que tienen AhorraPo y CarriApp, ya está cubierta por el diseño de “Guardar elementos (carrito)”. Los precios históricos por tienda, no solo el precio actual, son otra: CarriApp lo lleva incluso más lejos, con precio promedio a 3 meses. 

También vale la pena la sugerencia de un producto de reemplazo cuando el original no tiene stock (CarriApp), separar los resultados por sector o categoría (también CarriApp), exportar la lista a PDF (AhorraPo), y tener una cobertura amplia de tiendas y categorías en vez de limitarse a 3 o 4 supermercados (Knasta). 

## **6 Recomendaciones concretas** 

El diferenciador central del proyecto sigue intacto: nadie evaluado tiene precio más ruta real, con PostGIS y costo de combustible o transporte. Es el argumento más fuerte para la sección de fundamentación. 

Agregar horarios de cierre y un contador de distancia recorrida es barato de implementar y no lo vimos en ninguna competencia: los horarios ya deberían venir del scraping, y la distancia ya la calcula el motor de rutas, solo falta mostrarla acumulada. 

Conviene no limitar la cobertura geográfica como hace CarriApp si es posible. Quedarse solo en la Región Metropolitana es su principal debilidad, y el proyecto debería evitar ese mismo error si la meta es escalar a nivel nacional, coherente con lo que ya plantea el informe de arquitectura de microservicios del equipo; de no lograrse o tener problemas de velocidad es algo que se puede limitar para el proyecto. 

Tampoco conviene repetir el error de CartSage: nunca pedir permisos de administrador ni forzar login para funciones básicas aunque suene obvio. Esto aplica para el diseño de “Usuario sin cuenta” del diagrama de casos de uso, que ya contempla dejar “Consultar catálogo” disponible sin cuenta 

5 

pero intentar ver el balance entre la exclusividad de iniciar sesión y la de poder tantear la página lo suficiente como para convencer al usuario. 

Como trabajo futuro, no bloqueante, el precio promedio histórico y la sugerencia de producto de reemplazo son las dos funciones de CarriApp con más valor percibido que el proyecto todavía no contempla. 

## **7 Competidores indirectos (sustitutos)** 

Antes de que exista comparación de precios, muchos usuarios ya resuelven el “costo de desplazamiento” pagando directamente por conveniencia. Estas apps no compiten mostrando mejor información, compiten eliminando la necesidad de comparar. 

### **7.1 Apps de última milla** 

|**App**|**Supermercados**|**Costo de despacho**|
|---|---|---|
|Cornershop|Líder (formal), también Jum-<br>bo|Variable según Cornershop Pop|
|Rappi|Unimarc, Jumbo, Santa Isa-<br>bel, Líder|Variable según Rappi Pro|
|Fazil (grupo Fala-|Tottus (también Sodimac,|$2.990–3.990 fijo; gratis sobre|
|bella)|Falabella Retail)|$29.990–49.990 con CMR|



Estas apps no eliminan el costo de desplazamiento, lo trasladan a una tarifa fija de despacho que además suele incluir un margen sobre el precio del producto. El proyecto puede demostrar matemáticamente cuándo recoger la compra en persona sale más barato que pagar ese despacho, una comparación que hoy ninguna de estas apps hace porque no les conviene mostrarla. 

### **7.2 Suscripciones de supermercado** 

La suscripción real asociada a Líder/Walmart en Chile es Cornershop Pop, con despacho gratis desde $20.000 y tarifa preferencial de $1.900 bajo ese monto. Walmart Chile no tiene una suscripción propia separada. 

Jumbo Prime cuesta $30.000 semestrales, y el monto mínimo para despacho gratis subió de $15.000 a $22.000 en 2024, un dato útil para el informe: incluso las suscripciones “gratis” están subiendo su barrera de entrada. Cubre zonas urbanas de Temuco, entre otras ciudades. 

Estas suscripciones fomentan comprar todo en una sola cadena para amortizar la membresía, justo lo opuesto a lo que el motor de rutas del proyecto puede demostrar: que dividir la compra entre 2 o 3 tiendas cercanas puede generar más ahorro neto que quedarse cautivo en una sola cadena. 

6 

## **8 Modelos de negocio y experiencia de usuario (UX)** 

### **8.1 Modelos de negocio** 

No se pudo confirmar con una fuente directa el modelo exacto de monetización de Knasta. Se infiere que es afiliación y tráfico, por ser el patrón estándar de la industria de comparadores (cobrar comisión por cada usuario redirigido a la tienda final), pero queda como hipótesis razonable, no como hecho confirmado. 

El caso de CartSage sí se confirmó en la prueba directa: exige permisos de administrador al iniciar sesión, lo que sugiere un modelo apoyado en monetización de datos. 

### **8.2 Patrones de UX observados** 

La prueba directa con cada plataforma dejó patrones de UX que se repiten entre las siete aplicaciones evaluadas, más allá de sus diferencias de funcionalidad. El más grave es el de CartSage, donde pedir permisos de administrador para completar el login es un problema de experiencia de usuario que además se convierte en una señal de confianza rota antes de que el usuario llegue a ver el producto. Algo similar, aunque menos grave, ocurre con PreciosGanga: no poder crear una cuenta corta la experiencia en el primer paso, antes de que el valor de la app se pueda evaluar. 

Otro patrón es el de condicionar funciones básicas a una sola plataforma como Grocery Routes existe únicamente en App Store, sin versión Android ni web. en casos así la experiencia termina dependiendo de qué dispositivo tiene el usuario, no de si la función existe. GroceryChop repite el problema desde otro ángulo: su IA conversacional queda inutilizable para un usuario chileno porque el flujo de onboarding exige un código postal que la plataforma no reconoce fuera de Estados Unidos. 

Para el proyecto, la lección de UX es la misma que ya aparece en la Sección 6: dejar que el usuario evalúe el valor de la plataforma (consultar catálogo, ver precios) antes de pedirle una cuenta o permisos, y no atar funciones centrales a una sola plataforma o dispositivo. 

## **9 SERNAC — Observatorio de Precios** 

Es el competidor más legítimo de todos los evaluados: respaldo estatal, gratuito, sin fines comerciales, y por eso merece su propia sección en vez de mezclarse con el resto. 

Lo lanzó el Ministerio de Economía junto al SERNAC en septiembre de 2022, como parte del plan Chile Apoya frente a la inflación, y está disponible en `observatorio.sernac.cl` . Los datos los reportan las propias empresas semanalmente al SERNAC, no son scrapeados. Cubre más de 200 comunas, cerca de 1.100 locales y unos 245.000 precios de 221 productos básicos. El usuario elige región y comuna, arma un carro de entre 5 y 15 productos, y el sitio ordena los supermercados de más barato a más caro para ese carro específico. 

Una restricción deliberada es que no muestra precios de marcas ni productos individuales, solo el total del carro. Es una decisión explícita para evitar que las cadenas usen la herramienta para coludirse en precios, siguiendo recomendaciones de la Fiscalía Nacional Económica. Solo considera ofertas universales, sin requisitos de tarjeta, RUT o compra de múltiples unidades. 

La brecha frente al proyecto es la misma que con todo lo demás evaluado: el Observatorio no calcula ni sugiere ninguna ruta ni costo de desplazamiento entre los supermercados que compara, solo entrega el ranking de precio total. Y al no exponer precios por producto individual, por 

7 

diseño y no por limitación técnica, tampoco sirve para el caso de uso de “recomendar productos específicos” que sí cubre el asistente conversacional del proyecto. 

## **10 Escalabilidad técnica y ventaja regional** 

### **10.1 El vacío regional de CarriApp** 

Según una nota de Chócale (abril 2026), CarriApp está disponible únicamente en la Región Metropolitana y acumula más de 9.000 usuarios desde su lanzamiento en noviembre de 2025. Un artículo anterior, de marzo de 2026, reportaba 6.000 usuarios y 58.000 productos, lo que muestra una curva de crecimiento real y no un dato aislado. 

Un detalle técnico que no habíamos visto antes: la automatización del carrito de CarriApp funciona hoy solo como extensión de navegador, no como app móvil. “Esa funcionalidad todavía no la hemos podido replicar para smartphones”, según su CTO Roberto Wangnet. Es una limitación de plataforma, no solo geográfica. 

Sobre la idea de que CarriApp asume costo cero para la compra presencial: no encontramos una fuente que lo diga textualmente. Las fuentes describen que calcula costos de despacho a domicilio y considera membresías, pero no mencionan ningún cálculo de distancia o costo de traslado para cuando el usuario va en persona. Es una inferencia razonable a partir de que esa función simplemente no aparece en ninguna parte, consistente con el patrón de las 7 apps evaluadas, pero vale la pena dejarlo en el informe como inferencia y no como una cita directa. 

### **10.2 Estabilidad de servicio y tolerancia a fallos** 

El error crítico de PreciosGanga, no dejar iniciar sesión durante la prueba, es exactamente el tipo de falla que la arquitectura de microservicios del proyecto está pensada para evitar. Si el módulo de scraping falla o está actualizando el catálogo de forma asíncrona con Celery y Redis, el resto de la plataforma, incluido el asistente de IA, sigue respondiendo con el último catálogo disponible en vez de caerse por completo. 

### **10.3 Límites algorítmicos de Grocery Routes** 

Está confirmado directamente en la descripción oficial de la app: su “Best Price Routing” se limita a sugerir una tienda para todo el pedido, o dividir la lista entre dos tiendas para maximizar el ahorro. No hay evidencia de que ejecute ningún cálculo sobre una red vial real ni que considere el costo de combustible del trayecto; es una heurística de partición de lista, no un algoritmo de ruta geoespacial. Esto refuerza que integrar OR-Tools para resolver el problema del vendedor viajero sobre una matriz de distancias real vía OSRM es una ventaja técnica genuina frente a todo lo evaluado, no solo frente a los competidores chilenos. 

## **11 Bsale y herramientas de gestión para el retailer** 

A diferencia de las siete aplicaciones evaluadas en las secciones anteriores, Bsale no es un competidor directo ni indirecto del proyecto: resuelve el problema desde el lado del negocio, no desde el lado del comprador. Se incluye en el informe porque delimita con claridad qué tipo de vacío cubre el proyecto y cuál no. 

8 

### **11.1 Qué es y modelo de negocio** 

Bsale es un software chileno de punto de venta (POS) y gestión comercial que permite emitir boletas y facturas electrónicas integradas con el SII, controlar inventario, gestionar ventas en múltiples sucursales y generar reportes en tiempo real; es el sistema de ventas más usado por pymes en Chile, con más de 20.000 empresas activas. Está disponible en tres países (Chile, México y Perú), con soluciones adaptadas a las regulaciones tributarias de cada uno. 

El modelo es SaaS por suscripción mensual pagada por el negocio, no por el consumidor final. Opera completamente en la nube, eliminando la necesidad de infraestructura local, con planes que van entre 1,5 y 2,9 UF + IVA mensuales, desde opciones básicas hasta un plan full omnicanal. 

### **11.2 Funcionalidades principales** 

- POS con selección rápida de productos por lector de código de barras o búsqueda por palabras clave y SKU, control de caja con saldo de apertura, ingresos y retiros, y múltiples formas de pago con cálculo automático de vuelto. 

- Inventario en tiempo real, con control de stock en línea usando el método FIFO, multidispositivo entre web y app. 

- Facturación electrónica ante el SII, tienda en línea (e-commerce), y reportes de ventas por vendedor, sucursal y producto. 

- Un marketplace de integraciones: conexión con Transbank, software contable como Chipax, programas de fidelización, y una plataforma SaaS con IA para unificar operaciones de pymes, además de conectores a Shopify, Jumpseller y PrestaShop. 

- App móvil para vender y controlar stock desde el celular, incluso ingresando productos con la cámara del dispositivo. 

### **11.3 Por qué no es competencia del proyecto** 

Bsale no compara precios entre distintas tiendas, no sugiere dónde comprar más barato, y no tiene ningún componente de ruta, geolocalización o costo de desplazamiento; de hecho, ese tipo de función ni siquiera aplica a su propuesta de valor, porque no está pensado para que lo use un consumidor final. No es un competidor directo como CarriApp o Knasta, ni tampoco un competidor indirecto en el sentido de la Sección 7 (sustitutos que eliminan la necesidad de comparar), porque simplemente no participa en la decisión de compra del usuario final. 

Esto refuerza, desde un ángulo distinto al de las secciones anteriores, que el vacío que el proyecto ataca (precio más ruta real para el comprador) sigue sin estar cubierto por nadie, ni siquiera por el software que las propias tiendas usan puertas adentro para gestionar su operación. 

## **12 Costo dinámico de combustible en el motor de rutas** 

El motor de rutas necesita el precio del combustible para estimar el costo real de trasladarse a cada supermercado. En Chile, la Comisión Nacional de Energía ya mantiene esta información como dato público. Energía Abierta ( `energiaabierta.cl` ) publica precios históricos de combustibles líquidos desde 2012, actualizados cada semana por región, en pesos por litro. Bencina en Línea ( `bencinaenlinea.cl` ) complementa esto con precios geolocalizados de cerca de 1.700 estaciones de servicio a nivel nacional, reportados por los propios administradores de cada estación. 

9 

La propia app oficial de la CNE, Bencina en Línea, ya implementa casi el mismo cálculo que se propone para el proyecto: el usuario elige su vehículo (marca, modelo, tipo de combustible, carrocería, versión) usando datos de rendimiento de consumovehicular.cl, y la app estima el costo en pesos y las emisiones de CO2 del trayecto hacia una estación según la distancia. Es un precedente oficial de que el enfoque, rendimiento del vehículo por distancia por precio del combustible, es técnicamente válido. 

Inspeccionando directamente el sitio de Bencina en Línea con las herramientas de desarrollador del navegador, el equipo encontró un endpoint real: `busqueda_estacion_filtro` , en `api.bencinaenlinea.cl` , que devuelve un JSON con los datos de las estaciones filtradas (confirmado en la pestaña de Red, con una respuesta de más de 200 KB). Esto responde la duda que quedaba pendiente: sí existe un endpoint consultable programáticamente, aunque no esté documentado públicamente como API oficial. El paso siguiente es replicar esa petición fuera del navegador (mismos headers y parámetros de filtro) para confirmar que responde igual sin necesidad de una sesión activa del sitio, y revisar si Energía Abierta expone algo equivalente para el histórico por región. 

10 

