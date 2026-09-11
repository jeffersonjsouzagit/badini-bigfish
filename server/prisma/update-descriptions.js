const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando descricoes dos produtos...');

  const updates = [
    {
      slug: 'massa-artesanal-unidade',
      description: 'Massa para pesca Badini BigFish, ideal para atrair peixes em pesqueiros. Produto em po super cheiroso, desenvolvido especialmente para aumentar suas chances de sucesso na pescaria.',
      fullDescription: `Massa para pesca Badini BigFish, ideal para atrair peixes em pesqueiros. Produto em po super cheiroso, desenvolvido especialmente para aumentar suas chances de sucesso na pescaria.

ESPECIFICACOES

Massa em Po Poderosa Branca - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, queijo ralado, leite em po, essencias especiais concentradas. racao concentrada.

Massa em FIRE - 400g
Formula exclusiva com farinhas especiais, fecula de mandioca, concentrado em po de banana, coco, leite ninho e queijo.

Massa em Po Estouro - 400g
Formula exclusiva com farinhas especiais, fecula de mandioca, queijo, mel, goiaba desidratada concentrada em po.

Massa em Po Misteriosa - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, amido de milho, leite em po, essencia concentrada de sabores diversos.

Destaques do Produto:
- Atrativos potentes para grandes redondos
- Textura fina e aroma marcante
- Uso pratico e excelente rendimento
- Indicado para pesca esportiva ou por quilo
- Fabricado pela renomada Badini Big Fish

Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante

Modo de Preparo da Massa:
Coloque o po em um recipiente e adicione agua aos poucos, misturando bem ate atingir uma massa firme e consistente.
Durante o preparo, a Massa adquire uma liga firme de forma que ao entrar em contato com o anzol dificilmente se desprendera dele, revelando a originalidade e qualidade da formula exclusiva Badini Big Fish que nao e encontrada em nenhum outro lugar.

Dica: mantenha uma pequena quantidade do po reservado. Caso a massa fique muito liquida, e possivel corrigir a textura adicionando mais po.`,
      tip: 'Coloque o po em um recipiente e adicione agua aos poucos, misturando bem ate atingir uma massa firme e consistente.',
    },
    {
      slug: 'kit-3-massas-artesanais',
      description: 'Kit com 3 unidades de massas artesanais. Escolha seu trio de sabores ou receba o combo aleatorio.',
      fullDescription: `Kit com 3 unidades de massas artesanais.

AVISO!
Caso Escolha a opcao "Escolha Seu Trio" e nao nos contate, sera enviado o Trio de maneira aleatoria.

ESPECIFICACOES

Massa em Po Poderosa Branca - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, queijo ralado, leite em po, essencias especiais concentradas. racao concentrada.

Massa em FIRE - 400g
Formula exclusiva com farinhas especiais, fecula de mandioca, concentrado em po de banana, coco, leite ninho e queijo.

Massa em Po Estouro - 400g
Formula exclusiva com farinhas especiais, fecula de mandioca, queijo, mel, goiaba desidratada concentrada em po.

Massa em Po Misteriosa - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, amido de milho, leite em po, essencia concentrada de sabores diversos.

Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante

Modo de Preparo da Massa:
Coloque o po em um recipiente e adicione agua aos poucos, misturando bem ate atingir uma massa firme e consistente.
Durante o preparo, a Massa adquire uma liga firme de forma que ao entrar em contato com o anzol dificilmente se desprendera dele, revelando a originalidade e qualidade da formula exclusiva Badini Big Fish que nao e encontrada em nenhum outro lugar.

Dica: mantenha uma pequena quantidade do po reservado. Caso a massa fique muito liquida, e possivel corrigir a textura adicionando mais po.`,
      tip: 'Caso escolha "Escolha Seu Trio" e nao nos contate, sera enviado o Trio de maneira aleatoria.',
    },
    {
      slug: 'kit-massa-misteriosa-escolha',
      description: 'O Kit Misteriosa + Massa a sua escolha da Badini Big Fish e a escolha ideal para quem busca resultados reais na pesca de peixes redondos.',
      fullDescription: `O Kit Misteriosa + Massa a sua escolha da Badini Big Fish e a escolha ideal para quem busca resultados reais na pesca de peixes redondos, como Tambaqui, Tambacu e Pacu. Este combo reune potencia, atratividade e praticidade em dois produtos testados e aprovados por pescadores esportivos em todo o Brasil.

ESPECIFICACOES

Massa em Po Misteriosa - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, amido de milho, leite em po, essencia concentrada de sabores diversos.

Sabores De Iscas Disponiveis:
- Bacon - Aroma intenso e altamente atrativo com gordura do bacon
- Sambiquira - Classico da pesca, muito eficiente
- Amburana - Essencia marcante que atrai grandes peixes utilizando da casca da amburana
- Banana com Mel - Doce e extremamente chamativo na agua
- Amburana com Mel - Combinacao poderosa e diferenciada
- Pinga com Mel - Aroma forte que desperta o apetite dos peixes

Destaques do Produto:
- Atrativos potentes para grandes redondos
- Textura fina e aroma marcante
- Uso pratico e excelente rendimento
- Indicado para pesca esportiva ou por quilo
- Fabricado pela renomada Badini Big Fish`,
      tip: 'A Misteriosa e a massa mais vendida! Combinacao de potencia e praticidade.',
    },
    {
      slug: 'massa-estouro',
      description: 'Massa em Po Estouro - 400g. Formula exclusiva com farinhas especiais, fecula de mandioca, queijo, mel, goiaba desidratada concentrada em po.',
      fullDescription: `Massa em Po Estouro - 400g
Formula exclusiva com farinhas especiais, fecula de mandioca, queijo, mel, goiaba desidratada concentrada em po.

Destaques do Produto:
- Uso pratico e excelente rendimento
- Indicado para pesca esportiva ou por quilo
- Fabricado pela renomada Badini Big Fish

Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante`,
      tip: 'Massa com sabor doce irresistivel para peixes redondos. Perfeita para pesca com boia.',
    },
    {
      slug: 'massa-misteriosa',
      description: 'Massa em Po Misteriosa - 400g. Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, amido de milho, leite em po, essencia concentrada de sabores diversos.',
      fullDescription: `Massa em Po Misteriosa - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, amido de milho, leite em po, essencia concentrada de sabores diversos.

Destaques do Produto:
- Uso pratico e excelente rendimento
- Indicado para pesca esportiva ou por quilo
- Fabricado pela renomada Badini Big Fish

Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante`,
      tip: 'A mais vendida! Funciona em qualquer condicao de pesca.',
    },
    {
      slug: 'massa-poderosa-branca',
      description: 'Massa em Po Poderosa Branca - 400g. Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, queijo ralado, leite em po, essencias especiais concentradas.',
      fullDescription: `Massa em Po Poderosa Branca - 400g
Formula exclusiva com farinhas especiais, coco ralado, fecula de mandioca, queijo ralado, leite em po, essencias especiais concentradas. racao concentrada.

Destaques do Produto:
- Atrativos potentes para grandes redondos
- Textura fina e aroma marcante
- Uso pratico e excelente rendimento
- Indicado para pesca esportiva ou por quilo
- Fabricado pela renomada Badini Big Fish

Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante`,
      tip: 'Misture ate atingir massa firme. Indicado para pesqueiros de pesca por quilo.',
    },
    {
      slug: 'racao-furadinha-kit',
      description: 'O Kit Racao Furadinha da Badini BigFish foi desenvolvida especialmente para pescadores que buscam maxima eficiencia na captura.',
      fullDescription: `O Kit Racao Furadinha Dupla da Badini BigFish foi desenvolvida especialmente para pescadores que buscam maxima eficiencia na captura. Com formula altamente atrativa e textura ideal para fixacao no anzol, ela libera aroma e sabor na agua, despertando o instinto alimentar dos peixes.

Seu formato furadinho facilita o encaixe perfeito no anzol ou chicote, garantindo praticidade na montagem e maior durabilidade durante a pescaria.

Produzida com ingredientes selecionados e essencias especiais, e ideal para atrair diversas especies em pesqueiros

Principais Vantagens:
- Formato furadinho que encaixa facilmente no anzol
- Alta liberacao de aroma na agua
- Grande poder de atracao para os peixes
- Excelente resistencia na agua
- Ideal para pesqueiros e pesca esportiva

Sabores Disponiveis:
- Bacon - Aroma intenso e altamente atrativo com gordura do bacon
- Sambiquira - Classico da pesca, muito eficiente
- Amburana - Essencia marcante que atrai grandes peixes utilizando da casca da amburana
- Banana com Mel - Doce e extremamente chamativo na agua
- Amburana com Mel - Combinacao poderosa e diferenciada
- Pinga com Mel - Aroma forte que desperta o apetite dos peixes

AVISO:
Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante`,
      tip: 'Encaixe a racao no anzol ou chicote. O formato furadinho garante que fique firme em arremessos fortes.',
    },
    {
      slug: 'racao-furadinha-bacon',
      description: 'Racao Furadinha Badini BigFish - Bacon. Aroma intenso e altamente atrativo com gordura do bacon.',
      fullDescription: `Racao Furadinha Badini BigFish - Bacon

Bacon - Aroma intenso e altamente atrativo com gordura do bacon

A Racao Furadinha Badini BigFish foi desenvolvida especialmente para pescadores que buscam maxima eficiencia na captura. Com formula altamente atrativa e textura ideal para fixacao no anzol.

Principais Vantagens:
- Formato furadinho que encaixa facilmente no anzol
- Excelente resistencia na agua
- Ideal para pesqueiros e pesca esportiva

AVISO:
Uso impraprio para consumo humano
Envio rapido e seguro
Validade impressa na embalagem
Produto original, direto do fabricante`,
      tip: 'A Racao Furadinha Bacon funciona em qualquer profundidade. Seu aroma se espalha e atrai peixes de longe.',
    },
  ];

  for (const update of updates) {
    try {
      await prisma.product.update({
        where: { slug: update.slug },
        data: {
          description: update.description,
          fullDescription: update.fullDescription,
          tip: update.tip,
        },
      });
      console.log(`Atualizado: ${update.slug}`);
    } catch (error) {
      console.error(`Erro ao atualizar ${update.slug}:`, error.message);
    }
  }

  console.log('Descricoes atualizadas!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
