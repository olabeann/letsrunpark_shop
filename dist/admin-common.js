const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=v=>Number(v).toLocaleString('ko-KR')+'원';
function syncSharedAdminComponents(root=document){
 const aliases=[['.page-heading','page-head'],['.heading-actions','page-head__actions'],['.table-wrap','admin-panel table-scroll'],['.list-heading','reservation-list-head'],['.pagination','table-pagination'],['.badge','table-status'],['.settlement-cards','metric-grid']];
 aliases.forEach(([selector,names])=>root.querySelectorAll(selector).forEach(element=>element.classList.add(...names.split(' '))));
 root.querySelectorAll('.page-heading>button,.heading-actions>button').forEach(button=>button.classList.add('admin-button',button.classList.contains('blue')?'admin-button--primary':'admin-button--ghost'));
 root.querySelectorAll('#ordersTable table').forEach(table=>table.classList.add('reservation-table'));
 root.querySelectorAll('#productsTable table').forEach(table=>table.classList.add('kiosk-product-table'));
 root.querySelectorAll('#settlementTable table').forEach(table=>table.classList.add('reservation-table'));
 root.querySelectorAll('[data-detail]').forEach(button=>button.classList.add('reservation-detail-button'));
 root.querySelectorAll('main>section').forEach(section=>section.classList.add('admin-view'));
 root.querySelectorAll('dialog').forEach(dialog=>dialog.classList.add('kiosk-dialog'));
}
const carrierNames=['CJ대한통운','한진택배','롯데택배','우체국택배','로젠택배','경동택배','대신택배','일양로지스','천일택배','합동택배','CU 편의점택배','GS Postbox','DHL','FedEx','UPS','기타 택배사'];
let goods=JSON.parse(localStorage.goodsProducts||'null')||[{id:1,name:'말마 인형',description:'귀여운 말마 캐릭터 봉제 인형',price:29000,stock:18,status:'sale',art:'MALMA'},{id:2,name:'경주마 인형 A',price:26000,stock:9,status:'sale',art:'RACE A'},{id:3,name:'경주마 인형 B',price:26000,stock:0,status:'soldout',art:'RACE B'}];
goods.sort((a,b)=>(Number(b.updatedAt)||0)-(Number(a.updatedAt)||0)||(Number(b.id)||0)-(Number(a.id)||0));
let settings={...CheckoutContent.defaults,shippingFee:3000,cancelHours:24,returnDays:14,shippingNotice:'주 1회 모아서 발송합니다. 주간 마감과 발송일은 렛츠런플레이 상품 상세 안내를 확인해 주세요.',returnAddress:'경기도 과천시 경마공원대로 107 렛츠런파크 굿즈 반품 담당',...JSON.parse(localStorage.goodsSettings||'{}')};
const now=Date.now();
let orderData=JSON.parse(localStorage.goodsOrders||'null')||[{number:'G-260918-0003',name:'김말마',phone:'010-0000-0000',address:'경기도 과천시 경마공원대로 107, 1층 수령처',request:'배송 전 연락 부탁드립니다.',createdAt:now,items:[{id:1,name:'말마 인형',qty:2,price:29000},{id:2,name:'경주마 인형 A',qty:1,price:26000}],subtotal:84000,shippingFee:3000,total:87000,status:'출고 대기',inventoryApplied:false},{number:'G-260911-0002',name:'박프렌즈',phone:'010-0000-0000',address:'서울특별시 중구 세종대로 110, 수령처',createdAt:now-7*86400000,items:[{id:2,name:'경주마 인형 A',qty:2,price:26000}],subtotal:52000,shippingFee:3000,total:55000,status:'출고 완료',carrier:'CJ대한통운',trackingNumber:'000000000000',inventoryApplied:false},{number:'G-260908-0001',name:'이경주',phone:'010-0000-0000',address:'부산광역시 강서구 가락대로 929, 수령처',createdAt:now-10*86400000,items:[{id:1,name:'말마 인형',qty:1,price:29000}],subtotal:29000,shippingFee:3000,total:32000,status:'전체 취소',inventoryApplied:false}];
const shippingDemoOrders=[
 {number:'G-260927-0010',name:'강하늘',phone:'010-1234-1010',recipient:'강하늘',recipientPhone:'010-1234-1010',address:'서울특별시 마포구 월드컵로 240, 101동 1004호',request:'문 앞에 놓아주세요.',createdAt:now-1*86400000,items:[{id:1,name:'말마 인형',qty:1,price:29000}],subtotal:29000,shippingFee:3000,total:32000,status:'출고 대기',inventoryApplied:false},
 {number:'G-260926-0009',name:'윤서준',phone:'010-1234-1009',recipient:'윤서준',recipientPhone:'010-1234-1009',address:'경기도 성남시 분당구 판교역로 166, 804호',request:'배송 전 연락 부탁드립니다.',createdAt:now-2*86400000,items:[{id:2,name:'경주마 인형 A',qty:2,price:26000}],subtotal:52000,shippingFee:3000,total:55000,status:'출고 대기',inventoryApplied:false},
 {number:'G-260925-0008',name:'최유나',phone:'010-1234-1008',recipient:'최유나',recipientPhone:'010-1234-1008',address:'인천광역시 연수구 센트럴로 123, 202동 701호',request:'경비실에 맡겨주세요.',createdAt:now-3*86400000,items:[{id:1,name:'말마 인형',qty:2,price:29000}],subtotal:58000,shippingFee:3000,total:61000,status:'출고 대기',inventoryApplied:false},
 {number:'G-260924-0007',name:'정도윤',phone:'010-1234-1007',recipient:'정도윤',recipientPhone:'010-1234-1007',address:'대전광역시 유성구 대학로 99, 305호',request:'부재 시 문자 남겨주세요.',createdAt:now-4*86400000,items:[{id:2,name:'경주마 인형 A',qty:1,price:26000},{id:3,name:'경주마 인형 B',qty:1,price:26000}],subtotal:52000,shippingFee:3000,total:55000,status:'출고 대기',inventoryApplied:false},
 {number:'G-260923-0006',name:'한지민',phone:'010-1234-1006',recipient:'한지민',recipientPhone:'010-1234-1006',address:'광주광역시 서구 상무대로 760, 1102호',request:'택배함에 보관해 주세요.',createdAt:now-5*86400000,items:[{id:2,name:'경주마 인형 A',qty:3,price:26000}],subtotal:78000,shippingFee:3000,total:81000,status:'출고 대기',inventoryApplied:false},
 {number:'G-260922-0005',name:'오민준',phone:'010-1234-1005',recipient:'오민준',recipientPhone:'010-1234-1005',address:'대구광역시 수성구 달구벌대로 2450, 501호',request:'문 앞 배송 부탁드립니다.',createdAt:now-6*86400000,items:[{id:1,name:'말마 인형',qty:1,price:29000},{id:2,name:'경주마 인형 A',qty:1,price:26000}],subtotal:55000,shippingFee:3000,total:58000,status:'출고 완료',carrier:'한진택배',trackingNumber:'410092200005',shippedAt:now-5*86400000,inventoryApplied:false},
 {number:'G-260921-0004',name:'임서아',phone:'010-1234-1004',recipient:'임서아',recipientPhone:'010-1234-1004',address:'울산광역시 남구 삼산로 282, 1503호',request:'배송 전 연락 부탁드립니다.',createdAt:now-7*86400000,items:[{id:3,name:'경주마 인형 B',qty:2,price:26000}],subtotal:52000,shippingFee:3000,total:55000,status:'배송 완료',carrier:'롯데택배',trackingNumber:'250092100004',shippedAt:now-6*86400000,inventoryApplied:false},
 {number:'G-260920-0003',name:'송예준',phone:'010-1234-1003',recipient:'송예준',recipientPhone:'010-1234-1003',address:'강원특별자치도 춘천시 중앙로 1, 302호',request:'직접 수령하겠습니다.',createdAt:now-8*86400000,items:[{id:1,name:'말마 인형',qty:1,price:29000}],subtotal:29000,shippingFee:3000,total:32000,status:'출고 완료',carrier:'우체국택배',trackingNumber:'689092000003',shippedAt:now-7*86400000,inventoryApplied:false}
];
const existingOrderNumbers=new Set(orderData.map(order=>order.number));
orderData.push(...shippingDemoOrders.filter(order=>!existingOrderNumbers.has(order.number)));

