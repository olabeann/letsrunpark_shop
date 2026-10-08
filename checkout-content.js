// Shared checkout copy defaults and numeric placeholders.
const CheckoutContent = {
  defaults: {
    purchaseNoticesText: '상품과 수량, 배송지 정보를 확인해 주세요. 결제 시 재고가 부족하면 구매할 수 없습니다.\n{배송안내}\n배송비는 주문당 {배송비}입니다.\n결제 후 {취소시간}시간 이내, 운송장 등록 전까지 주문 전체 취소 및 전액 환불이 가능합니다.\n운송장 등록 후 {반품기간}일 이내 주문 전체 반품을 신청할 수 있습니다. 불량·오배송 등 법정 예외는 고객센터로 문의해 주세요.',
    purchaseAgreementText: '구매·배송·취소·반품 조건을 확인하고 동의합니다.',
    privacyAgreementText: '주문 및 배송을 위한 개인정보 수집·이용에 동의합니다.',
    purchasePolicyVersion: 'commerce-policy-v1',
    privacyPolicyVersion: 'privacy-order-v1'
  },
  resolve(text, settings) {
    const values = {'배송안내': settings.shippingNotice, '배송비': Number(settings.shippingFee).toLocaleString('ko-KR') + '원', '취소시간': settings.cancelHours, '반품기간': settings.returnDays};
    return String(text).replace(/\{(배송안내|배송비|취소시간|반품기간)\}/g, (_, key) => values[key]);
  }
};
