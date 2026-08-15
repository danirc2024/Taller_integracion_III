# Arquitectura de Comunicación Inter-Dominios (Propuesta Starter)

Tras erradicar el antipatrón de Base de Datos Compartida, los microservicios están oficialmente aislados. Ahora nace la pregunta: **¿Cómo el Scraper le entrega los precios a la API Gateway si ya no puede escribirlos en su tabla?**

A continuación, presento una solución "Starter" rápida de implementar, junto con su evolución natural a futuro para que la arquitectura siga siendo mutable.

---

## 1. Solución Starter: Webhooks Internos (API REST)

La forma más directa y limpia para comenzar es que el Scraper actúe como un cliente HTTP y le "hable" a la API mediante una ruta interna.

**El Flujo:**
1. El `scraper_supermercados` extrae un producto de la web.
2. En lugar de hacer un `INSERT SQL`, ejecuta una petición `POST` hacia la red interna de Docker (`http://api_gateway:8000/api/v1/internal/productos`).
3. El `api_gateway` recibe el JSON, valida que los datos sean correctos mediante Pydantic (Validación de Negocio) y los guarda en su propia base de datos (`api_db`).

**¿Por qué es la mejor opción para iniciar?**
- Facilísimo de depurar. Si algo falla, el Scraper verá un error `400 Bad Request` en su log.
- Responsabilidad Segregada: La API es la guardiana de sus datos; ella decide qué entra y qué no.

**Código de Ejemplo (Para el Pipeline del Scraper):**
```python
import requests

def procesar_item(item):
    url = "http://api_gateway:8000/api/v1/internal/productos"
    payload = {
        "nombre": item["nombre"],
        "precio": item["precio"],
        "supermercado": item["supermercado"]
    }
    # Un header simple para evitar que cualquiera pegue en este endpoint
    headers = {"X-Scraper-Secret": "tu_secreto_interno"}
    requests.post(url, json=payload, headers=headers)
```

---

## 2. Solución Evolutiva: Colas de Mensajes Asíncronas (Redis)

Si en el futuro escalan el proyecto y el Scraper comienza a raspar 10,000 productos por segundo, las peticiones HTTP (`POST`) van a colapsar y ahogar a la API Gateway (y al Pentium). En ese momento, deben mutar a **Colas Asíncronas**.

**El Flujo:**
1. El Scraper extrae los productos y, en lugar de llamar a la API, inserta los datos en una cola de Redis (Ej: canal `nuevos_productos`).
2. El Scraper sigue trabajando a toda velocidad sin esperar respuestas (Asincronía total).
3. La `api_gateway` tiene un "Worker" que escucha la cola de Redis, saca los productos uno por uno a su propio ritmo seguro, y los guarda en `api_db`.

**Ventaja principal:**
Si la API Gateway se apaga o reinicia por un error, el Scraper puede seguir trabajando. Los datos quedarán a salvo en la cola de Redis esperando a que la API reviva.

> **💡 Conclusión:** Recomiendo encarecidamente que inicien implementando la **Solución Starter (Webhooks HTTP)** para ganar velocidad de desarrollo hoy mismo, teniendo la tranquilidad de que Redis ya está orquestado por si necesitan evolucionar mañana.
