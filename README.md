# 🏍️ DV Motos - Sistema de Gestão

Sistema de gestão para oficina mecânica de motocicletas.

## 📋 Funcionalidades do MVP

- ✅ Autenticação com JWT
- ✅ Cadastro de Clientes
- ✅ Cadastro de Veículos
- 🔄 Controle de Estoque (em desenvolvimento)
- 🔄 Ordens de Serviço (em desenvolvimento)
- 🔄 Dashboard com relatórios (em desenvolvimento)

## 🛠️ Stack Tecnológica

### Backend
- Java 21
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 16
- Flyway (migrations)
- Swagger/OpenAPI

### Frontend
- Angular 17 (Standalone Components)
- PrimeNG 17
- PrimeFlex
- TypeScript

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose
- Java 21 (para desenvolvimento)
- Node.js 20+ (para desenvolvimento)
- Maven 3.9+ (para desenvolvimento)

### Opção 1: Apenas o Banco de Dados (Desenvolvimento)

```bash
# Subir apenas o PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# O banco estará disponível em:
# Host: localhost
# Porta: 5432
# Database: dvmotos
# Usuário: dvmotos
# Senha: dvmotos123

# pgAdmin (opcional) estará em http://localhost:5050
# Email: admin@dvmotos.com.br
# Senha: admin123
```

### Opção 2: Tudo com Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Frontend: http://localhost:4200
# Backend API: http://localhost:8080/api
# Swagger: http://localhost:8080/api/swagger-ui.html
```

### Opção 3: Desenvolvimento Local

#### Backend

```bash
cd backend

# Instalar dependências e rodar
./mvnw spring-boot:run

# Ou com variáveis de ambiente customizadas
DB_HOST=localhost DB_PORT=5432 ./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm start

# Acessar http://localhost:4200
```

## 🔐 Credenciais Padrão

```
Email: admin@dvmotos.com.br
Senha: admin123
```

## 📁 Estrutura do Projeto

```
dvmotos/
├── backend/
│   ├── src/main/java/com/dvmotos/
│   │   ├── config/          # Configurações (Security, CORS)
│   │   ├── controller/      # REST Controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # Entidades JPA
│   │   ├── exception/       # Exceções customizadas
│   │   ├── repository/      # Interfaces Spring Data
│   │   ├── security/        # JWT e filtros
│   │   └── service/         # Lógica de negócio
│   └── src/main/resources/
│       ├── application.yml  # Configurações
│       └── db/migration/    # Scripts Flyway
│
├── frontend/
│   └── src/app/
│       ├── core/            # Serviços, guards, interceptors
│       ├── shared/          # Componentes compartilhados
│       ├── features/        # Módulos de funcionalidades
│       └── layout/          # Layout principal
│
├── docker-compose.yml       # Produção
└── docker-compose.dev.yml   # Desenvolvimento
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/{id}` - Buscar por ID
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/{id}` - Atualizar cliente
- `DELETE /api/clientes/{id}` - Desativar cliente

### Veículos
- `GET /api/veiculos` - Listar veículos
- `GET /api/veiculos/{id}` - Buscar por ID
- `GET /api/veiculos/placa/{placa}` - Buscar por placa
- `GET /api/veiculos/cliente/{clienteId}` - Veículos do cliente
- `POST /api/veiculos` - Criar veículo
- `PUT /api/veiculos/{id}` - Atualizar veículo
- `DELETE /api/veiculos/{id}` - Desativar veículo

## 📝 Variáveis de Ambiente

### Backend

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DB_HOST` | Host do PostgreSQL | localhost |
| `DB_PORT` | Porta do PostgreSQL | 5432 |
| `DB_NAME` | Nome do banco | dvmotos |
| `DB_USER` | Usuário do banco | dvmotos |
| `DB_PASSWORD` | Senha do banco | dvmotos123 |
| `JWT_SECRET` | Chave secreta JWT | (desenvolvimento) |
| `SERVER_PORT` | Porta da API | 8080 |

## 📅 Roadmap

- [x] Semana 1-2: Setup + Autenticação
- [x] Semana 3-4: Clientes + Veículos
- [ ] Semana 5: Estoque + Categorias
- [ ] Semana 6-7: Ordens de Serviço
- [ ] Semana 8: Dashboard + Deploy

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso exclusivo da DV Motos.
