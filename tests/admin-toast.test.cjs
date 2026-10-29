const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../dist/admin-layout.js','utf8').split('// Shared administrator navigation')[0];
function mount(popover=true){
 const timers=new Map(),nodes=[];let next=0;
 const body={append(node){node.parent=this;if(!nodes.includes(node))nodes.push(node);}};
 const modal={append(node){node.parent=this;}};
 const context={window:{},document:{body,querySelectorAll:()=>[modal],createElement(){const node={attrs:{},setAttribute(k,v){this.attrs[k]=v;},matches(){return this.open;}};if(popover)Object.assign(node,{showPopover(){this.open=true;},hidePopover(){this.open=false;}});return node;}},setTimeout(fn,ms){timers.set(++next,{fn,ms});return next;},clearTimeout(id){timers.delete(id);}};
 vm.runInNewContext(source,context);return {show:context.window.AdminToast.show,timers,nodes,modal};
}
test('toast replaces consecutive results, resets expiry and clears content',()=>{
 const {show,timers,nodes}=mount();show('설정 저장 완료');const toast=nodes[0];
 assert.equal(toast.hidden,false);assert.equal(toast.open,true);assert.equal(toast.attrs.role,'status');
 show('<b>다음 저장 완료</b>');assert.equal(nodes.length,1);assert.equal(toast.textContent,'<b>다음 저장 완료</b>');assert.equal(timers.size,1);
 const timer=[...timers.values()][0];assert.equal(timer.ms,5000);timer.fn();assert.equal(toast.hidden,true);assert.equal(toast.open,false);assert.equal(toast.textContent,'');
});
test('without popovers toast is placed in the open dialog so it remains visible',()=>{
 const {show,nodes,modal}=mount(false);show('재고 변경 완료');assert.equal(nodes[0].parent,modal);
});
