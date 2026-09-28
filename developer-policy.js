(function(){
  'use strict';

  const sections=[
    {
      id:'overview',
      key:'POL-00',
      title:'정책 개요',
      summary:'관리 공수는 줄이고 고객은 다음 행동을 이해할 수 있도록, 주문·배송·반품·환불 상태를 분리합니다.',
      body:`
        <div class="dev-policy-callout"><b>확정된 MVP 원칙</b><p>반품과 환불은 주문 전체 단위로만 처리합니다. 일부 상품·일부 수량의 부분 반품·부분 환불은 제공하지 않습니다.</p></div>
        <h3>결정 근거</h3>
        <ul>
          <li><b>상태 분리:</b> 배송 진행과 결제·환불 진행은 서로 다른 수명주기이므로 <code>order.status</code>와 <code>returnStatus</code>를 별도 관리합니다.</li>
          <li><b>행동 중심 문구:</b> 내부값 <code>신청 완료</code>를 고객에게 그대로 노출하지 않고, 다음 행동에 따라 <em>반품 발송 대기</em> 또는 <em>반품 확인 중</em>으로 표시합니다.</li>
          <li><b>관리자 단계 최소화:</b> 관리자가 선택하는 핵심 상태는 반품 신청 확인과 환불 완료입니다. 중간 상태는 운송장 유무로 계산합니다.</li>
          <li><b>직접 반송:</b> 택배사 수거 API가 없으므로 자동 수거 접수처럼 보이는 기능은 제공하지 않습니다. 고객이 신청 후 직접 착불 발송합니다.</li>
        </ul>
        <p class="dev-policy-note">이 문서는 현재 제품·MVP 구현 기준입니다. 전자상거래 관련 고지 문구와 기간의 법적 적합성은 출시 전 운영·법무 검토가 필요합니다.</p>`
    },
    {
      id:'states',
      key:'POL-01',
      title:'상태값 정의',
      summary:'DB에는 안정적인 내부 코드를 저장하고 화면 문구는 코드와 데이터 조합으로 계산합니다.',
      body:`
        <h3>주문·배송 상태</h3>
        <div class="dev-policy-table-wrap"><table><thead><tr><th>현재 프로토타입 값</th><th>권장 API 코드</th><th>고객 표시</th><th>정의</th></tr></thead><tbody>
          <tr><td><code>출고 대기</code></td><td><code>PREPARING</code></td><td>배송 준비 중</td><td>결제 완료, 송장 등록 전. 주문 전체 즉시 취소 가능.</td></tr>
          <tr><td><code>출고 완료</code></td><td><code>SHIPPED</code></td><td>발송 완료</td><td>택배사와 운송장 등록 완료. 즉시 취소 불가.</td></tr>
          <tr><td><code>배송 완료</code></td><td><code>DELIVERED</code></td><td>배송 완료</td><td>수령 완료. 반품 신청 기간 계산의 기준 시점.</td></tr>
          <tr><td><code>전체 취소</code></td><td><code>CANCELLED</code></td><td>취소 완료</td><td>발송 전 주문 전체 취소 및 전액 환불 완료.</td></tr>
        </tbody></table></div>
        <h3>반품·환불 상태</h3>
        <div class="dev-policy-table-wrap"><table><thead><tr><th>저장값</th><th>조건</th><th>고객 표시</th><th>관리자 표시</th></tr></thead><tbody>
          <tr><td><code>null</code></td><td>반품 미신청</td><td>배송 상태 사용</td><td>결제 완료</td></tr>
          <tr><td><code>신청 완료</code></td><td>반품 운송장 없음</td><td>반품 발송 대기</td><td>반품 신청 완료</td></tr>
          <tr><td><code>신청 완료</code></td><td>반품 운송장 있음</td><td>반품 확인 중</td><td>환불 처리 대기</td></tr>
          <tr><td><code>환불 완료</code></td><td>환불액·고객 안내 저장</td><td>환불 완료</td><td>환불 완료</td></tr>
        </tbody></table></div>
        <p class="dev-policy-note">화면 문구를 DB 상태값으로 재사용하지 않습니다. 향후 API에서는 한글 대신 enum 코드를 사용하고 프론트에서 표시 문구를 매핑하는 방식을 권장합니다.</p>`
    },
    {
      id:'transitions',
      key:'POL-02',
      title:'상태 전이 규칙',
      summary:'모든 전이는 서버에서 현재 상태를 다시 확인한 뒤 한 번의 트랜잭션으로 처리합니다.',
      body:`
        <div class="dev-policy-flow">
          <span>PREPARING</span><i>송장 등록</i><span>SHIPPED</span><i>배송 완료 확인</i><span>DELIVERED</span><i>전체 반품 신청</i><span>RETURN_REQUESTED</span><i>관리자 환불</i><span>REFUNDED</span>
        </div>
        <h3>허용 전이</h3>
        <ul>
          <li><code>PREPARING → CANCELLED</code>: 기간 제한 없이 주문 전체 취소·전액 환불. 재고를 원복합니다.</li>
          <li><code>PREPARING → SHIPPED</code>: 택배사와 운송장 번호가 모두 유효할 때만 허용합니다.</li>
          <li><code>SHIPPED → DELIVERED</code>: 택배 연동 또는 관리자 확인 결과로 처리합니다. MVP에서는 자동 갱신이 없을 수 있습니다.</li>
          <li><code>DELIVERED → RETURN_REQUESTED</code>: 전체 주문만 신청하며 일반 사유는 설정 기간 안에서 허용합니다.</li>
          <li><code>RETURN_REQUESTED → REFUNDED</code>: 관리자가 배송비 처리와 고객 안내를 확정한 경우에만 허용합니다.</li>
        </ul>
        <h3>거부 규칙</h3>
        <ul>
          <li>발송 이후 주문 취소 요청, 배송 완료 전 반품 요청, 이미 환불된 주문의 재처리를 거부합니다.</li>
          <li>클라이언트가 보낸 금액·상태를 신뢰하지 않고 서버 저장값으로 재계산합니다.</li>
          <li>동일 요청 재전송은 idempotency key 또는 현재 상태 검사로 중복 취소·중복 환불을 방지합니다.</li>
        </ul>`
    },
    {
      id:'returns',
      key:'POL-03',
      title:'취소·반품·환불 정책',
      summary:'고객의 신청 순서와 관리자의 최소 처리 항목을 명확히 고정합니다.',
      body:`
        <h3>고객 흐름</h3>
        <ol>
          <li>배송 준비 중이면 <b>주문 취소·전액 환불</b>을 즉시 요청합니다.</li>
          <li>배송 완료 후 주문 상세에서 <b>전체 반품 신청</b>을 먼저 완료합니다.</li>
          <li>화면에 표시된 반품 주소로 주문 상품 전체를 <b>착불 직접 발송</b>합니다.</li>
          <li>발송 후에만 택배사와 반품 운송장 번호를 등록합니다.</li>
          <li>관리자가 도착 상품을 확인하고 환불을 완료하면 최종 환불액과 안내 메모를 확인합니다.</li>
        </ol>
        <h3>반품 가능 기준</h3>
        <ul>
          <li>일반 반품은 <code>deliveredAt + returnDays</code> 이내에만 허용합니다.</li>
          <li>현재 기본값은 7일이며 관리자 설정 범위는 7~90일입니다.</li>
          <li>상품 불량·파손 또는 오배송은 일반 기간이 지나도 별도 사유로 신청할 수 있도록 설계했습니다.</li>
          <li>부분 반품·부분 환불은 MVP 범위에서 제외합니다.</li>
        </ul>
        <h3>환불 완료 입력</h3>
        <ul>
          <li><b>배송비 차감 없음:</b> <code>refundAmount = total</code></li>
          <li><b>배송비 차감:</b> <code>refundAmount = max(0, total - shippingDeduction)</code></li>
          <li><code>customerRefundNote</code>는 필수이며 고객 주문 상세에 그대로 노출합니다.</li>
          <li>배송비 차감 사유와 최종 환불액은 변경 이력에 남기는 것을 권장합니다.</li>
        </ul>`
    },
    {
      id:'data',
      key:'POL-04',
      title:'데이터 모델·API 계약',
      summary:'프로토타입은 localStorage를 사용하지만 실제 구현에서는 서버 DB와 상태 전이 API가 단일 진실 공급원입니다.',
      body:`
        <h3>필수 주문 필드</h3>
        <pre><code>{
  id, orderNumber, userId,
  status, createdAt, shippedAt, deliveredAt, cancelledAt,
  subtotal, shippingFee, total,
  carrierCode, trackingNumber,
  items: [{ productId, productNameSnapshot, unitPrice, quantity }],
  return: {
    status, reasonCode, reasonDetail, requestedAt,
    carrierCode, trackingNumber, trackingRegisteredAt,
    shippingDeduction, refundAmount,
    customerNote, refundedAt
  },
  version
}</code></pre>
        <h3>권장 명령 API</h3>
        <div class="dev-policy-table-wrap"><table><thead><tr><th>API</th><th>검증</th><th>결과</th></tr></thead><tbody>
          <tr><td><code>POST /orders/{id}/cancel</code></td><td>PREPARING, 전체 주문</td><td>취소·전액 환불·재고 원복</td></tr>
          <tr><td><code>POST /orders/{id}/shipment</code></td><td>택배사, 운송장, PREPARING</td><td>SHIPPED 전이</td></tr>
          <tr><td><code>POST /orders/{id}/returns</code></td><td>DELIVERED, 기간·사유, 미신청</td><td>RETURN_REQUESTED 생성</td></tr>
          <tr><td><code>PUT /orders/{id}/returns/tracking</code></td><td>RETURN_REQUESTED, 숫자 8~30자리, 중복 운송장 방지</td><td>반품 운송장 저장</td></tr>
          <tr><td><code>POST /orders/{id}/refund</code></td><td>RETURN_REQUESTED, 차감액·고객 메모</td><td>환불·상태·원장 원자적 반영</td></tr>
        </tbody></table></div>
        <h3>서버 구현 주의</h3>
        <ul>
          <li><code>version</code> 또는 행 잠금으로 관리자 동시 처리 충돌을 막습니다.</li>
          <li>상품명과 단가는 주문 시점 스냅샷으로 보관해 상품 수정 후에도 과거 주문을 유지합니다.</li>
          <li>상태 변경 이벤트에는 이전값·새값·처리자·시각·사유를 감사 로그로 기록합니다.</li>
        </ul>`
    },
    {
      id:'settlement',
      key:'POL-05',
      title:'정산 계산 기준',
      summary:'환불 완료 전에는 원 결제액을 유지하고, 완료된 취소·환불만 정산 차감에 반영합니다.',
      body:`
        <div class="dev-policy-formula"><code>gross = total</code><code>refund = CANCELLED ? gross : REFUNDED ? refundAmount : 0</code><code>net = max(0, gross - refund)</code><code>pgFee = round(net × 0.02)</code><code>payout = max(0, net - pgFee)</code></div>
        <ul>
          <li>PG 수수료 2%는 현재 프로토타입 계산값이며 실제 계약 수수료·부가세·결제수단별 요율 확정 후 교체해야 합니다.</li>
          <li>반품 신청 상태는 <em>환불 처리 대기</em>로 별도 집계하고 환불액에는 아직 포함하지 않습니다.</li>
          <li>정산 상세에서는 주문 상품명·수량·상품별 금액, 배송비, 환불액과 처리 상태를 함께 조회합니다.</li>
          <li>실서비스에서는 PG 승인·취소 거래 ID, 정산 기준일, 원장 조정 내역을 별도 저장해야 합니다.</li>
        </ul>`
    },
    {
      id:'mvp',
      key:'POL-06',
      title:'MVP 범위와 미연동 항목',
      summary:'화면에 존재하는 기능과 실제 외부 연동 완료 여부를 구분합니다.',
      body:`
        <h3>MVP 포함</h3>
        <ul>
          <li>주문 전체 취소, 주문 전체 반품 신청, 직접 반송 운송장 등록</li>
          <li>관리자의 배송비 차감 선택, 최종 환불액 계산, 고객 안내 메모</li>
          <li>상품 가격·재고·판매 상태와 스토어 배송·반품 설정</li>
          <li>주문별 정산 조회 및 CSV 내려받기</li>
        </ul>
        <h3>MVP 제외 또는 연동 필요</h3>
        <ul>
          <li>부분 취소·부분 반품·부분 환불</li>
          <li>택배사 수거 API 자동 접수와 배송 완료 자동 갱신</li>
          <li>실제 PG 승인·취소·환불 및 정산 대사</li>
          <li>SMS·알림톡·이메일 자동 발송</li>
          <li>반품 검수 사진, 창고 WMS, 교환 처리</li>
        </ul>
        <p class="dev-policy-note">미연동 기능은 성공한 것처럼 표시하지 않습니다. 사용자가 직접 해야 하는 단계와 관리자가 확인해야 하는 단계를 화면에 명시합니다.</p>`
    },
    {
      id:'qa',
      key:'POL-07',
      title:'개발 완료 조건·QA',
      summary:'프론트 표시뿐 아니라 서버 검증과 실패 복구까지 충족해야 완료로 봅니다.',
      body:`
        <ul class="dev-policy-checklist">
          <li>배송 준비 중 주문만 즉시 전체 취소할 수 있다.</li>
          <li>발송 완료 주문에는 취소 버튼이 나오지 않는다.</li>
          <li>배송 완료 주문만 전체 반품을 신청할 수 있다.</li>
          <li>반품 신청 전에는 반품 운송장을 등록할 수 없다.</li>
          <li>운송장 미등록은 반품 발송 대기, 등록 후에는 반품 확인 중으로 표시된다.</li>
          <li>환불 완료 시 배송비 차감액·최종 환불액·고객 메모가 함께 저장된다.</li>
          <li>중복 클릭·재시도에도 취소·환불·재고 원복이 한 번만 실행된다.</li>
          <li>상품 수정·삭제 후에도 과거 주문 상품명과 결제금액이 유지된다.</li>
          <li>정산 목록의 상세 보기에서 주문 상품과 금액 구성을 확인할 수 있다.</li>
          <li>실패 응답 시 기존 상태와 입력값을 유지하고 원인을 안내한다.</li>
        </ul>`
    }
  ];

  let dialog;
  let activeId='overview';

  function ensureDialog(){
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.className='dev-policy-dialog';
    dialog.setAttribute('aria-labelledby','devPolicyTitle');
    dialog.innerHTML=`<div class="dev-policy-shell"><header><div><small>DEVELOPER POLICY · ⌥ + ⌘ + K</small><h2 id="devPolicyTitle">스토어 개발 정책</h2><p>확정된 제품 정책과 구현·검증 기준을 함께 제공합니다.</p></div><button type="button" data-policy-close aria-label="정책 닫기">×</button></header><div class="dev-policy-layout"><nav aria-label="개발 정책 목차"></nav><main tabindex="-1"></main></div><footer><span>현재 MVP 기준 · 변경 시 상태 전이와 API 계약을 함께 갱신</span><kbd>⌥</kbd><span>+</span><kbd>⌘</kbd><span>+</span><kbd>K</kbd></footer></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('[data-policy-close]').addEventListener('click',close);
    dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
    dialog.addEventListener('wheel',event=>{
      const scrollArea=event.target.closest('main,nav,.dev-policy-table-wrap,.dev-policy-flow,pre');
      if(scrollArea||!dialog.open)return;
      dialog.querySelector('main').scrollBy({top:event.deltaY,left:event.deltaX});
      event.preventDefault();
    },{passive:false});
    dialog.addEventListener('close',unlockPageScroll);
    renderNav();
    renderSection(activeId);
    return dialog;
  }

  function renderNav(){
    const nav=dialog.querySelector('nav');
    nav.innerHTML=sections.map(section=>`<button type="button" data-policy-section="${section.id}"><small>${section.key}</small><b>${section.title}</b></button>`).join('');
    nav.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>renderSection(button.dataset.policySection)));
  }

  function renderSection(id){
    activeId=sections.some(section=>section.id===id)?id:'overview';
    const section=sections.find(item=>item.id===activeId);
    dialog.querySelectorAll('[data-policy-section]').forEach(button=>{
      const isActive=button.dataset.policySection===activeId;
      button.classList.toggle('active',isActive);
      button.setAttribute('aria-current',isActive?'page':'false');
      if(isActive)button.scrollIntoView({block:'nearest'});
    });
    const main=dialog.querySelector('main');
    main.innerHTML=`<div class="dev-policy-section-head"><small>${section.key}</small><h2>${section.title}</h2><p>${section.summary}</p></div><div class="dev-policy-body">${section.body}</div>`;
    main.scrollTop=0;
    main.focus({preventScroll:true});
  }

  function lockPageScroll(){
    document.documentElement.classList.add('dev-policy-open');
    document.body.classList.add('dev-policy-open');
  }

  function unlockPageScroll(){
    document.documentElement.classList.remove('dev-policy-open');
    document.body.classList.remove('dev-policy-open');
  }

  function open(sectionId){
    ensureDialog();
    lockPageScroll();
    if(!dialog.open)dialog.showModal();
    if(sectionId)renderSection(sectionId);
  }

  function close(){if(dialog?.open)dialog.close();else unlockPageScroll();}

  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-policy-open]');
    if(trigger){
      event.preventDefault();
      open(trigger.dataset.policyOpen||'overview');
      return;
    }
    const viewTrigger=event.target.closest('[data-view]');
    if(!viewTrigger)return;
    const salesPolicy=document.querySelector('[data-policy-context="sales"]');
    if(!salesPolicy)return;
    const isShipping=viewTrigger.dataset.view==='shipping';
    salesPolicy.dataset.policyOpen=isShipping?'transitions':'returns';
    salesPolicy.textContent=isShipping?'배송 정책 보기':'주문 정책 보기';
  });

  document.addEventListener('keydown',event=>{
    const isShortcut=event.altKey&&event.metaKey&&!event.ctrlKey&&event.key.toLowerCase()==='k';
    if(isShortcut){event.preventDefault();dialog?.open?close():open();}
  });
})();
