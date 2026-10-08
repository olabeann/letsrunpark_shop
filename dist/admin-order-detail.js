const refundArrivalNotice=document.createElement('p');refundArrivalNotice.className='refund-arrival-notice';refundArrivalNotice.textContent='반품 상품이 실제로 도착했는지 확인한 후 환불해 주세요. 사용 흔적·고객 과실 훼손 등 상태 판단이 필요한 경우 환불 완료 처리 없이 고객센터 전화 문의로 안내합니다. 환불 완료 후에도 재고는 자동으로 복원되지 않습니다.';$('refundForm').querySelector('.refund-options').insertAdjacentElement('beforebegin',refundArrivalNotice);
const refundOverrideRow=document.createElement('label');refundOverrideRow.id='refundOverrideRow';refundOverrideRow.hidden=true;refundOverrideRow.innerHTML='<span>기본 배송비 처리 변경 사유 <em>*</em></span><textarea id="refundOverrideReason" name="refundOverrideReason" rows="3" placeholder="기본값과 다르게 처리하는 이유를 입력해 주세요."></textarea><small>내부 처리 이력에만 저장되며 고객에게 표시되지 않습니다.</small>';$('shippingDeductionRow').insertAdjacentElement('afterend',refundOverrideRow);
function refundValues(){const order=orderData.find(o=>o.number===$('refundForm').dataset.number),deduct=$('refundForm').elements.shippingTreatment.value==='deduct',raw=deduct?Number($('shippingDeduction').value||0):0,deduction=Math.max(0,Math.min(order?.total||0,raw)),defaults=refundDefault(order),overridden=deduct!==defaults.deduct||(deduct&&deduction!==defaults.deduction);return {order,deduct,deduction,refund:Math.max(0,(order?.total||0)-deduction),defaults,overridden};}
function updateRefundSummary(){const {order,deduct,deduction,refund,overridden}=refundValues();if(!order)return;$('shippingDeduction').disabled=!deduct;$('refundOverrideRow').hidden=!overridden;$('refundOverrideReason').required=overridden;if(!overridden)$('refundOverrideReason').value='';$('refundPaidAmount').textContent=money(order.total);$('refundDeductionAmount').textContent=deduction?'-'+money(deduction):'차감 없음';$('refundFinalAmount').textContent=money(refund);$('customerRefundNote').value=deduction?`${order.returnReason||'반품'}에 의한 전체 반품으로 배송비 ${deduction.toLocaleString('ko-KR')}원을 차감한 후 ${refund.toLocaleString('ko-KR')}원을 환불해 드렸습니다.`:`${order.returnReason||'전체 반품'} 건은 반품 배송비 차감 없이 결제금액 ${refund.toLocaleString('ko-KR')}원을 전액 환불해 드렸습니다.`;}
function openRefundDialog(number){const order=orderData.find(o=>o.number===number);if(!order||order.returnStatus!=='신청 완료'||!order.returnTrackingNumber)return alert('고객의 반품 운송장번호가 등록된 후 환불 처리할 수 있습니다.');const defaults=refundDefault(order);$('detailDialog').close();$('refundForm').reset();$('refundExtraNote').value='';$('refundForm').dataset.number=number;$('refundOrderNumber').textContent='주문번호 '+number;$('shippingDeduction').value=defaults.deduction;$('shippingDeduction').max=order.total;$('refundFormError').textContent='';$('refundForm').elements.shippingTreatment.value=defaults.deduct?'deduct':'none';updateRefundSummary();$('refundDialog').showModal();}
$('refundForm').querySelectorAll('[name="shippingTreatment"]').forEach(input=>input.onchange=updateRefundSummary);$('shippingDeduction').oninput=updateRefundSummary;
$('refundForm').onsubmit=event=>{event.preventDefault();const {order,deduct,deduction,refund,defaults,overridden}=refundValues(),note=$('customerRefundNote').value.trim(),overrideReason=$('refundOverrideReason').value.trim(),error=$('refundFormError');if(!order||order.returnStatus!=='신청 완료'){error.textContent='반품 신청 상태가 변경되었습니다. 목록을 다시 확인해 주세요.';return;}if((deduct&&deduction<=0)||deduction>order.total){error.textContent='차감할 배송비를 0원보다 크고 결제금액 이하로 입력해 주세요.';return;}if(overridden&&!overrideReason){error.textContent='기본 배송비 처리와 다르게 적용한 사유를 입력해 주세요.';$('refundOverrideReason').focus();return;}if(!note){error.textContent='고객에게 표시할 환불 안내를 입력해 주세요.';return;}if(!confirm(`최종 환불액 ${refund.toLocaleString('ko-KR')}원으로 완료하시겠습니까?\n완료 후에는 되돌리거나 금액을 수정할 수 없으며, 오처리 시 고객이 기존 고객센터 번호로 직접 문의해야 합니다.`))return;const latest=JSON.parse(localStorage.goodsOrders||'[]'),target=latest.find(o=>o.number===order.number);if(!target||target.returnStatus!=='신청 완료'){error.textContent='반품 신청 상태가 변경되었습니다. 목록을 다시 확인해 주세요.';return;}const completedAt=Date.now(),refundDecision={shippingTreatment:deduct?'deduct':'none',defaultShippingTreatment:defaults.deduct?'deduct':'none',shippingDeduction:deduction,defaultShippingDeduction:defaults.deduction,overridden,overrideReason:overridden?overrideReason:'',processedBy:'통합 운영 관리자',processedAt:completedAt,locked:true,correctionRoute:'EXTERNAL_CUSTOMER_CENTER_PHONE'};Object.assign(target,{returnStatus:'환불 완료',shippingDeduction:deduction,refundAmount:refund,customerRefundNote:note,refundCompletedAt:completedAt,refundDecision,refundHistory:[...(target.refundHistory||[]),refundDecision]});localStorage.goodsOrders=JSON.stringify(latest);orderData=latest;$('refundDialog').close();renderOrders();showDetail(target.number);notify('환불 완료로 확정했습니다. 이후 오처리는 고객센터 전화 문의로 처리합니다.');};
$('refundForm').addEventListener('submit',event=>{const latest=JSON.parse(localStorage.goodsOrders||'[]'),target=latest.find(o=>o.number===$('refundForm').dataset.number);if(target?.returnStatus==='신청 완료'&&target.returnTrackingNumber)return;event.preventDefault();event.stopImmediatePropagation();$('refundFormError').textContent='고객의 반품 운송장번호가 등록된 후 환불 처리할 수 있습니다.';},true);
  function mountActionDialog() {


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
    $('orderActionDeduction').value = order.policySnapshot?.returnShippingFee ?? settings.returnShippingFee;
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
    if (order.status === '전체 취소' || ['환불 완료', '반품 반려'].includes(order.returnStatus)) { $('orderActionError').textContent = '이미 처리가 완료된 주문입니다.'; return; }
    if (type === 'exception' && (!order.trackingNumber || order.returnStatus)) { $('orderActionError').textContent = '발송 후 반품 절차가 없는 주문만 예외 환불할 수 있습니다.'; return; }
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

    showDetail(order.number);
  }

