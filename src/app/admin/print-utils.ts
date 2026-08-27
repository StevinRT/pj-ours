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

// Direct ESC/POS from a browser is not possible without a native Android bridge app.
// If a companion app with Bluetooth RFCOMM access is added in future, re-introduce
// generateEscPosBill here and POST the bytes to its local bridge endpoint.
