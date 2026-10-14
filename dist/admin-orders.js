let orderPage=1,shippingStage="pending",detailOrder=null;const salesTab=document.body.dataset.page=== "shipping"?"shipping":"orders";
function bindShippingGuide(){
 const guide=document.querySelector('.shipping-guide'),content=guide?.querySelector(':scope>div');if(!guide||!content)return;
 const toggle=document.createElement('button');toggle.type='button';toggle.className='shipping-guide-toggle';toggle.setAttribute('aria-controls','shippingGuideDetails');content.id='shippingGuideDetails';
 const setCollapsed=collapsed=>{guide.classList.toggle('is-collapsed',collapsed);content.hidden=collapsed;toggle.setAttribute('aria-expanded',String(!collapsed));toggle.textContent=collapsed?'안내 펼치기':'안내 접기';};
 guide.querySelector('h2').insertAdjacentElement('afterend',toggle);setCollapsed(localStorage.getItem('shippingGuideCollapsed')==='true');
 toggle.onclick=()=>{const collapsed=!guide.classList.contains('is-collapsed');setCollapsed(collapsed);localStorage.setItem('shippingGuideCollapsed',String(collapsed));};
}
  const normalizeTracking = value => String(value || '').replace(/[\s-]/g, '');
function filteredOrders () {
    const keyword = $('keyword').value.trim().toLowerCase();
    const payment = $('paymentFilter').value;
    const shipping = $('shippingFilter').value;
    const returned = $('returnFilter').value;
    return orderData.filter(order => {
      const search = [order.number, ...(order.items || []).map(item => item.name)].join(' ').toLowerCase();
      const paymentMatch = !payment || paymentStateKey(order) === payment;
      const stageMatch = salesTab !== 'shipping' || (shippingStage === 'pending' ? order.status === '출고 대기' : order.status === '출고 완료');
      const created = day(order.createdAt);
      return stageMatch && (salesTab !== 'shipping' || shippingStage !== 'pending' || !order.returnStatus) && (!keyword || search.includes(keyword)) && paymentMatch && (!shipping || order.status === shipping) && (!returned || returnStateKey(order) === returned)
        && (!$('startDate').value || created >= $('startDate').value) && (!$('endDate').value || created <= $('endDate').value);
    }).sort((a, b) => salesTab === 'shipping' ? (shippingStage === 'pending' ? (a.createdAt || 0) - (b.createdAt || 0) : (b.shippedAt || 0) - (a.shippedAt || 0)) || String(b.number).localeCompare(String(a.number)) : (b.createdAt || 0) - (a.createdAt || 0) || String(b.number).localeCompare(String(a.number)));
  };

function paymentLabel (order) { return paymentStateLabel(order); }

function invoiceCell (order) {
    if (salesTab !== 'shipping') return readonlyInvoice(order);
    if (order.status === '전체 취소') return '<span class="invoice-status invoice-cancelled">취소된 주문</span>';
    if (!['출고 대기', '출고 완료'].includes(order.status)) return '<span class="invoice-status">송장 등록 불가</span>';
    return `<div class="invoice-inline"><select class="invoice-carrier" aria-label="${esc(order.number)} 택배사">${carrierNames.map(carrier => `<option ${carrier === (order.carrier || (localStorage.goodsDefaultCarrier||carrierNames[0])) ? 'selected' : ''}>${carrier}</option>`).join('')}</select><div class="invoice-entry"><input class="tracking-input" aria-label="${esc(order.number)} 송장번호" placeholder="영문·숫자" value="${esc(order.trackingNumber || '')}"><button class="invoice-save">${order.trackingNumber ? '수정' : '등록'}</button>${order.trackingNumber ? `<a class="invoice-lookup" href="${esc(trackingLookupUrl(order.carrier, order.trackingNumber))}" target="_blank" rel="noopener noreferrer">조회 ↗</a>` : ''}</div><p class="invoice-row-error" role="alert"></p></div>`;
  };

function saveRowInvoice (row) {
    const number = row.dataset.number;
    const order = orderData.find(item => item.number === number);
    const error = row.querySelector('.invoice-row-error');
    const tracking = normalizeTracking(row.querySelector('.tracking-input')?.value);
    if (!order || !['출고 대기', '출고 완료'].includes(order.status)) return;
    if (!tracking || !/^[A-Za-z0-9]+$/.test(tracking)) {
      error.textContent = '공백과 하이픈을 제외한 영문·숫자만 입력해 주세요.';
      return;
    }
    const first = !order.trackingNumber;
    if (first && !confirm('등록 후 운송장 정보는 삭제할 수 없으며 수정만 가능합니다. 발송 완료로 처리하시겠습니까?')) return;
    order.carrier = row.querySelector('.invoice-carrier').value;
    order.trackingNumber = tracking;
    if (first) {
      order.status = '출고 완료';
      order.shippedAt = Date.now();
    }
    delete order.shipmentHistory;
    saveAll();
    renderOrders();
    notify(first ? '운송장을 등록하고 발송 완료로 변경했습니다.' : '운송장 정보를 수정했습니다.');
  };

