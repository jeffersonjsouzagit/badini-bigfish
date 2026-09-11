const express = require('express');
const prisma = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, orderSchema } = require('../middleware/validation');

const router = express.Router();

// Gerar numero do pedido
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BBF${year}${month}${random}`;
};

// ============================================
// POST /api/orders
// ============================================
router.post('/', optionalAuth, validate(orderSchema), async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      addressId,
      address,
      items,
      notes,
    } = req.body;

    // Buscar produtos e calcular totais
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      return res.status(400).json({ error: 'Um ou mais produtos nao foram encontrados' });
    }

    // Calcular subtotal
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        option: item.option || null,
      };
    });

    // Calcular desconto (5% para PIX)
    let discount = 0;
    if (paymentMethod === 'pix') {
      discount = subtotal * 0.05;
    }

    const total = subtotal - discount;

    // Criar endereco se fornecido
    let finalAddressId = addressId;
    if (!addressId && address) {
      const newAddress = await prisma.address.create({
        data: {
          userId: req.user?.id || null,
          ...address,
          isDefault: false,
        },
      });
      finalAddressId = newAddress.id;
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        subtotal,
        discount,
        total,
        notes,
        addressId: finalAddressId,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      order,
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// ============================================
// GET /api/orders
// ============================================
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const where = {};

    // Se nao for admin, mostrar apenas pedidos do usuario
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.order.count({ where }),
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

// ============================================
// GET /api/orders/:id
// ============================================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        payments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido nao encontrado' });
    }

    // Verificar se o usuario e dono do pedido (ou admin)
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// ============================================
// PATCH /api/orders/:id/status (Admin)
// ============================================
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Apenas admin pode alterar status
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status invalido' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });

    res.json({ order });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;
