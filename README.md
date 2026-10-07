# 말마프렌즈 온라인 스토어

렛츠런파크 공식 굿즈 스토어의 사용자·관리자 화면을 확인할 수 있는 프런트엔드 시연 프로젝트입니다.

## 화면 바로가기

- [사용자 스토어 열기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html)
- [스토어 관리자 열기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/admin.html)

> GitHub 저장소의 공개 설정과 시연 사이트의 접근 권한은 별개입니다. 현재 시연 사이트는 허용된 계정으로 로그인해야 접근할 수 있습니다. 아래 링크가 열리지 않으면 사이트 접근 권한을 확인하거나 [로컬 실행](#로컬-실행) 방법을 이용하세요.

### 사용자 화면

| 화면 | 링크 | 확인할 내용 · 접근 조건 |
| --- | --- | --- |
| 스토어 홈 | [화면 보기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#store) | 브랜드 소개와 전체 상품 목록 |
| 상품 목록 | [화면 보기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#products) | 저장된 수동 노출 순서로 페이지당 24개 표시, 판매 중·품절 상품 확인 |
| 상품 상세 | [말마 인형 보기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/1) | 대표 이미지, 가격, 수량, 상세정보, 배송·취소 안내 |
| 주문·결제 | [화면 보기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#checkout) | 상품 상세에서 **바로 구매** 또는 장바구니에서 주문 진행 후 확인. 상품 선택 없이 열면 주문 상품 확인 안내 표시 |
| 주문 조회 | [화면 보기](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#orders) | 시연 로그인 후 페이지당 10건의 주문 목록, 결제금액, 배송 상태 확인. 주문이 없으면 빈 목록 표시 |
| 주문 상세 | 주문 조회 → **주문 상세 보기** | `#orders/주문번호` 경로. 발송 완료 주문의 전체 반품 신청, 직접 반송 안내, 발송 후 운송장 등록과 고객 환불 안내 확인 |
| 주문 완료 | 주문·결제 → **결제하기** | `#complete/주문번호` 경로. 시연 주문 완료 후 표시 |
| 로그인 | 주문 조회 또는 구매 버튼 클릭 | 로그인 선택 팝업. 실제 소셜 인증 대신 시연 상태로 전환 |
| 장바구니 | 상품 상세 → **장바구니에 담기** | 같은 화면 안에서 열리는 패널 |
| 주소 검색 | 주문·결제 → **주소 검색** | 주소 검색 팝업 또는 우편번호·주소 직접 입력 |

주문 상세와 주문 완료는 주문마다 주소가 달라집니다. 먼저 시연 주문을 만든 뒤 화면의 링크로 이동하세요.

### 상품별 상세 화면

초기 샘플 상품 기준입니다. 관리자에서 상품을 등록하면 마지막 순서에 추가됩니다. 상품명·판매 상태·재고를 수정해도 노출 순서는 유지되며, 별도의 **노출 순서 설정**에서 변경합니다.

| 상품 | 경로 | 확인할 화면 |
| --- | --- | --- |
| [말마 인형](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/1) | `#product/1` | 상품 소개 · 수량 선택 · 구매 |
| [경주마 인형 A](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/2) | `#product/2` | 상품 소개 · 수량 선택 · 구매 |
| [경주마 인형 B](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/3) | `#product/3` | 품절 화면 |
| [말마 미니 인형](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/4) | `#product/4` | 상품 소개 · 수량 선택 · 구매 |
| [말마 인형 키링](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/5) | `#product/5` | 상품 소개 · 수량 선택 · 구매 |
| [경주마 미니 인형](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/6) | `#product/6` | 상품 소개 · 수량 선택 · 구매 |
| [말마 쿠션 인형](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/7) | `#product/7` | 상품 소개 · 수량 선택 · 구매 |
| [말마 인형 선물 세트](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/index.html#product/8) | `#product/8` | 상품 소개 · 수량 선택 · 구매 |

### 관리자 화면

[관리자 페이지](https://letsrunpark-goods-store.wiiee-dev.chatgpt.site/admin.html)를 연 뒤 왼쪽 **커머스관리시스템** 메뉴를 이용하세요. 관리자 세부 메뉴와 팝업은 별도 URL 없이 같은 페이지에서 전환됩니다.

| 화면 | 접근 방법 | 확인할 내용 |
| --- | --- | --- |
| 상품 판매 현황 | 관리자 접속 시 기본 화면 / **상품 판매 현황** | 주문 검색, 기간·결제·배송 상태 필터, 주문 목록, CSV 다운로드 |
| 주문 상세 | 상품 판매 현황 → 주문 상세 버튼 | 구매 상품, 배송지, 결제·배송 정보와 전체 반품 신청·반품 운송장 확인. 추천 배송비 처리와 고객 안내를 확인한 후 환불 완료 처리 |
| 배송 처리 | **배송 처리** | 발송 대상·발송 완료 목록, 택배사·송장번호 입력, 주문별 최초 송장 등록 시 발송 완료 처리 |
| 온라인 스토어 운영 | **온라인 스토어 운영** | 상품 검색, 판매 상태, 가격, 재고 관리 |
| 상품 등록 | 온라인 스토어 운영 → **상품 등록** | 상품 정보, 대표 이미지, 상세 소개 편집 팝업 |
| 상품 수정 | 온라인 스토어 운영 → 상품 수정 버튼 | 상품 정보·가격·재고·판매 상태 수정 |
| 스토어 설정 | **스토어 설정** 버튼 | 배송비, 취소 가능 시간, 배송 안내 문구와 고객에게 표시할 반품 주소 설정 팝업 |

예약관리시스템 메뉴는 별도 예약 프로젝트로 연결됩니다.

| 연결 화면 | 링크 |
| --- | --- |
| 예약 · 티켓 | [예약 관리자](https://olabeann.github.io/letsrunpark-reser/admin-reservations.html) |
| 프로그램 · 회차 / 운영일 관리 / 매출 · 정산 / 계정 · 권한 | [예약 운영 관리자](https://olabeann.github.io/letsrunpark-reser/admin.html) |

위 네 메뉴는 현재 동일한 예약 관리자 주소로 연결됩니다.

## 추천 확인 순서

1. 사용자 홈 → 상품 상세에서 수량 선택 → **바로 구매**.
2. 시연 로그인 → 주문·결제 화면에서 테스트 정보 입력 → 거래조건·개인정보 필수 동의 2종 → **결제하기**.
3. 주문 완료 → 주문 조회 → 주문 상세에서 결제·배송 정보 확인.
4. 같은 브라우저에서 관리자 접속 → 배송 처리에서 택배사와 송장번호 입력 → 주문별 발송 완료.
5. 사용자 주문 상세를 다시 열어 배송 상태와 송장번호 확인.
6. 관리자 **온라인 스토어 운영**에서 상품·재고·상세 소개 편집 후 사용자 상품 상세 확인.

반품·환불 흐름은 주문 조회의 배송 완료 예시 주문에서 확인할 수 있습니다. 고객은 주문 전체 반품을 먼저 신청하고, 안내된 주소로 착불 발송한 뒤 주문 상세에서 반품 운송장을 등록합니다. 고객에게 반품 발송 대기·반품 확인 중·반품 반려·환불 완료·관리자 예외 환불 상태를 표시합니다. 관리자는 별도 수거 예약 없이 도착 상품과 운송장을 확인하고, 반품 사유에 맞게 추천된 배송비 차감 여부·고객 안내를 확인한 뒤 환불을 완료합니다.

## 로컬 실행

HTML·CSS·JavaScript로 구성되어 있으며 패키지 설치나 빌드 없이 실행할 수 있습니다. Python 3가 설치된 환경에서 저장소 루트에서 실행하세요.

```sh
python3 -m http.server 8000 --directory dist
```

- [로컬 사용자 화면](http://localhost:8000/index.html)
- [로컬 상품 상세](http://localhost:8000/index.html#product/1)
- [로컬 주문 조회](http://localhost:8000/index.html#orders)
- [로컬 관리자 화면](http://localhost:8000/admin.html)

시연 링크의 도메인을 `http://localhost:8000`으로 바꾸면 동일한 경로를 확인할 수 있습니다. GitHub에서 `dist/index.html` 파일을 클릭하면 소스가 표시되므로, 화면은 시연 사이트 또는 로컬 서버에서 확인하세요.

## 시연 데이터와 구현 범위

- 상품·장바구니·주문·스토어 설정은 브라우저의 `localStorage`, 결제 진행 정보는 `sessionStorage`에 저장됩니다.
- 사용자·관리자 데이터 확인은 같은 브라우저의 같은 사이트 주소에서 진행하세요. 배포 사이트와 로컬 서버의 데이터는 각각 저장됩니다.
- 실제 회원 인증, 카드 결제, 서버 주문·재고 연동을 완료한 운영 서비스가 아닙니다. 결제 완료와 취소 처리는 시연 동작입니다.
- 관리자 화면에는 서버 기반 관리자 인증이 구현되어 있지 않습니다.

## 파일 및 기획 자료

| 위치 | 내용 |
| --- | --- |
| [dist/index.html](dist/index.html) | 사용자 스토어 화면과 초기 상품 데이터 |
| [dist/store-flow.js](dist/store-flow.js) | 상품 상세, 주문·결제, 주문 조회 경로와 시연 흐름 |
| [dist/admin.html](dist/admin.html) | 관리자 화면 |
| [dist/admin-ui.js](dist/admin-ui.js) | 관리자 메뉴, 상품 관리, 주문·배송 처리 |
| [기획 자료 v2.1](outputs/planning-v2.1/README.md) | IA 구조도, 기능명세서, 개발 전달 자료 안내 |
| [견적산정용 개발 전달서 v2.3](outputs/planning-v2.3/03_견적산정용_개발전달서.md) | 최신 로컬 견적 산정 범위 정리 |

화면 경로는 저장소의 현재 시연 코드를 기준으로 정리했습니다. 배포된 버전에 따라 화면 내용이 다를 수 있습니다.

## 개발정책 점검 (2026-10-07)

10월 1일 확정 정책을 우선하며, 상품 목록 24개·주문 조회 10건은 기존 표시 개수 정책을 구현에 반영했습니다. 관리자 목록은 20건입니다. 정책 패널의 중복 정의를 제거하고 모든 화면 영역의 최종 요구사항을 한 곳에서 관리합니다.

정책별 점검 결과와 시연/운영 연동 범위는 [점검 기록](outputs/policy-audit-2026-10-07.json)을 참고하세요. 과거 전달 문서와 보관된 압축파일까지 2026-10-07 정책으로 갱신했습니다. 문서별 기존 견적 금액·공수·단가는 유지했습니다. 최신 전달 묶음은 [정책 정리 전달자료](outputs/말마프렌즈_전달자료_정책정리_2026-10-07.zip)에서 확인할 수 있습니다.
