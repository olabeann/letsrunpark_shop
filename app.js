const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
const base=[{id:1,name:'말마 인형',description:'귀여운 말마 캐릭터 봉제 인형',price:29000,stock:18,status:'sale',order:1,art:'MALMA'},{id:2,name:'경주마 인형 A',description:'경주마의 역동성을 담은 인형',price:26000,stock:9,status:'sale',order:2,art:'RACE A'},{id:3,name:'경주마 인형 B',description:'컬렉션을 완성하는 한정 디자인',price:26000,stock:0,status:'soldout',order:3,art:'RACE B'}];
let products=JSON.parse(localStorage.goodsProducts||'null')||base,cart=JSON.parse(localStorage.goodsCart||'[]'),orders=JSON.parse(localStorage.goodsOrders||'[]');let selected=null;
// Preview state only; production login must use a server-verified OAuth session.
let loginPreviewActive=false,pendingLoginAction=null;
const loginDialog=document.getElementById('loginModal');
function requireLogin(action){
  if(loginPreviewActive){action();return;}
  pendingLoginAction=action;
  document.getElementById('loginStatus').textContent='로그인 방법을 선택해 주세요.';
  loginDialog.showModal();
}
loginDialog.addEventListener('close',()=>{pendingLoginAction=null;});
document.querySelectorAll('[data-provider]').forEach(button=>button.addEventListener('click',()=>{
  const action=pendingLoginAction;
  pendingLoginAction=null;
  loginPreviewActive=true;
  loginDialog.close();
  action?.();
}));
document.getElementById('ordersToggle').onclick=e=>{
  e.preventDefault();
  requireLogin(()=>{
    document.getElementById('orders').hidden=false;
    renderOrders();
    document.getElementById('orders').scrollIntoView({behavior:'smooth'});
  });
};
const save=()=>{localStorage.goodsProducts=JSON.stringify(products);localStorage.goodsCart=JSON.stringify(cart);localStorage.goodsOrders=JSON.stringify(orders)};
function productVisual(p,className='product-image'){return `<div class="${className}">${p.image?`<img src="${p.image}" alt="${p.name}">`:p.art}</div>`}function renderProducts(){products.sort((a,b)=>a.id-b.id);productsEl.innerHTML=products.filter(p=>p.status!=='hidden').map(p=>`<article class="product ${p.status==='sale'?'':'soldout'}" onclick="showProduct(${p.id})">${productVisual(p)}<span class="badge">${p.status==='sale'?'판매 중':'품절'}</span><div class="product-info"><h3>${p.name}</h3><div class="price">${won(p.price)}</div></div></article>`).join('')||'<p class="empty">표시할 상품이 없습니다.</p>'}
function renderCart(){cart=cart.filter(x=>products.find(p=>p.id===x.id));cartCount.textContent=cart.reduce((s,x)=>s+x.qty,0);cartItems.innerHTML=cart.map(x=>{let p=products.find(p=>p.id===x.id);return `<div class="cart-row"><div><strong>${p.name}</strong><small>${won(p.price)}</small></div><div class="qty"><button onclick="changeQty(${x.id},-1)">−</button>${x.qty}<button onclick="changeQty(${x.id},1)">+</button><button onclick="removeCart(${x.id})">×</button></div></div>`}).join('')||'<p class="empty">장바구니가 비어 있습니다.</p>';let sub=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=sub===0?0:sub>=50000?0:3000;subtotal.textContent=won(sub);shipping.textContent=ship?won(ship):'무료';total.textContent=won(sub+ship);save()}
function showProduct(id){selected=products.find(p=>p.id===id);if(selected.status!=='sale')return;productDetail.innerHTML=`<div class="detail">${productVisual(selected,'detail-art')}<div><p class="eyebrow">OFFICIAL GOODS</p><h2>${selected.name}</h2><h3>${won(selected.price)}</h3><p class="stock">남은 재고 ${selected.stock}개</p><div class="counter"><button onclick="detailQty(-1)">−</button><output id="detailQty">1</output><button onclick="detailQty(1)">+</button></div><button class="primary" onclick="addSelected()">장바구니에 담기</button></div></div>`;productModal.showModal()}
function detailQty(n){let o=document.getElementById('detailQty'),v=Math.max(1,Math.min(selected.stock,+o.textContent+n));o.textContent=v}function addSelected(){
  const id=selected.id,qty=Number(document.getElementById('detailQty').textContent);
  requireLogin(()=>{
    const p=products.find(item=>item.id===id);
    if(!p||p.status!=='sale'||p.stock<1)return;
    const existing=cart.find(item=>item.id===id);
    if(existing)existing.qty=Math.min(existing.qty+qty,p.stock);
    else cart.push({id,qty:Math.min(qty,p.stock)});
    productModal.close();renderCart();cartPanel.classList.add('open');
  });
}function changeQty(id,n){let x=cart.find(x=>x.id===id),p=products.find(p=>p.id===id);x.qty=Math.max(1,Math.min(p.stock,x.qty+n));renderCart()}function removeCart(id){cart=cart.filter(x=>x.id!==id);renderCart()}
function renderOrders(){orderList.innerHTML=orders.map(o=>`<article class="order"><div><h3>${o.number} <span class="status">${o.status}</span></h3><p>${o.items.map(i=>i.name+' × '+i.qty).join(' · ')}</p><p>수령인 ${o.recipient||o.name} · ${o.recipientPhone||o.phone}<br>${o.address}</p></div><div><strong>${won(o.total)}</strong>${o.status==='출고 대기'?`<br><button class="outline" onclick="cancelOrder('${o.number}')">주문 전체 취소</button>`:''}</div></article>`).join('')||'<p class="empty">아직 주문 내역이 없습니다.</p>'}
function cancelOrder(num){let o=orders.find(o=>o.number===num);if(!confirm('주문 전체를 취소하고 재고를 복원할까요?'))return;o.items.forEach(i=>products.find(p=>p.id===i.id).stock+=i.qty);o.status='전체 취소';save();renderProducts();renderOrders();renderAdmin()}
function renderAdmin(){adminProducts.innerHTML=products.sort((a,b)=>a.id-b.id).map(p=>`<article class="admin-card"><h3>${p.name}</h3><p>${won(p.price)} · 재고 <b>${p.stock}개</b></p><p>상태: ${p.status}</p><div class="actions"><button onclick="editProduct(${p.id})">수정</button><button onclick="adjustStock(${p.id})">재고 조정</button></div></article>`).join('');adminOrders.innerHTML=orders.length?`<table class="admin-table"><thead><tr><th>주문번호 / 주문일</th><th>구매자</th><th>수령인·배송지</th><th>상품·수량</th><th>결제금액</th><th>상태</th><th>처리</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${o.number}<br>${o.date}</td><td>${o.name}<br>${o.phone}</td><td>${o.recipient||o.name}<br>${o.recipientPhone||o.phone}<br>${o.address}</td><td>${o.items.map(i=>i.name+' ×'+i.qty).join('<br>')}</td><td>${won(o.total)}</td><td>${o.status}</td><td>${o.status==='출고 대기'?`<button class="outline" onclick="shipOrder('${o.number}')">출고 완료</button><button class="outline" onclick="cancelOrder('${o.number}')">취소</button>`:'-'}</td></tr>`).join('')}</tbody></table>`:'<p class="empty">주문 내역이 없습니다.</p>'}
function shipOrder(n){orders.find(o=>o.number===n).status='출고 완료';save();renderOrders();renderAdmin()}
function openEditor(p={id:'',name:'',image:'',price:0,stock:0,status:'sale'}){let f=productForm.content.cloneNode(true).querySelector('form');Object.entries(p).forEach(([k,v])=>f.elements[k]&&(f.elements[k].value=v));f.onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(f));d.id=+d.id||Date.now();d.price=+d.price;d.stock=+d.stock;d.art=(d.name||'GOODS').slice(0,8).toUpperCase();let x=products.findIndex(x=>x.id===d.id);x>=0?products[x]={...products[x],...d}:products.push(d);save();productModal.close();renderProducts();renderAdmin()};productDetail.innerHTML='';productDetail.append(f);productModal.showModal()}function editProduct(id){openEditor(products.find(p=>p.id===id))}function adjustStock(id){let p=products.find(p=>p.id===id),v=prompt(`${p.name} 재고 수량`,p.stock);if(v!==null&&!isNaN(v)){p.stock=Math.max(0,+v);if(p.stock===0)p.status='soldout';save();renderProducts();renderAdmin()}}
cartToggle.onclick=()=>requireLogin(()=>cartPanel.classList.add('open'));adminClose.onclick=()=>adminPanel.classList.add('hidden');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close?.()||document.getElementById(b.dataset.close).classList.remove('open'));statusFilter.onchange=renderProducts;checkout.onclick=()=>{if(!cart.length)return alert('장바구니에 상품을 담아주세요.');checkoutModal.showModal()};checkoutForm.onsubmit=e=>{e.preventDefault();for(let x of cart){let p=products.find(p=>p.id===x.id);if(p.stock<x.qty)return alert(`${p.name}의 재고가 부족합니다.`)}let f=Object.fromEntries(new FormData(checkoutForm)),sub=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=sub>=50000?0:3000,o={number:'G'+Date.now().toString().slice(-8),date:new Date().toLocaleDateString('ko-KR'),name:f.name,phone:f.phone,recipient:f.recipient,recipientPhone:f.recipientPhone,address:f.address,request:f.request,items:cart.map(x=>({...x,name:products.find(p=>p.id===x.id).name})),total:sub+ship,status:'출고 대기'};o.items.forEach(i=>products.find(p=>p.id===i.id).stock-=i.qty);products.forEach(p=>{if(!p.stock&&p.status==='sale')p.status='soldout'});orders.unshift(o);cart=[];save();checkoutModal.close();cartPanel.classList.remove('open');renderProducts();renderCart();renderOrders();renderAdmin();alert(`결제가 완료되었습니다.\n주문번호: ${o.number}`)};document.querySelectorAll('.admin-tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.admin-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.admin-view').forEach(x=>x.classList.add('hidden'));document.getElementById(b.dataset.tab).classList.remove('hidden')});newProduct.onclick=()=>openEditor();downloadOrders.onclick=()=>{let rows=['주문번호,주문일,구매자,주문자연락처,수령인,수령인연락처,배송지,배송요청사항,상품,수량,결제금액'];orders.filter(o=>o.status==='출고 대기').forEach(o=>o.items.forEach(i=>rows.push([o.number,o.date,o.name,o.phone,o.recipient||o.name,o.recipientPhone||o.phone,o.address,o.request||'',i.name,i.qty,o.total].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv'}));a.download='출고대기주문.csv';a.click()};const productsEl=document.getElementById('products');renderProducts();renderCart();renderOrders();renderAdmin();
