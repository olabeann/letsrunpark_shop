from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from copy import deepcopy
from hashlib import sha256
from lxml import etree as E
R=Path(__file__).resolve().parent
REF=Path('/Users/beomjimin/Documents/GitHub/letsrunpark-reser/outputs/렛츠런파크_통합예약결제시스템_견적서_v7.docx')
contract=Path('/private/tmp/malma-quote-work/artifact.md').read_text();assert sha256(REF.read_bytes()).hexdigest() in contract
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W='{'+NS['w']+'}'
with ZipFile(REF) as z:parts={n:z.read(n) for n in z.namelist()}
root=E.fromstring(parts['word/document.xml']);body=root.find('w:body',NS);ps=body.findall('w:p',NS);ts=body.findall('w:tbl',NS)
def setp(p,text):
 props=p.find('w:pPr',NS);runs=p.findall('w:r',NS);rp=deepcopy(runs[0].find('w:rPr',NS)) if runs and runs[0].find('w:rPr',NS) is not None else None
 for e in list(p):
  if e is not props:p.remove(e)
 r=E.SubElement(p,W+'r')
 if rp is not None:r.append(rp)
 for i,s in enumerate(text.split('\n')):
  if i:E.SubElement(r,W+'br')
  t=E.SubElement(r,W+'t');t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=s

def table(n,rows):
 t=ts[n];orig=t.findall('w:tr',NS)
 for r in orig:t.remove(r)
 for i,values in enumerate(rows):
  template=orig[0] if i==0 else (orig[-1] if i==len(rows)-1 else orig[min(i,len(orig)-2)])
  r=deepcopy(template);cells=r.findall('w:tc',NS);assert len(cells)==len(values),(n,i,len(cells),len(values))
  for c,s in zip(cells,values):
   paras=c.findall('w:p',NS)
   for p in paras[1:]:c.remove(p)
   setp(paras[0],s)
  t.append(r)
# Replace only supported paragraph slots, preserving source page breaks and spacing.
changes={1:'말마프렌즈 온라인 스토어 추가 개발',2:'기존 관리자·로그인·PG 재사용 기준 · 회사 단가 적용',4:'※ PD는 1인이 1일 투입되는 공수입니다. 총 41 PD이며 개발·연동 31 PD와 기획·QA 10 PD를 병행하여 약 6~8주를 예상합니다. 기존 관리자 화면 틀·마사회 카카오/네이버 로그인·예약 PG 승인 및 전체 취소 모듈을 그대로 활용하는 조건입니다. 신규 인증·PG 모듈 구축 공수는 제외하고 굿즈 연결·검증 작업을 포함합니다.',6:'범위 기준  IA 및 기능명세서 v2.1과 견적 산정용 개발 전달서 v2.3의 기본 범위를 적용합니다. 선택 기능은 제8.4항에서 별도 산정합니다.',9:'기본 견적은 주문당 정액 배송비, 단일 취소 기한, 발송 전 주문 전체 취소와 수동 출고를 기준으로 합니다. 배송비 금액·취소시간·출고 요일·수량 제한은 착수 전에 확정하며, 조건부 무료배송·지역별 배송비·복수 정책 등 범위 확대는 별도 협의합니다.',11:'첨부 견적서와 동일한 회사 인건비 단가를 적용합니다. 연간 실근무일은 250일로 가정하며, 기획·QA는 160,000원/PD, 개발·연동·배포는 220,000원/PD입니다.',12:'단가 유의사항  첨부 양식의 연간 기준 보수를 실근무일로 환산한 순수 인건비 원가를 적용했습니다. 4대보험·퇴직충당금 등 간접비와 일반관리비·이윤은 포함하지 않았으며 계약 조건에 따라 별도 협의할 수 있습니다.',14:'※ 6~8주는 연동 자료와 정책이 준비된 경우의 예정 기간입니다. 개발 공수와 달력상 수행기간은 구분합니다. 기존 모듈 수정, 자료 제공 지연, 보안 요건 추가 시 재산정하며 검수 후 오픈합니다.',17:'8. 기존 인프라 운영 및 선택 견적 (별도)',18:'기존 예약결제시스템의 서버와 운영 계약을 활용합니다. 서버 운영비를 중복 청구하지 않으며, 추가 자원이나 운영 지원이 필요한 경우 증가분만 별도 협의합니다.',19:'8.1 운영 구성 전제',20:'※ 실제 기존 서버 구성과 여유 용량은 착수 전 확인합니다. 신규 전용 서버·DB 구축은 기본 견적에 포함하지 않습니다.',21:'8.2 추가 운영비 산정 기준',22:'※ 본 견적은 개발비를 산정한 문서입니다. 클라우드 사용료·PG 수수료·추가 운영 지원 금액은 실제 기존 계약과 사용량 확인 후 확정하며, 미정 항목을 0원으로 보지 않습니다.',23:'※ 모니터링·백업·패치·장애 1차 확인은 기존 운영 계약의 범위를 확인합니다. 명세 외 기능 수정과 외부 원인 복구는 사전 협의 후 별도 산정합니다.',24:'※ 상세 콘텐츠의 영상 직접 업로드 및 저장 용량 확대는 선택 기능과 저장 비용에 영향을 주므로 허용 파일과 용량을 먼저 합의합니다.',26:'서비스 개시 후 요청은 확정 기능 명세와 기존 운영 계약을 기준으로 구분합니다.',27:'※ 무상 하자보수 기간과 응답 기준은 계약에서 확정합니다. 운영 지원과 신규 기능 개발은 하자보수와 구분합니다.',28:'8.4 선택 기능 추가 견적',29:'※ 선택 기능은 기본 개발비에 포함하지 않습니다. 기본 설명 입력은 포함하고 고급 편집과 정책 변경 화면만 추가 산정합니다.',30:'※ 선택 금액은 관련 화면·서버 처리·검증을 포함한 예상 추가 공수입니다. 라이선스와 추가 저장 비용은 별도입니다.',32:'※ 기본 개발비는 최초 1회 발생하며 기존 인프라 운영비는 별도 계약을 따릅니다. 선택 기능 채택 시 해당 금액만 합산합니다.',33:'※ 기존 견적 v10 대비 개발 공수를 37 PD에서 31 PD로 조정하여 공급가액 1,320,000원을 감액했습니다. 사용자·주문·재고 19 PD, 관리자 8 PD, 기존 모듈 연결·저장·배포 4 PD이며 범위와 재사용 조건 확인 후 확정합니다.'}
# Inspect body paragraph indexes directly rather than relying on visible nonempty list indexes.
nonempty=[p for p in ps if ''.join(p.itertext()).strip()]
for i,p in enumerate(nonempty):
 text=''.join(p.itertext())
