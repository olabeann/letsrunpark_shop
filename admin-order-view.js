function maskAdminName(value) {
 const letters=Array.from(String(value??'').trim());
 if(!letters.length)return '';
 letters[Math.floor(letters.length/2)]='*';
 return letters.join('');
}

// Mask customer contact details only when rendering administrator screens.
function maskAdminPhone(value) {
 const phone=String(value??'').trim();
 if(!phone)return '';
 const digits=phone.replace(/[^0-9]/g,'');
 const match=digits.match(/^(02|0[0-9]{2})([0-9]{3,4})([0-9]{4})$/);
 return match?`${match[1]}-****-${match[3]}`:'****';
}
function maskAdminAddress(value) {
 const address=String(value??'').trim();
 if(!address)return '';
 // Keep only leading administrative regions; hide road names and all detail too.
 const parts=address.replace(/^\(?[0-9]{5}\)?\s*/, '').split(/\s+/);
 const visible=[];
 for(const part of parts){
  if(!/^[가-힣]+(?:특별자치시|특별자치도|특별시|광역시|도|시|군|구)$/.test(part))break;
  visible.push(part);
 }
 return visible.length?`${visible.join(' ')} ****`:'****';
}

function trackingLookupUrl(carrier,trackingNumber){
 const number=String(trackingNumber||'').replace(/[^0-9A-Za-z]/g,'');
 const officialUrls={
  'CJ대한통운':value=>`https://www.cjlogistics.com/ko/tool/parcel/newTracking?gnbInvcNo=${encodeURIComponent(value)}`,
  '한진택배':value=>`https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnum=${encodeURIComponent(value)}&wblnumText=`,
  '롯데택배':value=>`https://www.lotteglogis.com/home/reservation/tracking/invoiceView?InvNo=${encodeURIComponent(value)}`,
  '우체국택배':value=>`https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.postal?sid1=${encodeURIComponent(value)}`,
  '로젠택배':value=>`https://www.ilogen.com/web/personal/tkSearch?slipno=${encodeURIComponent(value)}`,
  '경동택배':value=>`https://kdexp.com/service/delivery/etc/delivery.do?barcode=${encodeURIComponent(value)}`,
  '대신택배':value=>`https://www.ds3211.co.kr/freight/internalFreightSearch.ht?billno=${encodeURIComponent(value)}`,
  '일양로지스':value=>`https://www.ilyanglogis.com/functionality/tracking_result.asp?hawb_no=${encodeURIComponent(value)}`,
  '천일택배':value=>`https://www.chunil.co.kr/HTrace/HTrace.jsp?transNo=${encodeURIComponent(value)}`,
  '합동택배':value=>`https://hdexp.co.kr/delivery_search.hd?barcode=${encodeURIComponent(value)}`,
  'CU 편의점택배':value=>`https://www.cupost.co.kr/postbox/delivery/localResult.cupost?invoice_no=${encodeURIComponent(value)}`,
  'GS Postbox':value=>`https://www.cvsnet.co.kr/invoice/tracking.do?invoice_no=${encodeURIComponent(value)}`,
  'DHL':value=>`https://www.dhl.com/kr-ko/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(value)}`,
  'FedEx':value=>`https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(value)}`,
  'UPS':value=>`https://www.ups.com/track?loc=ko_KR&tracknum=${encodeURIComponent(value)}`
 };
 if(officialUrls[carrier])return officialUrls[carrier](number);
 const params=new URLSearchParams({query:`${carrier||'택배'} ${number} 배송조회`.trim()});
 return `https://search.naver.com/search.naver?${params.toString()}`;
}
function trackingLookupTitle(carrier){return carrierNames.includes(carrier)&&carrier!=='기타 택배사'?`${carrier} 공식 배송조회`:'네이버 배송조회';}
function readonlyInvoice (order) {
    return order.trackingNumber
      ? `<div class="invoice-readonly"><span>${esc(order.carrier || '택배사 미등록')}</span><b>${esc(order.trackingNumber)}</b><a class="invoice-lookup" href="${esc(trackingLookupUrl(order.carrier, order.trackingNumber))}" target="_blank" rel="noopener noreferrer">조회 ↗</a></div>`
      : `<span class="invoice-status ${order.status === '전체 취소' ? 'invoice-cancelled' : ''}">${order.status === '전체 취소' ? '취소된 주문' : '미등록'}</span>`;
}

