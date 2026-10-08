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
let checkoutDraft=JSON.parse(sessionStorage.goodsCheckout||'null');
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
function renderCheckoutPage(){
  renderPurchaseNotices();
  const valid=Array.isArray(checkoutDraft?.items)&&checkoutDraft.items.length>0&&checkoutDraft.items.every(x=>products.some(p=>p.id===x.id));checkoutForm.hidden=!valid;
  if(!valid){document.getElementById('checkoutSummary').innerHTML=EmptyStates.html('checkout');return;}
  const sub=checkoutDraft.items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0),ship=shippingFee(sub);
  document.getElementById('checkoutSummary').innerHTML=`<h2>주문 상품</h2>${checkoutDraft.items.map(x=>{const p=products.find(p=>p.id===x.id);return `<div class="checkout-item"><a href="product.html?id=${p.id}">${escapeText(p.name)}</a><span>${x.qty}개 · ${won(p.price*x.qty)}</span></div>`;}).join('')}<dl class="cost-summary"><div><dt>상품 금액</dt><dd>${won(sub)}</dd></div><div><dt>배송비</dt><dd>${ship?won(ship):'무료'}</dd></div><div class="grand-total"><dt>총 결제금액</dt><dd>${won(sub+ship)}</dd></div></dl>`;
}
checkoutForm.onsubmit=e=>{e.preventDefault();if(!purchaseAgreement.checked){purchaseAgreement.reportValidity();return;}if(!privacyAgreement.checked){privacyAgreement.reportValidity();return;}if(!checkoutForm.elements.address.value.trim()){document.getElementById('addressStatus').textContent='배송지 주소를 입력해 주세요.';document.getElementById('searchAddress').focus();return;}if(checkoutDraft?.items?.some(item=>item.priceAtCheckout!==products.find(p=>p.id===item.id)?.price)){checkoutDraft.items.forEach(item=>{item.priceAtCheckout=products.find(p=>p.id===item.id)?.price;});sessionStorage.goodsCheckout=JSON.stringify(checkoutDraft);renderCheckoutPage();return alert('상품 금액이 변경되었습니다. 변경된 주문 금액을 확인해 주세요.');}if(!cartValid(checkoutDraft?.items)){renderCheckoutPage();return alert('판매 상태나 재고가 변경되었습니다. 상품을 다시 선택해 주세요.');}requireLogin(()=>{
  if(!cartValid(checkoutDraft?.items))return renderCheckoutPage();
  const f=Object.fromEntries(new FormData(checkoutForm)),items=checkoutDraft.items.map(x=>({...x,name:products.find(p=>p.id===x.id).name,price:products.find(p=>p.id===x.id).price}));
  const sub=items.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const approvedAt=Date.now(),order={...f,baseAddress:f.address,address:[f.address,f.detailAddress.trim()].filter(Boolean).join(' '),number:CheckoutContent.nextOrderNumber(approvedAt,orders),date:new Date(approvedAt).toLocaleDateString('ko-KR'),createdAt:approvedAt,approvedAt,cancelUntil:approvedAt+storeSettings.cancelHours*3600000,returnDays:storeSettings.returnDays,policySnapshot:{...storeSettings},items,subtotal:sub,shippingFee:shippingFee(sub),total:sub+shippingFee(sub),status:'출고 대기',purchaseConsent:{version:storeSettings.purchasePolicyVersion,text:storeSettings.purchaseAgreementText,notices:CheckoutContent.resolve(storeSettings.purchaseNoticesText,storeSettings),agreedAt:approvedAt},privacyConsent:{version:storeSettings.privacyPolicyVersion,text:storeSettings.privacyAgreementText,agreedAt:approvedAt},demo:true};
  items.forEach(x=>{const p=products.find(p=>p.id===x.id);p.stock-=x.qty;if(!p.stock)p.status='soldout';});
  if(checkoutDraft.source==='cart'){cart=cart.map(x=>({...x,qty:x.qty-(items.find(i=>i.id===x.id)?.qty||0)})).filter(x=>x.qty>0);}
  orders.unshift(order);checkoutDraft=null;sessionStorage.removeItem('goodsCheckout');save();renderCart();checkoutForm.reset();StorePages.go('complete/'+order.number);
});};

requireLogin(renderCheckoutPage);window.addEventListener("store-data-change",renderCheckoutPage);
