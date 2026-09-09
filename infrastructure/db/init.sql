-- Script de inicialización automatizada para el servidor PostgreSQL + PostGIS
-- Crea la base de datos principal, activa extensiones requeridas y construye los 3 esquemas lógicos.

-- Extensiones globales
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Esquemas lógicos por dominio (Database per Schema pattern)
CREATE SCHEMA IF NOT EXISTS api;
CREATE SCHEMA IF NOT EXISTS scraper;
CREATE SCHEMA IF NOT EXISTS rutas;

-- Comentario explicativo
COMMENT ON SCHEMA api IS 'Dominio 1 (Identidad, Usuarios, Misiones) y Dominio 4 (Catálogo Maestro, IA y Recetas)';
COMMENT ON SCHEMA scraper IS 'Dominio 2 (Cadenas y Sucursales) y Dominio 3 (Extracción y Capturas de Precios)';
COMMENT ON SCHEMA rutas IS 'Dominio 5 (Listas de Compras, Rutas Geoespaciales y Optimización TSP)';
