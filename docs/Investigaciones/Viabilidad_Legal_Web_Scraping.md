# Viabilidad Legal del Web Scraping y Estrategia de Disclaimers Legal

**Fecha:** 14 de septiembre de 2026

## 1. Introducción y Contexto de Investigación

Nuestra plataforma basa su funcionamiento en la extracción continua de datos públicos de precios e inventario desde diversas cadenas de retail (RF-01.5: Web Scraping Piloto), procesando dicha información para alimentar un motor de IA de recetas y un algoritmo de optimización logística.

El propósito de esta investigación es determinar la viabilidad jurídica de la lectura e indexación de datos públicos (precios), analizar la aplicabilidad de la doctrina de *Fair Use* (Uso Justo) y definir la necesidad de incorporar un *disclaimer* legal de exención de responsabilidad para garantizar el cumplimiento normativo y la continuidad operativa del proyecto.

## 2. Marco Legal del Web Scraping de Datos Públicos

### Marco jurídico nacional (Chile)

- **Ley N.° 21.459 (Delitos Informáticos):** sanciona el acceso no autorizado a sistemas informáticos. El scraping de información expuesta públicamente en la web, sin traspasar muros de autenticación ni vulnerar credenciales, no constituye acceso indebido, siempre que la tasa de extracción no perturbe el funcionamiento ni cause una denegación de servicio (DoS) en la infraestructura de origen.
- **Ley N.° 17.336 (Propiedad Intelectual):** establece que los hechos puros, precios de mercado y catálogos de datos fácticos no son susceptibles de derechos de autor. La protección legal aplica a la expresión creativa, no a los datos numéricos ni a la información comercial pública.
- **Ley N.° 19.628 (Protección de la Vida Privada / Datos Personales):** los precios de catálogo de supermercados son datos comerciales de dominio público y no constituyen datos de carácter personal ni sensible.
- **Ley N.° 19.496 (Protección de los Derechos de los Consumidores):** establece la libertad de información sobre precios para promover la transparencia del mercado y la libre competencia.

### Marco y jurisprudencia internacional

- **Precedente hiQ Labs v. LinkedIn (Estados Unidos, Noveno Circuito):** fallo que estableció que el scraping automatizado de datos accesibles públicamente en la web no viola la ley de fraude informático (Computer Fraud and Abuse Act, CFAA). La corte concluyó que los datos no protegidos por un muro de autenticación son de libre acceso público.
- **Directiva sobre Derechos de Autor en el Mercado Único Digital (Unión Europea):** introduce la excepción de *Text and Data Mining* (TDM), autorizando la extracción automatizada de texto y datos públicos para fines de análisis y comparación, salvo reserva explícita del titular mediante el archivo `robots.txt`.

## 3. Evaluación de la Doctrina de “Fair Use” (Uso Justo)

Para justificar la transformación de los datos bajo uso justo, la recolección cumple con los cuatro pilares fundamentales:

1. **Carácter transformativo del uso:** el sistema no recombina los datos para duplicar la plataforma original del supermercado, sino que los transforma agregando valor mediante algoritmos de ruteo (VRPTW) e Inteligencia Artificial de recetas.
2. **Naturaleza de los datos extraídos:** se procesan únicamente datos fácticos de precios e inventario, los cuales carecen de protección por derecho de autor.
3. **Cuantía y sustancialidad del material:** se extrae únicamente la información estrictamente necesaria (nombre del producto, precio, unidad y disponibilidad), omitiendo contenido multimedia, código fuente o diseños del sitio de origen.
4. **Ausencia de impacto en el mercado de origen:** la plataforma actúa como un canalizador de demanda que redirige al usuario final al supermercado para concretar la compra, generando un beneficio comercial para la fuente.

## 4. Propuesta de Disclaimer Legal (Exención de Responsabilidad)

### Justificación y necesidad

Debido a la volatilidad de los precios en el retail y a las reglas de negocio del sistema (RN-01: Vigencia de Precios y RN-02: Tratamiento de Stock), existe un desfase temporal inherente entre la extracción (scraping) y el momento de compra efectiva. Un disclaimer permite informar claramente sobre esta limitación y reducir la exposición a responsabilidades por variaciones de precio en caja o quiebres de stock.

### Texto formal del disclaimer (cláusula de precios referenciales)

Se propone la inclusión obligatoria del siguiente aviso legal visible en el pie de página (*footer*) y en el desglose final del carrito optimizado:

> **Aviso de Precios Referenciales y Exención de Responsabilidad:** Los precios, promociones y disponibilidad de stock mostrados en esta plataforma son recopilados de fuentes públicas con fines estrictamente informativos y de comparación. Si bien aplicamos algoritmos de validación y actualización continua, los valores finales son determinados de forma exclusiva por cada establecimiento comercial al momento del pago. Esta plataforma no garantiza la congelación de precios ni se hace responsable por discrepancias, cambios imprevistos o quiebres de stock en las sucursales de destino.

## 5. Trazabilidad con Reglas de Negocio (RN) y Requisitos Funcionales (RF)

| Aspecto legal | Regla / RF | Mecanismo técnico de cumplimiento |
|---|---|---|
| Extracción no invasiva | RN-14 (Capacidad / DoS) | Respeto a límites de frecuencia y concurrencia baja sobre sitios de origen. |
| Obsolescencia del dato | RN-01 (Vigencia de Precios) | Invalidación de datos antiguos y aviso mediante el disclaimer legal. |
| Verificación de stock | RN-02 / RN-06 | Exclusión de ítems sin stock antes de invocar la IA de recetas. |
| Ejecución protegida | RF-01.5 (Scraping Piloto) | Función restringida a cuentas con rol Super Admin (RN-11). |
