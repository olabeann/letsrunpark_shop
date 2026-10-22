const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const policy={id:'event',name:'가을',type:'percent',value:10,maxQty:2,startDate:'2026-10-22',endDate:'2026-10-22',allProducts:true,active:true,productIds:[]};
const now=Date.parse('2026-10-22T12:00:00+09:00');
function harness(){const storage={value:JSON.stringify([policy]),getItem(){return this.value;},setItem(key,value){this.value=value;}};const c={localStorage:storage};vm.createContext(c);vm.runInContext(fs.readFileSync('dist/goods-discounts.js','utf8')+';globalThis.api=GoodsDiscounts;',c);return {api:c.api,storage};}
test('discount allocation favors highest savings and respects total quantity across products',()=>{
 const {api}=harness();const q=api.calculate(policy,[{id:1,qty:2},{id:2,qty:3}],[{id:1,price:10000},{id:2,price:20000}],now);
 assert.equal(q.amount,4000);assert.equal(q.allocations[0].id,2);assert.equal(q.allocations[0].qty,2);
});
test('fixed amounts are per unit, capped by price, and restricted to selected products',()=>{
 const {api}=harness();const q=api.calculate({...policy,type:'fixed',value:2000,allProducts:false,productIds:[1]},[{id:1,qty:3},{id:2,qty:1}],[{id:1,price:1500},{id:2,price:30000}],now);
 assert.equal(q.amount,3000);assert.equal(q.allocations.length,1);
});
test('Korean dates include the entire final day and exclude next midnight',()=>{
 const {api}=harness();assert.equal(api.status(policy,Date.parse('2026-10-21T14:59:59Z')),'예정');assert.equal(api.status(policy,Date.parse('2026-10-21T15:00:00Z')),'활성');assert.equal(api.status(policy,Date.parse('2026-10-22T14:59:59Z')),'활성');assert.equal(api.status(policy,Date.parse('2026-10-22T15:00:00Z')),'종료');
});
test('disabled, deleted, invalid and expired discounts cannot be charged',()=>{
 const {api,storage}=harness();const items=[{id:1,qty:1}],products=[{id:1,price:10000}];
 for(const override of [{active:false},{maxQty:0},{value:101},{endDate:'2026-10-21'}])assert.equal(api.calculate({...policy,...override},items,products,now).amount,0);
 storage.value='[]';assert.equal(api.quote('event',items,products,now).amount,0);
});
test('new products qualify for all-products offers and percentage rounding is per unit',()=>{
 const {api}=harness();assert.equal(api.calculate(policy,[{id:99,qty:2}],[{id:99,price:999}],now).amount,198);
});
test('quotes preserve a historical snapshot and reread edited policies',()=>{
 const {api,storage}=harness();const items=[{id:1,qty:1}],products=[{id:1,price:10000}];const old=api.quote('event',items,products,now);storage.value=JSON.stringify([{...policy,value:20}]);assert.equal(old.amount,1000);assert.equal(old.policy.value,10);assert.equal(api.quote('event',items,products,now).amount,2000);
});

test('initial discounts seed once and preserve edits and deletion',()=>{
 const {api,storage}=harness();storage.value=null;
 assert.equal(api.read().length,2);assert.equal(api.read()[0].name,'가을 굿즈 할인');
 storage.value='[]';assert.equal(api.read().length,0);
 storage.value=JSON.stringify([{...policy,name:'수정한 할인'}]);assert.equal(api.read()[0].name,'수정한 할인');
});
