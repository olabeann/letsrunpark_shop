(function(){
'use strict';
const rule=(id,scope,title,category,selector,section,summary,rules,fe,be,values)=>({id,scope,title,category,selector,section,summary,rules,fe,be,values});
const specs=[
rule('store-header','store','공통 헤더','전역 노출','.store-head','overview','브랜드 홈, 주문 조회와 장바구니 진입점을 제공합니다.',[['표시 대상','모든 사용자 화면'],['배치 기준','로고 좌측 · 사용자 행동 우측'],['표시 조건','장바구니 수량 1개 이상'],['표시 값','전체 상품 수량 합계']], '장바구니 수량은 라인 수가 아니라 qty 합계입니다. 인증 후 원래 행동을 이어갑니다.','인증 세션과 장바구니 요약을 서버 기준으로 제공합니다.','cartItemCount: 0 이상 정수 · 99 초과는 99+ 권장'),
rule('cart-panel','store','장바구니 수량 조절','카운터 UI','#cartPanel.open','transitions','장바구니에서도 상품 상세와 같은 수량 카운터 표현과 동작을 사용합니다.',[['표시 대상','장바구니에 담긴 각 상품'],['감소·증가','원형 아이콘 버튼'],['활성 색상','디자인시스템의 연한 주황색'],['비활성 상태','중립 회색 · 과도한 비활성 표현 금지'],['외곽선','카운터 전체를 감싸는 박스 없음']], '수량 버튼을 별도 박스로 묶지 않고 여백으로 구분합니다. 삭제는 수량 감소와 분리하고 각 버튼에 접근 가능한 이름을 제공합니다.','수량 변경 시 판매 상태와 가용 재고를 다시 검증하고 장바구니 합계를 갱신합니다.','상품 상세 카운터와 색상·크기·상태 표현 통일'),
rule('home-hero','home','홈 히어로','콘텐츠 · 배치','.intro','overview','스토어 목적과 상품 목록으로 이어지는 주 행동을 안내합니다.',[['표시 대상','스토어 홈'],['배치 기준','PC 2열 · 모바일 세로'],['주 행동','컬렉션 둘러보기 → #products'],['값 출처','승인된 운영 콘텐츠']], 'CTA 이동 후 상품 목록 제목의 접근성 흐름을 유지합니다.','CMS 사용 시 제목·설명·이미지·CTA를 한 묶음으로 반환합니다.','이미지는 대체 텍스트 또는 장식 이미지 처리'),
rule('product-grid','home','상품 카드 목록','정렬 · 표시개수','#products','mvp','판매 가능한 상품을 최근 등록하거나 수정한 순서대로 노출하고 상세로 연결합니다.',[['표시 대상','hidden이 아닌 상품'],['정렬 기준','최근 수정 시각 내림차순 · 가장 최근 수정 상품 우선'],['표시 개수','최대 24개 후 페이지네이션'],['배치 기준','PC 4열 · 태블릿 2열 · 모바일 1열'],['카드 정보','이미지, 상태, 상품명, 판매가']], '서버에서 받은 최신 수정순을 그대로 사용합니다. 품절 상품은 노출하되 구매를 막고 이미지 설명에는 상품명을 사용합니다.','고객에게 표시할 수 있는 상품만 조회해 가장 최근에 등록하거나 수정한 상품부터 전달합니다. 상품을 저장하거나 판매 상태를 변경할 때 서버에서 수정 시각을 새로 기록해야 합니다. 한 번에 최대 24개를 보내고 판매 중지 상품은 제외하되 품절 상품은 포함합니다.','최근 수정 시각은 서버가 기록한 값을 사용 · 판매 중=구매 가능 · 품절=노출하되 구매 불가 · 판매 중지=미노출'),
rule('product-summary','product','상품 핵심 정보','상세 · 값 정의','#productPage .product-layout','mvp','상품 이미지, 명칭, 설명, 가격, 배송비와 판매 상태를 제공합니다.',[['표시 대상','URL productId와 일치하는 공개 상품 1개'],['배치 기준','PC 이미지/구매정보 2열 · 모바일 세로'],['가격 기준','서버 판매가'],['상태 기준','sale && stock>0이면 판매 중']], '직접 URL 접근을 지원하고 숨김/없는 상품은 찾을 수 없음으로 표시합니다.','GET /products/{id}가 공개 여부, 판매가, 가용 재고, 배송 설정을 반환합니다.','price는 부가세 포함 노출가 · shippingFee는 주문 단위'),
rule('quantity-policy','product','수량 선택 · 구매 행동','검증 · 재고','#productPage .product-selection-box','transitions','구매 수량과 예상 금액을 표시하고 결제 시 서버에서 다시 검증합니다.',[['최솟값','1개'],['최댓값','가용 재고와 1회 구매 제한 중 작은 값'],['금액 계산','unitPrice × quantity'],['행동 배치','장바구니 → 바로 구매'],['품절 처리','수량·구매 행동 비활성']], '증감 시 합계를 즉시 갱신하되 클라이언트 계산을 결제 확정값으로 쓰지 않습니다.','장바구니/주문 생성 시 가격·상태·재고를 재검증하고 재고를 원자적으로 차감합니다.','quantity는 1 이상 정수 · lineAmount=unitPrice×quantity'),
rule('product-content','product','상세정보 · 배송 · 취소','콘텐츠 정책','#productPage .product-information','returns','상품 콘텐츠와 주문에 영향을 주는 배송·취소 기준을 함께 고지합니다.',[['정렬 기준','상세정보 → 배송 → 취소'],['값 출처','상품 HTML + 스토어 설정'],['필수 고지','배송비, 발송 기준, 취소 시간, 부분 취소 불가'],['빈 값','상품 요약 설명으로 대체']], '관리자 HTML은 허용 목록으로 정화하고 외부 링크에 안전 속성을 적용합니다.','저장 시 HTML sanitize와 이미지 권한을 검증하고 주문에는 정책 스냅샷을 보관합니다.','cancelHours는 발송 전 조건과 AND'),
rule('checkout-fields','checkout','주문자 · 배송지 입력','필수값 · 검증','#checkoutFields','data','주문 생성에 필요한 연락처와 배송지를 수집합니다.',[['필수 입력','이름, 전화번호, 우편번호, 기본·상세주소'],['선택 입력','배송메모'],['검증 시점','입력 중 안내 + 제출 시 최종 검증'],['배치 기준','정보 입력 → 고지 동의 → 결제']], '오류를 필드와 연결하고 값을 보존합니다. 주소 검색 실패 시 직접 입력을 허용합니다.','전화번호 정규화, 주소 길이와 금지문자를 검증하고 요청 금액은 신뢰하지 않습니다.','phone 10~11자리 · postcode 5자리 · memo 최대 100자 권장'),
rule('checkout-summary','checkout','주문 요약 · 최종 금액','가격 · 배치','#checkoutSummary','settlement','결제 전 상품, 수량, 배송비와 총액을 확인합니다.',[['표시 대상','결제 초안 상품'],['정렬 기준','장바구니/바로구매 전달 순서'],['표시 개수','초안 전체'],['금액 계산','상품 합계 + 주문 배송비'],['배치 기준','PC 우측 · 모바일 폼 아래']], '결제 중 버튼을 잠그고 서버 재계산 금액이 다르면 확인 후 재시도합니다.','POST /orders/quote가 가격·재고·배송비와 quoteId/만료시각을 반환합니다.','subtotal=Σ(price×qty), total=subtotal+shippingFee'),
rule('orders-list','orders','내 주문 목록','정렬 · 표시개수','#orderList','returns','현재 사용자의 주문만 최신순으로 표시합니다.',[['표시 대상','인증 사용자 소유 주문'],['정렬 기준','createdAt 내림차순'],['표시 개수','10건 후 더보기/페이지'],['카드 정보','일자, 번호, 상태, 상품, 총액'],['권한 기준','소유자만 조회']], '상태 문구를 enum 매핑으로 관리하고 빈 결과와 오류를 구분합니다.','GET /me/orders?page=1&size=10&sort=createdAt,desc. 세션 userId로 소유권을 강제합니다.','신청 완료+운송장 유무로 고객 반품 문구 계산'),
rule('order-detail','orderDetail','주문 상세','주문 처리 요구사항','#orderList .order-detail','returns','고객이 주문 당시의 상품 정보와 현재 진행 상태를 쉽게 확인하고, 지금 가능한 처리만 선택할 수 있어야 합니다.',[['표시 대상','로그인한 고객 본인의 주문'],['정보 순서','주문 상태 → 상품과 배송 → 취소·반품 → 배송지 → 결제 정보'],['주문 취소','운송장 미등록 상태이고 취소 가능한 시간이 남아 있을 때'],['반품 신청','운송장 등록 후 아직 반품을 신청하지 않았을 때'],['반품 운송장','반품 신청 후 고객이 상품을 발송했을 때']], '주문 상태에 따라 지금 할 수 있는 버튼만 보여주고, 처리가 끝나면 변경된 상태를 바로 확인할 수 있게 해주세요.','같은 요청이 여러 번 전달되더라도 취소·반품·환불이 중복 처리되지 않아야 하며, 주문 당시의 상품명·가격·수량은 이후 상품 정보가 바뀌어도 그대로 남아 있어야 합니다.','운송장 등록 전에는 주문 취소, 운송장 등록 후에는 반품 신청, 반품 확인 후에는 환불 완료 순서로 처리합니다.'),
rule('admin-nav','admin','관리자 업무 탐색','권한 · 배치','.sidebar','overview','업무별 진입점과 처리 대기 건수를 제공합니다.',[['표시 대상','권한에 허용된 메뉴'],['정렬 기준','예약 → 커머스 → 계정'],['배치 기준','좌측 고정'],['뱃지 값','발송 대기 주문 수']], '현재 메뉴를 aria-current로 표시하고 작은 화면에서는 접근 가능한 드로어로 전환합니다.','role/permissions와 업무별 pending count를 반환합니다.','pendingCount=PREPARING 주문 수 · 권한 없는 API는 403'),
rule('sales-guide','adminSales','배송 상태 안내','값 설명','.shipping-guide','states','상태 의미와 변경 조건을 목록 처리 전에 설명합니다.',[['표시 개수','핵심 상태 3개'],['정렬 기준','배송 준비 → 발송 완료 → 취소 완료'],['값 출처','공통 상태 매핑'],['노출 위치','상품 판매 현황 상단']], '안내와 테이블 뱃지는 같은 상태 매핑을 사용합니다.','내부 enum을 고정하고 변경 이벤트에 이전/새 값, 처리자, 시각을 기록합니다.','PREPARING=배송 준비 · SHIPPED=발송 완료 · CANCELLED=취소 완료'),
rule('sales-filter','adminSales','주문 검색 조건','조회 · 입력','#filterForm','data','기간, 결제·배송 상태와 식별값을 조합합니다.',[['기간 기준','주문 생성일'],['검색 대상','주문번호, 구매자, 전화번호'],['조건 결합','서로 다른 필드는 AND'],['초기화','조건 해제 후 1페이지'],['시간대','Asia/Seoul']], '검색 시 page를 1로 초기화하고 URL query 동기화를 권장합니다.','날짜 범위와 검색 길이를 제한하고 개인정보 검색 감사 로그를 남깁니다.','기간 양끝 포함 · 최대 1년 권장 · q는 trim'),
rule('admin-orders','adminSales','주문 목록','조회 · 환불 처리 이력','#ordersTable','returns','조건에 맞는 주문을 최신순으로 조회하고, 반품 환불 시 배송비 처리와 담당자 판단을 추적할 수 있어야 합니다.',[['표시 대상','검색 조건 일치 주문'],['정렬 기준','createdAt 내림차순 → id 내림차순'],['주문 정보','주문번호 아래 상품명·수량'],['구매자 정보','이름 아래 전화번호'],['반품 도착','담당자 수동 확인 후 환불 · 별도 상태/버튼 없음'],['환불 기본값','단순 변심: 왕복 배송비 차감 · 불량/파손/오배송: 차감 없음'],['기본값 변경','내부 변경 사유 필수'],['완료 후 처리','되돌리기·금액 수정 불가 · 고객센터 전화 문의'],['별도 기능','CS 접수·채널 연결 기능 없음'],['이력','최종 환불액·배송비 처리·사유·처리자·시각']], '반품 상품 도착은 담당자가 업무 절차로 확인하고, 시스템에는 별도 상태나 확인 버튼을 두지 않습니다. 기본값과 다르게 처리할 때만 변경 사유를 입력하게 하며, 환불 확정 전에는 되돌릴 수 없다는 점을 안내합니다. 내부 사유는 고객 안내와 분리합니다.','GET /admin/orders?...&page&size=20&sort=createdAt,desc. 환불 완료 API는 사유별 기본값을 서버에서 재검증하고 감사 이력을 원자적으로 저장하며 완료 상태를 역전시키는 API는 제공하지 않습니다. 반품 도착 자동 검증과 CS 접수·채널 연결 API는 범위에서 제외합니다.','날짜 입력은 KST 경계를 UTC로 변환 · 환불 요청은 멱등 처리 · 도착 확인은 운영 절차 · 고객이 기존 고객센터 번호로 직접 문의'),
rule('shipping-stages','adminShipping','발송 대상 단계','표시 대상','#shippingStages','transitions','발송 대기와 완료 주문을 분리합니다.',[['발송 대기','status=PREPARING'],['발송 완료','SHIPPED 또는 DELIVERED'],['기본 선택','발송 대기'],['정렬 기준','대기: 오래된 순 · 완료: 최근 발송 순'],['표시 개수','페이지당 20건']], '탭 변경 때 page/선택 행을 초기화합니다.','대기는 createdAt ASC, 완료는 shippedAt DESC로 조회합니다.','취소·반품·환불 주문은 발송 대상 제외'),
rule('shipping-table','adminShipping','송장 등록 · 발송 처리','상태 전이','#ordersTable','transitions','주문·구매자 정보를 묶어 확인하고 유효한 송장이 있는 주문만 발송 완료로 전이합니다.',[['표시 대상','선택한 발송 단계 주문'],['주문 일시','날짜와 시간을 줄바꿈해 표시'],['주문 정보','주문번호 아래 상품명·수량'],['구매자 정보','이름 아래 전화번호'],['배송지 정보','수령인, 연락처, 주소, 배송메모'],['택배사 범위','국내 주요·편의점·국제 특송'],['배송 조회','선택 택배사 공식 조회에 송장번호 전달'],['상세 보기','행의 주문번호에 해당하는 상세 팝업'],['필수값','carrierCode, trackingNumber'],['검증 기준','영문·숫자 8~30자리, 허용 택배사'],['완료 조건','서버 전이 성공']], '조회는 새 창에서 열고 해당 행의 택배사 공식 배송조회 페이지에 송장번호를 전달합니다. 기타 택배사만 네이버 검색으로 연결합니다.','POST /admin/orders/{id}/shipment. PREPARING 재검증, 중복 송장 검사, 원자 저장.','shippedAt은 서버 시각 · 송장은 정규화 저장'),
rule('settlement-filter','adminSettlement','정산 조회 조건','조회 기준','#settlementFilter','settlement','주문 기간과 현재 주문 데이터에 있는 지역·결제·배송 상태를 조합해 조회합니다.',[['기준일','createdAt 주문일'],['기본 기간','현재 월 1일~말일'],['선택 조건','배송 지역, 결제·환불 상태, 배송 상태'],['조건 결합','모든 조건 AND'],['시간대','Asia/Seoul 일자 경계']], '담당 부서나 카드사처럼 현재 주문에 없는 값은 임의로 만들지 않습니다.','조회 조건을 검증하고 대량 다운로드는 원장 기반 비동기 처리로 분리합니다.','시작일과 종료일 포함 · 지역은 배송지 첫 행정구역 기준'),
rule('settlement-summary','adminSettlement','정산 요약 지표','계산 · 값 설명','.settlement-cards','settlement','조회 조건에 맞는 결제액, 취소·환불액, PG 수수료와 업체 정산 예정액을 표시합니다.',[['총 결제액','승인 gross 합계'],['취소·환불액','완료 refund 합계'],['PG 수수료','정산 대상액의 2%'],['업체 정산 예정액','정산 대상액 − PG 수수료']], '조회할 때 네 개 요약 카드를 원장과 같은 데이터로 즉시 갱신합니다.','집계값, currency, 기준시각, 적용요율을 API에서 반환합니다.','2%는 시연값 · 운영은 수단별 요율/VAT/PG 원장 적용'),
rule('settlement-list','adminSettlement','결제 · 정산 원장','대사 · 검색','#settlementTable','settlement','선택한 조회 조건의 주문을 결제·환불·수수료·정산 예정액과 함께 대사합니다.',[['정렬 기준','주문일 최신순'],['검색 대상','주문번호, 구매자, 상품명'],['행 정보','주문·상품, 주문일, 구매자, 결제액, 환불액, 정산 대상액, 수수료, 예정액, 상태'],['상세 연결','주문 상세 확인'],['내려받기','현재 조회 결과 CSV']], '화면의 요약 금액과 원장 행이 동일한 조회 결과를 사용합니다.','PG 승인/취소 ID와 원장 version을 보존해 중복 반영을 막습니다.','RETURN_REQUESTED는 대기 · REFUNDED만 환불 반영'),
rule('store-settings','adminOperations','스토어 운영 설정','운영값 · 반영 범위','.store-settings-card','mvp','배송비, 취소·반품 기준, 택배사와 고객 안내를 관리합니다.',[['필수값','배송비, 취소 시간, 반품 신청 일수, 배송 안내, 반품 주소'],['적용 기준','신규 주문부터 스냅샷'],['배치 기준','숫자 → 선택 → 긴 안내'],['권한','스토어 설정 수정 권한']], '저장 전 변경/적용 범위를 알리고 성공 후 서버값으로 다시 표시합니다.','PUT /admin/store-settings에 version 충돌 검사와 변경 이력을 적용합니다.','shippingFee≥0 · cancelHours≥1 · returnDays 1~365 정수 · carrierCode enum'),
rule('product-filter','adminOperations','상품 검색 조건','표시 대상','#productFilter','data','판매 상태와 상품명으로 운영 상품을 검색합니다.',[['상태 조건','판매 중, 품절, 판매 중지, 전체'],['검색 대상','상품명'],['조건 결합','상태와 검색어를 모두 만족'],['초기 정렬','최근 수정 상품 우선']], '검색 시 첫 페이지로 이동하고 입력한 조건을 유지합니다.','관리자에게는 판매 중지 상품을 포함한 전체 상품을 조회할 수 있게 하고, 조건에 맞는 결과를 최근 수정순으로 전달합니다.','검색어 앞뒤 공백 제거 · 빈 검색어는 전체 상품 조회'),
rule('admin-products','adminOperations','상품 운영 목록','정렬 · 표시개수','#productsTable','mvp','상품 가격, 재고와 판매 상태를 확인하고 수정합니다.',[['표시 대상','검색 조건에 맞는 운영 상품'],['정렬 기준','최근 수정 시각 내림차순'],['표시 개수','페이지당 20건'],['행 정보','이미지, 이름, 가격, 재고, 상태, 수정'],['상태 제약','재고 0이면 판매 중 전환 불가']], '상품을 저장하거나 판매 상태를 바꾸면 해당 상품을 목록 맨 위로 이동합니다. 변경 실패 시 이전값과 순서로 되돌립니다.','상품 정보나 판매 상태를 변경할 때 수정 시각을 서버 기준으로 갱신합니다. 재고 변경과 상태 변경 이력도 함께 기록합니다.','최근 수정 시각은 사용자의 기기 시간이 아닌 서버 시간 사용'),
rule('product-actions','adminOperations','상품 수정 · 삭제','관리 행동','#productsTable .product-actions','mvp','상품 정보를 수정하거나 운영 목록에서 삭제합니다.',[['수정','현재 상품 정보로 편집 화면 열기'],['삭제','상품명 확인 후 최종 삭제'],['삭제 반영','고객 스토어와 운영 목록에서 제거'],['기존 주문','주문 당시 상품 정보 유지']], '수정과 삭제 결과를 즉시 목록에 반영합니다.','삭제된 상품과 관계없이 기존 주문 내역은 유지합니다.','삭제 전 확인 필수 · 삭제 후 상품 복구 불가')
];
const requirementCopy={
'store-header':['스토어 홈·주문 조회 진입 제공','장바구니 전체 상품 수량 표시'],
'home-hero':['PC·모바일 전용 배너 이미지 분리','화면 비율에 맞춘 선명한 이미지 노출','버튼·이동 링크 없이 이미지로만 구성'],
'product-grid':['판매 중·품절 상품 노출','판매 중지 상품 고객 화면 제외','최근 등록·수정 상품 우선 정렬','이미지·상태·상품명·가격 표시 및 상세 연결'],
'product-summary':['상품 이미지·상품명·설명·가격·배송비·판매 상태 표시','없는 상품·판매 중지 상품 구매 제한 안내','PC 2열·모바일 세로 배치'],
'quantity-policy':['최소 1개부터 현재 재고 범위 내 수량 선택','수량 변경 시 예상 결제 금액 즉시 반영','카운터 전체를 감싸는 박스·테두리 미사용','감소·증가 버튼은 연한 디자인시스템 주황색 원형으로 표시','비활성 감소 버튼은 중립 회색으로 구분하되 지나치게 흐리지 않게 표시','상품 상세와 장바구니 카운터 UI 통일','품절 상품 수량 변경·구매 제한','결제 시점 가격·재고 재확인','재고 초과·중복 주문 방지'],
'cart-panel':['수량 카운터 전체 박스·테두리 제거','감소·증가 버튼에 연한 디자인시스템 주황색 적용','비활성 감소 버튼은 중립 회색으로 명확하게 표시','상품 상세 카운터와 동일한 색상·크기·상태 표현 사용','삭제 버튼은 수량 조절과 시각적으로 분리','재고 범위 안에서만 수량 변경'],
'product-content':['상품 설명 → 배송 안내 → 취소 안내 순서','구매 전 배송비·발송 기준·취소 시간·부분 취소 불가 고지','주문 당시 안내 내용 보관'],
'checkout-fields':['이름·전화번호·배송지 필수 입력','배송 메모 선택 입력','입력 오류 위치별 안내','오류 발생 시 기존 입력값 유지'],
'checkout-summary':['결제 전 상품·수량·상품 금액·배송비·최종 금액 확인','장바구니 상품 순서 유지','결제 처리 중 중복 실행 방지','결제 대기 상태에서는 재고를 선점하지 않음','결제 완료가 확인된 순서대로 재고 차감','동시 결제 시 먼저 완료된 주문에 재고 우선 배정','결제 완료 직전 가격·판매 상태·재고 재검증','재고 부족 시 주문 확정·재고 차감 없이 고객 안내','동일 결제 결과의 주문 생성·재고 차감 중복 방지','가격·재고 변경 시 고객 안내'],
'orders-list':['본인 주문만 최신순 표시','주문일·주문번호·진행 상태·상품·결제 금액 표시','주문 없음·조회 오류 상태별 안내'],
'order-detail':['주문 당시 상품명·가격·수량·배송비·취소 및 반품 기준 유지','주문 당시 설정된 취소 가능 시간을 적용','발송 운송장 미등록 상태를 발송 전으로 판단','발송 전·취소 가능 시간 내 주문 전체 취소','발송 전 취소 시 상품금액과 배송비를 포함한 실제 결제금액 전액 환불','취소 완료 시 주문 수량 재고를 한 번만 복원','발송 운송장 등록 후 고객 직접 취소 차단','발송 운송장 수정·삭제로 취소 권한을 복원하지 않음','운송장 등록 후 주문 전체 반품 신청','일부 상품·일부 수량 반품 및 부분 환불 미지원','주문 당시 반품 신청 일수 적용 · 기본값 14일','최초 발송 운송장 등록 시각부터 반품 신청 기한 계산','발송 운송장 수정으로 반품 신청 기한을 다시 시작하지 않음','기한이 지난 불량·파손·오배송은 고객센터 문의 안내','반품 신청 미발송 상태 자동 만료 없음','반품 운송장 미등록 시 고객 직접 철회 허용','철회 시각·기존 신청 내용 이력 보존','반품 운송장 등록 후 직접 철회 차단·고객센터 문의','철회 후 기존 신청 기한 내 재신청 허용','철회는 주문·배송·재고에 영향 없음','환불 완료 전 반품 운송장 수정 허용','환불 완료 후 반품 운송장 수정 차단','반품 운송장 변경 이력 미보존·최신값만 저장','환불 완료 문자·알림톡 미발송','환불 결과는 주문 상세 상태로 확인','현재 상태에서 가능한 취소·반품 행동만 노출','처리 완료 후 변경 상태 즉시 반영','취소·반품·환불 중복 처리 방지'],
'admin-nav':['좌측 상단 로고를 LET’S RUN PARK · 예약 운영 시스템 체계로 통일','좌측 로고 영역과 상단 네비게이션 높이·구분선 정렬','좌측 사이드바는 데스크톱에서 고정','상단 네비게이션은 화면 상단에 고정','스크롤은 상단 네비게이션 아래의 업무 내용에서 발생','권한별 업무 메뉴 노출','현재 메뉴 강조 표시','발송 대기 주문 수 표시','좁은 화면에서도 전체 메뉴 접근'],
'sales-guide':['배송 준비·발송 완료·취소 완료 의미 안내','안내와 주문 목록의 상태 명칭 통일'],
'sales-filter':['주문 기간·결제 상태·배송 상태 조합 검색','주문번호·구매자명·전화번호·상품명 검색','조건 초기화 시 전체 주문 첫 화면 이동'],
'admin-orders':['검색 조건 일치 주문 최신순 표시','주문번호 아래 상품명·수량 표시','구매자 이름 아래 전화번호 표시','주문 한 건당 한 행 구성','발송 전 취소는 상품금액·배송비 포함 전액 환불','발송 전 취소 완료 시 재고를 한 번만 복원','반품은 주문 전체 단위 · 부분 반품·부분 환불 미지원','반품 신청 미발송 건 자동 만료 없음','반품 운송장 미등록 시 고객 직접 철회','철회 시각·기존 신청 내용 이력 보존','운송장 등록 후 철회 차단·고객센터 문의','철회 후 기한 내 재신청 허용','장기 미발송 건 고객센터 전화 확인','자동 만료 배치·자동 알림 제외','반품 운송장 미등록 시 관리자 환불 버튼 비활성화 상태로 노출','고객 발송 전 안내는 반품 정보 박스 바깥에 표시','환불 요청 저장 직전 운송장 재검증','반품 도착은 담당자가 수동 확인','별도 반품 도착 상태·확인 버튼·자동 검증 없음','반품 환불 완료 시 판매 재고 자동 복원 없음','재판매 가능 상품은 담당자가 별도 재고 조정','상품 상태 판단 필요 시 환불 완료 보류 후 고객센터 전화 안내','별도 반품 거절 상태·판정 기능 없음','단순 변심은 왕복 배송비 차감 기본값','불량·파손·오배송은 배송비 차감 없음 기본값','기본값 또는 차감액 변경 시 내부 사유 필수','최종 환불액·배송비 처리·변경 사유·처리자·시각 이력 보존','내부 변경 사유는 고객에게 미노출','환불 완료 후 되돌리기·금액 수정 차단','오처리·추가 조정은 고객센터 전화 문의','별도 CS 접수·채널 연결 기능 제외','환불 완료 문자·알림톡 미발송','환불 결과는 고객 주문 상세 상태로 안내','불러오는 중·결과 없음·오류 상태 구분'],
'shipping-stages':['발송 대기·발송 완료 주문 분리','발송 대기 주문 오래된 순 정렬','발송 완료 주문 최근 발송 순 정렬','취소·반품·환불 주문 발송 대상 제외'],
'shipping-table':['주문 날짜와 시간을 두 줄로 표시','주문번호 아래 상품명·수량 표시','구매자 이름 아래 전화번호 표시','수령인·연락처·주소·배송메모 표시','국내 주요·편의점·국제 특송 택배사 선택','선택한 택배사 공식 배송조회에 송장번호를 넣어 새 창 열기','기타 택배사는 네이버 배송조회로 연결','영문·숫자 송장번호 지원','해당 주문번호의 상세 팝업 열기','주문별 택배사·송장번호 입력 및 저장','배송 준비 주문만 발송 완료로 변경','입력 오류를 해당 주문 행에 표시','저장 실패 시 입력 내용 유지','송장번호 중복 등록 방지'],
'settlement-filter':['현재 월을 기본 조회 기간으로 설정','주문 시작일·종료일 검색','현재 배송지 데이터에 따른 지역 검색','결제·환불 상태와 배송 상태 조합 검색','없는 담당 부서·카드사 데이터는 표시하지 않음'],
'settlement-summary':['조회 결과의 총 결제액 표시','취소·환불 완료 금액 별도 표시','PG 수수료와 업체 정산 예정액 구분','원장과 동일한 데이터로 요약 갱신'],
'settlement-list':['주문번호·구매자·상품명 검색','주문별 결제·취소·환불·수수료·정산 예정 금액 표시','최근 주문부터 정렬','주문 상세 연결','현재 조회 결과 내려받기'],
'store-settings':['배송비·결제 후 취소 가능 시간·반품 신청 일수·기본 택배사·배송 안내·반품 주소 관리','취소 가능 시간은 발송 운송장 미등록 주문에만 적용','반품 신청 일수 기본값 14일','변경 설정을 신규 주문부터 적용','기존 주문의 배송비·취소 시간·반품 일수 정책 스냅샷 유지','저장 후 실제 적용값 즉시 표시'],
'product-filter':['판매 중·품절·판매 중지 상태 검색','상품명 검색','상태와 검색어 동시 적용','최근 수정 상품 우선 정렬'],
'admin-products':['이미지·상품명·가격·재고·판매 상태 표시','수정 상품 목록 상단 이동','재고 없는 상품 판매 중 전환 제한','저장 실패 시 이전 상태 복원 및 안내'],
'product-actions':['현재 상품 정보로 수정 화면 열기','수정 완료 후 목록 즉시 반영','삭제 전 상품명 포함 최종 확인','삭제 후 고객 스토어·운영 목록에서 제거','기존 주문 내역의 상품 정보 유지','삭제 완료 상품 복구 불가']
};
const stateCopy={
'product-grid':[
['판매 중','sale','고객 화면 노출 · 구매 가능'],
['품절','soldout','고객 화면 노출 · 구매 불가'],
['판매 중지','hidden','고객 화면 미노출']
],
'order-detail':[
['배송 준비 중','PREPARING','발송 전 · 주문 취소 가능'],
['발송 완료','SHIPPED','송장 등록 완료 · 주문 취소 불가 · 전체 반품 신청 가능'],
['배송 완료','DELIVERED','반품 신청 가능'],
['취소 완료','CANCELLED','발송 전 주문 취소 처리 완료'],
['반품 신청','RETURN_REQUESTED','상품 회수·환불 처리 대기'],
['환불 완료','REFUNDED','환불 처리 완료']
],
'sales-guide':[
['배송 준비 중','PREPARING','포장·발송 준비 단계'],
['발송 완료','SHIPPED','택배사·송장번호 등록 완료'],
['배송 완료','DELIVERED','고객 수령 완료'],
['취소 완료','CANCELLED','발송 전 주문 취소 완료']
],
'shipping-stages':[
['발송 대기','PREPARING','송장 등록 필요'],
['발송 완료','SHIPPED','택배 이동 중'],
['배송 완료','DELIVERED','고객 수령 완료']
],
'settlement-list':[
['정상 결제','PAID','취소·반품 없음'],
['환불 처리 대기','RETURN_REQUESTED','반품 신청 후 환불 전'],
['취소 완료','CANCELLED','발송 전 전액 취소'],
['환불 완료','REFUNDED','반품 확인 후 환불 완료']
],
'admin-products':[
['판매 중','sale','고객 화면 노출 · 구매 가능'],
['품절','soldout','고객 화면 노출 · 구매 불가'],
['판매 중지','hidden','고객 화면 미노출']
]
};

/* 2026-10-01 confirmed commerce policy. Keep the ⌥⌘K panel aligned with the final IA/spec. */
const patchSpec=(id,values)=>Object.assign(specs.find(item=>item.id===id)||{},values);
patchSpec('product-grid',{summary:'판매 중·품절 상품을 관리자가 저장한 수동 노출 순서로 표시합니다.'});
patchSpec('quantity-policy',{summary:'별도 구매 수량 제한 없이 현재 가용 재고 안에서 수량을 선택합니다.'});
patchSpec('checkout-fields',{summary:'필수 배송 정보와 선택 상세주소, 필수 동의 2종을 입력합니다.'});
patchSpec('order-detail',{summary:'발송 완료까지의 배송 상태와 전체 취소·전체 반품·반려·환불 결과를 확인합니다.'});
patchSpec('sales-filter',{summary:'기간·상태와 주문번호·상품명만 조합해 검색합니다.'});
patchSpec('admin-orders',{summary:'주문 전체 단위의 취소·반품 환불·반려·관리자 예외 환불을 처리합니다.'});
patchSpec('shipping-stages',{summary:'발송 대기와 발송 완료 주문만 분리합니다.'});
patchSpec('shipping-table',{summary:'한 주문씩 택배사와 운송장을 등록하며 최초 등록 후 삭제 없이 수정만 허용합니다.'});
patchSpec('settlement-filter',{summary:'결제 승인월을 기준으로 월 정산 원장을 조회합니다.'});
patchSpec('settlement-summary',{summary:'승인액·환불액·PG 2%·차감 이월을 반영한 지급 예정액을 표시합니다.'});
patchSpec('settlement-list',{summary:'개인정보 없이 주문·상품·금액·상태를 표시하고 검색 조건 전체를 XLSX로 내려받습니다.'});
patchSpec('store-settings',{summary:'배송비·취소시간·반품기간·단순 변심 반품비·기본 택배사와 고객 안내를 관리합니다.'});
patchSpec('product-filter',{summary:'판매 상태와 상품명으로 검색하며 저장된 수동 노출 순서를 유지합니다.'});
patchSpec('admin-products',{summary:'20건 단위 일반 목록과 전체 상품 순서 설정 모드를 분리해 운영합니다.'});
patchSpec('product-actions',{summary:'상품은 소프트 삭제하고 과거 주문·정산의 스냅샷에는 삭제 상품임을 표시합니다.'});

specs.push(
rule('mobile-purchase-bar','product','모바일 고정 구매바','구매 행동','.purchase-actions','mvp','모바일 화면 하단에 장바구니·바로 구매 또는 품절 상태를 고정 표시합니다.',[], '', '', ''),
rule('checkout-consents','checkout','필수 동의 2종','동의 · 기록','.payment-note','data','커머스 거래조건과 개인정보 수집·이용을 각각 필수 동의로 받습니다.',[], '', '', ''),
rule('home-banner-admin','adminOperations','메인 배너 관리','운영 콘텐츠','.home-banner-admin','mvp','PC·모바일 배너를 각각 업로드·미리보기·교체·기본 복원합니다.',[], '', '', ''),
rule('product-editor-policy','adminOperations','상품 등록 · 상세 에디터','필수값 · 콘텐츠','#productEditor','mvp','대표 이미지와 1원 이상 가격을 필수로 하고 상세 콘텐츠를 편집합니다.',[], '', '', ''),
rule('account-commerce-permission','adminAccounts','계정별 커머스 권한','권한','#accountsView','overview','기존 계정마다 커머스 관리자 권한을 별도 부여합니다.',[], '', '', '')
);

Object.assign(requirementCopy,{
'store-header':['스토어 홈·주문 조회·회원별 장바구니 진입 제공','장바구니 전체 상품 수량 표시','공개 사용자 화면에 관리자 진입 링크 미노출'],
'product-grid':['판매 중·품절 상품 노출','판매 중지·삭제 상품 고객 화면 제외','관리자가 저장한 displayOrder 오름차순 노출','품절·재입고·상품 수정으로 순서 자동 변경 금지','이미지·상태·상품명·가격 표시 및 상세 연결'],
'quantity-policy':['최소 1개부터 현재 재고 범위 안에서 수량 선택','재고 외 별도 1회 구매 수량 제한 없음','수량 변경 시 예상 금액 즉시 반영','품절은 구매 행동 대신 품절 상태만 표시','결제 직전 현재 가격·판매 상태·재고 재검증'],
'cart-panel':['같은 브라우저 안에서 회원별로 장바구니 저장','로그아웃 후에도 유지 · 기기 간 공유 없음','삭제·미노출·품절·구매불가 상품은 장바구니에서 자동 제거','자동 제외 시 “구매할 수 없는 상품이 장바구니에서 제외되었습니다.” 토스트만 표시','현재 판매가로 합계 갱신','재고 범위 안에서만 수량 변경'],
'product-content':['상품 상세 에디터 콘텐츠 → 배송 안내 → 취소·반품 안내 순서','배송비·발송 기준·취소 시간·전체 반품 기준 고지','상품·수량 일부 반품 미지원 고지','주문 당시 안내와 정책 버전 보관'],
'mobile-purchase-bar':['모바일 화면 하단에 구매 행동 고정','판매 가능 시 장바구니·바로 구매 표시','품절 시 품절 버튼 하나만 표시','본문을 가리지 않도록 안전영역과 하단 여백 확보'],
'checkout-fields':['이름·전화번호·우편번호·기본주소 필수','상세주소·배송메모 선택','주소 검색 실패 시 직접 입력 허용','입력 오류 위치별 안내와 기존 입력값 유지'],
'checkout-consents':['커머스 거래조건 동의 필수 · 기본 미체크','개인정보 수집·이용 동의 필수 · 기본 미체크','동의 문서 버전과 동의 시각을 주문에 각각 저장','최종 법정 문구는 고객사 검토 필요'],
'checkout-summary':['결제 전 상품·수량·상품금액·배송비·총액 확인','관리자 배송비 0원 설정 시 무료배송 표시','결제 대기 상태에서 재고 선점하지 않음','승인 완료 순서대로 재고 원자적 차감','동시 소진 후속 승인건은 PG 전액 자동 취소','결제 직전 가격 변경 시 결제를 막고 “상품 금액이 변경되었습니다. 변경된 주문 금액을 확인해 주세요.” 안내','중복 주문 생성·재고 차감 방지'],
'orders-list':['본인 주문만 최신순 표시','주문일·주문번호·진행 상태·상품·결제 금액 표시','삭제 상품은 주문 당시 이름과 “삭제된 상품” 표시 유지','주문 없음·조회 오류 상태별 안내'],
'order-detail':['주문 당시 상품명·가격·수량·배송비·정책 스냅샷 유지','배송 상태는 배송 준비 중·발송 완료까지만 사용','고객 취소는 주문 당시 설정 시간 이내이면서 운송장 미등록일 때만 허용','허용 취소는 상품금액·배송비 전액 환불 및 재고 복원','취소 재고 복원 후 판매 상태 자동 재개 금지','최초 발송 운송장 등록 시각부터 주문 당시 반품일수 적용 · 기본 14일','운송장 등록 후 주문 전체 반품만 신청 · 상품·수량 일부 반품 불가','반품 신청 후 고객 직접 반송 및 반품 운송장 등록','반품 운송장은 공백·하이픈 제거 후 영문·숫자 허용 · 중복 허용','반품 운송장 최초 등록 후 삭제 불가 · 환불/반려 전까지 수정 가능','반품 운송장 수정 이력 미보존 · 최신값만 저장','반품 운송장 미등록 전 고객 철회 가능 · 등록 후 CS 처리','반품 반려 사유 고객 표시 · 반려 후 재신청 차단','환불은 전액 또는 배송비 차감 후 전체 환불','환불 안내는 사유·차감액·최종 환불액으로 자동 생성 · 관리자 수정 불가','관리자 선택 추가 안내 문구 허용','환불 완료·반품 반려 후 상태 변경 불가','자동 문자·알림톡·푸시 미발송','기존 고객센터 전화번호·운영시간 안내 유지 · 온라인 문의 기능 제외'],
'admin-nav':['예약관리시스템과 커머스관리시스템 메뉴 그룹 분리','커머스 메뉴: 상품 판매 현황·배송 처리·매출 정산·온라인 스토어 운영','기존 계정별 커머스 관리자 권한이 있는 경우만 커머스 메뉴 노출','통합 관리자는 커머스 관리자 권한 기본 부여','현재 메뉴 강조와 발송 대기 건수 표시','주문·배송 개인정보 보존·삭제 기간은 고객사 협의 항목으로 표시'],
'sales-guide':['배송 준비 중·발송 완료·취소 완료만 안내','별도 배송 완료 상태 미사용','안내와 목록의 상태 명칭 통일'],
'sales-filter':['주문 생성일 기간·결제 상태·배송 상태 조합 검색','키워드 검색 대상은 주문번호·상품명만','반품 신청·반품 반려·환불 완료·관리자 예외 환불 상태 필터','검색·필터 변경 시 1페이지로 이동','검색 결과 전체를 다운로드 · 현재 페이지만 다운로드하지 않음'],
'admin-orders':['검색 조건 일치 주문을 20건 단위로 표시','주문번호 아래 상품명·수량 표시','결제 상태와 배송 상태를 서로 다른 값으로 관리','반품은 주문 전체 단위 · 상품·수량 일부 환불 미지원','발송 전 관리자 취소는 고객 제한시간과 무관하게 가능 · 필수 내부 사유','발송 전 취소는 전액 환불·재고 복원 · 판매 상태 자동 재개 없음','별도 반품 도착 상태·확인 버튼 없음 · 담당자가 실제 도착을 업무 절차로 확인','반품 운송장 등록 후 담당자가 실물 도착을 확인해 환불 또는 반려 처리','단순 변심은 설정의 반품비 기본값을 불러오고 건별 수정 가능','불량·파손·오배송은 배송비 차감 없음이 기본','환불은 전액 또는 배송비 차감 후 전체 금액 환불','환불 고객 안내는 자동 생성하고 수정 불가 · 추가 안내만 선택 입력','반품 환불 완료 시 판매 재고 자동 복원 없음','반품 반려 시 사유 필수·고객 노출·재신청 차단','반려 후 재발송 운송장 없이 기존 고객센터에서 처리','발송 후 관리자 예외 환불: 반품 신청·반품 운송장 없이 전액 또는 배송비 차감 가능','관리자 예외 환불은 내부 사유 필수·재고 미복원·완료 후 변경 불가','취소·반려·환불 요청은 멱등 처리','자동 알림·별도 CS 접수 기능 제외'],
'shipping-stages':['발송 대기·발송 완료 주문만 분리','별도 배송 완료 단계 미사용','발송 대기 주문 오래된 순·발송 완료 최근 발송 순','취소 주문은 발송 대상 제외','각 목록 페이지당 20건'],
'shipping-table':['주문별 택배사·운송장번호 입력 및 저장 · 일괄 배송 없음','기본 택배사를 불러오고 주문별로 변경 가능','공백·하이픈 제거 후 영문·숫자 허용 · 자리수 강제 없음','같은 운송장번호를 여러 주문에 등록 가능 · 중복 경고 없음','최초 등록 전 “등록 후 운송장 정보는 삭제할 수 없으며 수정만 가능합니다. 발송 완료로 처리하시겠습니까?” 확인','최초 등록 성공 시 발송 완료 전환','등록 후 운송장 삭제 불가·수정만 가능','운송장 수정 이력 미보존 · 최신값만 저장','입력 오류는 해당 주문 행에 표시','조회 조건 전체 CSV 내려받기 · 송장 엑셀 업로드·양식 다운로드 제외'],
'settlement-filter':['결제 승인월을 월 단위로 선택','승인일 1일부터 말일까지 집계','결제·환불 상태 조합 검색','검색·필터 변경 시 1페이지로 이동','주문번호·상품명만 검색','고객명·전화번호·주소·배송 지역 검색 없음'],
'settlement-summary':['승인월 총 결제액 표시','해당 월 취소·환불액 별도 표시','PG 수수료 2%와 환불 수수료 조정 반영','익월 8일 지급 예정 · 주말·공휴일은 다음 영업일','정산액 음수는 지급 0원·차감 이월액으로 다음 달 반영','송금·지급 완료 처리 기능 없음'],
'settlement-list':['주문번호·상품명·금액·처리상태 표시','삭제 상품은 주문 당시 상품명과 “삭제된 상품” 표시 유지','고객명·전화번호·주소 등 개인정보 미노출','승인월 원장과 이전 승인건의 해당 월 환불 조정 함께 표시','환불 완료월에 환불액과 PG 수수료 조정 반영','페이지당 20건','검색 조건 전체 결과를 실제 XLSX로 다운로드','주문·배송 CSV와 정산 XLSX 분리'],
'store-settings':['고정 배송비 관리 · 0원은 무료배송','고객 직접 취소 가능 시간 관리 · 기본 24시간','최초 운송장 등록 후 반품 신청 일수 관리 · 기본 14일','단순 변심 반품비 기본값 별도 관리 · 환불 시 불러와 건별 수정','기본 택배사와 주문별 변경 지원','배송 안내·반품 주소 관리','설정 변경은 신규 주문부터 적용하고 기존 주문 스냅샷 유지'],
'product-filter':['판매 중·품절·판매 중지 상태와 상품명 검색','검색·필터 변경 시 1페이지로 이동','일반 목록은 저장된 수동 노출 순서 유지','삭제 상품은 일반 목록에서 제외'],
'admin-products':['일반 상품 목록 페이지당 20건','이미지·상품명·가격·재고·상태·노출순서 표시','별도 순서 설정 모드에서 전체 미삭제 상품을 검색·드래그·저장','상품 편집·재고 변경·품절·재입고로 노출순서 자동 변경 금지','신규 상품은 마지막 순서','재고 0이면 품절 · 재입고 후 판매 자동 재개 금지'],
'product-actions':['대표 이미지 필수','판매가격 1원 이상 정수 · 재고 0 이상 정수','상품명·가격·재고·상태·요약·상세 에디터 수정','삭제는 소프트 삭제 · 고객 스토어와 관리자 일반 목록에서 숨김','삭제 상품 복구·편집 불가 · 필요 시 신규 등록','과거 주문·정산에는 주문 당시 스냅샷과 “삭제된 상품” 표시 유지'],
'home-banner-admin':['PC·모바일 배너 각각 등록','JPG·PNG·WebP 허용','업로드 즉시 미리보기','이미지 교체와 기본 배너 복원','PC·모바일 권장 비율 안내'],
'product-editor-policy':['대표 이미지 필수','판매가격 1원 이상 정수','상품명·가격·재고·상태·요약 저장','본문·제목·서식·목록·링크·이미지 삽입','YouTube·Vimeo·HTTPS 영상 주소 삽입','영상 파일 직접 업로드 제외','상세 콘텐츠 미리보기와 허용 HTML 정제'],
'account-commerce-permission':['기존 지역·부서·로그인 계정 정보와 커머스 권한을 분리','계정별 커머스 관리자 권한 boolean 체크','통합 관리자는 기본 true이며 해제 불가','일반 계정은 통합 관리자가 부여·해제','권한 없는 계정의 커머스 메뉴와 API 차단']
});

stateCopy['order-detail']=[
['배송 준비 중','PREPARING','운송장 미등록 · 고객 기한 내 취소 또는 관리자 취소 가능'],
['발송 완료','SHIPPED','운송장 등록 완료 · 고객 취소 불가 · 전체 반품 신청 가능'],
['취소 완료','CANCELLED','발송 전 전액 취소 · 재고 복원'],
['반품 신청 완료','RETURN_REQUESTED','고객 직접 반송·관리자 처리 대기'],
['반품 반려','RETURN_REJECTED','사유 고객 표시 · 재신청 불가'],
['반품 환불 완료','REFUNDED','전체 환불 또는 배송비 차감 환불 완료'],
['관리자 예외 환불','EXCEPTION_REFUNDED','발송 후 반품 절차 없이 관리자 환불 완료']
];
stateCopy['sales-guide']=[
['배송 준비 중','PREPARING','결제 완료 · 운송장 미등록'],
['발송 완료','SHIPPED','택배사·운송장번호 등록 완료'],
['취소 완료','CANCELLED','발송 전 주문 취소 완료']
];
stateCopy['shipping-stages']=[
['발송 대기','PREPARING','주문별 운송장 등록 필요'],
['발송 완료','SHIPPED','운송장 등록 완료 · 수정 가능']
];
stateCopy['settlement-list']=[
['정상 결제','PAID','승인월 정산 반영'],
['환불 처리 대기','RETURN_REQUESTED','정산 차감 전'],
['취소 완료','CANCELLED','취소 완료월 차감'],
['반품 환불 완료','REFUNDED','환불 완료월 차감'],
['관리자 예외 환불','EXCEPTION_REFUNDED','예외 환불 완료월 차감'],
['차감 이월','CARRY_FORWARD','음수 정산액 다음 달 차감']
];
let shell,opened=false,panelCollapsed=false,activeId='',observer,raf=0;
const isMac=/Mac|iPhone|iPad|iPod/.test(navigator.platform);
const shortcutLabel=isMac?'⌥ + ⌘ + K':'Ctrl + Alt + K';
const shortcutKeys=isMac?'<kbd>⌥</kbd>+<kbd>⌘</kbd>+<kbd>K</kbd>':'<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd>';
const $=(s,r=document)=>r.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function visible(el){if(!el)return false;const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;}
function bounds(selector){const rects=[...document.querySelectorAll(selector)].filter(visible).map(el=>el.getBoundingClientRect());if(!rects.length)return null;return rects.reduce((a,r)=>({left:Math.min(a.left,r.left),top:Math.min(a.top,r.top),right:Math.max(a.right,r.right),bottom:Math.max(a.bottom,r.bottom)}),rects[0]);}
function scope(){if($('.sidebar')){if(!$('#accountsView')?.hidden)return'adminAccounts';if(!$('#settlementView')?.hidden)return'adminSettlement';if(!$('#operationsView')?.hidden)return'adminOperations';return $('[data-view].active')?.dataset.view==='shipping'?'adminShipping':'adminSales';}const h=location.hash.slice(1);if(h.startsWith('product/'))return'product';if(h==='checkout')return'checkout';if(h.startsWith('orders/'))return'orderDetail';if(h==='orders')return'orders';return'home';}
function current(){const s=scope(),store=['home','product','checkout','orders','orderDetail'].includes(s);return specs.filter(x=>(x.scope===s||(store&&x.scope==='store')||(s.startsWith('admin')&&x.scope==='admin'))&&visible($(x.selector)));}
function ensure(){if(shell)return;shell=document.createElement('div');shell.className='dev-spec-shell';shell.hidden=true;shell.innerHTML=`<div class="dev-spec-tint"></div><div class="dev-spec-marks"></div><button type="button" class="dev-spec-reopen" hidden>요구사항 보기</button><aside class="dev-spec-panel" role="dialog" aria-modal="true" aria-labelledby="devSpecTitle"><header><div><small>화면별 개발 요청 · ${shortcutLabel}</small><h2 id="devSpecTitle">현재 화면 요구사항</h2><p class="dev-spec-subtitle"></p></div><div class="dev-spec-panel-actions"><button type="button" class="dev-spec-minimize" aria-label="요구사항 패널 접기" title="패널 접기">→</button><button type="button" class="dev-spec-close" aria-label="요구사항 닫기" title="요구사항 닫기">×</button></div></header><div class="dev-spec-legend"><span><i></i> 화면 연결 영역</span><b></b></div><div class="dev-spec-list"></div><footer><span>사용자 관점의 개발 요청사항</span>${shortcutKeys}</footer></aside>`;document.body.append(shell);$('.dev-spec-close',shell).onclick=closePolicy;$('.dev-spec-minimize',shell).onclick=()=>setPanelCollapsed(true);$('.dev-spec-reopen',shell).onclick=()=>setPanelCollapsed(false);$('.dev-spec-marks',shell).onclick=e=>{const b=e.target.closest('[data-spec-id]');if(b)activate(b.dataset.specId,true)};shell.addEventListener('pointerdown',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}const card=e.target.closest('[data-card-toggle]');if(card){e.preventDefault();activate(card.dataset.cardToggle,true)}},true);addEventListener('resize',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true,capture:true});addEventListener('hashchange',()=>opened&&setTimeout(refresh,30));}
function card(x,i){const requests=requirementCopy[x.id]||[x.summary],states=stateCopy[x.id]||[];return `<article class="dev-spec-card" data-card-id="${x.id}"><button class="dev-spec-card-head" data-card-toggle="${x.id}" aria-expanded="false"><span class="dev-spec-number">${i+1}</span><span><small>${esc(x.category)}</small><b>${esc(x.title)}</b></span><i>＋</i></button><div class="dev-spec-card-body"><h3 class="dev-spec-request-title">개발 요청사항</h3><ul class="dev-spec-requirements">${requests.map(request=>`<li>${esc(request)}</li>`).join('')}</ul>${states.length?`<h3 class="dev-spec-state-title">상태값</h3><ul class="dev-spec-states">${states.map(state=>`<li><b>${esc(state[0])}</b><code>${esc(state[1])}</code><span>${esc(state[2])}</span></li>`).join('')}</ul>`:''}</div></article>`}
function refresh(preferred){if(!opened)return;const list=current();$('.dev-spec-subtitle',shell).textContent=`${document.title.replace(/\s*\|.*$/,'')} · 요구사항 ${list.length}개`;$('.dev-spec-legend b',shell).textContent=`${list.length}개 영역`;$('.dev-spec-list',shell).innerHTML=list.map(card).join('')||'<p class="dev-spec-empty">현재 화면에 연결된 요구사항이 없습니다.</p>';shell.querySelectorAll('[data-card-toggle]').forEach(b=>b.onclick=()=>activate(b.dataset.cardToggle,true));activeId=(list.find(x=>x.id===preferred)||list.find(x=>x.section===preferred)||list[0])?.id||'';draw(list);if(activeId)activate(activeId,false);observer?.disconnect();observer=new MutationObserver(records=>{if(records.some(record=>!shell.contains(record.target)))schedule()});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});}
function positionPanel(id,list=current()){if(!shell||panelCollapsed)return;if(innerWidth<=760){shell.classList.remove('is-panel-left');$('.dev-spec-minimize',shell).textContent='→';return}const item=list.find(x=>x.id===id),r=item&&bounds(item.selector);if(!r)return;const panelWidth=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spec-panel'))||400;const overlap=(left,right)=>Math.max(0,Math.min(r.right,right)-Math.max(r.left,left));const onLeft=overlap(innerWidth-panelWidth,innerWidth)>overlap(0,panelWidth);shell.classList.toggle('is-panel-left',onLeft);$('.dev-spec-minimize',shell).textContent=onLeft?'←':'→';}
function draw(list=current()){if(!opened)return;const layer=$('.dev-spec-marks',shell),panel=$('.dev-spec-panel',shell)?.getBoundingClientRect(),panelLeft=shell.classList.contains('is-panel-left');const availableLeft=panelCollapsed?4:(panelLeft?panel.right+10:4),availableRight=panelCollapsed?innerWidth-4:(panelLeft?innerWidth-4:panel.left-10);layer.innerHTML=list.map((x,i)=>{const r=bounds(x.selector);if(!r)return'';const l=Math.max(availableLeft,r.left),t=Math.max(4,r.top),right=Math.min(availableRight,r.right),bottom=Math.min(innerHeight-4,r.bottom);if(right-l<20||bottom-t<16)return'';return `<button class="dev-spec-mark${x.id===activeId?' active':''}" data-spec-id="${x.id}" aria-label="${esc(x.title)}" style="left:${l}px;top:${t}px;width:${right-l}px;height:${bottom-t}px"><span>${i+1}</span><em>${esc(x.title)}</em></button>`}).join('');}
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{positionPanel(activeId);draw()})}
function activate(id,scroll){const list=current();if(!list.some(x=>x.id===id))return;activeId=id;positionPanel(id,list);shell.querySelectorAll('.dev-spec-card').forEach(c=>{const on=c.dataset.cardId===id;c.classList.toggle('active',on);c.querySelector('.dev-spec-card-head').setAttribute('aria-expanded',on);c.querySelector('.dev-spec-card-head i').textContent=on?'−':'＋'});draw(list);if(scroll)$(`[data-card-id="${CSS.escape(id)}"]`,shell)?.scrollIntoView({block:'nearest',behavior:'smooth'});}
function setPanelCollapsed(collapsed){if(!shell)return;panelCollapsed=collapsed;shell.classList.toggle('is-panel-collapsed',collapsed);$('.dev-spec-reopen',shell).hidden=!collapsed;schedule();(collapsed?$('.dev-spec-reopen',shell):$('.dev-spec-minimize',shell)).focus({preventScroll:true});}
function open(preferred){ensure();opened=true;shell.hidden=false;setPanelCollapsed(false);document.documentElement.classList.add('dev-spec-open');document.body.classList.add('dev-spec-open');refresh(preferred);$('.dev-spec-close',shell).focus({preventScroll:true});}
function closePolicy(){if(!shell)return;opened=false;panelCollapsed=false;shell.classList.remove('is-panel-collapsed');shell.hidden=true;observer?.disconnect();document.documentElement.classList.remove('dev-spec-open');document.body.classList.remove('dev-spec-open');}
document.addEventListener('click',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}if(opened&&e.target.closest('[data-view],a[href^="#"]'))setTimeout(refresh,30)});
document.addEventListener('keydown',e=>{const platformModifier=isMac?(e.metaKey&&!e.ctrlKey):(e.ctrlKey&&!e.metaKey);if(e.altKey&&platformModifier&&e.key.toLowerCase()==='k'){e.preventDefault();opened?closePolicy():open()}else if(e.key==='Escape'&&opened){e.preventDefault();closePolicy()}});
})();
