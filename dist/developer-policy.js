(function(){
'use strict';
const rule=(id,scope,title,category,selector,section,summary,rules,fe,be,values)=>({id,scope,title,category,selector,section,summary,rules,fe,be,values});
const specs=[
rule('store-header','store','공통 헤더','전역 노출','.store-head','overview','브랜드 홈, 주문 조회와 장바구니 진입점을 제공합니다.',[['표시 대상','모든 사용자 화면'],['배치 기준','로고 좌측 · 사용자 행동 우측'],['표시 조건','장바구니 수량 1개 이상'],['표시 값','전체 상품 수량 합계']], '장바구니 수량은 라인 수가 아니라 qty 합계입니다. 인증 후 원래 행동을 이어갑니다.','인증 세션과 장바구니 요약을 서버 기준으로 제공합니다.','cartItemCount: 0 이상 정수 · 99 초과는 99+ 권장'),
rule('home-hero','home','홈 히어로','콘텐츠 · 배치','.intro','overview','스토어 목적과 상품 목록으로 이어지는 주 행동을 안내합니다.',[['표시 대상','스토어 홈'],['배치 기준','PC 2열 · 모바일 세로'],['주 행동','컬렉션 둘러보기 → #products'],['값 출처','승인된 운영 콘텐츠']], 'CTA 이동 후 상품 목록 제목의 접근성 흐름을 유지합니다.','CMS 사용 시 제목·설명·이미지·CTA를 한 묶음으로 반환합니다.','이미지는 대체 텍스트 또는 장식 이미지 처리'),
rule('product-grid','home','상품 카드 목록','정렬 · 표시개수','#products','mvp','판매 가능한 상품을 최근 등록하거나 수정한 순서대로 노출하고 상세로 연결합니다.',[['표시 대상','hidden이 아닌 상품'],['정렬 기준','최근 수정 시각 내림차순 · 가장 최근 수정 상품 우선'],['표시 개수','최대 24개 후 페이지네이션'],['배치 기준','PC 4열 · 태블릿 2열 · 모바일 1열'],['카드 정보','이미지, 상태, 상품명, 판매가']], '서버에서 받은 최신 수정순을 그대로 사용합니다. 품절 상품은 노출하되 구매를 막고 이미지 설명에는 상품명을 사용합니다.','고객에게 표시할 수 있는 상품만 조회해 가장 최근에 등록하거나 수정한 상품부터 전달합니다. 상품을 저장하거나 판매 상태를 변경할 때 서버에서 수정 시각을 새로 기록해야 합니다. 한 번에 최대 24개를 보내고 판매 중지 상품은 제외하되 품절 상품은 포함합니다.','최근 수정 시각은 서버가 기록한 값을 사용 · 판매 중=구매 가능 · 품절=노출하되 구매 불가 · 판매 중지=미노출'),
rule('product-summary','product','상품 핵심 정보','상세 · 값 정의','#productPage .product-layout','mvp','상품 이미지, 명칭, 설명, 가격, 배송비와 판매 상태를 제공합니다.',[['표시 대상','URL productId와 일치하는 공개 상품 1개'],['배치 기준','PC 이미지/구매정보 2열 · 모바일 세로'],['가격 기준','서버 판매가'],['상태 기준','sale && stock>0이면 판매 중']], '직접 URL 접근을 지원하고 숨김/없는 상품은 찾을 수 없음으로 표시합니다.','GET /products/{id}가 공개 여부, 판매가, 가용 재고, 배송 설정을 반환합니다.','price는 부가세 포함 노출가 · shippingFee는 주문 단위'),
rule('quantity-policy','product','수량 선택 · 구매 행동','검증 · 재고','#productPage .product-selection-box','transitions','구매 수량과 예상 금액을 표시하고 결제 시 서버에서 다시 검증합니다.',[['최솟값','1개'],['최댓값','가용 재고와 1회 구매 제한 중 작은 값'],['금액 계산','unitPrice × quantity'],['행동 배치','장바구니 → 바로 구매'],['품절 처리','수량·구매 행동 비활성']], '증감 시 합계를 즉시 갱신하되 클라이언트 계산을 결제 확정값으로 쓰지 않습니다.','장바구니/주문 생성 시 가격·상태·재고를 재검증하고 재고를 원자적으로 차감합니다.','quantity는 1 이상 정수 · lineAmount=unitPrice×quantity'),
rule('product-content','product','상세정보 · 배송 · 취소','콘텐츠 정책','#productPage .product-information','returns','상품 콘텐츠와 주문에 영향을 주는 배송·취소 기준을 함께 고지합니다.',[['정렬 기준','상세정보 → 배송 → 취소'],['값 출처','상품 HTML + 스토어 설정'],['필수 고지','배송비, 발송 기준, 취소 시간, 부분 취소 불가'],['빈 값','상품 요약 설명으로 대체']], '관리자 HTML은 허용 목록으로 정화하고 외부 링크에 안전 속성을 적용합니다.','저장 시 HTML sanitize와 이미지 권한을 검증하고 주문에는 정책 스냅샷을 보관합니다.','cancelHours는 발송 전 조건과 AND'),
rule('checkout-fields','checkout','주문자 · 배송지 입력','필수값 · 검증','#checkoutFields','data','주문 생성에 필요한 연락처와 배송지를 수집합니다.',[['필수 입력','이름, 전화번호, 우편번호, 기본·상세주소'],['선택 입력','배송메모'],['검증 시점','입력 중 안내 + 제출 시 최종 검증'],['배치 기준','정보 입력 → 고지 동의 → 결제']], '오류를 필드와 연결하고 값을 보존합니다. 주소 검색 실패 시 직접 입력을 허용합니다.','전화번호 정규화, 주소 길이와 금지문자를 검증하고 요청 금액은 신뢰하지 않습니다.','phone 10~11자리 · postcode 5자리 · memo 최대 100자 권장'),
rule('checkout-summary','checkout','주문 요약 · 최종 금액','가격 · 배치','#checkoutSummary','settlement','결제 전 상품, 수량, 배송비와 총액을 확인합니다.',[['표시 대상','결제 초안 상품'],['정렬 기준','장바구니/바로구매 전달 순서'],['표시 개수','초안 전체'],['금액 계산','상품 합계 + 주문 배송비'],['배치 기준','PC 우측 · 모바일 폼 아래']], '결제 중 버튼을 잠그고 서버 재계산 금액이 다르면 확인 후 재시도합니다.','POST /orders/quote가 가격·재고·배송비와 quoteId/만료시각을 반환합니다.','subtotal=Σ(price×qty), total=subtotal+shippingFee'),
rule('orders-list','orders','내 주문 목록','정렬 · 표시개수','#orderList','returns','현재 사용자의 주문만 최신순으로 표시합니다.',[['표시 대상','인증 사용자 소유 주문'],['정렬 기준','createdAt 내림차순'],['표시 개수','10건 후 더보기/페이지'],['카드 정보','일자, 번호, 상태, 상품, 총액'],['권한 기준','소유자만 조회']], '상태 문구를 enum 매핑으로 관리하고 빈 결과와 오류를 구분합니다.','GET /me/orders?page=1&size=10&sort=createdAt,desc. 세션 userId로 소유권을 강제합니다.','신청 완료+운송장 유무로 고객 반품 문구 계산'),
rule('order-detail','orderDetail','주문 상세','주문 처리 요구사항','#orderList .order-detail','returns','고객이 주문 당시의 상품 정보와 현재 진행 상태를 쉽게 확인하고, 지금 가능한 처리만 선택할 수 있어야 합니다.',[['표시 대상','로그인한 고객 본인의 주문'],['정보 순서','주문 상태 → 상품과 배송 → 취소·반품 → 배송지 → 결제 정보'],['주문 취소','배송 준비 중이고 취소 가능한 시간이 남아 있을 때'],['반품 신청','배송 완료 후 아직 반품을 신청하지 않았을 때'],['반품 운송장','반품 신청 후 고객이 상품을 발송했을 때']], '주문 상태에 따라 지금 할 수 있는 버튼만 보여주고, 처리가 끝나면 변경된 상태를 바로 확인할 수 있게 해주세요.','같은 요청이 여러 번 전달되더라도 취소·반품·환불이 중복 처리되지 않아야 하며, 주문 당시의 상품명·가격·수량은 이후 상품 정보가 바뀌어도 그대로 남아 있어야 합니다.','배송 준비 중에는 주문 취소, 배송 완료 후에는 반품 신청, 반품 확인 후에는 환불 완료 순서로 처리합니다.'),
rule('admin-nav','admin','관리자 업무 탐색','권한 · 배치','.sidebar','overview','업무별 진입점과 처리 대기 건수를 제공합니다.',[['표시 대상','권한에 허용된 메뉴'],['정렬 기준','예약 → 커머스 → 계정'],['배치 기준','좌측 고정'],['뱃지 값','발송 대기 주문 수']], '현재 메뉴를 aria-current로 표시하고 작은 화면에서는 접근 가능한 드로어로 전환합니다.','role/permissions와 업무별 pending count를 반환합니다.','pendingCount=PREPARING 주문 수 · 권한 없는 API는 403'),
rule('sales-guide','adminSales','배송 상태 안내','값 설명','.shipping-guide','states','상태 의미와 변경 조건을 목록 처리 전에 설명합니다.',[['표시 개수','핵심 상태 3개'],['정렬 기준','배송 준비 → 발송 완료 → 취소 완료'],['값 출처','공통 상태 매핑'],['노출 위치','상품 판매 현황 상단']], '안내와 테이블 뱃지는 같은 상태 매핑을 사용합니다.','내부 enum을 고정하고 변경 이벤트에 이전/새 값, 처리자, 시각을 기록합니다.','PREPARING=배송 준비 · SHIPPED=발송 완료 · CANCELLED=취소 완료'),
rule('sales-filter','adminSales','주문 검색 조건','조회 · 입력','#filterForm','data','기간, 결제·배송 상태와 식별값을 조합합니다.',[['기간 기준','주문 생성일'],['검색 대상','주문번호, 구매자, 전화번호'],['조건 결합','서로 다른 필드는 AND'],['초기화','조건 해제 후 1페이지'],['시간대','Asia/Seoul']], '검색 시 page를 1로 초기화하고 URL query 동기화를 권장합니다.','날짜 범위와 검색 길이를 제한하고 개인정보 검색 감사 로그를 남깁니다.','기간 양끝 포함 · 최대 1년 권장 · q는 trim'),
rule('admin-orders','adminSales','주문 목록','조회 · 정렬 · 페이지','#ordersTable','returns','조건에 맞는 주문을 최신순으로 조회하고 전체 주문 단위로 처리합니다.',[['표시 대상','검색 조건 일치 주문'],['정렬 기준','createdAt 내림차순 → id 내림차순'],['표시 개수','페이지당 20건'],['배치 기준','주문 1건 = 1행'],['빈 결과','필터 유지 + 안내']], '로딩·빈 결과·실패를 구분하고 중복 요청을 취소합니다.','GET /admin/orders?...&page&size=20&sort=createdAt,desc. 전체 건수/페이지를 반환합니다.','날짜 입력은 KST 경계를 UTC로 변환'),
rule('shipping-stages','adminShipping','발송 대상 단계','표시 대상','#shippingStages','transitions','발송 대기와 완료 주문을 분리합니다.',[['발송 대기','status=PREPARING'],['발송 완료','SHIPPED 또는 DELIVERED'],['기본 선택','발송 대기'],['정렬 기준','대기: 오래된 순 · 완료: 최근 발송 순'],['표시 개수','페이지당 20건']], '탭 변경 때 page/선택 행을 초기화합니다.','대기는 createdAt ASC, 완료는 shippedAt DESC로 조회합니다.','취소·반품·환불 주문은 발송 대상 제외'),
rule('shipping-table','adminShipping','송장 등록 · 발송 처리','상태 전이','#ordersTable','transitions','유효한 택배사와 송장번호가 있는 주문만 발송 완료로 전이합니다.',[['표시 대상','선택한 발송 단계 주문'],['필수값','carrierCode, trackingNumber'],['검증 기준','숫자 8~30자리, 허용 택배사'],['처리 단위','주문 1건 또는 명시적 선택'],['완료 조건','서버 전이 성공']], '행별 저장/오류를 표시하고 실패 시 입력을 보존합니다. Enter와 버튼은 같은 핸들러를 씁니다.','POST /admin/orders/{id}/shipment. PREPARING 재검증, 중복 송장 검사, 원자 저장.','shippedAt은 서버 시각 · 송장은 정규화 저장'),
rule('settlement-filter','adminSettlement','정산 조회 기간','조회 기준','#settlementFilter','settlement','주문일 기준 기간과 빠른 선택으로 조회합니다.',[['기준일','createdAt 주문일'],['빠른 선택','이번 달, 지난 달, 전체'],['시간대','Asia/Seoul 일자 경계'],['조건 반영','조회 실행 시']], '빠른 선택도 동일한 조회 흐름을 사용합니다.','대용량 전체 조회는 원장 기반 비동기 다운로드로 분리합니다.','from 00:00 포함 · to 다음날 00:00 미만'),
rule('settlement-summary','adminSettlement','정산 요약 지표','계산 · 값 설명','.settlement-cards','settlement','동일 기간의 결제, 환불, 수수료와 정산 예정액을 계산합니다.',[['총 결제액','승인 gross 합계'],['취소·환불액','완료 refund 합계'],['정산 대상액','max(0,gross-refund)'],['PG 수수료','계약 요율·반올림 적용'],['정산 예정액','net-pgFee']], '기간과 계산 설명을 표시하고 대기액을 구분합니다.','집계값, currency, 기준시각, 적용요율을 API에서 반환합니다.','2%는 시연값 · 운영은 수단별 요율/VAT/PG 원장 적용'),
rule('settlement-list','adminSettlement','주문별 정산 내역','대사 · 정렬','#settlementTable','settlement','요약을 주문 단위 원장과 대사할 근거를 제공합니다.',[['정렬 기준','createdAt 내림차순'],['표시 개수','페이지당 20건'],['행 정보','주문·환불·수수료·예정액·상태'],['상세 연결','상품과 거래 식별자']], '요약은 전체 기준이고 표는 현재 페이지임을 구분합니다.','PG 승인/취소 ID와 원장 version을 보존해 중복 반영을 막습니다.','RETURN_REQUESTED는 대기 · REFUNDED만 환불 반영'),
rule('store-settings','adminOperations','스토어 운영 설정','운영값 · 반영 범위','.store-settings-card','mvp','배송비, 취소 기준, 택배사와 고객 안내를 관리합니다.',[['필수값','배송비, 취소 시간, 배송 안내, 반품 주소'],['적용 기준','신규 주문부터 스냅샷'],['배치 기준','숫자 → 선택 → 긴 안내'],['권한','스토어 설정 수정 권한']], '저장 전 변경/적용 범위를 알리고 성공 후 서버값으로 다시 표시합니다.','PUT /admin/store-settings에 version 충돌 검사와 변경 이력을 적용합니다.','shippingFee≥0 · cancelHours≥1 · carrierCode enum'),
rule('product-filter','adminOperations','상품 검색 조건','표시 대상','#productFilter','data','판매 상태와 상품명으로 운영 상품을 검색합니다.',[['상태 조건','판매 중, 품절, 판매 중지, 전체'],['검색 대상','상품명'],['조건 결합','상태와 검색어를 모두 만족'],['초기 정렬','최근 수정 상품 우선']], '검색 시 첫 페이지로 이동하고 입력한 조건을 유지합니다.','관리자에게는 판매 중지 상품을 포함한 전체 상품을 조회할 수 있게 하고, 조건에 맞는 결과를 최근 수정순으로 전달합니다.','검색어 앞뒤 공백 제거 · 빈 검색어는 전체 상품 조회'),
rule('admin-products','adminOperations','상품 운영 목록','정렬 · 표시개수','#productsTable','mvp','상품 가격, 재고와 판매 상태를 확인하고 수정합니다.',[['표시 대상','검색 조건에 맞는 운영 상품'],['정렬 기준','최근 수정 시각 내림차순'],['표시 개수','페이지당 20건'],['행 정보','이미지, 이름, 가격, 재고, 상태, 수정'],['상태 제약','재고 0이면 판매 중 전환 불가']], '상품을 저장하거나 판매 상태를 바꾸면 해당 상품을 목록 맨 위로 이동합니다. 변경 실패 시 이전값과 순서로 되돌립니다.','상품 정보나 판매 상태를 변경할 때 수정 시각을 서버 기준으로 갱신합니다. 재고 변경과 상태 변경 이력도 함께 기록합니다.','최근 수정 시각은 사용자의 기기 시간이 아닌 서버 시간 사용'),
rule('product-actions','adminOperations','상품 수정 · 삭제','관리 행동','#productsTable .product-actions','mvp','상품 정보를 수정하거나 운영 목록에서 삭제합니다.',[['수정','현재 상품 정보로 편집 화면 열기'],['삭제','상품명 확인 후 최종 삭제'],['삭제 반영','고객 스토어와 운영 목록에서 제거'],['기존 주문','주문 당시 상품 정보 유지']], '수정과 삭제 결과를 즉시 목록에 반영합니다.','삭제된 상품과 관계없이 기존 주문 내역은 유지합니다.','삭제 전 확인 필수 · 삭제 후 상품 복구 불가')
];
const requirementCopy={
'store-header':['스토어 홈·주문 조회 진입 제공','장바구니 전체 상품 수량 표시'],
'home-hero':['PC·모바일 전용 배너 이미지 분리','화면 비율에 맞춘 선명한 이미지 노출','버튼·이동 링크 없이 이미지로만 구성'],
'product-grid':['판매 중·품절 상품 노출','판매 중지 상품 고객 화면 제외','최근 등록·수정 상품 우선 정렬','이미지·상태·상품명·가격 표시 및 상세 연결'],
'product-summary':['상품 이미지·상품명·설명·가격·배송비·판매 상태 표시','없는 상품·판매 중지 상품 구매 제한 안내','PC 2열·모바일 세로 배치'],
'quantity-policy':['최소 1개부터 현재 재고 범위 내 수량 선택','수량 변경 시 예상 결제 금액 즉시 반영','품절 상품 수량 변경·구매 제한','결제 시점 가격·재고 재확인','재고 초과·중복 주문 방지'],
'product-content':['상품 설명 → 배송 안내 → 취소 안내 순서','구매 전 배송비·발송 기준·취소 시간·부분 취소 불가 고지','주문 당시 안내 내용 보관'],
'checkout-fields':['이름·전화번호·배송지 필수 입력','배송 메모 선택 입력','입력 오류 위치별 안내','오류 발생 시 기존 입력값 유지'],
'checkout-summary':['결제 전 상품·수량·상품 금액·배송비·최종 금액 확인','장바구니 상품 순서 유지','결제 처리 중 중복 실행 방지','가격·재고 변경 시 고객 안내'],
'orders-list':['본인 주문만 최신순 표시','주문일·주문번호·진행 상태·상품·결제 금액 표시','주문 없음·조회 오류 상태별 안내'],
'order-detail':['주문 당시 상품명·가격·수량 유지','발송 전·취소 가능 시간 내 주문 전체 취소','배송 완료 후 반품 가능 기간 내 주문 전체 반품','현재 상태에서 가능한 취소·반품 행동만 노출','처리 완료 후 변경 상태 즉시 반영','취소·반품·환불 중복 처리 방지'],
'admin-nav':['권한별 업무 메뉴 노출','현재 메뉴 강조 표시','발송 대기 주문 수 표시','좁은 화면에서도 전체 메뉴 접근'],
'sales-guide':['배송 준비·발송 완료·취소 완료 의미 안내','안내와 주문 목록의 상태 명칭 통일'],
'sales-filter':['주문 기간·결제 상태·배송 상태 조합 검색','주문번호·구매자명·전화번호 검색','조건 초기화 시 전체 주문 첫 화면 이동'],
'admin-orders':['검색 조건 일치 주문 최신순 표시','주문 한 건당 한 행 구성','주문 전체 단위 처리','불러오는 중·결과 없음·오류 상태 구분'],
'shipping-stages':['발송 대기·발송 완료 주문 분리','발송 대기 주문 오래된 순 정렬','발송 완료 주문 최근 발송 순 정렬','취소·반품·환불 주문 발송 대상 제외'],
'shipping-table':['주문별 택배사·송장번호 입력 및 저장','배송 준비 주문만 발송 완료로 변경','입력 오류를 해당 주문 행에 표시','저장 실패 시 입력 내용 유지','송장번호 중복 등록 방지'],
'settlement-filter':['주문일 기준 기간 조회','이번 달·지난 달 빠른 기간 선택','선택한 시작일·종료일 주문 모두 포함'],
'settlement-summary':['결제 완료 주문 금액 합산','취소·환불 완료 금액 별도 표시','정산 대상 금액·결제 수수료 구분','계약 수수료율·반올림 기준 적용','업체 정산 예정 금액 강조 표시'],
'settlement-list':['정산 요약과 주문별 내역 연결','주문별 결제·취소·환불·수수료·정산 예정 금액 표시','반품 신청 주문 환불 처리 대기로 구분'],
'store-settings':['배송비·취소 가능 시간·기본 택배사·배송 안내·반품 주소 관리','변경 설정을 신규 주문부터 적용','기존 주문의 안내 내용 유지','저장 후 실제 적용값 즉시 표시'],
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
['발송 완료','SHIPPED','송장 등록 완료 · 주문 취소 불가'],
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
let shell,opened=false,panelCollapsed=false,activeId='',observer,raf=0;
const $=(s,r=document)=>r.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function visible(el){if(!el)return false;const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;}
function bounds(selector){const rects=[...document.querySelectorAll(selector)].filter(visible).map(el=>el.getBoundingClientRect());if(!rects.length)return null;return rects.reduce((a,r)=>({left:Math.min(a.left,r.left),top:Math.min(a.top,r.top),right:Math.max(a.right,r.right),bottom:Math.max(a.bottom,r.bottom)}),rects[0]);}
function scope(){if($('.sidebar')){if(!$('#settlementView')?.hidden)return'adminSettlement';if(!$('#operationsView')?.hidden)return'adminOperations';return $('[data-view].active')?.dataset.view==='shipping'?'adminShipping':'adminSales';}const h=location.hash.slice(1);if(h.startsWith('product/'))return'product';if(h==='checkout')return'checkout';if(h.startsWith('orders/'))return'orderDetail';if(h==='orders')return'orders';return'home';}
function current(){const s=scope(),store=['home','product','checkout','orders','orderDetail'].includes(s);return specs.filter(x=>(x.scope===s||(store&&x.scope==='store')||(s.startsWith('admin')&&x.scope==='admin'))&&visible($(x.selector)));}
function ensure(){if(shell)return;shell=document.createElement('div');shell.className='dev-spec-shell';shell.hidden=true;shell.innerHTML='<div class="dev-spec-tint"></div><div class="dev-spec-marks"></div><button type="button" class="dev-spec-reopen" hidden>요구사항 보기</button><aside class="dev-spec-panel" role="dialog" aria-modal="true" aria-labelledby="devSpecTitle"><header><div><small>화면별 개발 요청 · ⌥ + ⌘ + K</small><h2 id="devSpecTitle">현재 화면 요구사항</h2><p class="dev-spec-subtitle"></p></div><div class="dev-spec-panel-actions"><button type="button" class="dev-spec-minimize" aria-label="요구사항 패널 접기" title="패널 접기">→</button><button type="button" class="dev-spec-close" aria-label="요구사항 닫기" title="요구사항 닫기">×</button></div></header><div class="dev-spec-legend"><span><i></i> 화면 연결 영역</span><b></b></div><div class="dev-spec-list"></div><footer><span>사용자 관점의 개발 요청사항</span><kbd>⌥</kbd>+<kbd>⌘</kbd>+<kbd>K</kbd></footer></aside>';document.body.append(shell);$('.dev-spec-close',shell).onclick=closePolicy;$('.dev-spec-minimize',shell).onclick=()=>setPanelCollapsed(true);$('.dev-spec-reopen',shell).onclick=()=>setPanelCollapsed(false);$('.dev-spec-marks',shell).onclick=e=>{const b=e.target.closest('[data-spec-id]');if(b)activate(b.dataset.specId,true)};shell.addEventListener('pointerdown',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}const card=e.target.closest('[data-card-toggle]');if(card){e.preventDefault();activate(card.dataset.cardToggle,true)}},true);addEventListener('resize',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true,capture:true});addEventListener('hashchange',()=>opened&&setTimeout(refresh,30));}
function card(x,i){const requests=requirementCopy[x.id]||[x.summary],states=stateCopy[x.id]||[];return `<article class="dev-spec-card" data-card-id="${x.id}"><button class="dev-spec-card-head" data-card-toggle="${x.id}" aria-expanded="false"><span class="dev-spec-number">${i+1}</span><span><small>${esc(x.category)}</small><b>${esc(x.title)}</b></span><i>＋</i></button><div class="dev-spec-card-body"><h3 class="dev-spec-request-title">개발 요청사항</h3><ul class="dev-spec-requirements">${requests.map(request=>`<li>${esc(request)}</li>`).join('')}</ul>${states.length?`<h3 class="dev-spec-state-title">상태값</h3><ul class="dev-spec-states">${states.map(state=>`<li><b>${esc(state[0])}</b><code>${esc(state[1])}</code><span>${esc(state[2])}</span></li>`).join('')}</ul>`:''}</div></article>`}
function refresh(preferred){if(!opened)return;const list=current();$('.dev-spec-subtitle',shell).textContent=`${document.title.replace(/\s*\|.*$/,'')} · 요구사항 ${list.length}개`;$('.dev-spec-legend b',shell).textContent=`${list.length}개 영역`;$('.dev-spec-list',shell).innerHTML=list.map(card).join('')||'<p class="dev-spec-empty">현재 화면에 연결된 요구사항이 없습니다.</p>';shell.querySelectorAll('[data-card-toggle]').forEach(b=>b.onclick=()=>activate(b.dataset.cardToggle,true));activeId=(list.find(x=>x.id===preferred)||list.find(x=>x.section===preferred)||list[0])?.id||'';draw(list);if(activeId)activate(activeId,false);observer?.disconnect();observer=new MutationObserver(records=>{if(records.some(record=>!shell.contains(record.target)))schedule()});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});}
function draw(list=current()){if(!opened)return;const layer=$('.dev-spec-marks',shell),limit=panelCollapsed?innerWidth:$('.dev-spec-panel',shell).getBoundingClientRect().left;layer.innerHTML=list.map((x,i)=>{const r=bounds(x.selector);if(!r)return'';const l=Math.max(4,r.left),t=Math.max(4,r.top),right=Math.min(limit-(panelCollapsed?4:10),r.right),bottom=Math.min(innerHeight-4,r.bottom);if(right-l<20||bottom-t<16)return'';return `<button class="dev-spec-mark${x.id===activeId?' active':''}" data-spec-id="${x.id}" aria-label="${esc(x.title)}" style="left:${l}px;top:${t}px;width:${right-l}px;height:${bottom-t}px"><span>${i+1}</span><em>${esc(x.title)}</em></button>`}).join('');}
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>draw())}
function activate(id,scroll){const list=current();if(!list.some(x=>x.id===id))return;activeId=id;shell.querySelectorAll('.dev-spec-card').forEach(c=>{const on=c.dataset.cardId===id;c.classList.toggle('active',on);c.querySelector('.dev-spec-card-head').setAttribute('aria-expanded',on);c.querySelector('.dev-spec-card-head i').textContent=on?'−':'＋'});draw(list);if(scroll)$(`[data-card-id="${CSS.escape(id)}"]`,shell)?.scrollIntoView({block:'nearest',behavior:'smooth'});}
function setPanelCollapsed(collapsed){if(!shell)return;panelCollapsed=collapsed;shell.classList.toggle('is-panel-collapsed',collapsed);$('.dev-spec-reopen',shell).hidden=!collapsed;schedule();(collapsed?$('.dev-spec-reopen',shell):$('.dev-spec-minimize',shell)).focus({preventScroll:true});}
function open(preferred){ensure();opened=true;shell.hidden=false;setPanelCollapsed(false);document.documentElement.classList.add('dev-spec-open');document.body.classList.add('dev-spec-open');refresh(preferred);$('.dev-spec-close',shell).focus({preventScroll:true});}
function closePolicy(){if(!shell)return;opened=false;panelCollapsed=false;shell.classList.remove('is-panel-collapsed');shell.hidden=true;observer?.disconnect();document.documentElement.classList.remove('dev-spec-open');document.body.classList.remove('dev-spec-open');}
document.addEventListener('click',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}if(opened&&e.target.closest('[data-view],a[href^="#"]'))setTimeout(refresh,30)});
document.addEventListener('keydown',e=>{if(e.altKey&&e.metaKey&&!e.ctrlKey&&e.key.toLowerCase()==='k'){e.preventDefault();opened?closePolicy():open()}else if(e.key==='Escape'&&opened){e.preventDefault();closePolicy()}});
})();
