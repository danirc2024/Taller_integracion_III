-- =======================================================
-- ESQUEMA api: DOMINIO 1 (Identidad/Usuarios) y DOMINIO 4 (Catálogo Maestro/IA)
-- =======================================================

CREATE SCHEMA IF NOT EXISTS api;

-- 1. Tabla Usuarios (Dominio 1)
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

-- 2. Categorías (Dominio 4)
CREATE TABLE IF NOT EXISTS api.categorias (
    id SERIAL PRIMARY KEY,
    padre_id INTEGER REFERENCES api.categorias(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Marcas (Dominio 4)
CREATE TABLE IF NOT EXISTS api.marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Productos Normalizados (Dominio 4)
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

-- 5. Preferencias Dietéticas de Usuario (Dominio 1)
CREATE TABLE IF NOT EXISTS api.preferencias_dieteticas_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    etiqueta_dietetica VARCHAR(50) NOT NULL,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_etiqueta UNIQUE (usuario_id, etiqueta_dietetica)
);

-- 6. Direcciones de Usuario (Dominio 1)
CREATE TABLE IF NOT EXISTS api.direcciones_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    etiqueta VARCHAR(100),
    texto_direccion VARCHAR(255) NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lon DECIMAL(11,8) NOT NULL,
    es_principal BOOLEAN DEFAULT false
);

-- 7. Perfiles de Transporte de Usuario (Dominio 1)
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

-- 8. Tarjetas de Fidelidad de Usuario (Dominio 1)
CREATE TABLE IF NOT EXISTS api.tarjetas_fidelidad_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES api.usuarios(id) ON DELETE CASCADE,
    cadena_id INTEGER NOT NULL, -- Referencia diferida a scraper.cadenas_supermercado
    tipo_tarjeta VARCHAR(100) NOT NULL,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Misiones de Validación de Colaborador (Dominio 1 - Colaboradores)
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

-- 10. Equivalencias de Productos (Dominio 4)
CREATE TABLE IF NOT EXISTS api.equivalencias_productos (
    id BIGSERIAL PRIMARY KEY,
    producto_master_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    producto_alias_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    definido_por_admin_id UUID REFERENCES api.usuarios(id) ON DELETE SET NULL,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_producto_equivalencia UNIQUE (producto_master_id, producto_alias_id)
);

-- 11. Recetas (Dominio 4)
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

-- 12. Ingredientes de Receta (Dominio 4)
CREATE TABLE IF NOT EXISTS api.ingredientes_receta (
    id SERIAL PRIMARY KEY,
    receta_id UUID NOT NULL REFERENCES api.recetas(id) ON DELETE CASCADE,
    producto_normalizado_id UUID REFERENCES api.productos_normalizados(id) ON DELETE SET NULL,
    texto_ingrediente_crudo VARCHAR(255) NOT NULL,
    cantidad_requerida DECIMAL(8,2),
    unidad VARCHAR(30)
);

-- 13. Mapeos de Productos por IA (Dominio 4)
CREATE TABLE IF NOT EXISTS api.mapeos_productos_ia (
    id BIGSERIAL PRIMARY KEY,
    producto_crudo_id UUID UNIQUE NOT NULL, -- Referencia diferida a scraper.productos_crudos
    producto_normalizado_id UUID NOT NULL REFERENCES api.productos_normalizados(id) ON DELETE CASCADE,
    nivel_confianza DECIMAL(4,3),
    version_modelo VARCHAR(50),
    estado VARCHAR(30) DEFAULT 'mapeado',
    procesado_el TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Restricciones de Integridad Referencial Cruzadas (Cross-Schema Foreign Keys)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='scraper' AND table_name='cadenas_supermercado') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tarjetas_cadena') THEN
            ALTER TABLE api.tarjetas_fidelidad_usuario
                ADD CONSTRAINT fk_tarjetas_cadena
                FOREIGN KEY (cadena_id) REFERENCES scraper.cadenas_supermercado(id) ON DELETE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='scraper' AND table_name='sucursales_supermercado') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_misiones_sucursal') THEN
            ALTER TABLE api.misiones_validacion
                ADD CONSTRAINT fk_misiones_sucursal
                FOREIGN KEY (sucursal_id) REFERENCES scraper.sucursales_supermercado(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

