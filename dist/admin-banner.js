const defaultHomeBanner='assets/home-hero-default.png?v=4';
const defaultMobileHomeBanner='assets/home-hero-mobile-default.png?v=2';
let homeBannerDraft={};
try{homeBannerDraft=JSON.parse(localStorage.getItem('goodsHomeBanner')||'{}')||{};}catch{homeBannerDraft={};}
function renderHomeBannerEditor(){
 const desktop=homeBannerDraft.desktop||defaultHomeBanner,mobile=homeBannerDraft.mobile||defaultMobileHomeBanner;
 $('homeBannerDesktopPreview').src=desktop;$('homeBannerDesktopName').textContent=homeBannerDraft.desktopName||'기본 배너';
 $('homeBannerMobilePreview').hidden=false;$('homeBannerMobileFallback').hidden=true;$('homeBannerMobilePreview').src=mobile;
 $('homeBannerMobileName').textContent=homeBannerDraft.mobileName||'기본 모바일 배너';$('removeHomeBannerMobile').disabled=!homeBannerDraft.mobile;
}
function readHomeBannerFile(file,target){
 const status=$('homeBannerStatus');status.textContent='';status.classList.remove('is-error');
 if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='JPG, PNG, WebP 이미지만 등록할 수 있습니다.';status.classList.add('is-error');return;}
 if(file.size>4*1024*1024){status.textContent='이미지는 파일당 4MB 이하로 등록해 주세요.';status.classList.add('is-error');return;}
 const reader=new FileReader();reader.onload=()=>{homeBannerDraft[target]=reader.result;homeBannerDraft[target+'Name']=file.name;renderHomeBannerEditor();status.textContent='미리보기에 반영했습니다. 배너 저장을 눌러 적용해 주세요.';};reader.onerror=()=>{status.textContent='이미지를 읽지 못했습니다. 다른 파일을 선택해 주세요.';status.classList.add('is-error');};reader.readAsDataURL(file);
}
function bindHomeBannerEditor(){
 renderHomeBannerEditor();
 $('homeBannerDesktopFile').onchange=event=>{readHomeBannerFile(event.target.files[0],'desktop');event.target.value='';};
 $('homeBannerMobileFile').onchange=event=>{readHomeBannerFile(event.target.files[0],'mobile');event.target.value='';};
 $('removeHomeBannerDesktop').onclick=()=>{delete homeBannerDraft.desktop;delete homeBannerDraft.desktopName;renderHomeBannerEditor();$('homeBannerStatus').textContent='기본 배너로 되돌렸습니다. 저장을 눌러 적용해 주세요.';};
 $('removeHomeBannerMobile').onclick=()=>{delete homeBannerDraft.mobile;delete homeBannerDraft.mobileName;renderHomeBannerEditor();$('homeBannerStatus').textContent='기본 모바일 배너로 되돌렸습니다. 저장을 눌러 적용해 주세요.';};
 $('saveHomeBanner').onclick=()=>{const status=$('homeBannerStatus');try{localStorage.setItem('goodsHomeBanner',JSON.stringify({...homeBannerDraft,updatedAt:Date.now()}));status.classList.remove('is-error');status.textContent='메인 배너 이미지를 저장했습니다.';}catch{status.textContent='저장 공간이 부족합니다. 이미지 용량을 줄인 뒤 다시 시도해 주세요.';status.classList.add('is-error');}};
}

bindHomeBannerEditor();
