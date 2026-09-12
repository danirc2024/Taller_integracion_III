# Investigación Técnica: Prevención de Inyecciones SQL y Sanitización de Entradas en Go

**Autores:** Vicente Matus, Daniela Romero, Renato Carrasco, Fabian Sánchez, Esban Vejar
**Profesor:** Marcelo Matamala
**Fecha:** Septiembre 2026
**Tecnologías Implicadas:** Go (Golang), PostgreSQL, GORM, React (Frontend)

---

## 1. Introducción y Planteamiento del Problema

En el desarrollo de nuestro comparador de supermercados, la "Barra de Búsqueda" es el componente con mayor exposición pública. Un usuario malintencionado podría utilizar este input para inyectar código SQL destructivo.

**El clásico ataque (Little Bobby Tables):**
Si un usuario busca el producto: `'; DROP TABLE productos; --`
Y nuestro backend en Go concatena directamente el texto en la consulta:
```go
// ❌ PRÁCTICA PELIGROSA Y VULNERABLE
query := "SELECT * FROM productos WHERE nombre = '" + inputBusqueda + "';"
db.Exec(query)
```
La base de datos ejecutará dos comandos:
1. `SELECT * FROM productos WHERE nombre = '';`
2. `DROP TABLE productos;` (Destrucción total de los datos).
3. `--` (Ignora el resto de la consulta).

El objetivo de esta investigación es establecer los estándares arquitectónicos para que nuestra API en Go (Golang) sanitice y bloquee estas amenazas antes de que lleguen a PostgreSQL.

---

## 2. Prevención en Go a Nivel de Base de Datos

### 2.1. Uso de Consultas Preparadas (Prepared Statements)
La regla de oro para evitar Inyecciones SQL en cualquier lenguaje es **jamás concatenar strings**. En Go, el paquete nativo `database/sql` y los drivers de PostgreSQL soportan *Prepared Statements*. 

Esto significa que enviamos la estructura de la consulta separada de los datos, y PostgreSQL los trata estrictamente como texto, nunca como comandos ejecutables.

```go
// ✅ PRÁCTICA SEGURA (database/sql nativo)
// El símbolo $1 actúa como un marcador de posición seguro en PostgreSQL.
query := "SELECT id, nombre, precio FROM productos WHERE nombre ILIKE $1"
filas, err := db.Query(query, "%"+inputBusqueda+"%")
```
En este caso, si el input es `'; DROP TABLE...`, PostgreSQL buscará literalmente un producto cuyo nombre sea ese texto, sin ejecutar el comando.

### 2.2. Prevención Automática usando GORM
Dado que nuestro proyecto integra **GORM** como ORM principal (establecido en la rama de configuración de Docker), tenemos una capa de seguridad automática. GORM utiliza consultas preparadas por defecto bajo el capó.

```go
// ✅ PRÁCTICA SEGURA Y RECOMENDADA EN NUESTRO PROYECTO (GORM)
var productos []Producto
// GORM escapa automáticamente el contenido inyectado en el símbolo '?'
db.Where("nombre ILIKE ?", "%"+inputBusqueda+"%").Find(&productos)
```

**⚠️ Cuidado con la vulnerabilidad en GORM:**
GORM no te salva si obligas la concatenación directa en condiciones complejas.
```go
// ❌ ESTO SIGUE SIENDO VULNERABLE INCLUSO USANDO GORM
db.Where("nombre ILIKE '%" + inputBusqueda + "%'").Find(&productos)
```

---

## 3. Sanitización Estricta (Input Validation)

Depender solo de *Prepared Statements* nos protege de la inyección SQL, pero no evita que el usuario envíe basura (ej. 10,000 caracteres de largo, o caracteres especiales que rompan el frontend mediante XSS). Debemos filtrar el input apenas entra a los controladores de Go.

### 3.1. Validación de Longitud y Caracteres (Regex)
Antes de siquiera llamar a la base de datos, el controlador en Go debe limpiar la petición.

```go
import (
    "regexp"
    "strings"
)

func SanitizarBusqueda(input string) string {
    // 1. Quitar espacios en blanco al inicio y final
    limpio := strings.TrimSpace(input)
    
    // 2. Limitar la longitud máxima (ej. 100 caracteres)
    if len(limpio) > 100 {
        limpio = limpio[:100]
    }
    
    // 3. (Opcional) Filtrar solo caracteres alfanuméricos y espacios básicos
    // Útil si sabemos que los productos no tienen caracteres muy extraños.
    reg := regexp.MustCompile(`[^a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ\-]`)
    limpio = reg.ReplaceAllString(limpio, "")
    
    return limpio
}
```

---

## 4. El Rol del Frontend (React)

La validación en el Frontend **no es una medida de seguridad** (cualquier atacante puede hacer un request HTTP directo a la API usando Postman o cURL saltándose el Frontend de React). Sin embargo, el Frontend es crucial para la **Experiencia de Usuario (UX)**.

*   **Bloqueo Visual:** React debe limitar el `maxLength="100"` en el `<input>` de búsqueda.
*   **Sanitización XSS:** React escapa automáticamente las variables inyectadas en JSX (evitando Cross-Site Scripting), pero si la API devuelve texto que el Frontend fuerza como HTML (`dangerouslySetInnerHTML`), podríamos sufrir ataques.

---

## 5. Conclusiones y Plan de Implementación para el Equipo

Para garantizar la seguridad de la base de datos en la migración a Go, el equipo adoptará las siguientes directrices obligatorias:

1.  **Cero Concatenación:** Queda estrictamente prohibido concatenar variables directas en strings SQL dentro del backend. Todo debe pasar por los métodos tipados de GORM (`db.Where("col = ?", valor)`).
2.  **Capa de Validación Inicial:** Todos los endpoints de búsqueda pública deberán pasar por una función de limpieza o Middleware en Go que límite la longitud a 100 caracteres antes de procesarla.
3.  **Seguridad por Defecto:** PostgreSQL tratará cualquier input sospechoso como texto de búsqueda plana gracias a las Prepared Statements nativas impulsadas por GORM y el driver pgx.
