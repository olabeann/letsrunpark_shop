const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = file => fs.readFileSync(__dirname + '/../dist/' + file, 'utf8');
function setup() {
  const ctx = {URLSearchParams, esc: String, money: String, dateText: () => ''};
  vm.createContext(ctx);
  vm.runInContext(read('order-demo-data.js') + '\nglobalThis.seed = OrderDemoData.seed;', ctx);
  const common = read('admin-common.js');
  vm.runInContext(common.slice(common.indexOf('function paymentStateKey('), common.indexOf('function persist(')) + '\nglobalThis.state=state;', ctx);
  vm.runInContext(read('admin-order-view.js'), ctx);
  return ctx;
}
test('fixtures cover active/disabled return buttons and all current state labels', () => {
  const c = setup(), orders = c.seed([], Date.now());
  assert.equal(orders.length, 9);
  for (const [label, expected] of [
    ['paymentStateLabel', ['결제 완료', '환불 완료', '전액 환불 완료']],
    ['state', ['배송 준비 중', '발송 완료', '배송 대상 아님']],
    ['returnStateLabel', ['해당 없음', '반품 신청 완료', '반품 처리 완료']]
  ]) assert.deepEqual([...new Set(orders.map(o => c[label](o)))].sort(), expected.sort());
  for (const order of orders) {
    const html = c.renderAdminOrderDetail(order);
    const button = html.match(/<button[^>]*id="completeRefund"[^>]*>/);
    if (order.returnStatus === '신청 완료') {
      assert.ok(button);
      assert.equal(button[0].includes(' disabled'), !order.returnTrackingNumber);
    } else assert.equal(button, null);
    assert.equal(order.total, order.subtotal + order.shippingFee - (order.discountAmount || 0));
    assert.equal(order.inventoryApplied, false);
    if (order.refundAmount) assert.equal(order.total, order.refundAmount + order.shippingDeduction);
  }
});
test('existing purchases and processed fixtures survive repeat visits from either app', () => {
  const c = setup(), existing = {number: 'REAL-1', total: 123}, orders = [existing];
  c.seed(orders, Date.now());
  orders[1].returnStatus = '환불 완료';
  const before = JSON.stringify(orders);
  c.seed(orders, Date.now() + 86400000);
  assert.equal(JSON.stringify(orders), before);
  assert.equal(orders[0], existing);
  assert.equal(new Set(orders.map(o => o.number)).size, orders.length);
});
test('both customer and admin pages load fixtures before common initialization', () => {
  for (const file of fs.readdirSync(__dirname + '/../dist').filter(f => f.endsWith('.html'))) {
    const html = read(file);
    for (const common of ['admin-common.js', 'store-common.js']) {
      if (!html.includes('src="' + common)) continue;
      assert.ok(html.indexOf('src="order-demo-data.js') >= 0, file);
      assert.ok(html.indexOf('src="order-demo-data.js') < html.indexOf('src="' + common), file);
    }
  }
});

test('migration removes only retired generated examples, keeps real history and edited results', () => {
  const c = setup();
  const real = {number:'REAL-REJECT',returnStatus:'반품 반려'};
  const unmarked = {number:'G-DEMO-RETURN-LEGACY-REJECT',returnStatus:'반품 반려'};
  const edited = {number:'G-DEMO-RETURN-READY-CHANGE',demo:true,demoScenario:'반품 가능 · 단순 변심',
    name:'[예시] 반품 가능 · 단순 변심',returnStatus:'환불 완료',refundAmount:49000};
  const orders = [real, unmarked, edited, ...['RETURN-READY-DEFECT','RETURN-WAIT-WRONG','EXCEPTION-DEDUCT','RETURN-LEGACY-REJECT']
    .map(id=>({number:'G-DEMO-'+id,demo:true}))];
  c.seed(orders);
  assert.equal(orders.length,11);
  assert.ok(orders.includes(real));assert.ok(orders.includes(unmarked));
  assert.equal(edited.returnStatus,'환불 완료');assert.equal(edited.refundAmount,49000);
  assert.equal(edited.name,'[예시] 반품 처리 가능');
  assert.ok(!orders.some(o=>o.demo && o.number==='G-DEMO-RETURN-LEGACY-REJECT'));
  const before=JSON.stringify(orders);c.seed(orders);assert.equal(JSON.stringify(orders),before);
});
