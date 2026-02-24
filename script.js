// LocalStorage Helpers
const getLS = (key, def = null) => JSON.parse(localStorage.getItem(key)) || def;
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Initialize dummy data if empty
function initData() {
  if (!getLS('products')) {
    setLS('products', [
      { id: 'p1', title: 'Poco X5 Pro 5G', price: 22999, mrp: 28999, category: 'Mobiles', stock: 10, mainImg: 'https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/4/4/2/x5-pro-5g-mzb0e4lin-poco-original-imagp4m6ztmfxgmz.jpeg', gallery: [], desc: [] },
      { id: 'p2', title: 'Nike Running Shoes', price: 2499, mrp: 4999, category: 'Fashion', stock: 5, mainImg: 'https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/4/x/q/-original-imaggcawmpyv6b3e.jpeg', gallery: [], desc: [] }
    ]);
  }
  if (!getLS('categories')) {
    setLS('categories', [
      { id: 'c1', name: 'Mobiles', img: 'https://rukminim2.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png' },
      { id: 'c2', name: 'Fashion', img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/0d75b34f7d8fbcb3.png' },
      { id: 'c3', name: 'Electronics', img: 'https://rukminim2.flixcart.com/flap/128/128/image/69c6589653afdb9a.png' },
      { id: 'c4', name: 'Home', img: 'https://rukminim2.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg' }
    ]);
  }
  if (!getLS('sliderImages')) {
    setLS('sliderImages', [
      { id: 's1', url: 'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/1e1e91307ed8479e.jpg' },
      { id: 's2', url: 'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/22421cce8a36ed71.jpg' }
    ]);
  }
  if (!getLS('cart')) setLS('cart', []);
  if (!getLS('orders')) setLS('orders', []);
  if (!getLS('paymentLinks')) setLS('paymentLinks', { gpay: '', phonepe: '', paytm: '' });
}

// Utilities
function calcDiscount(mrp, price) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function imgError(image) {
  image.onerror = "";
  image.src = "https://via.placeholder.com/150?text=No+Image";
  return true;
}

// Cart Logic
function addToCart(productId, qty = 1, bypassToast = false) {
  let cart = getLS('cart');
  let products = getLS('products');
  let product = products.find(p => p.id === productId);
  if (!product) return;

  let existing = cart.find(c => c.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty });
  }
  setLS('cart', cart);
  if(!bypassToast) showToast('Added to Cart');
}

function getCartTotals() {
  let cart = getLS('cart');
  let products = getLS('products');
  let totalMrp = 0;
  let totalPrice = 0;
  
  cart.forEach(item => {
    let p = products.find(x => x.id === item.productId);
    if(p) {
      totalMrp += (Number(p.mrp) || Number(p.price)) * item.qty;
      totalPrice += Number(p.price) * item.qty;
    }
  });
  return { items: cart.length, totalMrp, totalPrice, discount: totalMrp - totalPrice };
}

// Global Init
initData();
