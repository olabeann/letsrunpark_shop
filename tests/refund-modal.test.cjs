const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(__dirname+'/../dist/'+file,'utf8');
test('cancellation and exceptional refund summaries follow current amounts without saving orders',()=>{
 const source=read('admin-order-detail.js');
 for(const type of ['cancel','exception'])for(const treatment of ['full','deduct']){
  const nodes={orderActionNumber:{value:'TEST'},orderActionType:{value:type},orderActionForm:{elements:{actionRefund:{value:treatment}}},orderActionDeduction:{value:'6000'}};
  const data=[{number:'TEST',total:55000}],stored=JSON.stringify(data);
  const ctx={goods:[],orderData:data,localStorage:{goodsOrders:stored},money:n=>n+'원',$:id=>nodes[id]??=( {})};
  vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('function updateOrderActionPreview()'),source.indexOf('function submitOrderAction(')),ctx);
  ctx.updateOrderActionPreview();
  const deduct=type==='exception'&&treatment==='deduct';
  assert.equal(nodes.orderActionFinalAmount.textContent,deduct?'49000원':'55000원');
  assert.equal(nodes.orderActionDeductionRow.hidden,!deduct);
  assert.equal(nodes.orderActionPaidAmount.textContent,'55000원');
  assert.equal(ctx.localStorage.goodsOrders,stored);
 }
});
