const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
const common=read('admin-common.js'),orders=read('admin-orders.js'),detail=read('admin-order-detail.js');
function harness(data=[]) {
 const nodes=new Map();
 const ctx={URLSearchParams,orderData:data,detailOrder:null,salesTab:'orders',shippingStage:'pending',
  $(id){if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',open:false,addEventListener(){},showModal(){this.open=true;}});return nodes.get(id);},
  day:value=>String(value||''),esc:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money:n=>`${n}원`,dateText:()=>'',trackingLookupUrl:(carrier,number)=>'https://example.test/track?number='+encodeURIComponent(number),bindClose(){}};
 vm.createContext(ctx);
 vm.runInContext(common.slice(common.indexOf('function paymentStateKey('),common.indexOf('function persist('))+'\nglobalThis.state=state;',ctx);
 vm.runInContext(orders.slice(orders.indexOf('function filteredOrders ('),orders.indexOf('function invoiceCell (')),ctx);
 vm.runInContext(read('admin-order-view.js'),ctx);
 vm.runInContext(detail.slice(detail.indexOf('function showDetail ('),detail.indexOf('function refundDefault(')),ctx);
 return ctx;
}
const cases=[
 ['normal',{status:'출고 대기'},'결제 완료','배송 준비 중','해당 없음'],
 ['return request',{status:'출고 완료',returnStatus:'신청 완료'},'결제 완료','발송 완료','반품 신청 완료'],
 ['return rejected',{status:'출고 완료',returnStatus:'반품 반려'},'결제 완료','발송 완료','반품 반려'],
 ['return fully refunded',{status:'출고 완료',returnStatus:'환불 완료',refundAmount:100},'전액 환불 완료','발송 완료','반품 처리 완료'],
 ['return shipping deduction',{status:'출고 완료',returnStatus:'환불 완료',refundAmount:80,shippingDeduction:20},'환불 완료','발송 완료','반품 처리 완료'],
 ['exception refund',{status:'출고 완료',returnStatus:'환불 완료',refundKind:'관리자 예외 환불',refundAmount:80},'환불 완료','발송 완료','해당 없음'],
 ['cancelled',{status:'전체 취소'},'전액 환불 완료','배송 대상 아님','해당 없음'],
];
for(const [name,fields,payment,shipping,returned] of cases)test(`${name} keeps payment, shipping and return labels separate`,()=>{
 const c=harness(),order={total:100,...fields},before=JSON.stringify(order);
 assert.equal(c.paymentLabel(order),payment);assert.equal(c.state(order),shipping);assert.equal(c.returnStateLabel(order),returned);assert.equal(JSON.stringify(order),before);
});
test('payment filters include requests and rejections as paid and all completed refund types as refunded',()=>{
 const data=cases.map(([name,fields])=>({number:name,items:[],createdAt:'2026-10-14',total:100,...fields})),c=harness(data);
 c.$('paymentFilter').value='paid';assert.deepEqual(Array.from(c.filteredOrders(),o=>o.number).sort(),['normal','return rejected','return request'].sort());
 c.$('paymentFilter').value='refunded';assert.equal(c.filteredOrders().length,4);
 c.$('shippingFilter').value='전체 취소';assert.deepEqual(Array.from(c.filteredOrders(),o=>o.number),['cancelled']);
});
test('legacy refund missing amount uses shipping deduction instead of claiming full refund',()=>{
 const c=harness();assert.equal(c.paymentLabel({total:100,status:'출고 완료',returnStatus:'환불 완료',shippingDeduction:20}),'환불 완료');
 assert.equal(c.state({status:'배송 완료'}),'발송 완료');
});
test('return details show return status separately from financial status',()=>{
 const c=harness([{number:'RETURN',total:100,status:'출고 완료',trackingNumber:'123',items:[],returnStatus:'반품 반려',returnRejectReason:'검수 결과'}]);
 c.showDetail('RETURN');const html=c.$('orderDetail').innerHTML;
 assert.match(html,/<h3>반품 처리<\/h3>/);assert.match(html,/<span>반품 상태<\/span><b>반품 반려<\/b>/);assert.match(html,/<span>결제 · 환불<\/span><b>결제 완료<\/b>/);assert.match(html,/<span>배송 상태<\/span><b>발송 완료<\/b>/);
});
test('exception refund details do not invent a return request or return tracking',()=>{
 const c=harness([{number:'EXCEPTION',total:100,status:'출고 완료',trackingNumber:'123',items:[],returnStatus:'환불 완료',refundKind:'관리자 예외 환불',refundAmount:80,shippingDeduction:20,exceptionalRefundReason:'개별 협의'}]);
 c.showDetail('EXCEPTION');const html=c.$('orderDetail').innerHTML;
 assert.match(html,/<span>환불 유형<\/span><b>관리자 예외 환불<\/b>/);assert.match(html,/<span>최종 환불액<\/span><b class="detail-amount">80원<\/b>/);assert.doesNotMatch(html,/<h3>반품 처리<\/h3>|반품 사유|반품 운송장/);
});
test('admin list filters do not mix return status or refund method into financial options',()=>{
 assert.doesNotMatch(orders,/value="return_requested"|value="return_rejected"|value="exception_refunded"/);
 for(const name of ['admin.html','admin-shipping.html'])assert.match(read(name),/<option value="전체 취소">배송 대상 아님<\/option>/);
});

test('return filters separate requests, rejections, completion and no-return orders',()=>{
 const data=cases.map(([name,fields])=>({number:name,items:[],createdAt:'2026-10-14',total:100,...fields})),c=harness(data);
 const expected={none:['normal','exception refund','cancelled'],requested:['return request'],rejected:['return rejected'],completed:['return fully refunded','return shipping deduction']};
 for(const [key,numbers] of Object.entries(expected)) {
  c.$('returnFilter').value=key;assert.deepEqual(Array.from(c.filteredOrders(),o=>o.number).sort(),numbers.sort());
 }
 c.$('returnFilter').value='requested';c.$('paymentFilter').value='refunded';assert.equal(c.filteredOrders().length,0);
 c.$('paymentFilter').value='paid';c.$('shippingFilter').value='출고 완료';assert.equal(c.filteredOrders().length,1);
 c.$('returnFilter').value='';c.$('paymentFilter').value='';c.$('shippingFilter').value='';assert.equal(c.filteredOrders().length,data.length);
});
test('sales table renders a separate return column without changing shipping table columns',()=>{
 for(const salesTab of ['orders','shipping']) {
  const c=harness([{number:'ROW',name:'구매자',total:100,status:'출고 완료',items:[],returnStatus:'신청 완료'}]);
  Object.assign(c,{salesTab,shippingStage:'shipped',orderPage:1,PAGE_SIZE:20,pagination:()=>1,updatePendingCount(){},invoiceCell:()=>'<span>미등록</span>',syncSharedAdminComponents(){},document:{querySelector:()=>({}),querySelectorAll:()=>[]}});
  c.$('listTitle').firstChild={textContent:''};
  vm.runInContext(orders.slice(orders.indexOf('function renderOrders ()'),orders.indexOf("$('keyword').placeholder")),c);c.renderOrders();
  const html=c.$('ordersTable').innerHTML,count=salesTab==='orders'?8:6;
  assert.equal((html.match(/<th>/g)||[]).length,count);assert.equal((html.match(/<td(?:\s[^>]*)?>/g)||[]).length,count);
  if(salesTab==='orders'){assert.match(html,/<th>반품 상태<\/th>/);assert.match(html,/>반품 신청 완료<\/span>/);assert.doesNotMatch(html,/<th>송장 정보<\/th>/);}else {assert.doesNotMatch(html,/<th>반품 상태<\/th>/);assert.match(html,/<th>송장 정보<\/th>/);}
 }
});

test('order detail offers readonly tracking in both sales and shipping screens',()=>{
 for(const salesTab of ['orders','shipping']) {
  const c=harness([{number:'TRACKED',name:'구매자',total:100,status:'출고 완료',items:[],carrier:'CJ대한통운',trackingNumber:'TRACK123'}]);c.salesTab=salesTab;c.showDetail('TRACKED');
  const html=c.$('orderDetail').innerHTML;assert.match(html,/<h3>발송 송장 정보<\/h3>/);assert.match(html,/CJ대한통운/);assert.match(html,/TRACK123/);assert.match(html,/class="invoice-lookup"/);assert.doesNotMatch(html,/class="invoice-inline"|class="tracking-input"/);
 }
});

test('developer policy panel renders payment, shipping and returns in separate status groups',()=>{
 const source=read('developer-policy.js'),ctx={esc:String,requestItem:String};vm.createContext(ctx);
 for(const name of ['requirementCopy','stateCopy']) {
  const start=source.indexOf('const '+name+'=')+('const '+name+'=').length,end=source.indexOf(';',start);
  vm.runInContext('var '+name+'='+source.slice(start,end)+';',ctx);
 }
 const groupStart=source.indexOf('const groupedStateCopy='),groupEnd=source.indexOf('let shell,opened=',groupStart);
 vm.runInContext(source.slice(groupStart,groupEnd)+'globalThis.sections=groupedStateCopy;',ctx);
 const start=source.indexOf('function card('),end=source.indexOf('\nfunction ',start+1);
 vm.runInContext(source.slice(start,end),ctx);
 assert.deepEqual(Array.from(ctx.sections['admin-orders'],section=>section.states.length),[3,3,3]);
 assert.deepEqual(Array.from(ctx.sections['sales-filter'],section=>section.states.length),[2,3,3]);
 for(const id of ['admin-orders','admin-order-detail']) {
  const html=ctx.card({id,title:'정책',category:'상태'},0);
  assert.equal((html.match(/class="dev-spec-state-title"/g)||[]).length,3);
  for(const title of ['결제·환불 상태값 (3가지)','배송 상태값 (3가지)','반품 상태값 (3가지)'])assert.ok(html.includes(title));
 }
});

test('settlement reuses order content and exposes only close without sales navigation',()=>{
 const c=harness(),order={number:'ORDER',total:100,status:'출고 대기',items:[]};
 const sales=c.renderAdminOrderDetail(order),settlement=c.renderAdminOrderDetail(order,true,'admin.html?order=ORDER');
 assert.equal(sales.split('<div class="dialog-footer">')[0],settlement.split('<div class="dialog-footer">')[0]);
 assert.match(sales,/id="adminCancelOrder"/);assert.doesNotMatch(settlement,/id="adminCancelOrder"|id="rejectReturn"|id="completeRefund"|id="exceptionRefund"/);
 assert.doesNotMatch(settlement,/order-sales-link|상품 판매 현황으로 이동/);assert.match(settlement,/data-close="detailDialog"/);
});
test('return filter is available in sales and hidden by the shipping-only screen',()=>{
 for(const file of ['admin.html','admin-shipping.html']) {
  const html=read(file);assert.ok(!html.includes('value="rejected"'));assert.equal((html.match(/id="returnFilter"/g)||[]).length,1);
  for(const value of ['none','requested','completed'])assert.ok(html.includes(`value="${value}"`));
 }
 assert.match(read('admin-shipping.js'),/\$\('returnFilter'\)\.closest\('label'\)\.hidden=true/);
});

test('return requests expose refund and CS guidance without a rejection action',()=>{
 const c=harness();
 for(const tracking of ['', 'RETURN123']) {
  const html=c.renderAdminOrderDetail({number:'RETURN',status:'출고 완료',trackingNumber:'SHIP123',returnStatus:'신청 완료',returnTrackingNumber:tracking,total:100,items:[]});
  assert.doesNotMatch(html,/id="rejectReturn"/);
  assert.match(html,/반품 불가 판단과 고객 안내는 CS에서 처리/);
  const button=html.match(/<button[^>]*id="completeRefund"[^>]*>/)[0];
  assert.equal(button.includes(' disabled'),!tracking);
  assert.ok(html.indexOf('id="completeRefund"') < html.indexOf('<h3>결제정보</h3>'));
  assert.match(html,/반품처리\(환불\)/);
  if(!tracking)assert.match(html,/반품 운송장 등록 대기 중/);
  const readonly=c.renderAdminOrderDetail({returnStatus:'신청 완료',returnTrackingNumber:tracking,total:100,items:[]},true);
  assert.doesNotMatch(readonly,/id="completeRefund"/);
 }
});

test('retired rejection and unknown actions cannot mutate an order or fall through to refund',()=>{
 const ctx={};vm.createContext(ctx);
 const start=detail.indexOf('function submitOrderAction('),end=detail.indexOf('function showDetail',start);
 vm.runInContext(detail.slice(start,end),ctx);
 for(const type of ['reject','unknown','']) {
  ctx.$=id=>{assert.equal(id,'orderActionType');return {value:type};};
  let prevented=false;
  ctx.submitOrderAction({preventDefault(){prevented=true;}});
  assert.ok(prevented);
 }
});

test('admin contact masking covers phone formats and administrative address levels',()=>{
 const c=harness();
 for(const phone of ['010-1234-5678','01012345678','010 1234 5678'])assert.equal(c.maskAdminPhone(phone),'010-****-5678');
 assert.equal(c.maskAdminPhone('02-123-4567'),'02-****-4567');
 assert.equal(c.maskAdminPhone('031-1234-5678'),'031-****-5678');
 assert.equal(c.maskAdminPhone('invalid'),'****');
 assert.equal(c.maskAdminPhone(null),'');
 for(const [address,expected] of [
  ['서울특별시 강남구 역삼동 123-4 101호','서울특별시 강남구 ****'],
  ['경기도 성남시 분당구 판교역로 166, 804호','경기도 성남시 분당구 ****'],
  ['경기도 양평군 양평읍 중앙로 10','경기도 양평군 ****'],
  ['세종특별자치시 한솔동 123','세종특별자치시 ****'],
  ['(12345) 부산광역시 강서구 가락대로 929','부산광역시 강서구 ****'],
  ['역삼동 123-4','****'],['','']
 ])assert.equal(c.maskAdminAddress(address),expected);
});

test('admin order details mask recipient contacts without changing stored order data',()=>{
 const c=harness();
 const order={number:'PRIVATE',name:'구매자',phone:'010-1234-5678',recipient:'수령인',recipientPhone:'010-9876-5432',address:'서울특별시 강남구 역삼동 123-4',total:100,items:[]};
 const original=JSON.stringify(order);
 for(const readOnly of [false,true]){
  const html=c.renderAdminOrderDetail(order,readOnly);
  assert.match(html,/수\*인/);
  assert.doesNotMatch(html,/수령인/);
  assert.match(html,/010-\*\*\*\*-5432/);
  assert.match(html,/서울특별시 강남구 \*\*\*\*/);
  assert.doesNotMatch(html,/9876|역삼동|123-4/);
 }
 assert.equal(JSON.stringify(order),original);
});


test('admin names mask exactly one central character including short names',()=>{
 const c=harness();
 for(const [name,expected] of [['홍길동','홍*동'],['남궁민수','남궁*수'],['이름','이*'],['김','*'],['',''],[null,'']]){
  assert.equal(c.maskAdminName(name),expected);
 }
});
