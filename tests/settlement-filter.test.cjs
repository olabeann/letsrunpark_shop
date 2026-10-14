const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
const source=read('admin-settlement.js');
test('month-only settlement query includes approval, cancellation, refund and pending rows',()=>{
 const nodes={settlementMonth:{value:'2026-10'},settlementKeyword:{value:''}};
 const ctx={$:id=>{assert.ok(nodes[id],`unexpected filter ${id}`);return nodes[id];},monthKey:value=>String(value||'').slice(0,7),day:value=>String(value||'').slice(0,10),paymentLabel:()=> '환불 완료',orderData:[
  {number:'CANCEL',items:[],total:100,status:'전체 취소',approvedAt:'2026-10-02',cancelCompletedAt:'2026-10-03'},
  {number:'EXCEPTION',items:[],total:100,status:'출고 완료',returnStatus:'환불 완료',refundKind:'관리자 예외 환불',refundAmount:80,approvedAt:'2026-09-01',refundCompletedAt:'2026-10-04'},
  {number:'PENDING',items:[],total:100,status:'출고 완료',returnStatus:'신청 완료',approvedAt:'2026-10-05',returnRequestedAt:'2026-10-06'},
  {number:'OUTSIDE',items:[],total:100,status:'출고 대기',approvedAt:'2026-09-01'},
 ]};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('  function settlementRows()'),source.indexOf('  function payoutDate(')),ctx);
 const rows=ctx.settlementRows();assert.equal(rows.length,5);assert.equal(rows.filter(row=>row.type==='환불').length,2);
 assert.equal(rows.filter(row=>row.type==='승인').reduce((sum,row)=>sum+row.amount,0),200);
 assert.equal(rows.filter(row=>row.type==='환불').reduce((sum,row)=>sum+row.amount,0),-180);
 assert.equal(rows.find(row=>row.type==='처리 대기').amount,0);
 nodes.settlementKeyword.value='exception';assert.equal(ctx.settlementRows().length,1);
});
test('settlement has no payment status filter in initial or generated markup',()=>{
 assert.doesNotMatch(source,/settlementPayment/);assert.doesNotMatch(read('admin-settlement.html'),/settlementPayment/);
 assert.match(read('admin-settlement.html'),/id="settlementMonth" type="month"/);
});
