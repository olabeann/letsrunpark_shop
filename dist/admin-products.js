function productOrderSignature(products) {
  return JSON.stringify(products.filter(product => !product.deletedAt).map(product => [Number(product.id), Number(product.displayOrder) || 0, isReorderableProduct(product)]).sort((a,b) => a[0]-b[0]));
}
function isReorderableProduct(product) {
  return !product.deletedAt && ['sale', 'soldout'].includes(product.status);
}
function applyProductOrder(products, ids, initialSignature) {
  const eligible = products.filter(isReorderableProduct);
  if (productOrderSignature(products) !== initialSignature || new Set(ids).size !== ids.length || ids.length !== eligible.length || ids.some(id => !eligible.some(product => Number(product.id) === id))) throw new Error('ORDER_CHANGED');
  // Reorder visible products while retaining hidden products' positions.
  const ordered = products.filter(product => !product.deletedAt).slice().sort((a,b) => (Number(a.displayOrder)||0)-(Number(b.displayOrder)||0)||Number(a.id)-Number(b.id));
  let cursor = 0;
  const positions = new Map(ordered.map((product,index) => [isReorderableProduct(product) ? ids[cursor++] : Number(product.id), index + 1]));
  return products.map(product => product.deletedAt ? product : {...product, displayOrder: positions.get(Number(product.id))});
}

let productPage = 1;
// Seed a long-name sample once, retaining subsequent edits and soft deletion.
if (!goods.some(product => product.sampleKey === 'long-product-name-v1')) {
  goods.push({
    id: Math.max(0, ...goods.map(product => Number(product.id) || 0)) + 1,
    sampleKey: 'long-product-name-v1',
    name: '[샘플] 경주마 인형 1'.repeat(8),
    description: '긴 상품명의 줄바꿈과 상품 목록 영역을 확인하기 위한 샘플 상품입니다.',
    price: 6500,
    stock: 486,
    status: 'sale',
    art: 'SAMPLE',
    displayOrder: Math.max(0, ...goods.map(product => Number(product.displayOrder) || 0)) + 1
  });
  localStorage.goodsProducts = JSON.stringify(goods);
}
  let reorderMode = false;
  const activeGoods = () => goods.filter(product => !product.deletedAt);
  const sortedGoods = () => activeGoods().slice().sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || Number(a.id) - Number(b.id));
