// Manual shipping entry for the local store interface.
const shippingCarriers=['CJ대한통운','한진택배','롯데택배','우체국택배','로젠택배'];
const defaultCarrierSelect=document.getElementById('defaultCarrier');
let defaultCarrier=localStorage.goodsDefaultCarrier||shippingCarriers[0];
defaultCarrierSelect.innerHTML=shippingCarriers.map(c=>`<option ${c===defaultCarrier?'selected':''}>${c}</option>`).join('');
defaultCarrierSelect.onchange=()=>{defaultCarrier=defaultCarrierSelect.value;localStorage.goodsDefaultCarrier=defaultCarrier;};
const renderBaseAdmin=renderAdmin;
renderAdmin=function(){
  renderBaseAdmin();
  adminOrders.innerHTML=orders.length?`<div class="shipping-table-wrap"><table class="admin-table shipping-table"><thead><tr><th><input id="selectAllShipments" type="checkbox" aria-label="발송 대기 주문 전체 선택"></th><th>주문번호 / 주문일</th><th>수령인 / 배송지</th><th>주문상품</th><th>상태</th><th>택배사</th><th>송장번호</th></tr></thead><tbody>${orders.map((o,index)=>`<tr data-order-index="${index}"><td>${o.status==='출고 대기'?'<input class="shipment-select" type="checkbox" aria-label="'+escapeText(o.number)+' 발송 선택">':''}</td><td>${escapeText(o.number)}<br><small>${escapeText(o.date)}</small></td><td>${escapeText(o.recipient||o.name)}<br>${escapeText(o.recipientPhone||o.phone)}<br>${escapeText(o.address)}</td><td>${o.items.map(i=>escapeText(i.name)+' × '+i.qty).join('<br>')}</td><td>${escapeText(orderStatusLabel(o))}</td><td>${o.status==='출고 대기'?`<select class="shipment-carrier" aria-label="${escapeText(o.number)} 택배사"><option value="">기본 택배사 사용</option>${shippingCarriers.map(c=>`<option ${o.carrier===c?'selected':''}>${c}</option>`).join('')}</select>`:escapeText(o.carrier||'—')}</td><td>${o.status==='출고 대기'?`<input class="shipment-tracking" aria-label="${escapeText(o.number)} 송장번호" inputmode="numeric" placeholder="송장번호 입력" value="${escapeText(o.trackingNumber||'')}">`:escapeText(o.trackingNumber||'—')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">주문 내역이 없습니다.</p>';
  document.getElementById('selectAllShipments')?.addEventListener('change',e=>{document.querySelectorAll('.shipment-select').forEach(box=>box.checked=e.target.checked);});
};
document.getElementById('markShipped').onclick=()=>{
  const status=document.getElementById('shippingStatus');
  const rows=[...document.querySelectorAll('.shipment-select:checked')].map(box=>box.closest('tr'));
  if(!rows.length){status.textContent='발송할 주문을 선택해 주세요.';return;}
  const updates=rows.map(row=>({order:orders[Number(row.dataset.orderIndex)],carrier:row.querySelector('.shipment-carrier').value||defaultCarrier,tracking:row.querySelector('.shipment-tracking').value.trim().replace(/[\s-]/g,'')}));
  const invalid=updates.find(x=>!/^\d{8,30}$/.test(x.tracking));
  if(invalid){status.textContent=invalid.order.number+'의 송장번호를 확인해 주세요. 숫자 8~30자리로 입력해 주세요.';rows[updates.indexOf(invalid)].querySelector('.shipment-tracking').focus();return;}
  if(new Set(updates.map(x=>x.carrier+':'+x.tracking)).size!==updates.length||updates.some(x=>orders.some(o=>o!==x.order&&o.status!=='전체 취소'&&o.carrier===x.carrier&&o.trackingNumber===x.tracking))){status.textContent='같은 택배사의 송장번호가 중복되었습니다. 주문별 송장번호를 확인해 주세요.';return;}
  updates.forEach(x=>{x.order.carrier=x.carrier;x.order.trackingNumber=x.tracking;x.order.shippedAt=Date.now();x.order.status='출고 완료';});
  save();renderAdmin();renderOrders();status.textContent=updates.length+'건을 발송 완료 처리했습니다.';
};
function routeAdminShipping(){const show=location.hash==='#admin';adminPanel.classList.toggle('hidden',!show);if(show){document.querySelector('[data-tab="orderAdmin"]').click();renderAdmin();}}
adminClose.onclick=()=>{location.hash='products';};
window.addEventListener('hashchange',routeAdminShipping);
renderAdmin();routeAdminShipping();
