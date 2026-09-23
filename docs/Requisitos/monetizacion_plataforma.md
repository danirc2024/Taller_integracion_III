Alternativas de Monetización para
RutaAhorro(V2)
**Segunda versión**
Daniela Romero
Renato Carrasco
Vicente Matus
Esban Vejar
Fabián Sanchez



# Propósito del documento

El presente documento analiza distintas alternativas para generar
ingresos mediante RutaAhorro, considerando la retroalimentación recibida
durante la revisión del proyecto.

RutaAhorro busca centralizar información de distintos supermercados para
ayudar al usuario a tomar decisiones de compra considerando tanto el
precio de los productos como el costo asociado al desplazamiento. Por
esta razón, la monetización debe permitir que la funcionalidad principal
continúe siendo útil para el usuario y evitar que los intereses
comerciales alteren las recomendaciones de la plataforma.

Como parte de la retroalimentación recibida, se indicó que la viabilidad
de los modelos de monetización debe ser revisada con la Dirección de
Innovación y Transferencia Tecnológica (DIRITT) de la Universidad
Católica de Temuco. La DIRITT declara entre sus funciones apoyar a la
comunidad universitaria en transferencia tecnológica, licenciamiento y
desarrollo de emprendimientos de base tecnológica, por lo que esta
instancia será considerada como una etapa de validación posterior.

A partir de lo anterior, este documento presenta cuatro alternativas
principales:

1. Modelo de usuario Premium.
2. Análisis estadístico y comparativo para empresas.
3. Afiliación mediante redirección a plataformas externas.
4. Acuerdos comerciales con empresas y marcas.

Adicionalmente, se incorpora como alternativa a investigar el uso de una
**subasta de segundo precio** para determinados espacios comerciales,
debido a que fue propuesta durante la retroalimentación.

El objetivo no es establecer todavía un único modelo, sino presentar
alternativas para que el equipo pueda analizarlas y posteriormente
validarlas con la DIRITT.

# Criterios de evaluación

Las alternativas se comparan considerando:

- **Compatibilidad con el propósito:** relación entre el modelo de
  ingresos y la función principal de RutaAhorro.
- **Valor para el usuario:** beneficio concreto que obtiene el usuario.
- **Impacto en la experiencia:** posibilidad de introducir
  restricciones, molestias o conflictos.
- **Viabilidad comercial:** existencia de personas o empresas que
  podrían estar dispuestas a pagar.
- **Complejidad de implementación:** esfuerzo necesario para desarrollar
  y mantener la alternativa.
- **Independencia de las recomendaciones:** capacidad de mantener una
  comparación objetiva aun cuando existan intereses comerciales.

# Alternativa 1: Usuario Premium

El modelo Premium consiste en mantener disponibles gratuitamente las
funciones esenciales de RutaAhorro y ofrecer una suscripción para
acceder a herramientas avanzadas.

El usuario no tendría que pagar para conocer dónde puede realizar una
compra más conveniente. El pago se asociaría a funciones adicionales que
aumentan el nivel de información, análisis y personalización disponible.

## Funciones propuestas

  **Funcionalidad básica**                      **Funcionalidad Premium**

---

  Comparación de precios entre supermercados    Visualización ilimitada de rutas en el mapa
  Consulta de productos y precios actuales      Interacción ampliada con la inteligencia artificial
  Cálculo de precio y costo de desplazamiento   Consulta de precios históricos
  Búsqueda y filtrado de productos              Asociación de tarjetas de beneficios/descuento
  Funciones esenciales de optimización          Identificación de descuentos asociados a las tarjetas registradas

## Visualización ilimitada de rutas e interacción con IA

El usuario Premium podría disponer de acceso ilimitado o
considerablemente ampliado a las funciones de visualización de rutas y
al asistente de inteligencia artificial.

La visualización de rutas permitiría consultar con mayor libertad las
alternativas de desplazamiento generadas por RutaAhorro, incluyendo
distintas combinaciones de supermercados.

La interacción con la IA permitiría realizar consultas adicionales
relacionadas con productos, alternativas de compra y resultados
obtenidos por la plataforma.

La ventaja de este modelo es que el usuario gratuito conserva acceso a
las funciones esenciales, mientras que el usuario Premium obtiene una
experiencia más completa.

