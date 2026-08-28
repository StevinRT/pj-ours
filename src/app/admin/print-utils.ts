export type PrintItem = {
  name: string;
  sizeLabel?: string;
  price: number;
  quantity: number;
};

export type PrintOrder = {
  order_number: number;
  branch: string;
  order_type: string;
  table_number?: string | null;
  items: PrintItem[];
  subtotal: number;
  packing_charge: number;
  total: number;
  payment_method?: string | null;
  created_at: string;
};

// Scoped print CSS — injected into the main document, so all rules are
// constrained to #thermal-receipt and wrapped in @media print.
const PRINT_CSS = `
@page{size:58mm auto;margin:0}
#thermal-receipt{display:none}
@media print{
@page{size:58mm auto;margin:0!important}
body>*:not(#thermal-receipt){display:none!important}
#thermal-receipt{display:block!important}
html,body{width:58mm!important;margin:0!important;padding:0!important;background:#fff!important;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1.25;color:#000}
#thermal-receipt *{box-sizing:border-box;margin:0;padding:0}
#thermal-receipt .receipt{width:58mm;max-width:58mm;box-sizing:border-box;margin:0;padding:3mm 3mm 5mm 3mm;overflow:visible;color:#000;background:#fff}
#thermal-receipt .center{text-align:center}
#thermal-receipt .bold{font-weight:bold}
#thermal-receipt .lg{font-size:13px}
#thermal-receipt .sm{font-size:9px}
#thermal-receipt hr{border:none;border-top:1px dashed #000;margin:3px 0}
#thermal-receipt .row{width:100%;border-collapse:collapse}
#thermal-receipt .row td:last-child{text-align:right;white-space:nowrap}
#thermal-receipt .items{width:100%;border-collapse:collapse;table-layout:fixed}
#thermal-receipt .col-name{width:52%}
#thermal-receipt .col-qty{width:14%}
#thermal-receipt .col-amt{width:34%}
#thermal-receipt .items th{text-align:left;font-weight:bold;padding-bottom:2px;font-size:9px}
#thermal-receipt .items .c{text-align:center}
#thermal-receipt .items .r{text-align:right;white-space:nowrap}
#thermal-receipt .items td{vertical-align:top;padding:1px 0;word-break:break-word;overflow-wrap:anywhere}
}`;

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const branchName = (id: string) =>
  id === 'east-fort' ? 'EAST FORT' : id === 'west-fort' ? 'WEST FORT' : id.toUpperCase().replace(/-/g, ' ');

const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const fmtTime = (s: string) => {
  const d = new Date(s);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2,'0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const openPrint = (title: string, html: string) => {
  // Inject receipt into the current document so window.print() can be called
  // synchronously within the user gesture — required by Android Chrome.
  const prevTitle = document.title;
  document.title = title;

  const root = document.createElement('div');
  root.id = 'thermal-receipt';
  root.innerHTML = `<div class="receipt">${html}</div>`;
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.textContent = PRINT_CSS;
  document.head.appendChild(style);

  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    document.title = prevTitle;
    if (document.body.contains(root)) document.body.removeChild(root);
    if (document.head.contains(style)) document.head.removeChild(style);
  };
  window.addEventListener('afterprint', cleanup);
  // afterprint may not fire on all Android Chrome versions
  setTimeout(cleanup, 60_000);

  window.print();
};

export const printBill = (order: PrintOrder) => {
  const isDineIn = order.order_type === 'dine-in';

  const itemRows = order.items.map((it) => {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const label = hasSize ? `${it.name} (${it.sizeLabel})` : it.name;
    return `<tr>
      <td>${label}</td>
      <td class="c">${it.quantity}</td>
      <td class="r">&#8377;${it.price * it.quantity}</td>
    </tr>`;
  }).join('');

  const packRow = order.packing_charge > 0
    ? `<table class="row"><tr><td>PACKING CHARGE</td><td>&#8377;${order.packing_charge}</td></tr></table>`
    : '';

  const html = `
    <div class="center bold lg">PJ OURS</div>
    <div class="center bold">${branchName(order.branch)}</div>
    <hr>
    <div>ORDER #${order.order_number}</div>
    <table class="row"><tr><td>${fmtDate(order.created_at)}</td><td>${fmtTime(order.created_at)}</td></tr></table>
    ${isDineIn && order.table_number ? `<div class="center bold">TABLE: ${order.table_number}</div>` : ''}
    <div class="center">${isDineIn ? 'DINE IN' : 'PARCEL'}</div>
    <hr>
    <table class="items">
      <colgroup><col class="col-name"><col class="col-qty"><col class="col-amt"></colgroup>
      <thead><tr><th>ITEM</th><th class="c">QTY</th><th class="r">AMT</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <hr>
    <table class="row"><tr><td>ITEMS TOTAL</td><td>&#8377;${order.subtotal}</td></tr></table>
    ${packRow}
    <hr>
    ${order.payment_method ? `<div>PAYMENT: ${order.payment_method.toUpperCase()}</div>` : ''}
    <table class="row bold lg"><tr><td>TOTAL</td><td>&#8377;${order.total}</td></tr></table>
    <hr>
    <div class="center bold" style="margin-top:4px">THANK YOU!</div>
    <div class="center sm">Visit us again</div>
  `;

  openPrint(`Bill #${order.order_number}`, html);
};