// Shared order content. Settlement uses a readonly popup and explicit sales navigation.
function renderAdminOrderDetail(order, readOnly = false, salesUrl = "") {
    const final = order.status === '전체 취소' || order.returnStatus === '환불 완료' || order.returnStatus === '반품 반려';
    const audit = order.refundDecision ? `<section class="detail-section"><h3>환불 처리 이력</h3><div class="detail-box"><p>처리자: ${esc(order.refundDecision.processedBy)}</p><p>처리 시각: ${esc(new Date(order.refundDecision.processedAt).toLocaleString('ko-KR'))}</p><p>배송비 차감: ${money(order.refundDecision.shippingDeduction)}</p>${order.refundDecision.overridden ? `<p>기본값 변경 사유: ${esc(order.refundDecision.overrideReason)}</p>` : ''}</div></section>` : '';
    const returnAction = !readOnly && order.returnStatus === '신청 완료' ? `<p id="returnRefundHelp" class="form-note">${order.returnTrackingNumber ? '반품 상품 도착과 상태를 확인한 뒤 환불을 확정하면 반품 처리 완료로 변경됩니다.' : '고객이 주문 상세에서 반품 운송장을 등록하면 처리할 수 있습니다. 현재는 반품 운송장 등록 대기 중입니다.'}</p><div class="dialog-footer return-action-footer"><button type="button" id="completeRefund" class="blue" aria-describedby="returnRefundHelp"${order.returnTrackingNumber ? '' : ' disabled'}>반품처리(환불)</button></div>` : '';
    const returnBox = order.returnStatus && order.refundKind !== '관리자 예외 환불' ? `<section class="detail-section"><h3>반품 처리</h3><p class="form-note">반품 불가 판단과 고객 안내는 CS에서 처리합니다. 협의 전에는 환불 완료를 누르지 마세요.</p><div class="detail-box"><p class="detail-cost"><span>반품 상태</span><b>${esc(returnStateLabel(order))}</b></p><p class="detail-cost"><span>반품 사유</span><b>${esc(order.returnReason || '—')}</b></p><p class="detail-cost"><span>반품 운송장</span><b>${order.returnTrackingNumber ? esc(`${order.returnCarrier || '택배사 미등록'} · ${order.returnTrackingNumber}`) : '미등록'}</b></p>${order.returnRejectReason ? `<p class="customer-note-preview"><b>반려 사유</b><br>${esc(order.returnRejectReason)}</p>` : ''}</div>${returnAction}</section>` : '';
    const refundBox = paymentStateKey(order) === 'refunded' ? `<section class="detail-section"><h3>환불 내역</h3><div class="detail-box"><p class="detail-cost"><span>환불 유형</span><b>${esc(refundTypeLabel(order))}</b></p><p class="detail-cost"><span>배송비 차감</span><b>${order.shippingDeduction ? '-' + money(order.shippingDeduction) : '차감 없음'}</b></p><p class="detail-cost total"><span>최종 환불액</span><b>${money(completedRefundAmount(order))}</b></p>${order.exceptionalRefundReason ? `<p class="customer-note-preview"><b>예외 환불 사유</b><br>${esc(order.exceptionalRefundReason)}</p>` : ''}${order.customerRefundNote ? `<p class="customer-note-preview"><b>고객 안내</b><br>${esc(order.customerRefundNote)}${order.customerRefundExtraNote ? '<br>' + esc(order.customerRefundExtraNote) : ''}</p>` : ''}</div></section>` : '';
    return `<p><b>${esc(order.number)}</b> <span class="badge">${esc(paymentStateLabel(order))}</span></p><p class="form-note">${esc(dateText(order))}</p><section class="detail-section"><h3>주문상품</h3><div class="detail-box">${(order.items || []).map(item => `<p class="detail-cost"><span>${esc(item.name + (item.deletedProduct ? ' (삭제된 상품)' : ''))} × ${item.qty}</span><b>${money(item.price * item.qty)}</b></p>`).join('')}</div></section><section class="detail-section"><h3>회원 · 배송정보</h3><div class="detail-box"><p class="detail-cost"><span>배송 상태</span><b>${esc(state(order))}</b></p><p><b>${esc(maskAdminName(order.recipient || order.name))}</b> · ${esc(maskAdminPhone(order.recipientPhone || order.phone))}</p><p>${esc(maskAdminAddress(order.address))}</p>${order.request ? `<p>배송메모: ${esc(order.request)}</p>` : ''}</div></section><section class="detail-section"><h3>발송 송장 정보</h3><div class="detail-box">${readonlyInvoice(order)}</div></section>${returnBox}${refundBox}${audit}<section class="detail-section"><h3>결제정보</h3><div class="detail-box"><p class="detail-cost"><span>결제 · 환불</span><b>${esc(paymentStateLabel(order))}</b></p><p class="detail-cost"><span>상품금액</span><b>${money(order.subtotal ?? order.total - (order.shippingFee || 0))}</b></p><p class="detail-cost"><span>배송비</span><b>${money(order.shippingFee || 0)}</b></p><p class="detail-cost total"><span>총 결제금액</span><b>${money(order.total)}</b></p></div></section><p class="form-note">상품·수량 일부 환불은 지원하지 않습니다. 전체 환불 또는 배송비 차감 후 전체 환불만 가능합니다.</p><div class="dialog-footer"><button data-close="detailDialog">닫기</button>${readOnly ? '' : `${!order.trackingNumber && order.status === '출고 대기' ? '<button id="adminCancelOrder" class="danger">관리자 주문 취소</button>' : ''}${order.trackingNumber && !order.returnStatus && !final ? '<button id="exceptionRefund" class="danger">관리자 예외 환불</button>' : ''}`}</div>`;
}
