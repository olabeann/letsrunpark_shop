const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../dist/admin-products.js','utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(0,source.indexOf('let productPage')),ctx);
const seed=()=>[{id:1,displayOrder:2,name:'A'},{id:2,displayOrder:2,name:'B'},{id:3,name:'C'},{id:4,displayOrder:4,deletedAt:1}].map(p=>({status:'sale',stock:10,...p}));
test('duplicate and missing ranks become unique contiguous ranks without mutating source',()=>{
 const products=seed(),before=JSON.stringify(products);
 const next=ctx.applyProductOrder(products,[3,1,2],ctx.productOrderSignature(products));
 assert.equal(next.find(p=>p.id===3).displayOrder,1);
 assert.equal(next.find(p=>p.id===1).displayOrder,2);
 assert.equal(next.find(p=>p.id===2).displayOrder,3);
 assert.equal(next[3],products[3]);assert.equal(JSON.stringify(products),before);
});
test('retains latest product edits while rejecting concurrent reorder, addition or deletion',()=>{
 const products=seed(),signature=ctx.productOrderSignature(products);
 products[0].name='Changed';products[0].stock=99;
 assert.equal(ctx.applyProductOrder(products,[3,2,1],signature)[0].stock,99);
 for(const altered of [products.map(p=>p.id===1?{...p,displayOrder:5}:p),[...products,{id:5}],products.map(p=>p.id===2?{...p,deletedAt:2}:p)]) assert.throws(()=>ctx.applyProductOrder(altered,[3,2,1],signature),/ORDER_CHANGED/);
});
test('rejects duplicate or unknown IDs and handles empty and single-product lists',()=>{
 const products=seed(),signature=ctx.productOrderSignature(products);
 for(const ids of [[1,1,3],[1,2,9],[1,2]])assert.throws(()=>ctx.applyProductOrder(products,ids,signature),/ORDER_CHANGED/);
 assert.equal(ctx.applyProductOrder([],[],ctx.productOrderSignature([])).length,0);
 assert.equal(ctx.applyProductOrder([{id:1,status:'sale',stock:1}],[1],ctx.productOrderSignature([{id:1,status:'sale',stock:1}]))[0].displayOrder,1);
});

test('sale and sold-out products move; hidden slots stay in place',()=>{
 const products=[{id:1,status:'sale',stock:5,displayOrder:1},{id:2,status:'hidden',stock:5,displayOrder:2},{id:3,status:'soldout',stock:0,displayOrder:3},{id:4,status:'sale',stock:5,displayOrder:4},{id:5,status:'sale',stock:0,displayOrder:5}];
 const signature=ctx.productOrderSignature(products);
 const next=ctx.applyProductOrder(products,[4,3,5,1],signature);
 assert.deepEqual(Array.from(next,p=>p.displayOrder),[5,2,3,1,4]);
 products[0].status='hidden';
 assert.throws(()=>ctx.applyProductOrder(products,[4,3,5,1],signature),/ORDER_CHANGED/);
});
