const checkoutForm=document.getElementById("checkoutForm");
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
let selectedDiscountId='',displayedDiscountQuote=null;
let checkoutDraft=JSON.parse(sessionStorage.goodsCheckout||'null');
const purchaseAgreement=document.getElementById('purchaseAgreement');
const privacyAgreement=document.getElementById('privacyAgreement');
const paymentButton=checkoutForm.querySelector('button.primary');
function renderPurchaseNotices(){
  const text=String(storeSettings.purchaseNoticesText ?? '');
  document.getElementById('purchaseNotices').textContent=text;
  purchaseAgreement.nextElementSibling.replaceChildren(document.createTextNode(CheckoutContent.consent.purchaseText+' '),Object.assign(document.createElement('strong'),{textContent:'(필수)'}));
  privacyAgreement.nextElementSibling.replaceChildren(document.createTextNode(CheckoutContent.consent.privacyText+' '),Object.assign(document.createElement('strong'),{textContent:'(필수)'}));
  purchaseAgreement.checked=false;privacyAgreement.checked=false;updatePaymentAvailability();
}
function updatePaymentAvailability(){paymentButton.disabled=!(purchaseAgreement.checked&&privacyAgreement.checked);}
purchaseAgreement.addEventListener('change',updatePaymentAvailability);
privacyAgreement.addEventListener('change',updatePaymentAvailability);
checkoutForm.addEventListener('reset',()=>{paymentButton.disabled=true;});
function currentDiscountQuote(){return GoodsDiscounts.quote(selectedDiscountId,checkoutDraft?.items||[],products);}
function renderDiscountSelector(){
 const offers=GoodsDiscounts.read().map(policy=>({policy,...GoodsDiscounts.calculate(policy,checkoutDraft.items,products)})).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount);
 const quote=currentDiscountQuote();displayedDiscountQuote=JSON.stringify(quote);
 return `<fieldset class="checkout-discount discount-options"><legend>할인 선택</legend><label class="discount-check"><input type="radio" name="checkoutDiscount" value="" ${!selectedDiscountId?'checked':''}><span class="discount-option-copy"><strong>할인 미적용</strong></span></label>${offers.map(({policy:d})=>`<label class="discount-check"><input type="radio" name="checkoutDiscount" value="${escapeText(d.id)}" ${d.id===selectedDiscountId?'checked':''}><span class="discount-option-copy"><strong>${escapeText(d.name)} · ${d.type==='percent'?d.value+'%':won(d.value)} 할인</strong>${d.noticeText?`<small class="discount-option-notice">${escapeText(d.noticeText)}</small>`:''}</span><span class="discount-limit-badge">최대 ${d.maxQty}개 적용 가능</span></label>`).join('')}${offers.length?'':'<p class="discount-help">적용 가능한 할인이 없습니다.</p>'}</fieldset>`;
}
function renderCheckoutPage(){
  renderPurchaseNotices();
  const valid=Array.isArray(checkoutDraft?.items)&&checkoutDraft.items.length>0&&checkoutDraft.items.every(x=>products.some(p=>p.id===x.id));checkoutForm.hidden=!valid;
  if(!valid){document.getElementById('checkoutSummary').innerHTML=EmptyStates.html('checkout');return;}
  if(selectedDiscountId&&!currentDiscountQuote().amount)selectedDiscountId='';
  const discount=currentDiscountQuote();
  const sub=checkoutDraft.items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=shippingFee(sub);
  document.getElementById('checkoutSummary').innerHTML=`<h2>주문 상품</h2>${checkoutDraft.items.map(x=>{const p=products.find(p=>p.id===x.id),applied=discount.allocations.find(a=>a.id===x.id);return `<div class="checkout-item checkout-item-detail"><div class="checkout-product-heading"><a href="product.html?id=${p.id}">${escapeText(p.name)}</a><span>${x.qty}개</span></div><p class="checkout-unit-price">개당 ${won(p.price)}</p>${applied?`<p class="checkout-discount-condition">${discount.policy.type==='percent'?discount.policy.value+'%':won(applied.unitDiscount)} 할인 적용 ${applied.qty}개${x.qty>applied.qty?` · 정상가 ${x.qty-applied.qty}개`:''}</p>`:''}</div>`;}).join('')}<dl class="cost-summary"><div><dt>상품 금액</dt><dd>${won(sub)}</dd></div><div class="discount-savings"><dt>할인금액</dt><dd>${discount.amount?'−':''}${won(discount.amount)}</dd></div><div><dt>배송비</dt><dd>${ship?won(ship):'무료'}</dd></div><div class="grand-total"><dt>총 결제금액</dt><dd>${won(sub+ship-discount.amount)}</dd></div></dl>`;
  document.getElementById('checkoutDiscountArea').innerHTML=renderDiscountSelector();
  document.querySelectorAll('input[name="checkoutDiscount"]').forEach(input=>{input.onchange=()=>{selectedDiscountId=input.value;renderCheckoutPage();document.querySelector('input[name="checkoutDiscount"]:checked')?.focus();};});
}
checkoutForm.onsubmit=e=>{e.preventDefault();products=JSON.parse(localStorage.goodsProducts||JSON.stringify(products));orders=JSON.parse(localStorage.goodsOrders||JSON.stringify(orders));if(!purchaseAgreement.checked){purchaseAgreement.reportValidity();return;}if(!privacyAgreement.checked){privacyAgreement.reportValidity();return;}if(!checkoutForm.elements.address.value.trim()){document.getElementById('addressStatus').textContent='배송지 주소를 입력해 주세요.';document.getElementById('searchAddress').focus();return;}if(checkoutDraft?.items?.some(item=>item.priceAtCheckout!==products.find(p=>p.id===item.id)?.price)){checkoutDraft.items.forEach(item=>{item.priceAtCheckout=products.find(p=>p.id===item.id)?.price;});sessionStorage.goodsCheckout=JSON.stringify(checkoutDraft);renderCheckoutPage();return alert('상품 금액이 변경되었습니다. 변경된 주문 금액을 확인해 주세요.');}if(!cartValid(checkoutDraft?.items)){renderCheckoutPage();return alert('판매 상태나 재고가 변경되었습니다. 상품을 다시 선택해 주세요.');}requireLogin(()=>{
  if(!cartValid(checkoutDraft?.items))return renderCheckoutPage();
  const f=Object.fromEntries(new FormData(checkoutForm)),items=checkoutDraft.items.map(x=>({...x,name:products.find(p=>p.id===x.id).name,price:products.find(p=>p.id===x.id).price}));
  const sub=items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const discount=currentDiscountQuote();
  if(JSON.stringify(discount)!==displayedDiscountQuote){renderCheckoutPage();return alert('할인 조건이 변경되었거나 종료되었습니다. 결제금액을 다시 확인해 주세요.');}
  items.forEach(item=>{const applied=discount.allocations.find(x=>x.id===item.id);item.discountAmount=applied?.amount||0;item.discountQty=applied?.qty||0;});
  const approvedAt=Date.now(),order={...f,baseAddress:f.address,address:[f.address,f.detailAddress.trim()].filter(Boolean).join(' '),number:CheckoutContent.nextOrderNumber(approvedAt,orders),date:new Date(approvedAt).toLocaleDateString('ko-KR'),createdAt:approvedAt,approvedAt,cancelUntil:approvedAt+storeSettings.cancelHours*3600000,returnDays:storeSettings.returnDays,policySnapshot:{...storeSettings},items,subtotal:sub,shippingFee:shippingFee(sub),total:sub+shippingFee(sub)-discount.amount,discountAmount:discount.amount,discountSnapshot:discount.policy,discountAllocations:discount.allocations,status:'출고 대기',purchaseConsent:{version:storeSettings.purchasePolicyVersion,agreementVersion:CheckoutContent.consent.purchaseVersion,text:CheckoutContent.consent.purchaseText,notices:String(storeSettings.purchaseNoticesText ?? ''),agreedAt:approvedAt},privacyConsent:{version:CheckoutContent.consent.privacyVersion,text:CheckoutContent.consent.privacyText,agreedAt:approvedAt},demo:true};
  items.forEach(x=>{const p=products.find(p=>p.id===x.id);Inventory.change(p,-x.qty,'주문 결제','고객',order.number+':purchase');});
  if(checkoutDraft.source==='cart'){cart=cart.map(x=>({...x,qty:x.qty-(items.find(i=>i.id===x.id)?.qty||0)})).filter(x=>x.qty>0);}
  orders.unshift(order);checkoutDraft=null;sessionStorage.removeItem('goodsCheckout');save();renderCart();checkoutForm.reset();StorePages.go('complete/'+order.number);
});};

requireLogin(renderCheckoutPage);window.addEventListener("store-data-change",renderCheckoutPage);

window.addEventListener('storage',event=>{if(event.key===GoodsDiscounts.key)renderCheckoutPage();});
