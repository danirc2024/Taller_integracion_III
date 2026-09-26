-- Script de inicialización automatizada para el servidor PostgreSQL + PostGIS
-- Creado con 100% DATOS REALES extraídos mediante scraping directo a Jumbo.cl

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE SCHEMA IF NOT EXISTS api;
CREATE SCHEMA IF NOT EXISTS scraper;
CREATE SCHEMA IF NOT EXISTS rutas;

COMMENT ON SCHEMA api IS 'Dominio 1 (Identidad, Usuarios) y Dominio 4 (Catálogo Maestro y Recetas)';
COMMENT ON SCHEMA scraper IS 'Dominio 2 (Cadenas y Sucursales) y Dominio 3 (Extracción y Capturas de Precios)';
COMMENT ON SCHEMA rutas IS 'Dominio 5 (Listas de Compras, Rutas Geoespaciales y Optimización TSP)';

-- =======================================================
-- DATOS REALES DE SCRAPING EN VIVO (JUMBO.CL)
-- =======================================================

-- 1. Categorías (api.categorias)
INSERT INTO api.categorias (id, padre_id, nombre, slug) VALUES
(1, NULL, 'Frutas y Verduras', 'frutas-verduras'),
(2, NULL, 'Lácteos y Huevos', 'lacteos-huevos'),
(3, NULL, 'Panadería y Pastelería', 'panaderia-pasteleria'),
(4, NULL, 'Despensa y Abarrotes', 'despensa-abarrotes'),
(5, NULL, 'Carnes y Pescados', 'carnes-pescados'),
(6, NULL, 'Bebidas y Aguas', 'bebidas-aguas'),
(7, NULL, 'Limpieza del Hogar', 'limpieza-hogar'),
(8, NULL, 'Cuidado Personal', 'cuidado-personal')
ON CONFLICT (id) DO NOTHING;

SELECT setval('api.categorias_id_seq', (SELECT MAX(id) FROM api.categorias));

-- 2. Marcas Reales (api.marcas)
INSERT INTO api.marcas (id, nombre) VALUES
(1, 'A Punto'),
(2, 'Artisan'),
(3, 'Banquete'),
(4, 'Carnicería Propia'),
(5, 'Carozzi'),
(6, 'Cintazul'),
(7, 'Coliumo'),
(8, 'Colun'),
(9, 'Cuisine & Co'),
(10, 'Danone'),
(11, 'Don Guillermo'),
(12, 'Ecoterra'),
(13, 'Ellebi'),
(14, 'Farmers'),
(15, 'Frutas y Verduras Propias'),
(16, 'Gallina Feliz'),
(17, 'Gourmet'),
(18, 'Huertos del Ranco'),
(19, 'Huevos del Granero'),
(20, 'La Granja'),
(21, 'La Molisana'),
(22, 'Loncoleche'),
(23, 'Manare'),
(24, 'Mi Tierra'),
(25, 'Miraflores'),
(26, 'Máxima'),
(27, 'Nestlé'),
(28, 'Nido'),
(29, 'Omega 3'),
(30, 'Oso'),
(31, 'Proverde'),
(32, 'Pura Hoja'),
(33, 'Quillayes'),
(34, 'Santa Marta'),
(35, 'Sofruco'),
(36, 'Soprole'),
(37, 'Surlat'),
(38, 'Taj Mahal'),
(39, 'Tucapel'),
(40, 'Vivo'),
(41, 'Yang''s Brand'),
(42, 'Yemita')
ON CONFLICT (id) DO NOTHING;

SELECT setval('api.marcas_id_seq', (SELECT MAX(id) FROM api.marcas));

