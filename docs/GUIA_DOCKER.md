# Guía de Uso Rápido de Docker (Equipo de Desarrollo)

Esta guía documenta los pasos necesarios para que cualquier miembro del equipo pueda levantar el entorno completo de la plataforma de comparación de supermercados (Frontend, Backend, Scraper, Base de Datos) de manera estandarizada y sin tener que instalar lenguajes de programación locales.

## 1. Dependencias del Entorno e Instalación

La arquitectura del proyecto requiere la instalación del motor de **Docker** (para la construcción de contenedores vía `Dockerfile`) y **Docker Compose** (para la orquestación y despliegue del stack de microservicios). A continuación, se detallan los procedimientos de instalación y configuración según el sistema operativo anfitrión.

### Entornos Linux

#### Arch Linux
En distribuciones basadas en Arch, los paquetes `docker` y `docker-compose` se encuentran disponibles en los repositorios oficiales de la distribución. Ejecute los siguientes comandos:
```bash
sudo pacman -Syu docker docker-compose
# Habilitar e iniciar el demonio systemd de Docker
sudo systemctl enable --now docker.service
# Adicionar el usuario actual al grupo docker (requiere reinicio de sesión o recarga de grupos)
sudo usermod -aG docker $USER
```

#### Fedora
Para entornos basados en Fedora, se recomienda utilizar el repositorio oficial proporcionado por Docker Inc.:
```bash
sudo dnf install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin
# Habilitar e iniciar el demonio systemd de Docker
sudo systemctl enable --now docker
# Adicionar el usuario actual al grupo docker
sudo usermod -aG docker $USER
```

#### Debian
Para distribuciones basadas en Debian (incluyendo Ubuntu y derivadas), el procedimiento estándar requiere la configuración del repositorio oficial mediante APT:
```bash
# Instalación de dependencias de red y criptografía
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Configuración del repositorio en las fuentes de APT
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalación de Docker Engine, CLI y Compose Plugin
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
# Adicionar el usuario actual al grupo docker
sudo usermod -aG docker $USER
```

### Entornos Windows

En sistemas operativos Windows, el despliegue del motor de Docker puede implementarse mediante dos arquitecturas distintas:

#### Arquitectura A: Docker Desktop (Implementación Híbrida/Gráfica)
1. Descargue el instalador oficial de [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. Durante el proceso de instalación, es crítico verificar que la integración con **WSL 2 (Windows Subsystem for Linux)** esté seleccionada, descartando el uso del hypervisor Hyper-V heredado.
3. Inicialice la aplicación Docker Desktop. Este proceso arranca la máquina virtual ligera subyacente e inyecta los binarios de Docker en el PATH del sistema (PowerShell/CMD).

#### Arquitectura B: Docker sobre WSL 2 Nativo (Implementación CLI-only)
Para minimizar el overhead del entorno gráfico y aislar el desarrollo a nivel de kernel de Linux, se recomienda instalar el motor de Docker directamente en una instancia de WSL 2:
1. Despliegue el subsistema WSL junto a una distribución compatible (ej. Debian) ejecutando la siguiente instrucción en una instancia de PowerShell con privilegios de administrador:
   ```powershell
   wsl --install -d Debian
   ```
2. Acceda a la shell interactiva de la distribución desplegada.
3. Ejecute las instrucciones de instalación detalladas en la sección correspondiente a **Debian** (ver arriba).
4. *Nota de compatibilidad WSL:* Las iteraciones recientes de WSL 2 integran soporte para `systemd`, permitiendo la gestión estándar de servicios. En arquitecturas no compatibles, la inicialización del demonio dockerd debe realizarse de forma explícita o mediante scripts de inicio (ej. `sudo service docker start`).

### Validación del Entorno
Independientemente de la arquitectura y sistema operativo anfitrión, ejecute las siguientes instrucciones en la terminal de preferencia para confirmar la accesibilidad y correcta inicialización de los binarios:
```bash
docker --version
docker compose version
```
Una salida estándar informando las versiones de compilación correspondientes, sin retornos de error asociados a privilegios o descriptores de sockets inactivos, indicará que el entorno está operativo para el desarrollo.

> **⚠️ Atención (Error: `failed to connect to the docker API /var/run/docker.sock`):**
> Si al ejecutar comandos de Docker recibes un error indicando que no se puede conectar al socket, significa que el servicio/demonio de Docker no está en ejecución. 
> - En **Linux (Arch/Fedora/Debian):** Asegúrate de haber iniciado el servicio con `sudo systemctl start docker` (y habilitarlo con `enable --now`).
> - En **Windows:** Asegúrate de tener abierta la aplicación de *Docker Desktop*.

> **⚠️ Atención (Error: `permission denied while trying to connect to the docker API`):**
> Si recibes un error de permisos en Linux, significa que el demonio está corriendo pero tu usuario no tiene privilegios para interactuar con él. 
> - **Solución permanente (Recomendada):** Agrega tu usuario al grupo docker y recarga los grupos:
>   ```bash
>   sudo usermod -aG docker $USER
>   newgrp docker
>   ```
> - **Solución rápida temporal:** Ejecuta Docker con privilegios de administrador usando `sudo` (ej. `sudo docker compose up --build`).

---

## 2. Levantar el Proyecto (Modo Desarrollo)

1. **Configurar las variables de entorno:** Copia el archivo de plantilla `.env.example` y renómbralo a `.env`. Esto evitará advertencias de variables vacías (como `OPENAI_API_KEY` o `MAPS_API_KEY`).
   ```bash
   cp .env.example .env
   ```
2. Abre tu terminal y navega hasta la carpeta raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`).
3. Ejecuta el siguiente comando para construir las imágenes y levantar todo el ecosistema en segundo plano:
   ```bash
   docker compose up -d --build
   ```
   *Nota: La primera vez tomará varios minutos mientras descarga las imágenes base (Alpine/Slim) y compila las dependencias de los microservicios.*

3. **Verificar que todo esté corriendo:**
   Ejecuta:
   ```bash
   docker compose ps
   ```
   Deberías ver los contenedores (`api_gateway`, `frontend`, `scraper`, etc.) con estado `Up`.

---

## 3. Comandos Útiles del Día a Día

- **Ver los logs (errores y prints):**
  Para ver qué está pasando en todos los servicios (útil para debugear):
  ```bash
  docker compose logs -f
  ```
  Si solo quieres ver los errores del scraper:
  ```bash
  docker compose logs -f scraper_supermercados
  ```

- **Apagar el proyecto:**
  Cuando dejes de trabajar, apaga todo para liberar RAM en tu PC:
  ```bash
  docker compose down
  ```

- **Reconstruir tras instalar una nueva librería:**
  Si añadiste un nuevo paquete al `package.json` o `requirements.txt`, debes reconstruir la imagen:
  ```bash
  docker compose up -d --build
  ```

---

## 4. Buenas Prácticas del Equipo

1. **Nunca subas binarios pesados al repositorio:** Para eso está el `.dockerignore`.
2. **Usa variables de entorno:** No quemes contraseñas en el código, usa el archivo `.env` que se pasará automáticamente a los contenedores.
3. **Pide ayuda si hay error de memoria:** Si Docker se "congela", avisa. Hemos limitado la RAM con `cgroups` en el `docker-compose.yml` para simular las restricciones del servidor Lenovo de producción.
