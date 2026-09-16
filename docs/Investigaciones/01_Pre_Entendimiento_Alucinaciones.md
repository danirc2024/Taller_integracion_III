# Investigación Técnica: Análisis de Alucinaciones en Modelos de Lenguaje y Estrategias de Validación Estricta

**Autores:** Vicente Matus, Daniela Romero, Renato Carrasco, Fabian Sánchez, Esban Vejar
**Profesor:** Marcelo Matamala
**Fecha:** Septiembre 2026
**Tecnologías Implicadas:** Modelos de Lenguaje Grande (LLMs), Generación Aumentada por Recuperación (RAG), Go, PostgreSQL

---

## 1. Introducción y Relevancia del Problema

La integración de Modelos de Lenguaje Grande (LLMs) en plataformas de comercio electrónico y comparación de precios presenta desafíos críticos en cuanto a la fiabilidad de los datos presentados al usuario final. El fenómeno conocido como "alucinación" ocurre cuando el modelo genera información fluida y gramaticalmente correcta, pero semánticamente inexacta o sin base empírica en el contexto provisto.

En el contexto de un comparador de supermercados, la precisión es el activo más valioso. Una alucinación (por ejemplo, inventar un precio más bajo que el real, sugerir un producto inexistente en el catálogo de Bsale, o falsear ingredientes para una dieta restrictiva) no solo degrada la experiencia del usuario, sino que corrompe el propósito central del sistema. Este documento analiza las causas subyacentes de este fenómeno desde una perspectiva algorítmica y establece el marco teórico necesario para mitigarlo.

## 2. Naturaleza Dual de la Memoria en LLMs

Para comprender por qué un modelo alucina, es imperativo entender cómo almacena y procesa la información. La arquitectura de los Transformers (la base de modelos como GPT o LLaMA) opera con dos tipos de memoria en escenarios de Generación Aumentada por Recuperación (RAG):

### 2.1. Memoria Paramétrica (El origen del sesgo)
Es el conocimiento codificado numéricamente dentro de los "pesos" y "parámetros" de la red neuronal durante su fase de entrenamiento masivo. 
*   **Problema:** Esta memoria es estática y probabilística. Si el modelo fue entrenado con miles de textos donde la palabra "Mantequilla" está asociada al "Supermercado A", los pesos neuronales crearán un sesgo. Al preguntarle sobre mantequilla, el modelo tendrá una tendencia matemática a mencionar el "Supermercado A", incluso si nuestro catálogo actual indica que está agotado.

### 2.2. Memoria No Paramétrica (El contexto inyectado)
Es la información que le proporcionamos al modelo en tiempo real a través del *Prompt* (por ejemplo, los datos obtenidos de nuestra base de datos PostgreSQL).
*   **El Conflicto:** Las alucinaciones ocurren cuando hay una fricción entre ambas memorias. Si el modelo está forzado a responder y la memoria no paramétrica (nuestro JSON del catálogo) es escasa o confusa, el modelo recurrirá a su memoria paramétrica para "rellenar los huecos", generando una respuesta fluida pero completamente inventada para el usuario.

## 3. Limitaciones de la Manipulación de Hiperparámetros

Una falsa creencia común en el desarrollo de software con IA es que las alucinaciones se eliminan simplemente ajustando los hiperparámetros de la API (Temperatura y Top-P).

### 3.1. El Mito de la Temperatura a 0.0
La `Temperatura` controla la entropía o aleatoriedad en la selección del siguiente token. Una temperatura de `0.0` hace que el modelo sea determinista (siempre elegirá la palabra con mayor probabilidad matemática). 
Sin embargo, **esto no evita la alucinación**. Si debido al sesgo paramétrico, la respuesta alucinada tiene una probabilidad del 80% frente a un 20% de la respuesta basada en el contexto, un modelo a temperatura `0.0` siempre emitirá la respuesta alucinada de forma determinista (fenómeno conocido como *Prior Probability Bias*).

## 4. Métricas de Evaluación de Alucinaciones

En entornos de producción, medir la tasa de alucinación es complejo porque las métricas clásicas de procesamiento de lenguaje natural (como BLEU o ROUGE) solo miden la similitud de palabras, no la veracidad de los hechos.

Para nuestro sistema, el estándar de evaluación no debe ser la "fluidez", sino la **Fidelidad al Contexto (Contextual Faithfulness)**. La industria actualmente utiliza enfoques de *Self-Consistency*, donde se le pregunta al modelo la misma consulta varias veces o se utiliza un modelo secundario y más pequeño exclusivamente para auditar que cada sustantivo (producto, precio) mencionado en la respuesta de la IA exista textualmente en el catálogo base.

## 5. Conclusión del Pre-Entendimiento

Las alucinaciones no son un simple error de código (bug), sino una característica inherente a la arquitectura probabilística de los LLMs. Tratar de suprimir la memoria paramétrica del modelo es imposible sin re-entrenarlo (Fine-Tuning). Por lo tanto, la única vía factible para un comparador de supermercados es diseñar una **Arquitectura Híbrida** (detallada en el siguiente documento) que restrinja estrictamente el espacio de respuestas del modelo y delegue la lógica determinista a herramientas de backend tradicionales, utilizando la IA puramente como un motor de síntesis de lenguaje y no como una base de datos.

## 6. Referencias (Normas APA)

*   Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., ... & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys*, 55(12), 1-38.
*   Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., ... & Yih, W. T. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems*, 33, 9459-9474.
*   Maynez, J., Narayan, S., Bohnet, B., & McDonald, R. (2020). On faithfulness and factuality in abstractive summarization. In *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics* (pp. 1906-1919).
