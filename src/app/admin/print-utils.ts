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

const getBridgeBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('thermalBridge');
    if (fromQuery) return fromQuery.replace(/\/+$/, '');
  }

  return (process.env.NEXT_PUBLIC_THERMAL_BRIDGE_URL ?? 'http://localhost:9100').replace(/\/+$/, '');
};

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

// ── Android bridge path ──────────────────────────────────────────────────────
// The app already has a working local bridge pattern for 58mm thermal printers.
// We use that directly here and bypass any legacy browser print dialog code.

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

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : '';
};

const openPrint = (title: string, html: string) => {
  if (typeof window === 'undefined') return;

  const prevTitle = document.title;
  document.title = title;

  const existingRoot = document.getElementById('thermal-receipt');
  if (existingRoot) existingRoot.remove();
  const existingStyle = document.getElementById('thermal-receipt-style');
  if (existingStyle) existingStyle.remove();

  const root = document.createElement('div');
  root.id = 'thermal-receipt';
  root.innerHTML = `<div class="receipt">${html}</div>`;
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.id = 'thermal-receipt-style';
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

const formatBillHtml = (order: PrintOrder): string => {
  const isDineIn = order.order_type === 'dine-in';

  const itemRows = order.items.map((it) => {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const label = hasSize ? `${it.name} (${it.sizeLabel})` : it.name;
    return `<tr>
      <td>${label}</td>
      <td class="c">${it.quantity}</td>
      <td class="r">Rs${it.price * it.quantity}</td>
    </tr>`;
  }).join('');

  const packRow = order.packing_charge > 0
    ? `<table class="row"><tr><td>PACKING CHARGE</td><td>Rs${order.packing_charge}</td></tr></table>`
    : '';

  return `
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
    <table class="row"><tr><td>ITEMS TOTAL</td><td>Rs${order.subtotal}</td></tr></table>
    ${packRow}
    <hr>
    ${order.payment_method ? `<div>PAYMENT: ${order.payment_method.toUpperCase()}</div>` : ''}
    <table class="row bold lg"><tr><td>TOTAL</td><td>Rs${order.total}</td></tr></table>
    <hr>
    <div class="center bold" style="margin-top:4px">THANK YOU!</div>
    <div class="center sm">Visit us again</div>
  `;
};

const formatKotHtml = (order: PrintOrder): string => {
  const isDineIn = order.order_type === 'dine-in';

  const itemRows = order.items.map((it) => {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const label = hasSize
      ? `${it.name.toUpperCase()} (${it.sizeLabel!.toUpperCase()})`
      : it.name.toUpperCase();
    return `<div class="bold" style="margin:3px 0">${it.quantity} x ${label}</div>`;
  }).join('');

  return `
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
    <div class="center bold">PLEASE PREPARE</div>
  `;
};

const sendEscPosToBridge = async (bytes: Uint8Array): Promise<boolean> => {
  // 1. Android WebView native JavascriptInterface support (if embedded in Android POS app)
  if (typeof window !== 'undefined') {
    const win = window as unknown as Record<string, unknown>;
    const android = win.Android as Record<string, unknown> | undefined;
    const androidBridge = win.AndroidBridge as Record<string, unknown> | undefined;
    const base64 = uint8ArrayToBase64(bytes);

    if (android && typeof android.printEscPos === 'function') {
      try {
        (android.printEscPos as (data: string) => void)(base64);
        return true;
      } catch (e) {
        console.warn('[ThermalPrinter] Android.printEscPos failed:', e);
      }
    }
    if (androidBridge && typeof androidBridge.printEscPos === 'function') {
      try {
        (androidBridge.printEscPos as (data: string) => void)(base64);
        return true;
      } catch (e) {
        console.warn('[ThermalPrinter] AndroidBridge.printEscPos failed:', e);
      }
    }
    if (android && typeof android.print === 'function') {
      try {
        (android.print as (data: string) => void)(base64);
        return true;
      } catch (e) {
        console.warn('[ThermalPrinter] Android.print failed:', e);
      }
    }
  }

  // 2. HTTP bridge on localhost / LAN
  try {
    const bridgeBaseUrl = getBridgeBaseUrl();

    // Mixed-content browsers block http:// bridging when the app is served over https://
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      bridgeBaseUrl.startsWith('http://') &&
      !bridgeBaseUrl.includes('localhost') &&
      !bridgeBaseUrl.includes('127.0.0.1')
    ) {
      return false;
    }

    const payload = new Uint8Array(bytes.byteLength);
    payload.set(bytes);

    const res = await fetch(`${bridgeBaseUrl}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Blob([payload]),
      signal: AbortSignal.timeout(2500),
    });

    return res.ok;
  } catch (err) {
    console.warn('[ThermalPrinter] Bridge request failed:', err);
    return false;
  }
};

export const generateEscPosKot = (order: PrintOrder): Uint8Array => {
  const COLS = 32;
  const b: number[] = [];
  const enc = new TextEncoder();
  const push = (...n: number[]) => b.push(...n);
  const str = (s: string) => b.push(...enc.encode(s));
  const lf = () => push(0x0a);
  const line = () => { str('-'.repeat(COLS)); lf(); };

  const twoCol = (left: string, right: string) => {
    const pad = Math.max(1, COLS - left.length - right.length);
    str(left + ' '.repeat(pad) + right); lf();
  };

  const wrapLine = (text: string) => {
    const words = text.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= COLS) {
        current = candidate;
        continue;
      }
      if (current) {
        str(current); lf();
      }
      const chunk = word.length > COLS ? word.substring(0, COLS) : word;
      current = chunk;
      if (word.length > COLS) {
        str(chunk); lf();
        current = '';
      }
    }
    if (current) {
      str(current); lf();
    }
  };

  push(0x1b, 0x40);
  push(0x1b, 0x61, 0x01);
  push(0x1d, 0x21, 0x11);
  push(0x1b, 0x45, 0x01);
  str('PJ OURS'); lf();
  push(0x1d, 0x21, 0x00);
  str(branchName(order.branch)); lf();
  push(0x1b, 0x45, 0x00);
  push(0x1b, 0x61, 0x00);

  line();
  push(0x1b, 0x45, 0x01);
  str(`KOT #${order.order_number}`); lf();
  push(0x1b, 0x45, 0x00);

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
  twoCol(fmtDate(order.created_at), fmtTime(order.created_at));
  line();

  for (const it of order.items) {
    const hasSize = it.sizeLabel && it.sizeLabel !== 'Regular' && it.sizeLabel !== '';
    const label = hasSize ? `${it.name} (${it.sizeLabel})` : it.name;
    const prefix = `${it.quantity} x ${label}`.toUpperCase();
    wrapLine(prefix);
  }

  line();
  push(0x1b, 0x61, 0x01);
  push(0x1b, 0x45, 0x01);
  str('PLEASE PREPARE'); lf();
  push(0x1b, 0x45, 0x00);
  push(0x1b, 0x61, 0x00);
  push(0x1b, 0x64, 0x04);

  return new Uint8Array(b);
};

export const printBill = async (order: PrintOrder): Promise<void> => {
  const bytes = generateEscPosBill(order);
  const printed = await sendEscPosToBridge(bytes);
  if (!printed) {
    openPrint(`Bill #${order.order_number}`, formatBillHtml(order));
  }
};

export const printKot = async (order: PrintOrder): Promise<void> => {
  const bytes = generateEscPosKot(order);
  const printed = await sendEscPosToBridge(bytes);
  if (!printed) {
    openPrint(`KOT #${order.order_number}`, formatKotHtml(order));
  }
};

export const printThermalBill = async (order: PrintOrder): Promise<void> => {
  await printBill(order);
};

export const printThermalKot = async (order: PrintOrder): Promise<void> => {
  await printKot(order);
};