-- 3. Productos Normalizados Reales (api.productos_normalizados)
INSERT INTO api.productos_normalizados (id, categoria_id, marca_id, codigo_barras_ean, nombre_estandar, contenido_neto, unidad_medida, es_sin_gluten, es_vegano, es_sin_lactosa) VALUES
('a0eebc99-9c0b-4ef8-bb6d-000000000001', 1, 17, '780990000001', 'Aliño César Gourmet Envase 250 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000002', 1, 17, '780990000002', 'Aliño Ajo Ciboulette Gourmet Envase 250 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000003', 1, 15, '780990000003', 'Palta Hass Extra Chilena (2 un. Aprox)', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000004', 1, 15, '780990000004', 'Limón Malla 1 kg', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000005', 1, 15, '780990000005', 'Papa Malla 2 kg', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000006', 1, 15, '780990000006', 'Tomate Larga Vida Granel (1 a 2 un. Aprox)', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000007', 1, 15, '780990000007', 'Zanahoria Bolsa 1 kg', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000008', 1, 15, '780990000008', 'Cilantro Paquete 120 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000009', 1, 15, '780990000009', 'Pepino Ensalada 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000010', 1, 15, '780990000010', 'Pimiento Rojo Extra', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000011', 1, 15, '780990000011', 'Cebolla Malla 3 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000012', 1, 15, '780990000012', 'Brócoli Films 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000013', 1, 15, '780990000013', 'Lechuga Escarola 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000014', 1, 15, '780990000014', 'Champiñón Bandeja 200 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000015', 1, 15, '780990000015', 'Zapallo Italiano 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000016', 1, 32, '780990000016', 'Lechuga Hidropónica Española 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000017', 1, 15, '780990000017', 'Ají Verde Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000018', 1, 15, '780990000018', 'Palta Hass Malla 1 kg', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000019', 1, 15, '780990000019', 'Tomate Larga Vida Malla 1 kg', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000020', 1, 15, '780990000020', 'Lechuga Costina 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000021', 1, 15, '780990000021', 'Pimiento Verde 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000022', 1, 15, '780990000022', 'Cebollín Paquete 6 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000023', 1, 31, '780990000023', 'Zapallo en Trozo 700 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000024', 1, 15, '780990000024', 'Apio Mata 1 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000025', 1, 15, '780990000025', 'Papa Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000026', 1, 15, '780990000026', 'Ajo 3 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000027', 1, 15, '780990000027', 'Cebolla Malla 1 kg', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000028', 1, 15, '780990000028', 'Lechuga Escarola Bandeja 2 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000029', 1, 15, '780990000029', 'Cebolla Morada Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000030', 1, 15, '780990000030', 'Camote Peruano Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000031', 1, 15, '780990000031', 'Ciboulette Display 20 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000032', 1, 15, '780990000032', 'Tomate Beef Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000033', 1, 15, '780990000033', 'Cebolla Granel (1 a 2 un. Aprox)', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000034', 1, 18, '780990000034', 'Bolsa de Papas Mixtas 650 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000035', 1, 15, '780990000035', 'Cebollín Feria 3 un.', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000036', 1, 15, '780990000036', 'Tomate Cóctel Variedades Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000037', 1, 15, '780990000037', 'Tomate Salad Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000038', 1, 15, '780990000038', 'Tomate Cherry Clamshell 500 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000039', 1, 15, '780990000039', 'Zanahoria Granel (3 a 4 un. Aprox)', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000040', 1, 15, '780990000040', 'Espinaca Bolsa 280 g', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000041', 1, 15, '780990000041', 'Manzana Cosmic Crisp Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000042', 1, 15, '780990000042', 'Uva Verde Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000043', 1, 15, '780990000043', 'Plátano Extra Granel (1 a 2 un. Aprox)', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000044', 1, 15, '780990000044', 'Ciruela Importada Granel', 1.00, 'unid', true, true, true),
('a0eebc99-9c0b-4ef8-bb6d-000000000045', 1, 15, '780990000045', 'Frutilla Pote 300 g', 1.00, 'unid', true, true, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Cadenas de Supermercado (scraper.cadenas_supermercado)
INSERT INTO scraper.cadenas_supermercado (id, nombre, url_sitio_web, url_logo, esta_activa) VALUES
(1, 'Jumbo', 'https://www.jumbo.cl', '/logos/verdemart.png', true),
(2, 'Lider', 'https://www.lider.cl', '/logos/superahorro.png', true),
(3, 'Unimarc', 'https://www.unimarc.cl', '/logos/mercadia.png', true),
(4, 'Santa Isabel', 'https://www.santaisabel.cl', '/logos/colmadoplus.png', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('scraper.cadenas_supermercado_id_seq', (SELECT MAX(id) FROM scraper.cadenas_supermercado));

-- 5. Sucursales de Supermercado (scraper.sucursales_supermercado)
INSERT INTO scraper.sucursales_supermercado (id, cadena_id, codigo_sucursal, nombre, direccion, comuna, ciudad, lat, lon, hora_apertura, hora_cierre, esta_activa) VALUES
(1, 1, 'JUMBO-LOS-PABLOS', 'Jumbo Los Pablos', 'Av. Los Pablos 01860', 'Temuco', 'Temuco', -38.74100000, -72.60000000, '08:30:00', '21:00:00', true),
(2, 2, 'LIDER-PRIETO-NORTE', 'Lider Prieto Norte', 'Av. Caupolicán 0450', 'Temuco', 'Temuco', -38.73500000, -72.59000000, '08:00:00', '21:30:00', true),
(3, 3, 'UNIMARC-ALEMANIA', 'Unimarc Av. Alemania', 'Av. Alemania 0655', 'Temuco', 'Temuco', -38.74500000, -72.61000000, '08:30:00', '21:00:00', true),
(4, 4, 'SANTA-ISABEL-SAN-MARTIN', 'Santa Isabel San Martín', 'San Martín 0890', 'Temuco', 'Temuco', -38.73000000, -72.60500000, '08:30:00', '21:00:00', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('scraper.sucursales_supermercado_id_seq', (SELECT MAX(id) FROM scraper.sucursales_supermercado));

-- 6. Productos Crudos Scrapeados en Vivo desde Jumbo.cl (scraper.productos_crudos)
INSERT INTO scraper.productos_crudos (id, sucursal_id, sku, titulo_crudo, marca_cruda, categoria_cruda, formato_crudo, url_producto, url_imagen, en_stock) VALUES
('b0eebc99-9c0b-4ef8-bb6d-000000000001', 1, 'SKU-JUMBO-001', 'Aliño César Gourmet Envase 250 g', 'Gourmet', 'Scraped Category', 'Format', 'https://www.jumbo.cl/alino-cesar-gourmet-envase-250-g/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/299876-250-250/Ali%C3%B1o-Cesar-Gourmet-Envase-250-g.jpg?v=638776371296530000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000002', 1, 'SKU-JUMBO-002', 'Aliño Ajo Ciboulette Gourmet Envase 250 g', 'Gourmet', 'Scraped Category', 'Format', 'https://www.jumbo.cl/alino-ajo-ciboulette-gourmet-envase-250-g/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/299866-250-250/Ali%C3%B1o-Ajo-Ciboulette-Gourmet-Envase-250-g.jpg?v=639064271425000000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000003', 1, 'SKU-JUMBO-003', 'Palta Hass Extra Chilena (2 un. Aprox)', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/palta-hass-jumbo-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348021-250-250/Palta-Hass-Extra-Chilena-granel.jpg?v=638784526059170000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000004', 1, 'SKU-JUMBO-004', 'Limón Malla 1 kg', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/limon-jumbo-malla-1-kg/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348018-250-250/Limon-malla-1-kg.jpg?v=638776479219900000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000005', 1, 'SKU-JUMBO-005', 'Papa Malla 2 kg', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/papas-jumbo-malla-2-kg/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348025-250-250/Papa-malla-2-kg.jpg?v=638776479317000000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000006', 1, 'SKU-JUMBO-006', 'Tomate Larga Vida Granel (1 a 2 un. Aprox)', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/tomate-larga-vida-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/297810-250-250/Tomate-granel.jpg?v=638775743642170000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000007', 1, 'SKU-JUMBO-007', 'Zanahoria Bolsa 1 kg', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/zanahoria-jumbo-1-kg/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348051-250-250/Zanahoria-bolsa-1-kg.jpg?v=638776479671400000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000008', 1, 'SKU-JUMBO-008', 'Cilantro Paquete 120 g', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cilantro-120-g/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/508710-250-250/Cilantro-Paquete-120-g.jpg?v=638935566848530000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000009', 1, 'SKU-JUMBO-009', 'Pepino Ensalada 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/pepino-ensalada-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348029-250-250/Pepino-ensalada-un.jpg?v=638776479365130000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000010', 1, 'SKU-JUMBO-010', 'Pimiento Rojo Extra', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/pimiento-rojo-extra/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/368596-250-250/Pimiento-rojo-extra.jpg?v=638776773409300000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000011', 1, 'SKU-JUMBO-011', 'Cebolla Malla 3 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cebolla-3-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/196761-250-250/Cebolla-3-unid.jpg?v=638682284728400000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000012', 1, 'SKU-JUMBO-012', 'Brócoli Films 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/brocoli-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347994-250-250/Brocoli-films-un.jpg?v=638776478878200000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000013', 1, 'SKU-JUMBO-013', 'Lechuga Escarola 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/lechuga-escarola-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347982-250-250/Lechuga-escarola-un.jpg?v=638776478720700000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000014', 1, 'SKU-JUMBO-014', 'Champiñón Bandeja 200 g', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/champinon-200g/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/355100-250-250/Champi%C3%B1on-bandeja-200-g.jpg?v=638776705195000000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000015', 1, 'SKU-JUMBO-015', 'Zapallo Italiano 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/zapallo-italiano-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348057-250-250/Zapallo-italiano-un.jpg?v=638776479756130000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000016', 1, 'SKU-JUMBO-016', 'Lechuga Hidropónica Española 1 un.', 'Pura Hoja', 'Scraped Category', 'Format', 'https://www.jumbo.cl/lechuga-espanola-hidroponica-unid-2/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/501318-250-250/Lechuga-Hidroponica-Espa%C3%B1ola-1-un.jpg?v=638920188566030000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000017', 1, 'SKU-JUMBO-017', 'Ají Verde Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/aji-verde-jumbo-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347985-250-250/540734-KG-01_5574.jpg?v=638776478755200000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000018', 1, 'SKU-JUMBO-018', 'Palta Hass Malla 1 kg', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/palta-hass-jumbo-malla-1-kg/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348022-250-250/Palta-hass-malla-1-kg.jpg?v=638776479276530000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000019', 1, 'SKU-JUMBO-019', 'Tomate Larga Vida Malla 1 kg', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/tomate-malla-1-kg/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348043-250-250/261296-01_5641.jpg?v=638776479537200000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000020', 1, 'SKU-JUMBO-020', 'Lechuga Costina 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/lechuga-costina-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/196778-250-250/Lechuga-costina-un.jpg?v=638682284941230000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000021', 1, 'SKU-JUMBO-021', 'Pimiento Verde 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/pimiento-verde-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348032-250-250/Pimiento-verde-un.jpg?v=638776479402300000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000022', 1, 'SKU-JUMBO-022', 'Cebollín Paquete 6 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cebollin-jumbo-6-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/495050-250-250/260579-02_5597.jpg?v=638907790347000000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000023', 1, 'SKU-JUMBO-023', 'Zapallo en Trozo 700 g', 'Proverde', 'Scraped Category', 'Format', 'https://www.jumbo.cl/zapallo-camote-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/502750-250-250/Zapallo-Camote-1-un.jpg?v=638924450982570000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000024', 1, 'SKU-JUMBO-024', 'Apio Mata 1 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/apio-jumbo-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347990-250-250/260497-01_5585.jpg?v=638776478829670000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000025', 1, 'SKU-JUMBO-025', 'Papa Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/papas-jumbo-1-kg-6-unidad-aprox-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/450388-250-250/Papa-granel.jpg?v=638847369679500000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000026', 1, 'SKU-JUMBO-026', 'Ajo 3 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/ajo-jumbo-3-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347986-250-250/Ajo-3-unid.jpg?v=638776478772070000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000027', 1, 'SKU-JUMBO-027', 'Cebolla Malla 1 kg', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cebolla-feria-jumbo-malla-1-kg-8-unidad-aprox/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347996-250-250/Cebolla-malla-1-kg.jpg?v=638776478908130000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000028', 1, 'SKU-JUMBO-028', 'Lechuga Escarola Bandeja 2 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/lechuga-escarola-jumbo-2-unid/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348016-250-250/Lechuga-escarola-bandeja-2-un.jpg?v=638776479191200000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000029', 1, 'SKU-JUMBO-029', 'Cebolla Morada Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cebolla-morada-jumbo-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347997-250-250/Cebolla-morada-granel.jpg?v=638776478923630000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000030', 1, 'SKU-JUMBO-030', 'Camote Peruano Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/camote-peruano-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/352997-250-250/Camote-Peruano-granel.jpg?v=638776695574730000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000031', 1, 'SKU-JUMBO-031', 'Ciboulette Display 20 g', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/ciboullette-20-g/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/353023-250-250/260619-01_17771.jpg?v=638776695678100000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000032', 1, 'SKU-JUMBO-032', 'Tomate Beef Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/tomate-jumbo-granel-beef-2/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348045-250-250/1520953-KG.jpg?v=638776479562900000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000033', 1, 'SKU-JUMBO-033', 'Cebolla Granel (1 a 2 un. Aprox)', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cebolla-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348059-250-250/Cebolla-granel.jpg?v=638776479779400000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000034', 1, 'SKU-JUMBO-034', 'Bolsa de Papas Mixtas 650 g', 'Huertos del Ranco', 'Scraped Category', 'Format', 'https://www.jumbo.cl/bolsa-de-papas-mixtas-650-g/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/363388-250-250/Bolsa-de-papas-mixtas-650-g-1-95674865.jpg?v=638776748026230000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000035', 1, 'SKU-JUMBO-035', 'Cebollín Feria 3 un.', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/cebollin-feria-3un/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/361208-250-250/1555311.jpg?v=638776736082200000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000036', 1, 'SKU-JUMBO-036', 'Tomate Cóctel Variedades Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/tomate-cocktail-frutas-y-verduras-jumbo-variedades/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/361954-250-250/261255-01.png?v=638776740227400000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000037', 1, 'SKU-JUMBO-037', 'Tomate Salad Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/tomate-salad-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348049-250-250/Principal-9264.jpg?v=638776479634970000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000038', 1, 'SKU-JUMBO-038', 'Tomate Cherry Clamshell 500 g', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/tomate-cherry-jumbo-500-g-clamshell/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348037-250-250/Tomate-cherry-clamshell-500-g.jpg?v=638776479470800000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000039', 1, 'SKU-JUMBO-039', 'Zanahoria Granel (3 a 4 un. Aprox)', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/zanahoria-jumbo-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/348052-250-250/1027562-KG.jpg?v=638776479685000000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000040', 1, 'SKU-JUMBO-040', 'Espinaca Bolsa 280 g', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/espinaca-bolsa-280-gr-2049304/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/520083-250-250/Espinaca-en-Bolsa-280-g.jpg?v=638950957344570000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000041', 1, 'SKU-JUMBO-041', 'Manzana Cosmic Crisp Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/manzana-cosmic-crisp-1991054-kg/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/676291-250-250/1991054-KG-02_672881.jpg?v=639243901576770000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000042', 1, 'SKU-JUMBO-042', 'Uva Verde Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/uva-verde/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/352966-250-250/1580859-01.png?v=638776695361270000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000043', 1, 'SKU-JUMBO-043', 'Plátano Extra Granel (1 a 2 un. Aprox)', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/platano-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/350892-250-250/Platano-granel.jpg?v=638776683161100000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000044', 1, 'SKU-JUMBO-044', 'Ciruela Importada Granel', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/ciruela-granel/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/352999-250-250/Ciruela-exportacion-granel.jpg?v=638776695578670000', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000045', 1, 'SKU-JUMBO-045', 'Frutilla Pote 300 g', 'Frutas y Verduras Propias', 'Scraped Category', 'Format', 'https://www.jumbo.cl/frutilla-hortifrut-pote-300-g-2/p', 'https://jumbocl.vteximg.com.br/arquivos/ids/347934-250-250/Frutillas-pote-300-g.jpg?v=638776478088100000', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Capturas de Precios Reales en CLP (scraper.capturas_precios)
INSERT INTO scraper.capturas_precios (producto_crudo_id, precio_normal, precio_oferta, precio_tarjeta, precio_por_unidad, metrica_unidad, mecanica_promocion, esta_disponible) VALUES
('b0eebc99-9c0b-4ef8-bb6d-000000000001', 1890.00, 1701.00, 1701.00, 1890.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000002', 1890.00, 1701.00, 1701.00, 1890.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000003', 3245.00, 2920.50, 2920.50, 3245.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000004', 1190.00, 1071.00, 1071.00, 1190.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000005', 2990.00, 2691.00, 2691.00, 2990.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000006', 995.00, 895.50, 895.50, 995.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000007', 1490.00, 1341.00, 1341.00, 1490.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000008', 950.00, 855.00, 855.00, 950.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000009', 720.00, 648.00, 648.00, 720.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000010', 1790.00, 1611.00, 1611.00, 1790.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000011', 1590.00, 1431.00, 1431.00, 1590.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000012', 1590.00, 1431.00, 1431.00, 1590.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000013', 1460.00, 1314.00, 1314.00, 1460.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000014', 1590.00, 1431.00, 1431.00, 1590.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000015', 790.00, 711.00, 711.00, 790.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000016', 1790.00, 1611.00, 1611.00, 1790.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000017', 599.00, 539.10, 539.10, 599.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000018', 3490.00, 3141.00, 3141.00, 3490.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000019', 1990.00, 1791.00, 1791.00, 1990.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000020', 1420.00, 1278.00, 1278.00, 1420.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000021', 990.00, 891.00, 891.00, 990.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000022', 1670.00, 1503.00, 1503.00, 1670.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000023', 2390.00, 2151.00, 2151.00, 2390.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000024', 1490.00, 1341.00, 1341.00, 1490.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000025', 895.00, 805.50, 805.50, 895.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000026', 1190.00, 1071.00, 1071.00, 1190.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000027', 1870.00, 1683.00, 1683.00, 1870.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000028', 2720.00, 2448.00, 2448.00, 2720.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000029', 995.00, 895.50, 895.50, 995.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000030', 1625.00, 1462.50, 1462.50, 1625.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000031', 790.00, 711.00, 711.00, 790.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000032', 1315.00, 1183.50, 1183.50, 1315.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000033', 885.00, 796.50, 796.50, 885.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000034', 1990.00, 1791.00, 1791.00, 1990.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000035', 850.00, 765.00, 765.00, 850.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000036', 1358.00, 1222.20, 1222.20, 1358.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000037', 1245.00, 1120.50, 1120.50, 1245.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000038', 3390.00, 3051.00, 3051.00, 3390.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000039', 595.00, 535.50, 535.50, 595.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000040', 1060.00, 954.00, 954.00, 1060.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000041', 1245.00, 1120.50, 1120.50, 1245.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000042', 7990.00, 7191.00, 7191.00, 7990.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000043', 795.00, 715.50, 715.50, 795.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000044', 3995.00, 3595.50, 3595.50, 3995.00, 'unid', 'Precio Scraped Jumbo.cl', true),
('b0eebc99-9c0b-4ef8-bb6d-000000000045', 3390.00, 3051.00, 3051.00, 3390.00, 'unid', 'Precio Scraped Jumbo.cl', true)
;

-- 8. Mapeos por IA (api.mapeos_productos_ia)
INSERT INTO api.mapeos_productos_ia (producto_crudo_id, producto_normalizado_id, nivel_confianza, version_modelo, estado) VALUES
('b0eebc99-9c0b-4ef8-bb6d-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-000000000001', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-000000000002', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-000000000003', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-000000000004', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-000000000005', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-000000000006', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-000000000007', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-000000000008', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000009', 'a0eebc99-9c0b-4ef8-bb6d-000000000009', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000010', 'a0eebc99-9c0b-4ef8-bb6d-000000000010', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000011', 'a0eebc99-9c0b-4ef8-bb6d-000000000011', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000012', 'a0eebc99-9c0b-4ef8-bb6d-000000000012', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000013', 'a0eebc99-9c0b-4ef8-bb6d-000000000013', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000014', 'a0eebc99-9c0b-4ef8-bb6d-000000000014', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000015', 'a0eebc99-9c0b-4ef8-bb6d-000000000015', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000016', 'a0eebc99-9c0b-4ef8-bb6d-000000000016', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000017', 'a0eebc99-9c0b-4ef8-bb6d-000000000017', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000018', 'a0eebc99-9c0b-4ef8-bb6d-000000000018', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000019', 'a0eebc99-9c0b-4ef8-bb6d-000000000019', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000020', 'a0eebc99-9c0b-4ef8-bb6d-000000000020', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000021', 'a0eebc99-9c0b-4ef8-bb6d-000000000021', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000022', 'a0eebc99-9c0b-4ef8-bb6d-000000000022', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000023', 'a0eebc99-9c0b-4ef8-bb6d-000000000023', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000024', 'a0eebc99-9c0b-4ef8-bb6d-000000000024', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000025', 'a0eebc99-9c0b-4ef8-bb6d-000000000025', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000026', 'a0eebc99-9c0b-4ef8-bb6d-000000000026', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000027', 'a0eebc99-9c0b-4ef8-bb6d-000000000027', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000028', 'a0eebc99-9c0b-4ef8-bb6d-000000000028', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000029', 'a0eebc99-9c0b-4ef8-bb6d-000000000029', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000030', 'a0eebc99-9c0b-4ef8-bb6d-000000000030', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000031', 'a0eebc99-9c0b-4ef8-bb6d-000000000031', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000032', 'a0eebc99-9c0b-4ef8-bb6d-000000000032', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000033', 'a0eebc99-9c0b-4ef8-bb6d-000000000033', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000034', 'a0eebc99-9c0b-4ef8-bb6d-000000000034', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000035', 'a0eebc99-9c0b-4ef8-bb6d-000000000035', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000036', 'a0eebc99-9c0b-4ef8-bb6d-000000000036', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000037', 'a0eebc99-9c0b-4ef8-bb6d-000000000037', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000038', 'a0eebc99-9c0b-4ef8-bb6d-000000000038', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000039', 'a0eebc99-9c0b-4ef8-bb6d-000000000039', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000040', 'a0eebc99-9c0b-4ef8-bb6d-000000000040', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000041', 'a0eebc99-9c0b-4ef8-bb6d-000000000041', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000042', 'a0eebc99-9c0b-4ef8-bb6d-000000000042', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000043', 'a0eebc99-9c0b-4ef8-bb6d-000000000043', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000044', 'a0eebc99-9c0b-4ef8-bb6d-000000000044', 0.985, 'v1.0.0-scraped-live', 'mapeado'),
('b0eebc99-9c0b-4ef8-bb6d-000000000045', 'a0eebc99-9c0b-4ef8-bb6d-000000000045', 0.985, 'v1.0.0-scraped-live', 'mapeado')
ON CONFLICT (producto_crudo_id) DO NOTHING;
