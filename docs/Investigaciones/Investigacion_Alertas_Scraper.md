# Investigación: Alertas Tempranas de Caídas del Scraper vía Discord

## 1. El Problema: Caídas Silenciosas
El módulo Scraper tiene la misión crítica de extraer información de precios de supermercados externos. Estas páginas (Jumbo, Santa Isabel, etc.) pueden mutar su DOM (Document Object Model) o cambiar sus mecanismos Anti-Bot sin previo aviso.

Actualmente, si la etiqueta `<script type="application/ld+json">` (de la cual extraemos la metadata) desaparece o cambia su formato estructural, el Scraper fallará en la extracción. 
Si el sistema no detecta esto como un error crítico, podría procesar "0 productos" y sobreescribir la Base de Datos con información vacía, o simplemente dejar de actualizar precios de manera silenciosa, dejando a los usuarios con datos obsoletos.

## 2. Arquitectura Actual del Bot de Discord
Como solución base, ya contamos con el microservicio `bot_discord`. Su arquitectura actual es altamente adaptable:
- **Lenguaje/Framework**: Escrito en Go usando `discordgo` (conexión a la API de Discord) y `gin-gonic` (servidor HTTP).
- **Endpoint Webhook**: Expone la ruta `POST /webhooks/github` en el puerto 8081, que procesa eventos HTTP entrantes.
- **Dockerizado**: Mantenido en la red interna `microservices_net` con un límite estricto de memoria (200MB) mediante Docker Compose.

Al estar en la misma red de Docker (`microservices_net`) que el futuro microservicio del Scraper, la comunicación entre ellos no tiene que salir a internet; será un simple HTTP Request interno.

## 3. Solución Propuesta: Endpoint de Monitoreo Interno
La estrategia consiste en expandir la API REST del Bot de Discord para que no solo escuche a GitHub, sino también a los microservicios internos.

**Flujo del Sistema:**
1. El Scraper ejecuta su tarea programada (Cronjob o petición manual).
2. El Scraper realiza la validación: *¿Se encontró el `ld+json`? ¿La cantidad de productos extraídos es mayor a 0?*
3. Si la validación **falla**, el Scraper aborta inmediatamente la transacción de guardado en Base de Datos (para proteger los datos actuales).
4. El Scraper hace un POST request interno a `http://bot_discord:8081/webhooks/scraper` enviando un JSON con los detalles del error.
5. El Bot de Discord recibe el payload, lo formatea, y dispara una alerta de emergencia (tageando al equipo responsable) en un canal dedicado (ej: `#alertas-scraper`).

## 4. Paso a Paso Teórico de Implementación

Para implementar esta función cuando el equipo esté listo, se deben seguir estos pasos:

### Fase A: Preparación del Bot de Discord (Receptor)
1. **Nuevo Canal de Discord**: Crear un canal `#alertas-scraper` en el servidor y obtener su ID.
2. **Variables de Entorno**: Agregar la variable `DISCORD_ALERTS_CHANNEL_ID` al archivo `.env` del servidor y a `docker-compose.yml`.
3. **Nuevo Endpoint en Gin (`main.go`)**:
   ```go
   r.POST("/webhooks/scraper", func(c *gin.Context) {
       var payload struct {
           Supermercado string `json:"supermercado"`
           Error        string `json:"error"`
           URL          string `json:"url"`
           Criticidad   string `json:"criticidad"` // ej: "ALTA", "MEDIA"
       }
       if err := c.BindJSON(&payload); err != nil {
           c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido"})
           return
       }
       
       // Formatear y enviar mensaje
       msg := fmt.Sprintf("🚨 **ALERTA CRÍTICA DE SCRAPER** 🚨\n**Supermercado**: %s\n**Error**: %s\n**URL**: <%s>\n\n<@&ID_DEL_ROL_DE_DEVS> ¡Revisar urgente!", payload.Supermercado, payload.Error, payload.URL)
       dg.ChannelMessageSend(alertsChannelID, msg)
       
       c.JSON(http.StatusOK, gin.H{"status": "Alerta enviada"})
   })
   ```

### Fase B: Preparación del Scraper (Emisor)
1. En la lógica principal de extracción (usando Colly o la librería HTTP de Go), rodear la búsqueda del `ld+json` con un control de errores:
   ```go
   ldJsonContent := extractLDJson(htmlBody)
   if ldJsonContent == "" {
       // Disparar Alerta
       enviarAlertaDiscord("Jumbo", "Etiqueta ld+json no encontrada o vacía.", targetURL)
       return errors.New("falla crítica: estructura DOM alterada")
   }
   ```
2. **Función de Envío**:
   ```go
   func enviarAlertaDiscord(supermercado, errDesc, url string) {
       // Realizar POST request al Bot
   }
   ```

## 5. Arquitectura Distribuida: Cluster Universitario vs Servidor Local (Pentium)
Es altamente probable que el proyecto final se despliegue en un Cluster de la Universidad. Los clusters universitarios suelen tener firewalls estrictos que **bloquean puertos entrantes**, lo que haría imposible recibir los Webhooks de GitHub.

Por lo tanto, la arquitectura recomendada es **Distribuida**:
- **Scraper, API y Base de Datos**: Viven en el Cluster de la Universidad (aprovechando su alta potencia de procesamiento).
- **Bot de Discord**: Se queda alojado en tu servidor Pentium local.

**¿Cómo se comunican?**
Como el Scraper estará en la Universidad, no podrá usar la red interna de Docker (`microservices_net`) para hablar con el Bot. En su lugar, el Scraper hará el *POST request* a través de internet usando tu dominio No-IP:
`http://lsanehost.zapto.org:8081/webhooks/scraper`

**Seguridad (API Key):**
Para evitar que hackers descubran la URL y saturen el canal de Discord enviando alertas falsas, agregaremos un **Token de Seguridad (Secret)**. El Scraper de la Universidad enviará un header `X-Scraper-Secret: tu_contraseña_secreta`, y el Bot de Discord en el Pentium solo enviará la alerta si esa contraseña coincide.

## Conclusión
Con esta implementación híbrida, la infraestructura se vuelve profesional y tolerante a fallos. El Bot alojado en tu Pentium actuará como la **Torre de Control Independiente**, capaz de monitorear la salud de los servicios alojados en el cluster de la Universidad y alertar inmediatamente ante protecciones anti-bot de los supermercados.