function renderOrders () {
    const all = filteredOrders();
    orderPage = pagination(document.querySelector('#salesView .pagination'), all.length, orderPage, page => { orderPage = page; renderOrders(); });
    const rows = all.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);
    const shipping = salesTab === 'shipping';
    updatePendingCount();
    $('resultCount').textContent = all.length;
    $('listTitle').firstChild.textContent = shipping ? (shippingStage === 'pending' ? '발송 대기 주문 ' : '발송 완료 주문 ') : '상품 주문 목록 ';
    $('listHint').textContent = shipping ? '주문별로 운송장을 등록합니다. 최초 등록 후에는 삭제할 수 없고 수정만 가능합니다.' : '결제·환불, 배송, 반품 상태를 각각 확인합니다. 반품·환불 처리는 상세보기에서 진행합니다.';
    $('shippingStages').hidden = !shipping;
    $('ordersTable').innerHTML = rows.length ? `<table class="orders-table ${shipping ? 'orders-table--shipping' : 'orders-table--sales'}"><thead><tr><th>주문 일시</th><th>주문번호 · 상품명</th>${shipping ? '<th>구매자 · 배송지</th>' : '<th>구매자</th><th>결제금액</th><th>결제 · 환불</th>'}<th>배송 상태</th>${shipping ? '' : '<th>반품 상태</th>'}${shipping ? '<th>송장 정보</th>' : ''}<th>상세</th></tr></thead><tbody>${rows.map(order => `<tr data-number="${esc(order.number)}"><td class="order-date">${esc(dateText(order))}</td><td class="order-summary"><b>${esc(order.number)}</b><div>${(order.items || []).map(item => `<small>${esc(item.name + (item.deletedProduct ? ' (삭제된 상품)' : ''))}${item.qty > 1 ? ` × ${item.qty}` : ''}</small>`).join('')}</div></td>${shipping ? `<td class="shipping-address"><b>${esc(order.recipient || order.name)}</b><small>${esc(order.recipientPhone || order.phone || '')}</small><small>${esc(order.address || '')}</small><small>${esc(order.request || '')}</small></td>` : `<td class="buyer-summary"><b>${esc(order.name)}</b><small>${esc(order.phone || '')}</small></td><td><b>${money(order.total)}</b></td><td><span class="badge ${paymentStateKey(order) === 'refunded' ? 'grey' : ''}">${esc(paymentLabel(order))}</span></td>`}<td><span class="badge ${order.status === '출고 완료' ? 'green' : order.status === '전체 취소' ? 'grey' : ''}">${esc(state(order))}</span></td>${shipping ? '' : `<td><span class="badge ${returnStateKey(order) === 'requested' ? 'return-pending' : 'grey'}">${esc(returnStateLabel(order))}</span></td>`}${shipping ? `<td>${invoiceCell(order)}</td>` : ''}<td><button data-detail="${esc(order.number)}">상세보기</button></td></tr>`).join('')}</tbody></table>` : EmptyStates.html(salesTab==='shipping'?(shippingStage==='pending'?'shippingPending':'shippingDone'):orderData.length?'adminOrderSearch':'adminOrders');
    document.querySelectorAll('[data-detail]').forEach(button => button.onclick = () => showDetail(button.dataset.detail));
    document.querySelectorAll('.invoice-save').forEach(button => button.onclick = () => saveRowInvoice(button.closest('tr')));
    document.querySelectorAll('.tracking-input').forEach(input => input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); saveRowInvoice(input.closest('tr')); } });
    syncSharedAdminComponents($('ordersTable'));
  };


$('keyword').placeholder='주문번호 / 상품명';
$('paymentFilter').innerHTML='<option value="">전체 상태</option><option value="paid">결제 완료</option><option value="refunded">환불 완료</option>';
$('filterForm').onsubmit=event=>{event.preventDefault();orderPage=1;renderOrders();};
$('resetFilters').onclick=()=>{$('filterForm').reset();orderPage=1;renderOrders();};
window.addEventListener('admin-data-change',renderOrders);
