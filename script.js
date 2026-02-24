/* FLIPSHOP COMPLETE ENGINE - 2026 STABLE VERSION
   Features: Admin Panel Sync, Realtime Firebase, LocalStorage Bridge
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getDatabase, ref, push, set, update, remove, onValue 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 1. FIREBASE CONFIGURATION */
const firebaseConfig = {
    apiKey: "AIzaSyBfA-mFODccLz13nLpFQFI5Q2qBNIS2_KI",
    authDomain: "flipkart-clone-ab903.firebaseapp.com",
    databaseURL: "https://flipkart-clone-ab903-default-rtdb.firebaseio.com",
    projectId: "flipkart-clone-ab903",
    storageBucket: "flipkart-clone-ab903.firebasestorage.app",
    messagingSenderId: "733319152647",
    appId: "1:733319152647:web:cb5943fc21d8676bad16a2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* 2. GLOBAL BRIDGE - Admin Panel के लिए जरूरी */
window.db = db;
window.ref = ref;
window.push = push;
window.set = set;
window.update = update;
window.remove = remove;

/* 3. LOCAL STORAGE ENGINE */
window.getLS = function(key, def = []) {
    try {
        let data = localStorage.getItem(key);
        return data ? JSON.parse(data) : def;
    } catch (e) { return def; }
};

window.setLS = function(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
};

/* 4. CORE UTILS */
window.imgError = function(img) {
    img.src = "https://via.placeholder.com/200?text=Image+Not+Found";
};

window.calcDiscount = function(mrp, price) {
    let m = parseFloat(mrp);
    let p = parseFloat(price);
    if (!m || m <= p) return 0;
    return Math.round(((m - p) / m) * 100);
};

function notifyUpdate() {
    document.dispatchEvent(new Event("dataUpdated"));
}

/* 5. ADMIN PANEL FUNCTIONS (Adding/Deleting/Editing) */

// Universal Add Function (Products, Categories, Sliders आदि के लिए)
window.dbAdd = function(path, data) {
    return push(ref(db, path), data)
        .then(() => { alert("Success! Data Added."); return true; })
        .catch(err => { alert("Error: " + err.message); return false; });
};

// Universal Delete Function
window.dbDelete = function(path, id) {
    if(confirm("Are you sure you want to delete this?")) {
        return remove(ref(db, `${path}/${id}`))
            .then(() => { alert("Deleted successfully!"); })
            .catch(err => { alert("Error deleting: " + err.message); });
    }
};

// Universal Update Function
window.dbUpdate = function(path, id, data) {
    return update(ref(db, `${path}/${id}`), data)
        .then(() => { alert("Updated successfully!"); })
        .catch(err => { alert("Update failed: " + err.message); });
};

/* 6. REALTIME SYNC ENGINE (Firebase to LocalStorage) */
const syncNode = (nodeName) => {
    onValue(ref(db, nodeName), (snap) => {
        let dataArr = [];
        if (snap.exists()) {
            snap.forEach((child) => {
                dataArr.push({ id: child.key, ...child.val() });
            });
        }
        setLS(nodeName, dataArr);
        notifyUpdate();
    }, (error) => {
        console.error(`Sync Error on ${nodeName}:`, error);
    });
};

// All important nodes
syncNode("products");
syncNode("categories");
syncNode("sliderImages");
syncNode("orders");

// Special Case: Payment Settings/Links
onValue(ref(db, "paymentLinks"), (snap) => {
    setLS("paymentLinks", snap.val() || {});
    notifyUpdate();
});

/* 7. CART SYSTEM */
window.addToCart = function(productId, qty = 1) {
    let cart = getLS("cart", []);
    let products = getLS("products", []);
    let prod = products.find(p => p.id === productId);

    if(!prod) { alert("Product not found!"); return; }

    let existing = cart.find(c => c.productId === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ productId, qty, details: prod });
    }

    setLS("cart", cart);
    alert("🛒 Added to Cart!");
    notifyUpdate();
};

window.removeFromCart = function(productId) {
    let cart = getLS("cart", []);
    cart = cart.filter(c => c.productId !== productId);
    setLS("cart", cart);
    notifyUpdate();
};

window.clearCart = function() {
    setLS("cart", []);
    notifyUpdate();
};

window.getCartTotals = function() {
    let cart = getLS("cart", []);
    let totalMrp = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        let mrp = parseFloat(item.details?.mrp || item.details?.price || 0);
        let price = parseFloat(item.details?.price || 0);
        totalMrp += mrp * item.qty;
        totalPrice += price * item.qty;
    });

    return {
        count: cart.length,
        totalMrp,
        totalPrice,
        discount: totalMrp - totalPrice
    };
};

/* 8. ORDER PLACEMENT */
window.placeOrder = function(userDetails) {
    let cart = getLS("cart", []);
    if(cart.length === 0) { alert("Cart is empty!"); return; }

    let orderData = {
        items: cart,
        user: userDetails,
        status: "Pending",
        total: window.getCartTotals().totalPrice,
        date: new Date().toISOString()
    };

    return push(ref(db, "orders"), orderData).then(() => {
        window.clearCart();
        return true;
    });
};

/* 9. SEARCH & FILTER */
window.searchProducts = function(query) {
    let products = getLS("products", []);
    return products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
};

/* 10. SYSTEM INITIALIZATION */
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("cart")) setLS("cart", []);
    console.log("🚀 FlipShop Engine Loaded Successfully");
});
