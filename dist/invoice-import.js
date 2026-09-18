/* Excel parsing and validation are separate from storage updates. */
(function(root){
  const headers=['주문번호','택배사','송장번호'];
  function parse(workbook,XLSX){
    const sheet=workbook.Sheets[workbook.SheetNames.includes('송장등록')?'송장등록':workbook.SheetNames[0]];
    if(!sheet||!sheet['!ref']) throw Error('파일에 등록할 내용이 없습니다.');
    const range=XLSX.utils.decode_range(sheet['!ref']);
    if(range.e.r>2000||range.e.c>30) throw Error('한 번에 최대 2,000개 행, 31개 열까지 등록할 수 있습니다.');
    const title=[];for(let c=0;c<=range.e.c;c++)title.push(String(sheet[XLSX.utils.encode_cell({r:range.s.r,c})]?.v??'').trim());
    const cols=headers.map(h=>{if(title.filter(t=>t===h).length!==1)throw Error('첫 행에 주문번호, 택배사, 송장번호 열을 각각 하나씩 입력해 주세요.');return title.indexOf(h);});
    const rows=[];
    for(let r=range.s.r+1;r<=range.e.r;r++){
      const cells=cols.map(c=>sheet[XLSX.utils.encode_cell({r,c})]);
      if(cells.every(c=>!c||String(c.v??'').trim()===''))continue;
      let error='';
      const values=cells.map((cell,i)=>{
        if(cell?.f){error='수식 대신 값을 입력해 주세요.';return '';}
        if(i===2&&cell?.t==='n'){
          if(!Number.isSafeInteger(cell.v)||cell.v<0||cell.v>=1e15){error='송장번호를 텍스트 형식으로 다시 입력해 주세요. (15자리 초과 숫자 손실 방지)';return String(cell.v);}
          const formatted=XLSX.utils.format_cell(cell);
          return /^[\d\s-]+$/.test(formatted)?formatted:String(cell.v);
        }
        return String(cell?.v??'').trim();
      });
      rows.push({line:r+1,number:values[0],carrier:values[1],trackingNumber:values[2].replace(/[\s-]/g,''),parseError:error});
    }
    if(!rows.length)throw Error('등록할 송장번호가 없습니다.');
    return rows;
  }
  function validate(rows,orders,carriers){
    const numbers=new Map(),tracking=new Map();
    rows.forEach(r=>{numbers.set(r.number,(numbers.get(r.number)||0)+1);const key=r.carrier+'|'+r.trackingNumber;tracking.set(key,(tracking.get(key)||0)+1);});
    return rows.map(row=>{
      const errors=[];const matches=orders.filter(o=>o.number===row.number),order=matches[0];
      if(row.parseError)errors.push(row.parseError);
      if(!row.number)errors.push('주문번호 누락');else if(matches.length!==1)errors.push('주문번호를 확인해 주세요.');else if(order.status!=='출고 대기')errors.push('배송 준비 중인 주문만 등록할 수 있습니다.');
      if(numbers.get(row.number)>1)errors.push('파일 내 주문번호 중복');
      if(!carriers.includes(row.carrier))errors.push('택배사를 확인해 주세요.');
      if(!/^\d{8,30}$/.test(row.trackingNumber))errors.push('송장번호는 숫자 8~30자리로 입력해 주세요.');
      else{
        if(tracking.get(row.carrier+'|'+row.trackingNumber)>1)errors.push('파일 내 송장번호 중복');
        if(orders.some(o=>o.number!==row.number&&o.status!=='전체 취소'&&o.carrier===row.carrier&&String(o.trackingNumber||'').replace(/[\s-]/g,'')===row.trackingNumber))errors.push('다른 주문에 등록된 송장번호입니다.');
      }
      return {...row,errors};
    });
  }
  root.InvoiceImport={parse,validate,headers};
})(typeof module==='object'?module.exports:window);
