const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validate, productSchema } = require('../middleware/validation');

const router = express.Router();

// ============================================
// GET /api/products
// ============================================
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    const where = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// ============================================
// GET /api/products/:slug
// ============================================
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// ============================================
// POST /api/products (Admin)
// ============================================
router.post('/', authenticate, authorizeAdmin, validate(productSchema), async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: {
        images: true,
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// ============================================
// PUT /api/products/:id (Admin)
// ============================================
router.put('/:id', authenticate, authorizeAdmin, validate(productSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
      include: {
        images: true,
      },
    });

    res.json({ product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// ============================================
// DELETE /api/products/:id (Admin)
// ============================================
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

// ============================================
// GET /api/products/categories/list
// ============================================
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
    });

    res.json({ categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

module.exports = router;
