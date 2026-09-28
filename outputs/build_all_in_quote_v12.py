from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
R=Path(__file__).resolve().parent
REF=R/'말마프렌즈_온라인스토어_추가개발_견적서_v11.docx'
with ZipFile(REF) as z:parts={n:z.read(n) for n in z.namelist()}
N={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};W='{'+N['w']+'}'
x=E.fromstring(parts['word/document.xml']);body=x.find('w:body',N);ps=body.findall('w:p',N);tabs=body.findall('w:tbl',N)
def setp(p,s):
 prop=p.find('w:pPr',N);runs=p.findall('w:r',N);rp=deepcopy(runs[0].find('w:rPr',N)) if runs and runs[0].find('w:rPr',N) is not None else None
 for e in list(p):
  if e is not prop:p.remove(e)
 r=E.SubElement(p,W+'r')
 if rp is not None:r.append(rp)
 for i,t in enumerate(s.split('\n')):
  if i:E.SubElement(r,W+'br')
  e=E.SubElement(r,W+'t');e.text=t

def t(n,rows):
 tab=tabs[n];orig=tab.findall('w:tr',N)
 for r in orig:tab.remove(r)
 for i,row in enumerate(rows):
  r=deepcopy(orig[0] if i==0 else orig[-1] if i==len(rows)-1 else orig[min(i,len(orig)-2)])
  cells=r.findall('w:tc',N);assert len(cells)==len(row)
  for c,s in zip(cells,row):
   p=c.findall('w:p',N)
   for e in p[1:]:c.remove(e)
   setp(p[0],s)
  tab.append(r)
def replace(prefix,s):
 m=[p for p in ps if ''.join(p.xpath('.//w:t/text()',namespaces=N)).startswith(prefix)];assert len(m)==1,prefix;setp(m[0],s)
replace('기존 관리자·로그인·PG 재사용 기준','전체 기능 포함 · 기존 모듈 재사용 및 회사 단가 적용')
replace('※ PD는','※ PD는 1인이 1일 투입되는 공수입니다. 상세 편집 도구와 스토어 설정을 포함한 전체 49 PD 기준이며 기존 관리자·마사회 로그인·예약 PG 재사용을 전제로 합니다. 전체 기능을 포함한 일괄 계약 조정액을 적용하여 VAT 포함 9,500,000원으로 제안합니다.')
replace('범위 기준','범위 기준  기획 문서의 상품·주문·재고·출고 기능과 상세 편집 도구·스토어 설정을 모두 포함합니다.')
replace('8. 기존 인프라 운영 및 선택 견적','8. 기존 인프라 운영 및 계약 금액')
replace('8.4 선택 기능 추가 견적','8.4 전체 기능 포함 및 금액 조정')
replace('※ 선택 기능은','※ 상품 상세 편집 도구와 스토어 설정은 모두 기본 기능입니다. 편집 도구는 서식·링크·이미지·영상 삽입과 미리보기, 설정은 배송비·취소시간·배송 안내 수정 및 새 주문부터 적용하는 기능을 포함합니다.')
replace('※ 선택 금액은','※ 추가 기능 개발비를 별도 청구하지 않습니다. 기존 시스템 재사용과 전체 작업 일괄 수행을 조건으로 산정액에서 계약 조정액을 차감했습니다. 외부 라이선스와 인프라 실비는 별도 협의합니다.')
replace('※ 기본 개발비는','※ 개발비는 전체 기능을 포함한 최초 1회 비용입니다. 기존 인프라 운영 계약은 유지하고 추가 자원 증가분만 별도 협의합니다.')
replace('※ 기존 견적 v10 대비','※ 최종 공급가액 8,636,364원과 부가세 863,636원을 합하여 총 9,500,000원입니다. 부가세는 원 단위로 반올림했습니다. 회사 단가는 유지하고 총액 조정으로 금액을 맞췄습니다.')
replace('※ 상세 콘텐츠의 영상','※ 상세 편집 도구는 이미지 업로드와 외부 영상 링크 삽입을 기준으로 합니다. 대용량 영상 직접 업로드·저장 기능과 추가 저장 실비는 별도 협의합니다.')
t(1,[['전체 개발비 (VAT 포함)','금 구백오십만원정  (₩ 9,500,000)'],['인프라 운영비','기존 운영 계약 적용 · 추가 실비 별도'],['포함 기능','상품·주문·재고·출고 + 상세 편집 도구·스토어 설정']])
priced=[('기획·화면 정리·통합 QA 및 인수',10,160000),('사용자 스토어·상품 주문 재고 처리',19,220000),('관리자·출고·상세 편집·스토어 설정',16,220000),('기존 로그인·PG 연결 및 저장·배포',4,220000)]
assert sum(q*u for _,q,u in priced)==10180000
rows=[['구분','수량','일 단가(원)','금액(원)']]+[[n,str(q)+' PD',f'{u:,}',f'{q*u:,}'] for n,q,u in priced]+[['전체 기능 산정액 (VAT 별도)','','','10,180,000'],['일괄 계약 금액 조정','','','-1,543,636'],['공급가액 (VAT 별도)','','','8,636,364'],['부가가치세 (10%)','','','863,636'],['합계 금액 (VAT 포함)','','','9,500,000']]
t(2,rows)
# Include both functions in the existing scope record, without expanding the source page system.
row=tabs[4].findall('w:tr',N)[7];cell=row.findall('w:tc',N)[1];setp(cell.find('w:p',N),'상품·이미지·가격·재고·판매·노출 순서, 서식·링크·이미지·영상 상세 편집과 미리보기, 배송비·취소시간·배송 안내 설정')
t(6,[['구분','공수','1~2주','3~4주','5~6주','7~8주','주요 작업'],['기획·QA','10 PD','●','●','●','●','정책·범위·화면 확정, 통합 검수'],['개발·연동·배포','39 PD','●','●','●','●','스토어·관리자·상세 편집·설정, 기존 모듈 연결 및 배포'],['최종 검수·인수','포함','','','','●','핵심 기능 검수 및 합의 수정·자료 인계']])
r=tabs[7].findall('w:tr',N)[-1];c=r.findall('w:tc',N);setp(c[0].find('w:p',N),'포함 기능·변경 범위');setp(c[1].find('w:p',N),'상세 편집 도구와 스토어 설정은 기본 포함. 신규 이력 조회 화면·장바구니 기기 공유·자료 이관은 별도 협의')
t(11,[['구분','적용 내용','금액 (VAT 별도)'],['전체 기능 산정액','회사 단가 × 총 49 PD','10,180,000원'],['일괄 계약 조정','기존 시스템 재사용·일괄 수행','-1,543,636원'],['최종 공급가액','전체 기능 포함','8,636,364원']])
t(12,[['구분','성격','공급가액(원)','부가세(원)','합계(원)'],['전체 기능 개발비','일회성','8,636,364','863,636','9,500,000'],['추가 인프라·운영','반복/실비','별도 협의','별도 협의','별도 협의']])
parts['word/document.xml']=E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
OUT=R/'말마프렌즈_온라인스토어_추가개발_견적서_v12.docx'
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
 for n,data in parts.items():z.writestr(n,data)
# All unchanged package parts remain byte identical.
with ZipFile(REF) as z:assert all(z.read(n)==data for n,data in parts.items() if n!='word/document.xml')
print(OUT)
