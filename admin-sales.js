function openLinkedOrder() {
 const number = new URLSearchParams(location.search).get('order');
 if (!number) return;
 if (!orderData.some(order => order.number === number)) {
  notify('해당 주문을 찾을 수 없습니다. 주문 목록에서 다시 확인해 주세요.');
  return;
 }
 showDetail(number);
}
bindShippingGuide();renderOrders();openLinkedOrder();