function openEditor(id){const p=goods.find(p=>p.id===id)||{id:'',name:'',price:0,stock:0,image:'',description:'',status:'sale'};$('productEditor').reset();Object.entries(p).forEach(([key,value])=>{if($('productEditor').elements[key])$('productEditor').elements[key].value=value;});CoverImage.load(p.image||'');DetailEditor.load(p.detailHtml||'');$('productSaveError').textContent='';$('productEditor').elements.stock.disabled=!!id;$('stockFieldLabel').textContent=id?'현재 재고 (재고 관리에서 변경)':'초기 재고';$('editorTitle').textContent=id?'상품 정보 수정':'상품 등록';$('productDialog').showModal();}
function renderProducts () {
    const search = $('productSearch').value.trim().toLowerCase();
    const status = $('productStatus').value;
    const filtered = sortedGoods().filter(product => (!search || product.name.toLowerCase().includes(search)) && (!status || product.status === status));
    $('productCount').textContent = filtered.length;
    $('productsTable').classList.toggle('is-reordering', reorderMode);
    $('addGoods').disabled = reorderMode;
    $('productFilter').querySelectorAll('input,select,button').forEach(control => control.disabled = reorderMode);
    if (reorderMode) { const rows = sortedGoods().filter(isReorderableProduct); $('productCount').textContent = rows.length; return renderReorderProducts(rows); }
    productPage = pagination($('productPagination'), filtered.length, productPage, page => { productPage = page; renderProducts(); });
    const rows = filtered.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
    $('productsTable').innerHTML = rows.length ? `<table><thead><tr><th>순서</th><th>상품</th><th>판매가격</th><th>재고</th><th>상태</th><th aria-label="상품 관리 작업"></th></tr></thead><tbody>${rows.map(product => `<tr><td>${product.displayOrder}</td><td><div class="product-title"><span class="thumb"><img src="${esc(product.image || 'assets/product-malma-default.png')}" alt=""></span><b>${esc(product.name)}</b></div></td><td><b>${money(product.price)}</b></td><td><b>${product.stock}개</b></td><td>${product.status === 'hidden' ? '판매 중지' : product.stock === 0 || product.status === 'soldout' ? '품절' : '판매 중'}</td><td><div class="product-actions"><button data-edit="${product.id}">상품 수정</button><button data-stock="${product.id}">재고 관리 · 이력</button><button class="danger" data-delete-product="${product.id}">삭제</button></div></td></tr>`).join('')}</tbody></table>` : EmptyStates.html(goods.some(p=>!p.deletedAt)?'adminProductSearch':'adminProducts');
    document.querySelectorAll('[data-stock]').forEach(button=>button.onclick=()=>openStock(Number(button.dataset.stock)));
    document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(Number(button.dataset.edit)));
    document.querySelectorAll('[data-delete-product]').forEach(button => button.onclick = () => deleteProduct(Number(button.dataset.deleteProduct)));
    syncSharedAdminComponents($('productsTable'));
  };

  function renderReorderProducts(rows) {
    $('productPagination').innerHTML = '';
    $('productsTable').innerHTML = `<div class="reorder-toolbar"><button id="saveProductOrder" class="blue">순서 저장</button><button id="cancelProductOrder">취소</button></div><p id="reorderStatus" class="reorder-status" role="status" aria-live="polite"></p><ol id="productOrderList" class="product-order-list">${rows.map((product, index) => `<li data-id="${product.id}"><span class="drag-handle" draggable="true" title="드래그해서 이동" aria-hidden="true">⋮⋮</span><input class="order-position" type="number" min="1" max="${rows.length}" step="1" value="${index + 1}" aria-label="${esc(product.name)} 노출 순번"><div class="order-product">${product.image ? `<img src="${esc(product.image)}" alt="">` : ''}<span>${esc(product.name)}</span></div><small>${product.status === 'hidden' ? '판매 중지' : product.stock === 0 || product.status === 'soldout' ? '품절' : '판매 중'}</small><div class="order-moves"><button type="button" data-move="up" aria-label="한 칸 위로">↑</button><button type="button" data-move="down" aria-label="한 칸 아래로">↓</button><button type="button" data-move="first">맨 위</button><button type="button" data-move="last">맨 아래</button></div></li>`).join('')}</ol>`;
    const list = $('productOrderList');
    const initialOrder = productOrderSignature(goods);
    $('saveProductOrder').disabled = rows.length === 0;
    if (!rows.length) list.insertAdjacentHTML('afterend', '<p class="empty">순서를 설정할 상품이 없습니다.</p>');
    let dragged;
    const refresh = () => [...list.children].forEach((row, index) => {
      row.querySelector('input').value = index + 1;
      row.querySelectorAll('[data-move]').forEach(button => {
        button.disabled = ['up', 'first'].includes(button.dataset.move) ? index === 0 : index === list.children.length - 1;
      });
    });
    const announce = () => { $('reorderStatus').textContent = ''; };
    const move = (row, position, focus = true) => {
      const target = Math.max(1, Math.min(list.children.length, position));
      const others = [...list.children].filter(item => item !== row);
      list.insertBefore(row, others[target - 1] || null);
      refresh(); announce(row);
      if (focus) { row.querySelector('input').focus({preventScroll: true}); row.scrollIntoView({block: 'nearest'}); }
    };
    [...list.children].forEach(row => {
      const input = row.querySelector('input');
      const applyPosition = (focus = true) => {
        const value = Number(input.value);
        if (!Number.isInteger(value) || value < 1 || value > rows.length) {
          $('reorderStatus').textContent = `1부터 ${rows.length} 사이의 순번을 입력해 주세요.`;
          refresh(); return;
        }
        if (value !== [...list.children].indexOf(row) + 1) move(row, value, focus);
      };
      input.onblur = () => applyPosition(false);
      input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); applyPosition(); } };
      row.querySelectorAll('[data-move]').forEach(button => button.onclick = () => {
        const current = [...list.children].indexOf(row) + 1;
        move(row, ({up: current - 1, down: current + 1, first: 1, last: rows.length})[button.dataset.move]);
      });
      row.querySelector('.drag-handle').ondragstart = event => { dragged = row; event.dataTransfer.setData('text/plain', row.dataset.id); event.dataTransfer.effectAllowed = 'move'; row.classList.add('dragging'); };
      row.ondragend = () => { row.classList.remove('dragging'); dragged = null; refresh(); announce(row); };
      row.ondragover = event => { event.preventDefault(); if (dragged && row !== dragged) { list.insertBefore(dragged, row.getBoundingClientRect().top + row.offsetHeight / 2 < event.clientY ? row.nextSibling : row); refresh(); } };
      row.ondrop = event => event.preventDefault();
    });
    refresh();
    $('saveProductOrder').onclick = () => {
      try {
        const latest = JSON.parse(localStorage.goodsProducts || JSON.stringify(goods));
        const next = applyProductOrder(latest, [...list.children].map(row => Number(row.dataset.id)), initialOrder);
        localStorage.goodsProducts = JSON.stringify(next);
        goods = next;
      } catch (error) {
        $('reorderStatus').textContent = error.message === 'ORDER_CHANGED' ? '상품 목록이 변경되었습니다. 취소 후 다시 정렬해 주세요.' : '저장하지 못했습니다. 다시 시도해 주세요.';
        return;
      }
      reorderMode = false; $('reorderProducts').textContent = '노출 순서 설정'; renderProducts();
      notify('상품 노출 순서를 저장했습니다.');
    };
    $('cancelProductOrder').onclick = () => { reorderMode = false; $('reorderProducts').textContent = '노출 순서 설정'; renderProducts(); };
  }