const dateText=o=>{if(!o.createdAt)return o.date||'—';const date=new Date(o.createdAt);return `${date.toLocaleDateString('ko-KR')}\n${date.toLocaleTimeString('ko-KR')}`;};
const state=o=>o.status==='출고 대기'?'배송 준비 중':o.status==='출고 완료'?'발송 완료':o.status==='전체 취소'?'취소 완료':o.status;
function persist(){localStorage.goodsOrders=JSON.stringify(orderData);localStorage.goodsProducts=JSON.stringify(goods);localStorage.goodsSettings=JSON.stringify(settings);}
function notify(message){$('adminStatus').textContent=message;}
function updatePendingCount(){const count=orderData.filter(order=>order.status==='출고 대기').length,badge=$('pendingCount');badge.textContent=count;badge.hidden=count<1;}
function bindClose(){document.querySelectorAll('[data-close]').forEach(b=>b.onclick=() =>$(b.dataset.close).close());}
  const PAGE_SIZE = 20;
  const day = value => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
  };
  const monthKey = value => day(value).slice(0, 7);
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
      if (!Number.isInteger(position) || position < 1 || used.has(position)) { position = index + 1; while (used.has(position)) position++; }
      product.displayOrder = position;
      used.add(position);
    });
    saveAll();
  };
  function pagination(container, total, current, onChange) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safe = Math.min(current, pages);
    const start = total ? (safe - 1) * PAGE_SIZE + 1 : 0;
    const end = Math.min(safe * PAGE_SIZE, total);
    container.innerHTML = `<span>${start}–${end} / ${total}건 · ${safe}/${pages}페이지</span><button type="button" data-page="${safe - 1}" ${safe <= 1 ? 'disabled' : ''}>‹</button><button type="button" class="current">${safe}</button><button type="button" data-page="${safe + 1}" ${safe >= pages ? 'disabled' : ''}>›</button>`;
    container.querySelectorAll('[data-page]').forEach(button => button.onclick = () => onChange(Number(button.dataset.page)));
    return safe;
  }


