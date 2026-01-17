-- V4__rename_tables_to_english.sql
-- Rename all tables and columns from Portuguese to English

-- RENAME TABLES
ALTER TABLE usuarios RENAME TO users;
ALTER TABLE clientes RENAME TO clients;
ALTER TABLE veiculos RENAME TO vehicles;
ALTER TABLE categorias RENAME TO categories;
ALTER TABLE produtos RENAME TO products;
ALTER TABLE ordens_servico RENAME TO service_orders;
ALTER TABLE itens_os RENAME TO service_order_items;
ALTER TABLE movimentacoes_estoque RENAME TO stock_movements;

-- users
ALTER TABLE users RENAME COLUMN nome TO name;
ALTER TABLE users RENAME COLUMN senha_hash TO password_hash;
ALTER TABLE users RENAME COLUMN ativo TO active;

-- clients
ALTER TABLE clients RENAME COLUMN nome TO name;
ALTER TABLE clients RENAME COLUMN cpf_cnpj TO document_number;
ALTER TABLE clients RENAME COLUMN telefone TO phone;
ALTER TABLE clients RENAME COLUMN endereco TO address;
ALTER TABLE clients RENAME COLUMN cidade TO city;
ALTER TABLE clients RENAME COLUMN estado TO state;
ALTER TABLE clients RENAME COLUMN cep TO zip_code;
ALTER TABLE clients RENAME COLUMN observacoes TO notes;
ALTER TABLE clients RENAME COLUMN ativo TO active;

-- vehicles
ALTER TABLE vehicles RENAME COLUMN cliente_id TO client_id;
ALTER TABLE vehicles RENAME COLUMN placa TO license_plate;
ALTER TABLE vehicles RENAME COLUMN marca TO brand;
ALTER TABLE vehicles RENAME COLUMN modelo TO model;
ALTER TABLE vehicles RENAME COLUMN ano TO year;
ALTER TABLE vehicles RENAME COLUMN cor TO color;
ALTER TABLE vehicles RENAME COLUMN chassi TO chassis_number;
ALTER TABLE vehicles RENAME COLUMN km_atual TO current_mileage;
ALTER TABLE vehicles RENAME COLUMN observacoes TO notes;
ALTER TABLE vehicles RENAME COLUMN ativo TO active;

-- categories
ALTER TABLE categories RENAME COLUMN nome TO name;
ALTER TABLE categories RENAME COLUMN descricao TO description;
ALTER TABLE categories RENAME COLUMN ativo TO active;

-- products
ALTER TABLE products RENAME COLUMN nome TO name;
ALTER TABLE products RENAME COLUMN descricao TO description;
ALTER TABLE products RENAME COLUMN categoria_id TO category_id;
ALTER TABLE products RENAME COLUMN codigo_barras TO barcode;
ALTER TABLE products RENAME COLUMN preco_custo TO cost_price;
ALTER TABLE products RENAME COLUMN preco_venda TO sale_price;
ALTER TABLE products RENAME COLUMN qtd_estoque TO stock_quantity;
ALTER TABLE products RENAME COLUMN qtd_minima TO minimum_stock;
ALTER TABLE products RENAME COLUMN ativo TO active;

-- service_orders
ALTER TABLE service_orders RENAME COLUMN cliente_id TO client_id;
ALTER TABLE service_orders RENAME COLUMN veiculo_id TO vehicle_id;
ALTER TABLE service_orders RENAME COLUMN usuario_id TO user_id;
ALTER TABLE service_orders RENAME COLUMN km_entrada TO entry_mileage;
ALTER TABLE service_orders RENAME COLUMN valor_servicos TO services_amount;
ALTER TABLE service_orders RENAME COLUMN valor_pecas TO parts_amount;
ALTER TABLE service_orders RENAME COLUMN valor_desconto TO discount_amount;
ALTER TABLE service_orders RENAME COLUMN valor_total TO total_amount;
ALTER TABLE service_orders RENAME COLUMN observacoes TO notes;
ALTER TABLE service_orders RENAME COLUMN finalizada_at TO completed_at;

UPDATE service_orders SET status = 'OPEN' WHERE status = 'ABERTA';
UPDATE service_orders SET status = 'IN_PROGRESS' WHERE status = 'EM_ANDAMENTO';
UPDATE service_orders SET status = 'WAITING_PARTS' WHERE status = 'AGUARDANDO_PECA';
UPDATE service_orders SET status = 'COMPLETED' WHERE status = 'FINALIZADA';
UPDATE service_orders SET status = 'CANCELLED' WHERE status = 'CANCELADA';

-- service_order_items
ALTER TABLE service_order_items RENAME COLUMN ordem_servico_id TO service_order_id;
ALTER TABLE service_order_items RENAME COLUMN tipo TO type;
ALTER TABLE service_order_items RENAME COLUMN produto_id TO product_id;
ALTER TABLE service_order_items RENAME COLUMN descricao TO description;
ALTER TABLE service_order_items RENAME COLUMN quantidade TO quantity;
ALTER TABLE service_order_items RENAME COLUMN valor_unitario TO unit_price;
ALTER TABLE service_order_items RENAME COLUMN valor_total TO total_price;

UPDATE service_order_items SET type = 'SERVICE' WHERE type = 'SERVICO';
UPDATE service_order_items SET type = 'PART' WHERE type = 'PECA';

-- stock_movements
ALTER TABLE stock_movements RENAME COLUMN produto_id TO product_id;
ALTER TABLE stock_movements RENAME COLUMN tipo TO type;
ALTER TABLE stock_movements RENAME COLUMN quantidade TO quantity;
ALTER TABLE stock_movements RENAME COLUMN motivo TO reason;
ALTER TABLE stock_movements RENAME COLUMN ordem_servico_id TO service_order_id;
ALTER TABLE stock_movements RENAME COLUMN usuario_id TO user_id;

UPDATE stock_movements SET type = 'IN' WHERE type = 'ENTRADA';
UPDATE stock_movements SET type = 'OUT' WHERE type = 'SAIDA';
UPDATE stock_movements SET type = 'ADJUSTMENT' WHERE type = 'AJUSTE';
