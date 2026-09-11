// ============================================
// BADINI BIG FISH - PRODUTO DETALHE
// ============================================

let product = null;
let cart = [];
let galleryIndex = 0;
let quantity = 1;
let selectedOption = '';

function enc(path) {
    if (!path) return '';
    return path.split('/').map(part => encodeURIComponent(part)).join('/');
}

// Ler slug da URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// ============================================
// INICIALIZACAO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    loadCart();
    updateCartUI();

    if (!slug) {
        document.getElementById('produtoDetalhe').innerHTML = `
            <div class="loading" style="grid-column:1/-1;">
                <p>Produto nao encontrado. <a href="produtos.html" style="color:var(--dourado);">Voltar aos produtos</a></p>
            </div>
        `;
        return;
    }

    try {
        const result = await api.getProduct(slug);
        product = result.product || result;
        renderProduct();
        loadRelacionados();
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        document.getElementById('produtoDetalhe').innerHTML = `
            <div class="loading" style="grid-column:1/-1;">
                <p>Erro ao carregar produto. <a href="produtos.html" style="color:var(--dourado);">Voltar aos produtos</a></p>
            </div>
        `;
    }
});

// ============================================
// RENDERIZAR PRODUTO
// ============================================
function renderProduct() {
    if (!product) return;

    document.title = `${product.name} | Badini Big Fish`;
    document.getElementById('breadcrumbName').textContent = product.name;

    const allMedia = [];
    if (product.images) {
        product.images.forEach(img => {
            const imgName = img.imageUrl || img;
            const url = product.folder ? `${enc(product.folder)}/${encodeURIComponent(imgName)}` : imgName;
            allMedia.push({ type: 'image', url: url });
        });
    }
    if (product.videoUrl) {
        const videoUrl = product.folder ? `${enc(product.folder)}/${encodeURIComponent(product.videoUrl)}` : product.videoUrl;
        allMedia.push({ type: 'video', url: videoUrl });
    }

    if (allMedia.length === 0 && product.imageUrl) {
        allMedia.push({ type: 'image', url: product.imageUrl });
    }

    const options = product.options || [];
    if (options.length > 0 && !selectedOption) {
        selectedOption = options[0];
    }

    const specsHtml = (product.specs || []).map(s => `
        <div class="detalhe-spec">
            <span class="label">${s.label}</span>
            <span class="value">${s.value}</span>
        </div>
    `).join('');

    const optionsHtml = options.length > 0 ? `
        <div class="detalhe-options">
            <label>${product.optionLabel || 'Opcao'}:</label>
            <div class="option-buttons">
                ${options.map(opt => `
                    <button class="option-btn ${opt === selectedOption ? 'active' : ''}" onclick="selectOption('${opt.replace(/'/g, "\\'")}')">${opt}</button>
                `).join('')}
            </div>
        </div>
    ` : '';

    const mainMedia = allMedia[0];
    const mainContent = mainMedia.type === 'video'
        ? `<video src="${mainMedia.url}" controls autoplay muted loop></video>`
        : `<img src="${mainMedia.url}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&#39;font-size:5rem;opacity:.3;&#39;><i class=&#34;fa-solid fa-box-open&#34; style=&#34;font-size:5rem;opacity:.3;&#34;></i></div>';">`;

    document.getElementById('produtoDetalhe').innerHTML = `
        <div class="detalhe-gallery">
            <div class="detalhe-gallery-main" id="galleryMain">
                ${mainContent}
                ${allMedia.length > 1 ? `
                    <button class="gallery-nav prev" onclick="galleryPrev()"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="gallery-nav next" onclick="galleryNext()"><i class="fa-solid fa-chevron-right"></i></button>
                ` : ''}
            </div>
            <div class="detalhe-gallery-thumbs" id="galleryThumbs">
                ${allMedia.map((m, i) => `
                    <div class="detalhe-thumb ${i === 0 ? 'active' : ''}" onclick="galleryGoTo(${i})">
                        ${m.type === 'video'
                            ? `<div class="video-icon"><i class="fa-solid fa-play"></i></div>`
                            : `<img src="${m.url}" alt="" onerror="this.style.display='none';">`
                        }
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detalhe-info">
            <div class="detalhe-categoria">${product.category}</div>
            <h1>${product.name}</h1>
            <div class="detalhe-preco">R$ ${Number(product.price).toFixed(2).replace('.', ',')}</div>
            <div class="detalhe-desc">${product.fullDescription || product.description}</div>

            <div class="detalhe-specs">${specsHtml}</div>

            ${optionsHtml}

            <div class="detalhe-actions">
                <div class="qty-control">
                    <button class="qty-btn" onclick="changeProductQty(-1)">-</button>
                    <div class="qty-value" id="qtyValue">1</div>
                    <button class="qty-btn" onclick="changeProductQty(1)">+</button>
                </div>
                <button class="add-btn" onclick="addToCart()">Adicionar ao Carrinho</button>
            </div>

            ${product.tip ? `
                <div class="detalhe-dica">
                    <h4>Dica de Uso</h4>
                    <p>${product.tip}</p>
                </div>
            ` : ''}
        </div>
    `;

    // Salvar midia para uso global
    window._allMedia = allMedia;
}

// ============================================
// GALERIA
// ============================================
function galleryGoTo(index) {
    const media = window._allMedia || [];
    if (index < 0 || index >= media.length) return;
    galleryIndex = index;

    const main = document.getElementById('galleryMain');
    const m = media[index];
    const navHtml = media.length > 1 ? `
        <button class="gallery-nav prev" onclick="galleryPrev()"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="gallery-nav next" onclick="galleryNext()"><i class="fa-solid fa-chevron-right"></i></button>
    ` : '';

    if (m.type === 'video') {
        main.innerHTML = `<video src="${m.url}" controls autoplay muted loop></video>${navHtml}`;
    } else {
        main.innerHTML = `<img src="${m.url}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&#39;font-size:5rem;opacity:.3;&#39;><i class=&#34;fa-solid fa-box-open&#34; style=&#34;font-size:5rem;opacity:.3;&#34;></i></div>';">${navHtml}`;
    }

    document.querySelectorAll('.detalhe-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
}

function galleryNext() {
    const media = window._allMedia || [];
    galleryGoTo((galleryIndex + 1) % media.length);
}

function galleryPrev() {
    const media = window._allMedia || [];
    galleryGoTo((galleryIndex - 1 + media.length) % media.length);
}

// Navegacao por teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') galleryNext();
    if (e.key === 'ArrowLeft') galleryPrev();
});

// ============================================
// OPCOES E QUANTIDADE
// ============================================
function selectOption(option) {
    selectedOption = option;
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === option);
    });
}

function changeProductQty(delta) {
    quantity = Math.max(1, quantity + delta);
    document.getElementById('qtyValue').textContent = quantity;
}

// ============================================
// CARRINHO
// ============================================
function addToCart() {
    if (!product) return;

    const item = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        option: selectedOption,
        qty: quantity,
        folder: product.folder,
        mainImage: product.mainImage,
        imageUrl: product.imageUrl
    };

    // Verificar se ja existe item igual
    const existingIndex = cart.findIndex(c => c.id === item.id && c.option === item.option);
    if (existingIndex >= 0) {
        cart[existingIndex].qty += quantity;
    } else {
        cart.push(item);
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} adicionado ao carrinho!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function clearCart() {
    if (cart.length === 0) return;
    if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;
    cart = [];
    saveCart();
    updateCartUI();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    document.getElementById('cartCount').textContent = totalItems;
    document.getElementById('cartCount').classList.toggle('empty', totalItems === 0);
    document.getElementById('cartTotal').textContent = 'R$ ' + totalPrice.toFixed(2).replace('.', ',');

    const container = document.getElementById('cartItems');
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="icon"><i class="fa-solid fa-fish"></i></div>
                <p>Seu carrinho esta vazio.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const img = item.imageUrl || (item.folder ? `${enc(item.folder)}/${encodeURIComponent(item.mainImage)}` : '');
        return `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${img}" alt="" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=&#34;fa-solid fa-box-open&#34; style=&#34;font-size:5rem;opacity:.3;&#34;></i>';">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="meta">${item.option ? item.option + ' | ' : ''}</div>
                    <div class="price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    }).join('');
}

