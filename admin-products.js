let productPage = 1;
  let reorderMode = false;
  const activeGoods = () => goods.filter(product => !product.deletedAt);
  const sortedGoods = () => activeGoods().slice().sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || Number(a.id) - Number(b.id));
function openEditor(id){const p=goods.find(p=>p.id===id)||{id:'',name:'',price:0,stock:0,image:'',description:'',status:'sale'};$('productEditor').reset();Object.entries(p).forEach(([key,value])=>{if($('productEditor').elements[key])$('productEditor').elements[key].value=value;});CoverImage.load(p.image||'');DetailEditor.load(p.detailHtml||'');$('productSaveError').textContent='';$('editorTitle').textContent=id?'상품 · 재고 수정':'상품 등록';$('productDialog').showModal();}
function renderProducts () {
    const search = $('productSearch').value.trim().toLowerCase();
    const status = $('productStatus').value;
    const filtered = sortedGoods().filter(product => (!search || product.name.toLowerCase().includes(search)) && (!status || product.status === status));
    $('productCount').textContent = filtered.length;
    if (reorderMode) return renderReorderProducts(filtered);
    productPage = pagination($('productPagination'), filtered.length, productPage, page => { productPage = page; renderProducts(); });
    const rows = filtered.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
    $('productsTable').innerHTML = rows.length ? `<table><thead><tr><th>순서</th><th>상품</th><th>판매가격</th><th>재고</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(product => `<tr><td>${product.displayOrder}</td><td><div class="product-title"><span class="thumb">${product.image ? `<img src="${esc(product.image)}" alt="">` : esc(product.art || 'GOODS')}</span><b>${esc(product.name)}</b></div></td><td><b>${money(product.price)}</b></td><td><b>${product.stock}개</b></td><td>${product.status === 'hidden' ? '판매 중지' : product.stock === 0 || product.status === 'soldout' ? '품절' : '판매 중'}</td><td><div class="product-actions"><button data-edit="${product.id}">상품 · 재고 수정</button><button class="danger" data-delete-product="${product.id}">삭제</button></div></td></tr>`).join('')}</tbody></table>` : EmptyStates.html(goods.some(p=>!p.deletedAt)?'adminProductSearch':'adminProducts');
    document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(Number(button.dataset.edit)));
    document.querySelectorAll('[data-delete-product]').forEach(button => button.onclick = () => deleteProduct(Number(button.dataset.deleteProduct)));
    syncSharedAdminComponents($('productsTable'));
  };

  function renderReorderProducts(rows) {
    $('productPagination').innerHTML = '<span>전체 상품을 한 화면에서 정렬합니다. 행을 끌어 놓은 뒤 저장하세요.</span>';
    $('productsTable').innerHTML = `<div class="reorder-toolbar"><button id="saveProductOrder" class="blue">순서 저장</button><button id="cancelProductOrder">취소</button></div><ol id="productOrderList" class="product-order-list">${rows.map(product => `<li draggable="true" data-id="${product.id}"><span class="drag-handle">⋮⋮</span><span>${esc(product.name)}</span><small>${product.status === 'hidden' ? '판매 중지' : product.stock ? '판매 중' : '품절'}</small></li>`).join('')}</ol>`;
    let dragged;
    $('productOrderList').querySelectorAll('li').forEach(row => {
      row.ondragstart = () => { dragged = row; row.classList.add('dragging'); };
      row.ondragend = () => row.classList.remove('dragging');
      row.ondragover = event => { event.preventDefault(); const target = event.currentTarget; if (dragged && target !== dragged) target.parentElement.insertBefore(dragged, target.getBoundingClientRect().top + target.offsetHeight / 2 < event.clientY ? target.nextSibling : target); };
    });
    $('saveProductOrder').onclick = () => {
      const positions = rows.map(product => product.displayOrder).sort((a,b)=>a-b);
      [...$('productOrderList').children].forEach((row, index) => { const product = goods.find(item => item.id === Number(row.dataset.id)); if (product) product.displayOrder = positions[index]; });
      saveAll(); reorderMode = false; $('reorderProducts').textContent = '노출 순서 설정'; renderProducts();
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
    const stock = Number(form.stock);
    form.detailHtml = DetailEditor.value();
    if (!Number.isInteger(price) || price < 1) { $('productSaveError').textContent = '판매가격은 1원 이상의 정수로 입력해 주세요.'; return; }
    if (!Number.isInteger(stock) || stock < 0) { $('productSaveError').textContent = '재고는 0 이상의 정수로 입력해 주세요.'; return; }
    if (!form.image) { $('productSaveError').textContent = '대표 이미지를 등록해 주세요.'; return; }
    const index = goods.findIndex(product => product.id === id);
    if (index >= 0 && goods[index].deletedAt) { $('productSaveError').textContent = '삭제된 상품은 수정할 수 없습니다.'; return; }
    const displayOrder = index >= 0 ? goods[index].displayOrder : Math.max(0, ...activeGoods().map(product => Number(product.displayOrder) || 0)) + 1;
    const value = { ...(index >= 0 ? goods[index] : {}), ...form, id, price, stock, displayOrder, updatedAt: Date.now() };
    if (stock === 0 && value.status === 'sale') value.status = 'soldout';
    const previous = goods.slice();
    if (index >= 0) goods[index] = value; else goods.push({ ...value, art: 'GOODS' });
    try { localStorage.goodsProducts = JSON.stringify(goods); } catch { goods = previous; $('productSaveError').textContent = '저장 공간이 부족합니다. 이미지 크기를 줄인 뒤 다시 저장해 주세요.'; return; } $('productDialog').close(); renderProducts();
  };


$('productEditor').elements.price.min='1';document.querySelector('.cover-upload h3').innerHTML='대표 이미지 <em>*</em>';
$('addGoods').onclick=()=>openEditor();
$('productFilter').onsubmit=event=>{event.preventDefault();productPage=1;renderProducts();};
$('reorderProducts').onclick=()=>{reorderMode=!reorderMode;$('reorderProducts').textContent=reorderMode?'순서 설정 중':'노출 순서 설정';renderProducts();};
renderProducts();window.addEventListener('admin-data-change',renderProducts);
