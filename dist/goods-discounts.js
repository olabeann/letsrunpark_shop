// Shared merchandise discount rules. Browser demo storage; production must validate on server.
const GoodsDiscounts = {
 key: 'goodsDiscountsV1',
 read(){try{const rows=JSON.parse(localStorage.getItem(this.key)||'[]');return Array.isArray(rows)?rows:[];}catch{return [];}},
 day(now=Date.now()){return new Date(now+9*3600000).toISOString().slice(0,10);},
 validate(d){
  if(!String(d.name||'').trim())return '할인명을 입력해 주세요.';
  if(!['fixed','percent'].includes(d.type)||!Number.isFinite(d.value)||d.value<=0|| (d.type==='percent'&&d.value>100)||(d.type==='fixed'&&!Number.isInteger(d.value)))return '정액은 1원 이상 정수, 정률은 0% 초과 100% 이하로 입력해 주세요.';
  if(!Number.isSafeInteger(d.maxQty)||d.maxQty<1)return '최대 적용 수량은 1개 이상 정수로 입력해 주세요.';
  if(!d.startDate||!d.endDate||d.startDate>d.endDate)return '시작일과 종료일을 확인해 주세요.';
  if(!d.allProducts&&!d.productIds?.length)return '적용할 굿즈를 하나 이상 선택해 주세요.';
  return '';
 },
 status(d,now=Date.now()){const today=this.day(now);return !d.active?'비활성':today<d.startDate?'예정':today>d.endDate?'종료':'활성';},
 calculate(d,items,products,now=Date.now()){
  const empty={amount:0,allocations:[]};
  if(!d||this.validate(d)||this.status(d,now)!=='활성')return empty;
  let remaining=d.maxQty;
  const candidates=items.map((item,index)=>{const product=products.find(p=>p.id===item.id);if(!product||(!d.allProducts&&!d.productIds.includes(product.id))||!Number.isSafeInteger(item.qty)||item.qty<1)return null;
   const unit=Math.min(product.price,Math.floor(d.type==='percent'?product.price*d.value/100:d.value));return {id:item.id,index,qty:item.qty,unit};
  }).filter(x=>x&&x.unit>0).sort((a,b)=>b.unit-a.unit||a.index-b.index);
  const allocations=[];for(const x of candidates){const qty=Math.min(remaining,x.qty);if(qty>0){allocations.push({id:x.id,qty,unitDiscount:x.unit,amount:x.unit*qty});remaining-=qty;}}
  return {amount:allocations.reduce((s,x)=>s+x.amount,0),allocations};
 },
 quote(id,items,products,now=Date.now()){
  const policy=this.read().find(d=>d.id===id),result=this.calculate(policy,items,products,now);
  return {...result,policy:result.amount?JSON.parse(JSON.stringify(policy)):null};
 }
};
