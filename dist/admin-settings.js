// Store settings page: populate and save only this page's form.
const settingsForm=document.getElementById('inlineSettingsForm');
const settingsCopyKeys=['purchaseNoticesText','purchaseAgreementText','privacyAgreementText'];
for(const key of [...settingsCopyKeys,'shippingFee','cancelHours','returnDays','returnShippingFee','shippingNotice','returnAddress']){
  settingsForm.elements[key].value=settings[key];
}
settingsForm.elements.defaultCarrier.innerHTML=carrierNames.map(carrier=>`<option ${carrier===(localStorage.goodsDefaultCarrier||carrierNames[0])?'selected':''}>${carrier}</option>`).join('');
settingsForm.onsubmit=event=>{
  event.preventDefault();
  const values=Object.fromEntries(new FormData(settingsForm));
  const status=document.getElementById('inlineSettingsStatus');
  const valid=['shippingFee','returnShippingFee'].every(key=>Number.isInteger(Number(values[key]))&&Number(values[key])>=0)
    &&Number.isInteger(Number(values.cancelHours))&&Number(values.cancelHours)>=1
    &&Number.isInteger(Number(values.returnDays))&&Number(values.returnDays)>=1&&Number(values.returnDays)<=365;
  if(!valid){status.textContent='배송비·반품비는 0 이상, 취소 시간은 1 이상, 반품 일수는 1~365의 정수로 입력해 주세요.';return;}
  for(const key of [...settingsCopyKeys,'shippingNotice','returnAddress']){
    values[key]=values[key].trim();
    if(!values[key]){status.textContent='안내와 동의 문구, 반품 주소를 입력해 주세요.';settingsForm.elements[key].focus();return;}
  }
  const purchaseChanged=['purchaseNoticesText','purchaseAgreementText','shippingNotice','shippingFee','cancelHours','returnDays','returnShippingFee'].some(key=>String(values[key])!==String(settings[key]));
  const privacyChanged=values.privacyAgreementText!==settings.privacyAgreementText;
  const versionSuffix=Date.now().toString(36);
  orderData.forEach(order=>{
    if(!order.policySnapshot)order.policySnapshot={...settings};
    if(!Number.isInteger(Number(order.returnDays)))order.returnDays=Number(settings.returnDays)||14;
  });
  settings={...settings,...Object.fromEntries(settingsCopyKeys.map(key=>[key,values[key]])),
    purchasePolicyVersion:purchaseChanged?'commerce-policy-'+versionSuffix:settings.purchasePolicyVersion,
    privacyPolicyVersion:privacyChanged?'privacy-order-'+versionSuffix:settings.privacyPolicyVersion,
    shippingFee:Number(values.shippingFee),returnShippingFee:Number(values.returnShippingFee),
    cancelHours:Number(values.cancelHours),returnDays:Number(values.returnDays),
    shippingNotice:values.shippingNotice,returnAddress:values.returnAddress};
  localStorage.goodsDefaultCarrier=values.defaultCarrier;
  persist();status.textContent='스토어 운영 설정을 저장했습니다. 변경값은 신규 주문부터 적용됩니다.';
};
