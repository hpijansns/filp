/* FIREBASE IMPORT */
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

/* FIREBASE CONFIG */
const firebaseConfig = {
    apiKey: "AIzaSyBfA-mFODccLz13nLpFQFI5Q2qBNIS2_KI",
    authDomain: "flipkart-clone-ab903.firebaseapp.com",
    databaseURL: "https://flipkart-clone-ab903-default-rtdb.firebaseio.com",
    projectId: "flipkart-clone-ab903",
    storageBucket: "flipkart-clone-ab903.firebasestorage.app",
    messagingSenderId: "733319152647",
    appId: "1:733319152647:web:cb5943fc21d8676bad16a2"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* EXPORTS FOR ADMIN PANEL (Making them Global) */
// इसे window पर डालने से admin.html बिना error के इन्हें use कर पाएगा
window.fbDB = db;
window.fbRef = ref;
window.fbPush = push;
window.fbSet = set;
window.fbUpdate = update;
window.fbRemove = remove;

/* ----------------------- */
/* LOCAL STORAGE HELPERS */
/* ----------------------- */
window.getLS = function(key, def = null) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : def;
    } catch (e) {
        return def;
    }
};

window.setLS = function(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
};

/* ----------------------- */
/* UTILS */
/* ----------------------- */
window.imgError = function(img) {
    img.src = "https://via.placeholder.com/150?text=No+Image";
};

window.calcDiscount = function(mrp, price) {
    mrp = Number(mrp);
    price = Number(price);
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
};

/* ----------------------- */
/* CART SYSTEM */
/* ----------------------- */
window.addToCart = function(productId, qty = 1) {
    let cart = getLS("cart", []);
    let existing = cart.find(c => c.productId === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ productId, qty });
    }
    setLS("cart", cart);
    alert("Product added to cart!");
    document.dispatchEvent(new Event("dataUpdated")); // Update UI count
};

/* ----------------------- */
/* FIREBASE REALTIME SYNC */
/* ----------------------- */

function notifyUpdate() {
    document.dispatchEvent(new Event("dataUpdated"));
}

// Helper to sync Firebase node to LocalStorage
const syncNode = (nodeName) => {
    onValue(ref(db, nodeName), (snap) => {
        let arr = [];
        if (snap.exists()) {
            snap.forEach((child) => {
                arr.push({ id: child.key, ...child.val() });
            });
        }
        setLS(nodeName, arr);
        notifyUpdate();
    }, (error) => {
        console.error(`Error syncing ${nodeName}:`, error);
    });
};

// Start Syncing
syncNode("products");
syncNode("categories");
syncNode("sliderImages");
syncNode("orders");

// Special case for Payment Links (Not an array)
onValue(ref(db, "paymentLinks"), (snap) => {
    if (snap.exists()) {
        setLS("paymentLinks", snap.val());
        notifyUpdate();
    }
});

/* ----------------------- */
/* INITIALIZE */
/* ----------------------- */
if (!getLS("cart")) setLS("cart", []);
console.log("Firebase Sync Initialized 🚀");
