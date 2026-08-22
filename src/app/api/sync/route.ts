import { NextRequest, NextResponse } from 'next/server';

// Server-side global state store shared across all connected devices (Mobile, Desktop, Laptop)
let globalProducts: any[] = [
  {
    id: 'SAR-00001',
    name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
    category: 'Saree',
    selling_price: 1299,
    cost_price: 650,
    original_price: 3899,
    discount_percent: 67,
    stock_quantity: 4,
    status: 'ACTIVE',
    color: 'Pink',
    fabric: 'Chiffon',
    style: 'Pochampally Ikkat',
    occasion: 'Festive',
    size: 'ONESIZE',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Graceful pink Pochampally Ikkat pattern saree crafted in lightweight chiffon fabric with blouse piece.',
    style_notes: 'Perfect for temple functions, festivals, and family gatherings.',
  },
  {
    id: 'SAR-00002',
    name: 'Black Woven Design Banarsi Silk Blend Saree',
    category: 'Saree',
    selling_price: 1349,
    cost_price: 720,
    original_price: 4249,
    discount_percent: 68,
    stock_quantity: 6,
    status: 'ACTIVE',
    color: 'Black',
    fabric: 'Banarsi Silk Blend',
    style: 'Woven Classic',
    occasion: 'Wedding / Festive',
    size: 'ONESIZE',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Timeless black Banarsi silk blend saree with rich zari border motifs and delicate unstitched blouse.',
    style_notes: 'Pair with gold statement jewelry for evening celebrations.',
  },
  {
    id: 'SAR-00003',
    name: 'Mustard Printed Silk Blend Saree With Zari Border',
    category: 'Saree',
    selling_price: 999,
    cost_price: 480,
    original_price: 3449,
    discount_percent: 71,
    stock_quantity: 2,
    status: 'ACTIVE',
    color: 'Mustard',
    fabric: 'Silk Blend',
    style: 'Printed Festive',
    occasion: 'Haldi / Puja',
    size: 'ONESIZE',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Bright mustard silk blend saree accented with shimmering zari border work for vibrant daytime elegance.',
    style_notes: 'Wear with jhumkas for pujas and family gatherings.',
  },
  {
    id: 'SAR-00004',
    name: 'Burgundy Solid Satin Saree With Embellished Border',
    category: 'Saree',
    selling_price: 979,
    cost_price: 520,
    original_price: 2949,
    discount_percent: 67,
    stock_quantity: 3,
    status: 'ACTIVE',
    color: 'Burgundy',
    fabric: 'Satin',
    style: 'Solid Glam',
    occasion: 'Party',
    size: 'ONESIZE',
    image: 'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Smooth, lustrous burgundy satin drape adorned with a delicate crystal embellished border.',
    style_notes: 'Style with statement cocktail studs and a clutch.',
  },
  {
    id: 'SUIT-00001',
    name: 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta',
    category: 'Suit',
    selling_price: 1899,
    cost_price: 1100,
    original_price: 4999,
    discount_percent: 62,
    stock_quantity: 10,
    status: 'ACTIVE',
    color: 'Blue',
    fabric: 'Chanderi Silk',
    style: 'Straight',
    occasion: 'Festive',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '3-piece royal blue Chanderi silk straight suit set accompanied by matching trousers and a lightweight organza dupatta.',
    style_notes: 'Pair with metallic heels and traditional earrings.',
  },
  {
    id: 'SUIT-00002',
    name: 'Emerald Green Anarkali Cotton Suit Set',
    category: 'Suit',
    selling_price: 1699,
    cost_price: 950,
    original_price: 4599,
    discount_percent: 63,
    stock_quantity: 7,
    status: 'ACTIVE',
    color: 'Green',
    fabric: 'Cotton Blend',
    style: 'Anarkali',
    occasion: 'Casual / Festive',
    size: 'L',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Flowy emerald green cotton Anarkali suit set with subtle gotta patti detailing and printed dupatta.',
    style_notes: 'Comfortable day-to-evening festive silhouette.',
  },
];