# Use source text semantic anchors to avoid blank paragraph index drift.
replacements=[
('승마체험·투어 프로그램 통합 예약·결제 시스템',changes[1]),('기능 범위 및 수행 조건 포함 · 개정 v7',changes[2]),
('※ PD(Person-Day)',changes[4]),('범위 기준',changes[6]),('본 견적의 포함 범위는',changes[9]),
('연간 실근무일은',changes[11]),('단가 유의사항',changes[12]),('※ 20영업일은',changes[14]),
('8. 서버 인프라 운영 견적',changes[17]),('본 항목은 제1항',changes[18]),('8.1 서버 구성',changes[19]),('※ 통합 서비스 내',changes[20]),
('8.2 월 운영비',changes[21]),('※ 서버 운영 관리비는',changes[22]),('※ 장애 발생 시',changes[23]),('※ VAT 별도입니다.',changes[24]),
('서비스 개시 후 발생하는',changes[26]),('※ 별도의 월 정액',changes[27]),('8.4 납부 방식',changes[28]),('※ 연 일괄 납부 시',changes[29]),('※ 회계연도 독립',changes[30]),
('※ 시스템 구축비는',changes[32]),('※ 상기 인프라 운영비에는',changes[33])]
for prefix,text in replacements:
 matches=[p for p in ps if ''.join(p.xpath('.//w:t/text()',namespaces=NS)).startswith(prefix)];assert len(matches)==1,prefix;setp(matches[0],text)
