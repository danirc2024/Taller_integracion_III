# Documento Técnico de Integración: Interconexión Piloto entre Scraper (Python) y API (Golang) 

Vicente Matus, Daniela Romero, Renato Carrasco, Marcelo Matamala, Fabian Sánchez, Esban Vejar 

6 de septiembre de 2026 

#### **Resumen** 

Este documento técnico evalúa el estado actual del código de extracción web (Scraper) y establece el plan para integrarlo con una **API Piloto** desarrollada en Go (Golang). El objetivo de esta fase piloto es validar la comunicación entre dos lenguajes distintos (Python y Go) dentro de un entorno Docker. El documento explica de forma didáctica los problemas del código actual, las soluciones técnicas seleccionadas para enviar los datos, y los resguardos de seguridad básicos necesarios antes de conectar este módulo a la API principal del proyecto final. 

## **Índice** 

|**1. Análisis del Código Actual: ¿Qué debemos mejorar?**<br>**2**|
|---|
|**2. Evaluación de Alternativas: ¿Sirve Golang para hacer el Scraping direc-**<br>**tamente?**<br>**2**|
|2.1. Opción A: Scraping Nativo 100 % en Golang (Alternativa Recomendada a<br>futuro) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .<br>2<br>2.2. Opción B: Arquitectura Híbrida Automática mediante API (Plan Actual)<br>3|
|**3. La Solución Híbrida: Automatización del Scraping vía API**<br>**3**<br>3.1. 1. El Disparador: Usar Scrapyd<br>. . . . . . . . . . . . . . . . . . . . . . .<br>3<br>3.2. 2. El Regreso de los Datos: Webhooks . . . . . . . . . . . . . . . . . . . .<br>3|
|**4. Adaptaciones Clave en el Código de Python**<br>**3**|
|**5. Seguridad Interna de la API Piloto**<br>**4**|
|**6. Conclusión**<br>**4**|



1 

## **1. Análisis del Código Actual: ¿Qué debemos mejorar?** 

Tras revisar los avances en el código de extracción (ej. `jumbo.py` ), notamos que el programa extrae muy bien la información, pero tiene algunos comportamientos que dificultarán su integración con la API Piloto. Estos son los problemas principales: 

1. **Uso de Archivos Locales (Falta de “Stateless”):** Actualmente, el programa lee las categorías del supermercado desde un archivo de texto ( `jumbo` ~~`c`~~ `ategories.txt` ). En arquitecturas modernas basadas en Docker, los programas deben ser _Sin Estado_ (Stateless), lo que significa que no deben depender de archivos físicos en el disco, ya que si el contenedor se reinicia, el archivo podría perderse. Las rutas a escanear deben venir desde una base de datos o desde la propia API Piloto. 

2. **El camino de los datos está vacío:** El archivo llamado `pipelines.py` (que es por donde salen los datos recolectados) está vacío. Actualmente, los datos se muestran en la consola o se guardan a mano, pero no tienen un mecanismo automático para viajar hacia nuestra API Piloto. 

3. **Ejecución Manual:** Para que el programa funcione, un humano tiene que escribir un comando en la consola ( `scrapy crawl` ). Debemos automatizar esto para que la API en Go pueda encender el scraper sin intervención humana. 

## **2. Evaluación de Alternativas: ¿Sirve Golang para hacer el Scraping directamente?** 

A raíz de nuevas revisiones, surge una pregunta arquitectónica crucial: **¿Es posible realizar el scraping automático directamente a través de una API construida en Golang, sin depender de Python?** 

La respuesta es un rotundo **S**<sup>**´**</sup> **I** . Golang no solo sirve para esto, sino que es estructuralmente superior a Python para tareas de red masivas debido a sus _Goroutines_ (hilos ligeros que consumen apenas 2KB de RAM). 

Dado que el script actual ( `jumbo.py` ) extrae la información leyendo bloques de datos ocultos en formato JSON ( `application/ld+json` ) y no requiere interactuar visualmente con la página, tenemos dos caminos viables: 

### **2.1. Opción A: Scraping Nativo 100 % en Golang (Alternativa Recomendada a futuro)** 

Podemos reescribir el script de Python utilizando librerías nativas de Go como **Colly** o simplemente `net/http` . 

- **Ventajas:** Se elimina por completo la necesidad de conectar dos contenedores distintos. No hay necesidad de _Webhooks_ ni de instalar servidores intermedios. Todo el proceso automático viviría dentro de la misma API de Go, reduciendo el consumo de RAM del servidor Pentium a menos de 20MB. 

