"""Revise the v2 handoff to the user's latest admin-menu instructions."""
from pathlib import Path
import re
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
source=(HERE/'build_planning_v2.py').read_text()
source=source.replace("'planning-v2'", "'planning-v2.1'")
source=source.replace('v2.0','v2.1').replace('_v2.docx','_v2.1.docx')
source=source.replace('자료 v2','자료 v2.1').replace('기획자료_v2','기획자료_v2.1')

def replace(old,new):
    global source
    if old not in source:raise ValueError('Missing original passage: '+old[:80])
    source=source.replace(old,new)

replace('기존 관리자 → 굿즈 판매 현황 → 주문 목록 / 일괄 배송 처리. 주문 상세는 목록의 팝업이다. 기존 관리자 → 온라인 스토어 운영 → 상품 목록 → 상품 등록·수정 / 스토어 설정 팝업으로 구성한다.',
        '관리자 안의 메뉴 그룹을 예약관리시스템과 커머스관리시스템으로 나눈다. 예약관리시스템 아래에는 예약·티켓, 프로그램·회차, 운영일 관리, 매출·정산, 계정·권한을 배치한다. 커머스관리시스템 아래에는 굿즈 판매 현황과 온라인 스토어 운영을 배치한다. 굿즈 판매 현황은 주문 목록과 일괄 배송 처리 탭으로, 온라인 스토어 운영은 상품 목록과 상품 등록·수정 및 스토어 설정 팝업으로 구성한다.')
replace('기존 운영 관리자가 주 1회 출고 업무를 수행하는 온라인 스토어다.',
        '운영 관리자가 관리자 내 커머스관리시스템에서 주 1회 출고 업무를 수행하는 온라인 스토어다.')
replace('기존 예약 운영 시스템에서 상품·재고·주문·출고를 관리하는 구조로 재정리한다.',
        '기존 관리자 안의 커머스관리시스템에서 상품·재고·주문·출고를 관리하는 구조로 재정리한다. 예약관리시스템과 커머스관리시스템은 메뉴 그룹 이름이며 별도 인증 서버나 별도 관리자 구축을 의미하지 않는다.')
replace('기존 관리자 → 굿즈 판매 현황', '관리자 → 커머스관리시스템 → 굿즈 판매 현황') if '기존 관리자 → 굿즈 판매 현황' in source else None
replace('기존 관리자 → 온라인 스토어 운영', '관리자 → 커머스관리시스템 → 온라인 스토어 운영') if '기존 관리자 → 온라인 스토어 운영' in source else None
replace('기존 관리자에 추가할 메뉴와 탭 및 팝업','커머스관리시스템의 페이지와 탭 및 팝업')
replace('기존 관리자 내 메뉴 확장','관리자 내 커머스관리시스템 메뉴 확장') if '기존 관리자 내 메뉴 확장' in source else None
replace('현재 사용자 페이지는 해시 경로이며 관리자는 URL 변경 없이 탭과 팝업을 전환한다.',
        '현재 사용자 페이지는 해시 경로이며 관리자는 URL 변경 없이 탭과 팝업을 전환한다. 사이드바에는 예약관리시스템·커머스관리시스템 그룹이 반영되었다. 예약 그룹의 메뉴는 기존 사이트 링크이고 커머스 그룹은 현재 페이지 안에서 전환된다. 실제 인증·세션 통합 완료를 의미하지 않는다. 상단 브랜드명 예약 운영 시스템과 breadcrumb 통합 예약은 현재 코드에 남아 있어 공통 관리자 명칭으로 맞추는 개선 제안이다.')
replace('A01 검색 → A02 주문 확인 → C03 출고 대상 내려받기 → 실제 포장·택배 접수 → A03 택배사·송장 입력 → 발송 완료. CSV 다운로드만으로 발송 상태가 변경되지 않는다.',
        '커머스관리시스템 → 굿즈 판매 현황 → 주문 목록에서 주문을 확인한다. 필요하면 목록을 내려받아 포장에 참고한다. 실제 택배 접수 후 일괄 배송 처리 탭에서 공통 택배사를 선택하고 주문별 송장번호를 직접 입력한 뒤 선택 주문을 발송 완료 처리한다. 목록 내려받기는 조회 자료이며 발송 처리의 필수 단계가 아니다. 송장 엑셀 업로드·송장 양식 다운로드는 최신 사용자 지시에 따라 제외한다.')
