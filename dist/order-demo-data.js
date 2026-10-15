// Shared developer fixtures. Add missing IDs only; never reset edited orders.
const OrderDemoData = {
  seed(orders, now = Date.now()) {
    const hour = 3600000;
    const scenarios = [
      ['RETURN-READY-CHANGE', '반품 가능 · 단순 변심', 'ready', '단순 변심'],
      ['RETURN-READY-DEFECT', '반품 가능 · 상품 불량', 'ready', '상품 불량·파손'],
      ['RETURN-WAIT-CHANGE', '반품 송장 대기 · 변심', 'waiting', '단순 변심'],
      ['RETURN-WAIT-WRONG', '반품 송장 대기 · 오배송', 'waiting', '오배송'],
      ['RETURN-DONE-FULL', '반품 완료 · 전액 환불', 'returned', '상품 불량·파손', 0],
      ['RETURN-DONE-DEDUCT', '반품 완료 · 배송비 차감', 'returned', '단순 변심', 6000],
      ['SHIP-PENDING', '배송 준비 · 취소 가능', 'pending'],
      ['SHIP-SENT', '발송 완료 · 반품 가능', 'shipped'],
      ['CANCELLED', '발송 전 취소 · 전액 환불', 'cancelled'],
      ['EXCEPTION-FULL', '예외 환불 · 전액', 'exception', '', 0],
      ['EXCEPTION-DEDUCT', '예외 환불 · 배송비 차감', 'exception', '', 6000],
      ['RETURN-LEGACY-REJECT', '기존 반려 이력 · 조회 전용', 'rejected', '단순 변심']
    ];
    const existing = new Set(orders.map(order => order.number));
    for (const [index, [id, label, state, reason, deduction]] of scenarios.entries()) {
      const number = 'G-DEMO-' + id;
      if (existing.has(number)) continue;
      const createdAt = now - (index + 1) * 60000;
      const order = {
        number, demo: true, demoScenario: label, name: '[예시] ' + label,
        recipient: '시연 고객', phone: '010-0000-0000', recipientPhone: '010-0000-0000',
        address: '경기도 과천시 경마공원대로 107, 시연 수령처',
        request: '개발 확인용 예시 주문입니다.',
        createdAt, approvedAt: createdAt, date: new Date(createdAt).toLocaleDateString('ko-KR'),
        cancelUntil: createdAt + 24 * hour,
        items: [{id: 2, name: '경주마 인형 A', price: 26000, qty: 2}],
        subtotal: 52000, shippingFee: 3000, total: 55000, inventoryApplied: false,
        status: '출고 대기', returnDays: 14,
        policySnapshot: {shippingFee: 3000, cancelHours: 24, returnDays: 14, returnShippingFee: 6000}
      };
      if (!['pending', 'cancelled'].includes(state)) {
        Object.assign(order, {status: '출고 완료', carrier: 'CJ대한통운',
          trackingNumber: '00000000' + String(index + 1).padStart(4, '0'), shippedAt: createdAt + 1000});
      }
      if (['ready', 'waiting', 'returned', 'rejected'].includes(state)) {
        Object.assign(order, {returnStatus: '신청 완료', returnReason: reason,
          returnDetail: '개발 확인용 전체 반품 예시입니다.', returnMethod: '고객 직접 반송(착불)',
          returnRequestedAt: createdAt + 2000});
        if (state !== 'waiting') Object.assign(order, {returnCarrier: 'CJ대한통운',
          returnTrackingNumber: '00000001' + String(index + 1).padStart(4, '0')});
      }
      if (state === 'cancelled') Object.assign(order, {
        status: '전체 취소', cancelCompletedAt: createdAt + 3000, adminCancelReason: '시연용 발송 전 전체 취소'
      });
      if (state === 'returned' || state === 'exception') {
        Object.assign(order, {returnStatus: '환불 완료', shippingDeduction: deduction,
          refundAmount: order.total - deduction, refundCompletedAt: createdAt + 3000,
          customerRefundNote: deduction ? '반품 배송비 6,000원을 차감하여 49,000원을 환불했습니다.' : '결제금액 55,000원을 전액 환불했습니다.'});
        if (state === 'exception') Object.assign(order, {
          refundKind: '관리자 예외 환불', exceptionalRefundReason: '시연용 고객 협의에 따른 예외 환불'
        });
        else {
          order.refundDecision = {shippingTreatment: deduction ? 'deduct' : 'none',
            defaultShippingTreatment: deduction ? 'deduct' : 'none',
            shippingDeduction: deduction, defaultShippingDeduction: deduction, overridden: false,
            overrideReason: '', processedBy: '시연 관리자', processedAt: order.refundCompletedAt,
            locked: true, correctionRoute: 'EXTERNAL_CUSTOMER_CENTER_PHONE'};
          order.refundHistory = [{...order.refundDecision}];
        }
      }
      if (state === 'rejected') Object.assign(order, {
        returnStatus: '반품 반려', returnRejectReason: '기존 반려 이력 조회용 예시입니다. 신규 반려 처리는 제공하지 않습니다.'
      });
      orders.push(order);
    }
    return orders;
  }
};
