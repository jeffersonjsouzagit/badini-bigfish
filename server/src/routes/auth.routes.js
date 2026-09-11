const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Gerar tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// ============================================
// POST /api/auth/register
// ============================================
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, cpf } = req.body;

    // Verificar se email ja existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email ja cadastrado' });
    }

    // Verificar se CPF ja existe (se fornecido)
    if (cpf) {
      const existingCpf = await prisma.user.findUnique({
        where: { cpf },
      });

      if (existingCpf) {
        return res.status(400).json({ error: 'CPF ja cadastrado' });
      }
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        cpf,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Salvar sessao
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });

    // Cookie do refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      user,
      accessToken,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha invalidos' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha invalidos' });
    }

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Salvar sessao
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Cookie do refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ============================================
// POST /api/auth/refresh
// ============================================
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token nao fornecido' });
    }

    // Verificar token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Verificar se sessao existe e e valida
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token: refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({ error: 'Sessao invalida' });
    }

    // Gerar novos tokens
    const tokens = generateTokens(decoded.userId);

    // Atualizar sessao
    await prisma.session.update({
      where: { id: session.id },
      data: { token: tokens.refreshToken },
    });

    // Cookie do novo refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error('Erro no refresh:', error);
    res.status(401).json({ error: 'Token invalido' });
  }
});

// ============================================
// POST /api/auth/logout
// ============================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Deletar sessao
      await prisma.session.deleteMany({
        where: {
          userId: req.user.id,
          token: refreshToken,
        },
      });
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

// ============================================
// GET /api/auth/me
// ============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        addresses: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar usuario:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuario' });
  }
});

module.exports = router;
