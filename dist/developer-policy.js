(function(){
'use strict';
// Grouped display copy; behavior remains in store/admin scripts.
const specs=[
  {
    "id": "store-header",
    "scope": "store",
    "title": "공통 헤더",
    "category": "전역 노출",
    "selector": ".store-head",
    "section": "overview"
  },
  {
    "id": "cart-panel",
    "scope": "store",
    "title": "장바구니 수량 조절",
    "category": "카운터 UI",
    "selector": "#cartPanel.open",
    "section": "transitions"
  },
  {
    "id": "home-hero",
    "scope": "home",
    "title": "홈 히어로",
    "category": "콘텐츠 · 배치",
    "selector": ".intro",
    "section": "overview"
  },
  {
    "id": "product-grid",
    "scope": "home",
    "title": "상품 카드 목록",
    "category": "정렬 · 표시개수",
    "selector": "#products",
    "section": "mvp"
  },
  {
    "id": "product-summary",
    "scope": "product",
    "title": "상품 핵심 정보",
    "category": "상세 · 값 정의",
    "selector": "#productPage .product-layout",
    "section": "mvp"
  },
  {
    "id": "quantity-policy",
    "scope": "product",
    "title": "수량 선택 · 구매 행동",
    "category": "검증 · 재고",
    "selector": "#productPage .product-selection-box",
    "section": "transitions"
  },
  {
    "id": "product-content",
    "scope": "product",
    "title": "상세정보 · 배송 · 취소",
    "category": "콘텐츠 정책",
    "selector": "#productPage .product-information",
    "section": "returns"
  },
  {
    "id": "checkout-fields",
    "scope": "checkout",
    "title": "주문자 · 배송지 입력",
    "category": "필수값 · 검증",
    "selector": "#checkoutFields",
    "section": "data"
  },
  {
    "id": "checkout-summary",
    "scope": "checkout",
    "title": "주문 요약 · 최종 금액",
    "category": "가격 · 배치",
    "selector": "#checkoutSummary",
    "section": "settlement"
  },
  {
    "id": "orders-list",
    "scope": "orders",
    "title": "내 주문 목록",
    "category": "목록 · 상태 · 고객 행동",
    "selector": "#orderList",
    "section": "returns"
  },
  {
    "id": "order-detail",
    "scope": "orderDetail",
    "title": "주문 상세",
    "category": "주문 처리 요구사항",
    "selector": "#orderList .order-detail",
    "section": "returns"
  },
  {
    "id": "admin-nav",
    "scope": "admin",
    "title": "관리자 업무 탐색",
    "category": "권한 · 배치",
    "selector": ".sidebar",
    "section": "overview"
  },
  {
    "id": "sales-guide",
    "scope": "adminSales",
    "title": "배송 상태 안내",
    "category": "값 설명",
    "selector": ".shipping-guide",
    "section": "states"
  },
  {
    "id": "sales-filter",
    "scope": "adminSales",
    "title": "주문 검색 조건",
    "category": "조회 · 입력",
    "selector": "#filterForm",
    "section": "data"
  },
  {
    "id": "admin-orders",
    "scope": "adminSales",
    "title": "주문 목록",
    "category": "조회 · 환불",
    "selector": "#ordersTable",
    "section": "returns"
  },
  {
    "id": "shipping-stages",
    "scope": "adminShipping",
    "title": "발송 대상 단계",
    "category": "표시 대상",
    "selector": "#shippingStages",
    "section": "transitions"
  },
  {
    "id": "shipping-table",
    "scope": "adminShipping",
    "title": "송장 등록 · 발송 처리",
    "category": "상태 전이",
    "selector": "#ordersTable",
    "section": "transitions"
  },
  {
    "id": "settlement-filter",
    "scope": "adminSettlement",
    "title": "정산 조회 조건",
    "category": "조회 기준",
    "selector": "#settlementFilter",
    "section": "settlement"
  },
  {
    "id": "settlement-summary",
    "scope": "adminSettlement",
    "title": "정산 요약 지표",
    "category": "계산 · 값 설명",
    "selector": ".settlement-cards",
    "section": "settlement"
  },
  {
    "id": "settlement-list",
    "scope": "adminSettlement",
    "title": "결제 · 정산 원장",
    "category": "대사 · 검색",
    "selector": "#settlementTable",
    "section": "settlement"
  },
  {
    "id": "store-settings",
    "scope": "adminOperations",
    "title": "스토어 운영 설정",
    "category": "운영값 · 반영 범위",
    "selector": ".store-settings-card",
    "section": "mvp"
  },
  {
    "id": "product-filter",
    "scope": "adminOperations",
    "title": "상품 검색 조건",
    "category": "표시 대상",
    "selector": "#productFilter",
    "section": "data"
  },
  {
    "id": "admin-products",
    "scope": "adminOperations",
    "title": "상품 운영 목록",
    "category": "정렬 · 표시개수",
    "selector": "#productsTable",
    "section": "mvp"
  },
  {
    "id": "product-actions",
    "scope": "adminOperations",
    "title": "상품 수정 · 삭제",
    "category": "관리 행동",
    "selector": "#productsTable .product-actions",
    "section": "mvp"
  },
  {
    "id": "mobile-purchase-bar",
    "scope": "product",
    "title": "모바일 고정 구매바",
    "category": "구매 행동",
    "selector": ".purchase-actions",
    "section": "mvp"
  },
  {
    "id": "checkout-consents",
    "scope": "checkout",
    "title": "필수 동의 2종",
    "category": "동의 · 기록",
    "selector": ".payment-note",
    "section": "data"
  },
  {
    "id": "home-banner-admin",
    "scope": "adminOperations",
    "title": "메인 배너 관리",
    "category": "운영 콘텐츠",
    "selector": ".home-banner-admin",
    "section": "mvp"
  },
  {
    "id": "product-editor-policy",
    "scope": "adminOperations",
    "title": "상품 등록 · 상세 에디터",
    "category": "필수값 · 콘텐츠",
    "selector": "#productEditor",
    "section": "mvp"
  },
  {
    "id": "account-commerce-permission",
    "scope": "adminAccounts",
    "title": "계정별 커머스 권한",
    "category": "권한",
    "selector": "#accountsView",
    "section": "overview"
  },
  {
    "id": "login-dialog",
    "scope": "store",
    "title": "로그인",
    "category": "인증 · 로그인",
    "selector": "#loginModal[open]",
    "section": "transitions"
  },
  {
    "id": "address-search",
    "scope": "checkout",
    "title": "주소 검색",
    "category": "입력 · 대체",
    "selector": "#addressModal:not([hidden])",
    "section": "transitions"
  },
  {
    "id": "order-complete",
    "scope": "complete",
    "title": "주문 완료",
    "category": "결과 · 이동",
    "selector": "#completePage",
    "section": "transitions"
  },
  {
    "id": "admin-order-detail",
    "scope": "admin",
    "title": "관리자 주문 상세",
    "category": "스냅샷 · 처리",
    "selector": "#detailDialog[open]",
    "section": "transitions"
  },
  {
    "id": "admin-refund-dialog",
    "scope": "admin",
    "title": "반품 환불 확정",
    "category": "금액 · 이력",
    "selector": "#refundDialog[open]",
    "section": "transitions"
  },
  {
    "id": "admin-action-dialog",
    "scope": "admin",
    "title": "취소 · 반려 · 예외 환불",
    "category": "조건 · 사유",
    "selector": "#orderActionDialog[open]",
    "section": "transitions"
  }
];
const requirementCopy={
  "store-header": [
    {
      "title": "이동 · 장바구니",
      "items": [
        "메뉴: 스토어 홈, 주문 조회, 장바구니",
        "수량: 장바구니 상품의 전체 수량 합계 표시"
      ]
    }
  ],
  "home-hero": [
    {
      "title": "배너 표시",
      "items": [
        "이미지: PC·모바일 전용 배너를 화면 비율에 맞춰 표시"
      ]
    }
  ],
  "product-grid": [
    {
      "title": "목록 표시",
      "items": [
        "대상: 판매 중·품절 상품",
        "개수: 페이지당 최대 24개, 이전·다음 이동",
        "배치: PC 3열, 모바일 2열"
      ]
    },
    {
      "title": "순서 · 카드",
      "items": [
        "정렬: 관리자가 저장한 노출 순서 유지",
        "카드: 이미지·상태·상품명·가격 표시, 상세로 연결",
        "빈 목록: 상품 없음 안내"
      ]
    }
  ],
  "product-summary": [
    {
      "title": "상품 정보",
      "items": [
        "표시: 공개 상품 1개의 이미지·이름·설명·가격·배송비·판매 상태",
        "구매 조건: 판매 중이며 재고가 1개 이상인 상품",
        "배치: PC 2열, 모바일 세로 배치"
      ]
    }
  ],
  "quantity-policy": [
    {
      "title": "수량 · 금액",
      "items": [
        "수량: 1개부터 현재 재고까지 선택",
        "금액: 수량 변경 시 상품 금액 즉시 갱신",
        "품절: 품절 상태 표시"
      ]
    },
    {
      "title": "결제 검증",
      "items": [
        "확인: 결제 직전 가격·판매 상태·재고 재검증"
      ]
    }
  ],
  "cart-panel": [
    {
      "title": "저장 · 수량",
      "items": [
        "저장: 같은 브라우저에서 회원별로 저장, 로그아웃 후 유지",
        "수량: 상품 상세와 같은 카운터, 1개부터 현재 재고까지 선택"
      ]
    },
    {
      "title": "상품 변경 · 금액",
      "items": [
        "변경: 구매 가능한 상품만 유지하고 재고 감소 시 수량 조정",
        "안내: 상품 자동 제거 시 토스트 표시",
        "금액: 현재 판매가 합계와 주문 배송비 반영"
      ]
    }
  ],
  "product-content": [
    {
      "title": "안내 구성",
      "items": [
        "순서: 상품 상세 → 배송 → 취소·반품 안내",
        "고지: 배송비·발송 기준·취소 시간·주문 전체 반품 기준",
        "보관: 주문 당시 안내와 정책 버전 저장"
      ]
    }
  ],
  "checkout-fields": [
    {
      "title": "입력 항목",
      "items": [
        "필수: 이름·전화번호·우편번호·기본주소",
        "선택: 상세주소·배송메모"
      ]
    },
    {
      "title": "입력 안내",
      "items": [
        "주소: 검색 실패 시 직접 입력",
        "오류: 해당 필드에 안내하고 입력값 유지"
      ]
    }
  ],
  "checkout-summary": [
    {
      "title": "주문 요약",
      "items": [
        "표시: 주문 상품 전체, 수량·상품금액·배송비·총액",
        "배송비: 설정값 적용, 0원은 무료배송",
        "배치: PC 우측, 모바일 입력 폼 아래"
      ]
    },
    {
      "title": "결제 처리",
      "items": [
        "재고: 승인 완료 순서로 차감, 동시 소진 후속 승인건은 전액 취소",
        "가격: 변경 시 새 금액을 안내하고 결제 재확인",
        "중복 요청: 주문 생성과 재고 차감은 한 번만 처리"
      ]
    }
  ],
  "orders-list": [
    {
      "title": "목록 조회",
      "items": [
        "대상: 본인 주문, 최신순",
        "개수: 페이지당 10건, 이전·다음 이동",
        "표시: 주문일·번호·상태·상품·결제금액"
      ]
    },
    {
      "title": "목록 안내",
      "items": [
        "삭제 상품: 주문 당시 이름과 삭제 표시 유지",
        "결과: 주문 없음·조회 오류를 구분해 안내"
      ]
    },
    {
      "title": "상태 표시와 버튼 위치",
      "items": [
        "목록: 모든 주문에서 주문 상세 보기 제공. 취소·반품·운송장 등록·수정·철회는 주문 상세에서만 진행합니다.",
        "상태 우선순위: 관리자 예외 환불 → 반품 반려 → 환불 완료 → 반품 발송 대기/반품 확인 중 → 배송 준비 중/발송 완료/취소 완료.",
        "주문 상세의 반품 영역에는 내부 처리값 신청 완료가 표시될 수 있습니다. 목록 배지는 반품 운송장 유무로 발송 대기·확인 중을 구분합니다.",
        "배송 완료: 별도 운영 상태로 사용하지 않습니다. 실제 배송 진행과 도착 여부는 택배사 배송조회에서 확인합니다."
      ]
    },
    {
      "title": "기한·고객 행동 공통 기준",
      "items": [
        "고객 취소: 출고 대기·운송장 미등록·반품 미신청이며 현재 시각이 주문 취소 마감 전일 때만 가능. 관리자 취소는 발송 전 시간 제한 없이 가능합니다.",
        "전체 반품: 발송 운송장이 있고 취소·반품·반려 처리 이력이 없는 주문에서 신청 마감 전까지 가능합니다. 기간 초과 시 불량·오배송 등은 고객센터로 문의합니다.",
        "반품 기간은 신규 주문에 저장된 값을 사용합니다. 최초 운송장 등록 후 수정해도 기산일이 새로 시작되지 않습니다.",
        "반품 신청 후 운송장 등록·수정은 신청 상태인 동안 가능합니다. 신규 신청 기한이 지났더라도 접수된 반품의 후속 처리는 진행할 수 있습니다.",
        "부분 취소·부분 반품·부분 수량 환불은 지원하지 않습니다. 모든 취소·반품은 주문 전체 단위입니다.",
        "배지와 고객 행동은 다릅니다. 취소·반품 기한 만료가 별도 배지를 만들지는 않으며, 상세 화면에서 가능한 버튼과 안내가 변경됩니다."
      ]
    },
    {
      "title": "주문번호 구조 · 예약번호와 공통 기준",
      "items": [
        "형식: G-YYMMDD-NNNNN. 예약번호 LRP-YYMMDD-NNNNN과 동일한 날짜·5자리 순번 구조를 사용하며, G는 상품 주문(Goods)을 구분합니다.",
        "예시: G-261008-00001 = 상품 주문 / 2026년 10월 8일 결제 확정 / 해당 날짜의 첫 번째 주문. 날짜는 배송일이 아니라 결제 승인일이며 한국 시간(Asia/Seoul)을 기준으로 합니다.",
        "발급: 결제 승인 확정 시 주문 한 건에 번호 하나를 발급합니다. 여러 상품·수량을 함께 구매해도 같은 주문번호를 사용하며 상품별 -1, -2 접미사는 붙이지 않습니다.",
        "순번: 날짜별 00001부터 증가하며 날짜가 바뀌면 새 순번을 시작합니다. 취소·반품·환불·상품 삭제 후에도 기존 번호를 변경하거나 재사용하지 않습니다.",
        "중복 방지: 서버에서 날짜별 순번을 원자적으로 발급하고 주문번호 고유 제약으로 중복을 방지합니다. 결제 재시도·중복 승인 알림에는 기존 주문번호를 반환하고 새 주문을 중복 생성하지 않습니다.",
        "별도 식별자: 상품·주문 항목 ID, PG 결제 거래번호, 취소·환불 거래번호, 배송·반품 운송장번호는 주문번호와 별도로 관리합니다. 고객·관리자·정산 화면에서는 같은 주문번호로 연결합니다."
      ]
    }
  ],
  "order-detail": [
    {
      "title": "주문 정보",
      "items": [
        "보관: 주문 당시 상품명·가격·수량·배송비·정책 유지",
        "배송: 배송 준비 중·발송 완료 상태 표시"
      ]
    },
    {
      "title": "취소 · 반품",
      "items": [
        "취소: 설정 시간 이내·운송장 등록 전, 전액 환불과 재고 복원",
        "반품: 최초 발송 운송장 등록일부터 설정 기간 적용, 기본 14일",
        "반송: 주문 전체를 직접 반송하고 반품 운송장 등록",
        "철회: 반품 운송장 등록 전 고객이 신청 철회",
        "재고: 취소 재고 복원 후 판매 상태 유지"
      ]
    },
    {
      "title": "운송장 · 처리 결과",
      "items": [
        "운송장: 공백·하이픈을 제거한 영문·숫자, 등록 후 최신 정보 수정",
        "반려: 사유를 고객에게 안내하고 고객센터에서 후속 처리",
        "환불: 사유·차감액·최종 금액과 선택 추가 안내 표시"
      ]
    },
    {
      "title": "상태 표시와 버튼 위치",
      "items": [
        "목록: 모든 주문에서 주문 상세 보기 제공. 취소·반품·운송장 등록·수정·철회는 주문 상세에서만 진행합니다.",
        "상태 우선순위: 관리자 예외 환불 → 반품 반려 → 환불 완료 → 반품 발송 대기/반품 확인 중 → 배송 준비 중/발송 완료/취소 완료.",
        "주문 상세의 반품 영역에는 내부 처리값 신청 완료가 표시될 수 있습니다. 목록 배지는 반품 운송장 유무로 발송 대기·확인 중을 구분합니다.",
        "배송 완료: 별도 운영 상태로 사용하지 않습니다. 실제 배송 진행과 도착 여부는 택배사 배송조회에서 확인합니다."
      ]
    },
    {
      "title": "기한·고객 행동 공통 기준",
      "items": [
        "고객 취소: 출고 대기·운송장 미등록·반품 미신청이며 현재 시각이 주문 취소 마감 전일 때만 가능. 관리자 취소는 발송 전 시간 제한 없이 가능합니다.",
        "전체 반품: 발송 운송장이 있고 취소·반품·반려 처리 이력이 없는 주문에서 신청 마감 전까지 가능합니다. 기간 초과 시 불량·오배송 등은 고객센터로 문의합니다.",
        "반품 기간은 신규 주문에 저장된 값을 사용합니다. 최초 운송장 등록 후 수정해도 기산일이 새로 시작되지 않습니다.",
        "반품 신청 후 운송장 등록·수정은 신청 상태인 동안 가능합니다. 신규 신청 기한이 지났더라도 접수된 반품의 후속 처리는 진행할 수 있습니다.",
        "부분 취소·부분 반품·부분 수량 환불은 지원하지 않습니다. 모든 취소·반품은 주문 전체 단위입니다.",
        "배지와 고객 행동은 다릅니다. 취소·반품 기한 만료가 별도 배지를 만들지는 않으며, 상세 화면에서 가능한 버튼과 안내가 변경됩니다."
      ]
    },
    {
      "title": "주문번호 구조 · 예약번호와 공통 기준",
      "items": [
        "형식: G-YYMMDD-NNNNN. 예약번호 LRP-YYMMDD-NNNNN과 동일한 날짜·5자리 순번 구조를 사용하며, G는 상품 주문(Goods)을 구분합니다.",
        "예시: G-261008-00001 = 상품 주문 / 2026년 10월 8일 결제 확정 / 해당 날짜의 첫 번째 주문. 날짜는 배송일이 아니라 결제 승인일이며 한국 시간(Asia/Seoul)을 기준으로 합니다.",
        "발급: 결제 승인 확정 시 주문 한 건에 번호 하나를 발급합니다. 여러 상품·수량을 함께 구매해도 같은 주문번호를 사용하며 상품별 -1, -2 접미사는 붙이지 않습니다.",
        "순번: 날짜별 00001부터 증가하며 날짜가 바뀌면 새 순번을 시작합니다. 취소·반품·환불·상품 삭제 후에도 기존 번호를 변경하거나 재사용하지 않습니다.",
        "중복 방지: 서버에서 날짜별 순번을 원자적으로 발급하고 주문번호 고유 제약으로 중복을 방지합니다. 결제 재시도·중복 승인 알림에는 기존 주문번호를 반환하고 새 주문을 중복 생성하지 않습니다.",
        "별도 식별자: 상품·주문 항목 ID, PG 결제 거래번호, 취소·환불 거래번호, 배송·반품 운송장번호는 주문번호와 별도로 관리합니다. 고객·관리자·정산 화면에서는 같은 주문번호로 연결합니다."
      ]
    }
  ],
  "admin-nav": [
    {
      "title": "메뉴 · 권한",
      "items": [
        "그룹: 예약관리·커머스관리 분리",
        "커머스: 상품 판매 현황·배송 처리·매출 정산·온라인 스토어 운영",
        "권한: 커머스 권한이 있는 계정에 메뉴 표시, 통합 관리자 기본 부여",
        "안내: 현재 메뉴 강조, 발송 대기 건수 표시"
      ]
    }
  ],
  "sales-guide": [
    {
      "title": "배송 상태 안내",
      "items": [
        "상태: 배송 준비 중·발송 완료·취소 완료 3개",
        "명칭: 안내와 목록에서 동일한 상태명 사용"
      ]
    }
  ],
  "sales-filter": [
    {
      "title": "조회 조건",
      "items": [
        "필터: 주문 생성일 기간·결제 상태·배송 상태",
        "검색: 주문번호·상품명"
      ]
    },
    {
      "title": "조회 결과",
      "items": [
        "페이지: 조건 변경 시 1페이지",
        "다운로드: 검색 결과 전체"
      ]
    },
    {
      "title": "상태 필터별 포함 조건",
      "items": [
        "결제 완료: 전체 취소가 아니고 반품 상태가 없는 주문. 반품 신청 완료: 반품 접수 상태이며 운송장 등록 유무와 무관. 반품 반려: 반려 처리된 주문.",
        "전액 환불 완료: 전체 취소 주문. 반품 환불 완료: 반품 환불이 완료되고 관리자 예외 환불이 아닌 주문. 관리자 예외 환불: 예외 환불 유형이 기록된 주문.",
        "배송 필터: 출고 대기 / 출고 완료 / 전체 취소의 원래 배송 상태로 조회합니다. 결제·환불 필터와 함께 선택하면 두 조건을 모두 만족하는 주문만 표시합니다.",
        "기간·검색·결제·배송 조건은 모두 AND로 적용합니다. 주문일은 생성일 기준이며 검색은 주문번호·상품명 부분 일치, 영문 대소문자를 구분하지 않습니다."
      ]
    }
  ],
  "admin-orders": [
    {
      "title": "목록 조회",
      "items": [
        "개수: 페이지당 20건",
        "정렬: 주문 생성일 최신순, 같은 시각은 주문번호 내림차순",
        "표시: 주문번호·상품명·수량, 결제·배송 상태 구분"
      ]
    },
    {
      "title": "취소 · 반품",
      "items": [
        "취소: 발송 전 관리자 취소, 사유 입력 후 전액 환불·재고 복원",
        "반품: 운송장 등록과 실물 도착 확인 후 주문 전체 환불 또는 반려",
        "반려: 사유를 고객에게 표시하고 고객센터에서 후속 처리"
      ]
    },
    {
      "title": "환불 금액 · 안내",
      "items": [
        "기본값: 단순 변심은 설정 반품비, 불량·파손·오배송은 전액 환불",
        "금액: 전액 또는 배송비 차감 후 환불, 기본값 변경 시 내부 사유 입력",
        "안내: 환불 결과 자동 생성, 추가 안내 선택 입력"
      ]
    },
    {
      "title": "예외 처리 · 이력",
      "items": [
        "예외 환불: 발송 후 관리자가 사유를 입력해 직접 환불",
        "이력: 환불액·배송비 처리·사유·담당자·시각 저장",
        "확정: 취소·반려·환불은 한 번만 처리하고 완료 결과 유지",
        "재고: 취소 시 복원 후 판매 상태 유지, 반품·예외 환불 시 현재 재고 유지"
      ]
    },
    {
      "title": "주문번호 구조 · 예약번호와 공통 기준",
      "items": [
        "형식: G-YYMMDD-NNNNN. 예약번호 LRP-YYMMDD-NNNNN과 동일한 날짜·5자리 순번 구조를 사용하며, G는 상품 주문(Goods)을 구분합니다.",
        "예시: G-261008-00001 = 상품 주문 / 2026년 10월 8일 결제 확정 / 해당 날짜의 첫 번째 주문. 날짜는 배송일이 아니라 결제 승인일이며 한국 시간(Asia/Seoul)을 기준으로 합니다.",
        "발급: 결제 승인 확정 시 주문 한 건에 번호 하나를 발급합니다. 여러 상품·수량을 함께 구매해도 같은 주문번호를 사용하며 상품별 -1, -2 접미사는 붙이지 않습니다.",
        "순번: 날짜별 00001부터 증가하며 날짜가 바뀌면 새 순번을 시작합니다. 취소·반품·환불·상품 삭제 후에도 기존 번호를 변경하거나 재사용하지 않습니다.",
        "중복 방지: 서버에서 날짜별 순번을 원자적으로 발급하고 주문번호 고유 제약으로 중복을 방지합니다. 결제 재시도·중복 승인 알림에는 기존 주문번호를 반환하고 새 주문을 중복 생성하지 않습니다.",
        "별도 식별자: 상품·주문 항목 ID, PG 결제 거래번호, 취소·환불 거래번호, 배송·반품 운송장번호는 주문번호와 별도로 관리합니다. 고객·관리자·정산 화면에서는 같은 주문번호로 연결합니다."
      ]
    },
    {
      "title": "결제·환불과 배송 상태의 구분",
      "items": [
        "결제·환불: 결제 완료 / 전액 환불 완료 / 반품 신청 완료 / 반품 반려 / 반품 환불 완료 / 관리자 예외 환불의 6가지입니다. 상태별 조건과 행동은 아래 상태값에 표시합니다.",
        "배송 상태: 배송 준비 중 / 발송 완료 / 취소 완료의 3가지입니다. 반품·환불을 해도 최초 발송 상태를 바꾸지 않으므로 두 열을 함께 확인합니다.",
        "결제 배지 우선순위: 전체 취소 → 관리자 예외 환불 → 반품 환불 완료 → 반품 반려 → 반품 신청 완료 → 결제 완료."
      ]
    },
    {
      "title": "송장 정보와 상세 처리 위치",
      "items": [
        "미등록: 발송 운송장이 없는 주문. 상품 판매 현황에서는 조회만 가능하며 등록은 배송 처리 → 발송 대기에서 진행합니다.",
        "택배사·운송장·조회: 발송 운송장이 등록된 주문. 조회는 택배사 페이지를 새 창으로 엽니다. 수정은 배송 처리 → 발송 완료에서 진행하며 최초 등록 이후 삭제할 수 없습니다.",
        "취소된 주문: 전체 취소된 주문의 송장 미등록 안내. 새 송장을 등록할 수 없습니다.",
        "상세보기: 모든 목록 행에서 제공. 관리자 취소·반품 반려·반품 환불·예외 환불 버튼은 상세에서 조건에 따라 표시합니다. 목록에서 결제 상태를 직접 변경하지 않습니다.",
        "반품 운송장은 고객이 등록하며 이 목록의 송장 정보는 최초 상품 발송 운송장입니다. 상세에서 두 운송장을 구분해 확인합니다."
      ]
    }
  ],
  "shipping-stages": [
    {
      "title": "발송 목록",
      "items": [
        "구분: 발송 대기·발송 완료",
        "정렬: 대기는 오래된 주문순, 완료는 최근 발송순",
        "개수: 각 목록 페이지당 20건"
      ]
    }
  ],
  "shipping-table": [
    {
      "title": "주문 · 운송장",
      "items": [
        "표시: 수령인·연락처·주소·배송메모",
        "등록: 주문별 택배사·운송장 입력, 기본 택배사 변경 가능",
        "검증: 공백·하이픈 제거 후 영문·숫자 허용"
      ]
    },
    {
      "title": "발송 처리",
      "items": [
        "확인: 최초 등록 전 안내·확인 후 발송 완료로 전환",
        "수정: 등록된 운송장은 최신 정보로 수정",
        "오류: 해당 주문 행에 안내"
      ]
    },
    {
      "title": "조회 · 다운로드",
      "items": [
        "조회: 택배사 공식 조회 새 창 연결, 기타 택배사는 검색 연결",
        "다운로드: 검색 결과 전체 CSV"
      ]
    },
    {
      "title": "주문번호 구조 · 예약번호와 공통 기준",
      "items": [
        "형식: G-YYMMDD-NNNNN. 예약번호 LRP-YYMMDD-NNNNN과 동일한 날짜·5자리 순번 구조를 사용하며, G는 상품 주문(Goods)을 구분합니다.",
        "예시: G-261008-00001 = 상품 주문 / 2026년 10월 8일 결제 확정 / 해당 날짜의 첫 번째 주문. 날짜는 배송일이 아니라 결제 승인일이며 한국 시간(Asia/Seoul)을 기준으로 합니다.",
        "발급: 결제 승인 확정 시 주문 한 건에 번호 하나를 발급합니다. 여러 상품·수량을 함께 구매해도 같은 주문번호를 사용하며 상품별 -1, -2 접미사는 붙이지 않습니다.",
        "순번: 날짜별 00001부터 증가하며 날짜가 바뀌면 새 순번을 시작합니다. 취소·반품·환불·상품 삭제 후에도 기존 번호를 변경하거나 재사용하지 않습니다.",
        "중복 방지: 서버에서 날짜별 순번을 원자적으로 발급하고 주문번호 고유 제약으로 중복을 방지합니다. 결제 재시도·중복 승인 알림에는 기존 주문번호를 반환하고 새 주문을 중복 생성하지 않습니다.",
        "별도 식별자: 상품·주문 항목 ID, PG 결제 거래번호, 취소·환불 거래번호, 배송·반품 운송장번호는 주문번호와 별도로 관리합니다. 고객·관리자·정산 화면에서는 같은 주문번호로 연결합니다."
      ]
    }
  ],
  "settlement-filter": [
    {
      "title": "조회 조건",
      "items": [
        "기간: 결제 승인월, 1일부터 말일까지",
        "검색: 주문번호·상품명",
        "상태: 정상 결제·취소 완료·환불 처리 대기·환불 완료",
        "페이지: 조건 변경 시 1페이지"
      ]
    }
  ],
  "settlement-summary": [
    {
      "title": "금액 집계",
      "items": [
        "결제: 승인월 총 결제액과 해당 월 취소·환불액 표시",
        "수수료: PG 2%와 환불 수수료 조정 반영"
      ]
    },
    {
      "title": "지급 예정",
      "items": [
        "일정: 익월 8일, 휴일은 다음 영업일",
        "음수 정산: 지급액 0원, 차감액은 다음 달 이월"
      ]
    }
  ],
  "settlement-list": [
    {
      "title": "원장 표시",
      "items": [
        "개수: 페이지당 20건, 처리일 최신순",
        "항목: 주문번호·상품명·금액·처리 상태",
        "삭제 상품: 주문 당시 이름과 삭제 표시 유지"
      ]
    },
    {
      "title": "환불 · 다운로드",
      "items": [
        "조정: 이전 승인건을 포함해 환불 완료월에 환불액·수수료 반영",
        "다운로드: 검색 결과 전체 XLSX"
      ]
    }
  ],
  "store-settings": [
    {
      "title": "운영 기본값",
      "items": [
        "배송비: 주문당 고정 금액, 0원은 무료배송",
        "취소 시간: 기본 24시간",
        "반품 기간: 최초 운송장 등록일부터 기본 14일",
        "반품비: 단순 변심 기본값 저장, 환불 시 건별 조정"
      ]
    },
    {
      "title": "안내 · 적용",
      "items": [
        "설정: 기본 택배사·배송 안내·반품 주소",
        "반영: 신규 주문에 적용, 기존 주문은 주문 당시 설정 유지",
        "입력: 배송비·반품비 0 이상, 취소 시간 1 이상, 반품 일수 1~365 정수"
      ]
    }
  ],
  "product-filter": [
    {
      "title": "조회 조건",
      "items": [
        "검색: 판매 중·품절·판매 중지 상태와 상품명",
        "페이지: 조건 변경 시 1페이지",
        "순서: 저장된 수동 노출 순서 유지"
      ]
    }
  ],
  "admin-products": [
    {
      "title": "상품 목록",
      "items": [
        "개수: 페이지당 20건",
        "표시: 이미지·이름·가격·재고·상태·노출 순서"
      ]
    },
    {
      "title": "순서 · 상태",
      "items": [
        "순서 설정: 전체 운영 상품 검색·드래그 후 저장",
        "순서 유지: 편집·재고·상태 변경에도 유지, 신규 상품은 마지막에 추가",
        "재고: 0개이면 품절, 재입고 후 판매 상태는 관리자가 변경"
      ]
    }
  ],
  "product-actions": [
    {
      "title": "상품 수정",
      "items": [
        "정보: 이름·가격·재고·상태·요약·상세 콘텐츠",
        "필수: 대표 이미지, 가격 1원 이상·재고 0 이상 정수",
        "저장 오류: 기존 정보·순서와 입력 내용 유지"
      ]
    },
    {
      "title": "상품 삭제",
      "items": [
        "확인: 상품명 확인 후 삭제",
        "보관: 과거 주문·정산은 주문 당시 정보와 삭제 표시 유지"
      ]
    }
  ],
  "mobile-purchase-bar": [
    {
      "title": "구매 버튼",
      "items": [
        "위치: 모바일 화면 하단 고정, 본문과 안전영역 여백 확보",
        "표시: 판매 가능 시 장바구니·바로 구매, 품절 시 품절 표시"
      ]
    }
  ],
  "checkout-consents": [
    {
      "title": "필수 동의",
      "items": [
        "항목: 거래조건·개인정보 수집 이용 각각 동의",
        "선택: 기본 미체크, 두 항목 동의 후 결제",
        "기록: 문서 버전과 동의 시각 저장"
      ]
    }
  ],
  "home-banner-admin": [
    {
      "title": "배너 등록",
      "items": [
        "이미지: PC·모바일 각각 JPG·PNG·WebP 등록",
        "미리보기: 업로드 즉시 표시, 권장 비율 안내",
        "관리: 이미지 교체·기본 배너 복원"
      ]
    }
  ],
  "product-editor-policy": [
    {
      "title": "상품 정보",
      "items": [
        "필수: 대표 이미지와 1원 이상 가격",
        "저장: 이름·가격·재고·상태·요약"
      ]
    },
    {
      "title": "상세 콘텐츠",
      "items": [
        "편집: 본문·제목·서식·목록·링크·이미지",
        "영상: YouTube·Vimeo·HTTPS 주소 삽입",
        "확인: 미리보기와 허용 HTML 정제"
      ]
    }
  ],
  "account-commerce-permission": [
    {
      "title": "권한 관리",
      "items": [
        "계정: 기존 지역·부서·로그인 정보와 커머스 권한 분리",
        "통합 관리자: 커머스 권한 기본 부여",
        "일반 계정: 통합 관리자가 개별 권한 부여·해제"
      ]
    }
  ],
  "login-dialog": [
    {
      "title": "로그인 흐름",
      "items": [
        "진입: 구매·주문 조회 전 로그인",
        "완료: 원래 하려던 행동 이어서 진행"
      ]
    }
  ],
  "address-search": [
    {
      "title": "주소 입력",
      "items": [
        "선택: 우편번호·기본주소 반영, 상세주소 선택 입력",
        "오류: 검색 실패 시 직접 입력"
      ]
    }
  ],
  "order-complete": [
    {
      "title": "완료 안내",
      "items": [
        "표시: 완료 주문 1건의 번호·상품·수량·총 결제금액",
        "이동: 주문 조회·쇼핑 계속하기"
      ]
    }
  ],
  "admin-order-detail": [
    {
      "title": "선택 주문",
      "items": [
        "표시: 선택 주문 1건, 주문 당시 상품·단가·수량·배송비·총액",
        "배송지: 수령인·연락처·주소·배송메모"
      ]
    },
    {
      "title": "처리 · 이력",
      "items": [
        "버튼: 주문 상태에 따라 취소·환불·반려 행동 표시",
        "이력: 환불 담당자·시각·기본값 변경 사유 확인"
      ]
    }
  ],
  "admin-refund-dialog": [
    {
      "title": "환불 기준",
      "items": [
        "조건: 반품 운송장 등록과 실제 상품 도착 확인",
        "기본값: 단순 변심은 설정 반품비, 불량·파손·오배송은 전액 환불",
        "조정: 전액 또는 배송비 차감 환불, 기본값 변경 시 내부 사유 입력"
      ]
    },
    {
      "title": "확정 · 안내",
      "items": [
        "고객 안내: 환불 결과 자동 생성, 추가 안내 선택 입력",
        "기록: 담당자·시각·금액·배송비 처리 저장, 완료 결과 유지"
      ]
    }
  ],
  "admin-action-dialog": [
    {
      "title": "처리 조건",
      "items": [
        "취소: 발송 전 주문, 전액 환불·재고 복원",
        "반려: 반품 운송장 등록 후, 사유를 고객에게 표시",
        "예외 환불: 발송 후 반품 절차가 없는 주문"
      ]
    },
    {
      "title": "처리 확정",
      "items": [
        "사유: 처리 사유 필수 입력",
        "결과: 한 번만 처리하고 완료 상태 유지"
      ]
    }
  ]
};
const stateCopy={
  "product-grid": [
    [
      "판매 중",
      "sale",
      "고객 화면 노출 · 구매 가능"
    ],
    [
      "품절",
      "soldout",
      "고객 화면 노출 · 구매 불가"
    ],
    [
      "판매 중지",
      "hidden",
      "고객 화면 미노출"
    ]
  ],
  "order-detail": [
    [
      "배송 준비 중",
      "PREPARING",
      "표시: 결제 승인 후 출고 대기이며 반품·환불 상태가 없는 주문. 가능: 상세 조회, 설정 취소 시간 이내(기본 24시간)·운송장 미등록일 때 주문 전체 취소. 불가: 부분 취소, 발송 전 반품 신청. 시간이 지나도 배지는 유지되지만 고객 취소 버튼은 사라집니다."
    ],
    [
      "발송 완료",
      "SHIPPED",
      "표시: 관리자가 택배사·최초 발송 운송장을 등록하여 출고 완료된 주문. 가능: 상세 조회, 배송조회, 최초 운송장 등록일부터 주문에 저장된 반품 기간(기본 14일) 이내 전체 반품 신청. 불가: 고객 취소, 부분 반품. 반품 기간이 지나도 배지는 유지되며 신청 버튼만 사라집니다."
    ],
    [
      "취소 완료",
      "CANCELLED",
      "표시: 발송 전 고객 또는 관리자가 주문 전체 취소를 완료한 경우. 결제금액 전액 취소 및 적용된 재고 복원. 가능: 상세·취소금액 확인. 불가: 취소 철회, 배송조회, 반품 신청."
    ],
    [
      "반품 발송 대기",
      "RETURN_REQUESTED",
      "표시: 전체 반품 신청 완료이며 반품 운송장이 아직 없는 주문. 가능: 반품 주소·사유 확인, 주문 상품 전체 직접 반송(착불), 반품 운송장 등록, 반품 신청 철회. 불가: 부분 반품, 중복 신청. 신청 철회 후 기존 배송 상태로 돌아가며 남은 신청 기간 안에서만 다시 신청할 수 있습니다."
    ],
    [
      "반품 확인 중",
      "RETURN_IN_TRANSIT",
      "표시: 반품 신청 완료 후 고객이 반품 택배사·운송장을 등록한 주문. 가능: 반품 운송장 수정, 반품 배송조회, 처리 내역 확인. 불가: 운송장 삭제, 고객 직접 신청 철회, 중복 반품 신청. 관리자 실물 도착 확인 후 환불 또는 반려로 변경됩니다."
    ],
    [
      "반품 반려",
      "RETURN_REJECTED",
      "표시: 반품 운송장 등록 후 관리자가 반품을 반려하고 사유를 기록한 주문. 가능: 상세·반려 사유 확인, 고객센터 문의. 불가: 고객 직접 재신청, 반품 운송장 수정, 취소. 재신청·재발송 등 후속 처리는 고객센터에서 안내합니다."
    ],
    [
      "환불 완료",
      "REFUNDED",
      "표시: 관리자가 반품 상품 도착을 확인하고 환불을 확정한 주문. 가능: 결제금액·배송비 차감·최종 환불액·환불 안내 확인, 등록된 반품 배송조회. 불가: 반품 신청, 철회, 운송장 수정, 환불액 수정. 반품 환불은 재고를 자동 복원하지 않습니다."
    ],
    [
      "관리자 예외 환불",
      "EXCEPTION_REFUNDED",
      "표시: 발송 후 관리자가 반품 절차 없이 예외 환불을 확정한 주문. 다른 상태보다 우선 표시. 가능: 상세·차감액·환불액·관리자 안내 확인. 불가: 고객 취소, 신규 반품 신청, 환불액 수정. 재고는 자동 복원하지 않습니다."
    ]
  ],
  "sales-guide": [
    [
      "배송 준비 중",
      "PREPARING",
      "결제 완료 · 운송장 미등록"
    ],
    [
      "발송 완료",
      "SHIPPED",
      "택배사·운송장번호 등록 완료"
    ],
    [
      "취소 완료",
      "CANCELLED",
      "발송 전 주문 취소 완료"
    ]
  ],
  "shipping-stages": [
    [
      "발송 대기",
      "PREPARING",
      "주문별 운송장 등록 필요"
    ],
    [
      "발송 완료",
      "SHIPPED",
      "운송장 등록 완료 · 수정 가능"
    ]
  ],
  "settlement-list": [
    [
      "정상 결제",
      "PAID",
      "승인월 정산 반영"
    ],
    [
      "환불 처리 대기",
      "RETURN_REQUESTED",
      "정산 차감 전"
    ],
    [
      "취소 완료",
      "CANCELLED",
      "취소 완료월 차감"
    ],
    [
      "반품 환불 완료",
      "REFUNDED",
      "환불 완료월 차감"
    ],
    [
      "관리자 예외 환불",
      "EXCEPTION_REFUNDED",
      "예외 환불 완료월 차감"
    ],
    [
      "차감 이월",
      "CARRY_FORWARD",
      "음수 정산액 다음 달 차감"
    ]
  ],
  "admin-products": [
    [
      "판매 중",
      "sale",
      "고객 화면 노출 · 구매 가능"
    ],
    [
      "품절",
      "soldout",
      "고객 화면 노출 · 구매 불가"
    ],
    [
      "판매 중지",
      "hidden",
      "고객 화면 미노출"
    ]
  ],
  "orders-list": [
    [
      "배송 준비 중",
      "PREPARING",
      "표시: 결제 승인 후 출고 대기이며 반품·환불 상태가 없는 주문. 가능: 상세 조회, 설정 취소 시간 이내(기본 24시간)·운송장 미등록일 때 주문 전체 취소. 불가: 부분 취소, 발송 전 반품 신청. 시간이 지나도 배지는 유지되지만 고객 취소 버튼은 사라집니다."
    ],
    [
      "발송 완료",
      "SHIPPED",
      "표시: 관리자가 택배사·최초 발송 운송장을 등록하여 출고 완료된 주문. 가능: 상세 조회, 배송조회, 최초 운송장 등록일부터 주문에 저장된 반품 기간(기본 14일) 이내 전체 반품 신청. 불가: 고객 취소, 부분 반품. 반품 기간이 지나도 배지는 유지되며 신청 버튼만 사라집니다."
    ],
    [
      "취소 완료",
      "CANCELLED",
      "표시: 발송 전 고객 또는 관리자가 주문 전체 취소를 완료한 경우. 결제금액 전액 취소 및 적용된 재고 복원. 가능: 상세·취소금액 확인. 불가: 취소 철회, 배송조회, 반품 신청."
    ],
    [
      "반품 발송 대기",
      "RETURN_REQUESTED",
      "표시: 전체 반품 신청 완료이며 반품 운송장이 아직 없는 주문. 가능: 반품 주소·사유 확인, 주문 상품 전체 직접 반송(착불), 반품 운송장 등록, 반품 신청 철회. 불가: 부분 반품, 중복 신청. 신청 철회 후 기존 배송 상태로 돌아가며 남은 신청 기간 안에서만 다시 신청할 수 있습니다."
    ],
    [
      "반품 확인 중",
      "RETURN_IN_TRANSIT",
      "표시: 반품 신청 완료 후 고객이 반품 택배사·운송장을 등록한 주문. 가능: 반품 운송장 수정, 반품 배송조회, 처리 내역 확인. 불가: 운송장 삭제, 고객 직접 신청 철회, 중복 반품 신청. 관리자 실물 도착 확인 후 환불 또는 반려로 변경됩니다."
    ],
    [
      "반품 반려",
      "RETURN_REJECTED",
      "표시: 반품 운송장 등록 후 관리자가 반품을 반려하고 사유를 기록한 주문. 가능: 상세·반려 사유 확인, 고객센터 문의. 불가: 고객 직접 재신청, 반품 운송장 수정, 취소. 재신청·재발송 등 후속 처리는 고객센터에서 안내합니다."
    ],
    [
      "환불 완료",
      "REFUNDED",
      "표시: 관리자가 반품 상품 도착을 확인하고 환불을 확정한 주문. 가능: 결제금액·배송비 차감·최종 환불액·환불 안내 확인, 등록된 반품 배송조회. 불가: 반품 신청, 철회, 운송장 수정, 환불액 수정. 반품 환불은 재고를 자동 복원하지 않습니다."
    ],
    [
      "관리자 예외 환불",
      "EXCEPTION_REFUNDED",
      "표시: 발송 후 관리자가 반품 절차 없이 예외 환불을 확정한 주문. 다른 상태보다 우선 표시. 가능: 상세·차감액·환불액·관리자 안내 확인. 불가: 고객 취소, 신규 반품 신청, 환불액 수정. 재고는 자동 복원하지 않습니다."
    ]
  ],
  "admin-orders": [
    [
      "결제 완료",
      "PAID",
      "결제 승인 후 전체 취소·반품 상태가 없는 주문. 배송 준비 중이면 관리자가 상세에서 시간 제한 없이 전체 취소 가능. 운송장 등록 후에는 반품 절차 없는 주문에 관리자 예외 환불 가능. 고객은 설정 기한 내 발송 전 전체 취소, 발송 후 기간 내 전체 반품 신청 가능."
    ],
    [
      "전액 환불 완료",
      "CANCELLED",
      "발송 전 주문 전체 취소 완료(status=전체 취소). 적용된 재고를 복원하며 배송 상태는 취소 완료. 상세에서 취소 결과 조회만 가능하고 재취소·반품·송장 등록 불가."
    ],
    [
      "반품 신청 완료",
      "RETURN_REQUESTED",
      "고객이 전체 반품을 접수(returnStatus=신청 완료). 반품 운송장 미등록: 고객 등록·철회 가능, 관리자 환불·반려 버튼 없음. 등록 후: 고객 운송장 수정·배송조회 가능, 철회 불가. 관리자는 상세에서 실물 도착 확인 후 반품 환불 또는 사유 입력 후 반려. 관리자 배지는 운송장 유무와 관계없이 동일."
    ],
    [
      "반품 반려",
      "RETURN_REJECTED",
      "관리자가 반품 운송장이 있는 신청을 반려하고 사유를 저장. 고객 상세에 사유 표시, 직접 재신청·철회·운송장 수정 불가. 관리자 목록·상세에서 결과 확인만 가능하며 후속 처리는 고객센터 안내."
    ],
    [
      "반품 환불 완료",
      "REFUNDED",
      "반품 도착 확인 후 관리자 환불 확정. 전액 또는 배송비 차감 환불이며 재고 자동 복원 없음. 고객·관리자 모두 차감액·최종 환불액·안내 확인 가능. 재환불·금액 수정·반품 재신청 불가."
    ],
    [
      "관리자 예외 환불",
      "EXCEPTION_REFUNDED",
      "발송 운송장이 있고 반품 절차가 없는 주문을 관리자가 사유 입력 후 직접 환불. 전액 또는 배송비 차감, 재고 자동 복원 없음. 고객은 환불 결과·안내 조회 가능. 재환불·금액 수정·신규 반품 불가."
    ],
    [
      "배송 준비 중",
      "PREPARING",
      "출고 대기 주문. 발송 운송장 미등록이며 배송 처리의 발송 대기에서 최초 등록 가능. 등록하면 발송 완료로 전환. 고객 취소는 주문에 저장된 기한 내만 가능, 관리자 발송 전 취소는 기한 제한 없음."
    ],
    [
      "발송 완료",
      "SHIPPED",
      "관리자가 최초 발송 운송장 등록을 완료(출고 완료). 반품 신청·반려·환불 이후에도 배송 배지는 발송 완료를 유지하며 결제·환불 열로 처리 상태를 구분. 배송 처리에서 송장 수정·조회 가능. 별도 배송 완료 상태는 사용하지 않음."
    ],
    [
      "취소 완료",
      "CANCELLED_SHIPPING",
      "발송 전 주문 전체 취소 완료. 발송 대상에서 제외되며 송장 등록 불가. 결제·환불 열은 전액 환불 완료, 송장 정보는 취소된 주문 표시."
    ]
  ],
  "sales-filter": [
    [
      "결제 완료",
      "PAID",
      "결제 승인 후 전체 취소·반품 상태가 없는 주문. 배송 준비 중이면 관리자가 상세에서 시간 제한 없이 전체 취소 가능. 운송장 등록 후에는 반품 절차 없는 주문에 관리자 예외 환불 가능. 고객은 설정 기한 내 발송 전 전체 취소, 발송 후 기간 내 전체 반품 신청 가능."
    ],
    [
      "전액 환불 완료",
      "CANCELLED",
      "발송 전 주문 전체 취소 완료(status=전체 취소). 적용된 재고를 복원하며 배송 상태는 취소 완료. 상세에서 취소 결과 조회만 가능하고 재취소·반품·송장 등록 불가."
    ],
    [
      "반품 신청 완료",
      "RETURN_REQUESTED",
      "고객이 전체 반품을 접수(returnStatus=신청 완료). 반품 운송장 미등록: 고객 등록·철회 가능, 관리자 환불·반려 버튼 없음. 등록 후: 고객 운송장 수정·배송조회 가능, 철회 불가. 관리자는 상세에서 실물 도착 확인 후 반품 환불 또는 사유 입력 후 반려. 관리자 배지는 운송장 유무와 관계없이 동일."
    ],
    [
      "반품 반려",
      "RETURN_REJECTED",
      "관리자가 반품 운송장이 있는 신청을 반려하고 사유를 저장. 고객 상세에 사유 표시, 직접 재신청·철회·운송장 수정 불가. 관리자 목록·상세에서 결과 확인만 가능하며 후속 처리는 고객센터 안내."
    ],
    [
      "반품 환불 완료",
      "REFUNDED",
      "반품 도착 확인 후 관리자 환불 확정. 전액 또는 배송비 차감 환불이며 재고 자동 복원 없음. 고객·관리자 모두 차감액·최종 환불액·안내 확인 가능. 재환불·금액 수정·반품 재신청 불가."
    ],
    [
      "관리자 예외 환불",
      "EXCEPTION_REFUNDED",
      "발송 운송장이 있고 반품 절차가 없는 주문을 관리자가 사유 입력 후 직접 환불. 전액 또는 배송비 차감, 재고 자동 복원 없음. 고객은 환불 결과·안내 조회 가능. 재환불·금액 수정·신규 반품 불가."
    ],
    [
      "배송 준비 중",
      "PREPARING",
      "출고 대기 주문. 발송 운송장 미등록이며 배송 처리의 발송 대기에서 최초 등록 가능. 등록하면 발송 완료로 전환. 고객 취소는 주문에 저장된 기한 내만 가능, 관리자 발송 전 취소는 기한 제한 없음."
    ],
    [
      "발송 완료",
      "SHIPPED",
      "관리자가 최초 발송 운송장 등록을 완료(출고 완료). 반품 신청·반려·환불 이후에도 배송 배지는 발송 완료를 유지하며 결제·환불 열로 처리 상태를 구분. 배송 처리에서 송장 수정·조회 가능. 별도 배송 완료 상태는 사용하지 않음."
    ],
    [
      "취소 완료",
      "CANCELLED_SHIPPING",
      "발송 전 주문 전체 취소 완료. 발송 대상에서 제외되며 송장 등록 불가. 결제·환불 열은 전액 환불 완료, 송장 정보는 취소된 주문 표시."
    ]
  ]
};
let shell,opened=false,panelCollapsed=false,activeId='',observer,raf=0;
const isMac=/Mac|iPhone|iPad|iPod/.test(navigator.platform);
const shortcutLabel=isMac?'⌥ + ⌘ + K':'Ctrl + Alt + K';
const shortcutKeys=isMac?'<kbd>⌥</kbd>+<kbd>⌘</kbd>+<kbd>K</kbd>':'<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd>';
const $=(s,r=document)=>r.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function visible(el){if(!el)return false;const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;}
function bounds(selector){const rects=[...document.querySelectorAll(selector)].filter(visible).map(el=>el.getBoundingClientRect());if(!rects.length)return null;return rects.reduce((a,r)=>({left:Math.min(a.left,r.left),top:Math.min(a.top,r.top),right:Math.max(a.right,r.right),bottom:Math.max(a.bottom,r.bottom)}),rects[0]);}
function scope(){
 if($('.sidebar')){
  const accountView=$('#sharedAccountsView')||$('#accountsView');
  if(accountView&&!accountView.hidden)return 'adminAccounts';
  const active=$('[data-view].active')?.dataset.view;
  const menuScopes={sales:'adminSales',shipping:'adminShipping',settlement:'adminSettlement',operations:'adminOperations'};
  if(menuScopes[active])return menuScopes[active];
  const settlement=$('#settlementView'),operations=$('#operationsView');
  if(settlement&&!settlement.hidden)return 'adminSettlement';
  if(operations&&!operations.hidden)return 'adminOperations';
  return 'adminSales';
 }
 const h=typeof StorePages!=='undefined'?StorePages.route():location.hash.slice(1);
 if(h.startsWith('product/'))return 'product';if(h==='checkout')return 'checkout';if(h.startsWith('complete/'))return 'complete';if(h.startsWith('orders/'))return 'orderDetail';if(h==='orders')return 'orders';return 'home';
}
function current(){
 const s=scope(),store=['home','product','checkout','complete','orders','orderDetail'].includes(s);
 const orderScreen=['adminSales','adminShipping','adminSettlement'].includes(s);
 return specs.filter(x=>{
  if(x.id==='admin-order-detail')return orderScreen;
  return (x.scope===s||(store&&x.scope==='store')||(s.startsWith('admin')&&x.scope==='admin'))&&visible($(x.selector));
 });
}
function ensure(){if(shell)return;shell=document.createElement('div');shell.className='dev-spec-shell';shell.hidden=true;shell.innerHTML=`<div class="dev-spec-tint"></div><div class="dev-spec-marks"></div><button type="button" class="dev-spec-reopen" hidden>요구사항 보기</button><aside class="dev-spec-panel" role="dialog" aria-modal="true" aria-labelledby="devSpecTitle"><header><div><small>화면별 개발 요청 · ${shortcutLabel}</small><h2 id="devSpecTitle">현재 화면 요구사항</h2><p class="dev-spec-subtitle"></p></div><div class="dev-spec-panel-actions"><button type="button" class="dev-spec-minimize" aria-label="요구사항 패널 접기" title="패널 접기">→</button><button type="button" class="dev-spec-close" aria-label="요구사항 닫기" title="요구사항 닫기">×</button></div></header><div class="dev-spec-legend"><span><i></i> 화면 연결 영역</span><b></b></div><div class="dev-spec-list"></div><footer><span>사용자 관점의 개발 요청사항</span>${shortcutKeys}</footer></aside>`;document.body.append(shell);$('.dev-spec-close',shell).onclick=closePolicy;$('.dev-spec-minimize',shell).onclick=()=>setPanelCollapsed(true);$('.dev-spec-reopen',shell).onclick=()=>setPanelCollapsed(false);$('.dev-spec-marks',shell).onclick=e=>{const b=e.target.closest('[data-spec-id]');if(b)activate(b.dataset.specId,true)};shell.addEventListener('pointerdown',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}const card=e.target.closest('[data-card-toggle]');if(card){e.preventDefault();activate(card.dataset.cardToggle,true)}},true);addEventListener('resize',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true,capture:true});addEventListener('hashchange',()=>opened&&setTimeout(refresh,30));}
// Modal dialogs make siblings inert; keep the policy controls inside the active modal.
function syncPolicyHost(){
 if(!shell||!opened)return;
 const modal=[...document.querySelectorAll('dialog:modal')].at(-1);
 const host=modal||document.body;
 if(shell.parentElement!==host)host.append(shell);
}
function requestItem(text){const split=text.indexOf('：')>=0?text.indexOf('：'):text.indexOf(':');return split<0?esc(text):'<strong>'+esc(text.slice(0,split))+'</strong><span>'+esc(text.slice(split+1).trim())+'</span>';}
function card(x,i){const groups=requirementCopy[x.id]||[],states=stateCopy[x.id]||[];return `<article class="dev-spec-card" data-card-id="${x.id}"><button class="dev-spec-card-head" data-card-toggle="${x.id}" aria-expanded="false"><span class="dev-spec-number">${i+1}</span><span><small>${esc(x.category)}</small><b>${esc(x.title)}</b></span><i>＋</i></button><div class="dev-spec-card-body">${groups.map(group=>`<section class="dev-spec-request-group"><h3>${esc(group.title)}</h3><ul class="dev-spec-requirements">${group.items.map(item=>`<li>${requestItem(item)}</li>`).join('')}</ul></section>`).join('')}${states.length?`<h3 class="dev-spec-state-title">상태값</h3><ul class="dev-spec-states">${states.map(state=>`<li><b>${esc(state[0])}</b><code>${esc(state[1])}</code><span>${esc(state[2])}</span></li>`).join('')}</ul>`:''}</div></article>`}
function refresh(preferred){if(!opened)return;syncPolicyHost();const list=current();$('.dev-spec-subtitle',shell).textContent=`${document.title.replace(/\s*\|.*$/,'')} · 요구사항 ${list.length}개`;$('.dev-spec-legend b',shell).textContent=`${list.length}개 영역`;$('.dev-spec-list',shell).innerHTML=list.map(card).join('')||'<p class="dev-spec-empty">현재 화면에 연결된 요구사항이 없습니다.</p>';shell.querySelectorAll('[data-card-toggle]').forEach(b=>b.onclick=()=>activate(b.dataset.cardToggle,true));activeId=(list.find(x=>x.id===preferred)||list.find(x=>x.section===preferred)||list[0])?.id||'';draw(list);if(activeId)activate(activeId,false);observer?.disconnect();observer=new MutationObserver(records=>{if(records.some(record=>!shell.contains(record.target)))schedule(true)});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','open']});}
function positionPanel(id,list=current()){if(!shell||panelCollapsed)return;if(innerWidth<=760){shell.classList.remove('is-panel-left');$('.dev-spec-minimize',shell).textContent='→';return}const item=list.find(x=>x.id===id),r=item&&bounds(item.selector);if(!r)return;const panelWidth=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spec-panel'))||400;const overlap=(left,right)=>Math.max(0,Math.min(r.right,right)-Math.max(r.left,left));const onLeft=overlap(innerWidth-panelWidth,innerWidth)>overlap(0,panelWidth);shell.classList.toggle('is-panel-left',onLeft);$('.dev-spec-minimize',shell).textContent=onLeft?'←':'→';}
function draw(list=current()){if(!opened)return;const layer=$('.dev-spec-marks',shell),panel=$('.dev-spec-panel',shell)?.getBoundingClientRect(),panelLeft=shell.classList.contains('is-panel-left');const availableLeft=panelCollapsed?4:(panelLeft?panel.right+10:4),availableRight=panelCollapsed?innerWidth-4:(panelLeft?innerWidth-4:panel.left-10);layer.innerHTML=list.map((x,i)=>{const r=bounds(x.selector);if(!r)return'';const l=Math.max(availableLeft,r.left),t=Math.max(4,r.top),right=Math.min(availableRight,r.right),bottom=Math.min(innerHeight-4,r.bottom);if(right-l<20||bottom-t<16)return'';return `<button class="dev-spec-mark${x.id===activeId?' active':''}" data-spec-id="${x.id}" aria-label="${esc(x.title)}" style="left:${l}px;top:${t}px;width:${right-l}px;height:${bottom-t}px"><span>${i+1}</span><em>${esc(x.title)}</em></button>`}).join('');}
let refreshPending=false;
function schedule(update=false){refreshPending=refreshPending||update===true;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(refreshPending){refreshPending=false;refresh(activeId);return;}positionPanel(activeId);draw()})}
function activate(id,scroll){const list=current();if(!list.some(x=>x.id===id))return;activeId=id;positionPanel(id,list);shell.querySelectorAll('.dev-spec-card').forEach(c=>{const on=c.dataset.cardId===id;c.classList.toggle('active',on);c.querySelector('.dev-spec-card-head').setAttribute('aria-expanded',on);c.querySelector('.dev-spec-card-head i').textContent=on?'−':'＋'});draw(list);if(scroll)$(`[data-card-id="${CSS.escape(id)}"]`,shell)?.scrollIntoView({block:'nearest',behavior:'smooth'});}
function setPanelCollapsed(collapsed){if(!shell)return;panelCollapsed=collapsed;shell.classList.toggle('is-panel-collapsed',collapsed);$('.dev-spec-reopen',shell).hidden=!collapsed;schedule();(collapsed?$('.dev-spec-reopen',shell):$('.dev-spec-minimize',shell)).focus({preventScroll:true});}
function open(preferred){ensure();opened=true;shell.hidden=false;setPanelCollapsed(false);document.documentElement.classList.add('dev-spec-open');document.body.classList.add('dev-spec-open');refresh(preferred||($('#detailDialog')?.open?'admin-order-detail':undefined));$('.dev-spec-close',shell).focus({preventScroll:true});}
function closePolicy(){if(!shell)return;opened=false;panelCollapsed=false;shell.classList.remove('is-panel-collapsed');shell.hidden=true;observer?.disconnect();if(shell.parentElement!==document.body)document.body.append(shell);document.documentElement.classList.remove('dev-spec-open');document.body.classList.remove('dev-spec-open');}
document.addEventListener('click',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}if(opened&&e.target.closest('[data-view],a[href^="#"]'))setTimeout(refresh,30)});
document.addEventListener('keydown',e=>{const platformModifier=isMac?(e.metaKey&&!e.ctrlKey):(e.ctrlKey&&!e.metaKey);if(e.altKey&&platformModifier&&(e.code==='KeyK'||e.key.toLowerCase()==='k')){e.preventDefault();opened?closePolicy():open()}else if(e.key==='Escape'&&opened){e.preventDefault();e.stopImmediatePropagation();closePolicy()}},true);
})();
