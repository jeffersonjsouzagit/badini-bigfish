# ============================================
# GUIA DE INTEGRACAO - API DE PAGAMENTO
# ============================================

## Como integrar sua API de pagamento

O sistema foi projetado para ser **flexivel** e aceitar qualquer API de pagamento.
Para integrar com seu parceiro, siga estes passos:

### 1. Configure as variaveis de ambiente em `.env`

```env
PAYMENT_API_URL="https://api.seu-parceiro.com/v1"
PAYMENT_API_KEY="sua_chave_api_aqui"
PAYMENT_WEBHOOK_SECRET="secreto_webhook_aqui"
```

### 2. Implemente os metodos na classe `PaymentService`

Edite o arquivo `server/src/routes/payment.routes.js` e implemente os metodos:

```javascript
class PaymentService {
  // Criar pagamento na API do parceiro
  async createPayment(orderData) {
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
        // Adicione outros campos conforme sua API
      }),
    });

    const data = await response.json();
    
    // Retorne no formato:
    return {
      id: data.id,                    // ID do pagamento no parceiro
      status: data.status,            // status do pagamento
      payment_url: data.payment_url,  // URL para redirecionar o cliente
    };
  }

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId) {
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();
    return {
      id: data.id,
      status: data.status, // 'approved', 'pending', 'rejected'
    };
  }
}
```

### 3. Configure o webhook no painel do parceiro

Configure a URL do webhook no painel do seu parceiro de pagamento:
```
https://seudominio.com/api/payment/webhook
```

O webhook deve enviar:
- `payment_id` - ID do pagamento
- `status` - Status do pagamento (approved, pending, rejected)
- `order_id` - Numero do pedido

### 4. Mapeamento de status

| Status do Parceiro | Status no Sistema |
|-------------------|-------------------|
| approved | APPROVED → Pedido CONFIRMED |
| pending | PENDING |
| rejected | REJECTED → Pedido CANCELLED |
| refunded | REFUNDED |
| cancelled | CANCELLED → Pedido CANCELLED |

### Exemplos de integracao

#### Mercado Pago
```javascript
async createPayment(orderData) {
  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction_amount: orderData.amount,
      description: `Pedido ${orderData.orderNumber}`,
      payment_method_id: orderData.paymentMethod === 'pix' ? 'pix' : 'credit_card',
      // ... outros campos
    }),
  });
  // ...
}
```

#### PagSeguro
```javascript
async createPayment(orderData) {
  const response = await fetch('https://api.sandbox.pagseguro.com/v2/charges', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: { value: orderData.amount * 100 },
      description: `Pedido ${orderData.orderNumber}`,
      payment_method: { type: 'PIX' },
    }),
  });
  // ...
}
```

#### Stripe
```javascript
async createPayment(orderData) {
  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: Math.round(orderData.amount * 100),
      currency: 'brl',
      description: `Pedido ${orderData.orderNumber}`,
    }),
  });
  // ...
}
```
