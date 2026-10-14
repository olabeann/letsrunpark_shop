const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
function open(search,orderData) {
 const opened=[],messages=[],sequence=[];
 vm.runInNewContext(read('admin-sales.js'),{URLSearchParams,location:{search},orderData,showDetail:n=>{opened.push(n);sequence.push('detail');},notify:m=>messages.push(m),bindShippingGuide(){},renderOrders:()=>sequence.push('list')});
 return {opened,messages,sequence};
}
test('settlement links preserve the local deployment directory and encode the exact order number',()=>{
 const ctx={};vm.createContext(ctx);const source=read('admin-settlement.js');const start=source.indexOf('function settlementOrderUrl('),end=source.indexOf('\n',start);vm.runInContext(source.slice(start,end),ctx);
 const number='G-261014-00001 & #';const relative=ctx.settlementOrderUrl(number);const target=new URL(relative,'file:///C:/GitHub/letsrunpark_shop/dist/admin-settlement.html');
 assert.equal(target.pathname,'/C:/GitHub/letsrunpark_shop/dist/admin.html');assert.equal(target.searchParams.get('order'),number);
 assert.match(source,/class="settlement-order-link"/);
});
test('sales loads its list before opening the requested existing order detail',()=>{
 const result=open('?order=G-261014-00001',[{number:'G-261014-00001'}]);assert.deepEqual(result.opened,['G-261014-00001']);assert.deepEqual(result.sequence,['list','detail']);assert.equal(result.messages.length,0);
});
test('missing order gives feedback while ordinary sales navigation leaves detail closed',()=>{
 const missing=open('?order=UNKNOWN',[]);assert.equal(missing.opened.length,0);assert.equal(missing.messages.length,1);
 const ordinary=open('',[{number:'ORDER'}]);assert.equal(ordinary.opened.length,0);assert.equal(ordinary.messages.length,0);
});

test('settlement opens detail locally without changing query, page, or scroll state',()=>{
 const source=read('admin-settlement.js'),nodes={orderDetail:{innerHTML:''},detailDialog:{open:false,showModal(){this.open=true;}}},calls=[];
 const ctx={orderData:[{number:'ORDER'}],settlementPage:3,month:'2026-09',keyword:'말마',scrollY:420,$:id=>nodes[id],bindClose(){},notify(){},settlementOrderUrl:number=>'admin.html?order='+number,renderAdminOrderDetail:(order,readonly,url)=>{calls.push([order.number,readonly,url]);return 'DETAIL';}};vm.createContext(ctx);
 vm.runInContext(source.slice(source.indexOf('function openSettlementOrder('),source.indexOf('  function paymentLabel (')),ctx);ctx.openSettlementOrder('ORDER');
 assert.equal(nodes.detailDialog.open,true);assert.equal(nodes.orderDetail.innerHTML,'DETAIL');assert.deepEqual(calls,[['ORDER',true,'admin.html?order=ORDER']]);
 assert.equal(ctx.settlementPage,3);assert.equal(ctx.month,'2026-09');assert.equal(ctx.keyword,'말마');assert.equal(ctx.scrollY,420);
 assert.match(source,/data-settlement-order=/);assert.doesNotMatch(source,/class="settlement-order-link" href=/);
});