table(0,[['수신','렛츠런파크 담당부서 귀중','견적일','2026. 09. 18.'],['공급자','주식회사 위이','견적 유효기간','별도 협의'],['사업자번호','236-81-02950','수행기간','착수일로부터 6~8주(예정)']])
table(1,[['기본 개발비 (VAT 포함)','금 구백이십육만이천원정  (₩ 9,262,000)'],['인프라 운영비','기존 운영 계약 적용 · 추가 실비 별도'],['선택 기능 포함 시 (VAT 포함)','₩ 11,198,000   (제8.4항 선택 2개 포함)']])
priced=[('기획·화면 정리 및 범위 확정',5,160000),('사용자 스토어·상품 주문 재고 처리',19,220000),('기존 관리자 확장·수동 출고·상품 운영',8,220000),('기존 로그인·PG 호출 연결 및 파일 저장·배포',4,220000),('통합 QA·검수 및 인수 자료',5,160000)]
assert sum(q*u for _,q,u in priced)==8420000
rows=[['구분','수량','일 단가(원)','금액(원)']]+[[n,f'{q} PD',f'{u:,}',f'{q*u:,}'] for n,q,u in priced]+[['공급가액 (VAT 별도)','','','8,420,000'],['부가가치세 (10%)','','','842,000'],['합계 금액 (VAT 포함)','','','9,262,000']]
table(2,rows)
table(3,[['구분','포함 범위'],['대상 서비스','기존 회원 대상 말마프렌즈 굿즈 판매 · 옵션 없는 단일 상품 기준'],['시스템 구성','사용자 스토어 신규 개발 및 기존 관리자 커머스 메뉴 확장 1식'],['기존 사이트 연동','기존 LetsrunPlay 스토어 진입 연결 및 제공 디자인 적용'],['사용자 기능','상품 목록·상세, 복수 장바구니, 배송지·결제, 본인 주문 조회·전체 취소'],['운영자 기능','주문 검색·상세·CSV, 송장 직접 입력·일괄 발송, 상품·재고·판매·순서 관리']])
table(4,[['기능 영역','포함 범위'],['상품 탐색·구매','목록·상세·판매 상태·수량 선택·바로 구매·복수 상품 장바구니'],['회원·주문서','마사회 카카오·네이버 로그인 세션 활용, 주문자·수령인·주소·배송 요청, 주소 검색·필수 안내 동의'],['카드 결제·취소','예약 PG 승인·결과 확인·전액 취소 모듈 활용, 굿즈 주문 연결과 허용 기한·발송 전 검사'],['주문·배송 조회','본인 주문 목록·상세, 주문 당시 금액 보존, 수동 송장 표시·외부 조회'],['관리자 주문 운영','기간·상태·키워드 검색, 구매자·수령인·금액·배송지, 관리자 전체 취소'],['관리자 수동 출고','목록 CSV, 대기 주문 선택, 택배사·송장 입력·검증, 일괄 발송 완료'],['상품 운영','상품·대표 이미지·가격·재고·기본 설명, 판매·품절·미노출, 최근 등록·수정순 자동 정렬'],['데이터·권한·기록','굿즈 데이터 분리, 서버 권한, 재고 차감·복원, 중복·동시 처리, 작업 기록'],['관리자 화면 수정','예약/커머스 그룹 구분, 표 가운데 정렬, 화살표 위치, 하단 완료 문구 제거'],['QA·배포','모바일 사용자·데스크톱 관리자 검증, 핵심 통합 테스트·기존 환경 배포']])
table(5,[['직무 구분','연간 기준 보수','실근무일','적용 일 단가'],['기획·디자인·QA','40,000,000원','250일','160,000원/일'],['개발·연동·배포','55,000,000원','250일','220,000원/일']])
# Basis/source citation in existing paragraph slot, keeping reference typography.
p=next(p for p in ps if ''.join(p.xpath('.//w:t/text()',namespaces=NS)).startswith('단가 유의사항'))
setp(p,changes[12])
table(6,[['구분','공수','1~2주','3~4주','5~6주','7~8주','주요 작업'],['기획·QA','10 PD','●','●','●','●','정책·범위·화면 확정, 단계 점검·통합 검수'],['개발·연동·배포','31 PD','●','●','●','●','굿즈 도메인·화면·관리자, 로그인·PG 연동 및 배포'],['최종 검수·인수','포함','','','','●','핵심 기능 검수, 합의 수정·자료 인계']])
table(7,[['구분','조건 및 책임 범위'],['범위·정책 확정','기획 문서의 기본 범위 11개 항목 적용. 정액 배송비·취소 기한·출고 정책은 착수 전 확정'],['회원·PG·서버','기존 관리자와 동일한 개발 환경, 마사회 카카오·네이버 로그인 세션 및 예약 PG 승인·전체 취소 모듈 직접 활용 전제. 굿즈 연결·검증 포함'],['고객사 제공','상품명·가격·재고·이미지·설명·안내·디자인 원본, 기존 시스템 접근·API·PG 테스트 정보 제공'],['대상·일정 전제','기존 모듈 소스·호출 권한·연동 정보 제공 전제. 재사용이 불가능하거나 기존 인증·PG 수정이 필요하면 사전 협의 후 공수 재산정'],['제외·별도 항목','혼합 결제·옵션·할인·부분취소·분할배송·택배 API·자동알림·비회원·송장 엑셀 업로드 제외'],['검수·인수','확정 기능 명세 기준 통합 검수 및 인수. 하자보수 기간·지급 조건은 별도 계약에서 합의'],['선택·변경 범위','상세 편집 도구와 스토어 설정은 제8.4항 별도. 신규 이력 화면·장바구니 기기 공유·자료 이관은 협의']])
table(8,[['구분','내용'],['클라우드','기존 예약결제시스템의 운영 환경 활용'],['애플리케이션 서버','기존 웹·WAS 활용 및 굿즈 서비스 배포'],['데이터베이스','기존 DB 내 굿즈 상품·주문·재고·배송 데이터 분리'],['스토리지','대표 이미지 저장과 접근 설정 포함. 용량 증가 사용료 별도'],['네트워크','기존 도메인·HTTPS 및 운영 경로 활용 전제'],['보안','회원·관리자 권한 검사 포함. 기관 별도 보안 요건 대응은 협의']])
table(9,[['구분','산정 내역','추가 월 금액'],['서버·DB','기존 운영 계약 범위 활용','기존 계약 적용'],['이미지 저장','대표 이미지 사용량 증가분','사용량 확인 후'],['네트워크','기존 한도 초과 시 증가분','실비 협의'],['백업·보안','기존 운영 계약 범위 확인','기존 계약 적용'],['클라우드 실비','자원 추가가 필요할 때 증가분','별도 협의'],['운영 지원','기존 계약 외 지원 범위','별도 협의'],['합계','중복 운영비 제외 추가분만 산정','현재 미정']])
table(10,[['구분','내용'],['무상 처리','확정 기능 명세와 다르게 동작하는 결함. 기간과 범위는 계약 합의'],['유상 처리','신규 기능·화면·정책 변경, 계약 외 운영 지원·자료 이관'],['유상 기준','개발 작업 제안 단가 220,000원/PD VAT 별도. 요청별 견적 후 착수'],['요청 방식','이메일 또는 합의 채널 접수. 우선순위·공수·완료일 사전 합의'],['고객사 직접 관리','상품·재고·판매 상태·출고 등 제공된 관리자 기능 내 직접 운영']])
table(11,[['구분','공급가액 (VAT 별도)','VAT 포함'],['상세 편집 도구','1,100,000원 · 5 PD','1,210,000원'],['스토어 설정','660,000원 · 3 PD','726,000원'],['선택 기능 합계','1,760,000원 · 8 PD','1,936,000원']])
table(12,[['구분','성격','공급가액(원)','부가세(원)','합계(원)'],['기본 개발비','일회성','8,420,000','842,000','9,262,000'],['선택 기능 2개','선택','1,760,000','176,000','1,936,000'],['선택 포함 개발비','일회성','10,180,000','1,018,000','11,198,000'],['추가 인프라·운영','반복/실비','별도 협의','별도 협의','별도 협의']])
table(13,[['구분','조건 및 책임 범위'],['트래픽·용량','기존 서버·DB·저장 용량을 초과하여 자원 확대가 필요하면 사전 협의 후 증가분 산정'],['하자보수 구분','명세대로 동작하지 않는 결함과 신규 기능·정책 변경을 구분. 기간·범위는 계약 확정'],['귀책 구분','기존 운영 계약의 장애 대응 범위 확인. 외부 요인 대응·명세 외 복구는 사전 견적'],['별도 비용','PG·카드 수수료, 외부 서비스 라이선스·저장 실비, 신규 이미지·디자인 제작, 대규모 이관 제외'],['보안 요건','기관 별도 보안 심사·인증·접근 환경 변경 요구는 기본 견적 외 추가 협의'],['계약 조건','지급 방식·견적 유효기간·운영 계약·산출물 인계·하자보수는 합의 후 확정. 첨부 양식의 과거 계약 조건은 자동 적용하지 않음']])
parts['word/document.xml']=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
for name,data in list(parts.items()):
 if name.startswith('word/header') and name.endswith('.xml'):
  x=E.fromstring(data)
  for t in x.findall('.//w:t',NS):
   if t.text:t.text=t.text.replace('통합 예약·결제 시스템 구축 견적서','말마프렌즈 스토어 추가 개발 견적서')
  parts[name]=E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
OUT=R/'말마프렌즈_온라인스토어_추가개발_견적서_v11.docx'
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
 for name,data in parts.items():z.writestr(name,data)
with ZipFile(REF) as z:
 changed=[n for n in z.namelist() if z.read(n)!=parts[n]]
assert all(n=='word/document.xml' or n.startswith('word/header') for n in changed),changed
assert sha256(REF.read_bytes()).hexdigest() in contract
print(OUT);print('Changed parts',changed)
