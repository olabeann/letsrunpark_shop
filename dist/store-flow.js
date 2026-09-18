// Addressable product and checkout pages for the existing local demo store.
const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storeMain=document.getElementById('store');
storeMain.insertAdjacentHTML('beforeend','<section id="productPage" class="store-page" hidden></section><section id="checkoutPage" class="store-page" hidden><a class="back-link" href="#products">← 쇼핑 계속하기</a><p class="eyebrow">CHECKOUT</p><h1 tabindex="-1">주문·결제</h1><div class="checkout-layout"><div id="checkoutFields"></div><aside id="checkoutSummary" class="checkout-summary"></aside></div></section><section id="completePage" class="store-page" hidden></section>');
const productPage=document.getElementById('productPage'),checkoutPage=document.getElementById('checkoutPage'),completePage=document.getElementById('completePage');
document.getElementById('checkoutFields').append(checkoutForm);
document.getElementById('checkoutModal').remove();
checkoutForm.querySelector('.eyebrow').remove();
checkoutForm.querySelector('button.primary').textContent='결제하기';
const addressModal=document.getElementById('addressModal');
function closeAddressSearch(){addressModal.hidden=true;document.getElementById('searchAddress').focus();}
document.getElementById('closeAddress').onclick=closeAddressSearch;
addressModal.addEventListener('click',e=>{if(e.target===addressModal)closeAddressSearch();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!addressModal.hidden){e.preventDefault();closeAddressSearch();}});
document.getElementById('searchAddress').onclick=()=>{
  const Postcode=window.kakao?.Postcode||window.daum?.Postcode;
  const status=document.getElementById('addressStatus');
  if(!Postcode){status.textContent='주소 검색을 불러오지 못했습니다. 우편번호와 주소를 직접 입력해 주세요.';return;}
  status.textContent='';
  addressModal.hidden=false;
  const container=document.getElementById('addressSearchContainer');
  container.replaceChildren();
  new Postcode({width:'100%',height:'100%',oncomplete:data=>{
    document.getElementById('postcode').value=data.zonecode;
    document.getElementById('baseAddress').value=(data.userSelectedType==='R'?data.roadAddress:data.jibunAddress)||data.address||data.roadAddress||data.jibunAddress;
    document.getElementById('detailAddress').value='';
    closeAddressSearch();
    document.getElementById('detailAddress').focus();
  }}).embed(container,{autoClose:false});
};
let checkoutDraft=JSON.parse(sessionStorage.goodsCheckout||'null');
const canBuy=p=>p&&p.status==='sale'&&p.stock>0;
// Prototype defaults; production reads these values from administrator settings.
const storeSettings={shippingFee:3000,cancelHours:24,shippingNotice:'주 1회 모아서 발송합니다. 이번 주 주문 마감과 발송일은 렛츠런플레이 상품 상세 안내를 확인해 주세요.',...JSON.parse(localStorage.goodsSettings||'{}')};
const purchaseAgreement=document.getElementById('purchaseAgreement');
const paymentButton=checkoutForm.querySelector('button.primary');
function renderPurchaseNotices(){document.getElementById('purchaseNotices').innerHTML=`<li>상품과 수량, 배송지 정보를 확인해 주세요. 결제 시 재고가 부족하면 구매할 수 없습니다.</li><li>${escapeText(storeSettings.shippingNotice)}</li><li>배송비는 주문당 ${won(storeSettings.shippingFee)}입니다.</li><li>결제 후 ${storeSettings.cancelHours}시간 이내, 발송 전까지 주문 전체 취소 및 전액 환불이 가능합니다. 부분 취소·부분 환불은 불가합니다.</li>`;}
purchaseAgreement.addEventListener('change',()=>{paymentButton.disabled=!purchaseAgreement.checked;});
checkoutForm.addEventListener('reset',()=>{paymentButton.disabled=true;});
const shippingFee=sub=>sub>0?storeSettings.shippingFee:0;
function cartValid(items){return Array.isArray(items)&&items.length>0&&items.every(x=>Number.isInteger(x.qty)&&x.qty>0&&canBuy(products.find(p=>p.id===x.id))&&products.find(p=>p.id===x.id).stock>=x.qty);}
renderProducts=function(){productsEl.innerHTML=products.filter(p=>p.status!=='hidden').map(p=>{return `<article class="product ${canBuy(p)?'':'soldout'}"><a class="product-link" href="#product/${p.id}">${productVisual(p)}<span class="badge">${canBuy(p)?'판매 중':'품절'}</span><div class="product-info"><h3>${escapeText(p.name)}</h3><div class="price">${won(p.price)}</div><span class="detail-hint">상품 소개 · 배송 안내 →</span></div></a></article>`;}).join('')||'<p class="empty">표시할 상품이 없습니다.</p>';updateSelection();};
function updateSelection(){const count=cart.reduce((sum,x)=>sum+x.qty,0);cartCount.textContent=count;cartToggle.hidden=count===0;if(!count){cartPanel.classList.remove('open');cartPanel.hidden=true;}}
const renderOriginalCart=renderCart;
renderCart=function(){renderOriginalCart();updateSelection();const sub=cart.reduce((sum,x)=>sum+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0);shipping.textContent=won(shippingFee(sub));total.textContent=won(sub+shippingFee(sub));};
cartToggle.onclick=()=>requireLogin(()=>{if(!cart.length)return;renderCart();cartPanel.hidden=false;cartPanel.classList.add('open');});

