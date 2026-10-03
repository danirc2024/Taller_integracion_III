CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_productos_titulo_trgm ON scraper.productos_crudos USING gin (titulo_crudo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_productos_marca_trgm ON scraper.productos_crudos USING gin (marca_cruda gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_trgm ON scraper.productos_crudos USING gin (categoria_cruda gin_trgm_ops);
