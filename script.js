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


/* INITIALIZE */

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


/* EXPORTS (Admin panel use karega) */

export { db, ref, push, set, update, remove, onValue };


/* ----------------------------- */
/* LOCAL STORAGE HELPERS */
/* ----------------------------- */

window.getLS = function(key, def = null){

try{

return JSON.parse(localStorage.getItem(key)) || def

}catch{

return def

}

}

window.setLS = function(key,val){

localStorage.setItem(key,JSON.stringify(val))

}


/* ----------------------------- */
/* IMAGE FALLBACK */
/* ----------------------------- */

window.imgError = function(img){

img.src = "https://via.placeholder.com/150?text=No+Image"

}


/* ----------------------------- */
/* DISCOUNT */
/* ----------------------------- */

window.calcDiscount = function(mrp,price){

if(!mrp || mrp <= price) return 0

return Math.round(((mrp - price) / mrp) * 100)

}


/* ----------------------------- */
/* CART */
/* ----------------------------- */

window.addToCart = function(productId, qty = 1){

let cart = getLS("cart", [])

let existing = cart.find(c => c.productId === productId)

if(existing){

existing.qty += qty

}else{

cart.push({productId, qty})

}

setLS("cart", cart)

}


window.getCartTotals = function(){

let cart = getLS("cart",[])
let products = getLS("products",[])

let totalMrp = 0
let totalPrice = 0

cart.forEach(item=>{

let p = products.find(x=>x.id === item.productId)

if(p){

totalMrp += (Number(p.mrp) || Number(p.price)) * item.qty
totalPrice += Number(p.price) * item.qty

}

})

return {
items: cart.length,
totalMrp,
totalPrice,
discount: totalMrp - totalPrice
}

}


/* ----------------------------- */
/* REALTIME FIREBASE SYNC */
/* ----------------------------- */


/* PRODUCTS */

onValue(ref(db,"products"), snap=>{

let arr=[]

snap.forEach(item=>{

arr.push({
id:item.key,
...item.val()
})

})

setLS("products",arr)

})


/* CATEGORIES */

onValue(ref(db,"categories"), snap=>{

let arr=[]

snap.forEach(item=>{

arr.push({
id:item.key,
...item.val()
})

})

setLS("categories",arr)

})


/* SLIDERS */

onValue(ref(db,"sliderImages"), snap=>{

let arr=[]

snap.forEach(item=>{

arr.push({
id:item.key,
...item.val()
})

})

setLS("sliderImages",arr)

})


/* PAYMENTS */

onValue(ref(db,"paymentLinks"), snap=>{

setLS("paymentLinks",snap.val())

})


/* ORDERS */

onValue(ref(db,"orders"), snap=>{

let arr=[]

snap.forEach(item=>{

arr.push({
id:item.key,
...item.val()
})

})

setLS("orders",arr)

})


/* ----------------------------- */
/* PLACE ORDER */
/* ----------------------------- */

window.placeOrder = function(orderData){

push(ref(db,"orders"), orderData)

}


/* ----------------------------- */
/* INIT */
/* ----------------------------- */

if(!getLS("cart")){
setLS("cart",[])
  }