function deleteProduct (id) {
    const product = goods.find(item => item.id === id);
    if (!product || !confirm(`“${product.name}” 상품을 삭제하시겠습니까?\n스토어와 상품 목록에서는 숨겨지지만 과거 주문·정산에는 ‘삭제된 상품’으로 보존됩니다.`)) return;
    Object.assign(product, { deletedAt: Date.now(), deletedBy: '통합 운영 관리자', status: 'hidden' });
    orderData.forEach(order => (order.items || []).forEach(item => { if (item.id === id) item.deletedProduct = true; }));
    saveAll(); renderProducts();
  };

  $('productEditor').onsubmit = event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const id = Number(form.id) || Date.now();
    const price = Number(form.price);
    goods=JSON.parse(localStorage.goodsProducts||JSON.stringify(goods));
    const existing=goods.find(product=>product.id===id);
    const stock = existing ? existing.stock : Number(form.stock);
    form.detailHtml = DetailEditor.value();
    if (!Number.isInteger(price) || price < 1) { $('productSaveError').textContent = '판매가격은 1원 이상의 정수로 입력해 주세요.'; return; }
    if (!Number.isInteger(stock) || stock < 0) { $('productSaveError').textContent = '재고는 0 이상의 정수로 입력해 주세요.'; return; }
    form.image = form.image || 'assets/product-malma-default.png';
    const index = goods.findIndex(product => product.id === id);
    if (index >= 0 && goods[index].deletedAt) { $('productSaveError').textContent = '삭제된 상품은 수정할 수 없습니다.'; return; }
    const displayOrder = index >= 0 ? goods[index].displayOrder : Math.max(0, ...activeGoods().map(product => Number(product.displayOrder) || 0)) + 1;
    const value = { ...(index >= 0 ? goods[index] : {}), ...form, id, price, stock, displayOrder, updatedAt: Date.now() };
    if (!existing) value.stockHistory=[{at:Date.now(),delta:stock,balance:stock,reason:'상품 등록 초기 재고',actor:Inventory.adminActor()}];
    try { Inventory.validateStatus(value.status, stock); } catch (error) { $('productSaveError').textContent = error.message; return; }
    const previous = goods.slice();
    if (index >= 0) goods[index] = value; else goods.push({ ...value, art: 'GOODS' });
    try { localStorage.goodsProducts = JSON.stringify(goods); } catch { goods = previous; $('productSaveError').textContent = '저장 공간이 부족합니다. 이미지 크기를 줄인 뒤 다시 저장해 주세요.'; return; } $('productDialog').close(); renderProducts();
  };


