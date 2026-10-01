/* 2026-10-01 confirmed commerce policy layer. Loaded after the prototype scripts. */
(() => {
  const PAGE_SIZE = 20;
  let orderPage = 1;
  let productPage = 1;
  let settlementPage = 1;
  let reorderMode = false;

  const day = value => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
  };
  const monthKey = value => day(value).slice(0, 7);
  const normalizeTracking = value => String(value || '').replace(/[\s-]/g, '');
  const activeGoods = () => goods.filter(product => !product.deletedAt);
  const sortedGoods = () => activeGoods().slice().sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || Number(a.id) - Number(b.id));
  const saveAll = () => {
    localStorage.goodsProducts = JSON.stringify(goods);
    localStorage.goodsOrders = JSON.stringify(orderData);
    localStorage.goodsSettings = JSON.stringify(settings);
  };
  const ensurePolicyData = () => {
    settings.returnShippingFee = Number.isFinite(Number(settings.returnShippingFee)) ? Number(settings.returnShippingFee) : 6000;
    orderData.forEach(order => {
      if (order.status === '배송 완료') order.status = '출고 완료';
      delete order.shipmentHistory;
      if (!order.approvedAt) order.approvedAt = order.createdAt;
    });
    const used = new Set();
    const orderSeed = goods.every(product => !Number.isInteger(Number(product.displayOrder)))
      ? goods.slice().sort((a, b) => Number(a.id) - Number(b.id)) : goods;
    orderSeed.forEach((product, index) => {
      let position = Number(product.displayOrder);
      if (!Number.isInteger(position) || position < 1 || used.has(position)) position = index + 1;
      product.displayOrder = position;
      used.add(position);
    });
    saveAll();
  };

  function mountPolicyUi() {
    document.querySelector('.shipping-query-note').textContent = '택배사 배송조회로 연결됩니다. 커머스 상태는 발송 완료까지만 관리합니다.';
    document.querySelectorAll('.shipping-guide p').forEach(node => {
      if (node.textContent.includes('배송 완료 상태')) node.textContent = '택배사 배송조회로 연결되며, 별도의 배송 완료 상태는 사용하지 않습니다.';
    });
    $('keyword').placeholder = '주문번호 / 상품명';
    $('exportOrders').textContent = '검색 결과 전체 내려받기';
    $('exportSettlement').textContent = '정산 엑셀 다운로드 (.xlsx)';
    $('settlementKeyword').placeholder = '주문번호 · 상품명 검색';
    $('settlementShipping').querySelectorAll('option').forEach(option => {
      if (option.value === '배송 완료') option.remove();
    });
    $('shippingFilter').querySelectorAll('option').forEach(option => {
      if (option.value === '배송 완료') option.remove();
    });
    if (!$('paymentFilter').querySelector('[value="return_rejected"]')) {
      $('paymentFilter').insertAdjacentHTML('beforeend', '<option value="return_rejected">반품 반려</option><option value="exception_refunded">관리자 예외 환불</option>');
    }
    const price = $('productEditor').elements.price;
    price.min = '1';
    document.querySelector('.cover-upload h3').innerHTML = '대표 이미지 <em>*</em>';

    const productHeading = $('productCount').closest('.list-heading');
    if (!$('reorderProducts')) productHeading.insertAdjacentHTML('beforeend', '<button id="reorderProducts" type="button">노출 순서 설정</button>');
    if (!$('productPagination')) $('productsTable').insertAdjacentHTML('afterend', '<div id="productPagination" class="pagination policy-pagination"></div>');

    const settingsFields = $('inlineSettingsForm').querySelector('.store-settings-fields');
    if (!$('returnShippingFee')) {
      settingsFields.insertAdjacentHTML('beforeend', '<label><span>단순 변심 반품비 기본값 <em>*</em></span><div class="settings-unit-input"><input id="returnShippingFee" name="returnShippingFee" type="number" min="0" step="100" required><span>원</span></div><small>환불 처리 시 불러오며 건별 수정할 수 있습니다.</small></label>');
      $('returnShippingFee').value = settings.returnShippingFee;
    }
    const originalSettingsSubmit = $('inlineSettingsForm').onsubmit;
    $('inlineSettingsForm').onsubmit = event => {
      originalSettingsSubmit.call($('inlineSettingsForm'), event);
      settings.returnShippingFee = Math.max(0, Number($('returnShippingFee').value) || 0);
      saveAll();
    };

    $('customerRefundNote').readOnly = true;
    $('customerRefundNote').closest('label').querySelector('span').textContent = '고객 환불 안내 (자동 생성)';
    if (!$('refundExtraNote')) $('customerRefundNote').closest('label').insertAdjacentHTML('afterend', '<label><span>고객 추가 안내 (선택)</span><textarea id="refundExtraNote" rows="3" placeholder="필요한 경우에만 추가 안내를 입력해 주세요."></textarea></label>');

    mountAccounts();
    mountActionDialog();
    rebuildSettlementFilter();
  }

  function pagination(container, total, current, onChange) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safe = Math.min(current, pages);
    const start = total ? (safe - 1) * PAGE_SIZE + 1 : 0;
    const end = Math.min(safe * PAGE_SIZE, total);
    container.innerHTML = `<span>${start}–${end} / ${total}건 · ${safe}/${pages}페이지</span><button type="button" data-page="${safe - 1}" ${safe <= 1 ? 'disabled' : ''}>‹</button><button type="button" class="current">${safe}</button><button type="button" data-page="${safe + 1}" ${safe >= pages ? 'disabled' : ''}>›</button>`;
    container.querySelectorAll('[data-page]').forEach(button => button.onclick = () => onChange(Number(button.dataset.page)));
    return safe;
  }

  filteredOrders = function () {
    const keyword = $('keyword').value.trim().toLowerCase();
    const payment = $('paymentFilter').value;
    const shipping = $('shippingFilter').value;
    return orderData.filter(order => {
      const search = [order.number, ...(order.items || []).map(item => item.name)].join(' ').toLowerCase();
      const paymentMatch = !payment
        || (payment === 'cancelled' && order.status === '전체 취소')
        || (payment === 'return_requested' && order.returnStatus === '신청 완료')
        || (payment === 'return_rejected' && order.returnStatus === '반품 반려')
        || (payment === 'refunded' && order.returnStatus === '환불 완료' && order.refundKind !== '관리자 예외 환불')
        || (payment === 'exception_refunded' && order.refundKind === '관리자 예외 환불')
        || (payment === 'paid' && order.status !== '전체 취소' && !order.returnStatus);
      const stageMatch = salesTab !== 'shipping' || (shippingStage === 'pending' ? order.status === '출고 대기' : order.status === '출고 완료');
      const created = day(order.createdAt);
      return stageMatch && (!keyword || search.includes(keyword)) && paymentMatch && (!shipping || order.status === shipping)
        && (!$('startDate').value || created >= $('startDate').value) && (!$('endDate').value || created <= $('endDate').value);
    }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  };

  paymentLabel = function (order) {
    if (order.status === '전체 취소') return '전액 환불 완료';
    if (order.refundKind === '관리자 예외 환불') return '관리자 예외 환불';
    if (order.returnStatus === '환불 완료') return '반품 환불 완료';
    if (order.returnStatus === '반품 반려') return '반품 반려';
    if (order.returnStatus === '신청 완료') return '반품 신청 완료';
    return '결제 완료';
  };

  invoiceCell = function (order) {
    if (salesTab !== 'shipping') return order.trackingNumber
      ? `<div class="invoice-readonly"><span>${esc(order.carrier || '택배사 미등록')}</span><b>${esc(order.trackingNumber)}</b><a class="invoice-lookup" href="${esc(trackingLookupUrl(order.carrier, order.trackingNumber))}" target="_blank" rel="noopener noreferrer">조회 ↗</a></div>`
      : `<span class="invoice-status ${order.status === '전체 취소' ? 'invoice-cancelled' : ''}">${order.status === '전체 취소' ? '취소된 주문' : '미등록'}</span>`;
    if (order.status === '전체 취소') return '<span class="invoice-status invoice-cancelled">취소된 주문</span>';
    if (!['출고 대기', '출고 완료'].includes(order.status)) return '<span class="invoice-status">송장 등록 불가</span>';
    return `<div class="invoice-inline"><select class="invoice-carrier" aria-label="${esc(order.number)} 택배사">${carrierNames.map(carrier => `<option ${carrier === (order.carrier || $('defaultCarrier').value) ? 'selected' : ''}>${carrier}</option>`).join('')}</select><div class="invoice-entry"><input class="tracking-input" aria-label="${esc(order.number)} 송장번호" placeholder="영문·숫자" value="${esc(order.trackingNumber || '')}"><button class="invoice-save">${order.trackingNumber ? '수정' : '등록'}</button>${order.trackingNumber ? `<a class="invoice-lookup" href="${esc(trackingLookupUrl(order.carrier, order.trackingNumber))}" target="_blank" rel="noopener noreferrer">조회 ↗</a>` : ''}</div><p class="invoice-row-error" role="alert"></p></div>`;
  };

  saveRowInvoice = function (row) {
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

  renderOrders = function () {
    const all = filteredOrders();
    orderPage = pagination(document.querySelector('#salesView .pagination'), all.length, orderPage, page => { orderPage = page; renderOrders(); });
    const rows = all.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);
    const shipping = salesTab === 'shipping';
    updatePendingCount();
    $('resultCount').textContent = all.length;
    $('listTitle').firstChild.textContent = shipping ? (shippingStage === 'pending' ? '발송 대기 주문 ' : '발송 완료 주문 ') : '상품 주문 목록 ';
    $('listHint').textContent = shipping ? '주문별로 운송장을 등록합니다. 최초 등록 후에는 삭제할 수 없고 수정만 가능합니다.' : '주문번호와 상품명으로 검색하며, 반품·예외 환불 처리는 상세에서 진행합니다.';
    $('shippingStages').hidden = !shipping;
    $('ordersTable').innerHTML = rows.length ? `<table class="orders-table ${shipping ? 'orders-table--shipping' : 'orders-table--sales'}"><thead><tr><th>주문 일시</th><th>주문번호 · 상품명</th>${shipping ? '<th>구매자 · 배송지</th>' : '<th>구매자</th><th>결제금액</th><th>결제 · 환불</th>'}<th>배송 상태</th><th>송장 정보</th><th>상세</th></tr></thead><tbody>${rows.map(order => `<tr data-number="${esc(order.number)}"><td class="order-date">${esc(dateText(order))}</td><td class="order-summary"><b>${esc(order.number)}</b><div>${(order.items || []).map(item => `<small>${esc(item.name + (item.deletedProduct ? ' (삭제된 상품)' : ''))}${item.qty > 1 ? ` × ${item.qty}` : ''}</small>`).join('')}</div></td>${shipping ? `<td class="shipping-address"><b>${esc(order.recipient || order.name)}</b><small>${esc(order.recipientPhone || order.phone || '')}</small><small>${esc(order.address || '')}</small></td>` : `<td class="buyer-summary"><b>${esc(order.name)}</b><small>${esc(order.phone || '')}</small></td><td><b>${money(order.total)}</b></td><td><span class="badge ${order.returnStatus ? 'return-pending' : ''}">${esc(paymentLabel(order))}</span></td>`}<td><span class="badge ${order.status === '출고 완료' ? 'green' : order.status === '전체 취소' ? 'grey' : ''}">${esc(state(order))}</span></td><td>${invoiceCell(order)}</td><td><button data-detail="${esc(order.number)}">상세보기</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">조건에 맞는 주문이 없습니다.</div>';
    document.querySelectorAll('[data-detail]').forEach(button => button.onclick = () => showDetail(button.dataset.detail));
    document.querySelectorAll('.invoice-save').forEach(button => button.onclick = () => saveRowInvoice(button.closest('tr')));
    document.querySelectorAll('.tracking-input').forEach(input => input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); saveRowInvoice(input.closest('tr')); } });
    syncSharedAdminComponents($('ordersTable'));
  };

  function mountActionDialog() {
    if ($('orderActionDialog')) return;
    document.body.insertAdjacentHTML('beforeend', `<dialog id="orderActionDialog" class="kiosk-dialog"><form id="orderActionForm"><div class="dialog-heading"><h2 id="orderActionTitle">주문 처리</h2><button type="button" data-close="orderActionDialog" aria-label="닫기">×</button></div><p id="orderActionDescription" class="form-note"></p><input id="orderActionNumber" type="hidden"><input id="orderActionType" type="hidden"><div id="orderActionRefundOptions" class="refund-options"><label><input type="radio" name="actionRefund" value="full" checked> 전액 환불</label><label><input type="radio" name="actionRefund" value="deduct"> 배송비 차감 후 환불</label></div><label id="orderActionDeductionRow"><span>배송비 차감액</span><input id="orderActionDeduction" type="number" min="0" step="100"></label><label><span>처리 사유 <em>*</em></span><textarea id="orderActionReason" rows="4" required></textarea></label><label id="orderActionExtraRow"><span>고객 추가 안내 (선택)</span><textarea id="orderActionExtra" rows="3"></textarea></label><p id="orderActionPreview" class="customer-note-preview"></p><p id="orderActionError" class="form-error"></p><div class="dialog-footer"><button type="button" data-close="orderActionDialog">닫기</button><button class="blue">확정</button></div></form></dialog>`);
    bindClose();
    $('orderActionForm').oninput = updateOrderActionPreview;
    $('orderActionForm').onsubmit = submitOrderAction;
  }

  function openOrderAction(type, order) {
    $('detailDialog').close();
    $('orderActionForm').reset();
    $('orderActionNumber').value = order.number;
    $('orderActionType').value = type;
    const rejected = type === 'reject';
    $('orderActionTitle').textContent = rejected ? '반품 반려' : type === 'cancel' ? '관리자 주문 취소' : '관리자 예외 환불';
    $('orderActionDescription').textContent = rejected ? '반려 사유는 고객에게 표시되며, 반려 후 고객이 다시 신청할 수 없습니다.' : type === 'cancel' ? '발송 전 주문은 시간 제한 없이 전액 취소하며 재고를 복원합니다.' : '발송 후 예외적으로 환불합니다. 반품 신청·운송장 없이 처리할 수 있으며 재고는 복원하지 않습니다.';
    $('orderActionRefundOptions').hidden = rejected || type === 'cancel';
    $('orderActionDeductionRow').hidden = rejected || type === 'cancel';
    $('orderActionExtraRow').hidden = rejected || type === 'cancel';
    $('orderActionDeduction').value = settings.returnShippingFee;
    $('orderActionError').textContent = '';
    updateOrderActionPreview();
    $('orderActionDialog').showModal();
  }

  function updateOrderActionPreview() {
    const order = orderData.find(item => item.number === $('orderActionNumber').value);
    if (!order) return;
    const type = $('orderActionType').value;
    if (type === 'reject') { $('orderActionPreview').textContent = '입력한 반려 사유가 고객 주문 상세에 표시됩니다.'; return; }
    const deduct = type === 'exception' && $('orderActionForm').elements.actionRefund.value === 'deduct';
    const amount = deduct ? Math.min(order.total, Math.max(0, Number($('orderActionDeduction').value) || 0)) : 0;
    $('orderActionDeductionRow').hidden = type !== 'exception' || !deduct;
    $('orderActionPreview').textContent = type === 'cancel' ? `전액 ${money(order.total)}을 환불하고 재고를 복원합니다.` : `고객 안내: ${amount ? `배송비 ${money(amount)}을 차감한 ` : ''}최종 환불액은 ${money(order.total - amount)}입니다.`;
  }

  function submitOrderAction(event) {
    event.preventDefault();
    const type = $('orderActionType').value;
    const order = orderData.find(item => item.number === $('orderActionNumber').value);
    const reason = $('orderActionReason').value.trim();
    if (!order || !reason) { $('orderActionError').textContent = '처리 사유를 입력해 주세요.'; return; }
    if (type === 'reject') {
      if (order.returnStatus !== '신청 완료' || !order.returnTrackingNumber) { $('orderActionError').textContent = '반품 운송장이 등록된 신청 건만 반려할 수 있습니다.'; return; }
      Object.assign(order, { returnStatus: '반품 반려', returnRejectedAt: Date.now(), returnRejectReason: reason });
    } else if (type === 'cancel') {
      if (order.trackingNumber || order.status !== '출고 대기') { $('orderActionError').textContent = '발송 전 주문만 관리자 취소할 수 있습니다.'; return; }
      if (order.inventoryApplied !== false) order.items.forEach(item => { const product = goods.find(value => value.id === item.id); if (product) product.stock += item.qty; });
      Object.assign(order, { status: '전체 취소', adminCancelReason: reason, cancelCompletedAt: Date.now() });
    } else {
      const deduct = $('orderActionForm').elements.actionRefund.value === 'deduct';
      const deduction = deduct ? Math.min(order.total, Math.max(0, Number($('orderActionDeduction').value) || 0)) : 0;
      if (deduct && deduction <= 0) { $('orderActionError').textContent = '차감할 배송비를 입력해 주세요.'; return; }
      const refundAmount = order.total - deduction;
      Object.assign(order, { returnStatus: '환불 완료', refundKind: '관리자 예외 환불', refundAmount, shippingDeduction: deduction, refundCompletedAt: Date.now(), exceptionalRefundReason: reason, customerRefundNote: `${deduction ? `배송비 ${money(deduction)}을 차감한 후 ` : ''}${money(refundAmount)}을 환불해 드렸습니다.`, customerRefundExtraNote: $('orderActionExtra').value.trim() });
    }
    saveAll();
    $('orderActionDialog').close();
    renderOrders();
    renderProducts();
    showDetail(order.number);
  }

  showDetail = function (number) {
    const order = orderData.find(item => item.number === number);
    if (!order) return;
    detailOrder = order;
    const final = order.status === '전체 취소' || order.returnStatus === '환불 완료' || order.returnStatus === '반품 반려';
    const returnBox = order.returnStatus ? `<section class="detail-section"><h3>전체 반품 · 환불</h3><div class="detail-box"><p class="detail-cost"><span>처리 상태</span><b>${esc(paymentLabel(order))}</b></p><p class="detail-cost"><span>반품 사유</span><b>${esc(order.returnReason || '—')}</b></p><p class="detail-cost"><span>반품 운송장</span><b>${order.returnTrackingNumber ? esc(`${order.returnCarrier || '택배사 미등록'} · ${order.returnTrackingNumber}`) : '미등록'}</b></p>${order.returnRejectReason ? `<p class="customer-note-preview"><b>반려 사유</b><br>${esc(order.returnRejectReason)}</p>` : ''}${order.returnStatus === '환불 완료' ? `<p class="detail-cost"><span>배송비 차감</span><b>${order.shippingDeduction ? '-' + money(order.shippingDeduction) : '차감 없음'}</b></p><p class="detail-cost total"><span>최종 환불액</span><b>${money(order.refundAmount ?? order.total)}</b></p><p class="customer-note-preview"><b>고객 안내</b><br>${esc(order.customerRefundNote || '')}${order.customerRefundExtraNote ? `<br>${esc(order.customerRefundExtraNote)}` : ''}</p>` : ''}</div></section>` : '';
    $('orderDetail').innerHTML = `<p><b>${esc(order.number)}</b> <span class="badge">${esc(paymentLabel(order))}</span></p><p class="form-note">${esc(dateText(order))}</p><section class="detail-section"><h3>주문상품</h3><div class="detail-box">${(order.items || []).map(item => `<p class="detail-cost"><span>${esc(item.name + (item.deletedProduct ? ' (삭제된 상품)' : ''))} × ${item.qty}</span><b>${money(item.price * item.qty)}</b></p>`).join('')}</div></section><section class="detail-section"><h3>회원 · 배송정보</h3><div class="detail-box"><p><b>${esc(order.recipient || order.name)}</b> · ${esc(order.recipientPhone || order.phone || '')}</p><p>${esc(order.address || '')}</p>${order.trackingNumber ? `<p>${esc(order.carrier || '')} · ${esc(order.trackingNumber)}</p>` : ''}</div></section>${returnBox}<section class="detail-section"><h3>결제정보</h3><div class="detail-box"><p class="detail-cost"><span>상품금액</span><b>${money(order.subtotal ?? order.total - (order.shippingFee || 0))}</b></p><p class="detail-cost"><span>배송비</span><b>${money(order.shippingFee || 0)}</b></p><p class="detail-cost total"><span>총 결제금액</span><b>${money(order.total)}</b></p></div></section><p class="form-note">상품·수량 일부 환불은 지원하지 않습니다. 전체 환불 또는 배송비 차감 후 전체 환불만 가능합니다.</p><div class="dialog-footer"><button data-close="detailDialog">닫기</button>${!order.trackingNumber && order.status === '출고 대기' ? '<button id="adminCancelOrder" class="danger">관리자 주문 취소</button>' : ''}${order.returnStatus === '신청 완료' && order.returnTrackingNumber ? '<button id="rejectReturn">반품 반려</button><button id="completeRefund" class="blue">반품 환불 완료</button>' : ''}${order.trackingNumber && !order.returnStatus && !final ? '<button id="exceptionRefund" class="danger">관리자 예외 환불</button>' : ''}</div>`;
    bindClose();
    $('adminCancelOrder')?.addEventListener('click', () => openOrderAction('cancel', order));
    $('rejectReturn')?.addEventListener('click', () => openOrderAction('reject', order));
    $('exceptionRefund')?.addEventListener('click', () => openOrderAction('exception', order));
    $('completeRefund')?.addEventListener('click', () => openRefundDialog(order.number));
    $('detailDialog').showModal();
  };

  refundDefault = function (order) {
    const deduct = order?.returnReason === '단순 변심';
    const deduction = deduct ? Math.min(order.total, settings.returnShippingFee) : 0;
    return { deduct, deduction };
  };
  const originalRefundOpen = openRefundDialog;
  openRefundDialog = function (number) {
    originalRefundOpen(number);
    $('shippingDeduction').value = settings.returnShippingFee;
    $('refundExtraNote').value = '';
    updateRefundSummary();
  };
  $('refundForm').addEventListener('submit', () => {
    const number = $('refundForm').dataset.number;
    const extra = $('refundExtraNote').value.trim();
    queueMicrotask(() => {
      const latest = JSON.parse(localStorage.goodsOrders || '[]');
      const target = latest.find(item => item.number === number);
      if (!target || target.returnStatus !== '환불 완료') return;
      target.customerRefundExtraNote = extra;
      localStorage.goodsOrders = JSON.stringify(latest);
      orderData = latest;
    });
  });

  renderProducts = function () {
    const search = $('productSearch').value.trim().toLowerCase();
    const status = $('productStatus').value;
    const filtered = sortedGoods().filter(product => (!search || product.name.toLowerCase().includes(search)) && (!status || product.status === status));
    $('productCount').textContent = filtered.length;
    if (reorderMode) return renderReorderProducts(filtered);
    productPage = pagination($('productPagination'), filtered.length, productPage, page => { productPage = page; renderProducts(); });
    const rows = filtered.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
    $('productsTable').innerHTML = rows.length ? `<table><thead><tr><th>순서</th><th>상품</th><th>판매가격</th><th>재고</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(product => `<tr><td>${product.displayOrder}</td><td><div class="product-title"><span class="thumb">${product.image ? `<img src="${esc(product.image)}" alt="">` : esc(product.art || 'GOODS')}</span><b>${esc(product.name)}</b></div></td><td><b>${money(product.price)}</b></td><td><b>${product.stock}개</b></td><td>${product.status === 'hidden' ? '판매 중지' : product.stock === 0 || product.status === 'soldout' ? '품절' : '판매 중'}</td><td><div class="product-actions"><button data-edit="${product.id}">상품 · 재고 수정</button><button class="danger" data-delete-product="${product.id}">삭제</button></div></td></tr>`).join('')}</tbody></table>` : '<div class="empty">조건에 맞는 상품이 없습니다.</div>';
    document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(Number(button.dataset.edit)));
    document.querySelectorAll('[data-delete-product]').forEach(button => button.onclick = () => deleteProduct(Number(button.dataset.deleteProduct)));
    syncSharedAdminComponents($('productsTable'));
  };

  function renderReorderProducts(rows) {
    $('productPagination').innerHTML = '<span>전체 상품을 한 화면에서 정렬합니다. 행을 끌어 놓은 뒤 저장하세요.</span>';
    $('productsTable').innerHTML = `<div class="reorder-toolbar"><button id="saveProductOrder" class="blue">순서 저장</button><button id="cancelProductOrder">취소</button></div><ol id="productOrderList" class="product-order-list">${rows.map(product => `<li draggable="true" data-id="${product.id}"><span class="drag-handle">⋮⋮</span><span>${esc(product.name)}</span><small>${product.status === 'hidden' ? '판매 중지' : product.stock ? '판매 중' : '품절'}</small></li>`).join('')}</ol>`;
    let dragged;
    $('productOrderList').querySelectorAll('li').forEach(row => {
      row.ondragstart = () => { dragged = row; row.classList.add('dragging'); };
      row.ondragend = () => row.classList.remove('dragging');
      row.ondragover = event => { event.preventDefault(); const target = event.currentTarget; if (dragged && target !== dragged) target.parentElement.insertBefore(dragged, target.getBoundingClientRect().top + target.offsetHeight / 2 < event.clientY ? target.nextSibling : target); };
    });
    $('saveProductOrder').onclick = () => {
      [...$('productOrderList').children].forEach((row, index) => { const product = goods.find(item => item.id === Number(row.dataset.id)); if (product) product.displayOrder = index + 1; });
      saveAll(); reorderMode = false; $('reorderProducts').textContent = '노출 순서 설정'; renderProducts();
    };
    $('cancelProductOrder').onclick = () => { reorderMode = false; $('reorderProducts').textContent = '노출 순서 설정'; renderProducts(); };
  }

  deleteProduct = function (id) {
    const product = goods.find(item => item.id === id);
    if (!product || !confirm(`“${product.name}” 상품을 삭제하시겠습니까?\n스토어와 상품 목록에서는 숨겨지지만 과거 주문·정산에는 ‘삭제된 상품’으로 보존됩니다.`)) return;
    Object.assign(product, { deletedAt: Date.now(), deletedBy: '통합 운영 관리자', status: 'hidden' });
    orderData.forEach(order => (order.items || []).forEach(item => { if (item.id === id) item.deletedProduct = true; }));
    saveAll(); renderProducts();
  };

  $('productEditor').onsubmit = event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const id = Number(form.id) || Date.now();
    const price = Number(form.price);
    const stock = Number(form.stock);
    form.detailHtml = DetailEditor.value();
    if (!Number.isInteger(price) || price < 1) { $('productSaveError').textContent = '판매가격은 1원 이상의 정수로 입력해 주세요.'; return; }
    if (!Number.isInteger(stock) || stock < 0) { $('productSaveError').textContent = '재고는 0 이상의 정수로 입력해 주세요.'; return; }
    if (!form.image) { $('productSaveError').textContent = '대표 이미지를 등록해 주세요.'; return; }
    const index = goods.findIndex(product => product.id === id);
    const displayOrder = index >= 0 ? goods[index].displayOrder : Math.max(0, ...activeGoods().map(product => Number(product.displayOrder) || 0)) + 1;
    const value = { ...(index >= 0 ? goods[index] : {}), ...form, id, price, stock, displayOrder, updatedAt: Date.now() };
    if (stock === 0 && value.status === 'sale') value.status = 'soldout';
    if (index >= 0) goods[index] = value; else goods.push({ ...value, art: 'GOODS' });
    saveAll(); $('productDialog').close(); renderProducts();
  };

  function rebuildSettlementFilter() {
    const current = new Date();
    const value = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    $('settlementFilter').innerHTML = `<label>승인월<input id="settlementMonth" type="month" value="${value}"></label><label>결제 · 환불 상태<select id="settlementPayment"><option value="">전체 상태</option><option value="paid">정상 결제</option><option value="cancelled">취소 완료</option><option value="return_requested">환불 처리 대기</option><option value="refunded">환불 완료</option></select></label><button class="blue">조회</button>`;
    $('settlementFilter').onsubmit = event => { event.preventDefault(); settlementPage = 1; renderSettlement(); };
    $('settlementSearch').onsubmit = event => { event.preventDefault(); settlementPage = 1; renderSettlement(); };
  }

  function settlementRows() {
    const month = $('settlementMonth').value;
    const keyword = $('settlementKeyword').value.trim().toLowerCase();
    const payment = $('settlementPayment').value;
    const rows = [];
    orderData.forEach(order => {
      const names = (order.items || []).map(item => item.name).join(' / ');
      const search = `${order.number} ${names}`.toLowerCase();
      if (keyword && !search.includes(keyword)) return;
      if (monthKey(order.approvedAt || order.createdAt) === month && (!payment || payment === 'paid')) rows.push({ date: day(order.approvedAt || order.createdAt), order, type: '승인', amount: Number(order.total) || 0, fee: -Math.round((Number(order.total) || 0) * .02), status: '정상 결제' });
      const refundDate = order.refundCompletedAt || order.cancelCompletedAt;
      if (monthKey(refundDate) === month && (!payment || ['refunded', 'cancelled'].includes(payment))) {
        const refund = order.status === '전체 취소' ? Number(order.total) || 0 : Number(order.refundAmount) || 0;
        rows.push({ date: day(refundDate), order, type: '환불', amount: -refund, fee: Math.round(refund * .02), status: order.status === '전체 취소' ? '취소 완료' : paymentLabel(order) });
      }
      if (order.returnStatus === '신청 완료' && monthKey(order.approvedAt || order.createdAt) === month && (!payment || payment === 'return_requested')) rows.push({ date: day(order.returnRequestedAt), order, type: '처리 대기', amount: 0, fee: 0, status: '환불 처리 대기' });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }

  function payoutDate(month) {
    const [year, value] = month.split('-').map(Number);
    const date = new Date(year, value, 8);
    const holidays = new Set(JSON.parse(localStorage.goodsBusinessHolidays || '[]'));
    while ([0, 6].includes(date.getDay()) || holidays.has(day(date))) date.setDate(date.getDate() + 1);
    return day(date);
  }

  renderSettlement = function () {
    const all = settlementRows();
    const gross = all.filter(row => row.type === '승인').reduce((sum, row) => sum + row.amount, 0);
    const refund = -all.filter(row => row.type === '환불').reduce((sum, row) => sum + row.amount, 0);
    const fee = all.reduce((sum, row) => sum + row.fee, 0);
    const carryIn = Number(localStorage.goodsSettlementCarry || 0);
    const raw = gross - refund + fee - carryIn;
    const payout = Math.max(0, raw);
    const carryOut = Math.max(0, -raw);
    $('settlementGross').textContent = money(gross);
    $('settlementPaidCount').textContent = `승인 ${all.filter(row => row.type === '승인').length}건`;
    $('settlementRefund').textContent = refund ? '-' + money(refund) : money(0);
    $('settlementRefundCount').textContent = `취소 · 환불 ${all.filter(row => row.type === '환불').length}건`;
    $('settlementPgFee').textContent = fee ? (fee < 0 ? '-' : '+') + money(Math.abs(fee)) : money(0);
    $('settlementPayout').textContent = money(payout);
    document.querySelector('#settlementPayout + span').textContent = `지급 예정 ${payoutDate($('settlementMonth').value)} · 차감 이월액 ${money(carryOut)}`;
    $('settlementCount').textContent = `${all.length}건`;
    settlementPage = pagination(document.querySelector('#settlementView .pagination'), all.length, settlementPage, page => { settlementPage = page; renderSettlement(); });
    const rows = all.slice((settlementPage - 1) * PAGE_SIZE, settlementPage * PAGE_SIZE);
    $('settlementTable').innerHTML = rows.length ? `<table class="settlement-table"><thead><tr><th>주문번호 · 상품명</th><th>처리일</th><th>구분</th><th>금액</th><th>PG 수수료 조정</th><th>정산 반영액</th><th>상태</th></tr></thead><tbody>${rows.map(row => `<tr><td><b>${esc(row.order.number)}</b><small>${esc((row.order.items || []).map(item => item.name + (item.deletedProduct ? ' (삭제된 상품)' : '')).join(' / '))}</small></td><td>${row.date}</td><td>${row.type}</td><td class="${row.amount < 0 ? 'refund-value' : ''}">${row.amount < 0 ? '-' : ''}${money(Math.abs(row.amount))}</td><td>${row.fee ? `${row.fee < 0 ? '-' : '+'}${money(Math.abs(row.fee))}` : '—'}</td><td><b>${row.amount + row.fee < 0 ? '-' : ''}${money(Math.abs(row.amount + row.fee))}</b></td><td><span class="badge">${esc(row.status)}</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty">해당 승인월의 정산 내역이 없습니다.</div>';
    syncSharedAdminComponents($('settlementTable'));
  };

  function crc32(bytes) {
    let crc = -1;
    for (const byte of bytes) { crc ^= byte; for (let index = 0; index < 8; index++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0); }
    return (crc ^ -1) >>> 0;
  }
  const u16 = value => [value & 255, value >>> 8 & 255];
  const u32 = value => [value & 255, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 & 255];
  function makeXlsx(rows) {
    const encoder = new TextEncoder();
    const xml = value => String(value ?? '').replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));
    const files = {
      '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="정산" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
      'xl/worksheets/sheet1.xml': `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => { const ref = String.fromCharCode(65 + columnIndex) + (rowIndex + 1); return typeof value === 'number' ? `<c r="${ref}"><v>${value}</v></c>` : `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`; }).join('')}</row>`).join('')}</sheetData></worksheet>`
    };
    const local = [], central = []; let offset = 0;
    Object.entries(files).forEach(([name, content]) => {
      const nameBytes = encoder.encode(name), data = encoder.encode(content), crc = crc32(data);
      const header = new Uint8Array([80,75,3,4,20,0,0,0,0,0,0,0,0,0,...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),0,0]);
      local.push(header, nameBytes, data);
      const directory = new Uint8Array([80,75,1,2,20,0,20,0,0,0,0,0,0,0,0,0,...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),0,0,0,0,0,0,0,0,0,0,0,0,...u32(offset)]);
      central.push(directory, nameBytes); offset += header.length + nameBytes.length + data.length;
    });
    const centralSize = central.reduce((sum, part) => sum + part.length, 0), count = Object.keys(files).length;
    return new Blob([...local, ...central, new Uint8Array([80,75,5,6,0,0,0,0,...u16(count),...u16(count),...u32(centralSize),...u32(offset),0,0])], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  $('exportSettlement').onclick = () => {
    const rows = [['승인월', $('settlementMonth').value], ['지급 예정일', payoutDate($('settlementMonth').value)], [], ['처리일', '주문번호', '상품명', '구분', '금액', 'PG 수수료 조정', '정산 반영액', '상태']];
    settlementRows().forEach(row => rows.push([row.date, row.order.number, (row.order.items || []).map(item => item.name).join(' / '), row.type, row.amount, row.fee, row.amount + row.fee, row.status]));
    const link = document.createElement('a'); link.href = URL.createObjectURL(makeXlsx(rows)); link.download = `커머스_정산_${$('settlementMonth').value}.xlsx`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  function mountAccounts() {
    const link = [...document.querySelectorAll('.sidebar nav a')].find(node => node.textContent.includes('계정 · 권한'));
    if (!link) return;
    const button = document.createElement('button'); button.dataset.view = 'accounts'; button.innerHTML = link.innerHTML; link.replaceWith(button);
    $('admin-main').insertAdjacentHTML('beforeend', `<section id="accountsView" class="admin-view" hidden><div class="page-heading"><div><h1>계정 · 권한</h1><p>기존 계정 정보와 별개로 커머스 관리자 권한을 부여합니다.</p></div></div><div class="account-policy-note">통합 관리자는 기본으로 권한이 부여됩니다. 일반 계정은 아래 항목을 개별 선택합니다.</div><div id="accountsTable" class="table-wrap"></div></section>`);
    button.onclick = () => {
      document.querySelectorAll('[data-view]').forEach(node => node.classList.toggle('active', node === button));
      $('salesView').hidden = true; $('settlementView').hidden = true; $('operationsView').hidden = true; $('accountsView').hidden = false;
      renderAccounts(); document.title = '계정 · 권한 | 렛츠런파크 관리자';
    };
  }

  function bindPrimaryNavigation() {
    document.querySelectorAll('[data-view]').forEach(button => {
      if (button.dataset.view === 'accounts') return;
      button.addEventListener('click', () => {
        const view = button.dataset.view;
        document.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('active', item === button));
        salesTab = view === 'shipping' ? 'shipping' : 'orders';
        shippingStage = 'pending';
        $('salesView').hidden = !['sales', 'shipping'].includes(view);
        $('settlementView').hidden = view !== 'settlement';
        $('operationsView').hidden = view !== 'operations';
        $('accountsView').hidden = true;
        if (view === 'sales' || view === 'shipping') {
          $('salesHeading').textContent = view === 'shipping' ? '배송 처리' : '상품 판매 현황';
          $('salesDescription').textContent = view === 'shipping' ? '발송할 주문의 송장번호를 입력하고 발송 완료로 변경합니다.' : '주문별 구매 상품, 결제 내역과 배송 상태를 확인합니다.';
          $('shippingFilter').closest('label').hidden = view === 'shipping';
          $('paymentFilter').closest('label').hidden = view === 'shipping';
          $('filterForm').classList.toggle('shipping-mode', view === 'shipping');
          renderOrders();
        }
        if (view === 'settlement') renderSettlement();
        if (view === 'operations') showOperationTab(location.hash.slice(1));
        const titles = { sales: '상품 판매 현황', shipping: '배송 처리', settlement: '매출 · 정산', operations: '온라인 스토어 운영' };
        document.title = `${titles[view]} | 렛츠런파크 관리자`;
      });
    });
  }

  function renderAccounts() {
    const defaults = [{ id: 'integrated', region: '전체 지역', department: '통합 운영', login: 'admin@letsrunpark.kr', integrated: true, commerce: true }, { id: 'seoul-pr', region: '서울', department: '홍보부', login: 'name@letsrunpark.kr', commerce: false }];
    const accounts = JSON.parse(localStorage.goodsAdminAccounts || 'null') || defaults;
    $('accountsTable').innerHTML = `<table><thead><tr><th>지역</th><th>부서</th><th>로그인 ID</th><th>계정 유형</th><th>커머스 관리자 권한</th></tr></thead><tbody>${accounts.map(account => `<tr><td>${esc(account.region)}</td><td>${esc(account.department)}</td><td>${esc(account.login)}</td><td>${account.integrated ? '통합 관리자' : '지역 관리자'}</td><td><label class="permission-toggle"><input type="checkbox" data-account-commerce="${account.id}" ${account.commerce ? 'checked' : ''} ${account.integrated ? 'disabled' : ''}><span>${account.commerce ? '부여' : '미부여'}</span></label></td></tr>`).join('')}</tbody></table>`;
    document.querySelectorAll('[data-account-commerce]').forEach(input => input.onchange = () => { const account = accounts.find(item => item.id === input.dataset.accountCommerce); account.commerce = input.checked; input.nextElementSibling.textContent = input.checked ? '부여' : '미부여'; localStorage.goodsAdminAccounts = JSON.stringify(accounts); });
  }

  ensurePolicyData();
  mountPolicyUi();
  bindPrimaryNavigation();
  $('reorderProducts').onclick = () => { reorderMode = !reorderMode; $('reorderProducts').textContent = reorderMode ? '순서 설정 중' : '노출 순서 설정'; renderProducts(); };
  $('filterForm').onsubmit = event => { event.preventDefault(); orderPage = 1; renderOrders(); };
  $('resetFilters').onclick = () => { $('filterForm').reset(); orderPage = 1; renderOrders(); };
  $('productFilter').onsubmit = event => { event.preventDefault(); productPage = 1; renderProducts(); };
  document.querySelectorAll('[data-shipping-stage]').forEach(button => button.addEventListener('click', () => { orderPage = 1; }));
  renderOrders();
  renderProducts();
  renderSettlement();
})();