replace('행별 택배사 또는 기본 택배사를 지정한다. 송장 입력의 공백·하이픈을 제거한다. 선택 건수와 오류 행을 보여주며 미선택 실행은 비활성화한다.',
        '상단에서 공통 택배사를 한 번 선택하고 주문별 송장번호만 직접 입력하는 흐름을 기본으로 한다. 다른 택배사 주문만 개별 변경할 수 있게 하는 제안이다. 현재 코드는 기본 택배사와 행별 선택창을 모두 제공하므로 이 단순화는 추가 반영 대상이다. 송장 공백·하이픈을 제거하고 선택 건수와 오류 행을 표시한다. 미선택 실행은 비활성화한다.')
replace('출고 대기 주문만 표시한다. 기본 택배사와 행별 택배사·송장 입력, 선택 기능이 있다.',
        '출고 대기 주문만 표시하고 기본 택배사·행별 택배사·송장 입력을 제공한다. 최신 지시로 송장 엑셀 등록과 양식 다운로드는 제거되었다. 목록 내려받기 CSV는 유지되어 있다.')
replace('조회 권한 관리자가 굿즈 판매 현황 메뉴에서 조건을 입력하고 검색한다.',
        '조회 권한 관리자가 커머스관리시스템의 굿즈 판매 현황 메뉴에서 조건을 입력하고 검색한다.') if '조회 권한 관리자가 굿즈 판매 현황 메뉴에서 조건을 입력하고 검색한다.' in source else None
replace('상품 조회 권한 관리자가 온라인 스토어 운영을 연다.',
        '상품 조회 권한 관리자가 커머스관리시스템의 온라인 스토어 운영을 연다.')
replace('현재 검색 조건 전체 결과를 내려받는다.',
        '현재 검색 조건 전체 결과를 내려받는다. 목록 CSV 내려받기는 유지하고 송장 엑셀 등록·업로드 및 송장 양식 내려받기는 제공하지 않는다.')
replace('CSV 또는 XLSX와 컬럼은 D05에서 확정한다.',
        '현재 방식인 CSV 유지를 기본 제안으로 하고 XLSX 확대는 새로 요청하지 않는 한 제외한다. 최종 컬럼은 D05에서 확정한다.')
replace('CSV/XLSX와 상품별 행 형식 합의','CSV 유지 및 최종 컬럼 합의 송장 업로드 제외')
replace('시연 CSV 견적 엑셀','목록 CSV 유지 송장 엑셀 업로드 제외')
replace('택배사별 형식 및 합포장 여부 확인','공통 택배사와 예외변경 UI 및 형식 합포장 확인')
replace('부분취소 자동반품 택배 API 자동알림 비회원 해외배송 분할배송 후기 문의 찜',
        '부분취소 자동반품 택배 API 자동알림 비회원 해외배송 분할배송 후기 문의 찜 송장엑셀업로드')
replace("('오류 표시','입력 및 상품 행 옆 오류 메시지 포커스 이동 재시도','현재 alert 또는 하단 메시지 중심'),",
        "('오류 표시','입력 및 상품 행 옆 오류 메시지 포커스 이동 재시도 표 아래 완료 문구 없음','표 아래 상태 문구 제거 반영 오류 위치 보완'),")
replace("('조회 상태','빈 결과 권한 없음 통신 실패 로딩을 구분','일부 빈 상태만 제공'),",
        "('표 정렬','표 제목 내용 버튼을 열 가운데 정렬하고 드롭다운 화살표를 오른쪽 세로 중앙에 배치','최신 사용자 지시 반영'),\n    ('조회 상태','빈 결과 권한 없음 통신 실패 로딩을 구분 성공은 변경된 상태로 확인','일부 빈 상태만 제공'),")
replace('빈 결과 권한 없음 통신 실패 로딩을 구분','빈 결과 권한 없음 통신 실패 로딩을 구분')

