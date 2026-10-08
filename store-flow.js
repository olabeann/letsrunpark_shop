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
const canBuy=p=>p&&!p.deletedAt&&p.status==='sale'&&p.stock>0;
// Prototype defaults; production reads these values from administrator settings.
const storeSettings={...CheckoutContent.defaults,shippingFee:3000,returnShippingFee:6000,cancelHours:24,returnDays:14,shippingNotice:'주 1회 모아서 발송합니다. 이번 주 주문 마감과 발송일은 렛츠런플레이 상품 상세 안내를 확인해 주세요.',returnAddress:'경기도 과천시 경마공원대로 107 렛츠런파크 굿즈 반품 담당',...JSON.parse(localStorage.goodsSettings||'{}')};
const returnDialog=document.getElementById('returnDialog'),returnForm=document.getElementById('returnForm'),returnTrackingDialog=document.getElementById('returnTrackingDialog'),returnTrackingForm=document.getElementById('returnTrackingForm');
let activeReturnOrderNumber='';
const dayMs=24*60*60*1000;
function returnDeadline(order){
  const startedAt=Number(order.shippedAt||order.trackingRegisteredAt||order.createdAt||0),days=Number(order.returnDays??storeSettings.returnDays)||14;
  return startedAt?startedAt+days*dayMs:0;
}
function canRequestReturn(order){
  const deadline=returnDeadline(order);
  return Boolean(order.trackingNumber)&&order.status!=='전체 취소'&&!order.returnStatus&&!order.returnRejectedAt&&deadline>Date.now();
}
function customerOrderState(order){
  if(order.refundKind==='관리자 예외 환불')return '관리자 예외 환불';if(order.returnStatus==='반품 반려')return '반품 반려';
  if(order.returnStatus==='환불 완료')return '환불 완료';
  if(order.returnStatus==='신청 완료')return order.returnTrackingNumber?'반품 확인 중':'반품 발송 대기';
  return orderStatusLabel(order);
}
function customerOrderStateClass(order){return order.returnStatus==='신청 완료'?' return-requested':order.returnStatus==='환불 완료'||order.returnStatus==='반품 반려'||order.status==='전체 취소'?' cancelled':'';}
const purchaseAgreement=document.getElementById('purchaseAgreement');
const privacyAgreement=document.getElementById('privacyAgreement');
const paymentButton=checkoutForm.querySelector('button.primary');
function renderPurchaseNotices(){
  const text=CheckoutContent.resolve(storeSettings.purchaseNoticesText,storeSettings);
  document.getElementById('purchaseNotices').innerHTML=text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>`<li>${escapeText(line)}</li>`).join('');
  purchaseAgreement.nextElementSibling.textContent=storeSettings.purchaseAgreementText+' (필수)';
  privacyAgreement.nextElementSibling.textContent=storeSettings.privacyAgreementText+' (필수)';
  purchaseAgreement.checked=false;privacyAgreement.checked=false;updatePaymentAvailability();
}
function updatePaymentAvailability(){paymentButton.disabled=!(purchaseAgreement.checked&&privacyAgreement.checked);}
purchaseAgreement.addEventListener('change',updatePaymentAvailability);
privacyAgreement.addEventListener('change',updatePaymentAvailability);
checkoutForm.addEventListener('reset',()=>{paymentButton.disabled=true;});
const shippingFee=sub=>sub>0?storeSettings.shippingFee:0;
function cartValid(items){return Array.isArray(items)&&items.length>0&&items.every(x=>Number.isInteger(x.qty)&&x.qty>0&&canBuy(products.find(p=>p.id===x.id))&&products.find(p=>p.id===x.id).stock>=x.qty);}
// A product uses the same representative-image frame in both views.
productVisual=function(p,className='product-image'){
 const colors=['#f3ddd4','#e9e5df','#e1eadb'],background=colors[Math.abs(Number(p.id)||0)%3];
 return `<div class="${className}" style="background:${background}!important">${p.image?`<img src="${escapeText(p.image)}" alt="${escapeText(p.name)}">`:escapeText(p.art||'GOODS')}</div>`;
};
let catalogPage=1,customerOrdersPage=1;
function storePageRows(items,size,page,containerId,anchor,onChange){
  let container=document.getElementById(containerId);
  if(!container){container=document.createElement('nav');container.id=containerId;container.className='store-pagination';container.setAttribute('aria-label',containerId==='catalogPagination'?'상품 목록 페이지':'주문 목록 페이지');anchor.insertAdjacentElement('afterend',container);}
  const pages=Math.max(1,Math.ceil(items.length/size)),current=Math.max(1,Math.min(page,pages));
  container.hidden=items.length<=size;
  container.innerHTML=`<span>총 ${items.length}개 · ${current}/${pages}페이지</span><button type="button" data-page="${current-1}" ${current===1?'disabled':''}>이전</button><button type="button" data-page="${current+1}" ${current===pages?'disabled':''}>다음</button>`;
  container.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>onChange(Number(button.dataset.page)));
  return {page:current,rows:items.slice((current-1)*size,current*size)};
}
renderProducts=function(){const visibleProducts=products.filter(p=>!p.deletedAt&&p.status!=='hidden').sort((a,b)=>(Number(a.displayOrder)||Number.MAX_SAFE_INTEGER)-(Number(b.displayOrder)||Number.MAX_SAFE_INTEGER)||(Number(a.id)||0)-(Number(b.id)||0));const page=storePageRows(visibleProducts,24,catalogPage,'catalogPagination',productsEl,value=>{catalogPage=value;renderProducts();});catalogPage=page.page;productsEl.innerHTML=page.rows.map(p=>{return `<article class="product ${canBuy(p)?'':'soldout'}"><a class="product-link" href="#product/${p.id}">${productVisual(p)}<span class="badge">${canBuy(p)?'판매 중':'품절'}</span><div class="product-info"><h3>${escapeText(p.name)}</h3><div class="price">${won(p.price)}</div><span class="detail-hint">상품 소개 · 배송 안내 →</span></div></a></article>`;}).join('')||EmptyStates.html('products');updateSelection();};
function updateSelection(){const count=cart.reduce((sum,x)=>sum+x.qty,0);cartCount.textContent=count;cartToggle.hidden=count===0;if(!count){cartPanel.classList.remove('open');cartPanel.hidden=true;}}
const renderOriginalCart=renderCart;
renderCart=function(){const before=cart.length;cart=cart.filter(item=>canBuy(products.find(product=>product.id===item.id)));if(before!==cart.length){save();queueMicrotask(()=>showStoreToast('구매할 수 없는 상품이 장바구니에서 제외되었습니다.'));}cart.forEach(item=>{const product=products.find(p=>p.id===item.id);item.qty=Math.min(item.qty,product.stock);item.priceAtAdd=product.price;});save();renderOriginalCart();updateSelection();const sub=cart.reduce((sum,x)=>sum+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0);shipping.textContent=won(shippingFee(sub));total.textContent=won(sub+shippingFee(sub));};
cartToggle.onclick=()=>requireLogin(()=>{if(!cart.length)return;renderCart();cartPanel.hidden=false;cartPanel.classList.add('open');});

