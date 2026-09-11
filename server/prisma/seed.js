const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // CRIAR ADMIN
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@badinibigfish.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@badinibigfish.com.br',
      password: adminPassword,
      role: 'ADMIN',
      phone: '(00) 00000-0000',
    },
  });
  console.log('Admin criado:', admin.email);

  // CRIAR PRODUTOS COM IMAGENS
  const products = [
    {
      slug: 'massa-artesanal-unidade',
      name: 'Massa Artesanal Badini BigFish',
      description: 'Massa para pesca em po super cheiroso.',
      fullDescription: 'Massa em po para pesca de peixes redondos (Tambaqui, Tambacu, Pacu).',
      category: 'Massa em Po',
      price: 17.99,
      badge: 'Mais Vendido',
      folder: 'Fotos Produtos/Massa Artesanal De Pesca - Badini Bigfish - Unidade - Poderosa Branca, Fire, Estouro, Misteriosa - A Ideal para Pesca',
      mainImage: 'br-11134207-820li-mlnxgekfjime81@resize_w450_nl.webp',
      videoUrl: 'br-11110105-6v6x7-mr7ntwq1zshzab.16000081785261587.mp4',
      specs: [{ label: 'Peso', value: '400g' }, { label: 'Tipo', value: 'Po' }, { label: 'Indicado para', value: 'Tambaqui, Pacu, Tambacu' }, { label: 'Modo de uso', value: 'Misturar com agua' }],
      options: ['Poderosa Branca', 'Fire', 'Estouro', 'Misteriosa'],
      optionLabel: 'Sabor',
      tip: 'Misture com agua aos poucos ate atingir consistencia firme.',
      images: [
        'br-11134207-820li-mlnxgekfjime81@resize_w450_nl.webp',
        'br-11134207-820lj-msaa7r6dq2h0ea@resize_w450_nl.webp',
        'br-11134207-820ll-mlf3c875b2tje5@resize_w450_nl.webp',
        'br-11134207-820lv-msaa7r6donwk76@resize_w450_nl.webp',
        'br-11134207-820lw-msaamcibvchw14@resize_w450_nl.webp',
        'br-11134207-820lx-mlf3c875chdz1d@resize_w450_nl.webp',
        'br-11134207-820lz-msaa7r6dsvlw43@resize_w450_nl.webp',
        'br-11134207-820m5-msaa7r6drh1gec@resize_w450_nl.webp',
        'br-11134207-820m7-mlf3c8759o936c@resize_w450_nl.webp',
      ],
    },
    {
      slug: 'kit-3-massas-artesanais',
      name: 'Kit 3 Massas Artesanais',
      description: 'Kit com 3 unidades de massas artesanais.',
      fullDescription: 'Kit completo com 3 massas de 400g cada.',
      category: 'Kit Massa',
      price: 49.90,
      badge: 'Economize',
      folder: 'Fotos Produtos/Massa Artesanal de Pesca - Badini BigFish - Kit 3 Unidades - Poderosa Branca, Fire, Estouro, Misteriosa',
      mainImage: 'br-11134207-820l5-msaa7r6dua6c1d@resize_w450_nl.webp',
      videoUrl: 'br-11110105-6v6x7-mruu7kbgfbife0.16000081786664606.mp4',
      specs: [{ label: 'Conteudo', value: '3 unidades de 400g' }, { label: 'Sabores', value: 'Escolha seu trio' }, { label: 'Indicado para', value: 'Tambaqui, Pacu, Tambacu' }, { label: 'Peso Total', value: '1.2kg' }],
      options: ['Escolha Seu Trio', 'Poderosa Branca + Fire + Estouro', 'Misteriosa + Estouro + Poderosa Branca', 'Fire + Misteriosa + Estouro'],
      optionLabel: 'Combo',
      tip: 'Compre o kit e economize no frete!',
      images: [
        'br-11134207-820l5-msaa7r6dua6c1d@resize_w450_nl.webp',
        'br-11134207-820l9-msa9f7fsevpha7@resize_w450_nl.webp',
        'br-11134207-820lb-mlm7nzy7jime19@resize_w450_nl.webp',
        'br-11134207-820lc-mlm7nzy7nqbq8f@resize_w450_nl.webp',
        'br-11134207-820lk-mlnmclcdkuf914@resize_w450_nl.webp',
        'br-11134207-820lw-mlm7nzy7p4w67b@resize_w450_nl.webp',
        'br-11134207-820m2-mlm7nzy7fax274@resize_w450_nl.webp',
        'br-11134207-820md-mlm7nzy7i41y31@resize_w450_nl.webp',
      ],
    },
    {
      slug: 'kit-massa-misteriosa-escolha',
      name: 'Kit Massa Misteriosa + Escolha',
      description: 'Combo com a Massa Misteriosa + uma massa a sua escolha.',
      fullDescription: 'Combo com potencia e praticidade.',
      category: 'Kit Combo',
      price: 34.90,
      folder: 'Fotos Produtos/Kit Massa Pesca',
      mainImage: 'Kit Massa Pesca 1.webp',
      videoUrl: 'br-11110105-6v6x7-mmsxwgx5auwxdb.16000081775653542.mp4',
      specs: [{ label: 'Conteudo', value: '2 unidades de 400g' }, { label: 'Sabores', value: 'Misteriosa + 1 a escolher' }, { label: 'Indicado para', value: 'Tambaqui, Pacu, Tambacu' }, { label: 'Peso Total', value: '800g' }],
      options: ['Misteriosa + Poderosa Branca', 'Misteriosa + Fire', 'Misteriosa + Estouro'],
      optionLabel: 'Combo',
      tip: 'A Misteriosa e a massa mais vendida!',
      images: [
        'Kit Massa Pesca 1.webp',
        'Kit Massa Pesca 1-1.webp',
        'Kit Massa Pesca 1-2.webp',
        'Kit Massa Pesca 1-3.webp',
        'Kit Massa Pesca 1-4.webp',
        'Modo de preparo.webp',
      ],
    },
    {
      slug: 'massa-estouro',
      name: 'Massa Estouro',
      description: 'Massa em po com formula exclusiva de farinhas especiais, queijo, mel e goiaba.',
      fullDescription: 'Massa com sabor doce irresistivel para peixes redondos.',
      category: 'Massa em Po',
      price: 17.99,
      folder: 'Fotos Produtos/Massa Para Pesca Badini Big Fish - ESTOURO - Pacu, Tambaqui, Tambacú',
      mainImage: 'br-11134207-820lm-mr1tsj58c2knb9@resize_w450_nl.webp',
      videoUrl: 'br-11110105-6v6x5-mr7ocl6fbu2u44.16000081785262460.mp4',
      specs: [{ label: 'Peso', value: '400g' }, { label: 'Sabor', value: 'Estouro (Mel + Goiaba)' }, { label: 'Indicado para', value: 'Pacu, Tambaqui, Tambacu' }, { label: 'Rendimento', value: 'Alto' }],
      options: [],
      tip: 'Perfeita para pesca com boia.',
      images: [
        'br-11134207-820lm-mr1tsj58c2knb9@resize_w450_nl.webp',
        'br-11134207-820m3-mrafii43jkzoa4@resize_w450_nl.webp',
        'br-11134207-820m9-mqziy0t40kjqb8@resize_w450_nl.webp',
        'br-11134207-820me-mqziy0t43dom08@resize_w450_nl.webp',
      ],
    },
    {
      slug: 'massa-misteriosa',
      name: 'Massa Misteriosa',
      description: 'A mais vendida! Formula com coco ralado, fecula de mandioca e essencias.',
      fullDescription: 'A Misteriosa e a favorita dos pescadores!',
      category: 'Massa em Po',
      price: 17.99,
      badge: 'Mais Vendida',
      folder: 'Fotos Produtos/Massa Para Pesca Badini Big Fish - MISTERIOSA - Pacu, Tambaqui, Tambacú',
      mainImage: 'br-11134207-820la-mqziy0t48zye45@resize_w450_nl.webp',
      videoUrl: 'br-11110105-6v6x8-mrg7u84qwg7a4b.16000081785779507.mp4',
      specs: [{ label: 'Peso', value: '400g' }, { label: 'Sabor', value: 'Misteriosa' }, { label: 'Indicado para', value: 'Pacu, Tambaqui, Tambacu' }, { label: 'Rendimento', value: 'Alto' }],
      options: [],
      tip: 'Funciona em qualquer condicao de pesca!',
      images: [
        'br-11134207-820la-mqziy0t48zye45@resize_w450_nl.webp',
        'br-11134207-820ly-mqziy0t466tid4@resize_w450_nl.webp',
        'br-11134207-820mc-mrg7qvorwlja3e@resize_w450_nl.webp',
        'br-11134207-820me-mrg7qvosyiv91a@resize_w450_nl.webp',
      ],
    },
    {
      slug: 'massa-poderosa-branca',
      name: 'Massa Poderosa Branca',
      description: 'Farinhas especiais, coco ralado, queijo ralado, leite em po.',
      fullDescription: 'Ideal para quem busca resultados expressivos.',
      category: 'Massa em Po',
      price: 17.99,
      folder: 'Fotos Produtos/Massa Para Pesca Badini Big Fish - PODEROSA BRANCA - Pacu, Tambaqui, Tambacú',
      mainImage: 'br-11134207-820lv-mqziy0t4bt3abd@resize_w450_nl.webp',
      videoUrl: 'br-11110105-6v6x7-mqzk3d12u9z942.16000081784771025.mp4',
      specs: [{ label: 'Peso', value: '400g' }, { label: 'Sabor', value: 'Poderosa Branca (Queijo + Leite)' }, { label: 'Indicado para', value: 'Pacu, Tambaqui, Tambacu' }, { label: 'Rendimento', value: 'Alto' }],
      options: [],
      tip: 'Misture ate atingir massa firme.',
      images: [
        'br-11134207-820lv-mqziy0t4bt3abd@resize_w450_nl.webp',
        'br-11134207-820lx-mqzjxwpbm8lhe2@resize_w450_nl.webp',
        'br-11134207-820ly-mqzjxwpbp1qd27@resize_w450_nl.webp',
        'br-11134207-820m3-mqzjxwpbnn5x83@resize_w450_nl.webp',
        'br-11134207-820m5-mqziy0t4aeiucb@resize_w450_nl.webp',
      ],
    },
    {
      slug: 'racao-furadinha-kit',
      name: 'Kit Racao Furadinha',
      description: 'Formato furadinho que encaixa facilmente no anzol.',
      fullDescription: 'Racao artesanal com formato diferenciado.',
      category: 'Racao Furadinha',
      price: 32.90,
      badge: 'Personalize',
      folder: 'Fotos Produtos/Ração Furadinha A Livre Escolha - Badini BigFish - Excelente Para Pesca - Produto Artesanal',
      mainImage: 'br-11134207-820li-mlrws8t679524a@resize_w450_nl.webp',
      videoUrl: 'br-11110105-6v7oy-msmudzj7l2py44.16000081788359871.mp4',
      specs: [{ label: 'Formato', value: 'Furadinho' }, { label: 'Fixacao', value: 'Facil no anzol' }, { label: 'Atracao', value: 'Alta liberacao de aroma' }, { label: 'Durabilidade', value: 'Excelente na agua' }],
      options: ['Bacon', 'Sambiquira', 'Amburana', 'Banana com Mel', 'Amburana com Mel', 'Pinga com Mel'],
      optionLabel: 'Sabor',
      tip: 'Encaixe no anzol ou chicote.',
      images: [
        'br-11134207-820li-mlrws8t679524a@resize_w450_nl.webp',
        'br-11134207-820lj-msmrgkh70nwl55@resize_w450_nl.webp',
        'br-11134207-820lp-msmu7b55wmpwa1@resize_w450_nl.webp',
        'br-11134207-820ls-msmu7b55r0g463@resize_w450_nl.webp',
        'br-11134207-820ly-msmu7b55o7b836@resize_w450_nl.webp',
        'br-11134207-820m0-msmrgkh6v1mtec@resize_w450_nl.webp',
        'br-11134207-820m9-msmu4imlq39h7f@resize_w450_nl.webp',
        'br-11134207-820md-msmu7b55le6c82@resize_w450_nl.webp',
      ],
    },
    {
      slug: 'racao-furadinha-bacon',
      name: 'Racao Furadinha Bacon',
      description: 'Aroma intenso e altamente atrativo com gordura do bacon.',
      fullDescription: 'A racao mais procurada!',
      category: 'Racao Furadinha',
      price: 16.90,
      folder: 'Fotos Produtos/Ração Furadinha para Pesca Bacon',
      mainImage: 'Racao Furadinha para Pesca Bacon.webp',
      videoUrl: 'br-11110105-6v6x4-mr1te4x35ybp48.16000081784907732.mp4',
      specs: [{ label: 'Peso', value: 'Unidade' }, { label: 'Sabor', value: 'Bacon' }, { label: 'Aroma', value: 'Intenso' }, { label: 'Durabilidade', value: 'Excelente na agua' }],
      options: [],
      tip: 'Funciona em qualquer profundidade.',
      images: [
        'Racao Furadinha para Pesca Bacon.webp',
        'Racao Furadinha para Pesca Bacon 2.webp',
        'Racao Furadinha para Pesca Bacon 3.webp',
      ],
    },
  ];

  for (const productData of products) {
    const { images, ...productFields } = productData;

    try {
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: productFields,
        create: productFields,
      });

      // Criar imagens
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: images[i],
            sortOrder: i,
          },
        });
      }

      console.log(`Produto criado: ${productData.name} (${images.length} imagens)`);
    } catch (error) {
      console.error(`Erro ao criar produto ${productData.name}:`, error.message);
    }
  }

  console.log('Seed concluido!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