## Precios históricos

El usuario Premium podría consultar la evolución del precio de un
producto durante un período determinado, incluyendo:

- precio actual;
- precio promedio histórico;
- precio mínimo registrado;
- precio máximo registrado;
- evolución del precio durante el período disponible.

Esto permitiría responder no solamente "¿dónde está más barato?", sino
también "¿el precio actual es conveniente respecto de su comportamiento
anterior?".

## Asociación de tarjetas de beneficios

Otra función Premium propuesta consiste en permitir al usuario asociar
determinadas tarjetas o programas de beneficios que utilice para
realizar sus compras.

La finalidad sería que RutaAhorro pueda considerar los descuentos
correspondientes al momento de comparar alternativas. Por ejemplo, si un
producto tiene un precio general de \$3.500, pero una determinada
tarjeta permite adquirirlo por \$2.990 durante una promoción, el usuario
Premium podría visualizar esa diferencia.

La implementación concreta dependerá de la disponibilidad y de las
condiciones de acceso a la información de cada programa de beneficios,
aspecto que deberá ser investigado antes de incorporarlo como compromiso
del proyecto.

## Ventajas

- Genera ingresos directamente desde usuarios interesados en funciones
  avanzadas.
- Mantiene gratuita la función esencial de comparación.
- No depende de publicidad invasiva.
- Las funciones Premium están directamente relacionadas con la propuesta
  de valor.
- Puede generar ingresos recurrentes mediante suscripciones.

## Desventajas

- Se necesita que las funciones Premium tengan suficiente valor para
  justificar el pago.
- Las funciones de IA pueden generar costos operativos.
- Los precios históricos requieren conservar información durante
  períodos prolongados.
- La integración de tarjetas puede depender de información o servicios
  externos.

**Viabilidad preliminar: Alta.**

# Alternativa 2: Análisis estadístico y comparativo para empresas

RutaAhorro puede generar información a partir de las consultas
realizadas por sus usuarios y de la información recopilada desde
distintos supermercados.

La propuesta no consiste en vender información personal. Se plantea
generar estadísticas generales sobre productos, categorías y
comportamiento de consulta, por ejemplo:

- productos más consultados;
- categorías más consultadas;
- productos con mayor crecimiento de consultas;
- diferencias de precios entre supermercados;
- evolución de precios;
- categorías con mayor interés;
- productos que presentan diferencias relevantes entre cadenas.

El principal valor potencial de este servicio sería su carácter
**comparativo y multisupermercado**. Los supermercados pueden disponer
de información detallada de sus propios clientes mediante sus sistemas
internos y estrategias de Retail Media. RutaAhorro, en cambio, puede
observar información proveniente de distintas cadenas desde una
plataforma independiente.

El servicio podría orientarse principalmente a marcas, fabricantes,
proveedores y distribuidores.

## Ventajas

- No requiere cobrar al usuario.
- Aprovecha información generada naturalmente por la plataforma.
- Puede ofrecer una visión transversal del mercado.
- Puede convertirse en un servicio B2B mediante informes o planes de
  información.

## Desventajas

- Su valor aumenta cuando existe una cantidad suficiente de usuarios y
  consultas.
- Requiere mecanismos adecuados de agregación y protección de la
  información.
- Es más apropiado como fuente de ingresos a mediano o largo plazo que
  como ingreso inicial.

Cualquier tratamiento de información para terceros deberá considerar la
normativa aplicable y utilizar información agregada que no permita
identificar individualmente a los usuarios.

**Viabilidad preliminar: Media-Alta, principalmente a mediano plazo.**

# Alternativa 3: Afiliación mediante redirección

RutaAhorro podría permitir que, después de comparar las alternativas, el
usuario decida voluntariamente visitar la plataforma oficial de un
supermercado.

Cuando exista un programa de afiliación compatible, RutaAhorro podría
recibir una comisión cuando una visita generada desde la plataforma
derive posteriormente en una compra.

La afiliación es utilizada por plataformas de comparación. ComparaFácil,
por ejemplo, declara financiar su operación mediante programas de
afiliados y recibir una comisión cuando una compra se concreta después
de una visita generada desde su plataforma.

