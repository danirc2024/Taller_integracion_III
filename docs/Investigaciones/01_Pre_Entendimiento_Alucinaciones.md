# Investigación Técnica: Análisis de Alucinaciones en Modelos de Lenguaje y Estrategias de Validación Estricta

**Autores:** Vicente Matus, Daniela Romero, Renato Carrasco, Fabian Sánchez, Esban Vejar
**Profesor:** Marcelo Matamala
**Fecha:** Septiembre 2026
**Tecnologías Implicadas:** Modelos de Lenguaje Grande (LLMs), Generación Aumentada por Recuperación (RAG), Go, PostgreSQL

---

## 1. Introducción

La integración de Modelos de Lenguaje Grande (LLMs) en plataformas de comercio electrónico y comparación de precios presenta desafíos críticos en cuanto a la fiabilidad de los datos presentados al usuario final. El fenómeno conocido como "alucinación" (Ji et al., 2023) ocurre cuando el modelo genera información fluida y gramaticalmente correcta, pero semánticamente inexacta o sin base empírica en el contexto provisto.

En el contexto de nuestra plataforma, una alucinación (ej. inventar un precio, sugerir un producto inexistente en el catálogo o falsear ingredientes de una receta) no solo degrada la experiencia del usuario, sino que corrompe el propósito central del comparador. El presente documento analiza las causas subyacentes de este fenómeno y propone un modelo arquitectónico híbrido para mitigar el gasto de tokens y garantizar un índice de alucinación cercano a cero (0%), basando las respuestas exclusivamente en el catálogo validado por el backend.

## 2. Causas Subyacentes de las Alucinaciones en LLMs

Las investigaciones recientes clasifican las alucinaciones en dos categorías principales: intrínsecas (contradicen la información de la fuente) y extrínsecas (no pueden ser verificadas ni refutadas por la fuente) (Maynez et al., 2020). Las causas fundamentales en sistemas interactivos incluyen:

1.  **Dependencia Excesiva en la Memoria Paramétrica:** Los LLMs tienden a responder utilizando el conocimiento codificado en sus pesos (memoria paramétrica) durante el entrenamiento, ignorando o sobreescribiendo el contexto factual proporcionado en tiempo de inferencia (memoria no paramétrica o externa) (Lewis et al., 2020).
2.  **Desalineación de Temperatura y Top-P:** Configuraciones orientadas a la creatividad (Temperatura > 0.7) aumentan la entropía en la selección de tokens, forzando al modelo a generar respuestas estadísticamente probables pero factualmente incorrectas.
3.  **Insuficiencia de *Grounding*:** La falta de anclaje (grounding) estricto al conocimiento proporcionado. Si la base de datos retorna información vacía, el modelo llena el vacío con invenciones.

## 3. Estrategia Híbrida: Arquitectura "Call Center" y LLM bajo Demanda

Para hacer frente a estas limitaciones y optimizar el consumo computacional (reducción drástica de tokens procesados), se propone una arquitectura de dos capas. Esta arquitectura asume que no toda interacción de usuario requiere el poder inferencial de un LLM.

### 3.1. Capa 1: Enrutador Heurístico Estocástico (Bot "Call Center")
La primera línea de interacción consistirá en un bot de reglas finitas (Finite State Machine) y procesamiento de lenguaje natural tradicional (NLP clásico o coincidencia de intenciones simple). 
*   **Funcionamiento:** Actúa como un menú interactivo inteligente o triage. Responde preguntas frecuentes y ejecuta búsquedas directas en el catálogo utilizando consultas SQL estrictas u ORM (Go/GORM).
*   **Ventajas:** Costo de inferencia nulo (0 tokens consumidos por interacción de LLM), latencia mínima (< 50ms) e imposibilidad matemática de alucinar, dado que retorna arreglos de JSON extraídos directamente de PostgreSQL.

### 3.2. Capa 2: Motor Generativo Condicional (LLM Restringido)
El modelo de lenguaje solo se invocará cuando la Capa 1 clasifique la intención del usuario como compleja. Ejemplos de uso condicional:
*   Generación de una receta con productos *específicos* en stock.
*   Comparativas semánticas complejas ("¿Qué productos sin gluten son más baratos para hacer un pastel?").

En esta capa, el consumo de tokens está justificado por el valor agregado de la síntesis de información.

## 4. Mecanismo de Validación de Respuestas (RAG Estricto)

Cuando la Capa 2 (LLM) es invocada, su generación debe estar "anclada" (grounded) a la realidad del catálogo. Para ello, se implementará una versión estricta de Generación Aumentada por Recuperación (RAG) complementada con Inyección de Contexto Restrictivo.

### 4.1. *Prompt Engineering* Orientado a la Contención
El comportamiento del LLM estará gobernado por un *System Prompt* diseñado metodológicamente para inhibir la memoria paramétrica:

> "Eres un asistente de compras experto. Tu única fuente de verdad es el documento JSON adjunto bajo la etiqueta `<CATALOGO>`. NO utilices conocimiento externo. Si el usuario pregunta por productos, precios o recetas que requieran ingredientes no listados en `<CATALOGO>`, DEBES responder textualmente: 'No poseo información validada sobre este producto en nuestro catálogo actual'. Si te piden una receta, genérala ÚNICAMENTE utilizando los ingredientes provistos."

### 4.2. Flujo de Datos Seguro en Backend (Go)
1.  **Captura:** El usuario solicita una receta de pizza barata.
2.  **Consulta Backend:** Go intercepta la consulta, busca en la base de datos (PostgreSQL/Redis) los ingredientes disponibles más baratos para pizza.
3.  **Inyección:** Go empaqueta estos ingredientes (nombre, marca, precio, stock) en un JSON estructural.
4.  **Inferencia:** Go envía el JSON + el Prompt Restrictivo a la API de la IA (Temperatura ajustada a 0.1 o 0.2 para respuestas deterministas).
5.  **Sanitización de Salida:** (Post-procesamiento) El backend en Go aplica una heurística para verificar que los productos mencionados en la respuesta del LLM existan en un diccionario de entidades válidas del contexto inyectado. Si el LLM menciona un producto que no estaba en el JSON, la respuesta es descartada (reintento o fallback).

## 5. Conclusiones y Plan de Implementación

Desarrollar una IA sin controles en un entorno de comercio electrónico expone al sistema a fallos críticos de fiabilidad. La propuesta arquitectónica híbrida resuelve el dilema al tratar al LLM no como un buscador, sino como un **sintetizador de datos previamente filtrados y validados por el backend**.

El uso del bot de "Call Center" (Capa 1) actuará como escudo financiero contra el sobreconsumo de tokens, delegando a la IA (Capa 2) únicamente tareas de alto razonamiento. Este documento normativo sienta las bases para el desarrollo en Go de los controladores de inteligencia artificial durante los próximos sprints.

## 6. Referencias (Normas APA)

*   Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., ... & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys*, 55(12), 1-38. https://doi.org/10.1145/3571730
*   Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., ... & Yih, W. T. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems*, 33, 9459-9474.
*   Maynez, J., Narayan, S., Bohnet, B., & McDonald, R. (2020). On faithfulness and factuality in abstractive summarization. In *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics* (pp. 1906-1919).