function toggleCart() {
    document.getElementById('cartOverlay').classList.toggle('active');
    document.getElementById('cartSidebar').classList.toggle('active');
}

function loadCart() {
    const saved = localStorage.getItem('bbf_cart');
    if (saved) cart = JSON.parse(saved);
}

function saveCart() {
    localStorage.setItem('bbf_cart', JSON.stringify(cart));
}

function goCheckout() {
    toggleCart();
    window.location.href = 'index.html#checkout';
}

// ============================================
// PRODUTOS RELACIONADOS
// ============================================
async function loadRelacionados() {
    if (!product) return;

    try {
        const result = await api.getProducts({ category: product.category, limit: 4 });
        const products = (result.products || []).filter(p => p.id !== product.id).slice(0, 3);

        if (products.length === 0) return;

        document.getElementById('relacionadosSection').style.display = 'block';
        document.getElementById('relacionadosGrid').innerHTML = products.map(p => {
            const img = p.imageUrl || (p.folder ? `${enc(p.folder)}/${encodeURIComponent(p.mainImage)}` : '');
            return `
                <a href="produto.html?slug=${p.slug}" class="produto-card" style="text-decoration:none;">
                    <div class="produto-gallery">
                        <div class="gallery-main">
                            <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&#39;font-size:4rem;opacity:.3;&#39;><i class=&#34;fa-solid fa-box-open&#34; style=&#34;font-size:5rem;opacity:.3;&#34;></i></div>';">
                        </div>
                    </div>
                    <div class="produto-info">
                        <div class="produto-categoria">${p.category}</div>
                        <h3>${p.name}</h3>
                        <div class="preco-atual">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar relacionados:', error);
    }
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
