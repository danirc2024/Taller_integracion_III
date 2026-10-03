# Guía Técnica y Manual Operativo Paso a Paso: Implementación y Uso de Pull Requests (PR)

### Autores: Vicente Matus, Daniela Romero, Renato Carrasco, Marcelo Matamala, Fabian Sánchez, Esban Vejar

---

## 1. Introducción
Un **Pull Request (PR)** es el mecanismo mediante el cual un desarrollador pide permiso para integrar su código a la rama principal. Actúa como un punto de control de calidad obligatorio, evitando que código con errores llegue a `develop` o `main`.

---

## 2. Fase de Implementación: Configuración del Encargado (Admin)

Este paso debe realizarlo **únicamente el dueño o encargado del repositorio** en GitHub. Su propósito es bloquear la rama `develop` (y `main`) para que nadie pueda subir código directamente usando `git push`.

**Pasos exactos en la interfaz de GitHub:**
1. Abre tu repositorio en GitHub y haz clic en la pestaña superior **Settings** (el ícono de la rueda dentada).
2. En el menú lateral izquierdo, bajo la sección *Code and automation*, haz clic en **Branches**.
3. Haz clic en el botón derecho **Add branch protection rule** (Añadir regla de protección de rama).
4. En el campo **Branch name pattern** (Patrón del nombre de rama), escribe exactamente la palabra: `develop`.
5. En las opciones de abajo, marca la casilla **"Require a pull request before merging"**. Al marcarla, se desplegarán más opciones.
6. Dentro de esas opciones, asegúrate de marcar **"Require approvals"** y verifica que el número desplegable esté en **1** (significa que se necesita al menos 1 compañero que apruebe).
7. (Opcional pero recomendado) Marca **"Require conversation resolution before merging"** para que los PR no se puedan fusionar si hay dudas sin responder.
8. Baja hasta el final de la página y haz clic en el botón verde **Create** (o Save changes).
9. Repite los pasos 3 al 8, pero escribiendo `main` en el patrón del nombre, para proteger también la rama de producción.

> ⚠️ **Resultado:** Si alguien intenta hacer `git push origin develop` desde su consola, GitHub le mostrará un mensaje de error rojo bloqueando la subida. La única vía de acceso será el Pull Request.

---

## 3. Fase de Uso: Ciclo de Vida del Pull Request (Paso a Paso)

Supongamos que ya terminaste de programar tu tarea, hiciste `git commit` y ejecutaste `git push origin frontend/feat/login-vicente`.

### Paso A: Creación del Pull Request (Rol: Autor del Código)
1. Ingresa a la página principal de tu repositorio en GitHub.com.
2. Arriba de la lista de archivos, verás un recuadro amarillo indicando tu subida reciente con un botón verde que dice **"Compare & pull request"**. Haz clic ahí.
   - *Ruta alternativa:* Ve a la pestaña **Pull requests** > Botón **New pull request**. 
3. Verifica los menús desplegables grises en la parte superior:
   - **base:** `develop` (Hacia dónde va tu código).
   - **compare:** `frontend/feat/login-vicente` (Tu rama de trabajo).
4. **Título y Descripción:** Completa la caja de texto explicando exactamente qué hiciste, qué archivos tocaste y cómo tus compañeros pueden probar tu código en sus máquinas.
5. En el menú lateral derecho, haz clic en **Reviewers** (Revisores) y selecciona el nombre del compañero o "encargado" que debe revisar tu código.
6. Haz clic en el botón verde **Create pull request**.

### Paso B: Revisión de Código / Code Review (Rol: Revisor / Encargado)
El compañero asignado como revisor recibe la notificación y entra al Pull Request.
1. Haz clic en la pestaña superior llamada **"Files changed"** (Archivos cambiados). Aquí verás el código original en rojo (lo que se borró) y el nuevo en verde (lo que se añadió).
2. Lee el código. Si encuentras un error (ej. una variable mal escrita), **pasa el ratón sobre el número de la línea afectada**. Aparecerá un cuadrado azul con un signo **`+`**.
3. Haz clic en el **`+`**, escribe tu comentario (ej. "Te faltó validar este campo de contraseña") y haz clic en **Start a review**.
4. Repite esto con todas las líneas que tengan errores.
5. Cuando termines de revisar, ve a la esquina superior derecha de la pantalla y haz clic en el botón verde **Review changes**. Se abrirá un menú:
   - **Comment:** Para dejar un comentario general sin aprobar ni rechazar.
   - **Approve:** Si el código está perfecto y listo para fusionarse.
   - **Request changes:** Si encontraste errores y el autor debe arreglarlos obligatoriamente.