export const printKot = (order: PrintOrder) => {
  const isDineIn = order.order_type === 'dine-in';

  const itemRows = order.items.map((it) => {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const label = hasSize
      ? `${it.name.toUpperCase()} (${it.sizeLabel!.toUpperCase()})`
      : it.name.toUpperCase();
    return `<div class="bold" style="margin:3px 0">${it.quantity} x ${label}</div>`;
  }).join('');

  const html = `
    <div class="center bold lg">PJ OURS</div>
    <div class="center bold">${branchName(order.branch)}</div>
    <hr>
    <div class="center bold lg">KOT #${order.order_number}</div>
    ${isDineIn && order.table_number ? `<div class="center bold">TABLE: ${order.table_number}</div>` : ''}
    <div class="center bold">${isDineIn ? 'DINE IN' : 'PARCEL'}</div>
    <table class="row" style="margin-top:2px"><tr><td>${fmtDate(order.created_at)}</td><td>${fmtTime(order.created_at)}</td></tr></table>
    <hr>
    ${itemRows}
    <hr>
  `;

  openPrint(`KOT #${order.order_number}`, html);
};

// ── Android bridge path ──────────────────────────────────────────────────────
// generateEscPosBill produces raw ESC/POS bytes (32-char/line, Font A, no cut).
// printThermalBill POSTs them to the companion Android bridge app on localhost:9100.
// If the bridge is not running it falls back to the existing browser print dialog.

export const generateEscPosBill = (order: PrintOrder): Uint8Array => {
  const COLS = 32;
  const b: number[] = [];
  const enc = new TextEncoder();
  const push = (...n: number[]) => b.push(...n);
  // TextEncoder produces UTF-8; for ASCII-only content that is identical to CP437/Latin-1
  const str  = (s: string) => b.push(...enc.encode(s));
  const lf   = () => push(0x0a);
  const line = () => { str('-'.repeat(COLS)); lf(); };

  const twoCol = (left: string, right: string) => {
    const pad = Math.max(1, COLS - left.length - right.length);
    str(left + ' '.repeat(pad) + right); lf();
  };

  // name(20) + qty(4) + amt(8) = 32; long names wrap to a continuation line
  const itemRow = (name: string, qty: string, amt: string) => {
    const first = name.substring(0, 20);
    const rest  = name.length > 20 ? name.substring(20).trim() : '';
    str(first.padEnd(20) + qty.padStart(4) + amt.padStart(8)); lf();
    if (rest) { str('  ' + rest.substring(0, COLS - 2)); lf(); }
  };

  push(0x1b, 0x40);                       // ESC @ — init

  push(0x1b, 0x61, 0x01);                 // center
  push(0x1d, 0x21, 0x11);                 // double width + height
  push(0x1b, 0x45, 0x01);                 // bold
  str('PJ OURS'); lf();
  push(0x1d, 0x21, 0x00);                 // normal size
  str(branchName(order.branch)); lf();
  push(0x1b, 0x45, 0x00);                 // bold off
  push(0x1b, 0x61, 0x00);                 // left align

  line();
  str(`ORDER #${order.order_number}`); lf();
  twoCol(fmtDate(order.created_at), fmtTime(order.created_at));

  const isDineIn = order.order_type === 'dine-in';
  if (isDineIn && order.table_number) {
    push(0x1b, 0x61, 0x01);
    push(0x1b, 0x45, 0x01);
    str(`TABLE: ${order.table_number}`); lf();
    push(0x1b, 0x45, 0x00);
    push(0x1b, 0x61, 0x00);
  }
  push(0x1b, 0x61, 0x01);
  str(isDineIn ? 'DINE IN' : 'PARCEL'); lf();
  push(0x1b, 0x61, 0x00);

  line();
  push(0x1b, 0x45, 0x01);
  itemRow('ITEM', 'QTY', 'AMT');
  push(0x1b, 0x45, 0x00);
  line();

  for (const it of order.items) {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const name = hasSize ? `${it.name} (${it.sizeLabel})` : it.name;
    // Use "Rs" — the rupee symbol U+20B9 is not in standard thermal printer code pages
    itemRow(name, String(it.quantity), `Rs${it.price * it.quantity}`);
  }

  line();
  twoCol('ITEMS TOTAL', `Rs${order.subtotal}`);
  if (order.packing_charge > 0) {
    twoCol('PACKING CHARGE', `Rs${order.packing_charge}`);
  }
  line();

  if (order.payment_method) {
    str(`PAYMENT: ${order.payment_method.toUpperCase()}`); lf();
  }

  push(0x1b, 0x45, 0x01);
  push(0x1d, 0x21, 0x01);                 // double height for total line
  twoCol('TOTAL', `Rs${order.total}`);
  push(0x1d, 0x21, 0x00);
  push(0x1b, 0x45, 0x00);

  line();
  push(0x1b, 0x61, 0x01);
  push(0x1b, 0x45, 0x01);
  str('THANK YOU!'); lf();
  push(0x1b, 0x45, 0x00);
  str('Visit us again'); lf();
  push(0x1b, 0x61, 0x00);

  push(0x1b, 0x64, 0x04);                 // feed 4 lines for tear-off (no cut command)

  return new Uint8Array(b);
};

export const printThermalBill = async (order: PrintOrder): Promise<void> => {
  const bytes = generateEscPosBill(order);
  try {
    const res = await fetch('http://192.168.31.59:9100/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Blob([bytes.buffer as ArrayBuffer]),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`bridge ${res.status}`);
    // Bridge succeeded — receipt is already printing; skip the browser print dialog
  } catch {
    // Bridge unavailable or failed — fall back to browser print
    printBill(order);
  }
};
