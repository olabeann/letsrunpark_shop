const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
const shipping=read('admin-orders.js');
const register=shipping.slice(shipping.indexOf('function saveRowInvoice'),shipping.indexOf('function renderOrders'));
function shippingContext(confirmResult=true){
 const error={textContent:''},input={value:' TEST-12345 '},carrier={value:'CJ대한통운'};
 const order={number:'TEST-ORDER',status:'출고 대기',total:32000,items:[{id:1,qty:1}]};
 const row={dataset:{number:order.number},querySelector:selector=>({' .invoice-row-error':error,'.invoice-row-error':error,'.tracking-input':input,'.invoice-carrier':carrier})[selector]};
 const context={orderData:[order],settings:{returnDays:14},normalizeTracking:value=>String(value||'').replace(/[\s-]/g,''),confirm:()=>confirmResult,Date,renderOrders(){},saveAll(){this.saved=true;},notify(){}};
 vm.createContext(context);vm.runInContext(register,context);
 return {context,row,order,input,error};
}
test('first shipment records tracking, preserves order values and locks the shipment time',()=>{
 const {context,row,order,input}=shippingContext();context.saveRowInvoice(row);
 assert.equal(order.status,'출고 완료');assert.equal(order.trackingNumber,'TEST12345');assert.ok(order.shippedAt);
 assert.equal(order.total,32000);assert.equal(order.items[0].qty,1);
 const shippedAt=order.shippedAt;input.value='UPDATED12345';context.saveRowInvoice(row);
 assert.equal(order.shippedAt,shippedAt);assert.equal(order.trackingNumber,'UPDATED12345');
});
test('cancelled confirmation and blank tracking do not ship an order',()=>{
 const {context,row,order,input,error}=shippingContext(false);context.saveRowInvoice(row);assert.equal(order.status,'출고 대기');
 input.value=' ';context.saveRowInvoice(row);assert.equal(order.status,'출고 대기');assert.ok(error.textContent);
});
test('checkout draft travels between documents without carrying agreement state',()=>{
 const common=read('store-common.js');const start=common.slice(common.indexOf('function startCheckout'),common.indexOf('cartToggle.onclick'));
 const context={products:[{id:1,price:29000,stock:3,status:'sale'}],sessionStorage:{},cartValid:items=>items.length>0,requireLogin:action=>action(),StorePages:{go(route){this.route=route;}},alert(){}};
 vm.createContext(context);vm.runInContext(start,context);context.startCheckout([{id:1,qty:2}],'cart');
 assert.equal(context.StorePages.route,'checkout');assert.deepEqual(JSON.parse(context.sessionStorage.goodsCheckout),{items:[{id:1,qty:2,priceAtCheckout:29000}],source:'cart'});
 assert.ok(!context.sessionStorage.goodsCheckout.includes('Agreement'));
});
function settingsContext(values){
 const defaults={shippingFee:3000,returnShippingFee:6000,cancelHours:24,returnDays:14,shippingNotice:'배송 안내',returnAddress:'반품 주소',purchaseNoticesText:'구매 안내',purchaseAgreementText:'구매 동의',privacyAgreementText:'개인정보 동의',purchasePolicyVersion:'old-purchase',privacyPolicyVersion:'old-privacy'};
 const elements=Object.fromEntries(Object.entries({...defaults,defaultCarrier:'CJ대한통운'}).map(([key,value])=>[key,{value,focus(){}}]));
 const form={elements},status={textContent:''};
 const context={document:{getElementById:id=>id==='inlineSettingsForm'?form:status},settings:{...defaults},carrierNames:['CJ대한통운'],orderData:[{number:'ORDER',returnDays:14}],localStorage:{},Date,persist(){context.saved=JSON.parse(JSON.stringify(context.settings));},FormData:class{*[Symbol.iterator](){yield* Object.entries(values);}}};
 vm.createContext(context);vm.runInContext(read('admin-settings.js'),context);
 return {context,form,status,defaults};
}
test('settings save snapshots existing order policy before applying new defaults',()=>{
 const values={shippingFee:'4000',returnShippingFee:'8000',cancelHours:'24',returnDays:'21',shippingNotice:'배송 안내',returnAddress:'반품 주소',purchaseNoticesText:'구매 안내',purchaseAgreementText:'구매 동의',privacyAgreementText:'개인정보 동의',defaultCarrier:'CJ대한통운'};
 const {context,form}=settingsContext(values);form.onsubmit({preventDefault(){}});
 assert.equal(context.saved.shippingFee,4000);assert.equal(context.saved.returnDays,21);
 assert.equal(context.orderData[0].policySnapshot.shippingFee,3000);assert.equal(context.orderData[0].returnDays,14);
});
test('invalid settings do not partially save or rewrite existing order policy',()=>{
 const values={shippingFee:'-1',returnShippingFee:'8000',cancelHours:'24',returnDays:'21'};
 const {context,form,status}=settingsContext(values);form.onsubmit({preventDefault(){}});
 assert.equal(context.saved,undefined);assert.equal(context.orderData[0].policySnapshot,undefined);assert.ok(status.textContent);
});
