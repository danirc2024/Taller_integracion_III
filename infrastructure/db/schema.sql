-- =======================================================
-- ESQUEMA DDL COMPLETO DE BASE DE DATOS (21 Tablas en 3 Esquemas)
-- Base de Datos Física: supermercados_db
-- =======================================================

-- Extensiones globales
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Esquemas lógicos
CREATE SCHEMA IF NOT EXISTS api;
CREATE SCHEMA IF NOT EXISTS scraper;
CREATE SCHEMA IF NOT EXISTS rutas;

-- =======================================================
-- ESQUEMA api: IDENTIDAD, USUARIOS, CATÁLOGO Y IA
-- =======================================================

CREATE TABLE IF NOT EXISTS api.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    nombre_completo VARCHAR(255) NOT NULL,
    url_avatar VARCHAR(500),
    rol VARCHAR(30) NOT NULL DEFAULT 'registrado',
    cuota_tokens_ia INTEGER NOT NULL DEFAULT 1000,
    esta_activo BOOLEAN NOT NULL DEFAULT true,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.categorias (
    id SERIAL PRIMARY KEY,
    padre_id INTEGER REFERENCES api.categorias(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS api.marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS api.productos_normalizados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id INTEGER REFERENCES api.categorias(id) ON DELETE SET NULL,
    marca_id INTEGER REFERENCES api.marcas(id) ON DELETE SET NULL,
    codigo_barras_ean VARCHAR(50) UNIQUE,
    nombre_estandar VARCHAR(255) NOT NULL,
    contenido_neto DECIMAL(8,2),
    unidad_medida VARCHAR(20),
    es_sin_gluten BOOLEAN DEFAULT false,
    es_vegano BOOLEAN DEFAULT false,
    es_sin_lactosa BOOLEAN DEFAULT false,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.preferencias_dieteticas_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    etiqueta_dietetica VARCHAR(50) NOT NULL,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_etiqueta UNIQUE (usuario_id, etiqueta_dietetica)
);

CREATE TABLE IF NOT EXISTS api.direcciones_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    etiqueta VARCHAR(100),
    texto_direccion VARCHAR(255) NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lon DECIMAL(11,8) NOT NULL,
    es_principal BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS api.perfiles_transporte_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    modo_transporte VARCHAR(50) NOT NULL,
    tipo_combustible VARCHAR(50),
    rendimiento_combustible_km_l DECIMAL(5,2),
    tarifa_transporte_publico DECIMAL(10,2),
    radio_maximo_km DECIMAL(5,2) DEFAULT 10.0,
    es_principal BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS api.tarjetas_fidelidad_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    cadena_id INTEGER NOT NULL,
    tipo_tarjeta VARCHAR(100) NOT NULL,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.misiones_validacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    sucursal_id INTEGER NOT NULL,
    producto_id UUID REFERENCES api.productos_normalizados(id) ON DELETE SET NULL,
    precio_reportado DECIMAL(12,2),
    stock_disponible BOOLEAN DEFAULT true,
    gasto_transporte_reportado DECIMAL(12,2),
    url_evidencia_foto VARCHAR(500),
    tokens_otorgados INTEGER DEFAULT 500,
    estado VARCHAR(30) DEFAULT 'aprobado',
    completada_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.equivalencias_productos (
    id BIGSERIAL PRIMARY KEY,
    producto_master_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    producto_alias_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    definido_por_admin_id UUID REFERENCES api.usuarios(id) ON DELETE SET NULL,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_producto_equivalencia UNIQUE (producto_master_id, producto_alias_id)
);

CREATE TABLE IF NOT EXISTS api.recetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creado_por_usuario UUID REFERENCES api.usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    porciones INTEGER DEFAULT 4,
    instrucciones TEXT,
    es_comunidad BOOLEAN DEFAULT false,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.ingredientes_receta (
    id SERIAL PRIMARY KEY,
    receta_id UUID NOT NULL REFERENCES api.recetas(id) ON DELETE CASCADE,
    producto_normalizado_id UUID REFERENCES api.productos_normalizados(id) ON DELETE SET NULL,
    texto_ingrediente_crudo VARCHAR(255) NOT NULL,
    cantidad_requerida DECIMAL(8,2),
    unidad VARCHAR(30)
);

-- =======================================================
-- ESQUEMA scraper: CADENAS, SUCURSALES, SCRAPING Y PRECIOS
-- =======================================================

CREATE TABLE IF NOT EXISTS scraper.cadenas_supermercado (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    url_sitio_web VARCHAR(255),
    url_logo VARCHAR(255),
    config_scraper_json JSONB,
    esta_activa BOOLEAN DEFAULT true,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scraper.sucursales_supermercado (
    id SERIAL PRIMARY KEY,
    cadena_id INTEGER NOT NULL REFERENCES scraper.cadenas_supermercado(id) ON DELETE CASCADE,
    codigo_sucursal VARCHAR(50),
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    lat DECIMAL(10,8) NOT NULL,
    lon DECIMAL(11,8) NOT NULL,
    hora_apertura TIME,
    hora_cierre TIME,
    esta_activa BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sucursales_coords ON scraper.sucursales_supermercado (lat, lon);

CREATE TABLE IF NOT EXISTS scraper.trabajos_scraper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cadena_id INTEGER NOT NULL REFERENCES scraper.cadenas_supermercado(id) ON DELETE CASCADE,
    disparado_por_usuario_id UUID REFERENCES api.usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    iniciado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    finalizado_el TIMESTAMP,
    elementos_extraidos INTEGER DEFAULT 0,
    registro_errores TEXT
);

CREATE TABLE IF NOT EXISTS scraper.productos_crudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id INTEGER NOT NULL REFERENCES scraper.sucursales_supermercado(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    titulo_crudo VARCHAR(255) NOT NULL,
    marca_cruda VARCHAR(100),
    categoria_cruda VARCHAR(100),
    url_producto TEXT,
    url_imagen TEXT,
    en_stock BOOLEAN DEFAULT true,
    ultima_extraccion_el TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sucursal_sku UNIQUE (sucursal_id, sku)
);

CREATE TABLE IF NOT EXISTS scraper.capturas_precios (
    id BIGSERIAL PRIMARY KEY,
    producto_crudo_id UUID NOT NULL REFERENCES scraper.productos_crudos(id) ON DELETE CASCADE,
    precio_normal DECIMAL(12,2) NOT NULL,
    precio_oferta DECIMAL(12,2),
    precio_tarjeta DECIMAL(12,2),
    precio_por_unidad DECIMAL(12,2),
    metrica_unidad VARCHAR(20),
    esta_disponible BOOLEAN DEFAULT true,
    capturado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capturas_prod_fecha ON scraper.capturas_precios (producto_crudo_id, capturado_el DESC);

CREATE TABLE IF NOT EXISTS api.mapeos_productos_ia (
    id BIGSERIAL PRIMARY KEY,
    producto_crudo_id UUID UNIQUE NOT NULL REFERENCES scraper.productos_crudos(id) ON DELETE CASCADE,
    producto_normalizado_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    nivel_confianza DECIMAL(4,3),
    version_modelo VARCHAR(50),
    estado VARCHAR(30) DEFAULT 'mapeado',
    procesado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================================================
-- ESQUEMA rutas: LISTAS DE COMPRAS Y OPTIMIZACIÓN ESPACIAL
-- =======================================================

CREATE TABLE IF NOT EXISTS rutas.listas_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) DEFAULT 'activa',
    creada_el TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizada_el TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rutas.articulos_lista_compras (
    id SERIAL PRIMARY KEY,
    lista_id UUID NOT NULL REFERENCES rutas.listas_compras(id) ON DELETE CASCADE,
    producto_normalizado_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    esta_comprado BOOLEAN DEFAULT false
);

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

CREATE TABLE IF NOT EXISTS rutas.paradas_optimizacion (
    id SERIAL PRIMARY KEY,
    optimizacion_id UUID NOT NULL REFERENCES rutas.ejecuciones_optimizacion(id) ON DELETE CASCADE,
    sucursal_id INTEGER NOT NULL REFERENCES scraper.sucursales_supermercado(id) ON DELETE CASCADE,
    orden_visita INTEGER NOT NULL,
    costo_subtotal DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS rutas.detalle_articulos_parada (
    id SERIAL PRIMARY KEY,
    parada_id INTEGER NOT NULL REFERENCES rutas.paradas_optimizacion(id) ON DELETE CASCADE,
    producto_crudo_id UUID NOT NULL REFERENCES scraper.productos_crudos(id) ON DELETE CASCADE,
    captura_precio_id BIGINT NOT NULL REFERENCES scraper.capturas_precios(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario_aplicado DECIMAL(12,2) NOT NULL
);
