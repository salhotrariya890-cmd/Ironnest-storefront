// ===== IronNest: data, rendering, cart logic, events =====
const PRODUCTS=[
{id:1,name:"Adjustable Dumbbell Set (20 kg)",cat:"Strength",price:5499,rating:4.7,e:"🏋️",img:"images/adjdumbellset.jpeg",desc:"Space-saving set that adjusts from 2 kg to 20 kg per hand."},
{id:2,name:"Olympic Barbell (7 ft)",cat:"Strength",price:8999,rating:4.6,e:"🏋️‍♂️",img:"images/olympbarbel.jpeg",desc:"Standard 7 ft bar with a knurled grip for squats, presses and deadlifts."},
{id:3,name:"Cast Iron Kettlebell 12 kg",cat:"Strength",price:1899,rating:4.5,e:"🔔",img:"images/kettlebell.jpeg",desc:"Solid cast iron 12 kg kettlebell for swings, squats and full-body workouts."},
{id:4,name:"Power Rack with Pull-up Bar",cat:"Strength",price:24999,rating:4.8,e:"🏗️",img:"images/pullupbar.jpeg",desc:"Sturdy steel rack with safety bars, ideal for lifting safely at home."},
{id:5,name:"Foldable Treadmill",cat:"Cardio",price:32999,rating:4.4,e:"🏃",img:"images/tredmill.jpeg",desc:"Folds flat after use and offers adjustable speed for walking or running."},
{id:6,name:"Magnetic Exercise Bike",cat:"Cardio",price:14999,rating:4.3,e:"🚴",img:"images/bike.jpeg",desc:"Quiet magnetic resistance with a padded seat for low-impact cardio."},
{id:7,name:"Speed Jump Rope",cat:"Cardio",price:399,rating:4.2,e:"🪢",img:"images/jumprope.jpeg",desc:"Lightweight adjustable rope for quick warm-ups and fat-burning workouts."},
{id:8,name:"Rowing Machine",cat:"Cardio",price:21999,rating:4.6,e:"🚣",img:"images/rowingmachine.jpeg",desc:"Full-body cardio machine that works your back, arms and legs together."},
{id:9,name:"Non-slip Yoga Mat 6 mm",cat:"Yoga & Recovery",price:899,rating:4.5,e:"🧘",img:"images/yogamat.jpeg",desc:"Non-slip 6 mm mat with enough cushioning for joints on hard floors."},
{id:10,name:"Foam Roller",cat:"Yoga & Recovery",price:699,rating:4.4,e:"🧴",img:"images/foamroller.jpeg",desc:"Firm roller that eases sore muscles and speeds up post-workout recovery."},
{id:11,name:"Resistance Band Set (5 pc)",cat:"Yoga & Recovery",price:599,rating:4.6,e:"🎗️",img:"images/resistbandset.jpeg",desc:"Five resistance levels for stretching, rehab and strength training anywhere."},
{id:12,name:"Cricket Bat (English Willow)",cat:"Team Sports",price:6499,rating:4.7,e:"🏏",img:"images/bat.jpeg",desc:"Well-balanced English willow bat built for powerful, controlled strokes."},
{id:13,name:"Badminton Racket Pair",cat:"Team Sports",price:1799,rating:4.3,e:"🏸",img:"images/badminton.jpeg",desc:"Lightweight graphite pair, ready to play with a carry cover."},
{id:14,name:"Size 5 Football",cat:"Team Sports",price:999,rating:4.4,e:"⚽",img:"images/football.jpeg",desc:"Durable size 5 ball with a stitched surface for grass and turf."},
{id:15,name:"Basketball (Indoor/Outdoor)",cat:"Team Sports",price:1299,rating:4.5,e:"🏀",img:"images/basketball.jpeg",desc:"Grippy rubber basketball that bounces well on both courts and gym floors."},
{id:16,name:"Interlocking Gym Floor Tiles",cat:"Accessories",price:2499,rating:4.2,e:"🟫",img:"images/gymfloortiles.jpeg",desc:"Cushioned tiles that protect your floor and reduce noise from weights."}
];
const CATS=["All",...new Set(PRODUCTS.map(p=>p.cat)),"Wishlist"];
const $=s=>document.querySelector(s);
// Show the product image; if the file is missing, fall back to the emoji
const pic=p=>`<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.replaceWith(document.createTextNode('${p.e}'))">`;
const fmt=n=>"₹"+n.toLocaleString("en-IN");
let cat="All",cart={},wish={};
try{cart=JSON.parse(localStorage.getItem("ironnest-cart")||"{}")}catch(e){cart={}}
try{wish=JSON.parse(localStorage.getItem("ironnest-wish")||"{}")}catch(e){wish={}}

function save(){try{localStorage.setItem("ironnest-cart",JSON.stringify(cart))}catch(e){}}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1800)}