let globalOrders: any[] = [
  {
    id: 'ORD-1028',
    customer_id: 'CUST-00102',
    customer_name: 'Anita Roy',
    customer_phone: '9812345678',
    shipping_address: 'Flat 402, Green Glen Heights, Bengaluru 560103',
    total_price: 1299,
    status: 'IN_TRANSIT',
    status_label: 'In Transit (Expected Today)',
    date: '20 Aug 2026',
    created_at: '2026-08-20T10:30:00Z',
    tracking_number: 'DEL-IND-884920',
    items: [
      {
        id: 'SAR-00001',
        name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
        price: 1299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        size: 'ONESIZE',
      },
    ],
  },
  {
    id: 'ORD-1014',
    customer_id: 'CUST-00101',
    customer_name: 'Priya Sharma',
    customer_phone: '9876543210',
    shipping_address: '14/B Lake View Enclave, South Extension, New Delhi 110049',
    total_price: 1899,
    status: 'DELIVERED',
    status_label: 'Delivered',
    date: '12 Aug 2026',
    created_at: '2026-08-12T14:15:00Z',
    tracking_number: 'DEL-IND-773819',
    items: [
      {
        id: 'SUIT-00001',
        name: 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta',
        price: 1899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        size: 'M',
      },
    ],
  },
];

let globalCustomers: any[] = [
  {
    id: 'CUST-00101',
    name: 'Priya Sharma',
    phone: '9876543210',
    total_orders: 8,
    total_spent: 14890,
    aov: 1861,
    return_rate: '12.5%',
    preferred: 'Saree',
    days_inactive: 42,
    avg_interval: 30,
    status: 'OPPORTUNITY_DETECTED',
    last_purchase_date: '20 Aug 2026',
  },
  {
    id: 'CUST-00102',
    name: 'Anita Roy',
    phone: '9812345678',
    total_orders: 5,
    total_spent: 9495,
    aov: 1899,
    return_rate: '0%',
    preferred: 'Suit',
    days_inactive: 14,
    avg_interval: 25,
    status: 'ACTIVE_RECENT',
    last_purchase_date: '20 Aug 2026',
  },
  {
    id: 'CUST-00103',
    name: 'Meera Patel',
    phone: '9898765432',
    total_orders: 12,
    total_spent: 24980,
    aov: 2081,
    return_rate: '8.3%',
    preferred: 'Saree',
    days_inactive: 55,
    avg_interval: 35,
    status: 'OPPORTUNITY_DETECTED',
    last_purchase_date: '28 Jun 2026',
  },
];

let globalBills: any[] = [
  {
    billNumber: 'INV-20260820-0042',
    orderId: 'ORD-1028',
    customerId: 'CUST-00102',
    customerName: 'Anita Roy',
    customerPhone: '9812345678',
    totalAmount: 1299,
    date: '20 Aug 2026',
    pdfUrl: '/bills/INV-20260820-0042.pdf',
    items: [
      {
        product_id: 'SAR-00001',
        product_name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
        unit_price: 1299,
        quantity: 1,
      },
    ],
  },
];

let globalReturns: any[] = [
  {
    id: 'RET-0042',
    bill: 'INV-20260819-0038',
    customer: 'Pooja Verma',
    amount: 1299,
    time: 'Yesterday',
    reason: 'Size Fit Issue',
  },
];

let globalApprovals: any[] = [
  {
    id: 'APPR-00101',
    type: 'CUSTOMER_FOLLOWUP',
    title: 'Customer Re-engagement Suggested: Priya Sharma',
    risk: 'LOW',
    status: 'PENDING',
    date: '2 hrs ago',
    payload: {
      customer_name: 'Priya Sharma',
      days_inactive: 42,
      suggested_message:
        'Hi Priya, we noticed you enjoyed our festive saree collection! We have added new Banarsi silk arrivals that you might love.',
    },
  },
];

