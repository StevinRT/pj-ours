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
@page { size: 58mm auto; margin: 2mm 3mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 52mm;
  font-family: 'Courier New', Courier, monospace;
  font-size: 10pt;
  line-height: 1.35;
  color: #000;
  background: #fff;
}
.center { text-align: center; }
.bold { font-weight: bold; }
.lg { font-size: 12pt; }
.sm { font-size: 8.5pt; }
hr { border: none; border-top: 1px dashed #000; margin: 4px 0; }
.row { display: flex; justify-content: space-between; }
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
  const win = window.open('', '_blank', 'width=380,height=650');
  if (!win) { alert('Allow pop-ups to print.'); return; }
  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${THERMAL_CSS}</style></head><body>${html}</body></html>`
  );
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 300);
};

export const printBill = (order: PrintOrder) => {
  const isDineIn = order.order_type === 'dine-in';

  const itemRows = order.items.map((it) => {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const label = hasSize ? `${it.name} (${it.sizeLabel})` : it.name;
    return `<div class="row" style="margin:1px 0">
      <span style="flex:1;padding-right:4px">${label}</span>
      <span style="width:18px;text-align:center">${it.quantity}</span>
      <span style="width:44px;text-align:right">&#8377;${it.price * it.quantity}</span>
    </div>`;
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
    <div class="row sm bold" style="margin-bottom:3px">
      <span>ITEM</span><span>QTY&nbsp;&nbsp;AMT</span>
    </div>
    ${itemRows}
    <hr>
    <div class="row"><span>ITEMS TOTAL</span><span>&#8377;${order.subtotal}</span></div>
    ${packRow}
    <hr>
    ${order.payment_method ? `<div>PAYMENT: ${order.payment_method.toUpperCase()}</div>` : ''}
    <div class="row bold lg"><span>TOTAL</span><span>&#8377;${order.total}</span></div>
    <hr>
    <div class="center bold" style="margin-top:6px">THANK YOU!</div>
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