showProduct=function(id){location.hash='product/'+id;};
function renderProductPage(id){
  selected=products.find(p=>p.id===id&&!p.deletedAt&&p.status!=='hidden');
  if(!selected){productPage.innerHTML=EmptyStates.html('productMissing');return;}
  const p=selected,available=canBuy(p);
  document.title=p.name+' | 말마프렌즈 온라인 스토어';
  productPage.innerHTML=`<a class="back-link" href="#products">← 상품 목록</a><div class="product-layout">${productVisual(p,'detail-art')}<div class="purchase-info"><p class="eyebrow">OFFICIAL GOODS</p><h1 tabindex="-1">${escapeText(p.name)}</h1><p class="product-description">${escapeText(p.description||'렛츠런파크 공식 상품')}</p><p class="detail-price">${won(p.price)}</p><dl class="delivery-info"><div><dt>배송비</dt><dd>${won(storeSettings.shippingFee)} · 주문당 고정 배송비</dd></div><div><dt>판매 상태</dt><dd>${available?'판매 중':'품절'}</dd></div></dl><div class="product-selection-box"><div class="selection-item"><strong class="selection-name">${escapeText(p.name)}</strong><div class="selection-item-bottom"><div class="counter"><button type="button" id="quantityMinus" aria-label="수량 줄이기" disabled>−</button><output id="detailQty" aria-live="polite">${available?1:0}</output><button type="button" id="quantityPlus" aria-label="수량 늘리기" ${!available||p.stock<=1?'disabled':''}>+</button></div><strong id="detailLineTotal" aria-live="polite">${won(available?p.price:0)}</strong></div></div><div class="selection-totals"><strong>총 <span id="detailTotalQty" aria-live="polite">${available?1:0}</span>개</strong><div><span>총 상품 금액</span><strong id="detailTotal" aria-live="polite">${won(available?p.price:0)}</strong></div></div></div><div class="purchase-actions${available?'':' is-sold-out'}">${available?'<button class="outline" id="detailCart">장바구니에 담기</button><button class="primary" id="buyNow">바로 구매</button>':'<button type="button" class="sold-out-button" disabled>품절</button>'}</div></div></div><section class="product-information"><h2>상품 상세정보</h2><div class="product-rich-content">${p.detailHtml?ProductContent.sanitize(p.detailHtml):'<p>'+escapeText(p.description||'렛츠런파크 공식 상품')+'</p>'}</div><h2>배송 안내</h2><p>${escapeText(storeSettings.shippingNotice)}</p><p>배송비는 주문당 ${won(storeSettings.shippingFee)}입니다.</p><h2>취소 안내</h2><p>결제 후 ${storeSettings.cancelHours}시간 이내, 발송 전까지 주문 전체 취소가 가능합니다. 부분 취소·부분 환불은 지원하지 않습니다.</p></section>`;
  const policyHeading=productPage.querySelector('.product-information h2:last-of-type'),policyText=productPage.querySelector('.product-information p:last-child');
  policyHeading.textContent='취소·반품 안내';
  policyText.textContent=`결제 후 ${storeSettings.cancelHours}시간 이내, 운송장 등록 전까지 주문 전체 취소가 가능합니다. 운송장 등록 후 ${storeSettings.returnDays}일 이내에는 주문 전체 반품을 신청할 수 있습니다. 부분 취소·부분 반품은 지원하지 않으며 불량·오배송 등 법정 예외는 고객센터로 문의해 주세요.`;
  document.getElementById('quantityMinus').onclick=()=>detailQty(-1);
  document.getElementById('quantityPlus').onclick=()=>detailQty(1);
  if(available){
    document.getElementById('detailCart').onclick=addSelected;
    document.getElementById('buyNow').onclick=()=>startCheckout([{id:p.id,qty:Number(document.getElementById('detailQty').textContent)}],'direct');
  }
}
detailQty=function(delta){if(!canBuy(selected))return;const output=document.getElementById('detailQty');const qty=Math.min(selected.stock,Math.max(1,Number(output.textContent)+delta));output.textContent=qty;document.getElementById('detailTotal').textContent=won(selected.price*qty);document.getElementById('detailLineTotal').textContent=won(selected.price*qty);document.getElementById('detailTotalQty').textContent=qty;document.getElementById('quantityMinus').disabled=qty===1;document.getElementById('quantityPlus').disabled=qty>=selected.stock;};
let storeToastTimer;
function showStoreToast(message){const toast=document.getElementById('storeToast');clearTimeout(storeToastTimer);toast.textContent=message;toast.hidden=false;storeToastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent='';},2500);}
addSelected=function(){const id=selected.id,qty=Number(document.getElementById('detailQty').textContent);requireLogin(()=>{const p=products.find(p=>p.id===id);if(!canBuy(p))return;const existing=cart.find(x=>x.id===id);if(existing){existing.qty=Math.min(existing.qty+qty,p.stock);existing.priceAtAdd=p.price;}else cart.push({id,qty:Math.min(qty,p.stock),priceAtAdd:p.price});save();renderCart();renderProducts();showStoreToast('장바구니에 담겼어요');});};
function startCheckout(items,source){purchaseAgreement.checked=false;privacyAgreement.checked=false;paymentButton.disabled=true;if(!items.length)return alert('상품과 수량을 선택해 주세요.');requireLogin(()=>{checkoutDraft={items:items.map(x=>({...x,priceAtCheckout:products.find(p=>p.id===x.id)?.price})),source};sessionStorage.goodsCheckout=JSON.stringify(checkoutDraft);cartPanel.classList.remove('open');location.hash='checkout';});}
checkout.onclick=()=>startCheckout(cart,'cart');
function renderCheckoutPage(){
  renderPurchaseNotices();
  const valid=Array.isArray(checkoutDraft?.items)&&checkoutDraft.items.length>0&&checkoutDraft.items.every(x=>products.some(p=>p.id===x.id));checkoutForm.hidden=!valid;
  if(!valid){document.getElementById('checkoutSummary').innerHTML=EmptyStates.html('checkout');return;}
  const sub=checkoutDraft.items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=shippingFee(sub);
  document.getElementById('checkoutSummary').innerHTML=`<h2>주문 상품</h2>${checkoutDraft.items.map(x=>{const p=products.find(p=>p.id===x.id);return `<div class="checkout-item"><a href="#product/${p.id}">${escapeText(p.name)}</a><span>${x.qty}개 · ${won(p.price*x.qty)}</span></div>`;}).join('')}<dl class="cost-summary"><div><dt>상품 금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${ship?won(ship):'무료'}</dd></div><div class="grand-total"><dt>총 결제금액</dt><dd>${won(sub+ship)}</dd></div></dl>`;
}
checkoutForm.onsubmit=e=>{e.preventDefault();if(!purchaseAgreement.checked){purchaseAgreement.reportValidity();return;}if(!privacyAgreement.checked){privacyAgreement.reportValidity();return;}if(!checkoutForm.elements.address.value.trim()){document.getElementById('addressStatus').textContent='배송지 주소를 입력해 주세요.';document.getElementById('searchAddress').focus();return;}if(checkoutDraft?.items?.some(item=>item.priceAtCheckout!==products.find(p=>p.id===item.id)?.price)){checkoutDraft.items.forEach(item=>{item.priceAtCheckout=products.find(p=>p.id===item.id)?.price;});sessionStorage.goodsCheckout=JSON.stringify(checkoutDraft);renderCheckoutPage();return alert('상품 금액이 변경되었습니다. 변경된 주문 금액을 확인해 주세요.');}if(!cartValid(checkoutDraft?.items)){renderCheckoutPage();return alert('판매 상태나 재고가 변경되었습니다. 상품을 다시 선택해 주세요.');}requireLogin(()=>{
  if(!cartValid(checkoutDraft?.items))return renderCheckoutPage();
  const f=Object.fromEntries(new FormData(checkoutForm)),items=checkoutDraft.items.map(x=>({...x,name:products.find(p=>p.id===x.id).name,price:products.find(p=>p.id===x.id).price}));
  const sub=items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const approvedAt=Date.now(),order={...f,baseAddress:f.address,address:[f.address,f.detailAddress.trim()].filter(Boolean).join(' '),number:'G'+approvedAt,date:new Date(approvedAt).toLocaleDateString('ko-KR'),createdAt:approvedAt,approvedAt,cancelUntil:approvedAt+storeSettings.cancelHours*3600000,returnDays:storeSettings.returnDays,policySnapshot:{...storeSettings},items,subtotal:sub,shippingFee:shippingFee(sub),total:sub+shippingFee(sub),status:'출고 대기',purchaseConsent:{version:storeSettings.purchasePolicyVersion,text:storeSettings.purchaseAgreementText,notices:CheckoutContent.resolve(storeSettings.purchaseNoticesText,storeSettings),agreedAt:approvedAt},privacyConsent:{version:storeSettings.privacyPolicyVersion,text:storeSettings.privacyAgreementText,agreedAt:approvedAt},demo:true};
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
  if(isComplete){const order=orders.find(o=>o.number===hash.split('/')[1]);completePage.innerHTML=order?`<p class="eyebrow">ORDER COMPLETE</p><h1 tabindex="-1">주문이 완료되었습니다.</h1><p>주문 내역에서 배송 상태를 확인할 수 있습니다.</p><div class="completion-card"><p>주문번호 <strong>${escapeText(order.number)}</strong></p><p>${order.items.map(x=>escapeText(x.name)+' × '+x.qty).join(' · ')}</p><p>주문 금액 <strong>${won(order.total)}</strong></p></div><div class="completion-actions"><a class="outline" href="#orders">주문 내역 확인</a><a class="outline" href="#products">쇼핑 계속하기</a></div>`:EmptyStates.html('orderMissing');}
  if((isOrders||isCheckout||isComplete)&&!loginPreviewActive){requireLogin(()=>routeStore());document.getElementById('orders').hidden=true;checkoutPage.hidden=true;completePage.hidden=true;return;}
  if(isOrders){if(hash==='orders')customerOrdersPage=1;renderOrders();}
  if(isProduct||isCheckout||isComplete){window.scrollTo({top:0,behavior:"instant"});(isProduct?productPage:isCheckout?checkoutPage:completePage).querySelector('h1')?.focus({preventScroll:true});}
  else if(hash==='products')document.querySelector('.catalog').scrollIntoView();
  else window.scrollTo({top:0,behavior:"instant"});
}
function canCancel(o){return o.status==='출고 대기'&&!o.trackingNumber&&!o.returnStatus&&Date.now()<(o.cancelUntil||0);}
function carrierTrackingUrl(carrier,trackingNumber){const number=String(trackingNumber||'').replace(/[^0-9A-Za-z]/g,''),urls={'CJ대한통운':value=>`https://www.cjlogistics.com/ko/tool/parcel/newTracking?gnbInvcNo=${encodeURIComponent(value)}`,'한진택배':value=>`https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnum=${encodeURIComponent(value)}&wblnumText=`,'롯데택배':value=>`https://www.lotteglogis.com/home/reservation/tracking/invoiceView?InvNo=${encodeURIComponent(value)}`,'우체국택배':value=>`https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.postal?sid1=${encodeURIComponent(value)}`,'로젠택배':value=>`https://www.ilogen.com/web/personal/tkSearch?slipno=${encodeURIComponent(value)}`,'경동택배':value=>`https://kdexp.com/service/delivery/etc/delivery.do?barcode=${encodeURIComponent(value)}`,'대신택배':value=>`https://www.ds3211.co.kr/freight/internalFreightSearch.ht?billno=${encodeURIComponent(value)}`,'일양로지스':value=>`https://www.ilyanglogis.com/functionality/tracking_result.asp?hawb_no=${encodeURIComponent(value)}`,'천일택배':value=>`https://www.chunil.co.kr/HTrace/HTrace.jsp?transNo=${encodeURIComponent(value)}`,'합동택배':value=>`https://hdexp.co.kr/delivery_search.hd?barcode=${encodeURIComponent(value)}`,'CU 편의점택배':value=>`https://www.cupost.co.kr/postbox/delivery/localResult.cupost?invoice_no=${encodeURIComponent(value)}`,'GS Postbox':value=>`https://www.cvsnet.co.kr/invoice/tracking.do?invoice_no=${encodeURIComponent(value)}`,'DHL':value=>`https://www.dhl.com/kr-ko/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(value)}`,'FedEx':value=>`https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(value)}`,'UPS':value=>`https://www.ups.com/track?loc=ko_KR&tracknum=${encodeURIComponent(value)}`};if(urls[carrier])return urls[carrier](number);return `https://search.naver.com/search.naver?query=${encodeURIComponent(`${carrier||'택배'} ${number} 배송조회`)}`;}
function shipmentLookup(o){const url=carrierTrackingUrl(o.carrier,o.trackingNumber);return ['출고 완료','배송 완료'].includes(o.status)&&o.trackingNumber?`<div class="shipment-lookup"><a class="outline" href="${escapeText(url)}" target="_blank" rel="noopener noreferrer">배송조회 ↗</a><small>택배사와 송장번호가 입력된 조회 페이지가 열립니다.</small></div>`:'';}
function orderStatusLabel(o){return o.status==='출고 대기'?'배송 준비 중':o.status==='출고 완료'?'발송 완료':o.status==='전체 취소'?'취소 완료':o.status;}
function orderItemVisual(i){const p=products.find(p=>p.id===i.id);return p?.image?`<img src="${escapeText(p.image)}" alt="${escapeText(i.name)}" />`:`<span>${escapeText(p?.art||'GOODS')}</span>`;}
function orderPlacedAt(order){
 const timestamp=typeof order.createdAt==='number'?order.createdAt:Date.parse(order.createdAt||'');
 if(Number.isFinite(timestamp)&&timestamp>0)return timestamp;
 const match=String(order.date||'').match(/^(\d{4})[.\/-]\s*(\d{1,2})[.\/-]\s*(\d{1,2})/);
 if(match){const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));if(date.getFullYear()===Number(match[1])&&date.getMonth()===Number(match[2])-1&&date.getDate()===Number(match[3]))return date.getTime();}
 return 0;
}
function newestOrders(list){return [...list].sort((a,b)=>orderPlacedAt(b)-orderPlacedAt(a));}
renderOrders=function(){
  const detailNumber=location.hash.startsWith('#orders/')?decodeURIComponent(location.hash.slice(8)):null;
  const title=document.querySelector('#orders .section-head h2');
  title.textContent=detailNumber?'주문 상세':'주문 조회';
  const pager=document.getElementById('customerOrdersPagination');if(pager)pager.hidden=Boolean(detailNumber);if(!detailNumber){const page=storePageRows(newestOrders(orders),10,customerOrdersPage,'customerOrdersPagination',orderList,value=>{customerOrdersPage=value;renderOrders();});customerOrdersPage=page.page;orderList.innerHTML=page.rows.map(o=>`<article class="order-list-card"><div class="order-list-top"><div><p>${escapeText(o.date)}</p><strong>주문번호 ${escapeText(o.number)}</strong></div><span class="order-state ${o.status==='전체 취소'?'cancelled':''}">${escapeText(orderStatusLabel(o))}</span></div><div class="order-list-items">${o.items.map(i=>`<div class="order-preview-item"><div class="order-thumbnail">${orderItemVisual(i)}</div><div><strong>${escapeText(i.name)}</strong><p>수량 ${i.qty}개</p></div></div>`).join('')}</div><div class="order-list-bottom"><strong>${won(o.total)}</strong><a class="outline" href="#orders/${encodeURIComponent(o.number)}">주문 상세 보기 →</a></div></article>`).join('')||EmptyStates.html('orders');return;}
  const o=orders.find(o=>o.number===detailNumber);
  if(!o){orderList.innerHTML=EmptyStates.html('orderMissing');return;}
  const ship=o.shippingFee??storeSettings.shippingFee,sub=o.subtotal??o.total-ship;
  orderList.innerHTML=`<div class="order-detail"><a class="back-link" href="#orders">← 주문 목록</a><div class="order-detail-header order-info-card"><div><p>${escapeText(o.createdAt?new Date(o.createdAt).toLocaleString('ko-KR'):o.date)}</p><strong>주문번호 ${escapeText(o.number)}</strong></div><span class="order-state ${o.status==='전체 취소'?'cancelled':''}">${escapeText(orderStatusLabel(o))}</span></div><details class="order-section" open><summary>주문상품</summary><div class="order-info-card"><div class="order-store-label"><strong>말마프렌즈 온라인 스토어</strong><span>배송비 ${won(ship)}</span></div>${o.items.map(i=>`<div class="order-detail-item"><div class="order-thumbnail">${orderItemVisual(i)}</div><div><strong>${escapeText(i.name)}</strong><p>수량 ${i.qty}개</p><b>${i.price!=null?won(i.price*i.qty):'구매 금액은 결제정보에서 확인'}</b></div></div>`).join('')}<div class="order-delivery-line"><span>배송 상태</span><strong>${escapeText(orderStatusLabel(o))}</strong></div>${o.trackingNumber?`<div class="order-delivery-line"><span>${escapeText(o.carrier||'택배사')} · 운송장 번호</span><strong>${escapeText(o.trackingNumber)}</strong></div>`:''}${shipmentLookup(o)}<div class="order-action-area">${canCancel(o)?`<button class="outline" onclick="cancelOrder('${escapeText(o.number)}')">주문 전체 취소</button><p>${new Date(o.cancelUntil).toLocaleString('ko-KR')}까지, 발송 전 취소 가능</p>`:`<p>${o.status==='전체 취소'?'주문 전체가 취소되었습니다.':'현재 취소할 수 없는 주문입니다.'}</p>`}</div></div></details><section class="order-section"><h3>배송지</h3><div class="order-info-card order-address"><strong>${escapeText(o.recipient||o.name)}</strong><p>${escapeText(o.recipientPhone||o.phone)}</p><p>${escapeText(o.address)}${o.postcode?' ('+escapeText(o.postcode)+')':''}</p>${o.request?`<p class="order-memo">배송메모: ${escapeText(o.request)}</p>`:''}</div></section><details class="order-section" open><summary>결제정보</summary><div class="order-info-card"><dl class="order-payment"><div class="payment-total"><dt>주문금액</dt><dd>총 ${won(o.total)}</dd></div><div><dt>상품금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${won(ship)}</dd></div></dl><dl class="order-payment payment-method"><div><dt>결제수단</dt><dd>${escapeText(o.paymentMethod||'카드 결제')}</dd></div><div><dt>결제 상태</dt><dd>${o.status==='전체 취소'?'전액 취소 완료':'결제 완료'}</dd></div>${o.status==='전체 취소'?`<div class="refund-total"><dt>취소금액</dt><dd>${won(o.total)}</dd></div>`:''}</dl><p class="order-policy">부분 취소·부분 환불 없이 주문 전체 취소만 가능합니다.</p></div></details></div>`;
};

