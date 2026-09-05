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

const sendEscPosToBridge = async (bytes: Uint8Array): Promise<void> => {
  const bridgeBaseUrl = getBridgeBaseUrl();

  // Mixed-content browsers block http:// bridging when the app is served over https://.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && bridgeBaseUrl.startsWith('http://')) {
    throw new Error('Thermal bridge cannot be used from HTTPS because it is configured as plain HTTP. Use HTTPS bridge or localhost on the same host.');
  }

  const payload = new Uint8Array(bytes.byteLength);
  payload.set(bytes);

  const res = await fetch(`${bridgeBaseUrl}/print`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: new Blob([payload]),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`bridge ${res.status}`);
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
  await sendEscPosToBridge(generateEscPosBill(order));
};

export const printKot = async (order: PrintOrder): Promise<void> => {
  await sendEscPosToBridge(generateEscPosKot(order));
};

export const printThermalBill = async (order: PrintOrder): Promise<void> => {
  await printBill(order);
};

export const printThermalKot = async (order: PrintOrder): Promise<void> => {
  await printKot(order);
};
