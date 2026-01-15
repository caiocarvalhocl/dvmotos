-- V2__seed_data.sql
-- Dados iniciais do sistema

-- Usuário admin padrão (senha: admin123)
-- Hash BCrypt para 'admin123'
INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
VALUES ('Administrador', 'admin@dvmotos.com.br', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Zjd.', 'ADMIN', TRUE);

-- Categorias padrão
INSERT INTO categorias (nome, descricao) VALUES
('Filtros', 'Filtros de óleo, ar e combustível'),
('Pneus', 'Pneus e câmaras de ar'),
('Freios', 'Pastilhas, lonas e discos de freio'),
('Motor', 'Peças internas do motor'),
('Transmissão', 'Correntes, coroas e pinhões'),
('Elétrica', 'Componentes elétricos'),
('Suspensão', 'Amortecedores e componentes'),
('Lubrificantes', 'Óleos e graxas'),
('Acessórios', 'Acessórios diversos');
