const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
const source=read('checkout.js');
function harness() {
 const nodes=new Map(),purchase={checked:false,nextElementSibling:{},addEventListener(){},reportValidity(){this.invalid=true;}},privacy={checked:false,nextElementSibling:{},addEventListener(){},reportValidity(){this.invalid=true;}};
 const ctx={purchaseAgreement:purchase,privacyAgreement:privacy,paymentButton:{disabled:true},storeSettings:{purchaseNoticesText:'안내',purchaseAgreementText:'OLD ADMIN PURCHASE',privacyAgreementText:'OLD ADMIN PRIVACY'},
  document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:''});return nodes.get(id);}},escapeText:String,
  checkoutForm:{elements:{address:{value:'배송지'}},addEventListener(){}},products:[{id:1,price:100}],orders:[],checkoutDraft:{items:[{id:1,priceAtCheckout:100}]},
  localStorage:{},sessionStorage:{},cartValid:()=>true,renderCheckoutPage(){},alert(){},requireLogin(){ctx.ready=true;}};
 vm.createContext(ctx);vm.runInContext(read('checkout-content.js')+'\nglobalThis.CheckoutContent=CheckoutContent;',ctx);
 vm.runInContext(source.slice(source.indexOf('function renderPurchaseNotices()'),source.indexOf('function renderCheckoutPage()')),ctx);
 vm.runInContext(source.slice(source.indexOf('checkoutForm.onsubmit='),source.indexOf('requireLogin(renderCheckoutPage);')),ctx);
 return ctx;
}
test('checkout fixed consent text ignores old administrator wording and starts unchecked',()=>{
 const c=harness();c.purchaseAgreement.checked=true;c.privacyAgreement.checked=true;c.renderPurchaseNotices();
 assert.equal(c.purchaseAgreement.checked,false);assert.equal(c.privacyAgreement.checked,false);assert.equal(c.paymentButton.disabled,true);
 assert.equal(c.purchaseAgreement.nextElementSibling.textContent,'구매 전 확인사항을 확인하고 동의합니다. (필수)');
 assert.equal(c.privacyAgreement.nextElementSibling.textContent,'주문 및 배송을 위한 개인정보 수집·이용에 동의합니다. (필수)');
});
test('both consents are required for the payment button and for submitting the order',()=>{
 for(const [purchase,privacy] of [[false,false],[true,false],[false,true],[true,true]]) {
  const c=harness();c.purchaseAgreement.checked=purchase;c.privacyAgreement.checked=privacy;c.updatePaymentAvailability();
  assert.equal(c.paymentButton.disabled,!(purchase&&privacy));c.checkoutForm.onsubmit({preventDefault(){}});assert.equal(!!c.ready,purchase&&privacy);
 }
});
test('administrator no longer edits consent wording and customer checkout retains two required checkboxes',()=>{
 const admin=read('admin-settings.html'),checkout=read('checkout.html');
 assert.doesNotMatch(admin,/name="purchaseAgreementText"|name="privacyAgreementText"/);
 assert.match(admin,/name="purchaseNoticesText"/);
 for(const id of ['purchaseAgreement','privacyAgreement'])assert.match(checkout,new RegExp('id="'+id+'"[^>]*required'));
 assert.match(source,/text:CheckoutContent\.consent\.purchaseText/);assert.match(source,/text:CheckoutContent\.consent\.privacyText/);
});

test('purchase notices display typed braces literally without using numeric settings',()=>{
 const c=harness();
 c.storeSettings.purchaseNoticesText='  배송비는 직접 입력합니다.\n\n{배송비}\n{취소시간}\n<script>문자 그대로</script>';
 c.storeSettings.shippingFee=9000;c.renderPurchaseNotices();
 assert.equal(c.document.getElementById('purchaseNotices').textContent,c.storeSettings.purchaseNoticesText);
 assert.equal(c.document.getElementById('purchaseNotices').innerHTML,'');
 assert.doesNotMatch(c.CheckoutContent.defaults.purchaseNoticesText,/\{.*?\}/);
 assert.doesNotMatch(source,/CheckoutContent\.resolve/);
});

test('saved legacy notices convert once and later plain text remains literal',()=>{
 const c=harness();
 const legacy={purchaseNoticesText:'{배송안내}\n{배송비} / {취소시간}시간 / {반품기간}일',shippingNotice:'매주 발송',shippingFee:5000,cancelHours:12,returnDays:7};
 const converted=c.CheckoutContent.migrateLegacySettings(legacy);
 assert.equal(converted.purchaseNoticesText,'매주 발송\n5,000원 / 12시간 / 7일');
 converted.purchaseNoticesText='{배송비} 직접 작성';
 assert.equal(c.CheckoutContent.migrateLegacySettings(converted).purchaseNoticesText,'{배송비} 직접 작성');
 const ctx={localStorage:{goodsSettings:JSON.stringify(legacy)}};
 vm.createContext(ctx);vm.runInContext(read('checkout-content.js'),ctx);
 assert.equal(JSON.parse(ctx.localStorage.goodsSettings).purchaseNoticesText,'매주 발송\n5,000원 / 12시간 / 7일');
});
