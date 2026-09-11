// ============================================
// BADINI BIG FISH - PRODUTOS PAGE SCRIPT
// ============================================

let products = {};
let selectedOptions = {};
let quantities = {};
let galleryStates = {};
let currentFilter = 'todos';
let cart = [];

function enc(path) {
    if (!path) return '';
    return path.split('/').map(part => encodeURIComponent(part)).join('/');
}

// ============================================
// INICIALIZACAO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    loadCart();
    updateCart();
    setupEventListeners();
});

// ============================================
// CARREGAR PRODUTOS DA API
// ============================================
async function loadProducts() {
    try {
        const data = await api.getProducts();
        products = {};
        
        data.products.forEach(p => {
            // Mapear categoria para filtro
            let filter = 'todos';
            if (p.category.toLowerCase().includes('massa')) filter = 'massa';
            else if (p.category.toLowerCase().includes('kit')) filter = 'kit';
            else if (p.category.toLowerCase().includes('racao')) filter = 'racao';

            // Mapear imagens - se nao tiver ProductImage, usar array vazio
            const images = (p.images && p.images.length > 0) 
                ? p.images.map(img => img.imageUrl || img)
                : [];

            products[p.slug] = {
                id: p.id,
                name: p.name,
                category: p.category,
                filter: filter,
                price: parseFloat(p.price),
                badge: p.badge,
                folder: p.folder,
                mainImage: p.mainImage,
                images: images,
                video: p.videoUrl,
                desc: p.description,
                fullDesc: p.fullDescription || p.description,
                specs: Array.isArray(p.specs) ? p.specs : [],
                options: Array.isArray(p.options) ? p.options : [],
                optionLabel: p.optionLabel || 'Opcao',
                dica: p.tip || '',
            };

            // Inicializar estados
            selectedOptions[p.slug] = p.options && p.options.length > 0 ? p.options[0] : '';
            quantities[p.slug] = 1;
            galleryStates[p.slug] = { current: 0, showingVideo: false };
        });

        renderProducts(currentFilter);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showToast('Erro ao carregar produtos');
    }
}