6. Selecciona la opción deseada y haz clic en **Submit review**.

### Paso C: Subsanar Errores (Rol: Autor del Código)
Si el revisor te marcó la opción *Request changes*, **no cierres ni hagas un nuevo Pull Request**.
1. Vuelve a tu Visual Studio Code o editor local, en tu misma rama de trabajo.
2. Arregla los errores de código que te marcaron.
3. Guarda, haz `git add .`, seguido de `git commit -m "fix: aplica correcciones solicitadas"`.
4. Ejecuta `git push origin tu-rama`.
5. El Pull Request en GitHub detectará la subida y se actualizará mágicamente. El revisor podrá volver a evaluarlo.

### Paso D: Fusión y Limpieza (Rol: Encargado / Autor)
Una vez que el PR recibe el ticket verde de *Approved*, está listo para entrar a `develop`.
1. Ve al final de la página del Pull Request en GitHub.
2. Verás un botón verde grande que dice "Merge pull request". **Haz clic en la flecha hacia abajo que está junto a él** para abrir las opciones.
3. Selecciona **Squash and merge** (Aplastamiento y Fusión). 
   - *Nota Técnica:* Usar Squash es vital porque toma todos tus commits ("intento 1", "arreglo bug", "borrando console logs") y los comprime en un único y limpio commit final en `develop`, manteniendo el historial ordenado.
4. Presiona **Confirm squash and merge**.
5. Inmediatamente aparecerá un botón morado/gris que dice **Delete branch**. Haz clic ahí para borrar tu rama de GitHub, ya que su ciclo de vida ha terminado y su código ya es parte de `develop`.

---

## 4. Anexo: Resolución de Conflictos Estructurales (Merge Conflicts)

Si al crear el Pull Request GitHub muestra el mensaje "Can't automatically merge", significa que tú y otro compañero editaron exactamente la misma línea del mismo archivo.

**Cómo resolverlo en 5 pasos locales:**
1. En tu terminal, asegúrate de estar en tu rama: `git checkout tu-rama`
2. Trae la versión más nueva del servidor: `git pull origin develop`
3. Git indicará que hay archivos en conflicto. Ábrelos en tu editor de código (como VSCode).
4. Verás bloques delimitados por `<<<<<<< HEAD` y `======`. VSCode te mostrará botones sobre ese código: *Accept Current Change* (mantener tu código), *Accept Incoming Change* (mantener lo que bajó de develop) o *Accept Both Changes*.
5. Toma la decisión arquitectónica correcta, guarda el archivo, y ejecuta:
   `git add .`
   `git commit -m "fix: resuelve conflicto de fusion"`
   `git push origin tu-rama`
6. El Pull Request en la página web pasará a estar verde y listo para el paso final.

## 💥 Cómo Resolver Conflictos de Merge

Si GitHub te dice **"This branch has conflicts that must be resolved"**, significa que tú y otro compañero editaron la misma línea de código. 

### Opción A: Resolver en GitHub (Para conflictos pequeños)
1. Haz clic en el botón gris **"Resolve conflicts"** en la página del PR.
2. GitHub te mostrará el editor web. Verás marcas como `<<<<<<<`, `=======` y `>>>>>>>`.
3. Borra las marcas y deja solo el código final que debe sobrevivir.
4. Haz clic en **"Mark as resolved"** y luego en **"Commit merge"**.

### Opción B: Resolver en VSCode (Para conflictos grandes)
Si el conflicto es en muchos archivos (ej. un `schema.sql` gigante), hazlo localmente:
1. Asegúrate de estar en tu rama: `git checkout tu-rama`
2. Trae los cambios de develop: `git fetch origin`
3. Inicia la fusión: `git merge origin/develop`
4. Abre VSCode. En la pestaña de Source Control (Control de Código Fuente) verás los archivos en conflicto. VSCode te dará botones amigables que dicen "Accept Current Change", "Accept Incoming Change" o "Accept Both Changes".
5. Una vez arreglado todo, haz `git add .`, luego `git commit -m "Resuelve conflictos"` y súbelo con `git push`.
6. ¡Listo! Tu PR en GitHub ahora aparecerá verde y listo para fusionar.
