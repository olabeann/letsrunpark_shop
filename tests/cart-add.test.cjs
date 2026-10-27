const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../dist/product.js','utf8');
const ctx={};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function cartAddResult'),source.indexOf('function addSelected')),ctx);
test('adding below the limit reports the actual added quantity',()=>{
 const r=ctx.cartAddResult(30,3,9);assert.equal(r.added,9);assert.equal(r.quantity,12);assert.match(r.message,/9개 담았/);
});
test('partial addition reports the added and resulting quantities',()=>{
 const r=ctx.cartAddResult(30,28,9);assert.equal(r.added,2);assert.equal(r.quantity,30);assert.match(r.message,/2개만 추가/);assert.match(r.message,/총 30개/);
});
test('full cart does not report success',()=>{
 const r=ctx.cartAddResult(30,30,9);assert.equal(r.added,0);assert.equal(r.quantity,30);assert.match(r.message,/이미 장바구니/);assert.doesNotMatch(r.message,/담았/);
});
test('reduced stock adjusts existing quantity without pretending to add',()=>{
 const r=ctx.cartAddResult(10,30,9);assert.equal(r.added,0);assert.equal(r.quantity,10);assert.match(r.message,/재고가 줄어/);
});