replace("('U 화면','사용자 페이지와 로그인 팝업 및 장바구니 패널'),('A 화면','커머스관리시스템의 페이지와 탭 및 팝업'),('C 공통 동작','확인창 내려받기 편집 도구처럼 독립 메뉴가 아닌 기능'),('X 외부 연동','기존 인증 PG 주소 검색 택배사 조회'),('F 기능','기능명세서의 F01부터 F26까지 연결'),('H 전달 정의','개발 전달서의 H01부터 H07까지 연결'),('D 결정 항목','운영 정책 또는 범위 확정이 필요한 사항'),('TC 검수','개발 전달서의 검수 시나리오')",
        "('화면 ID','SCR-U-001 사용자 화면 SCR-A-001 관리자 화면 형식'),('기능 ID','FN-001 기능명세와 화면 및 테스트 연결'),('테스트 ID','TC-001 개발 검수 상황과 기대 결과 연결'),('결정 항목 ID','DEC-001 미확정 운영 정책과 범위 결정 추적')")
replace("h(ia,'전체 메뉴 트리')",
        "h(ia,'식별 번호를 사용하는 이유')\np(ia,'화면·기능·테스트에 고유 ID를 붙여 서로 연결하는 방식은 요구사항 추적을 위한 실무 관행이다. SCR-U·SCR-A·FN·TC·DEC는 이번 프로젝트의 명명 규칙이며 모든 IT 회사가 공통으로 사용하는 표준 코드가 아니다. 외부 연동과 공통 동작은 별도 ID 대신 이름으로 표시하고 개발 전달서의 장 번호는 일반 목차로 관리한다. 기존 v2 번호의 의미는 유지하면서 표기만 바꿨다.')\nh(ia,'전체 메뉴 트리')")
replace('H01 서비스 소개와 개발자가 알아야 할 범위','1 서비스 소개와 개발자가 알아야 할 범위')
replace('H02 운영 정책과 권한','2 운영 정책과 권한')
replace('H03 주문 상태와 처리 보장','3 주문 상태와 처리 보장')
replace('H04 데이터 정의','4 데이터 정의')
replace('H05 외부 연동과 API 계약 제안','5 외부 연동과 API 계약 제안')
replace('H06 운영 정책과 개발 범위 결정 목록','6 운영 정책과 개발 범위 결정 목록')
replace('H07 검수 시나리오 사용자와 공통 처리','7 검수 시나리오 사용자와 공통 처리')
replace('H07 검수 시나리오 관리자와 복구','7 검수 시나리오 관리자와 복구')
replace('이 전달서 H02부터 H05는 여러 기능이 공유하는 정책·데이터·연동 기준이다. H06의 미결정 항목을 해소하고 H07의 검수 시나리오로 완료 여부를 판단한다.',
        '이 전달서 2장부터 5장은 여러 기능이 공유하는 정책·데이터·연동 기준이다. 6장의 미결정 항목을 해소하고 7장의 검수 시나리오로 완료 여부를 판단한다.')
replace('전체 결정 목록과 담당 역할은 개발 전달서 H06을 따른다.','전체 결정 목록과 담당 역할은 개발 전달서 6장을 따른다.')
replace('H03 처리 규칙','개발 전달서 3장 처리 규칙')

# Use longer, explicit IDs without letting them wrap into unreadable table cells.
source=source.replace('[1.2,4.4,2.3,5.2,4.2]','[2.6,3.7,2.1,4.8,4.1]')
source=source.replace('[1.3,2.0,4.1,9.9]','[1.8,3.1,3.8,8.6]')
source=source.replace('[1.0,4.0,8.5,3.8]','[1.8,3.6,8.1,3.8]')

# Rewrite the editable administrator diagram instead of preserving the confusing peer columns.
start=source.index('## 편집 가능한 관리자 IA')
end=source.index("''')",start)
source=source[:start]+'''## 편집 가능한 관리자 IA\n\n```mermaid\nflowchart TD\n  Root[관리자 공통 인증 및 권한] --> Res[예약관리시스템 기존]\n  Root --> Commerce[커머스관리시스템 추가]\n  Res --> R1[예약 및 티켓]\n  Res --> R2[프로그램 및 회차]\n  Res --> R3[운영일 관리]\n  Res --> R4[매출 및 정산]\n  Res --> R5[계정 및 권한]\n  Commerce --> Sales[굿즈 판매 현황]\n  Commerce --> Ops[온라인 스토어 운영]\n  Sales --> A01[A01 주문 목록]\n  Sales --> A03[A03 일괄 배송 처리]\n  A01 --> A02[A02 주문 상세 팝업]\n  A01 --> Download[목록 CSV 내려받기]\n  A03 --> Ship[공통 택배사와 송장 직접 입력 후 선택 발송]\n  A02 --> Cancel[허용 주문 PG 전체 취소]\n  Ops --> A04[A04 상품 목록]\n  A04 --> A05[A05 상품 등록 및 수정 팝업]\n  Ops --> A06[A06 스토어 설정 팝업]\n```\n'''+source[end:]

