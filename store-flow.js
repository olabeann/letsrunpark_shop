// Addressable product and checkout pages for the existing local demo store.
const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storeMain=document.getElementById('store');
storeMain.insertAdjacentHTML('beforeend','<section id="productPage" class="store-page" hidden></section><section id="checkoutPage" class="store-page" hidden><a class="back-link" href="#products">← 쇼핑 계속하기</a><p class="eyebrow">CHECKOUT</p><h1 tabindex="-1">주문·결제</h1><div class="checkout-layout"><div id="checkoutFields"></div><aside id="checkoutSummary" class="checkout-summary"></aside></div></section><section id="completePage" class="store-page" hidden></section>');
const productPage=document.getElementById('productPage'),checkoutPage=document.getElementById('checkoutPage'),completePage=document.getElementById('completePage');
document.getElementById('checkoutFields').append(checkoutForm);
document.getElementById('checkoutModal').remove();
checkoutForm.querySelector('.eyebrow').remove();
checkoutForm.querySelector('.payment-note').textContent='시연용 주문입니다. 실제 카드 결제나 상품 배송은 진행되지 않습니다. 개인정보 대신 테스트 정보를 입력해 주세요.';
checkoutForm.querySelector('button.primary').textContent='주문 완료하기 (시연)';
let checkoutDraft=JSON.parse(sessionStorage.goodsCheckout||'null');
const canBuy=p=>p&&p.status==='sale'&&p.stock>0;
const shippingFee=sub=>sub===0||sub>=50000?0:3000;
function cartValid(items){return Array.isArray(items)&&items.length>0&&items.every(x=>Number.isInteger(x.qty)&&x.qty>0&&canBuy(products.find(p=>p.id===x.id))&&products.find(p=>p.id===x.id).stock>=x.qty);}
renderProducts=function(){productsEl.innerHTML=products.filter(p=>p.status!=='hidden').map(p=>`<a class="product product-link ${canBuy(p)?'':'soldout'}" href="#product/${p.id}">${productVisual(p)}<span class="badge">${canBuy(p)?'판매 중':'품절'}</span><div class="product-info"><h3>${escapeText(p.name)}</h3><div class="price">${won(p.price)}</div></div></a>`).join('')||'<p class="empty">표시할 상품이 없습니다.</p>';};
showProduct=function(id){location.hash='product/'+id;};
function renderProductPage(id){
  selected=products.find(p=>p.id===id&&p.status!=='hidden');
  if(!selected){productPage.innerHTML='<a class="back-link" href="#products">← 상품 목록</a><h1 tabindex="-1">상품을 찾을 수 없습니다.</h1>';return;}
  const p=selected,available=canBuy(p);
  document.title=p.name+' | 렛츠런파크 굿즈 스토어';
  productPage.innerHTML=`<a class="back-link" href="#products">← 상품 목록</a><div class="product-layout">${productVisual(p,'detail-art')}<div class="purchase-info"><p class="eyebrow">OFFICIAL GOODS</p><h1 tabindex="-1">${escapeText(p.name)}</h1><p class="product-description">${escapeText(p.description||'렛츠런파크 공식 굿즈')}</p><p class="detail-price">${won(p.price)}</p><dl class="delivery-info"><div><dt>배송비</dt><dd>3,000원 · 50,000원 이상 무료배송</dd></div><div><dt>판매 상태</dt><dd>${available?'판매 중 · 재고 '+p.stock+'개':'품절'}</dd></div></dl><div class="quantity-row"><span>수량</span><div class="counter"><button type="button" id="quantityMinus" aria-label="수량 줄이기" disabled>−</button><output id="detailQty" aria-live="polite">${available?1:0}</output><button type="button" id="quantityPlus" aria-label="수량 늘리기" ${!available||p.stock<=1?'disabled':''}>+</button></div></div><div class="detail-total"><span>상품 금액</span><strong id="detailTotal" aria-live="polite">${won(available?p.price:0)}</strong></div><div class="purchase-actions"><button class="outline" id="detailCart" ${available?'':'disabled'}>장바구니 담기</button><button class="primary" id="buyNow" ${available?'':'disabled'}>${available?'바로 구매':'품절'}</button></div></div></div><section class="product-information"><h2>상품 상세정보</h2><p>${escapeText(p.description||'렛츠런파크 공식 굿즈')}</p><h2>배송 안내</h2><p>배송비는 주문 상품 합계 기준으로 계산됩니다. 50,000원 이상 구매 시 무료배송입니다.</p></section>`;
  document.getElementById('quantityMinus').onclick=()=>detailQty(-1);
  document.getElementById('quantityPlus').onclick=()=>detailQty(1);
  document.getElementById('detailCart').onclick=addSelected;
  document.getElementById('buyNow').onclick=()=>startCheckout([{id:p.id,qty:Number(document.getElementById('detailQty').textContent)}],'direct');
}
detailQty=function(delta){if(!canBuy(selected))return;const output=document.getElementById('detailQty');const qty=Math.max(1,Math.min(selected.stock,Number(output.textContent)+delta));output.textContent=qty;document.getElementById('detailTotal').textContent=won(selected.price*qty);document.getElementById('quantityMinus').disabled=qty===1;document.getElementById('quantityPlus').disabled=qty===selected.stock;};
addSelected=function(){const id=selected.id,qty=Number(document.getElementById('detailQty').textContent);requireLogin(()=>{const p=products.find(p=>p.id===id);if(!canBuy(p))return;const existing=cart.find(x=>x.id===id);if(existing)existing.qty=Math.min(existing.qty+qty,p.stock);else cart.push({id,qty:Math.min(qty,p.stock)});renderCart();cartPanel.classList.add('open');});};
function startCheckout(items,source){if(!cartValid(items))return alert('판매 상태와 재고를 확인해 주세요.');requireLogin(()=>{checkoutDraft={items:items.map(x=>({...x})),source};sessionStorage.goodsCheckout=JSON.stringify(checkoutDraft);cartPanel.classList.remove('open');location.hash='checkout';});}
checkout.onclick=()=>startCheckout(cart,'cart');
function renderCheckoutPage(){
  const valid=cartValid(checkoutDraft?.items);checkoutForm.hidden=!valid;
  if(!valid){document.getElementById('checkoutSummary').innerHTML='<h2>주문할 상품을 확인해 주세요.</h2><p>선택한 상품이 없거나 판매 상태·재고가 변경되었습니다.</p><a class="back-link" href="#products">상품 목록으로 돌아가기 →</a>';return;}
  const sub=checkoutDraft.items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=shippingFee(sub);
  document.getElementById('checkoutSummary').innerHTML=`<h2>주문 상품</h2>${checkoutDraft.items.map(x=>{const p=products.find(p=>p.id===x.id);return `<div class="checkout-item"><a href="#product/${p.id}">${escapeText(p.name)}</a><span>${x.qty}개 · ${won(p.price*x.qty)}</span></div>`;}).join('')}<dl class="cost-summary"><div><dt>상품 금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${ship?won(ship):'무료'}</dd></div><div class="grand-total"><dt>총 결제금액</dt><dd>${won(sub+ship)}</dd></div></dl><p class="demo-caption">시연 주문으로 실제 청구되지 않습니다.</p>`;
}
checkoutForm.onsubmit=e=>{e.preventDefault();if(!cartValid(checkoutDraft?.items)){renderCheckoutPage();return alert('판매 상태나 재고가 변경되었습니다. 상품을 다시 선택해 주세요.');}requireLogin(()=>{
  if(!cartValid(checkoutDraft?.items))return renderCheckoutPage();
  const f=Object.fromEntries(new FormData(checkoutForm)),items=checkoutDraft.items.map(x=>({...x,name:products.find(p=>p.id===x.id).name}));
  const sub=items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const order={...f,number:'G'+Date.now(),date:new Date().toLocaleDateString('ko-KR'),items,total:sub+shippingFee(sub),status:'출고 대기',demo:true};
  items.forEach(x=>{const p=products.find(p=>p.id===x.id);p.stock-=x.qty;if(!p.stock)p.status='soldout';});
  if(checkoutDraft.source==='cart'){cart=cart.map(x=>({...x,qty:x.qty-(items.find(i=>i.id===x.id)?.qty||0)})).filter(x=>x.qty>0);}
  orders.unshift(order);checkoutDraft=null;sessionStorage.removeItem('goodsCheckout');save();renderProducts();renderCart();renderOrders();renderAdmin();checkoutForm.reset();location.hash='complete/'+order.number;
});};
document.getElementById('ordersToggle').onclick=e=>{e.preventDefault();requireLogin(()=>{location.hash='orders';routeStore();});};
function routeStore(){
  const hash=location.hash.slice(1),isProduct=hash.startsWith('product/'),isCheckout=hash==='checkout',isComplete=hash.startsWith('complete/'),isOrders=hash==='orders';
  document.querySelector('.intro').hidden=isProduct||isCheckout||isComplete||isOrders;document.querySelector('.catalog').hidden=isProduct||isCheckout||isComplete||isOrders;
  productPage.hidden=!isProduct;checkoutPage.hidden=!isCheckout;completePage.hidden=!isComplete;document.getElementById('orders').hidden=!isOrders;
  cartPanel.classList.remove('open');document.title='렛츠런파크 굿즈 스토어';
  if(isProduct)renderProductPage(Number(hash.split('/')[1]));
  if(isCheckout){document.title='주문·결제 | 렛츠런파크 굿즈 스토어';renderCheckoutPage();}
  if(isComplete){const order=orders.find(o=>o.number===hash.split('/')[1]);completePage.innerHTML=order?`<p class="eyebrow">ORDER COMPLETE</p><h1 tabindex="-1">시연 주문이 완료되었습니다.</h1><p>실제 결제 및 배송은 진행되지 않습니다.</p><div class="completion-card"><p>주문번호 <strong>${escapeText(order.number)}</strong></p><p>${order.items.map(x=>escapeText(x.name)+' × '+x.qty).join(' · ')}</p><p>주문 금액 <strong>${won(order.total)}</strong></p></div><div class="completion-actions"><a class="outline" href="#orders">주문 내역 확인</a><a class="outline" href="#products">쇼핑 계속하기</a></div>`:'<h1 tabindex="-1">주문을 찾을 수 없습니다.</h1><a href="#products">상품 목록</a>';}
  if(isOrders)renderOrders();
  if(isProduct||isCheckout||isComplete){window.scrollTo({top:0,behavior:"instant"});(isProduct?productPage:isCheckout?checkoutPage:completePage).querySelector('h1')?.focus({preventScroll:true});}
  else if(hash==='products')document.querySelector('.catalog').scrollIntoView();
  else window.scrollTo({top:0,behavior:"instant"});
}
window.addEventListener('hashchange',routeStore);renderProducts();routeStore();
