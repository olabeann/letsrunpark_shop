from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from PIL import Image
from pathlib import Path
import unicodedata
pdfmetrics.registerFont(TTFont('Korean',str(Path(__file__).with_name('NotoSansKR-Regular.ttf'))))
W,H=960,650
out=Path('output/pdf/렛츠런파크_온라인스토어_화면구성안.pdf')
c=canvas.Canvas(str(out),pagesize=(W,H))
c.setTitle('렛츠런파크 온라인 스토어 - 사용자·관리자 화면 구성안')
c.setAuthor('LETSRUN PARK')
ink='#202124'; gray='#687080'; blue='#3D60FA'; orange='#FF7956'
def text(x,y,s,size=12,color=ink):
 c.setFillColor(HexColor(color)); c.setFont('Korean',size); c.drawString(x,y,s)
def rect(x,y,w,h,color):
 c.setFillColor(HexColor(color));c.rect(x,y,w,h,fill=1,stroke=0)
def footer(n):
 rect(36,32,888,1,'#E1E5EC');text(36,17,'LETSRUN PARK  |  온라인 스토어 화면 구성안  |  2026.09.18',9,gray)
 text(885,17,f'{n:02d} / 06',9,gray)
rect(0,0,W,H,'#F7F8FA');rect(36,568,52,5,blue)
text(36,593,'LETSRUN PARK  /  ONLINE STORE',12,blue)
text(36,515,'온라인 스토어 화면 구성안',34)
text(36,477,'사용자 페이지와 관리자 페이지를 다음과 같이 구성하고자 합니다.',17)
text(36,442,'제공된 화면 캡처 5장을 바탕으로 화면의 역할과 주요 구성을 정리했습니다.',12,gray)
for x,label,accent,items in [(36,'사용자 페이지',orange,[('01','스토어 메인','브랜드 소개 및 상품 영역 진입'),('02','공식 굿즈 목록','상품·가격·판매 상태 확인')]),(490,'관리자 페이지',blue,[('03','상품 판매 현황','주문·결제·배송 상태 확인'),('04','배송 처리','택배사·송장번호 등록 및 발송 처리'),('05','온라인 스토어 운영','상품·재고·판매 상태 및 스토어 설정')])]:
 rect(x,154,434,236,'#FFFFFF');rect(x,154,4,236,accent);text(x+22,361,label,21,accent)
 for j,(num,title,desc) in enumerate(items):
  y=316-j*56;text(x+22,y,num,11,accent);text(x+55,y,title,15);text(x+55,y-21,desc,11,gray)
text(36,101,'문서 범위',11,blue)
text(112,101,'캡처에 보이는 화면 구성 기준입니다. 상품·주문 데이터와 운영 설정값은 예시입니다.',11,gray)
footer(1);c.showPage()
pages=[
('사용자 페이지','01','스토어 메인','브랜드를 소개하고 공식 굿즈 목록으로 자연스럽게 안내하는 첫 화면입니다.','5.17.44',orange,[('상단 메뉴','브랜드 로고, 주문 조회, 장바구니를 배치합니다.'),('메인 비주얼','브랜드 메시지와 그래픽으로 스토어의 인상을 전달합니다.'),('상품 영역 연결','컬렉션 둘러보기 버튼과 하단 공식 굿즈 영역으로 상품 탐색을 안내합니다.')]),
('사용자 페이지','02','공식 굿즈 목록','상품을 카드 형태로 보여주고 가격과 판매 가능 여부를 함께 안내합니다.','5.17.51',orange,[('상품 카드','상품 이미지 영역, 상품명, 판매가격을 함께 표시합니다.'),('판매 상태','판매 중·품절 배지를 표시하고 품절 상품은 흐리게 구분합니다.'),('하단 정보','지역별 사업자 정보와 고객센터 연락처를 배치합니다.')]),
('관리자 페이지','03','상품 판매 현황','전체 상품 주문과 결제·환불 및 배송 진행 상황을 한 화면에서 확인합니다.','5.18.48',blue,[('검색 및 필터','주문 기간, 결제 상태, 배송 상태와 주문번호·구매자·전화번호로 검색합니다.'),('주문 목록','구매자, 주문상품, 결제금액, 결제·환불 및 배송 상태를 표시합니다.'),('주문 확인','주문 상세보기와 등록된 송장 조회 기능을 제공합니다.')]),
('관리자 페이지','04','배송 처리','발송 대기 주문을 확인하고 택배사와 송장번호를 등록하는 업무 화면입니다.','5.18.53',blue,[('배송 업무 구분','발송 대기·발송 완료 탭과 주문 기간·검색 조건을 배치합니다.'),('송장 등록','기본 택배사를 설정하고 주문별 택배사·송장번호를 입력합니다.'),('발송 처리','송장 등록으로 발송 완료 상태로 변경하고 주문 상세를 확인합니다.')]),
('관리자 페이지','05','온라인 스토어 운영','상품 판매와 재고를 관리하고 배송·취소 기준 등 스토어 설정을 운영합니다.','5.18.59',blue,[('스토어 설정','배송비, 취소 가능 기준, 구매 대상을 확인하고 설정을 변경합니다.'),('상품 운영','상품 등록, 상품·재고 수정 및 상품 삭제 기능을 배치합니다.'),('판매 관리','판매 상태와 상품명으로 검색하고 상품별 가격·재고·판매 상태를 관리합니다.')])]
files=list(Path('/Users/beomjimin/Desktop').glob('*.png'))
for n,(section,num,title,desc,stamp,accent,bullets) in enumerate(pages,2):
 rect(0,0,W,H,'#FFFFFF');rect(36,600,4,20,accent)
 text(49,605,f'{section}  /  {num}',12,accent);text(36,566,title,27);text(36,537,desc,12,gray)
 file=next(p for p in files if f'2026-09-18 오후 {stamp}.png' in unicodedata.normalize('NFC',p.name))
 im=Image.open(file);iw,ih=im.size
 maxw,maxh=888,402;s=min(maxw/iw,maxh/ih);dw,dh=iw*s,ih*s;x=36+(maxw-dw)/2;y=116+(maxh-dh)/2
 c.drawImage(str(file),x,y,width=dw,height=dh)
 c.setStrokeColor(HexColor('#DDE2EA'));c.setLineWidth(.5);c.rect(x,y,dw,dh,fill=0,stroke=1)
 for j,(label,body) in enumerate(bullets):
  yy=98-j*21;text(36,yy,label,11,accent);text(138,yy,body,11)
 footer(n);c.showPage()
c.save()
print(out.resolve())
