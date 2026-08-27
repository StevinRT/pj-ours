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
  width: 58mm !important;
  margin: 0 !important;
  padding: 0 !important;
  background: white !important;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  line-height: 1.25;
  color: #000;
}
.receipt {
  width: 58mm;
  max-width: 58mm;
  box-sizing: border-box;
  margin: 0;
  padding: 3mm 3mm 5mm 3mm;
  overflow: visible;
  color: #000;
  background: #fff;
}
.center { text-align: center; }
.bold   { font-weight: bold; }
.lg     { font-size: 13px; }
.sm     { font-size: 9px; }
hr { border: none; border-top: 1px dashed #000; margin: 3px 0; }
/* Two-column totals row as a table — avoids flex pagination quirks on Android Chrome */
.row { width: 100%; border-collapse: collapse; }
.row td:last-child { text-align: right; white-space: nowrap; }
/* Fixed-column item table — item name wraps, amount stays on paper */
.items { width: 100%; border-collapse: collapse; table-layout: fixed; }
.col-name { width: 52%; }
.col-qty  { width: 14%; }
.col-amt  { width: 34%; }
.items th { text-align: left; font-weight: bold; padding-bottom: 2px; font-size: 9px; }
.items .c { text-align: center; }
.items .r { text-align: right; white-space: nowrap; }
.items td { vertical-align: top; padding: 1px 0; word-break: break-word; overflow-wrap: anywhere; }
@media print {
  @page {
    size: 58mm auto;
    margin: 0 !important;
  }
  html, body {
    width: 58mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  .receipt {
    width: 58mm !important;
    max-width: 58mm !important;
    margin: 0 !important;
    padding: 3mm 3mm 5mm 3mm !important;
    box-sizing: border-box !important;
    overflow: visible !important;
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

// Direct ESC/POS from a browser is not possible without a native Android bridge app.
// If a companion app with Bluetooth RFCOMM access is added in future, re-introduce
// generateEscPosBill here and POST the bytes to its local bridge endpoint.
