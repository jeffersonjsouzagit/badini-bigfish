const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validate, addressSchema } = require('../middleware/validation');

const router = express.Router();

// ============================================
// GET /api/customers/profile
// ============================================
router.get('/profile', authenticate, async (req, res) => {
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
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// ============================================
// PUT /api/customers/profile
// ============================================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, cpf } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        cpf,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// ============================================
// GET /api/customers/addresses
// ============================================
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });

    res.json({ addresses });
  } catch (error) {
    console.error('Erro ao buscar enderecos:', error);
    res.status(500).json({ error: 'Erro ao buscar enderecos' });
  }
});

// ============================================
// POST /api/customers/addresses
// ============================================
router.post('/addresses', authenticate, validate(addressSchema), async (req, res) => {
  try {
    const addressData = req.body;

    // Se for o primeiro endereco, marcar como padrao
    const existingAddresses = await prisma.address.count({
      where: { userId: req.user.id },
    });

    if (existingAddresses === 0) {
      addressData.isDefault = true;
    }

    // Se for marcado como padrao, desmarcar outros
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        ...addressData,
      },
    });

    res.status(201).json({ address });
  } catch (error) {
    console.error('Erro ao criar endereco:', error);
    res.status(500).json({ error: 'Erro ao criar endereco' });
  }
});

// ============================================
// PUT /api/customers/addresses/:id
// ============================================
router.put('/addresses/:id', authenticate, validate(addressSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const addressData = req.body;

    // Verificar se o endereco pertence ao usuario
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ error: 'Endereco nao encontrado' });
    }

    // Se for marcado como padrao, desmarcar outros
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: addressData,
    });

    res.json({ address });
  } catch (error) {
    console.error('Erro ao atualizar endereco:', error);
    res.status(500).json({ error: 'Erro ao atualizar endereco' });
  }
});

// ============================================
// DELETE /api/customers/addresses/:id
// ============================================
router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o endereco pertence ao usuario
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ error: 'Endereco nao encontrado' });
    }

    await prisma.address.delete({
      where: { id },
    });

    res.json({ message: 'Endereco removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover endereco:', error);
    res.status(500).json({ error: 'Erro ao remover endereco' });
  }
});

// ============================================
// GET /api/customers/orders
// ============================================
router.get('/orders', authenticate, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          items: true,
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.order.count({
        where: { userId: req.user.id },
      }),
    ]);

    res.json({
      orders,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

module.exports = router;