// ============================================
// RENDERIZAR PRODUTOS
// ============================================
function renderProducts(filter) {
    currentFilter = filter || 'todos';
    const grid = document.getElementById('produtosGrid');
    const filtered = Object.entries(products).filter(([id, p]) => {
        const matchesFilter = currentFilter === 'todos' || p.filter === currentFilter;
        const matchesSearch = !searchQuery || 
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery) ||
            p.desc.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    grid.innerHTML = filtered.map(([id, p]) => {
        const mainImg = `${enc(p.folder)}/${encodeURIComponent(p.mainImage)}`;
        const specsHtml = p.specs.map(s => `<div><span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span></div>`).join('');
        const thumbsHtml = p.images.slice(0, 4).map((img, i) => `<div class="gallery-thumb ${i === 0 ? 'active' : ''}"><img src="${enc(p.folder)}/${encodeURIComponent(img)}" alt="" onerror="this.style.display='none';"></div>`).join('');
        const optionsHtml = p.options.length > 0 ? `<div class="config-section"><span class="config-label">${p.optionLabel}</span><div class="size-options">${p.options.map((opt, i) => `<button class="size-btn ${i === 0 ? 'active' : ''}" onclick="event.stopPropagation();selectOption('${id}','${opt}',this)">${opt}</button>`).join('')}</div></div>` : '';

        return `
            <div class="produto-card" data-product="${id}">
                <div class="produto-gallery" onclick="openModal('${id}')">
                    ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                    <div class="gallery-main">
                        <img src="${mainImg}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&#39;font-size:4rem;opacity:.3;&#39;><i class=&#34;fa-solid fa-box-open&#34; style=&#34;font-size:4rem;opacity:.3;&#34;></i></div>';">
                    </div>
                    <div class="gallery-thumbs">
                        ${thumbsHtml}
                        ${p.video ? '<div class="gallery-thumb"><div class="video-icon"><i class="fa-solid fa-play"></i></div></div>' : ''}
                    </div>
                    <div class="img-count">${p.images.length} fotos${p.video ? ' + video' : ''}</div>
                </div>
                <div class="produto-info">
                    <div class="produto-categoria">${p.category}</div>
                    <h3>${p.name}</h3>
                    <p class="desc">${p.desc}</p>
                    <div class="produto-specs">${specsHtml}</div>
                    ${optionsHtml}
                    <div class="qty-row">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="event.stopPropagation();changeProductQty('${id}',-1)">-</button>
                            <span class="qty-value" id="qty-${id}">1</span>
                            <button class="qty-btn" onclick="event.stopPropagation();changeProductQty('${id}',1)">+</button>
                        </div>
                        <div class="preco-atual">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart('${id}')">Adicionar ao Carrinho</button>
                </div>
            </div>
        `;
    }).join('');
}

function filtrarProdutos(filtro, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = filtro;
    renderProducts(filtro);
}

// ============================================
// BUSCA
// ============================================
let searchQuery = '';

function searchProducts(query) {
    searchQuery = query.toLowerCase().trim();
    renderProducts(currentFilter);
}

// ============================================
// GALERIA
// ============================================
function galleryGoTo(productId, index) {
    const p = products[productId];
    const s = galleryStates[productId];
    s.current = index;
    s.showingVideo = (p.video && index === p.images.length);
    updateModalGallery(productId);
}

function navGallery(direction) {
    const p = products[currentModalProduct];
    const s = galleryStates[currentModalProduct];
    const totalMedia = p.images.length + (p.video ? 1 : 0);

    let newIndex = s.current + direction;
    if (newIndex < 0) newIndex = totalMedia - 1;
    if (newIndex >= totalMedia) newIndex = 0;

    galleryGoTo(currentModalProduct, newIndex);
}

function updateModalGallery(productId) {
    const p = products[productId];
    const s = galleryStates[productId];
    const mainContainer = document.getElementById('modalGalleryMain');
    const thumbs = document.getElementById('modalThumbs');
    const totalMedia = p.images.length + (p.video ? 1 : 0);

    let mediaHtml = '';
    if (s.showingVideo && p.video) {
        mediaHtml = `<video src="${enc(p.folder)}/${encodeURIComponent(p.video)}" controls autoplay playsinline style="width:100%;height:100%;object-fit:contain;padding:20px;"></video>`;
    } else {
        const imgObj = p.images[s.current];
        const imgName = typeof imgObj === 'string' ? imgObj : (imgObj ? imgObj.imageUrl : p.mainImage);
        mediaHtml = `<img src="${enc(p.folder)}/${encodeURIComponent(imgName)}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:20px;" onerror="this.style.display='none';">`;
    }

    const navHtml = totalMedia > 1 ? `
        <button class="gallery-nav prev" onclick="event.stopPropagation();navGallery(-1)"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="gallery-nav next" onclick="event.stopPropagation();navGallery(1)"><i class="fa-solid fa-chevron-right"></i></button>
    ` : '';

    mainContainer.innerHTML = navHtml + mediaHtml;

    if (thumbs) {
        const all = [...p.images];
        if (p.video) all.push('video');
        thumbs.innerHTML = all.map((item, i) => {
            if (item === 'video') return `<div class="modal-gallery-thumb ${i === s.current ? 'active' : ''}" onclick="galleryGoTo('${productId}',${i})"><div class="video-icon"><i class="fa-solid fa-play"></i></div></div>`;
            const imgName = typeof item === 'string' ? item : item.imageUrl;
            return `<div class="modal-gallery-thumb ${i === s.current ? 'active' : ''}" onclick="galleryGoTo('${productId}',${i})"><img src="${enc(p.folder)}/${encodeURIComponent(imgName)}" alt="" onerror="this.style.display='none';"></div>`;
        }).join('');
    }
}

// ============================================
// MODAL
// ============================================
let currentModalProduct = null;

function openModal(productId) {
    const p = products[productId];
    currentModalProduct = productId;
    galleryStates[productId] = { current: 0, showingVideo: false };

    const mainImg = `${enc(p.folder)}/${encodeURIComponent(p.mainImage)}`;
    let thumbsHtml = p.images.map((img, i) => {
        const imgName = typeof img === 'string' ? img : img.imageUrl;
        return `<div class="modal-gallery-thumb ${i === 0 ? 'active' : ''}" onclick="galleryGoTo('${productId}',${i})"><img src="${enc(p.folder)}/${encodeURIComponent(imgName)}" alt="" onerror="this.style.display='none';"></div>`;
    }).join('');
    if (p.video) thumbsHtml += `<div class="modal-gallery-thumb" onclick="galleryGoTo('${productId}',${p.images.length})"><div class="video-icon"><i class="fa-solid fa-play"></i></div></div>`;

    const totalMedia = p.images.length + (p.video ? 1 : 0);

    document.getElementById('modalGallery').innerHTML = `
        <div class="modal-gallery-main" id="modalGalleryMain">
            ${totalMedia > 1 ? `
                <button class="gallery-nav prev" onclick="event.stopPropagation();navGallery(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="gallery-nav next" onclick="event.stopPropagation();navGallery(1)"><i class="fa-solid fa-chevron-right"></i></button>
            ` : ''}
            <img src="${mainImg}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:20px;" onerror="this.style.display='none';">
        </div>
        <div class="modal-gallery-thumbs" id="modalThumbs">${thumbsHtml}</div>
    `;

    document.getElementById('modalCategoria').textContent = p.category;
    document.getElementById('modalTitle').textContent = p.name;
    document.getElementById('modalDesc').textContent = p.fullDesc || p.desc;
    document.getElementById('modalDica').textContent = p.dica;
    document.getElementById('modalPrice').textContent = 'R$ ' + p.price.toFixed(2).replace('.', ',');
    document.getElementById('modalSpecs').innerHTML = p.specs.map(s => `<div class="modal-spec"><span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span></div>`).join('');
    document.getElementById('modalAddBtn').onclick = function() { addToCart(productId); closeModal(); };
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// CARRINHO
// ============================================
function selectOption(id, opt, btn) {
    btn.closest('.size-options').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedOptions[id] = opt;
}

function changeProductQty(id, delta) {
    quantities[id] = Math.max(1, quantities[id] + delta);
    document.getElementById('qty-' + id).textContent = quantities[id];
}

function addToCart(productId) {
    const p = products[productId];
    const qty = quantities[productId];
    const opt = selectedOptions[productId];
    const idx = cart.findIndex(item => item.id === productId && item.option === opt);
    
    if (idx >= 0) {
        cart[idx].qty += qty;
    } else {
        cart.push({
            id: productId,
            name: p.name,
            price: p.price,
            option: opt,
            qty: qty,
            folder: p.folder,
            mainImage: p.mainImage
        });
    }
    
    saveCart();
    updateCart();
    showToast(p.name + ' adicionado!');
    
    // Reset quantidade
    quantities[productId] = 1;
    document.getElementById('qty-' + productId).textContent = '1';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCart();
}

function clearCart() {
    if (cart.length === 0) return;
    if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;
    cart = [];
    saveCart();
    updateCart();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCart();
}

function saveCart() {
    localStorage.setItem('bbf_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('bbf_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function updateCart() {
    const el = document.getElementById('cartItems');
    const count = document.getElementById('cartCount');
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const price = cart.reduce((s, i) => s + i.price * i.qty, 0);
    
    count.textContent = total;
    count.classList.toggle('empty', total === 0);
    document.getElementById('cartTotal').textContent = 'R$ ' + price.toFixed(2).replace('.', ',');

    if (cart.length === 0) {
        el.innerHTML = '<div class="cart-empty"><div class="icon"><i class="fa-solid fa-box-open" style="font-size:4rem;opacity:.3;"></i></div><p>Seu carrinho esta vazio.<br>Adicione uns produtos ai!</p></div>';
        return;
    }
    
    el.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <div class="cart-item-img"><img src="${enc(item.folder)}/${encodeURIComponent(item.mainImage)}" alt="" onerror="this.style.display='none';"></div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="meta">${item.option ? item.option + ' | ' : ''}</div>
                <div class="price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="changeQty(${i}, -1)">-</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${i})"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join('');
}

// ============================================
// CHECKOUT
// ============================================
async function irParaCheckout() {
    if (cart.length === 0) {
        showToast('Adicione itens ao carrinho!');
        return;
    }
    
    // Se usuario nao esta logado, abrir modal de login
    if (!api.isAuthenticated()) {
        showToast('Faça login para continuar');
        openAuth('login');
        return;
    }
    
    // Salvar carrinho e redirecionar para checkout
    localStorage.setItem('bbf_checkout_cart', JSON.stringify(cart));
    window.location.href = 'index.html#checkout';
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Carrinho
    document.getElementById('cartBtn').addEventListener('click', () => {
        document.getElementById('cartOverlay').classList.add('active');
        document.getElementById('cartSidebar').classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Menu mobile
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });

    // Fechar com ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            closeCart();
        }
    });
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// TOAST
// ============================================
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
