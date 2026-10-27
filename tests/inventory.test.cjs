const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function inventory(){const ctx=vm.createContext({Date});vm.runInContext(fs.readFileSync(__dirname+'/../dist/inventory.js','utf8')+'\nthis.api=Inventory;',ctx);return ctx.api;}
test('stock movements preserve opening balance, reasons and running balances',()=>{
 const api=inventory(),p={stock:12,status:'sale'};
 api.change(p,10,'추가 입고');api.change(p,-3,'파손');
 assert.equal(p.stock,19);assert.deepEqual(Array.from(p.stockHistory,e=>e.balance),[12,22,19]);
 assert.equal(p.stockHistory[2].reason,'파손');assert.ok(p.stockHistory[2].at);
});
test('invalid changes never mutate stock or journal',()=>{
 const api=inventory(),p={stock:2,status:'sale'};
 for(const delta of [-3,0,1.2,NaN,Infinity]) assert.throws(()=>api.change(p,delta,'검수'));
 assert.throws(()=>api.change(p,1,' '));assert.equal(p.stock,2);assert.equal(p.stockHistory,undefined);
});
test('order deduction and cancellation retain references and are idempotent',()=>{
 const api=inventory(),p={stock:3,status:'sale'};
 api.change(p,-2,'주문 결제','고객','ORDER:purchase');
 api.change(p,2,'주문 취소','고객','ORDER:cancel');
 api.change(p,2,'주문 취소','고객','ORDER:cancel');
 assert.equal(p.stock,3);assert.equal(p.stockHistory.length,3);
});
test('zero balance sells out; replenishment keeps sold-out and hidden goods unavailable',()=>{
 const api=inventory(),p={stock:1,status:'sale'};
 api.change(p,-1,'판매');assert.equal(p.status,'soldout');api.change(p,2,'입고');assert.equal(p.status,'soldout');
 p.status='hidden';api.change(p,1,'입고');assert.equal(p.status,'hidden');
});
test('stock history snapshots the active account ID instead of its role',()=>{
 let login='seoul_brand';
 const ctx=vm.createContext({Date,sessionStorage:{getItem:()=>login}});
 vm.runInContext(fs.readFileSync(__dirname+'/../dist/inventory.js','utf8')+'\nthis.api=Inventory;',ctx);
 const p={stock:1,status:'sale'};
 ctx.api.change(p,2,'입고');login='busan_ops';ctx.api.change(p,1,'입고');
 assert.equal(p.stockHistory[1].actor,'seoul_brand');assert.equal(p.stockHistory[2].actor,'busan_ops');
 assert.equal(ctx.api.actorLabel(p.stockHistory[1]),'seoul_brand');
 assert.equal(ctx.api.actorLabel({actor:'운영 관리자'}),'admin');
 assert.equal(ctx.api.actorLabel({actor:'시스템'}),'admin');
 login='signed-out';assert.throws(()=>ctx.api.change(p,1,'입고'));assert.equal(p.stock,4);
});

test('opening balance has a stable timestamp and account after registration',()=>{
 const api=inventory(),p={stock:4,status:'sale'};
 const first=api.history(p)[0];assert.ok(first.at);assert.equal(first.actor,'admin');
 assert.equal(api.history(p)[0].at,first.at);
 const old={stock:4,stockHistory:[{at:null,delta:4,balance:4,actor:'시스템'}]};
 assert.ok(api.history(old)[0].at);assert.equal(old.stockHistory[0].actor,'admin');
});

test('manual status validation preserves stock; zero stock cannot be on sale',()=>{
 const api=inventory(),p={stock:5,status:'sale'};
 api.validateStatus('soldout',p.stock);p.status='soldout';
 assert.equal(p.stock,5);assert.equal(p.stockHistory,undefined);
 api.validateStatus('sale',p.stock);p.status='sale';assert.equal(p.stock,5);
 assert.throws(()=>api.validateStatus('sale',0),/재고가 0개/);
 api.validateStatus('soldout',0);api.validateStatus('hidden',0);
});
test('cancellation restoration does not resume a sold-out product',()=>{
 const api=inventory(),p={stock:1,status:'sale'};
 api.change(p,-1,'주문 결제','고객','sale-1');
 api.change(p,1,'주문 취소','고객','cancel-1');
 assert.equal(p.stock,1);assert.equal(p.status,'soldout');
});