cancelOrder=function(num){requireLogin(()=>{const o=orders.find(o=>o.number===num);if(!o||!canCancel(o))return alert('취소 가능 시점이 지났거나 이미 처리된 주문입니다.');if(!confirm('주문한 모든 상품을 전액 취소하시겠습니까?'))return;if(o.inventoryApplied!==false)o.items.forEach(i=>{const p=products.find(p=>p.id===i.id);if(p)p.stock+=i.qty;});o.status='전체 취소';o.cancelledAt=Date.now();o.cancelCompletedAt=o.cancelledAt;save();renderProducts();renderOrders();renderAdmin();});};

function openReturnRequest(number){
  const order=orders.find(o=>o.number===number);
  if(!order||!canRequestReturn(order))return alert('현재 전체 반품을 신청할 수 없는 주문입니다.');
  activeReturnOrderNumber=number;returnForm.reset();
  document.getElementById('returnOrderNumber').textContent='주문번호 '+number;
  document.getElementById('returnFormError').textContent='';returnDialog.showModal();
}
returnForm.onsubmit=event=>{
  event.preventDefault();const error=document.getElementById('returnFormError'),order=orders.find(o=>o.number===activeReturnOrderNumber);
  if(!order||!canRequestReturn(order)){error.textContent='주문 상태가 변경되었습니다. 주문 내역을 다시 확인해 주세요.';return;}
  const form=Object.fromEntries(new FormData(returnForm));
  Object.assign(order,{returnStatus:'신청 완료',returnReason:form.returnReason,returnDetail:form.returnDetail.trim(),returnMethod:'고객 직접 반송(착불)',returnCarrier:'',returnTrackingNumber:'',returnRequestedAt:Date.now()});
  save();returnDialog.close();renderOrders();showStoreToast('반품 신청이 완료되었습니다. 상품 발송 후 운송장을 등록해 주세요.');
};