showProduct=function(id){location.hash='product/'+id;};
function renderProductPage(id){
  selected=products.find(p=>p.id===id&&p.status!=='hidden');
  if(!selected){productPage.innerHTML='<a class="back-link" href="#products">← 상품 목록</a><h1 tabindex="-1">상품을 찾을 수 없습니다.</h1>';return;}
  const p=selected,available=canBuy(p);
  document.title=p.name+' | 말마프렌즈 온라인 스토어';
  productPage.innerHTML=`<a class="back-link" href="#products">← 상품 목록</a><div class="product-layout">${productVisual(p,'detail-art')}<div class="purchase-info"><p class="eyebrow">OFFICIAL GOODS</p><h1 tabindex="-1">${escapeText(p.name)}</h1><p class="product-description">${escapeText(p.description||'렛츠런파크 공식 굿즈')}</p><p class="detail-price">${won(p.price)}</p><dl class="delivery-info"><div><dt>배송비</dt><dd>${won(storeSettings.shippingFee)} · 주문당 고정 배송비</dd></div><div><dt>판매 상태</dt><dd>${available?'판매 중':'품절'}</dd></div></dl><div class="product-selection-box"><div class="selection-item"><strong class="selection-name">${escapeText(p.name)}</strong><div class="selection-item-bottom"><div class="counter"><button type="button" id="quantityMinus" aria-label="수량 줄이기" disabled>−</button><output id="detailQty" aria-live="polite">${available?1:0}</output><button type="button" id="quantityPlus" aria-label="수량 늘리기" ${!available?'disabled':''}>+</button></div><strong id="detailLineTotal" aria-live="polite">${won(available?p.price:0)}</strong></div></div><div class="selection-totals"><strong>총 <span id="detailTotalQty" aria-live="polite">${available?1:0}</span>개</strong><div><span>총 상품 금액</span><strong id="detailTotal" aria-live="polite">${won(available?p.price:0)}</strong></div></div></div><div class="purchase-actions"><button class="outline" id="detailCart" ${available?'':'disabled'}>장바구니에 담기</button><button class="primary" id="buyNow" ${available?'':'disabled'}>${available?'바로 구매':'품절'}</button></div></div></div><section class="product-information"><h2>상품 상세정보</h2><div class="product-rich-content">${p.detailHtml?ProductContent.sanitize(p.detailHtml):'<p>'+escapeText(p.description||'렛츠런파크 공식 굿즈')+'</p>'}</div><h2>배송 안내</h2><p>${escapeText(storeSettings.shippingNotice)}</p><p>배송비는 주문당 ${won(storeSettings.shippingFee)}입니다.</p><h2>취소 안내</h2><p>결제 후 ${storeSettings.cancelHours}시간 이내, 발송 전까지 주문 전체 취소가 가능합니다. 부분 취소·부분 환불은 지원하지 않습니다.</p></section>`;
  document.getElementById('quantityMinus').onclick=()=>detailQty(-1);
  document.getElementById('quantityPlus').onclick=()=>detailQty(1);
  document.getElementById('detailCart').onclick=addSelected;
  document.getElementById('buyNow').onclick=()=>startCheckout([{id:p.id,qty:Number(document.getElementById('detailQty').textContent)}],'direct');
}
detailQty=function(delta){if(!canBuy(selected))return;const output=document.getElementById('detailQty');const qty=Math.max(1,Number(output.textContent)+delta);output.textContent=qty;document.getElementById('detailTotal').textContent=won(selected.price*qty);document.getElementById('detailLineTotal').textContent=won(selected.price*qty);document.getElementById('detailTotalQty').textContent=qty;document.getElementById('quantityMinus').disabled=qty===1;document.getElementById('quantityPlus').disabled=false;};
let storeToastTimer;
function showStoreToast(message){const toast=document.getElementById('storeToast');clearTimeout(storeToastTimer);toast.textContent=message;toast.hidden=false;storeToastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent='';},2500);}
addSelected=function(){const id=selected.id,qty=Number(document.getElementById('detailQty').textContent);requireLogin(()=>{const p=products.find(p=>p.id===id);if(!canBuy(p))return;const existing=cart.find(x=>x.id===id);if(existing)existing.qty+=qty;else cart.push({id,qty});save();renderCart();renderProducts();showStoreToast('장바구니에 담겼어요');});};
function startCheckout(items,source){purchaseAgreement.checked=false;paymentButton.disabled=true;if(!items.length)return alert('상품과 수량을 선택해 주세요.');requireLogin(()=>{checkoutDraft={items:items.map(x=>({...x})),source};sessionStorage.goodsCheckout=JSON.stringify(checkoutDraft);cartPanel.classList.remove('open');location.hash='checkout';});}
checkout.onclick=()=>startCheckout(cart,'cart');
function renderCheckoutPage(){
  renderPurchaseNotices();
  const valid=Array.isArray(checkoutDraft?.items)&&checkoutDraft.items.length>0&&checkoutDraft.items.every(x=>products.some(p=>p.id===x.id));checkoutForm.hidden=!valid;
  if(!valid){document.getElementById('checkoutSummary').innerHTML='<h2>주문할 상품을 확인해 주세요.</h2><p>선택한 상품이 없거나 판매 상태·재고가 변경되었습니다.</p><a class="back-link" href="#products">상품 목록으로 돌아가기 →</a>';return;}
  const sub=checkoutDraft.items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=shippingFee(sub);
  document.getElementById('checkoutSummary').innerHTML=`<h2>주문 상품</h2>${checkoutDraft.items.map(x=>{const p=products.find(p=>p.id===x.id);return `<div class="checkout-item"><a href="#product/${p.id}">${escapeText(p.name)}</a><span>${x.qty}개 · ${won(p.price*x.qty)}</span></div>`;}).join('')}<dl class="cost-summary"><div><dt>상품 금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${ship?won(ship):'무료'}</dd></div><div class="grand-total"><dt>총 결제금액</dt><dd>${won(sub+ship)}</dd></div></dl><p class="demo-caption">결제 후 ${storeSettings.cancelHours}시간 이내, 발송 전까지 전액 취소할 수 있습니다. 부분 취소는 불가합니다.</p>`;
}
checkoutForm.onsubmit=e=>{e.preventDefault();if(!purchaseAgreement.checked){purchaseAgreement.reportValidity();return;}if(!checkoutForm.elements.address.value.trim()){document.getElementById('addressStatus').textContent='배송지 주소를 입력해 주세요.';document.getElementById('searchAddress').focus();return;}if(!cartValid(checkoutDraft?.items)){renderCheckoutPage();return alert('판매 상태나 재고가 변경되었습니다. 상품을 다시 선택해 주세요.');}requireLogin(()=>{
  if(!cartValid(checkoutDraft?.items))return renderCheckoutPage();
  const f=Object.fromEntries(new FormData(checkoutForm)),items=checkoutDraft.items.map(x=>({...x,name:products.find(p=>p.id===x.id).name,price:products.find(p=>p.id===x.id).price}));
  const sub=items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const order={...f,baseAddress:f.address,address:[f.address,f.detailAddress.trim()].filter(Boolean).join(' '),number:'G'+Date.now(),date:new Date().toLocaleDateString('ko-KR'),createdAt:Date.now(),cancelUntil:Date.now()+storeSettings.cancelHours*3600000,items,subtotal:sub,shippingFee:shippingFee(sub),total:sub+shippingFee(sub),status:'출고 대기',demo:true};
  items.forEach(x=>{const p=products.find(p=>p.id===x.id);p.stock-=x.qty;if(!p.stock)p.status='soldout';});
  if(checkoutDraft.source==='cart'){cart=cart.map(x=>({...x,qty:x.qty-(items.find(i=>i.id===x.id)?.qty||0)})).filter(x=>x.qty>0);}
  orders.unshift(order);checkoutDraft=null;sessionStorage.removeItem('goodsCheckout');save();renderProducts();renderCart();renderOrders();renderAdmin();checkoutForm.reset();location.hash='complete/'+order.number;
});};
document.getElementById('ordersToggle').onclick=e=>{e.preventDefault();requireLogin(()=>{location.hash='orders';routeStore();});};
function routeStore(){
  const hash=location.hash.slice(1),isProduct=hash.startsWith('product/'),isCheckout=hash==='checkout',isComplete=hash.startsWith('complete/'),isOrders=hash==='orders'||hash.startsWith('orders/');
  document.querySelector('.intro').hidden=isProduct||isCheckout||isComplete||isOrders;document.querySelector('.catalog').hidden=isProduct||isCheckout||isComplete||isOrders;
  productPage.hidden=!isProduct;checkoutPage.hidden=!isCheckout;completePage.hidden=!isComplete;document.getElementById('orders').hidden=!isOrders;
  cartPanel.classList.remove('open');document.title='말마프렌즈 온라인 스토어';
  if(isProduct)renderProductPage(Number(hash.split('/')[1]));
  if(isCheckout){document.title='주문·결제 | 말마프렌즈 온라인 스토어';renderCheckoutPage();}
  if(isComplete){const order=orders.find(o=>o.number===hash.split('/')[1]);completePage.innerHTML=order?`<p class="eyebrow">ORDER COMPLETE</p><h1 tabindex="-1">주문이 완료되었습니다.</h1><p>주문 내역에서 배송 상태를 확인할 수 있습니다.</p><div class="completion-card"><p>주문번호 <strong>${escapeText(order.number)}</strong></p><p>${order.items.map(x=>escapeText(x.name)+' × '+x.qty).join(' · ')}</p><p>주문 금액 <strong>${won(order.total)}</strong></p></div><div class="completion-actions"><a class="outline" href="#orders">주문 내역 확인</a><a class="outline" href="#products">쇼핑 계속하기</a></div>`:'<h1 tabindex="-1">주문을 찾을 수 없습니다.</h1><a href="#products">상품 목록</a>';}
  if((isOrders||isCheckout||isComplete)&&!loginPreviewActive){requireLogin(()=>routeStore());document.getElementById('orders').hidden=true;checkoutPage.hidden=true;completePage.hidden=true;return;}
  if(isOrders)renderOrders();
  if(isProduct||isCheckout||isComplete){window.scrollTo({top:0,behavior:"instant"});(isProduct?productPage:isCheckout?checkoutPage:completePage).querySelector('h1')?.focus({preventScroll:true});}
  else if(hash==='products')document.querySelector('.catalog').scrollIntoView();
  else window.scrollTo({top:0,behavior:"instant"});
}
function canCancel(o){return o.status==='출고 대기'&&Date.now()<(o.cancelUntil||0);}
const carrierTrackingPages={'CJ대한통운':'https://www.cjlogistics.com/ko/tool/parcel/tracking','한진택배':'https://www.hanjin.com/','롯데택배':'https://www.lotteglogis.com/home/reservation/tracking/index','우체국택배':'https://service.epost.go.kr/iservice/usr/trace/usrtrc001k01.jsp','로젠택배':'https://www.ilogen.com/web/personal/trace'};
function shipmentLookup(o){const url=carrierTrackingPages[o.carrier];return o.status==='출고 완료'&&o.trackingNumber&&url?`<div class="shipment-lookup"><a class="outline" href="${url}" target="_blank" rel="noopener noreferrer">배송조회 ↗</a><small>택배사 조회 페이지에서 위 송장번호를 입력해 주세요.</small></div>`:'';}
function orderStatusLabel(o){return o.status==='출고 대기'?'배송 준비 중':o.status==='출고 완료'?'발송 완료':o.status==='전체 취소'?'취소 완료':o.status;}
function orderItemVisual(i){const p=products.find(p=>p.id===i.id);return p?.image?`<img src="${escapeText(p.image)}" alt="${escapeText(i.name)}" />`:`<span>${escapeText(p?.art||'GOODS')}</span>`;}
renderOrders=function(){
  const detailNumber=location.hash.startsWith('#orders/')?decodeURIComponent(location.hash.slice(8)):null;
  const title=document.querySelector('#orders .section-head h2');
  title.textContent=detailNumber?'주문 상세':'주문 조회';
  if(!detailNumber){orderList.innerHTML=orders.map(o=>`<article class="order-list-card"><div class="order-list-top"><div><p>${escapeText(o.date)}</p><strong>주문번호 ${escapeText(o.number)}</strong></div><span class="order-state ${o.status==='전체 취소'?'cancelled':''}">${escapeText(orderStatusLabel(o))}</span></div><div class="order-list-items">${o.items.map(i=>`<div class="order-preview-item"><div class="order-thumbnail">${orderItemVisual(i)}</div><div><strong>${escapeText(i.name)}</strong><p>수량 ${i.qty}개</p></div></div>`).join('')}</div><div class="order-list-bottom"><strong>${won(o.total)}</strong><a class="outline" href="#orders/${encodeURIComponent(o.number)}">주문 상세 보기 →</a></div></article>`).join('')||'<p class="empty">아직 주문 내역이 없습니다. 마음에 드는 인형을 골라보세요.</p>';return;}
  const o=orders.find(o=>o.number===detailNumber);
  if(!o){orderList.innerHTML='<a class="back-link" href="#orders">← 주문 목록</a><p>주문을 찾을 수 없습니다.</p>';return;}
  const ship=o.shippingFee??storeSettings.shippingFee,sub=o.subtotal??o.total-ship;
  orderList.innerHTML=`<div class="order-detail"><a class="back-link" href="#orders">← 주문 목록</a><div class="order-detail-header order-info-card"><div><p>${escapeText(o.createdAt?new Date(o.createdAt).toLocaleString('ko-KR'):o.date)}</p><strong>주문번호 ${escapeText(o.number)}</strong></div><span class="order-state ${o.status==='전체 취소'?'cancelled':''}">${escapeText(orderStatusLabel(o))}</span></div><details class="order-section" open><summary>주문상품</summary><div class="order-info-card"><div class="order-store-label"><strong>말마프렌즈 온라인 스토어</strong><span>배송비 ${won(ship)}</span></div>${o.items.map(i=>`<div class="order-detail-item"><div class="order-thumbnail">${orderItemVisual(i)}</div><div><strong>${escapeText(i.name)}</strong><p>수량 ${i.qty}개</p><b>${i.price!=null?won(i.price*i.qty):'구매 금액은 결제정보에서 확인'}</b></div></div>`).join('')}<div class="order-delivery-line"><span>배송 상태</span><strong>${escapeText(orderStatusLabel(o))}</strong></div>${o.trackingNumber?`<div class="order-delivery-line"><span>${escapeText(o.carrier||'택배사')} · 운송장 번호</span><strong>${escapeText(o.trackingNumber)}</strong></div>`:''}${shipmentLookup(o)}<div class="order-action-area">${canCancel(o)?`<button class="outline" onclick="cancelOrder('${escapeText(o.number)}')">주문 전체 취소</button><p>${new Date(o.cancelUntil).toLocaleString('ko-KR')}까지, 발송 전 취소 가능</p>`:`<p>${o.status==='전체 취소'?'주문 전체가 취소되었습니다.':'현재 취소할 수 없는 주문입니다.'}</p>`}</div></div></details><section class="order-section"><h3>배송지</h3><div class="order-info-card order-address"><strong>${escapeText(o.recipient||o.name)}</strong><p>${escapeText(o.recipientPhone||o.phone)}</p><p>${escapeText(o.address)}${o.postcode?' ('+escapeText(o.postcode)+')':''}</p>${o.request?`<p class="order-memo">배송메모: ${escapeText(o.request)}</p>`:''}</div></section><details class="order-section" open><summary>결제정보</summary><div class="order-info-card"><dl class="order-payment"><div class="payment-total"><dt>주문금액</dt><dd>총 ${won(o.total)}</dd></div><div><dt>상품금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${won(ship)}</dd></div></dl><dl class="order-payment payment-method"><div><dt>결제수단</dt><dd>${escapeText(o.paymentMethod||'카드 결제')}</dd></div><div><dt>결제 상태</dt><dd>${o.status==='전체 취소'?'전액 취소 완료':'결제 완료'}</dd></div>${o.status==='전체 취소'?`<div class="refund-total"><dt>취소금액</dt><dd>${won(o.total)}</dd></div>`:''}</dl><p class="order-policy">부분 취소·부분 환불 없이 주문 전체 취소만 가능합니다.</p></div></details></div>`;
};

