import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// --- GLOBAL BRIDGE (For Admin Panel) ---
window.db = db;
window.ref = ref;
window.push = push;
window.set = set;
window.update = update;
window.remove = remove;

// --- HELPERS ---
window.getLS = (k, d = []) => JSON.parse(localStorage.getItem(k)) || d;
window.setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

window.calcDiscount = (m, p) => {
    let mrp = parseFloat(m), prc = parseFloat(p);
    return (mrp > prc) ? Math.round(((mrp - prc) / mrp) * 100) : 0;
};

// --- SYNC ENGINE ---
const sync = (path) => {
    onValue(ref(db, path), (s) => {
        let arr = [];
        s.forEach(c => { arr.push({ id: c.key, ...c.val() }); });
        setLS(path, arr);
        document.dispatchEvent(new Event("dataUpdated"));
    });
};

["products", "categories", "sliderImages", "orders"].forEach(sync);

// --- ADMIN FUNCTIONS (Universal) ---
window.addData = (path, data) => push(ref(db, path), data);
window.deleteData = (path, id) => confirm("Delete this?") && remove(ref(db, `${path}/${id}`));
window.updateData = (path, id, data) => update(ref(db, `${path}/${id}`), data);

console.log("System Synced 🚀");