- **Desventajas:** Requeriría desechar el código actual en Python ( `jumbo.py` ) y que el equipo aprenda a procesar HTML (usando `goquery` ) en Golang. 

2 

### **2.2. Opción B: Arquitectura Híbrida Automática mediante API (Plan Actual)** 

Si el equipo decide aprovechar el código en Python que ya funciona, la forma de automatizarlo es precisamente **transformar a Scrapy en una API** . Esto se logra instalando un puente intermedio, detallado en la siguiente sección. 

## **3. La Solución Híbrida: Automatización del Scraping vía API** 

Conectar Go y Python puede ser complejo porque corren en contenedores separados. Si hacemos que Go simplemente ejecute un comando de consola para prender a Python, Go se quedará “congelado” esperando a que el scraper termine, bloqueando todo el sistema. 

Para evitar esto, utilizaremos la siguiente estrategia basada completamente en mensajería web (peticiones HTTP): 

### **3.1. 1. El Disparador: Usar Scrapyd** 

**¿Qué es Scrapyd?** Es un servidor oficial y gratuito que envuelve nuestro código de Python y lo convierte en una peque˜na página web. 

**¿Cómo funciona?** En la madrugada, nuestra API Piloto en Go se programará (usando un _Cron_ , que es un reloj alarma interno) para enviar un simple mensaje web (HTTP POST) a la dirección de Scrapyd. Esto actuará como un interruptor que enciende al Scraper de forma automática, permitiendo que Go siga libre atendiendo otras tareas. 

### **3.2. 2. El Regreso de los Datos: Webhooks** 

**¿Qué es un Webhook?** Es como una llamada telefónica inversa. En lugar de que Go esté preguntando a cada rato ”¿Ya terminaste?”, dejamos que Python haga su trabajo tranquilo. 

**¿Cómo funciona?** Modificaremos el `pipelines.py` de Python para que acumule los productos en grupos (ej. 100 productos a la vez). Cuando tenga un grupo listo, Python hará una llamada automática (Webhook) hacia una dirección secreta de nuestra API Piloto en Go ( `/api/piloto/ingesta` ) entregando un paquete de datos en formato JSON. Go recibirá los datos y los guardará en la base de datos. 

## **4. Adaptaciones Clave en el Código de Python** 

Basándonos en la investigación previa sobre Web Scraping, debemos aplicar dos conceptos clave en el archivo `middlewares.py` para evitar que los escudos de seguridad (WAF) de los supermercados bloqueen la conexión de nuestra universidad o domicilio: 

- **Jitter (Comportamiento Humano):** Significa agregar pausas de tiempo aleatorias (ej. esperar entre 1 y 3 segundos) entre cada clic o página descargada. Esto evita que el supermercado detecte que somos un robot extremadamente rápido. 

3 

- **TLS Fingerprinting (Disfraz de Navegador):** Los supermercados revisan la ”huella digital”técnica de nuestra conexión. Usaremos una herramienta llamada `curl` ~~`c`~~ `ffi` para disfrazar nuestra conexión, haciéndole creer al supermercado que nuestra petición proviene de un navegador Google Chrome normal operado por un humano. 

## **5. Seguridad Interna de la API Piloto** 

Nuestra API Piloto tendrá una dirección (ej. `/api/piloto/ingesta` ) que estará esperando recibir los precios desde el scraper de Python. 

Dado que el proyecto utilizará NO-IP para conectarse a Internet, corremos el riesgo de que una persona externa descubra esta dirección e intente enviarnos precios falsos. 

**Solución (Red Interna Privada):** Docker crea una Red WiFi Virtual¨ınterna ( _Docker Bridge Network_ ) entre sus contenedores, la cual es invisible desde Internet. La API Piloto en Go estará programada para revisar la dirección IP de quien le envíe datos. Si la IP proviene de Internet, rechazará el mensaje. Solo aceptará datos si provienen estrictamente de la IP interna asignada al contenedor del Scraper en Python (ej. `172.18.0.x` ). 

## **6. Conclusión** 

Esta API Piloto nos servirá como banco de pruebas para asegurar que la orquestación (encendido, apagado, y transmisión de datos masivos) funcione a la perfección entre Go y Python. Al utilizar Scrapyd y Webhooks, garantizamos que el sistema no se congele, y al implementar el camuflaje de red, cuidamos la integridad de nuestra IP frente a los supermercados. Una vez que este piloto valide el flujo, el código será fácilmente trasladable a la API monolítica principal del proyecto final. 

4 

