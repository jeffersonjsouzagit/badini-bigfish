const express = require('express');
const crypto = require('crypto');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ============================================
// SERVICO DE PAGAMENTO (Abstrato para flexibilidade)
// ============================================
// Esta classe pode ser estendida para qualquer API de pagamento
class PaymentService {
  constructor() {
    this.apiUrl = process.env.PAYMENT_API_URL;
    this.apiKey = process.env.PAYMENT_API_KEY;
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  }

  // Criar pagamento (implementar conforme API do parceiro)
  async createPayment(orderData) {
    // TODO: Implementar com a API do seu parceiro
    // Exemplo de como seria:
    /*
    const response = await fetch(`${this.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: orderData.amount,
        currency: 'BRL',
        description: `Pedido ${orderData.orderNumber}`,
        payment_method: orderData.paymentMethod,
        // ... outros campos conforme API do parceiro
      }),
    });

    return await response.json();
    */

    // Por enquanto, retorna um mock
    return {
      id: `pay_${Date.now()}`,
      status: 'pending',
      payment_url: `https://pagamento.exemplo.com/pay/${orderData.orderNumber}`,
    };
  }

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId) {
    // TODO: Implementar com a API do seu parceiro
    return {
      id: paymentId,
      status: 'approved',
    };
  }

  // Verificar assinatura do webhook
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('WEBHOOK_SECRET nao configurado');
      return true; // Em dev, aceita tudo
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Processar webhook
  async processWebhook(webhookData) {
    const { payment_id, status, order_id } = webhookData;

    // Atualizar pagamento no banco
    const payment = await prisma.payment.findFirst({
      where: { transactionId: payment_id },
    });

    if (!payment) {
      throw new Error('Pagamento nao encontrado');
    }

    // Mapear status
    const statusMap = {
      approved: 'APPROVED',
      pending: 'PENDING',
      rejected: 'REJECTED',
      refunded: 'REFUNDED',
      cancelled: 'CANCELLED',
    };

    const newStatus = statusMap[status] || 'PENDING';

    // Atualizar pagamento
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paymentData: webhookData,
      },
    });

    // Se aprovado, atualizar pedido
    if (newStatus === 'APPROVED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    // Se rejeitado ou cancelado
    if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' },
      });
    }

    return { success: true };
  }
}

const paymentService = new PaymentService();

// ============================================
// POST /api/payment/create
// ============================================
router.post('/create', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Buscar pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido nao encontrado' });
    }

    // Verificar se ja tem pagamento
    if (order.payments.length > 0) {
      return res.status(400).json({ error: 'Pedido ja possui pagamento' });
    }

    // Criar pagamento no parceiro
    const paymentResult = await paymentService.createPayment({
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentMethod: order.paymentMethod,
    });

    // Salvar pagamento no banco
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: order.paymentMethod,
        transactionId: paymentResult.id,
        status: 'PENDING',
        amount: order.total,
        paymentData: paymentResult,
      },
    });

    res.json({
      payment: {
        id: payment.id,
        status: payment.status,
        paymentUrl: paymentResult.payment_url,
      },
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// ============================================
// POST /api/payment/webhook
// ============================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verificar assinatura
    const signature = req.headers['x-webhook-signature'];
    const payload = req.body.toString();

    if (!paymentService.verifyWebhookSignature(payload, signature)) {
      console.error('Assinatura do webhook invalida');
      return res.status(401).json({ error: 'Assinatura invalida' });
    }

    const webhookData = JSON.parse(payload);

    console.log('Webhook recebido:', webhookData);

    // Processar webhook
    await paymentService.processWebhook(webhookData);

    res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// ============================================
// GET /api/payment/status/:orderId
// ============================================
router.get('/status/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ error: 'Erro ao buscar status do pagamento' });
  }
});

module.exports = router;
