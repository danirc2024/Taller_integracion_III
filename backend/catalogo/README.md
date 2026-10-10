# Catálogo y precios

Servicio Go independiente para consultar productos, precios, historial y catálogo
administrativo. No requiere Redis ni importa paquetes de `backend/api`.

```bash
cd backend/catalogo
cp .env.example .env
# Completar DB_URL y JWT_SECRET en .env antes de ejecutar.
set -a
source .env
set +a
go run ./cmd/catalogo
```

El servicio lee variables de entorno; no carga `.env` automáticamente. La clave
JWT debe coincidir con la utilizada por Identidad. La configuración de ejemplo
usa el puerto 8083 para convivir con la API actual.

```bash
go test -race ./...
go vet ./...
go build -o /tmp/catalogo ./cmd/catalogo
```

Desde la raíz del repositorio:

```bash
docker build -t catalogo:local backend/catalogo
bash scripts/smoke_catalogo_compose.sh
```

Consulta la [guía de SUP-267](../../docs/Guias/GUIA_CATALOGO_INDEPENDIENTE.md)
para rutas, permisos, pruebas, límites de compatibilidad y activación en SUP-268.
