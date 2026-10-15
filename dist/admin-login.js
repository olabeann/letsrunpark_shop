(()=>{
 const byId=id=>document.getElementById(id);
 const accounts=[{id:'admin',password:'1234'},{id:'seoul_brand',password:'brand1234'},{id:'seoul_park',password:'park1234'},{id:'busan_ops',password:'busan1234'},{id:'jeju_ops',password:'jeju1234'}];
 const next=AdminAuth.destination(new URLSearchParams(location.search).get('next'));
 let pending=null;
 const readAccounts=()=>JSON.parse(localStorage.getItem('letsrunParkDepartmentAccountsV3')||'[]');
 const accountSettings=id=>readAccounts().find(item=>item.loginId===id||(id==='admin'&&item.type==='super'));
 const showError=(id,message)=>{byId(id).textContent=message;byId(id).hidden=false;};
 const complete=account=>{AdminAuth.login(account.id);location.replace(next);};
 if(AdminAuth.current()&&AdminAuth.current()!=='signed-out'){location.replace(next);return;}
 byId('admin-login-form').addEventListener('submit',event=>{
  event.preventDefault();byId('admin-login-error').hidden=true;
  const account=accounts.find(item=>item.id===byId('admin-login-id').value.trim()&&item.password===byId('admin-login-password').value);
  if(!account){showError('admin-login-error','아이디 또는 비밀번호를 확인해주세요.');byId('admin-login-password').focus();return;}
  try{
   const settings=accountSettings(account.id);
   if(settings?.active===false){showError('admin-login-error','사용이 중지된 계정입니다. 관리자에게 문의해주세요.');return;}
   const registered=settings?!!settings.otpRegistered:JSON.parse(localStorage.getItem('letsrunParkOtpDemoV1')||'{}')[account.id]===true;
   if(settings?.otpRequired===false&&!registered){complete(account);return;}
   pending=account;byId('admin-login-password').value='';
   byId('admin-login-form').hidden=true;byId('admin-otp-form').hidden=false;
   byId('admin-otp-setup').hidden=registered;
   byId('admin-otp-title').textContent=registered?'OTP 인증':'OTP 최초 등록';
   byId('admin-otp-description').textContent=registered?'인증 앱의 6자리 번호를 입력해주세요.':'인증 앱을 연결한 뒤 인증번호를 입력해주세요.';
   byId('admin-otp-account').textContent=account.id;byId('admin-otp-code').value='';byId('admin-otp-error').hidden=true;byId('admin-otp-code').focus();
  }catch{showError('admin-login-error','로그인 상태를 읽지 못했습니다. 브라우저 저장소 설정을 확인해주세요.');}
 });
 byId('admin-otp-form').addEventListener('submit',event=>{
  event.preventDefault();if(!pending)return;
  if(byId('admin-otp-code').value!=='123456'){showError('admin-otp-error','인증번호를 확인해주세요. 시연용 번호: 123456');return;}
  try{
   const saved=readAccounts(),settings=saved.find(item=>item.loginId===pending.id||(pending.id==='admin'&&item.type==='super'));
   if(settings){settings.otpRegistered=true;localStorage.setItem('letsrunParkDepartmentAccountsV3',JSON.stringify(saved));}
   else{const state=JSON.parse(localStorage.getItem('letsrunParkOtpDemoV1')||'{}');state[pending.id]=true;localStorage.setItem('letsrunParkOtpDemoV1',JSON.stringify(state));}
   complete(pending);
  }catch{showError('admin-otp-error','로그인 상태를 저장하지 못했습니다. 브라우저 저장소 설정을 확인해주세요.');}
 });
 byId('admin-otp-back').addEventListener('click',()=>{pending=null;byId('admin-otp-form').hidden=true;byId('admin-login-form').hidden=false;byId('admin-login-password').value='';byId('admin-login-id').focus();});
 byId('admin-otp-copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');byId('admin-otp-copy-status').textContent='수동 입력 키를 복사했습니다.';}
  catch{byId('admin-otp-copy-status').textContent='표시된 키를 직접 선택해 복사해 주세요.';}
 });
})();
