/* FLIPSHOP - ALL-IN-ONE ENGINE 
   Supports: GitHub Pages + Firebase Realtime Database
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 1. FIREBASE CONFIG */
const firebaseConfig = {
    apiKey: "AIzaSyBfA-mFODccLz13nLpFQFI5Q2qBNIS2_KI",
    authDomain: "flipkart-clone-ab903.firebaseapp.com",
    databaseURL: "https://flipkart-clone-ab903-default-rtdb.firebaseio.com",
    projectId: "flipkart-clone-ab903",
    storageBucket: "flipkart-clone-ab903.firebasestorage.app",
    messagingSenderId: "733319152647",
    appId: "1:733319152647:web:cb5943fc21d8676bad16a2"
};

/* 2. INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* 3. EXPOSE TO WINDOW (Important for Admin & HTML) */
// यह एडमिन पैनल को डेटा सेव करने की अनुमति देता है
window.db = db;
window.ref = ref;
window.push = push;
window.set = set;
window.update = update;
window.remove = remove;

/* 4. LOCAL STORAGE HELPERS */
window.getLS = (key, def = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : def;
    } catch (e) { return def; }
};

window.setLS = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

/* 5. UTILS */
window.imgError = (img) => {
    img.src = "https://via.placeholder.com/150?text=No+Image";
};

window.calcDiscount = (mrp, price) => {
    const m = parseFloat(mrp);
    const p = parseFloat(price);
    if (!m || m <= p) return 0;
    return Math.round(((m - p) / m) * 100);
};

/* 6. REALTIME SYNC ENGINE */
function notifyUpdate() {
    // यह इवेंट index.html को रेंडर करने का सिग्नल भेजता है
    document.dispatchEvent(new Event("dataUpdated"));
}

const syncNode = (nodeName) => {
    onValue(ref(db, nodeName), (snap) => {
        const arr = [];
        if (snap.exists()) {
            snap.forEach(child => {
                arr.push({ id: child.key, ...child.val() });
            });
        }
        setLS(nodeName, arr);
        notifyUpdate();
    }, (err) => console.error(`Sync Error (${nodeName}):`, err));
};

// Syncing Lists
syncNode("products");
syncNode("categories");
syncNode("sliderImages");
syncNode("orders");

// Syncing Single Object (Payment Links)
onValue(ref(db, "paymentLinks"), (snap) => {
    setLS("paymentLinks", snap.exists() ? snap.val() : {});
    notifyUpdate();
});

/* 7. CART SYSTEM */
window.addToCart = (productId, qty = 1) => {
    let cart = getLS("cart", []);
    const idx = cart.findIndex(c => c.productId === productId);
    
    if (idx > -1) {
        cart[idx].qty += qty;
    } else {
        cart.push({ productId, qty });
    }
    
    setLS("cart", cart);
    alert("🛒 Product added to cart!");
    notifyUpdate();
};

/* 8. STARTUP */
if (!localStorage.getItem("cart")) setLS("cart", []);
console.log("🔥 FlipShop System Ready & Firebase Connected!");
