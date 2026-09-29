from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
R=Path(__file__).resolve().parent
exec((R/'build_quote_v14.py').read_text().split("replace('전체 기능 포함")[0].replace("추가개발_견적서_v13.docx","추가개발_견적서_v17.docx"))
def replace(prefix,s):
 m=[p for p in ps if ''.join(p.xpath('.//w:t/text()',namespaces=N)).startswith(prefix)]
 if len(m)==1:setp(m[0],s);return
 if any(''.join(p.xpath('.//w:t/text()',namespaces=N))==s for p in ps):return
 raise AssertionError(prefix)
replace('주요 기능 및 수행 조건','인력별 견적 및 4주 수행 일정 · 개정 v17')
replace('※ PD는','※ PD는 1인이 1일 투입되는 예상 공수입니다. 기획·QA 13 PD, 개발자 2명 각 20 PD, 배포 지원 2 PD로 총 55 PD를 산정했습니다. 인력별 병행 투입을 기준으로 하며 실제 투입일수에 따른 추가 정산은 적용하지 않습니다.')
replace('※ 예상 수행기간','※ 수행기간은 20영업일(약 4주) 예정입니다. 개발자 2명 전담 투입, 기획·QA 및 배포 지원 병행을 전제로 합니다. 자료·접근 권한·연동 정보·주요 정책 확인 후 착수하며, 제공 지연 또는 범위 변경 시 일정은 상호 협의합니다. 실제 배정 인력과 착수·완료일은 계약 전 확정합니다.')
replace('※ 서버·네트워크 이용료','※ 서버·네트워크 이용료는 별도 청구하지 않습니다. 문자 발송료 및 PG 수수료는 개발비에 포함하지 않으며, 판매대금에서 공제 후 운영 정산합니다. PG사가 이미 차감한 수수료는 중복 공제하지 않습니다.')
for p in tabs[0].xpath('.//w:p',namespaces=N):
 s=''.join(p.xpath('.//w:t/text()',namespaces=N))
 if '8~10주' in s:setp(p,s.replace('8~10주','20영업일(약 4주)'))
priced=[('기획·QA 담당 1명',13,160000),('개발 담당 1 · 사용자·결제',20,220000),('개발 담당 2 · 관리자·문자·보안',20,220000),('배포 지원 담당 1명',2,220000)]
assert sum(q*u for _,q,u in priced)==11320000
t(2,[['담당 인력','투입 공수','일 단가(원)','금액(원)']]+[[n,f'{q} PD',f'{u:,}',f'{q*u:,}'] for n,q,u in priced]+[['공급가액 (VAT 별도)','','','11,320,000'],['부가가치세 (10%)','','','1,132,000'],['합계 금액 (VAT 포함)','','','12,452,000']])
t(6,[['담당 인력','공수','1주','2주','3주','4주','주요 작업'],['기획·QA 담당','13 PD','●','●','●','●','정책·화면 확정, 단계별 점검·통합 검수'],['개발 담당 1','20 PD','●','●','●','●','사용자 스토어·주문·결제 연동·재고 처리·검수 보완'],['개발 담당 2','20 PD','●','●','●','●','관리자·출고·문자 알림·개인정보 보안·검수 보완'],['배포 지원 담당','2 PD','','','','●','운영 환경 배포·최종 적용 확인·산출물 인계']])
setp(tabs[4].findall('w:tr',N)[6].findall('w:tc',N)[1].find('w:p',N),'상품·가격·재고·이미지·판매·최근 등록·수정순 자동 정렬, 표준 서식·링크·이미지·영상 링크·미리보기')
# Keep functional scope intact while recording the agreed settlement method.
tr=tabs[9].findall('w:tr',N)[3]
setp(tr.findall('w:tc',N)[1].find('w:p',N),'문자 발송료·PG 수수료는 판매대금에서 공제 후 정산합니다. 적용 요율·대상 발송 건·실비 및 증빙 기준·정산 주기는 별도 운영·정산 약정에서 확정합니다. 유료 서비스/라이선스·신규 디자인 제작은 사전 합의합니다.')
parts['word/document.xml']=E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
OUT=R/'말마프렌즈_온라인스토어_추가개발_견적서_v17.docx'
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
 for n,data in parts.items():z.writestr(n,data)
with ZipFile(REF) as z:assert all(z.read(n)==data for n,data in parts.items() if n!='word/document.xml')
print(OUT)