replace("h(handoff,'확인 범위의 한계')",
        "h(handoff,'최신 관리자 수정 지시 반영')\np(handoff,'스트로크 최소화 디자인 재구성 대화의 사용자 지시와 현재 admin.html을 확인했다. 예약관리시스템 아래에 예약·티켓, 프로그램·회차, 운영일 관리, 매출·정산, 계정·권한을 배치하고, 커머스관리시스템 아래에 굿즈 판매 현황과 온라인 스토어 운영을 배치한다. 표 가운데 정렬·드롭다운 화살표 위치·표 아래 완료 문구 제거를 반영 기준에 포함했다. 송장 엑셀 업로드와 양식 다운로드는 최종 지시로 제외하고 직접 입력 및 선택 주문 일괄 발송을 유지한다. 목록 CSV 내려받기는 현재 화면에 남아 있어 별도로 유지한다. 상단 공통 택배사 중심의 단순화는 다른 대화의 제안으로, 현재 행별 선택창과 구분해 추가 반영 대상으로 표시했다.')\nh(handoff,'확인 범위의 한계')")

# Exact token substitution leaves browser routes and filenames untouched.
mapping={**{f'U{i:02}':f'SCR-U-{i:03}' for i in range(1,9)},
         **{f'A{i:02}':f'SCR-A-{i:03}' for i in range(1,7)},
         **{f'F{i:02}':f'FN-{i:03}' for i in range(1,27)},
         **{f'TC{i:02}':f'TC-{i:03}' for i in range(1,34)},
         **{f'D{i:02}':f'DEC-{i:03}' for i in range(1,16)},
         'C02':'전체 취소 확인','C03':'목록 내려받기','C04':'상세 편집 도구',
         'X01':'기존 회원 인증','X02':'PG 결제','X03':'주소 검색','X04':'택배사 조회','X05':'파일 스토리지'}
for old,new in mapping.items():source=re.sub(r'(?<![A-Za-z0-9])'+old+r'(?![A-Za-z0-9])',new,source)
source=source.replace('기존 인증: 기존 회원 인증','기존 회원 인증:')
source=source.replace('U01~U08','SCR-U-001~SCR-U-008')
source=source.replace('H01~H07','1~7장')
source=source.replace('26개 기능','26개 기능')
source=source.replace('F01~F26','FN-001~FN-026').replace('D01~D15','DEC-001~DEC-015').replace('TC01~TC33','TC-001~TC-033')
source=source.replace('공통 택배사와 송장 직접 입력 후 선택 발송','공통 택배사와 송장 직접 입력 후 선택 발송')

source=source.replace('기존 파일은 덮어쓰지 않고 v2로 생성했다.','기존 파일은 덮어쓰지 않고 v2.1로 생성했다.')
source=source.replace('기존 회원 인증 기존 회원 인증:', '기존 회원 인증:').replace('PG 결제 PG:', 'PG 결제:').replace('주소 검색 우편번호:', '주소 검색:').replace('택배사 조회 택배사:', '택배사 조회:').replace('파일 스토리지 스토리지:', '파일 스토리지:')
source=source.replace('주소 검색[주소 검색 주소 검색 또는 직접 입력]', 'Address[주소 검색 또는 직접 입력]').replace('--> 주소 검색', '--> Address').replace('주소 검색 -->', 'Address -->')
source=source.replace('PG 결제[PG 결제 PG 카드 결제]', 'Payment[PG 카드 결제]').replace('--> PG 결제', '--> Payment').replace('PG 결제 -->', 'Payment -->')
source=source.replace('전체 취소 확인[전체 취소 확인 허용 주문 전체 취소]', 'CancelAll[허용 주문 전체 취소]').replace('--> 전체 취소 확인', '--> CancelAll')
source=source.replace('택배사 조회[택배사 조회 외부 택배사 조회]', 'Tracking[외부 택배사 조회]').replace('--> 택배사 조회', '--> Tracking')

