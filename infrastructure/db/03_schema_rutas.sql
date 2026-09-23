-- =======================================================
-- ESQUEMA rutas: DOMINIO 5 (Listas de Compras, Optimización Espacial y Rutas TSP)
-- =======================================================

CREATE SCHEMA IF NOT EXISTS rutas;

-- 1. Listas de Compras (Dominio 5)
CREATE TABLE IF NOT EXISTS rutas.listas_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) DEFAULT 'activa',
    creada_el TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizada_el TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Artículos de Lista de Compras (Dominio 5)
CREATE TABLE IF NOT EXISTS rutas.articulos_lista_compras (
    id SERIAL PRIMARY KEY,
    lista_id UUID NOT NULL REFERENCES rutas.listas_compras(id) ON DELETE CASCADE,
    producto_normalizado_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    esta_comprado BOOLEAN DEFAULT false
);

-- 3. Ejecuciones de Optimización (Dominio 5)
CREATE TABLE IF NOT EXISTS rutas.ejecuciones_optimizacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lista_id UUID NOT NULL REFERENCES rutas.listas_compras(id) ON DELETE CASCADE,
    transporte_usuario_id INTEGER REFERENCES api.perfiles_transporte_usuario(id) ON DELETE SET NULL,
    lat_inicio DECIMAL(10,8) NOT NULL,
    lon_inicio DECIMAL(11,8) NOT NULL,
    costo_total_productos DECIMAL(12,2) NOT NULL,
    costo_estimado_viaje DECIMAL(12,2) NOT NULL,
    ahorro_neto_estimado DECIMAL(12,2) NOT NULL,
    distancia_total_metros INTEGER,
    duracion_total_segundos INTEGER,
    calculado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Paradas de Optimización (Dominio 5)
CREATE TABLE IF NOT EXISTS rutas.paradas_optimizacion (
    id SERIAL PRIMARY KEY,
    optimizacion_id UUID NOT NULL REFERENCES rutas.ejecuciones_optimizacion(id) ON DELETE CASCADE,
    sucursal_id INTEGER NOT NULL REFERENCES scraper.sucursales_supermercado(id) ON DELETE CASCADE,
    orden_visita INTEGER NOT NULL,
    costo_subtotal DECIMAL(12,2) NOT NULL
);

-- 5. Detalle de Artículos por Parada (Dominio 5)
CREATE TABLE IF NOT EXISTS rutas.detalle_articulos_parada (
    id SERIAL PRIMARY KEY,
    parada_id INTEGER NOT NULL REFERENCES rutas.paradas_optimizacion(id) ON DELETE CASCADE,
    producto_crudo_id UUID NOT NULL REFERENCES scraper.productos_crudos(id) ON DELETE CASCADE,
    captura_precio_id BIGINT NOT NULL REFERENCES scraper.capturas_precios(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario_aplicado DECIMAL(12,2) NOT NULL
);
