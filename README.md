# Badini Big Fish - E-commerce

Sistema completo de e-commerce para iscas artesanais de pesca.

## Funcionalidades

- **Catalogo de Produtos** - Galeria de imagens com thumbnails
- **Carrinho de Compras** - Persistente via localStorage
- **Sistema de Pedidos** - Checkout completo
- **Pagamento Flexivel** - Integracao com API de pagamento
- **Painel Administrativo** - Gerenciamento de pedidos e clientes
- **Seguranca** - JWT, HTTPS, Rate Limiting, Helmet

## Stack Tecnologica

### Frontend
- HTML5 / CSS3 / JavaScript
- Google Fonts (Oswald + Open Sans)

### Backend
- Node.js 22 LTS
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (Autenticacao)
- bcryptjs (Senhas)

### Infraestrutura
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- SSL/HTTPS (Let's Encrypt)

## Estrutura do Projeto

```
badini-bigfish/
├── client/                    # Frontend
│   ├── index.html            # Pagina principal
│   ├── produtos.html         # Catalogo de produtos
│   ├── css/                  # Estilos
│   ├── js/                   # JavaScript
│   │   └── api.js            # Cliente API
│   └── img/                  # Imagens
├── server/                   # Backend
│   ├── src/
│   │   ├── config/           # Configuracoes
│   │   ├── middleware/       # Middlewares
│   │   ├── routes/           # Rotas da API
│   │   └── server.js         # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo do banco
│   │   └── seed.js           # Dados iniciais
│   ├── Dockerfile
│   └── package.json
├── admin/                    # Painel administrativo
│   └── index.html
├── nginx/                    # Configuracao Nginx
│   └── nginx.conf
├── docker-compose.yml
├── DEPLOY.md                 # Guia de deploy
└── README.md
```

## Instalacao Local

### Pre-requisitos
- Node.js 22+
- PostgreSQL 16+
- npm ou yarn

### Passo a passo

```bash
# 1. Clonar repositorio
git clone https://github.com/seu-usuario/badini-bigfish.git
cd badini-bigfish

# 2. Configurar backend
cd server
cp .env.example .env
# Edite .env com suas configuracoes

# 3. Instalar dependencias
npm install

# 4. Gerar Prisma
npx prisma generate

# 5. Criar tabelas
npx prisma migrate dev

# 6. Popula banco com dados
npm run prisma:seed

# 7. Iniciar servidor
npm run dev
```

O servidor estara rodando em http://localhost:3001

## Deploy com Docker

```bash
# 1. Criar arquivo .env na raiz
cp server/.env.example .env

# 2. Editar .env com suas configuracoes

# 3. Subir containers
docker-compose up -d

# 4. Verificar status
docker-compose ps
docker-compose logs -f
```

## Deploy Manual (Sem Docker)

Consulte o arquivo `DEPLOY.md` para instrucoes detalhadas de deploy em servidor VPS.

## API Endpoints

### Auth
- `POST /api/auth/register` - Cadastrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil do usuario

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:slug` - Buscar produto

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Buscar pedido

### Clientes
- `GET /api/customers/profile` - Perfil
- `PUT /api/customers/profile` - Atualizar perfil
- `GET /api/customers/addresses` - Enderecos
- `POST /api/customers/addresses` - Adicionar endereco

### Pagamento
- `POST /api/payment/create` - Criar pagamento
- `POST /api/payment/webhook` - Webhook do parceiro

### Admin
- `GET /api/admin/dashboard` - Dashboard
- `GET /api/admin/orders` - Pedidos
- `GET /api/admin/customers` - Clientes

## Seguranca

- **HTTPS** - Certificado SSL (Let's Encrypt)
- **Helmet** - Headers de seguranca HTTP
- **CORS** - Apenas origens permitidas
- **Rate Limiting** - Protecao contra brute force
- **JWT** - Tokens de autenticacao
- **bcrypt** - Senhas hasheadas
- **Zod** - Validacao de dados
- **Webhook Verification** - HMAC-SHA256

## Integracao com API de Pagamento

O sistema foi projetado para ser flexivel com qualquer API de pagamento. Para integrar com a API do seu parceiro:

1. Edite o arquivo `server/src/routes/payment.routes.js`
2. Implemente os metodos da classe `PaymentService`:
   - `createPayment()` - Criar pagamento
   - `checkPaymentStatus()` - Verificar status
   - `processWebhook()` - Processar webhook

## Credenciais Admin (Padrao)

- **Email:** admin@badinibigfish.com.br
- **Senha:** admin123

**IMPORTANTE:** Altere a senha apos o primeiro login!

## Suporte

Em caso de duvidas, abra uma issue no GitHub ou entre em contato.

## Licenca

Todos os direitos reservados - Badini Big Fish 2024