function showDetail (number) {
    const order = orderData.find(item => item.number === number);
    if (!order) return;
    detailOrder = order;
    const final = order.status === '전체 취소' || order.returnStatus === '환불 완료' || order.returnStatus === '반품 반려';
    const audit = order.refundDecision ? `<section class="detail-section"><h3>환불 처리 이력</h3><div class="detail-box"><p>처리자: ${esc(order.refundDecision.processedBy)}</p><p>처리 시각: ${esc(new Date(order.refundDecision.processedAt).toLocaleString('ko-KR'))}</p><p>배송비 차감: ${money(order.refundDecision.shippingDeduction)}</p>${order.refundDecision.overridden ? `<p>기본값 변경 사유: ${esc(order.refundDecision.overrideReason)}</p>` : ''}</div></section>` : '';
    const returnBox = order.returnStatus ? `<section class="detail-section"><h3>전체 반품 · 환불</h3><div class="detail-box"><p class="detail-cost"><span>처리 상태</span><b>${esc(paymentLabel(order))}</b></p><p class="detail-cost"><span>반품 사유</span><b>${esc(order.returnReason || '—')}</b></p><p class="detail-cost"><span>반품 운송장</span><b>${order.returnTrackingNumber ? esc(`${order.returnCarrier || '택배사 미등록'} · ${order.returnTrackingNumber}`) : '미등록'}</b></p>${order.returnRejectReason ? `<p class="customer-note-preview"><b>반려 사유</b><br>${esc(order.returnRejectReason)}</p>` : ''}${order.returnStatus === '환불 완료' ? `<p class="detail-cost"><span>배송비 차감</span><b>${order.shippingDeduction ? '-' + money(order.shippingDeduction) : '차감 없음'}</b></p><p class="detail-cost total"><span>최종 환불액</span><b>${money(order.refundAmount ?? order.total)}</b></p><p class="customer-note-preview"><b>고객 안내</b><br>${esc(order.customerRefundNote || '')}${order.customerRefundExtraNote ? `<br>${esc(order.customerRefundExtraNote)}` : ''}</p>` : ''}</div></section>` : '';
    $('orderDetail').innerHTML = `<p><b>${esc(order.number)}</b> <span class="badge">${esc(paymentLabel(order))}</span></p><p class="form-note">${esc(dateText(order))}</p><section class="detail-section"><h3>주문상품</h3><div class="detail-box">${(order.items || []).map(item => `<p class="detail-cost"><span>${esc(item.name + (item.deletedProduct ? ' (삭제된 상품)' : ''))} × ${item.qty}</span><b>${money(item.price * item.qty)}</b></p>`).join('')}</div></section><section class="detail-section"><h3>회원 · 배송정보</h3><div class="detail-box"><p><b>${esc(order.recipient || order.name)}</b> · ${esc(order.recipientPhone || order.phone || '')}</p><p>${esc(order.address || '')}</p>${order.request ? `<p>배송메모: ${esc(order.request)}</p>` : ''}${order.trackingNumber ? `<p>${esc(order.carrier || '')} · ${esc(order.trackingNumber)}</p>` : ''}</div></section>${returnBox}${audit}<section class="detail-section"><h3>결제정보</h3><div class="detail-box"><p class="detail-cost"><span>상품금액</span><b>${money(order.subtotal ?? order.total - (order.shippingFee || 0))}</b></p><p class="detail-cost"><span>배송비</span><b>${money(order.shippingFee || 0)}</b></p><p class="detail-cost total"><span>총 결제금액</span><b>${money(order.total)}</b></p></div></section><p class="form-note">상품·수량 일부 환불은 지원하지 않습니다. 전체 환불 또는 배송비 차감 후 전체 환불만 가능합니다.</p><div class="dialog-footer"><button data-close="detailDialog">닫기</button>${!order.trackingNumber && order.status === '출고 대기' ? '<button id="adminCancelOrder" class="danger">관리자 주문 취소</button>' : ''}${order.returnStatus === '신청 완료' && order.returnTrackingNumber ? '<button id="rejectReturn">반품 반려</button><button id="completeRefund" class="blue">반품 환불 완료</button>' : ''}${order.trackingNumber && !order.returnStatus && !final ? '<button id="exceptionRefund" class="danger">관리자 예외 환불</button>' : ''}</div>`;
    bindClose();
    $('adminCancelOrder')?.addEventListener('click', () => openOrderAction('cancel', order));
    $('rejectReturn')?.addEventListener('click', () => openOrderAction('reject', order));
    $('exceptionRefund')?.addEventListener('click', () => openOrderAction('exception', order));
    $('completeRefund')?.addEventListener('click', () => openRefundDialog(order.number));
    if(!$('detailDialog').open)$('detailDialog').showModal();
  };

function refundDefault(order){
  const deduct=order?.returnReason==='단순 변심';
  const deduction=deduct?Math.min(order.total,order.policySnapshot?.returnShippingFee??settings.returnShippingFee):0;
  return {deduct,deduction};
}
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


$('customerRefundNote').readOnly=true;
$('customerRefundNote').closest('label').querySelector('span').textContent='고객 환불 안내 (자동 생성)';
$('customerRefundNote').closest('label').insertAdjacentHTML('afterend','<label><span>고객 추가 안내 (선택)</span><textarea id="refundExtraNote" rows="3"></textarea></label>');
mountActionDialog();