# Inject a true hierarchy only for the administrator diagram.
original="    width, height = 1800, 1130"
source=source.replace(original,"    if filename=='02_관리자_IA.png':\n        return build_admin_diagram(ROOT/filename)\n"+original,1)

def build_admin_diagram(path):
    im=Image.new('RGB',(1800,1130),'white'); d=ImageDraw.Draw(im)
    f=lambda n:ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc',n)
    def txt(x,y,s,n=26,color='#111111'):d.text((x,y),s,font=f(n),fill=color)
    def box(x,y,w,h,title,sub='',dark=False):
        d.rounded_rectangle((x,y,x+w,y+h),radius=10,fill='#173c55' if dark else '#f2f5f7',outline='#d9dfe4',width=2)
        txt(x+20,y+16,title,29,'white' if dark else '#111111')
        if sub:txt(x+20,y+58,sub,23,'#e1e8ed' if dark else '#475467')
    txt(55,35,'말마프렌즈 관리자 메뉴 구조',46)
    box(55,125,1690,90,'관리자','기존 계정 및 인증 재사용 전제  ·  하나의 관리자 안에 업무별 메뉴 그룹 구성',True)
    d.line((900,215,900,245,340,245,340,275),fill='#9aaabd',width=3)
    d.line((900,245,1250,245,1250,275),fill='#9aaabd',width=3)
    box(55,275,570,76,'예약관리시스템  기존 메뉴',dark=True)
    box(690,275,1055,76,'커머스관리시스템  추가 메뉴',dark=True)
    for i,name in enumerate(['예약 · 티켓','프로그램 · 회차','운영일 관리','매출 · 정산','계정 · 권한']):
        y=390+i*118
        d.line((78,351,78,y+40,105,y+40),fill='#b7c3cc',width=3)
        box(105,y,520,88,name)
    d.line((1220,351,1220,373,940,373,940,395),fill='#b7c3cc',width=3)
    d.line((1220,373,1500,373,1500,395),fill='#b7c3cc',width=3)
    box(690,395,510,75,'굿즈 판매 현황',dark=True)
    box(1235,395,510,75,'온라인 스토어 운영',dark=True)
    groups=[(690,[('SCR-A-001 주문 목록','검색 · 상태 · 금액'),('SCR-A-002 주문 상세','배송지 · 결제 · 전체 취소'),('SCR-A-003 일괄 배송 처리','송장 직접 입력 · 선택 주문 발송'),('목록 CSV 내려받기','송장 엑셀 업로드와 별개')]),
            (1235,[('SCR-A-004 상품 목록','상품 검색 · 판매 상태'),('SCR-A-005 상품 등록 및 수정','이미지 · 가격 · 재고 · 상세 소개'),('SCR-A-006 스토어 설정','배송비 · 취소 시간 · 배송 안내'),('상세 콘텐츠 편집 도구','상품 수정 안의 공통 동작')])]
    for x,items in groups:
        for i,(name,sub) in enumerate(items):
            y=508+i*124
            d.line((x+16,470,x+16,y+40,x+35,y+40),fill='#b7c3cc',width=3)
            box(x+35,y,475,100,name,sub)
    txt(55,1050,'인증과 권한은 공통 기반입니다. 시스템이라는 메뉴 이름이 별도 관리자 구축을 뜻하지 않습니다.',24,'#475467')
    im.save(path);return path

namespace={'__file__':str(HERE/'build_planning_v2.py'),'build_admin_diagram':build_admin_diagram}
exec(compile(source,str(__file__),'exec'),namespace)
readme=namespace['ROOT']/'README.md'
text=readme.read_text().replace('build_planning_v2.py','build_planning_v2_1.py')
text+='\n## v2.1 수정 사항\n\n관리자 → 예약관리시스템 / 커머스관리시스템 계층으로 수정했습니다. 송장 엑셀 업로드·양식 다운로드는 제외하고 직접 입력과 선택 주문 일괄 발송을 유지합니다. 목록 CSV 내려받기는 남아 있습니다. 화면 ID·기능 ID·테스트 ID·결정 항목 ID는 프로젝트 명명 규칙이며 업계 공통 표준 코드가 아닙니다.\n'
readme.write_text(text)
