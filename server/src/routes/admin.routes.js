const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas admin precisam de autenticacao e ser admin
router.use(authenticate, authorizeAdmin);

// ============================================
// GET /api/admin/dashboard
// ============================================
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      recentOrders,
      ordersByStatus,
      revenueLast30Days,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { total: true },
      }),
    ]);

    res.json({
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        revenueLast30Days: revenueLast30Days._sum.total || 0,
      },
      recentOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

// ============================================
// GET /api/admin/sales
// ============================================
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, status, limit = 100, offset = 0 } = req.query;

    const where = {
      status: { notIn: ['PENDING', 'CANCELLED', 'REFUNDED'] },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate + 'T00:00:00');
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (status) {
      where.status = status;
    }

    const [orders, total, aggregate] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { total: true, discount: true },
        _avg: { total: true },
      }),
    ]);

    res.json({
      orders,
      total,
      summary: {
        totalRevenue: aggregate._sum.total || 0,
        totalDiscount: aggregate._sum.discount || 0,
        averageTicket: aggregate._avg.total || 0,
        totalOrders: total,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

// ============================================
// GET /api/admin/orders
// ============================================
router.get('/orders', async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
          payments: true,
          user: {
            select: { id: true, name: true, email: true },
          },
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
// GET /api/admin/customers
// ============================================
router.get('/customers', async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      customers,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// ============================================
// PUT /api/admin/orders/:id/status
// ============================================
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status invalido' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({ order });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;
