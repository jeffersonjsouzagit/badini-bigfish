const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ============================================
// MIDDLEWARE DE SEGURANCA
// ============================================

// Helmet - Headers de seguranca
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS - Apenas origens permitidas
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate Limiting - Protecao contra brute force
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Muitas requisicoes. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate limiting mais restritivo para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Cookies
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// ARQUIVOS ESTATICOS (Frontend)
// ============================================
const frontendPath = path.join(__dirname, '../..');
app.use(express.static(frontendPath));

// ============================================
// ROTAS
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// 404 - Para rotas de API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada' });
});

// SPA fallback - Para rotas do frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro:', err);

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
    });
  }

  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
  });
});

// ============================================
// INICIALIZAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3001;

async function startServer() {
  // Em producao, rodar migrate e seed automaticamente
  if (process.env.NODE_ENV === 'production') {
    const { execSync } = require('child_process');
    try {
      console.log('Rodando prisma migrate deploy...');
      execSync('npx prisma migrate deploy', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log('Migrate concluido!');
    } catch (e) {
      console.error('Erro no migrate:', e.message);
    }
    try {
      console.log('Rodando seed...');
      execSync('node prisma/seed.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log('Seed concluido!');
    } catch (e) {
      console.error('Erro no seed:', e.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

module.exports = app;
