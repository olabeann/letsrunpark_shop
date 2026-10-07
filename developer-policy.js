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
    "category": "정렬 · 표시개수",
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
    "category": "인증 · 시연",
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
      "운송장 미등록 · 고객 기한 내 취소 또는 관리자 취소 가능"
    ],
    [
      "발송 완료",
      "SHIPPED",
      "운송장 등록 완료 · 고객 취소 불가 · 전체 반품 신청 가능"
    ],
    [
      "취소 완료",
      "CANCELLED",
      "발송 전 전액 취소 · 재고 복원"
    ],
    [
      "반품 신청 완료",
      "RETURN_REQUESTED",
      "고객 직접 반송·관리자 처리 대기"
    ],
    [
      "반품 반려",
      "RETURN_REJECTED",
      "사유 고객 표시 · 재신청 불가"
    ],
    [
      "반품 환불 완료",
      "REFUNDED",
      "전체 환불 또는 배송비 차감 환불 완료"
    ],
    [
      "관리자 예외 환불",
      "EXCEPTION_REFUNDED",
      "발송 후 반품 절차 없이 관리자 환불 완료"
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
  ]
};
let shell,opened=false,panelCollapsed=false,activeId='',observer,raf=0;
const isMac=/Mac|iPhone|iPad|iPod/.test(navigator.platform);
const shortcutLabel=isMac?'⌥ + ⌘ + K':'Ctrl + Alt + K';
const shortcutKeys=isMac?'<kbd>⌥</kbd>+<kbd>⌘</kbd>+<kbd>K</kbd>':'<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd>';
const $=(s,r=document)=>r.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function visible(el){if(!el)return false;const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;}
function bounds(selector){const rects=[...document.querySelectorAll(selector)].filter(visible).map(el=>el.getBoundingClientRect());if(!rects.length)return null;return rects.reduce((a,r)=>({left:Math.min(a.left,r.left),top:Math.min(a.top,r.top),right:Math.max(a.right,r.right),bottom:Math.max(a.bottom,r.bottom)}),rects[0]);}
function scope(){if($('.sidebar')){if(!$('#accountsView')?.hidden)return'adminAccounts';if(!$('#settlementView')?.hidden)return'adminSettlement';if(!$('#operationsView')?.hidden)return'adminOperations';return $('[data-view].active')?.dataset.view==='shipping'?'adminShipping':'adminSales';}const h=location.hash.slice(1);if(h.startsWith('product/'))return'product';if(h==='checkout')return'checkout';if(h.startsWith('complete/'))return'complete';if(h.startsWith('orders/'))return'orderDetail';if(h==='orders')return'orders';return'home';}
function current(){const s=scope(),store=['home','product','checkout','complete','orders','orderDetail'].includes(s);return specs.filter(x=>(x.scope===s||(store&&x.scope==='store')||(s.startsWith('admin')&&x.scope==='admin'))&&visible($(x.selector)));}
function ensure(){if(shell)return;shell=document.createElement('div');shell.className='dev-spec-shell';shell.hidden=true;shell.innerHTML=`<div class="dev-spec-tint"></div><div class="dev-spec-marks"></div><button type="button" class="dev-spec-reopen" hidden>요구사항 보기</button><aside class="dev-spec-panel" role="dialog" aria-modal="true" aria-labelledby="devSpecTitle"><header><div><small>화면별 개발 요청 · ${shortcutLabel}</small><h2 id="devSpecTitle">현재 화면 요구사항</h2><p class="dev-spec-subtitle"></p></div><div class="dev-spec-panel-actions"><button type="button" class="dev-spec-minimize" aria-label="요구사항 패널 접기" title="패널 접기">→</button><button type="button" class="dev-spec-close" aria-label="요구사항 닫기" title="요구사항 닫기">×</button></div></header><div class="dev-spec-legend"><span><i></i> 화면 연결 영역</span><b></b></div><div class="dev-spec-list"></div><footer><span>사용자 관점의 개발 요청사항</span>${shortcutKeys}</footer></aside>`;document.body.append(shell);$('.dev-spec-close',shell).onclick=closePolicy;$('.dev-spec-minimize',shell).onclick=()=>setPanelCollapsed(true);$('.dev-spec-reopen',shell).onclick=()=>setPanelCollapsed(false);$('.dev-spec-marks',shell).onclick=e=>{const b=e.target.closest('[data-spec-id]');if(b)activate(b.dataset.specId,true)};shell.addEventListener('pointerdown',e=>{if(e.target.closest('.dev-spec-close')){e.preventDefault();closePolicy();return}const card=e.target.closest('[data-card-toggle]');if(card){e.preventDefault();activate(card.dataset.cardToggle,true)}},true);addEventListener('resize',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true,capture:true});addEventListener('hashchange',()=>opened&&setTimeout(refresh,30));}
function requestItem(text){const split=text.indexOf('：')>=0?text.indexOf('：'):text.indexOf(':');return split<0?esc(text):'<strong>'+esc(text.slice(0,split))+'</strong><span>'+esc(text.slice(split+1).trim())+'</span>';}
function card(x,i){const groups=requirementCopy[x.id]||[],states=stateCopy[x.id]||[];return `<article class="dev-spec-card" data-card-id="${x.id}"><button class="dev-spec-card-head" data-card-toggle="${x.id}" aria-expanded="false"><span class="dev-spec-number">${i+1}</span><span><small>${esc(x.category)}</small><b>${esc(x.title)}</b></span><i>＋</i></button><div class="dev-spec-card-body">${groups.map(group=>`<section class="dev-spec-request-group"><h3>${esc(group.title)}</h3><ul class="dev-spec-requirements">${group.items.map(item=>`<li>${requestItem(item)}</li>`).join('')}</ul></section>`).join('')}${states.length?`<h3 class="dev-spec-state-title">상태값</h3><ul class="dev-spec-states">${states.map(state=>`<li><b>${esc(state[0])}</b><code>${esc(state[1])}</code><span>${esc(state[2])}</span></li>`).join('')}</ul>`:''}</div></article>`}
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