function openReturnTracking(number){
  const order=orders.find(o=>o.number===number);
  if(!order||order.returnStatus!=='신청 완료')return alert('운송장을 등록할 수 없는 주문입니다.');
  activeReturnOrderNumber=number;returnTrackingForm.reset();
  returnTrackingForm.elements.returnCarrier.value=order.returnCarrier||'';
  returnTrackingForm.elements.returnTrackingNumber.value=order.returnTrackingNumber||'';
  document.getElementById('returnTrackingOrderNumber').textContent='주문번호 '+number;
  document.getElementById('returnTrackingFormError').textContent='';
  returnTrackingForm.querySelector('button.primary').textContent=order.returnTrackingNumber?'운송장 수정':'운송장 등록';
  returnTrackingDialog.showModal();
}
returnTrackingForm.onsubmit=event=>{
  event.preventDefault();const error=document.getElementById('returnTrackingFormError'),order=orders.find(o=>o.number===activeReturnOrderNumber);
  if(!order||order.returnStatus!=='신청 완료'){error.textContent='반품 상태가 변경되었습니다. 주문 내역을 다시 확인해 주세요.';return;}
  const form=Object.fromEntries(new FormData(returnTrackingForm)),tracking=String(form.returnTrackingNumber||'').replace(/[\s-]/g,'');
  if(!/^[0-9A-Za-z]+$/.test(tracking)){error.textContent='반품 운송장 번호를 영문·숫자로 입력해 주세요.';return;}
  const isFirstRegistration=!order.returnTrackingNumber;
  if(isFirstRegistration&&!confirm('등록 후 운송장 정보는 삭제할 수 없으며 수정만 가능합니다. 등록하시겠습니까?'))return;
  Object.assign(order,{returnCarrier:form.returnCarrier,returnTrackingNumber:tracking,returnTrackingRegisteredAt:order.returnTrackingRegisteredAt||Date.now()});
  save();returnTrackingDialog.close();renderOrders();showStoreToast('반품 운송장 정보가 저장되었습니다.');
};
withdrawReturn=function(number){requireLogin(()=>{const order=orders.find(o=>o.number===number);if(!order||order.returnStatus!=='신청 완료')return alert('철회할 수 있는 반품 신청이 없습니다.');if(order.returnTrackingNumber)return alert('반품 운송장이 등록된 신청은 직접 철회할 수 없습니다. 고객센터로 문의해 주세요.');if(!confirm('전체 반품 신청을 철회하시겠습니까?'))return;const withdrawnAt=Date.now(),history={returnReason:order.returnReason||'',returnDetail:order.returnDetail||'',returnRequestedAt:order.returnRequestedAt||null,withdrawnAt};order.returnWithdrawalHistory=[...(order.returnWithdrawalHistory||[]),history];delete order.returnStatus;delete order.returnReason;delete order.returnDetail;delete order.returnMethod;delete order.returnCarrier;delete order.returnTrackingNumber;delete order.returnRequestedAt;delete order.returnTrackingRegisteredAt;order.returnWithdrawnAt=withdrawnAt;save();renderOrders();showStoreToast('반품 신청이 철회되었습니다.');});};