La afiliación debe considerarse una función complementaria y no el
núcleo de la propuesta. RutaAhorro busca centralizar la información de
distintos supermercados, por lo que el usuario debería poder consultar
los productos, precios y resultados dentro de RutaAhorro. La redirección
podría aparecer solamente como una opción posterior: **"Ir al
supermercado"**.

## Ventajas

- No requiere cobrar directamente al usuario.
- Puede generar ingresos a partir de derivaciones.
- Puede funcionar como ingreso complementario.

## Desventajas

- Depende de la existencia de programas de afiliación compatibles.
- RutaAhorro no controla la compra final.
- Puede generar pocos ingresos cuando la compra se realiza
  presencialmente.
- La redirección puede disminuir parcialmente el valor de
  centralización.

**Viabilidad preliminar: Media.**

# Alternativa 4: Subasta de segundo precio

Durante la retroalimentación se planteó investigar la posibilidad de
utilizar una **subasta de segundo precio** para determinados espacios
comerciales de RutaAhorro.

En una subasta de segundo precio, los participantes realizan ofertas y
el ganador paga el valor correspondiente a la segunda oferta más alta,
en lugar de pagar necesariamente el monto que ofreció. La modalidad
clásica se conoce como subasta de Vickrey.

Existen mecanismos relacionados con este principio en publicidad
digital. Por ejemplo, X describe un modelo de subasta de segundo precio
para determinadas acciones publicitarias.

## Posible aplicación en RutaAhorro

Una posible aplicación sería permitir que empresas o marcas compitan por
determinados espacios comerciales.

Por ejemplo, podría existir un espacio claramente identificado como:

> **Producto patrocinado**

Las empresas podrían realizar ofertas para obtener ese espacio durante
un período determinado.

Sin embargo, esta alternativa debe considerarse **experimental** y
requiere validación antes de incorporarla al modelo de negocio.

La subasta podría utilizarse para determinar qué empresa obtiene un
espacio comercial, pero **no debería utilizarse para determinar qué
producto es objetivamente la mejor alternativa de compra**. De esta
manera, el mecanismo comercial permanecería separado del algoritmo de
optimización.

## Ventajas

- Permite determinar competitivamente el valor de determinados espacios
  comerciales.
- Puede generar mayores ingresos cuando existe competencia entre
  empresas.
- Puede integrarse como complemento de los acuerdos comerciales.

## Desventajas

- Es más complejo de implementar y administrar.
- Requiere suficientes empresas interesadas en participar.
- Necesita reglas claras para las ofertas, los espacios y los pagos.
- En esta etapa no existe evidencia suficiente para afirmar que sea
  conveniente para RutaAhorro.

**Viabilidad preliminar: Por validar con la DIRITT.**

# Comparación general

  **Alternativa**             **Viabilidad preliminar**   **Impacto**   **Complejidad**   **Rol propuesto**

---

  Usuario Premium             Alta                        Bajo          Media             Principal
  Análisis estadístico B2B    Media-Alta                  Bajo          Media-Alta        Mediano plazo
  Afiliación                  Media                       Bajo          Media             Complementario
  Subasta de segundo precio   Por validar                 Bajo-Medio    Alta              Experimental

# Propuesta de estructura de monetización

Una posible estructura consiste en combinar una fuente de ingresos
dirigida a usuarios con fuentes dirigidas a empresas.

::: center
**RutaAhorro**
$\downarrow$
**Funciones esenciales gratuitas**
Comparación de precios + costo de desplazamiento + optimización
$\swarrow \hspace{1.2cm} \downarrow \hspace{1.2cm} \searrow$
**Premium** **Empresas** **Afiliación**
Funciones avanzadas Servicios comerciales/B2B Redirección voluntaria
:::

El modelo Premium puede constituir una fuente directa y recurrente de
ingresos. Los servicios de análisis estadístico pueden constituir
fuentes B2B a medida que aumente el alcance de la plataforma. La
afiliación puede utilizarse como ingreso complementario.

La subasta de segundo precio se mantiene como una posibilidad adicional
que requiere investigación y validación.

# Validación mediante la Dirección de Innovación y Transferencia Tecnológica

La retroalimentación del profesor indica que la viabilidad de las
alternativas debe ser contrastada con la Dirección de Innovación y
Transferencia Tecnológica de la Universidad Católica de Temuco.

