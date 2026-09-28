from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
R=Path(__file__).resolve().parent
exec((R/'build_quote_v14.py').read_text().split("replace('전체 기능 포함")[0].replace("추가개발_견적서_v13.docx","추가개발_견적서_v14.docx"))
replace('회원정보 문자','주요 기능 및 수행 조건 · 개정 v16')
replace('※ PD는','※ PD는 1인이 1일 투입되는 예상 공수입니다. 회사 단가를 적용하며, 문자 알림·개인정보 보안·상세 편집·스토어 설정을 포함합니다. 실제 투입일수에 따른 추가 정산은 적용하지 않습니다.')
replace('범위 기준','범위 기준  제3항의 주요 기능을 포함합니다. 세부 정책과 화면은 해당 범위 내에서 협의하여 기능 명세로 확정합니다.')
replace('본 개발비는','정액 배송비, 발송 전 주문 전체 취소, 수동 출고를 기준으로 합니다. 포함 범위 내 보완은 개발비에 포함하며, 범위를 초과하는 추가·변경은 비용과 일정을 사전 서면 합의합니다.')
replace('첨부 견적서와','회사 인건비 단가를 적용합니다. 기획·QA는 160,000원/PD, 개발·연동·배포는 220,000원/PD입니다.')
replace('단가 유의사항','단가 유의사항  일반관리비·이윤·예비비는 별도로 가산하지 않았습니다.')
replace('6. 기능별','6. 수행 일정')
replace('※ 총 55','※ 예상 수행기간은 착수 후 8~10주이며, 기획·개발·QA를 일부 병행합니다. 자료·연동 정보 및 정책 확인 후 착수·완료일을 합의합니다.')
replace('※ 개발비는 아래','※ 서버·네트워크 이용료는 별도 청구하지 않습니다. 문자 발송료·PG 수수료는 개발비와 구분하며 기존 계약 적용 여부와 부담 주체를 계약 시 확정합니다.')
replace('※ 공급가액','※ 본 견적서는 개발 범위와 금액에 관한 계약 부속자료입니다. 지급 조건·검수 기간·하자보수 기간·산출물 권리 귀속은 계약 체결 전 확정합니다.')
replace('8.5 소요 비용 요약','8. 소요 비용 및 운영 조건')
replace('9. 운영 조건 및 별도 항목','9. 계약 및 별도 항목')
t(6,[['구분','공수','1~2주','3~5주','6~8주','검수','주요 작업'],['기획·문서·QA','13 PD','●','●','●','●','정책·화면 정리 및 기능·문자·보안 검수'],['개발·연동·배포','42 PD','●','●','●','●','사용자 18 PD, 관리자·연동·문자·보안·배포 24 PD'],['최종 검수·인수','포함','','','','●','확정 명세 검수·결함 보완·산출물 인계']])
t(7,[['구분','조건 및 책임 범위'],['범위·정책','제3항 기준으로 기능 명세를 확정합니다. 문자 문구·발송 시점·개인정보 보관 및 파기 정책은 착수 전 협의합니다.'],['기존 시스템','기존 관리자·회원·PG·서버 활용 전제입니다. 재사용 불가 항목은 계약 전 확인하고 범위·금액을 합의합니다.'],['고객사 제공','상품·디자인·정책, 기존 코드·접근 권한·연동 정보, 문자 계정·등록 발신번호를 제공합니다.'],['문자 알림','국내 SMS/LMS 서비스 1종·고정 알림 3종, 발송 기록·실패 확인·중복 방지 포함. 발송 관리 화면·대량 광고·알림톡·푸시는 제외합니다.'],['개인정보 보안','권한 검사·HTTPS 확인·저장 암호화/접근 통제·조회/다운로드 기록·정책에 따른 분리 보관/파기·입력/업로드 점검을 포함합니다.'],['제외 기능','옵션·쿠폰·혼합 결제·부분취소·분할배송·자동반품·택배 API·비회원·해외배송·후기·문의·찜·송장 업로드·별도 이력 화면·기기 간 장바구니·대규모 이관·자체 편집 엔진 제외'],['검수·인수','확정 명세 기준으로 통합 검수합니다. 문자 발송·본인 외 주문 접근 차단·개인정보 보관/파기를 확인하고 결함 보완 후 서면 인수합니다.']])
t(13,[['구분','조건 및 책임 범위'],['운영 비용','서버·네트워크 별도 청구 없음. 운영 지원은 기존 계약 범위를 적용합니다.'],['하자보수','확정 명세와 다르게 동작하는 결함 보완. 기간·처리 기준은 계약에서 확정합니다.'],['별도 비용','문자 발송료·PG 수수료·사전 승인한 유료 서비스/라이선스·신규 디자인 제작'],['보안 범위','굿즈 추가 영역의 명시 조치·점검 포함. 전체 시스템 보안 개편·전문 모의해킹·기관 심사/인증·24시간 관제 제외'],['산출물 인계','소스·데이터 구조·보안 설정·문자 연동·배포 및 운영 자료를 인계합니다.'],['계약 조건','지급·검수 기간·하자보수 기간·권리 귀속·해지·분쟁 조건은 별도 계약서에서 합의합니다.']])
# Remove the two infrastructure/operations explanation pages; retain their
# essential commercial conditions in sections 7 to 9 above.
start=next(p for p in ps if ''.join(p.xpath('.//w:t/text()',namespaces=N)).startswith('8. 기존 인프라'))
end=next(p for p in ps if ''.join(p.xpath('.//w:t/text()',namespaces=N)).startswith('8. 소요 비용'))
children=list(body); a=children.index(start); b=children.index(end)
# The page break immediately before section 8 remains. Remove the page break
# immediately before the cost summary together with the removed material.
for e in children[a:b]:body.remove(e)
parts['word/document.xml']=E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
OUT=R/'말마프렌즈_온라인스토어_추가개발_견적서_v16.docx'
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
 for n,data in parts.items():z.writestr(n,data)
with ZipFile(REF) as z:
 assert all(z.read(n)==data for n,data in parts.items() if n!='word/document.xml')
 old=E.fromstring(z.read('word/document.xml')).find('w:body',N).findall('w:tbl',N)
 assert E.tostring(old[2])==E.tostring(tabs[2])
 assert E.tostring(old[4])==E.tostring(tabs[4])
print(OUT)
