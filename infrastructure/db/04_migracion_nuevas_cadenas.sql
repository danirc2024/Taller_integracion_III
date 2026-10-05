-- =======================================================
-- MIGRACIÓN: Agregar cadenas A Cuenta y Cugat
-- Fecha: 2024-10-04
-- Descripción: Agrega las cadenas de supermercado A Cuenta y Cugat
--              con sus sucursales por defecto para la ingesta de scraping.
--              Seguro para ejecutar múltiples veces (idempotente).
-- Uso: psql -U <usuario> -d <base_datos> -f 04_migracion_nuevas_cadenas.sql
-- =======================================================

BEGIN;

-- 1. Insertar cadenas nuevas (no toca las existentes)
INSERT INTO scraper.cadenas_supermercado (id, nombre, url_sitio_web, url_logo, esta_activa, creado_el)
VALUES
    (5, 'A Cuenta', 'https://www.acuenta.cl', '/logos/acuenta.png', true, NOW()),
    (6, 'Cugat',    'https://cugat.cl',       '/logos/cugat.png',   true, NOW())
ON CONFLICT (id) DO UPDATE SET
    url_sitio_web = EXCLUDED.url_sitio_web,
    url_logo      = EXCLUDED.url_logo,
    esta_activa   = EXCLUDED.esta_activa;

-- 2. Actualizar la secuencia para evitar colisiones en auto-creates del Go
SELECT setval(
    'scraper.cadenas_supermercado_id_seq',
    (SELECT MAX(id) FROM scraper.cadenas_supermercado)
);

-- 3. Insertar sucursales por defecto para las cadenas nuevas
--    (punto de referencia online en Temuco para la ingesta del scraper)
INSERT INTO scraper.sucursales_supermercado
    (id, cadena_id, codigo_sucursal, nombre, direccion, comuna, ciudad, lat, lon, esta_activa)
VALUES
    (5, 5, 'ACUENTA-CENTRAL', 'A Cuenta Online', 'Casa Matriz / Online', 'Temuco', 'Temuco', -38.73590000, -72.59040000, true),
    (6, 6, 'CUGAT-CENTRAL',   'Cugat Online',    'Casa Matriz / Online', 'Temuco', 'Temuco', -38.73590000, -72.59040000, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Actualizar la secuencia de sucursales
SELECT setval(
    'scraper.sucursales_supermercado_id_seq',
    (SELECT MAX(id) FROM scraper.sucursales_supermercado)
);

-- 5. Verificación: mostrar las cadenas y sucursales registradas
DO $$
BEGIN
    RAISE NOTICE '=== Cadenas de supermercado registradas ===';
END $$;

SELECT id, nombre, url_sitio_web, esta_activa
FROM scraper.cadenas_supermercado
ORDER BY id;

SELECT s.id, c.nombre AS cadena, s.codigo_sucursal, s.nombre AS sucursal, s.esta_activa
FROM scraper.sucursales_supermercado s
JOIN scraper.cadenas_supermercado c ON c.id = s.cadena_id
ORDER BY s.id;

COMMIT;
