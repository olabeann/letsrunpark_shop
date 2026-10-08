let settlementPage=1;
  function paymentLabel (order) {
    if (order.status === '전체 취소') return '전액 환불 완료';
    if (order.refundKind === '관리자 예외 환불') return '관리자 예외 환불';
    if (order.returnStatus === '환불 완료') return '반품 환불 완료';
    if (order.returnStatus === '반품 반려') return '반품 반려';
    if (order.returnStatus === '신청 완료') return '반품 신청 완료';
    return '결제 완료';
  };

  function rebuildSettlementFilter() {
    const current = new Date();
    const value = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    $('settlementFilter').innerHTML = `<label>승인월<input id="settlementMonth" type="month" value="${value}"></label><label>결제 · 환불 상태<select id="settlementPayment"><option value="">전체 상태</option><option value="paid">정상 결제</option><option value="cancelled">취소 완료</option><option value="return_requested">환불 처리 대기</option><option value="refunded">환불 완료</option></select></label><button class="blue">조회</button>`;
    $('settlementFilter').onsubmit = event => { event.preventDefault(); settlementPage = 1; renderSettlement(); };
    $('settlementSearch').onsubmit = event => { event.preventDefault(); settlementPage = 1; renderSettlement(); };
  }

  function settlementRows() {
    const month = $('settlementMonth').value;
    const keyword = $('settlementKeyword').value.trim().toLowerCase();
    const payment = $('settlementPayment').value;
    const rows = [];
    orderData.forEach(order => {
      const names = (order.items || []).map(item => item.name).join(' / ');
      const search = `${order.number} ${names}`.toLowerCase();
      if (keyword && !search.includes(keyword)) return;
      if (monthKey(order.approvedAt || order.createdAt) === month && (!payment || payment === 'paid')) rows.push({ date: day(order.approvedAt || order.createdAt), order, type: '승인', amount: Number(order.total) || 0, fee: -Math.round((Number(order.total) || 0) * .02), status: '정상 결제' });
      const refundDate = order.refundCompletedAt || order.cancelCompletedAt || order.cancelledAt;
      if (monthKey(refundDate) === month && (!payment || (payment === 'cancelled' && order.status === '전체 취소') || (payment === 'refunded' && order.returnStatus === '환불 완료'))) {
        const refund = order.status === '전체 취소' ? Number(order.total) || 0 : Number(order.refundAmount) || 0;
        rows.push({ date: day(refundDate), order, type: '환불', amount: -refund, fee: Math.round(refund * .02), status: order.status === '전체 취소' ? '취소 완료' : paymentLabel(order) });
      }
      if (order.returnStatus === '신청 완료' && monthKey(order.approvedAt || order.createdAt) === month && (!payment || payment === 'return_requested')) rows.push({ date: day(order.returnRequestedAt), order, type: '처리 대기', amount: 0, fee: 0, status: '환불 처리 대기' });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }

  function payoutDate(month) {
    const [year, value] = month.split('-').map(Number);
    const date = new Date(year, value, 8);
    const holidays = new Set(JSON.parse(localStorage.goodsBusinessHolidays || '[]'));
    while ([0, 6].includes(date.getDay()) || holidays.has(day(date))) date.setDate(date.getDate() + 1);
    return day(date);
  }

  function renderSettlement () {
    const all = settlementRows();
    const gross = all.filter(row => row.type === '승인').reduce((sum, row) => sum + row.amount, 0);
    const refund = -all.filter(row => row.type === '환불').reduce((sum, row) => sum + row.amount, 0);
    const fee = all.reduce((sum, row) => sum + row.fee, 0);
    const carryIn = Number(localStorage.goodsSettlementCarry || 0);
    const raw = gross - refund + fee - carryIn;
    const payout = Math.max(0, raw);
    const carryOut = Math.max(0, -raw);
    $('settlementGross').textContent = money(gross);
    $('settlementPaidCount').textContent = `승인 ${all.filter(row => row.type === '승인').length}건`;
    $('settlementRefund').textContent = refund ? '-' + money(refund) : money(0);
    $('settlementRefundCount').textContent = `취소 · 환불 ${all.filter(row => row.type === '환불').length}건`;
    $('settlementPgFee').textContent = fee ? (fee < 0 ? '-' : '+') + money(Math.abs(fee)) : money(0);
    $('settlementPayout').textContent = money(payout);
    document.querySelector('#settlementPayout + span').textContent = `지급 예정 ${payoutDate($('settlementMonth').value)} · 차감 이월액 ${money(carryOut)}`;
    $('settlementCount').textContent = `${all.length}건`;
    settlementPage = pagination(document.querySelector('#settlementView .pagination'), all.length, settlementPage, page => { settlementPage = page; renderSettlement(); });
    const rows = all.slice((settlementPage - 1) * PAGE_SIZE, settlementPage * PAGE_SIZE);
    $('settlementTable').innerHTML = rows.length ? `<table class="settlement-table"><thead><tr><th>주문번호 · 상품명</th><th>처리일</th><th>구분</th><th>금액</th><th>PG 수수료 조정</th><th>정산 반영액</th><th>상태</th></tr></thead><tbody>${rows.map(row => `<tr><td><b>${esc(row.order.number)}</b><small>${esc((row.order.items || []).map(item => item.name + (item.deletedProduct ? ' (삭제된 상품)' : '')).join(' / '))}</small></td><td>${row.date}</td><td>${row.type}</td><td class="${row.amount < 0 ? 'refund-value' : ''}">${row.amount < 0 ? '-' : ''}${money(Math.abs(row.amount))}</td><td>${row.fee ? `${row.fee < 0 ? '-' : '+'}${money(Math.abs(row.fee))}` : '—'}</td><td><b>${row.amount + row.fee < 0 ? '-' : ''}${money(Math.abs(row.amount + row.fee))}</b></td><td><span class="badge">${esc(row.status)}</span></td></tr>`).join('')}</tbody></table>` : EmptyStates.html('settlement');
    syncSharedAdminComponents($('settlementTable'));
  };

  function crc32(bytes) {
    let crc = -1;
    for (const byte of bytes) { crc ^= byte; for (let index = 0; index < 8; index++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0); }
    return (crc ^ -1) >>> 0;
  }
  const u16 = value => [value & 255, value >>> 8 & 255];
  const u32 = value => [value & 255, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 & 255];
  function makeXlsx(rows) {
    const encoder = new TextEncoder();
    const xml = value => String(value ?? '').replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));
    const files = {
      '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="정산" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
      'xl/worksheets/sheet1.xml': `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => { const ref = String.fromCharCode(65 + columnIndex) + (rowIndex + 1); return typeof value === 'number' ? `<c r="${ref}"><v>${value}</v></c>` : `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`; }).join('')}</row>`).join('')}</sheetData></worksheet>`
    };
    const local = [], central = []; let offset = 0;
    Object.entries(files).forEach(([name, content]) => {
      const nameBytes = encoder.encode(name), data = encoder.encode(content), crc = crc32(data);
      const header = new Uint8Array([80,75,3,4,20,0,0,0,0,0,0,0,0,0,...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),0,0]);
      local.push(header, nameBytes, data);
      const directory = new Uint8Array([80,75,1,2,20,0,20,0,0,0,0,0,0,0,0,0,...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),0,0,0,0,0,0,0,0,0,0,0,0,...u32(offset)]);
      central.push(directory, nameBytes); offset += header.length + nameBytes.length + data.length;
    });
    const centralSize = central.reduce((sum, part) => sum + part.length, 0), count = Object.keys(files).length;
    return new Blob([...local, ...central, new Uint8Array([80,75,5,6,0,0,0,0,...u16(count),...u16(count),...u32(centralSize),...u32(offset),0,0])], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  $('exportSettlement').onclick = () => {
    const rows = [['승인월', $('settlementMonth').value], ['지급 예정일', payoutDate($('settlementMonth').value)], [], ['처리일', '주문번호', '상품명', '구분', '금액', 'PG 수수료 조정', '정산 반영액', '상태']];
    settlementRows().forEach(row => rows.push([row.date, row.order.number, (row.order.items || []).map(item => item.name).join(' / '), row.type, row.amount, row.fee, row.amount + row.fee, row.status]));
    const link = document.createElement('a'); link.href = URL.createObjectURL(makeXlsx(rows)); link.download = `커머스_정산_${$('settlementMonth').value}.xlsx`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };


$('exportSettlement').textContent='정산 엑셀 다운로드 (.xlsx)';$('settlementKeyword').placeholder='주문번호 · 상품명 검색';rebuildSettlementFilter();renderSettlement();window.addEventListener('admin-data-change',renderSettlement);