function renderChips(){
  $("#chips").innerHTML=CATS.map(c=>`<button class="chip ${c===cat?"on":""}" data-c="${c}">${c}</button>`).join("");
}
function renderGrid(){
  const q=$("#search").value.trim().toLowerCase(),s=$("#sort").value;
  const max=+$("#price").value;$("#priceLabel").textContent=fmt(max);
  let list=PRODUCTS.filter(p=>(cat==="All"||(cat==="Wishlist"?wish[p.id]:p.cat===cat))&&p.price<=max&&(p.name+p.cat).toLowerCase().includes(q));
  if(s==="low")list.sort((a,b)=>a.price-b.price);
  if(s==="high")list.sort((a,b)=>b.price-a.price);
  if(s==="rating")list.sort((a,b)=>b.rating-a.rating);
  $("#grid").innerHTML=list.length?list.map(p=>`
    <article class="card"><div class="thumb" data-view="${p.id}">${pic(p)}<button class="heart" data-w="${p.id}" aria-label="Toggle wishlist">${wish[p.id]?"❤️":"🤍"}</button></div>
    <div class="info"><span class="cat">${p.cat}</span><h3 data-view="${p.id}">${p.name}</h3>
    <span class="rating">★ ${p.rating}</span>
    <p class="desc">${p.desc}</p>
    <div class="row"><span class="price">${fmt(p.price)}</span><button class="add" data-id="${p.id}">Add</button></div></div></article>`).join("")
    :'<div class="empty" style="grid-column:1/-1">No products match your search.</div>';
}
function renderCart(){
  const ids=Object.keys(cart);let total=0,count=0;
  $("#items").innerHTML=ids.length?ids.map(id=>{
    const p=PRODUCTS.find(x=>x.id==id),q=cart[id];total+=p.price*q;count+=q;
    return `<div class="item"><span class="e">${pic(p)}</span><div class="n">${p.name}<br><b>${fmt(p.price)}</b></div>
    <div class="qty"><button data-d="-1" data-id="${id}">−</button><span>${q}</span><button data-d="1" data-id="${id}">+</button></div></div>`}).join("")
    :'<div class="empty">Your cart is empty.</div>';
  $("#total").textContent=fmt(total);$("#count").textContent=count;save();
}
function change(id,d){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];renderCart()}

$("#chips").addEventListener("click",e=>{const c=e.target.dataset.c;if(c){cat=c;renderChips();renderGrid()}});
$("#grid").addEventListener("click",e=>{
  const d=e.target.dataset;
  if(d.id){change(d.id,1);toast("Added to cart")}
  else if(d.w){toggleWish(d.w)}
  else if(d.view){showDetails(d.view)}
});
$("#price").addEventListener("input",renderGrid);
$("#items").addEventListener("click",e=>{const{id,d}=e.target.dataset;if(d)change(id,+d)});
$("#search").addEventListener("input",renderGrid);
$("#sort").addEventListener("change",renderGrid);
$("#openCart").onclick=()=>$("#drawer").classList.add("open");
$("#closeCart").onclick=()=>$("#drawer").classList.remove("open");
$("#checkout").onclick=()=>{
  if(!Object.keys(cart).length){toast("Your cart is empty");return}
  cart={};renderCart();$("#drawer").classList.remove("open");toast("Order placed! Thank you 🎉");
};
renderChips();renderGrid();renderCart();

// ===== Contact form validation =====
$("#contactForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#cn").value.trim(),email=$("#ce").value.trim(),msg=$("#cm").value.trim();
  let err="";
  if(name.length<2)err="Please enter your name.";
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))err="Please enter a valid email address.";
  else if(msg.length<10)err="Message must be at least 10 characters.";
  $("#cerr").textContent=err;
  if(!err){e.target.reset();toast("Message sent. We will reply soon.")}
});

// ===== Wishlist and product quick view =====
function toggleWish(id){
  if(wish[id])delete wish[id];else wish[id]=1;
  try{localStorage.setItem("ironnest-wish",JSON.stringify(wish))}catch(e){}
  renderGrid();toast(wish[id]?"Saved to wishlist":"Removed from wishlist");
}
function showDetails(id){
  const p=PRODUCTS.find(x=>x.id==id);
  $("#mbody").innerHTML=`<div class="thumb">${pic(p)}</div><span class="cat">${p.cat}</span><h2>${p.name}</h2>
  <p class="rating">★ ${p.rating} rating</p>
  <p>${p.desc}</p>
  <div class="row"><span class="price">${fmt(p.price)}</span><button class="add" data-add="${p.id}">Add to cart</button></div>`;
  $("#modal").hidden=false;
}
$("#mbody").addEventListener("click",e=>{const id=e.target.dataset.add;if(id){change(id,1);toast("Added to cart");$("#modal").hidden=true}});
$("#mclose").onclick=()=>$("#modal").hidden=true;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")e.target.hidden=true});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#modal").hidden=true});
