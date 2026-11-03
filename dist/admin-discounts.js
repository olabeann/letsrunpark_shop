const byId=id=>document.getElementById(id);
const escapeDiscount=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let policies=GoodsDiscounts.read(),dirty=false;
const form=byId('discount-form');
function discountNotify(message){if(typeof AdminToast!=='undefined')AdminToast.show(message);else byId('adminStatus').textContent=message;}
function discountProducts(){return JSON.parse(localStorage.goodsProducts||JSON.stringify(sampleProducts));}
function discountTargetLabel(discount){
 if(discount.allProducts)return '전체';
 const ids=[...new Set(discount.productIds||[])];
 if(!ids.length)return '적용 상품 없음';
 const name=discountProducts().find(product=>product.id===ids[0])?.name||'삭제된 상품';
 return name+(ids.length>1?` 외 ${ids.length-1}종`:'');
}
function discountStatusLabel(d){const status=GoodsDiscounts.status(d);return status==='활성'?'진행 중':status;}
function renderList(){
 // New policies append to storage; editing keeps the original position.
 const rows=[...policies].reverse();
 byId('discountCount').textContent=rows.length;
 byId('discount-policy-list').innerHTML=`<table class="kiosk-product-table"><thead><tr><th>할인명</th><th>할인 방식 · 혜택</th><th>적용 상품</th><th>사용 제한</th><th>적용 기간</th><th>상태</th><th aria-label="할인 수정"></th></tr></thead><tbody>${rows.length?rows.map(d=>`<tr><td><b>${escapeDiscount(d.name)}</b>${d.mode==='code'?`<small class="discount-code-line"><span>코드: ${escapeDiscount(d.code)}</span><button type="button" class="discount-copy" data-copy-code="${escapeDiscount(d.code)}" aria-label="${escapeDiscount(d.code)} 코드 복사">복사</button></small>`:''}</td><td>${d.type==='percent'?'정률':'정액'} · ${d.value.toLocaleString()}${d.type==='percent'?'%':'원 / 개'}</td><td>${escapeDiscount(discountTargetLabel(d))}</td><td>계정당 ${d.maxQty}개</td><td>${escapeDiscount(d.startDate)} ~ ${escapeDiscount(d.endDate)}</td><td><span class="badge ${GoodsDiscounts.status(d)==='활성'?'green':'grey'}">${discountStatusLabel(d)}</span></td><td><button type="button" data-id="${escapeDiscount(d.id)}" aria-label="${escapeDiscount(d.name)} 수정">수정</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty-table">등록된 할인이 없습니다. 할인 등록 버튼으로 추가해 주세요.</td></tr>'}</tbody></table>`;
}
function closeDiscount(){if(dirty&&!confirm('저장하지 않은 변경을 버리시겠습니까?'))return;dirty=false;byId('discountDialog').close();}
byId('discountDialog').addEventListener('cancel',e=>{e.preventDefault();closeDiscount();});
document.querySelectorAll('[data-discount-close]').forEach(button=>button.onclick=closeDiscount);
function typeChanged(){const percent=byId('discount-type').value==='percent';byId('discount-value-label').textContent=percent?'할인율 (%) *':'할인금액 (원 / 굿즈 1개당) *';byId('discount-value').min=percent?'0.01':'1';byId('discount-value').step=percent?'0.01':'1';if(percent)byId('discount-value').max='100';else byId('discount-value').removeAttribute('max');}
function modeChanged(){
 const isCode=byId('discount-mode').value==='code';
 byId('discount-mode-help').textContent=byId('discount-mode').disabled?'등록 후 적용 방법은 변경할 수 없습니다. 다른 유형은 새 할인으로 등록해 주세요.':'일반 할인은 결제 화면에서 선택하고, 프로모션 코드는 직접 입력하여 적용합니다.';
 byId('discount-code-help').textContent=byId('discount-code').readOnly?'등록된 코드는 변경할 수 없습니다. 사용을 중단하려면 아래 할인 활성화를 해제해 주세요.':'영문·숫자 4~24자. 대소문자를 구분하지 않습니다. 코드를 전달받은 회원 누구나 사용할 수 있습니다.';
 byId('discount-code-field').hidden=!isCode;
 byId('discount-code').disabled=!isCode;
 byId('discount-code').required=isCode;
}
byId('discount-mode').onchange=modeChanged;
function openDiscount(id){if(dirty&&!confirm('저장하지 않은 변경을 버리시겠습니까?'))return;const d=policies.find(x=>x.id===id)||{id:'',name:'',type:'percent',value:10,maxQty:1,noticeText:'',startDate:GoodsDiscounts.day(),endDate:GoodsDiscounts.day(),allProducts:true,active:true,productIds:[]};form.reset();byId('discount-mode').value=d.mode||'public';byId('discount-mode').disabled=!!d.id;byId('discount-code').value=d.code||'';byId('discount-code').readOnly=!!d.id;modeChanged();for(const [key,field] of Object.entries({id:'id',name:'name',type:'type',value:'value',maxQty:'max-qty',noticeText:'notice',startDate:'start-date',endDate:'end-date'}))byId('discount-'+field).value=d[key]??'';byId('discount-all-products').checked=d.allProducts;byId('discount-active').checked=d.active;byId('discount-product-options').innerHTML=discountProducts().map(p=>`<label class="policy-toggle"><input type="checkbox" value="${p.id}" ${d.productIds.includes(p.id)?'checked':''}><span class="discount-product-name">${escapeDiscount(p.name)}</span><span class="discount-product-price">${Number(p.price).toLocaleString()}원</span></label>`).join('')||'<p>상품 관리에서 굿즈를 먼저 등록해 주세요.</p>';updateProductSelection();byId('delete-discount-policy').hidden=!d.id;byId('discount-error').textContent='';typeChanged();dirty=false;byId('discount-editor-title').textContent=d.id?'할인 수정':'할인 등록';byId('discountDialog').showModal();}
form.addEventListener('input',()=>dirty=true);
byId('discount-type').onchange=typeChanged;
function updateProductSelection(){const all=byId('discount-all-products').checked;byId('discount-selection').hidden=all;byId('discount-target-help').textContent=all?'새로 등록하는 굿즈도 자동으로 포함됩니다.':'선택한 굿즈에만 할인이 적용됩니다.';}
byId('discount-all-products').onchange=updateProductSelection;
byId('add-discount-policy').onclick=()=>openDiscount('');
byId('discount-policy-list').onclick=async e=>{
 const copy=e.target.closest('[data-copy-code]');
 if(copy){
  try{await navigator.clipboard.writeText(copy.dataset.copyCode);discountNotify('프로모션 코드를 복사했습니다.');}
  catch{discountNotify('복사하지 못했습니다. 목록의 코드를 직접 선택해 복사해 주세요.');}
  return;
 }
 const card=e.target.closest('[data-id]');if(card)openDiscount(card.dataset.id);
};
form.onsubmit=e=>{e.preventDefault();const d={mode:byId('discount-mode').value,code:GoodsDiscounts.normalizeCode(byId('discount-code').value),id:byId('discount-id').value||crypto.randomUUID(),name:byId('discount-name').value.trim(),type:byId('discount-type').value,value:Number(byId('discount-value').value),maxQty:Number(byId('discount-max-qty').value),noticeText:byId('discount-notice').value.trim(),startDate:byId('discount-start-date').value,endDate:byId('discount-end-date').value,allProducts:byId('discount-all-products').checked,active:byId('discount-active').checked,productIds:[...byId('discount-product-options').querySelectorAll('input:checked')].map(x=>Number(x.value))};const error=GoodsDiscounts.validate(d,GoodsDiscounts.read());if(error){byId('discount-error').textContent=error;return;}const latest=GoodsDiscounts.read(),index=latest.findIndex(x=>x.id===d.id);if(index<0)latest.push(d);else latest[index]=d;try{localStorage.setItem(GoodsDiscounts.key,JSON.stringify(latest));policies=latest;dirty=false;byId('discountDialog').close();renderList();discountNotify('할인을 저장했습니다.');}catch{byId('discount-error').textContent='저장 공간을 확인하고 다시 시도해 주세요.';}};
byId('delete-discount-policy').onclick=()=>{const existing=policies.find(d=>d.id===byId('discount-id').value);const message=existing?.mode==='code'?'프로모션 코드를 삭제하시겠습니까? 일시 중단하려면 할인 활성화를 해제해 주세요. 삭제 후 같은 코드를 새로 등록하면 사용 한도는 새로 계산됩니다. 기존 주문의 할인 내역은 유지됩니다.':'할인을 삭제하시겠습니까? 기존 주문의 할인 내역은 유지됩니다.';if(!confirm(message))return;try{const latest=GoodsDiscounts.read().filter(d=>d.id!==byId('discount-id').value);localStorage.setItem(GoodsDiscounts.key,JSON.stringify(latest));policies=latest;dirty=false;byId('discountDialog').close();renderList();discountNotify('할인이 삭제되었습니다.');}catch{byId('discount-error').textContent='삭제하지 못했습니다. 다시 시도해 주세요.';}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
renderList();
