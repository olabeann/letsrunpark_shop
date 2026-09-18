(()=>{
  const dialog=$('invoiceDialog'),fileInput=$('invoiceFile'),apply=$('applyInvoices');
  let imported=[],reading=false,readId=0;
  function currentOrders(){const saved=localStorage.getItem('goodsOrders');if(saved===null)return orderData;const parsed=JSON.parse(saved);if(!Array.isArray(parsed))throw Error('주문 데이터를 확인할 수 없습니다.');return parsed;}
  function showPreview(orders){
    const checked=InvoiceImport.validate(imported,orders,carrierNames),bad=checked.filter(r=>r.errors.length);
    $('invoiceSummary').textContent=checked.length?`${checked.length}건 중 등록 가능 ${checked.length-bad.length}건 · 오류 ${bad.length}건${bad.length?' — 오류를 수정한 파일을 다시 첨부해 주세요.':''}`:'';
    $('invoicePreview').innerHTML=checked.length?'<table><thead><tr><th>엑셀 행</th><th>주문번호</th><th>택배사</th><th>송장번호</th><th>확인 결과</th></tr></thead><tbody>'+checked.map(r=>`<tr class="${r.errors.length?'invoice-invalid':''}"><td>${r.line}</td><td>${esc(r.number)}</td><td>${esc(r.carrier)}</td><td>${esc(r.trackingNumber)}</td><td>${r.errors.length?esc(r.errors.join(' / ')):'등록 가능'}</td></tr>`).join('')+'</tbody></table>':'';
    apply.disabled=reading||!checked.length||!!bad.length;apply.textContent=checked.length?`${checked.length}건 송장 등록 및 발송 완료`:'송장 등록 및 발송 완료';
    return checked;
  }
  function error(message){$('invoiceError').textContent=message;apply.disabled=true;}
  $('openInvoiceImport').onclick=()=>{imported=[];fileInput.value='';$('invoiceError').textContent='';showPreview([]);dialog.showModal();};
  $('closeInvoiceImport').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{readId++;reading=false;});
  $('invoiceTemplate').onclick=()=>{
    try{
      const rows=[InvoiceImport.headers,...currentOrders().filter(o=>o.status==='출고 대기').map(o=>[String(o.number),$('defaultCarrier').value||carrierNames[0],''])];
      const sheet=XLSX.utils.aoa_to_sheet(rows);sheet['!cols']=[{wch:25},{wch:18},{wch:32}];
      Object.keys(sheet).filter(k=>k[0]!=='!').forEach(k=>{sheet[k].t='s';sheet[k].z='@';});
      const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'송장등록');
      const guide=XLSX.utils.aoa_to_sheet([['송장 일괄 등록 안내'],['주문번호 1개당 한 행에 택배사와 송장번호를 입력합니다.'],['배송 준비 중인 주문만 등록할 수 있습니다.'],['등록하지 않을 주문은 행 전체를 삭제해 주세요.'],['송장번호는 텍스트 형식으로 입력하세요. 앞자리 0을 유지합니다.'],['파일을 첨부하고 검토한 뒤 적용하면 발송 완료로 변경됩니다.'],['택배사',...carrierNames]]);guide['!cols']=[{wch:85}];XLSX.utils.book_append_sheet(book,guide,'작성안내');
      XLSX.writeFile(book,'송장등록_양식.xlsx');
    }catch(e){notify('양식 다운로드 실패: '+e.message);}
  };
  fileInput.onchange=async()=>{
    const file=fileInput.files[0],id=++readId;imported=[];reading=true;$('invoiceError').textContent='';showPreview([]);
    if(!file){reading=false;return;}
    try{
      if(!/\.(xlsx|xls|csv)$/i.test(file.name))throw Error('엑셀(.xlsx, .xls) 또는 CSV 파일을 선택해 주세요.');
      if(file.size>5*1024*1024)throw Error('5MB 이하 파일을 선택해 주세요.');
      const data=await file.arrayBuffer();if(id!==readId)return;
      imported=InvoiceImport.parse(XLSX.read(data,{type:'array',cellFormula:true,cellText:true,cellNF:true}),XLSX);reading=false;showPreview(currentOrders());
    }catch(e){if(id===readId){reading=false;error(e.message||'파일을 읽을 수 없습니다.');}}
  };
  apply.onclick=()=>{
    if(reading||!imported.length)return;
    try{
      const latest=currentOrders(),checked=showPreview(latest);if(checked.some(r=>r.errors.length))return;
      const shipments=new Map(checked.map(r=>[r.number,r])),shippedAt=Date.now();
      const updated=latest.map(o=>shipments.has(o.number)?{...o,carrier:shipments.get(o.number).carrier,trackingNumber:shipments.get(o.number).trackingNumber,shippedAt,status:'출고 완료'}:o);
      localStorage.setItem('goodsOrders',JSON.stringify(updated));orderData=updated;renderOrders();dialog.close();notify(`${checked.length}건의 송장을 등록하고 발송 완료로 변경했습니다.`);
    }catch(e){error('등록하지 못했습니다. 주문은 변경되지 않았습니다. '+e.message);}
  };
  window.addEventListener('storage',e=>{if(e.key==='goodsOrders'&&dialog.open&&imported.length){try{showPreview(currentOrders());}catch(err){error(err.message);}}});
})();
