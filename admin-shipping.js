$('salesHeading').textContent='배송 처리';$('salesDescription').textContent='발송할 주문의 송장번호를 입력하고 발송 완료로 변경합니다.';
$('shippingFilter').closest('label').hidden=true;$('paymentFilter').closest('label').hidden=true;$('filterForm').classList.add('shipping-mode');
document.querySelectorAll('[data-shipping-stage]').forEach(button=>button.onclick=()=>{shippingStage=button.dataset.shippingStage;orderPage=1;document.querySelectorAll('[data-shipping-stage]').forEach(item=>item.classList.toggle('active',item===button));renderOrders();});
bindShippingGuide();renderOrders();