function returnRequestSummary(order){
  if(!order.returnStatus)return '';
  const requestedAt=order.returnRequestedAt?new Date(order.returnRequestedAt).toLocaleString('ko-KR'):'';
  const directTracking=order.returnTrackingNumber?`<div class="return-info-row"><span>반품 운송장</span><strong>${escapeText(order.returnCarrier)} · ${escapeText(order.returnTrackingNumber)}</strong><a class="outline" href="${escapeText(carrierTrackingUrl(order.returnCarrier,order.returnTrackingNumber))}" target="_blank" rel="noopener noreferrer">반품 배송조회 ↗</a></div>`:'';
  const nextStep=order.returnStatus==='신청 완료'?`<div class="return-next-step"><b>${order.returnTrackingNumber?'상품 도착을 확인하고 있습니다.':'이제 상품을 보내주세요.'}</b><div class="return-address"><span>반품 주소</span><br><strong>${escapeText(order.policySnapshot?.returnAddress??storeSettings.returnAddress)}</strong></div><p>주문 상품 전체를 착불로 보내주세요. 단순 변심은 최초·반품 배송비가 환불금에서 차감될 수 있습니다.</p><button type="button" class="outline" onclick="openReturnTracking('${escapeText(order.number)}')">${order.returnTrackingNumber?'반품 운송장 수정':'발송 후 운송장 등록'}</button>${order.returnTrackingNumber?'':`<button type="button" class="return-withdraw-button" onclick="withdrawReturn('${escapeText(order.number)}')">반품 신청 철회</button>`}</div><p class="return-waiting">${order.returnTrackingNumber?'상품 도착 및 확인 후 환불이 진행됩니다.':'운송장 등록 전에는 반품 신청을 철회할 수 있습니다.'}</p>`:'';
  const rejectedInfo=order.returnStatus==='반품 반려'?`<div class="customer-refund-note rejected"><b>반품이 반려되었습니다.</b><p>${escapeText(order.returnRejectReason||'반품이 어려운 상품 상태로 확인되었습니다. 자세한 내용은 고객센터로 문의해 주세요.')}</p><p>재신청과 재발송 처리는 고객센터를 통해 안내받아 주세요.</p></div>`:'';
  const refundInfo=order.returnStatus==='환불 완료'?`<div class="refund-breakdown"><div><span>결제금액</span><strong>${won(order.total)}</strong></div><div><span>배송비 차감</span><strong>${order.shippingDeduction?'-'+won(order.shippingDeduction):'차감 없음'}</strong></div><div class="refund-result"><span>최종 환불액</span><strong>${won(order.refundAmount??order.total)}</strong></div></div><div class="customer-refund-note"><b>환불 안내</b><p>${escapeText(order.customerRefundNote||'환불 처리가 완료되었습니다.')}</p>${order.customerRefundExtraNote?`<p>${escapeText(order.customerRefundExtraNote)}</p>`:''}</div>`:rejectedInfo||nextStep;
  return `<section class="order-section return-status-section"><h3>반품 · 환불</h3><div class="order-info-card"><div class="return-status-heading"><span class="order-state${customerOrderStateClass(order)}">${escapeText(order.returnStatus)}</span>${requestedAt?`<small>${escapeText(requestedAt)} 신청</small>`:''}</div><div class="return-info-row"><span>반품 사유</span><strong>${escapeText(order.returnReason||'—')}</strong></div><div class="return-info-row"><span>반송 방식</span><strong>고객 직접 반송(착불)</strong></div>${directTracking}${order.returnDetail?`<div class="return-detail"><span>상세 사유</span><p>${escapeText(order.returnDetail)}</p></div>`:''}${refundInfo}</div></section>`;
}

