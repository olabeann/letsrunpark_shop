const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
 const elements={};
 const $=id=>elements[id] ||= {value:'',innerHTML:'',textContent:'',hidden:false};
 const source=fs.readFileSync(__dirname+'/../dist/admin-products.js','utf8');
 const context=vm.createContext({$,Date,Inventory:{actorLabel:entry=>entry.actor},esc:value=>String(value).replaceAll('<','&lt;')});
 vm.runInContext('let stockHistoryPage=1;const stockHistoryPageSize=20;'+source.slice(source.indexOf('function renderStockHistory('),source.indexOf("['stockHistoryPeriod','stockHistoryType','stockHistoryStart','stockHistoryEnd'].forEach(id=>$(id).onchange")),context);
 return {$,render:history=>context.renderStockHistory(history),page:value=>vm.runInContext('stockHistoryPage='+value,context)};
}
const history=Array.from({length:45},(_,i)=>({at:new Date(2026,9,i%25+1,12).getTime(),delta:i%2?1:-1,balance:i,actor:'admin',reason:'입고'}));
test('journal paginates all entries, clamps stale pages, and filters movement types',()=>{
 const {$,render,page}=setup();render(history);
 assert.equal($('stockHistoryCount').textContent,'총 45건');
 assert.equal(($('stockHistory').innerHTML.match(/<tr>/g)||[]).length,20);
 page(3);render(history);assert.equal(($('stockHistory').innerHTML.match(/<tr>/g)||[]).length,5);
 $('stockHistoryType').value='increase';render(history);
 assert.equal($('stockHistoryCount').textContent,'총 22건');
 assert.equal(($('stockHistory').innerHTML.match(/<tr>/g)||[]).length,2);
 assert.match($('stockHistoryPagination').innerHTML,/aria-current="page" aria-label="2페이지"/);
});
test('custom range includes the end date, rejects reversed ranges, and renders empty results',()=>{
 const {$,render}=setup();$('stockHistoryPeriod').value='custom';
 $('stockHistoryStart').value='2026-10-01';$('stockHistoryEnd').value='2026-10-01';render(history);
 assert.equal($('stockHistoryCount').textContent,'총 2건');
 $('stockHistoryStart').value='2026-10-02';render(history);assert.equal($('stockHistoryError').hidden,false);
 assert.match($('stockHistory').innerHTML,/조건에 맞는/);
 $('stockHistoryStart').value='2027-01-01';$('stockHistoryEnd').value='';render(history);
 assert.equal($('stockHistoryCount').textContent,'총 0건');assert.equal($('stockHistoryError').hidden,true);
});