cancelOrder=function(num){requireLogin(()=>{const o=orders.find(o=>o.number===num);if(!o||!canCancel(o))return alert('취소 가능 시점이 지났거나 이미 처리된 주문입니다.');if(!confirm('주문한 모든 상품을 전액 취소하시겠습니까?'))return;if(o.inventoryApplied!==false)o.items.forEach(i=>{const p=products.find(p=>p.id===i.id);if(p){p.stock+=i.qty;if(p.status==='soldout')p.status='sale';}});o.status='전체 취소';save();renderProducts();renderOrders();renderAdmin();});};
// Add example orders once without replacing purchases already saved in this browser.
function seedExampleOrders(){
  if(localStorage.goodsExampleOrdersVersion==='1')return;
  const now=Date.now(),hour=3600000,day=24*hour;
  const customer={name:'김말마',phone:'010-0000-0000',recipient:'김말마',recipientPhone:'010-0000-0000',address:'경기도 과천시 경마공원대로 107, 1층 수령처',request:'배송 전 연락 부탁드립니다.',shippingFee:storeSettings.shippingFee,inventoryApplied:false};
  const examples=[
    {...customer,number:'G-EXAMPLE-1003',createdAt:now-hour,cancelUntil:now+storeSettings.cancelHours*hour,status:'출고 대기',items:[{id:1,name:'말마 인형',price:29000,qty:2},{id:2,name:'경주마 인형 A',price:26000,qty:1}],subtotal:84000},
    {...customer,number:'G-EXAMPLE-1002',createdAt:now-7*day,cancelUntil:now-6*day,status:'출고 완료',trackingNumber:'000000000000',items:[{id:2,name:'경주마 인형 A',price:26000,qty:2}],subtotal:52000},
    {...customer,number:'G-EXAMPLE-1001',createdAt:now-10*day,cancelUntil:now-9*day,status:'전체 취소',items:[{id:1,name:'말마 인형',price:29000,qty:1}],subtotal:29000}
  ].map(o=>({...o,date:new Date(o.createdAt).toLocaleDateString('ko-KR'),total:o.subtotal+o.shippingFee}));
  const existing=new Set(orders.map(o=>o.number));
  orders.push(...examples.filter(o=>!existing.has(o.number)));
  orders.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  save();localStorage.goodsExampleOrdersVersion='1';renderOrders();renderAdmin();
}
seedExampleOrders();
window.addEventListener('hashchange',routeStore);renderProducts();routeStore();

// Keep the open store in sync with product edits from the administrator tab.
window.addEventListener('storage',event=>{if(event.key!=='goodsProducts')return;try{const updated=JSON.parse(event.newValue);if(!Array.isArray(updated))return;products=updated;renderProducts();if(location.hash.startsWith('#product/'))renderProductPage(Number(location.hash.split('/')[1]));}catch{}});
