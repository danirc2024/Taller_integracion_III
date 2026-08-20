import json
import re
import scrapy


class JumboRscSpider(scrapy.Spider):
    name = "jumbo_rsc"
    allowed_domains = ["jumbo.cl"]

    # 1. URL limpia de la categoría (sin el hash _rsc=...)
    start_urls = ["https://www.jumbo.cl/frutas-y-verduras/verduras"]

    # 2. Cabeceras esenciales para simular la petición de Next.js
    custom_settings = {
        "ROBOTSTXT_OBEY": False,
        "LOG_LEVEL": "INFO",
        "DEFAULT_REQUEST_HEADERS": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            ),
            "RSC": "1",  # Indica a Next.js que envíe solo la capa de datos
            "Accept": "text/x-component",  # Formato del stream de Next.js
        },
    }

    def parse(self, response):
        print("\n" + "=" * 50)
        print(f"STATUS HTTP: {response.status}")
        print(f"TAMAÑO DE RESPUESTA: {len(response.body)} bytes")
        print("=" * 50 + "\n")

        # 3. Extraemos nombres de productos directamente del stream RSC mediante Expresiones Regulares
        raw_text = response.text

        # Busca patrones comunes de texto de productos dentro de la respuesta de Next.js
        productos_encontrados = re.findall(r'"productName":"([^"]+)"', raw_text)

        # Si no encuentra 'productName', busca por etiquetas de elementos del catálogo
        if not productos_encontrados:
            productos_encontrados = re.findall(
                r'"displayName":"([^"]+)"', raw_text
            )

        # Eliminar duplicados manteniendo el orden
        productos_unicos = list(dict.fromkeys(productos_encontrados))

        # 4. En lugar de print, enviamos cada producto con yield
        for nombre in productos_unicos:
            yield {
                "producto": nombre,
                "supermercado": "Jumbo"
            }