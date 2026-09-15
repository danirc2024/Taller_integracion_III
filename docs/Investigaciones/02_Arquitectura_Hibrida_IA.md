# Propuesta Arquitectónica: Modelo Híbrido de Inteligencia Artificial y Estrategias de Validación

**Autores:** Vicente Matus, Daniela Romero, Renato Carrasco, Fabian Sánchez, Esban Vejar
**Profesor:** Marcelo Matamala
**Fecha:** Septiembre 2026
**Documento Previo Requerido:** `01_Pre_Entendimiento_Alucinaciones.md`

---

## 1. Introducción al Documento

Una vez establecido el marco teórico sobre por qué los Modelos de Lenguaje (LLMs) sufren de alucinaciones (véase documento de Pre-Entendimiento), el presente reporte detalla las soluciones de software propuestas para la implementación de la IA en nuestro comparador de supermercados. El enfoque prioriza la reducción de costos computacionales (tokens) y la eliminación del riesgo de generar información falsa frente al usuario final.

---

## 2. Solución Arquitectónica Principal (Propuesta del Equipo)

La solución central propuesta por el equipo de desarrollo es la **Arquitectura Híbrida de Enrutamiento Asimétrico** (coloquialmente referida como modelo "Call Center"). Esta arquitectura divide la responsabilidad en dos capas:

### Capa 1: Bot Heurístico (El "Call Center")
En lugar de conectar al usuario directamente con el LLM, toda interacción inicia en una Interfaz de Reglas Finitas.
*   **Mecánica:** El bot ofrece opciones guiadas, botones interactivos o detecta palabras clave básicas (ej. "quiero ver leches").
*   **Ventaja:** Resuelve el 80% de las consultas rutinarias consultando directamente a la base de datos (PostgreSQL vía Go) sin consumir un solo token de IA y con latencia casi nula. El margen de alucinación es matemáticamente 0%.

### Capa 2: LLM bajo Demanda con Contexto Inyectado
Si el usuario solicita algo que requiere análisis (ej. "Arma una receta vegana con un presupuesto de $10.000"), la Capa 1 delega la tarea a la Capa 2.
*   **Mecánica:** Antes de hablar con la IA, el backend en Go realiza una consulta SQL para obtener los productos veganos disponibles por menos de $10.000. Luego, inyecta este catálogo filtrado en el *Prompt* de la IA con una orden estricta: *"Genera la receta usando ÚNICAMENTE estos productos"*.
*   **Ventaja:** La IA no busca en su memoria, simplemente sintetiza y redacta basándose en la lista segura proporcionada por el backend.

---

## 3. Alternativas y Otras Propuestas Evaluadas

Para asegurar la robustez del sistema, se analizaron las siguientes alternativas del estado del arte:

### A. Auto-Corrección Asistida (Self-Reflexion)
*   **Concepto:** Obligar al LLM a generar una respuesta inicial oculta, luego inyectarla en un segundo prompt pidiéndole que verifique si incluyó algún producto fuera de catálogo. Si es válido, se envía al usuario; si no, regenera.
*   **Veredicto:** Altamente seguro, pero **descartado** temporalmente por duplicar el costo económico y la latencia (dos llamadas a la API por cada respuesta).

### B. Fine-Tuning Restrictivo (Modelo Local)
*   **Concepto:** Re-entrenar un modelo de código abierto (ej. Llama 3) inyectando nuestro catálogo directamente en sus pesos neuronales para que aprenda nuestro inventario.
*   **Veredicto:** **Descartado**. El catálogo de supermercados cambia diariamente (precios y stock). Re-entrenar el modelo todos los días requiere granjas de servidores GPU inasumibles para el presupuesto del proyecto.

### C. Generación Aumentada por Recuperación Semántica (Vector DBs)
*   **Concepto:** Convertir nuestro catálogo de PostgreSQL a "Vectores" (usando la extensión `pgvector`). En lugar de buscar productos con SQL clásico (`WHERE nombre LIKE`), se buscan matemáticamente por significado. Por ejemplo, si el usuario pide "algo dulce para el desayuno", la base de datos devuelve automáticamente "Mermelada" y "Cereal" al LLM.

---

## 4. Recomendación Técnica Autónoma

Tras la evaluación de la arquitectura propuesta por el equipo y las alternativas del estado del arte, **se emite la siguiente recomendación técnica para el mediano plazo:**

> 💡 **Recomendación:** Implementar la propuesta del equipo (El Modelo Híbrido "Call Center"), pero complementando la Capa 2 con la **Alternativa C (Búsqueda Vectorial Semántica con `pgvector`)**.

**Justificación de la recomendación:**
La propuesta del "Call Center" del equipo es brillante para ahorrar costos y evitar alucinaciones. Sin embargo, cuando la Capa 2 (LLM) necesite generar una receta, el backend en Go tendrá problemas para saber qué productos enviarle a la IA usando consultas SQL tradicionales (SQL no entiende bien el lenguaje natural). 

Si instalamos la extensión `pgvector` en nuestra base de datos actual (PostgreSQL), Go podrá buscar productos por "contexto semántico" y entregarle a la IA una lista inyectada mucho más precisa. Esto mantiene el costo de tokens bajo (gracias a la Capa 1 del equipo), pero eleva exponencialmente la inteligencia matemática de las búsquedas en la Capa 2, logrando un sistema digno de nivel empresarial.