La DIRITT declara que apoya la formulación, presentación y gestión de
iniciativas de propiedad intelectual e industrial, transferencia
tecnológica, licenciamiento y desarrollo de emprendimientos de base
tecnológica. También participa en iniciativas relacionadas con proyectos
de I+D+i y emprendimiento.

Por lo tanto, antes de seleccionar definitivamente un modelo de
monetización, se propone consultar a esta dirección respecto de:

1. viabilidad comercial del modelo Premium;
2. posibilidad de establecer acuerdos comerciales con empresas;
3. viabilidad de ofrecer servicios de información y análisis a
   terceros;
4. implicancias de utilizar información agregada de la plataforma;
5. posibilidad de utilizar mecanismos de subasta de segundo precio;
6. restricciones legales, contractuales o institucionales que puedan
   afectar alguno de los modelos.

Esta consulta no significa que las alternativas anteriores ya estén
validadas. La clasificación presentada corresponde a una **evaluación
preliminar** y deberá contrastarse con la opinión de la unidad
especializada de la universidad.

# Principio de independencia de RutaAhorro

Cualquiera sea el modelo seleccionado, se propone establecer como
principio:

> **El pago de una empresa no podrá modificar el resultado de la
> comparación ni hacer que una alternativa aparezca como la más
> conveniente cuando los datos de RutaAhorro indiquen lo contrario.**

# Conclusión

Considerando la retroalimentación recibida, el **modelo Premium** se
presenta como una de las alternativas de mayor interés para RutaAhorro.
Su principal ventaja es que permite generar ingresos sin convertir la
plataforma en un espacio dependiente de publicidad y, al mismo tiempo,
mantiene gratuitas las funciones necesarias para que el usuario pueda
comparar alternativas.

Las funciones Premium propuestas son:

1. visualización ilimitada de rutas e interacción ampliada con la
   inteligencia artificial;
2. consulta de precios históricos;
3. asociación de tarjetas o programas de beneficios para considerar
   descuentos disponibles.

Junto con el modelo Premium, el **análisis estadístico y comparativo
para empresas** constituyen alternativas relevantes para generar
ingresos B2B. La **afiliación** puede mantenerse como fuente
complementaria, mientras que la **subasta de segundo precio** se
considera una alternativa experimental que requiere mayor investigación.

Finalmente, la selección definitiva del modelo debe realizarse después
de consultar a la Dirección de Innovación y Transferencia Tecnológica de
la Universidad Católica de Temuco. Esta instancia permitirá determinar
si las alternativas son comercial, técnica y jurídicamente viables para
una eventual explotación de RutaAhorro.

::: thebibliography
9

Universidad Católica de Temuco. *Dirección de Innovación y Transferencia
Tecnológica*. Disponible en: [https://diritt.uct.cl/](https://diritt.uct.cl/)

Walmart Connect Chile. *Publicidad y soluciones de Retail Media*.
Disponible en: [https://walmartconnect.cl/](https://walmartconnect.cl/)

ComparaFácil. *Transparencia y financiamiento*. Actualizado: 28 de
agosto de 2026. Disponible en:
[https://www.comparafacil.cl/transparencia](https://www.comparafacil.cl/transparencia)

Biblioteca del Congreso Nacional de Chile. *Ley N° 21.719: Regula la
protección y el tratamiento de los datos personales y crea la Agencia de
Protección de Datos Personales*. Disponible en:
[https://www.bcn.cl/leychile/](https://www.bcn.cl/leychile/)

LibreTexts. *Subasta Vickrey*. Disponible en:
[https://espanol.libretexts.org/Bookshelves/Ciencias_Sociales/Economia/Libro:_Introducci%C3%B3n_al_An%C3%A1lisis_Econ%C3%B3mico/20:_Subastas/20.04:_Subasta_Vickrey](https://espanol.libretexts.org/Bookshelves/Ciencias_Sociales/Economia/Libro:_Introducci%C3%B3n_al_An%C3%A1lisis_Econ%C3%B3mico/20:_Subastas/20.04:_Subasta_Vickrey)

X Business. *Preguntas frecuentes sobre pujas y subastas*. Disponible
en:
[https://business.x.com/es/help/troubleshooting/bidding-and-auctions-faqs](https://business.x.com/es/help/troubleshooting/bidding-and-auctions-faqs)
:::