$('productEditor').elements.price.min='1';document.querySelector('.cover-upload h3').textContent='대표 이미지';
$('addGoods').onclick=()=>openEditor();
$('productFilter').onsubmit=event=>{event.preventDefault();productPage=1;renderProducts();};
$('reorderProducts').onclick=()=>{reorderMode=!reorderMode;$('reorderProducts').textContent=reorderMode?'순서 설정 중':'노출 순서 설정';renderProducts();};
renderProducts();window.addEventListener('admin-data-change',()=>{if(!reorderMode)renderProducts();});

let stockProductId;
let stockHistoryPage=1;
const stockHistoryPageSize=20;
function renderStock() {
  const product=goods.find(item=>item.id===stockProductId);
  if(!product || product.deletedAt) { $('stockDialog').close(); return; }
  $('stockTitle').textContent=product.name+' · 재고 관리';
  const history=Inventory.history(product);
  $('stockBalance').textContent=product.stock+'개';
  renderStockHistory(history);
  renderStockPreview();
}
function resetStockHistory() {
  stockHistoryPage=1;
  ['stockHistoryPeriod','stockHistoryType','stockHistoryStart','stockHistoryEnd'].forEach(id=>$(id).value='');
}
function renderStockHistory(history) {
  const period=$('stockHistoryPeriod').value;
  const type=$('stockHistoryType').value;
  const start=$('stockHistoryStart').value, end=$('stockHistoryEnd').value;
  $('stockHistoryDates').hidden=period!=='custom';
  const invalid=period==='custom' && start && end && start>end;
  $('stockHistoryError').hidden=!invalid;
  $('stockHistoryError').textContent=invalid?'종료일은 시작일 이후로 선택해 주세요.':'';
  let from=-Infinity, until=Infinity;
  if(period==='custom') {
    if(start) from=new Date(start+'T00:00:00').getTime();
    if(end) { const next=new Date(end+'T00:00:00');next.setDate(next.getDate()+1);until=next.getTime(); }
  } else if(period) {
    const today=new Date();today.setHours(0,0,0,0);today.setDate(today.getDate()-Number(period)+1);from=today.getTime();
  }
  const filtered=invalid?[]:history.slice().reverse().filter(entry=>
    Number(entry.at)>=from && Number(entry.at)<until &&
    (!type || (type==='increase'?entry.delta>0:entry.delta<0))
  ).sort((a,b)=>Number(b.at)-Number(a.at));
  const pages=Math.max(1,Math.ceil(filtered.length/stockHistoryPageSize));
  stockHistoryPage=Math.min(stockHistoryPage,pages);
  $('stockHistoryCount').textContent='총 '+filtered.length.toLocaleString('ko-KR')+'건';
  $('stockHistory').innerHTML=filtered.slice((stockHistoryPage-1)*stockHistoryPageSize,stockHistoryPage*stockHistoryPageSize).map(entry=>{
    const date=new Date(entry.at),pad=value=>String(value).padStart(2,'0');
    const stamp=`${pad(date.getMonth()+1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return `<tr><td><details class="stock-entry-detail"><summary aria-label="${esc(date.toLocaleString('ko-KR'))} 변경 상세">${stamp}</summary><div>${esc(date.toLocaleString('ko-KR'))}<br>${esc(entry.reason||'')}${entry.reference?'<br>'+esc(entry.reference):''}</div></details></td><td>${entry.delta>0?'+':''}${entry.delta.toLocaleString('ko-KR')}</td><td>${entry.balance.toLocaleString('ko-KR')}</td><td>${esc(Inventory.actorLabel(entry))}</td></tr>`;
  }).join('') || '<tr><td colspan="4" class="stock-history-empty">조건에 맞는 재고 변경 이력이 없습니다.</td></tr>';
  const button=(page,label,disabled=false)=>`<button type="button" data-stock-page="${page}" ${disabled?'disabled':''} ${page===stockHistoryPage && /^\d+$/.test(label)?'aria-current="page"':''} aria-label="${label==='‹'?'이전 페이지':label==='›'?'다음 페이지':page+'페이지'}">${label}</button>`;
  const visible=new Set([1,pages,stockHistoryPage-1,stockHistoryPage,stockHistoryPage+1]);
  if(stockHistoryPage<=2)visible.add(3);
  if(stockHistoryPage>=pages-1)visible.add(pages-2);
  let previous=0,html=button(stockHistoryPage-1,'‹',stockHistoryPage===1);
  [...visible].filter(page=>page>=1&&page<=pages).sort((a,b)=>a-b).forEach(page=>{
    if(previous && page-previous>1)html+='<span aria-hidden="true">…</span>';
    html+=button(page,String(page));previous=page;
  });
  $('stockHistoryPagination').innerHTML=html+button(stockHistoryPage+1,'›',stockHistoryPage===pages);
}
['stockHistoryPeriod','stockHistoryType','stockHistoryStart','stockHistoryEnd'].forEach(id=>$(id).onchange=()=>{stockHistoryPage=1;renderStock();});
$('stockHistoryPagination').onclick=event=>{
  const button=event.target.closest('button[data-stock-page]');
  if(!button || button.disabled)return;
  stockHistoryPage=Number(button.dataset.stockPage);renderStock();
};
function openStock(id) { goods=JSON.parse(localStorage.goodsProducts||JSON.stringify(goods));stockProductId=id;resetStockHistory();const product=goods.find(item=>item.id===id);if(product){Inventory.history(product);localStorage.goodsProducts=JSON.stringify(goods);}$('stockForm').reset();$('stockError').textContent='';renderStock();$('stockDialog').showModal(); }
function renderStockPreview() {
  const product=goods.find(item=>item.id===stockProductId);if(!product)return;
  const delta=Number($('stockQuantity').value)*Number($('stockDirection').value);
  $('stockPreview').textContent='변경 후 예상 재고: '+(product.stock+delta)+'개';
}
$('stockQuantity').oninput=renderStockPreview;$('stockDirection').onchange=renderStockPreview;
$('stockForm').onsubmit=event=>{
  event.preventDefault();
  // Re-read at submission so changes since opening this dialog are preserved.
  goods=JSON.parse(localStorage.goodsProducts||JSON.stringify(goods));
  const product=goods.find(item=>item.id===stockProductId);
  if(!product || product.deletedAt){$('stockError').textContent='삭제된 상품입니다.';return;}
  const delta=Number($('stockQuantity').value)*Number($('stockDirection').value);
  try {
    Inventory.change(product,delta,$('stockReason').value);
    localStorage.goodsProducts=JSON.stringify(goods);
  } catch(error) { goods=JSON.parse(localStorage.goodsProducts||JSON.stringify(goods));renderProducts();renderStock();$('stockError').textContent=error.message;return; }
  $('stockForm').reset();$('stockError').textContent='';resetStockHistory();renderProducts();renderStock();notify('재고 변경을 기록했습니다.');
};
window.addEventListener('admin-data-change',()=>{if($('stockDialog').open)renderStock();});