const adminReturnExample=orderData.find(o=>o.number==='G-260911-0002');
if(adminReturnExample&&!adminReturnExample.returnStatus)Object.assign(adminReturnExample,{status:'배송 완료',returnStatus:'신청 완료',returnReason:'단순 변심',returnDetail:'상품을 확인했으나 생각했던 크기와 달라 전체 반품을 요청합니다.',returnMethod:'고객 직접 반송(착불)',returnRequestedAt:Date.now()-86400000});
orderData.forEach(order=>{if(order.returnStatus&&['수거 접수','직접 발송'].includes(order.returnMethod))order.returnMethod='고객 직접 반송(착불)';});
localStorage.goodsOrders=JSON.stringify(orderData);
ensurePolicyData();bindClose();updatePendingCount();syncSharedAdminComponents();
const sharedComponentObserver=new MutationObserver(()=>syncSharedAdminComponents());sharedComponentObserver.observe(document.getElementById('admin-main'),{childList:true,subtree:true});
function reloadAdminData(){goods=JSON.parse(localStorage.goodsProducts||'[]');orderData=JSON.parse(localStorage.goodsOrders||'[]');settings={...CheckoutContent.defaults,...JSON.parse(localStorage.goodsSettings||'{}')};updatePendingCount();window.dispatchEvent(new Event('admin-data-change'));}
window.addEventListener('storage',event=>{if(['goodsProducts','goodsOrders','goodsSettings'].includes(event.key))reloadAdminData();});
window.addEventListener('pageshow',event=>{if(event.persisted)reloadAdminData();});