export async function GET() {
  return NextResponse.json({
    products: globalProducts,
    orders: globalOrders,
    customers: globalCustomers,
    bills: globalBills,
    returns: globalReturns,
    approvals: globalApprovals,
    timestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'PLACE_ORDER') {
      const order = payload.order;
      // Add or update order in globalOrders
      const existingIdx = globalOrders.findIndex((o) => o.id === order.id);
      if (existingIdx >= 0) {
        globalOrders[existingIdx] = order;
      } else {
        globalOrders = [order, ...globalOrders];
      }

      // Update customer profile in globalCustomers
      const custPhone = order.customer_phone || '';
      const existingCust = globalCustomers.find((c) => c.phone === custPhone || c.name === order.customer_name);
      if (existingCust) {
        existingCust.total_orders += 1;
        existingCust.total_spent += order.total_price;
        existingCust.aov = Math.round(existingCust.total_spent / existingCust.total_orders);
        existingCust.days_inactive = 0;
        existingCust.status = 'ACTIVE_RECENT';
        existingCust.last_purchase_date = order.date;
      } else {
        const newCust = {
          id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
          name: order.customer_name,
          phone: custPhone,
          total_orders: 1,
          total_spent: order.total_price,
          aov: order.total_price,
          return_rate: '0%',
          preferred: 'Saree',
          days_inactive: 0,
          avg_interval: 30,
          status: 'ACTIVE_RECENT',
          last_purchase_date: order.date,
        };
        globalCustomers = [newCust, ...globalCustomers];
      }

      // Decrement product stock in globalProducts
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const prod = globalProducts.find((p) => p.id === item.id);
          if (prod) {
            prod.stock_quantity = Math.max(0, prod.stock_quantity - (item.quantity || 1));
          }
        });
      }
    } else if (action === 'CREATE_BILL') {
      const { bill, order } = payload;
      globalBills = [bill, ...globalBills];
      if (order) {
        globalOrders = [order, ...globalOrders];
      }
      if (payload.customer) {
        const existingCust = globalCustomers.find((c) => c.phone === payload.customer.phone);
        if (existingCust) {
          existingCust.total_orders += 1;
          existingCust.total_spent += payload.customer.spent;
          existingCust.last_purchase_date = bill.date;
        } else {
          globalCustomers = [payload.customer, ...globalCustomers];
        }
      }
    } else if (action === 'PROCESS_RETURN') {
      const { returnRecord, restockItems } = payload;
      globalReturns = [returnRecord, ...globalReturns];
      if (Array.isArray(restockItems)) {
        restockItems.forEach((sku: string) => {
          const prod = globalProducts.find((p) => p.id === sku);
          if (prod) prod.stock_quantity += 1;
        });
      }
    } else if (action === 'PROCESS_APPROVAL') {
      const { id, decision } = payload;
      globalApprovals = globalApprovals.map((a) => (a.id === id ? { ...a, status: decision } : a));
    } else if (action === 'SYNC_ALL') {
      // Bulk merge incoming client state
      if (Array.isArray(payload.orders)) {
        const orderMap = new Map();
        [...payload.orders, ...globalOrders].forEach((o) => orderMap.set(o.id, o));
        globalOrders = Array.from(orderMap.values());
      }
      if (Array.isArray(payload.customers)) {
        const custMap = new Map();
        [...payload.customers, ...globalCustomers].forEach((c) => custMap.set(c.phone || c.id, c));
        globalCustomers = Array.from(custMap.values());
      }
      if (Array.isArray(payload.bills)) {
        const billMap = new Map();
        [...payload.bills, ...globalBills].forEach((b) => billMap.set(b.billNumber, b));
        globalBills = Array.from(billMap.values());
      }
      if (Array.isArray(payload.returns)) {
        const retMap = new Map();
        [...payload.returns, ...globalReturns].forEach((r) => retMap.set(r.id, r));
        globalReturns = Array.from(retMap.values());
      }
    }

    return NextResponse.json({
      success: true,
      products: globalProducts,
      orders: globalOrders,
      customers: globalCustomers,
      bills: globalBills,
      returns: globalReturns,
      approvals: globalApprovals,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
