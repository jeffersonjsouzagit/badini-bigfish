const { z } = require('zod');

// Middleware de validacao genérico
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados invalidos',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

// ============================================
// SCHEMAS DE VALIDACAO
// ============================================

// Auth
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
  phone: z.string().optional(),
  cpf: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha e obrigatoria'),
});

// Produtos
const productSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').max(200),
  slug: z.string().min(1, 'Slug e obrigatorio').max(200),
  description: z.string().min(1, 'Descricao e obrigatoria').max(1000),
  fullDescription: z.string().max(5000).optional(),
  category: z.string().min(1, 'Categoria e obrigatoria').max(100),
  price: z.number().positive('Preco deve ser positivo'),
  badge: z.string().max(50).optional(),
  imageUrl: z.string().url('URL da imagem invalida').optional(),
  videoUrl: z.string().url('URL do video invalida').optional(),
  folder: z.string().max(200).optional(),
  mainImage: z.string().max(200).optional(),
  specs: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  options: z.array(z.string()).optional(),
  optionLabel: z.string().max(50).optional(),
  tip: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

// Pedidos
const orderSchema = z.object({
  customerName: z.string().min(2, 'Nome e obrigatorio').max(100),
  customerEmail: z.string().email('Email invalido'),
  customerPhone: z.string().min(10, 'Telefone invalido').max(15),
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto']),
  addressId: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Rua e obrigatoria'),
    number: z.string().min(1, 'Numero e obrigatorio'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro e obrigatorio'),
    city: z.string().min(1, 'Cidade e obrigatoria'),
    state: z.string().min(2, 'Estado e obrigatorio').max(2),
    zipCode: z.string().min(8, 'CEP invalido').max(9),
  }).optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    option: z.string().optional(),
  })).min(1, 'Adicione pelo menos 1 produto'),
  notes: z.string().max(500).optional(),
});

// Endereco
const addressSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1, 'Rua e obrigatoria').max(200),
  number: z.string().max(20).optional(),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro e obrigatorio').max(100),
  city: z.string().min(1, 'Cidade e obrigatoria').max(100),
  state: z.string().min(2, 'Estado e obrigatorio').max(2),
  zipCode: z.string().min(8, 'CEP invalido').max(9).optional(),
  zip: z.string().min(8, 'CEP invalido').max(9).optional(),
  isDefault: z.boolean().optional(),
}).refine((data) => data.zipCode || data.zip, { message: 'CEP e obrigatorio' });

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  productSchema,
  orderSchema,
  addressSchema,
};
