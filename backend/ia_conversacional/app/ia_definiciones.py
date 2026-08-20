"""
Definiciones para que el modelo no alucine y no responda con texto libre

Groq y Gemini esperan formatos ligeramente distintos para declarar la
funcion (Groq envuelve todo en {"type": "function", "function": {...}},
Gemini va directo con name/description/parameters), asi que hay una
definicion por proveedor aunque el contenido sea casi lo mismo

Hay que ver formas de optimizar esto mas adelante.
"""

definicion_funcion_filtros = {
    "type": "function",
    "function": {
        "name": "extraer_filtros_busqueda",
        "description": (
            "Extrae los parametros de busqueda de productos a partir del "
            "mensaje en lenguaje natural del usuario."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "precio_max": {
                    "type": "number",
                    "description": (
                        "Precio maximo en pesos chilenos que el usuario "
                        "esta dispuesto a pagar. Si el usuario no menciona "
                        "un precio, NO incluyas esta clave en la llamada. "
                        "Nunca escribas un texto como 'omision', 'ninguno' "
                        "o null en este campo: o va un numero real, o la "
                        "clave no aparece."
                    ),
                },
                "categoria": {
                    "type": "string",
                    "description": (
                        "Categoria del producto buscado, por ejemplo: "
                        "verduras, frutas, lacteos, panaderia, abarrotes, "
                        "carnes. Si el usuario no menciona una categoria, "
                        "NO incluyas esta clave en la llamada."
                    ),
                },
                "distancia_max": {
                    "type": "number",
                    "description": (
                        "Distancia maxima en km que el usuario esta "
                        "dispuesto a recorrer. Si el usuario no menciona "
                        "una distancia (aunque diga 'cerca' sin dar un "
                        "numero), NO incluyas esta clave en la llamada. "
                        "Nunca escribas un texto como 'omision', 'ninguno' "
                        "o null en este campo: o va un numero real, o la "
                        "clave no aparece."
                    ),
                },
                "palabras_clave": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "Lista de terminos de busqueda que ayudan a encontrar "
                        "productos reales relacionados con el pedido, MAS "
                        "ALLA de solo repetir palabras textuales del mensaje. "
                        "Usa tu propio conocimiento general para asociar el "
                        "pedido con productos o caracteristicas concretas, "
                        "incluso si la conexion no es obvia o el pedido no "
                        "es sobre comida. Ejemplos: 'algo con tomate' -> "
                        "['tomate']; 'receta con tomate y ajo' -> ['tomate', "
                        "'ajo']; 'comida salada que tenga platano' -> "
                        "['platano', 'tostones', 'chicharron de platano', "
                        "'platano frito'] (asociaciones reales de platano en "
                        "preparaciones saladas, no solo la palabra literal); "
                        "'lavadora barata con bajo consumo' -> ['lavadora', "
                        "'bajo consumo', 'eficiente']; 'quiero hacer pebre' -> "
                        "['tomate', 'cebolla', 'cilantro', 'aji verde', "
                        "'limon'] (los ingredientes REALES de la receta "
                        "chilena de pebre, nunca la palabra 'pebre' en si, "
                        "porque esa palabra no es un producto de venta); "
                        "'quiero hacer cazuela' -> ['papa', 'zapallo', "
                        "'choclo', 'carne', 'zanahoria']. Si el usuario "
                        "menciona el nombre de una receta o plato (chileno o "
                        "no) que no reconoces con certeza, igual responde "
                        "con tu mejor estimacion de ingredientes tipicos en "
                        "vez de dejar el campo vacio -- una asociacion "
                        "aproximada sirve mas que ninguna. Incluye tanto los "
                        "terminos literales del usuario como asociaciones "
                        "razonables. Si el pedido ya es una categoria amplia "
                        "y generica (ej. 'verduras baratas'), usa 'categoria' "
                        "en vez de esto y deja este campo vacio."
                    ),
                },
            },
            "required": [],
        },
    },
}


# Misma idea que la funcion de Groq pero Gemini espera la declaracion
# sin el wrapper {"type": "function", "function": {...}} del OpenAI --
# va directo al name/description/parameters
definicion_funcion_filtros_gemini = {
    "name": "extraer_filtros_busqueda",
    "description": (
        "Extrae los parametros de busqueda de productos a partir del "
        "mensaje en lenguaje natural del usuario."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "precio_max": {
                "type": "number",
                "description": (
                    "Precio maximo en pesos chilenos que el usuario esta "
                    "dispuesto a pagar. Si el usuario no menciona un "
                    "precio, NO incluyas esta clave. Nunca escribas texto "
                    "como 'omision' o null aqui: o va un numero real, o "
                    "la clave no aparece."
                ),
            },
            "categoria": {
                "type": "string",
                "description": (
                    "Categoria del producto buscado, por ejemplo: verduras, "
                    "frutas, lacteos, panaderia, abarrotes, carnes. Si el "
                    "usuario no menciona una categoria, NO incluyas esta "
                    "clave."
                ),
            },
            "distancia_max": {
                "type": "number",
                "description": (
                    "Distancia maxima en km que el usuario esta dispuesto "
                    "a recorrer. Si el usuario no menciona una distancia "
                    "(aunque diga 'cerca' sin dar un numero), NO incluyas "
                    "esta clave. Nunca escribas texto como 'omision' o "
                    "null aqui: o va un numero real, o la clave no "
                    "aparece."
                ),
            },
            "palabras_clave": {
                "type": "array",
                "items": {"type": "string"},
                "description": (
                    "Lista de terminos de busqueda que ayudan a encontrar "
                    "productos reales relacionados con el pedido, MAS ALLA "
                    "de solo repetir palabras textuales del mensaje. Usa tu "
                    "propio conocimiento general para asociar el pedido con "
                    "productos o caracteristicas concretas, incluso si la "
                    "conexion no es obvia o el pedido no es sobre comida. "
                    "Ejemplos: 'algo con tomate' -> ['tomate']; 'receta con "
                    "tomate y ajo' -> ['tomate', 'ajo']; 'comida salada que "
                    "tenga platano' -> ['platano', 'tostones', 'chicharron "
                    "de platano', 'platano frito'] (asociaciones reales de "
                    "platano en preparaciones saladas, no solo la palabra "
                    "literal); 'lavadora barata con bajo consumo' -> "
                    "['lavadora', 'bajo consumo', 'eficiente']; 'quiero "
                    "hacer pebre' -> ['tomate', 'cebolla', 'cilantro', "
                    "'aji verde', 'limon'] (los ingredientes REALES de la "
                    "receta chilena de pebre, nunca la palabra 'pebre' en "
                    "si, porque esa palabra no es un producto de venta); "
                    "'quiero hacer cazuela' -> ['papa', 'zapallo', 'choclo', "
                    "'carne', 'zanahoria']. Si el usuario menciona el "
                    "nombre de una receta o plato que no reconoces con "
                    "certeza, igual responde con tu mejor estimacion de "
                    "ingredientes tipicos en vez de dejar el campo vacio -- "
                    "una asociacion aproximada sirve mas que ninguna. "
                    "Incluye tanto los terminos literales del usuario como "
                    "asociaciones razonables. Si el pedido ya es una "
                    "categoria amplia y generica (ej. 'verduras baratas'), "
                    "usa 'categoria' en vez de esto y deja este campo vacio."
                ),
            },
        },
        "required": [],
    },
}
