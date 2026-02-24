// --- INITIAL DATA SEEDING ---
const db = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data))
};

// --- ROUTING ENGINE ---
function navigateTo(page, id = null) {
    const container = document.getElementById('app-container');
    window.scrollTo(0,0);
    
    switch(page) {
        case 'home': renderHome(container); break;
        case 'product': renderProduct(container, id); break;
        case 'cart': renderCart(container); break;
        case 'admin': renderAdmin(container); break;
        case 'checkout': renderCheckout(container); break;
        default: renderHome(container);
    }
}

// --- VIEW RENDERS ---

function renderHome(container) {
    const categories = db.get('categories');
    const products = db.get('products');
    const sliders = db.get('sliders');

    container.innerHTML = `
        <div class="category-strip">
            ${categories.map(c => `
                <div class="cat-item">
                    <img src="${c.img}" alt="${c.name}">
                    <p>${c.name}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="slider" id="homeSlider">
            ${sliders.length ? `<img src="${sliders[0]}" id="slideImg">` : '<div class="p-20">Add sliders in Admin</div>'}
        </div>

        <div class="product-grid">
            ${products.map(p => {
                const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                return `
                <div class="product-card" onclick="navigateTo('product', '${p.id}')">
                    <img src="${p.img}" alt="${p.title}">
                    <div class="title">${p.title.substring(0,25)}...</div>
                    <div>
                        <span class="price">₹${p.price}</span>
                        <span class="mrp">₹${p.mrp}</span>
                        <span class="discount">${disc}% off</span>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    startSlider();
}

function renderProduct(container, id) {
    const product = db.get('products').find(p => p.id == id);
    const disc = Math.round(((product.mrp - product.price) / product.mrp) * 100);

    container.innerHTML = `
        <div class="product-page" style="background:white; padding:15px;">
            <img src="${product.img}" style="width:100%; height:300px; object-fit:contain;">
            <h2>${product.title}</h2>
            <div class="price-row">
                <span class="price" style="font-size:24px">₹${product.price}</span>
                <span class="mrp">₹${product.mrp}</span>
                <span class="discount">${disc}% off</span>
            </div>
            <p>${product.desc || 'No description available.'}</p>
        </div>
        <div class="sticky-bottom">
            <button style="background:white;" onclick="addToCart('${product.id}')">ADD TO CART</button>
            <button style="background:var(--yellow); color:black;" onclick="navigateTo('checkout')">BUY NOW</button>
        </div>
    `;
}

// --- CART LOGIC ---
function addToCart(id) {
    let cart = db.get('cart');
    const products = db.get('products');
    const item = products.find(p => p.id == id);
    
    const existing = cart.find(c => c.id == id);
    if(existing) existing.qty++;
    else cart.push({...item, qty: 1});
    
    db.set('cart', cart);
    updateCartCount();
    showToast();
}

function updateCartCount() {
    const cart = db.get('cart');
    document.getElementById('cartCount').innerText = cart.reduce((acc, curr) => acc + curr.qty, 0);
}

// --- ADMIN LOGIC ---
function renderAdmin(container) {
    container.innerHTML = `
        <div class="admin-section">
            <h3>Add Product</h3>
            <div class="admin-form">
                <input type="text" id="pTitle" placeholder="Product Title">
                <input type="number" id="pPrice" placeholder="Selling Price">
                <input type="number" id="pMrp" placeholder="MRP">
                <input type="text" id="pImg" placeholder="Image URL">
                <button class="btn-primary" onclick="saveProduct()">Save Product</button>
            </div>
        </div>

        <div class="admin-section">
            <h3>Add Category</h3>
            <div class="admin-form">
                <input type="text" id="cName" placeholder="Category Name">
                <input type="text" id="cImg" placeholder="Category Icon URL">
                <button class="btn-primary" onclick="saveCategory()">Add Category</button>
            </div>
        </div>
        
        <div class="admin-section">
            <h3>Add Slider</h3>
            <input type="text" id="sImg" placeholder="Slider Image URL">
            <button class="btn-primary" onclick="saveSlider()">Add Slider</button>
        </div>
    `;
}

function saveProduct() {
    const products = db.get('products');
    const newP = {
        id: Date.now(),
        title: document.getElementById('pTitle').value,
        price: document.getElementById('pPrice').value,
        mrp: document.getElementById('pMrp').value,
        img: document.getElementById('pImg').value
    };
    products.push(newP);
    db.set('products', products);
    alert('Product Added!');
}

function saveCategory() {
    const cats = db.get('categories');
    cats.push({
        name: document.getElementById('cName').value,
        img: document.getElementById('cImg').value
    });
    db.set('categories', cats);
    alert('Category Added!');
}

function saveSlider() {
    const sliders = db.get('sliders');
    sliders.push(document.getElementById('sImg').value);
    db.set('sliders', sliders);
    alert('Slider Added!');
}

// --- HELPERS ---
function showToast() {
    const t = document.getElementById('toast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

function startSlider() {
    const slides = db.get('sliders');
    if(slides.length < 2) return;
    let i = 0;
    setInterval(() => {
        i = (i + 1) % slides.length;
        const el = document.getElementById('slideImg');
        if(el) el.src = slides[i];
    }, 3000);
}

// Initialize
window.onload = () => {
    updateCartCount();
    navigateTo('home');
};
