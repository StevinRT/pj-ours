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

const THERMAL_CSS = `
@page { size: 58mm auto; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 58mm;
  max-width: 58mm;
  margin: 0;
  padding: 0;
  overflow: visible;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  line-height: 1.25;
  color: #000;
  background: #fff;
}
.receipt {
  width: 58mm;
  max-width: 58mm;
  box-sizing: border-box;
  padding: 2mm 3mm;
  margin: 0 auto;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.center { text-align: center; }
.bold   { font-weight: bold; }
.lg     { font-size: 13px; }
.sm     { font-size: 9px; }
hr { border: none; border-top: 1px dashed #000; margin: 3px 0; }
/* Two-column label/amount rows for totals */
.row { display: flex; justify-content: space-between; align-items: baseline; }
/* Fixed-column table for item lines — prevents amount overflow on narrow paper */
.items { width: 100%; border-collapse: collapse; table-layout: fixed; }
.col-name { width: 60%; }
.col-qty  { width: 12%; }
.col-amt  { width: 28%; }
.items th { text-align: left; font-weight: bold; padding-bottom: 2px; font-size: 9px; }
.items .c { text-align: center; }
.items .r { text-align: right; white-space: nowrap; }
.items td { vertical-align: top; padding: 1px 0; word-break: break-word; overflow-wrap: anywhere; }
@media print {
  html, body {
    width: 58mm !important;
    max-width: 58mm !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .receipt {
    width: 58mm !important;
    max-width: 58mm !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }
}
`;

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
  const win = window.open('', '_blank', 'width=240,height=600');
  if (!win) { alert('Allow pop-ups to print.'); return; }
  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=220,initial-scale=1"><title>${title}</title><style>${THERMAL_CSS}</style></head><body><div class="receipt">${html}</div></body></html>`
  );
  win.document.close();
  win.focus();
  // document.write is synchronous; readyState is already 'complete', so a short delay is sufficient
  const doPrint = () => { win.print(); };
  if (win.document.readyState === 'complete') {
    setTimeout(doPrint, 250);
  } else {
    win.addEventListener('load', doPrint);
  }
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
    ? `<div class="row"><span>PACKING CHARGE</span><span>&#8377;${order.packing_charge}</span></div>`
    : '';

  const html = `
    <div class="center bold lg">PJ OURS</div>
    <div class="center bold">${branchName(order.branch)}</div>
    <hr>
    <div>ORDER #${order.order_number}</div>
    <div class="row">
      <span>${fmtDate(order.created_at)}</span>
      <span>${fmtTime(order.created_at)}</span>
    </div>
    ${isDineIn && order.table_number ? `<div class="center bold">TABLE: ${order.table_number}</div>` : ''}
    <div class="center">${isDineIn ? 'DINE IN' : 'PARCEL'}</div>
    <hr>
    <table class="items">
      <colgroup><col class="col-name"><col class="col-qty"><col class="col-amt"></colgroup>
      <thead><tr><th>ITEM</th><th class="c">QTY</th><th class="r">AMT</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <hr>
    <div class="row"><span>ITEMS TOTAL</span><span>&#8377;${order.subtotal}</span></div>
    ${packRow}
    <hr>
    ${order.payment_method ? `<div>PAYMENT: ${order.payment_method.toUpperCase()}</div>` : ''}
    <div class="row bold lg"><span>TOTAL</span><span>&#8377;${order.total}</span></div>
    <hr>
    <div class="center bold" style="margin-top:4px">THANK YOU!</div>
    <div class="center sm">Visit us again</div>
    <div style="height:8mm"></div>
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
    <div class="row" style="margin-top:2px">
      <span>${fmtDate(order.created_at)}</span>
      <span>${fmtTime(order.created_at)}</span>
    </div>
    <hr>
    ${itemRows}
    <hr>
  `;

  openPrint(`KOT #${order.order_number}`, html);
};

// Generates raw ESC/POS bytes for a 58mm thermal printer (32 chars/line, Font A).
// Cannot be sent from a browser directly — requires a native Android bridge
// (Android Print Service plugin or a companion app with classic Bluetooth RFCOMM access).
export const generateEscPosBill = (order: PrintOrder): Uint8Array => {
  const COLS = 32;

  const b: number[] = [];
  const enc = new TextEncoder();
  const push = (...n: number[]) => b.push(...n);
  const str = (s: string) => b.push(...enc.encode(s));
  const lf = () => b.push(0x0a);
  const line = () => { str('-'.repeat(COLS)); lf(); };

  const twoCol = (left: string, right: string) => {
    const pad = Math.max(1, COLS - left.length - right.length);
    str(left + ' '.repeat(pad) + right); lf();
  };

  // ITEM(20) + QTY(4) + AMT(8) = 32 chars; wraps name continuation to next line
  const itemRow = (name: string, qty: string, amt: string) => {
    const first = name.length <= 20 ? name : name.substring(0, 20);
    const rest  = name.length > 20  ? name.substring(20).trim() : '';
    str(first.padEnd(20) + qty.padStart(4) + amt.padStart(8)); lf();
    if (rest) { str('  ' + rest.substring(0, COLS - 2)); lf(); }
  };

  push(0x1b, 0x40);                         // ESC @ — init
  push(0x1b, 0x61, 0x01);                   // center
  push(0x1d, 0x21, 0x11);                   // double width + height
  push(0x1b, 0x45, 0x01);                   // bold
  str('PJ OURS'); lf();
  push(0x1d, 0x21, 0x00);                   // normal size
  str(branchName(order.branch)); lf();
  push(0x1b, 0x45, 0x00);                   // bold off
  push(0x1b, 0x61, 0x00);                   // left

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
  push(0x1d, 0x21, 0x01);                   // double height for total
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

  push(0x1b, 0x64, 0x04);                   // feed 4 lines for tear-off

  return new Uint8Array(b);
};

// Sends raw ESC/POS bytes to a local bridge server, falls back to browser Print Service.
// Bridge: POST http://localhost:9100/print  (application/octet-stream)
// A native Android companion app must run the bridge to enable direct thermal printing.
export const printThermalBill = async (order: PrintOrder): Promise<void> => {
  const bytes = generateEscPosBill(order);
  try {
    const res = await fetch('http://localhost:9100/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`bridge ${res.status}`);
  } catch {
    // Bridge not available — fall back to Android Print Service (PDF) path
    printBill(order);
  }
};