renderOrders=function(){
  const detailNumber=location.hash.startsWith('#orders/')?decodeURIComponent(location.hash.slice(8)):null,title=document.querySelector('#orders .section-head h2');title.textContent=detailNumber?'주문 상세':'주문 조회';
  const pager=document.getElementById('customerOrdersPagination');if(pager)pager.hidden=Boolean(detailNumber);if(!detailNumber){const page=storePageRows(newestOrders(orders),10,customerOrdersPage,'customerOrdersPagination',orderList,value=>{customerOrdersPage=value;renderOrders();});customerOrdersPage=page.page;orderList.innerHTML=page.rows.map(o=>`<article class="order-list-card"><div class="order-list-top"><div><p>${escapeText(o.date)}</p><strong>주문번호 ${escapeText(o.number)}</strong></div><span class="order-state${customerOrderStateClass(o)}">${escapeText(customerOrderState(o))}</span></div><div class="order-list-items">${o.items.map(i=>`<div class="order-preview-item"><div class="order-thumbnail">${orderItemVisual(i)}</div><div><strong>${escapeText(i.name+(i.deletedProduct?' (삭제된 상품)':''))}</strong><p>수량 ${i.qty}개</p></div></div>`).join('')}</div><div class="order-list-bottom"><strong>${won(o.returnStatus==='환불 완료'?(o.refundAmount??o.total):o.total)}</strong><a class="outline" href="#orders/${encodeURIComponent(o.number)}">주문 상세 보기 →</a></div></article>`).join('')||EmptyStates.html('orders');return;}
  const o=orders.find(order=>order.number===detailNumber);if(!o){orderList.innerHTML=EmptyStates.html('orderMissing');return;}
  const ship=o.shippingFee??storeSettings.shippingFee,sub=o.subtotal??o.total-ship;
  let orderAction='';
  if(canCancel(o))orderAction=`<button class="outline" onclick="cancelOrder('${escapeText(o.number)}')">주문 전체 취소</button><p>${new Date(o.cancelUntil).toLocaleString('ko-KR')}까지, 발송 전 취소 가능</p>`;
  else if(canRequestReturn(o))orderAction=`<button class="outline return-request-button" onclick="openReturnRequest('${escapeText(o.number)}')">전체 반품 신청</button><p>${new Date(returnDeadline(o)).toLocaleString('ko-KR')}까지 주문 상품과 수량 전체를 함께 반품할 수 있습니다.</p>`;
  else if(o.returnStatus==='신청 완료')orderAction='<p>반품 신청이 완료되었습니다. 아래 반품 안내에 따라 상품을 직접 보내주세요.</p>';
  else if(o.returnStatus==='환불 완료')orderAction='<p>전체 반품과 환불이 완료되었습니다.</p>';
  else if(o.returnStatus==='반품 반려')orderAction='<p>반품이 반려되었습니다. 재신청과 이후 처리는 고객센터로 문의해 주세요.</p>';
  else orderAction=`<p>${o.status==='전체 취소'?'주문 전체가 취소되었습니다.':o.trackingNumber&&!o.returnStatus&&returnDeadline(o)<=Date.now()?'반품 신청 기간이 지났습니다. 불량·오배송은 고객센터로 문의해 주세요.':'현재 취소하거나 반품할 수 없는 주문입니다.'}</p>`;
  const paymentState=o.status==='전체 취소'?'전액 취소 완료':o.returnStatus==='환불 완료'?'환불 완료':o.returnStatus==='신청 완료'?'반품 신청 완료':o.returnStatus==='반품 반려'?'결제 완료 · 반품 반려':'결제 완료';
  orderList.innerHTML=`<div class="order-detail"><a class="back-link" href="#orders">← 주문 목록</a><div class="order-detail-header order-info-card"><div><p>${escapeText(o.createdAt?new Date(o.createdAt).toLocaleString('ko-KR'):o.date)}</p><strong>주문번호 ${escapeText(o.number)}</strong></div><span class="order-state${customerOrderStateClass(o)}">${escapeText(customerOrderState(o))}</span></div><details class="order-section" open><summary>주문상품</summary><div class="order-info-card"><div class="order-store-label"><strong>말마프렌즈 온라인 스토어</strong><span>배송비 ${won(ship)}</span></div>${o.items.map(i=>`<div class="order-detail-item"><div class="order-thumbnail">${orderItemVisual(i)}</div><div><strong>${escapeText(i.name+(i.deletedProduct?' (삭제된 상품)':''))}</strong><p>수량 ${i.qty}개</p><b>${i.price!=null?won(i.price*i.qty):'구매 금액은 결제정보에서 확인'}</b></div></div>`).join('')}<div class="order-delivery-line"><span>배송 상태</span><strong>${escapeText(orderStatusLabel(o))}</strong></div>${o.trackingNumber?`<div class="order-delivery-line"><span>${escapeText(o.carrier||'택배사')} · 운송장 번호</span><strong>${escapeText(o.trackingNumber)}</strong></div>`:''}${shipmentLookup(o)}<div class="order-action-area">${orderAction}</div></div></details>${returnRequestSummary(o)}<section class="order-section"><h3>배송지</h3><div class="order-info-card order-address"><strong>${escapeText(o.recipient||o.name)}</strong><p>${escapeText(o.recipientPhone||o.phone)}</p><p>${escapeText(o.address)}${o.postcode?' ('+escapeText(o.postcode)+')':''}</p>${o.request?`<p class="order-memo">배송메모: ${escapeText(o.request)}</p>`:''}</div></section><details class="order-section" open><summary>결제정보</summary><div class="order-info-card"><dl class="order-payment"><div class="payment-total"><dt>주문금액</dt><dd>총 ${won(o.total)}</dd></div><div><dt>상품금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${won(ship)}</dd></div></dl><dl class="order-payment payment-method"><div><dt>결제수단</dt><dd>${escapeText(o.paymentMethod||'카드 결제')}</dd></div><div><dt>결제 상태</dt><dd>${paymentState}</dd></div>${o.status==='전체 취소'?`<div class="refund-total"><dt>취소금액</dt><dd>${won(o.total)}</dd></div>`:o.returnStatus==='환불 완료'?`<div class="refund-total"><dt>환불금액</dt><dd>${won(o.refundAmount??o.total)}</dd></div>`:''}</dl><p class="order-policy">반품은 주문 전체 단위로만 가능하며 일부 상품·수량의 부분 환불은 지원하지 않습니다.</p></div></details></div>`;
};
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
function seedReturnExamples(){
  if(localStorage.goodsReturnExampleVersion==='3')return;
  const now=Date.now(),day=86400000,requested=orders.find(o=>o.number==='G-EXAMPLE-1002');
  if(requested)Object.assign(requested,{status:'출고 완료',returnStatus:'신청 완료',returnReason:'단순 변심',returnDetail:'상품을 확인했으나 생각했던 크기와 달라 전체 반품을 요청합니다.',returnMethod:'고객 직접 반송(착불)',returnCarrier:'',returnTrackingNumber:'',returnRequestedAt:now-2*day});
  if(!orders.some(o=>o.number==='G-EXAMPLE-1004'))orders.push({name:'정말마',phone:'010-0000-0000',recipient:'정말마',recipientPhone:'010-0000-0000',address:'서울특별시 중구 세종대로 110, 수령처',number:'G-EXAMPLE-1004',createdAt:now-3*day,date:new Date(now-3*day).toLocaleDateString('ko-KR'),status:'출고 완료',carrier:'CJ대한통운',trackingNumber:'777788889999',items:[{id:5,name:'말마 인형 키링',price:12000,qty:2}],subtotal:24000,shippingFee:storeSettings.shippingFee,total:24000+storeSettings.shippingFee,inventoryApplied:false});
  if(!orders.some(o=>o.number==='G-EXAMPLE-1000'))orders.push({name:'최말마',phone:'010-0000-0000',recipient:'최말마',recipientPhone:'010-0000-0000',address:'제주특별자치도 제주시 애월읍 평화로 2144',number:'G-EXAMPLE-1000',createdAt:now-14*day,date:new Date(now-14*day).toLocaleDateString('ko-KR'),status:'출고 완료',carrier:'우체국택배',trackingNumber:'111122223333',items:[{id:4,name:'말마 미니 인형',price:19000,qty:2}],subtotal:38000,shippingFee:storeSettings.shippingFee,total:38000+storeSettings.shippingFee,inventoryApplied:false,returnStatus:'환불 완료',returnReason:'상품 불량·파손',returnDetail:'상품 포장이 훼손된 상태로 배송되었습니다.',returnMethod:'고객 직접 반송(착불)',returnCarrier:'우체국택배',returnTrackingNumber:'444455556666',returnRequestedAt:now-12*day,shippingDeduction:0,refundAmount:38000+storeSettings.shippingFee,customerRefundNote:'상품 파손으로 확인되어 반품 배송비 차감 없이 결제금액 전액을 환불해 드렸습니다.',refundCompletedAt:now-10*day});
  orders.forEach(order=>{if(order.returnStatus&&['수거 접수','직접 발송'].includes(order.returnMethod))order.returnMethod='고객 직접 반송(착불)';});
  orders.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));save();localStorage.goodsReturnExampleVersion='3';
}
seedReturnExamples();
window.addEventListener('hashchange',routeStore);renderProducts();routeStore();

// Keep the open store in sync with product edits from the administrator tab.
window.addEventListener('storage',event=>{if(event.key!=='goodsProducts')return;try{const updated=JSON.parse(event.newValue);if(!Array.isArray(updated))return;products=updated;renderProducts();if(location.hash.startsWith('#product/'))renderProductPage(Number(location.hash.split('/')[1]));}catch{}});
window.addEventListener('storage',event=>{if(event.key!=='goodsOrders')return;try{const updated=JSON.parse(event.newValue);if(!Array.isArray(updated))return;orders=updated;if(location.hash==='#orders'||location.hash.startsWith('#orders/'))renderOrders();}catch{}});
window.addEventListener('storage',event=>{if(event.key!=='goodsSettings')return;try{Object.assign(storeSettings,{...CheckoutContent.defaults,shippingFee:3000,returnShippingFee:6000,cancelHours:24,returnDays:14,...JSON.parse(event.newValue||'{}')});renderPurchaseNotices();if(location.hash.startsWith('#product/'))renderProductPage(Number(location.hash.split('/')[1]));if(location.hash==='#orders'||location.hash.startsWith('#orders/'))renderOrders();}catch{}});
