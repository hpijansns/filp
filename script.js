/* FIREBASE SETUP */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfA-mFODccLz13nLpFQFI5Q2qBNIS2_KI",
  authDomain: "flipkart-clone-ab903.firebaseapp.com",
  databaseURL: "https://flipkart-clone-ab903-default-rtdb.firebaseio.com",
  projectId: "flipkart-clone-ab903",
  storageBucket: "flipkart-clone-ab903.firebasestorage.app",
  messagingSenderId: "733319152647",
  appId: "1:733319152647:web:cb5943fc21d8676bad16a2",
  measurementId: "G-6685CFT1HB"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


/* LOCAL STORAGE HELPERS */

const getLS = (key, def = null) => JSON.parse(localStorage.getItem(key)) || def;
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));


/* INITIAL DATA */

function initData() {

if (!getLS('cart')) setLS('cart', []);

}


/* REALTIME PRODUCTS */

function loadProductsRealtime(){

onValue(ref(db,"products"), snap=>{

let data = snap.val();

if(!data) return;

let arr = [];

Object.keys(data).forEach(id=>{
arr.push({id,...data[id]});
});

setLS("products",arr);

});

}


/* REALTIME CATEGORIES */

function loadCategoriesRealtime(){

onValue(ref(db,"categories"), snap=>{

let data = snap.val();
if(!data) return;

let arr=[];

Object.keys(data).forEach(id=>{
arr.push({id,...data[id]});
});

setLS("categories",arr);

});

}


/* REALTIME SLIDERS */

function loadSlidersRealtime(){

onValue(ref(db,"sliderImages"), snap=>{

let data=snap.val();
if(!data) return;

let arr=[];

Object.keys(data).forEach(id=>{
arr.push({id,...data[id]});
});

setLS("sliderImages",arr);

});

}


/* REALTIME PAYMENT LINKS */

function loadPaymentsRealtime(){

onValue(ref(db,"paymentLinks"), snap=>{

let data=snap.val();

if(data){
setLS("paymentLinks",data);
}

});

}


/* UTILITIES */

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


/* CART LOGIC */

function addToCart(productId, qty = 1, bypassToast = false) {

let cart = getLS('cart', []);

let products = getLS('products', []);

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

let cart = getLS('cart', []);

let products = getLS('products', []);

let totalMrp = 0;

let totalPrice = 0;

cart.forEach(item => {

let p = products.find(x => x.id === item.productId);

if(p) {

totalMrp += (Number(p.mrp) || Number(p.price)) * item.qty;

totalPrice += Number(p.price) * item.qty;

}

});

return {

items: cart.length,

totalMrp,

totalPrice,

discount: totalMrp - totalPrice

};

}


/* ORDER PLACE */

function placeOrder(orderData){

push(ref(db,"orders"), orderData);

showToast("Order Placed");

}


/* GLOBAL INIT */

initData();

loadProductsRealtime();
loadCategoriesRealtime();
loadSlidersRealtime();
loadPaymentsRealtime();
