'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, ProductStatus } from '@/types/database';

export interface StoreProduct {
  id: string;
  name: string;
  category: Category;
  selling_price: number;
  cost_price: number;
  original_price: number;
  discount_percent: number;
  stock_quantity: number;
  status: ProductStatus;
  color?: string;
  fabric?: string;
  style?: string;
  occasion?: string;
  size?: string;
  image: string;
  images?: string[];
  description?: string;
  style_notes?: string;
}

export interface StoreOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

export interface StoreOrder {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address?: string;
  total_price: number;
  status: 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'PROCESSING';
  status_label: string;
  date: string;
  created_at: string;
  items: StoreOrderItem[];
  tracking_number?: string;
  bill_number?: string;
}

export interface StoreCustomer {
  id: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  aov: number;
  return_rate: string;
  preferred: string;
  days_inactive: number;
  avg_interval: number;
  status: string;
  last_purchase_date?: string;
}

export interface StoreBill {
  billNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  date: string;
  pdfUrl: string;
  items: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    captured_image_url?: string;
  }[];
}

export interface StoreReturn {
  id: string;
  bill: string;
  customer: string;
  amount: number;
  reason: string;
  time: string;
  items: string[];
}

export interface StoreApproval {
  id: string;
  type: string;
  title: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED';
  date: string;
  payload: Record<string, any>;
}

const INITIAL_PRODUCTS: StoreProduct[] = [
  {
    id: 'SAR-00001',
    name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
    category: 'Saree',
    selling_price: 1299,
    cost_price: 750,
    original_price: 3899,
    discount_percent: 67,
    stock_quantity: 12,
    status: 'ACTIVE',
    color: 'Pink',
    fabric: 'Chiffon Silk Blend',
    style: 'Traditional Ikkat',
    occasion: 'Festive',
    size: 'ONESIZE',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Step into traditional elegance with this stunning Pink Pochampally Ikkat Chiffon Saree. Featuring delicate woven borders and rich drape quality, complete with an unstitched blouse piece.',
    style_notes: 'Pair with ethnic gold earrings and subtle metallic heels for weddings or festive celebrations.',
  },
  {
    id: 'SAR-00002',
    name: 'Black Woven Design Banarsi Silk Blend Saree',
    category: 'Saree',
    selling_price: 1349,
    cost_price: 800,
    original_price: 4249,
    discount_percent: 68,
    stock_quantity: 8,
    status: 'ACTIVE',
    color: 'Black',
    fabric: 'Banarsi Silk Blend',
    style: 'Classic Woven',
    occasion: 'Wedding',
    size: 'ONESIZE',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'A timeless black Banarsi silk blend saree featuring opulent woven motifs, designed to make a regal impression.',
    style_notes: 'Ideal for evening receptions, paired with antique silver jewelry.',
  },
  {
    id: 'SAR-00003',
    name: 'Mustard Printed Silk Blend Saree With Zari Border',
    category: 'Saree',
    selling_price: 999,
    cost_price: 550,
    original_price: 3449,
    discount_percent: 71,
    stock_quantity: 14,
    status: 'ACTIVE',
    color: 'Mustard',
    fabric: 'Silk Blend',
    style: 'Printed Zari',
    occasion: 'Casual',
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
    description: 'Handcrafted straight-cut royal blue Chanderi silk suit ensemble with intricate neckline embroidery and a matching organza dupatta.',
    style_notes: 'Perfect for festive dinners and formal occasions.',
  },
  {
    id: 'SUIT-00002',
    name: 'Emerald Green Anarkali Cotton Suit Set',
    category: 'Suit',
    selling_price: 1699,
    cost_price: 950,
    original_price: 3999,
    discount_percent: 57,
    stock_quantity: 7,
    status: 'ACTIVE',
    color: 'Green',
    fabric: 'Cotton',
    style: 'Anarkali',
    occasion: 'Casual',
    size: 'L',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Flowy emerald green cotton Anarkali suit set offering breezy comfort without sacrificing festive appeal.',
    style_notes: 'Pair with flat mojaris for all-day comfort.',
  },
];

const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: 'ORD-1028',
    customer_id: 'CUST-00101',
    customer_name: 'Priya Sharma',
    customer_phone: '9876543210',
    shipping_address: 'Flat 402, Lotus Residency, MG Road, Bangalore, 560001',
    total_price: 1299,
    status: 'IN_TRANSIT',
    status_label: 'In Transit (Expected Today)',
    date: '20 Aug 2026',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    tracking_number: 'BLR-EXP-9921',
    bill_number: 'INV-20260820-0042',
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
    customer_id: 'CUST-00102',
    customer_name: 'Anita Roy',
    customer_phone: '9812345678',
    shipping_address: 'B-12 Sector 4, Salt Lake, Kolkata, 700064',
    total_price: 1899,
    status: 'DELIVERED',
    status_label: 'Delivered',
    date: '12 Aug 2026',
    created_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    tracking_number: 'KOL-DLV-4412',
    bill_number: 'INV-20260812-0019',
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

const INITIAL_CUSTOMERS: StoreCustomer[] = [
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
    last_purchase_date: '12 Aug 2026',
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

const INITIAL_BILLS: StoreBill[] = [
  {
    billNumber: 'INV-20260820-0042',
    orderId: 'ORD-1028',
    customerId: 'CUST-00101',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    totalAmount: 1299,
    date: '20 Aug 2026',
    pdfUrl: '/bills/INV-20260820-0042.pdf',
    items: [
      {
        product_id: 'SAR-00001',
        product_name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
        unit_price: 1299,
        quantity: 1,
        captured_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

const INITIAL_RETURNS: StoreReturn[] = [
  {
    id: 'RET-0012',
    bill: 'INV-20260820-0038',
    customer: 'Sunita Verma',
    amount: 1299,
    reason: 'Size Fit Issue',
    time: 'Yesterday',
    items: ['SAR-00001'],
  },
];

const INITIAL_APPROVALS: StoreApproval[] = [
  {
    id: 'APPR-00101',
    type: 'CUSTOMER_FOLLOWUP',
    title: 'Customer Re-engagement Suggested: Priya Sharma',
    risk: 'LOW',
    status: 'PENDING',
    date: 'Just now',
    payload: {
      customer_name: 'Priya Sharma',
      days_inactive: 42,
      suggested_message: 'Hi Priya, we noticed you enjoyed our festive saree collection! We have added new Banarsi silk arrivals that you might love.',
    },
  },
  {
    id: 'APPR-00102',
    type: 'DELAY_ACTION',
    title: 'Delayed Order ORD-1028 Shipping Exception Response Draft',
    risk: 'MEDIUM',
    status: 'PENDING',
    date: '10 mins ago',
    payload: {
      order_id: 'ORD-1028',
      customer_name: 'Anita Roy',
      delay_hours: 8,
      suggested_message: 'Hi Anita, your Sareethi order (ORD-1028) has been slightly delayed in transit by 8 hours. We sincerely apologize and are expediting delivery today.',
    },
  },
  {
    id: 'APPR-00103',
    type: 'CLASSIFICATION_REVIEW',
    title: 'Uncertain Product Classification: Deep Maroon Velvet Saree',
    risk: 'MEDIUM',
    status: 'PENDING',
    date: '1 hour ago',
    payload: {
      sku: 'SAR-00006',
      confidence: 0.78,
      suggested_category: 'Saree',
      suggested_price: 2499,
    },
  },
];

const STORAGE_KEY = 'sareethi_store_data_v2';

interface StoreDataContextType {
  products: StoreProduct[];
  orders: StoreOrder[];
  customers: StoreCustomer[];
  bills: StoreBill[];
  returns: StoreReturn[];
  approvals: StoreApproval[];
  isLoaded: boolean;

  placeOrder: (orderInput: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
      size?: string;
    }[];
    totalAmount: number;
  }) => Promise<{ success: boolean; orderId: string }>;

  updateProduct: (
    id: string,
    updates: Partial<StoreProduct>
  ) => Promise<{ success: boolean }>;

  deleteProduct: (id: string) => Promise<{ success: boolean }>;

  createBill: (billInput: {
    customerName: string;
    customerPhone: string;
    items: {
      product_id?: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      captured_image_url?: string;
    }[];
  }) => Promise<{
    billNumber: string;
    orderId: string;
    customerId: string;
    totalAmount: number;
    pdfUrl: string;
    followupGenerated: boolean;
    suggestedFollowupMessage?: string;
  }>;

  processReturn: (returnInput: {
    billNumber: string;
    customerName: string;
    selectedItems: string[];
    reason: string;
    refundAmount: number;
  }) => Promise<{ success: boolean; returnId: string }>;

  processApproval: (
    id: string,
    decision: 'APPROVED' | 'EDITED' | 'REJECTED'
  ) => Promise<{ success: boolean }>;

  addDelayException: (exceptionInput: {
    orderId: string;
    customerName: string;
    delayHours: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestedMessage: string;
  }) => Promise<{ success: boolean; approvalId: string }>;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

export function StoreDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<StoreCustomer[]>(INITIAL_CUSTOMERS);
  const [bills, setBills] = useState<StoreBill[]>(INITIAL_BILLS);
  const [returns, setReturns] = useState<StoreReturn[]>(INITIAL_RETURNS);
  const [approvals, setApprovals] = useState<StoreApproval[]>(INITIAL_APPROVALS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products && Array.isArray(parsed.products)) setProducts(parsed.products);
        if (parsed.orders && Array.isArray(parsed.orders)) setOrders(parsed.orders);
        if (parsed.customers && Array.isArray(parsed.customers)) setCustomers(parsed.customers);
        if (parsed.bills && Array.isArray(parsed.bills)) setBills(parsed.bills);
        if (parsed.returns && Array.isArray(parsed.returns)) setReturns(parsed.returns);
        if (parsed.approvals && Array.isArray(parsed.approvals)) setApprovals(parsed.approvals);
      }
    } catch (e) {
      console.error('Error loading store data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        products,
        orders,
        customers,
        bills,
        returns,
        approvals,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving store data to localStorage', e);
    }
  }, [products, orders, customers, bills, returns, approvals, isLoaded]);

  // Listen to storage events for multi-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.customers) setCustomers(parsed.customers);
          if (parsed.bills) setBills(parsed.bills);
          if (parsed.returns) setReturns(parsed.returns);
          if (parsed.approvals) setApprovals(parsed.approvals);
        } catch (err) {
          console.error('Error parsing sync storage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const placeOrder = async (orderInput: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
      size?: string;
    }[];
    totalAmount: number;
  }) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `IND-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newOrder: StoreOrder = {
      id: orderId,
      customer_id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      customer_name: orderInput.customerName,
      customer_phone: orderInput.customerPhone,
      shipping_address: orderInput.deliveryAddress,
      total_price: orderInput.totalAmount,
      status: 'CONFIRMED',
      status_label: 'Confirmed & Processing',
      date: dateFormatted,
      created_at: new Date().toISOString(),
      tracking_number: trackingNumber,
      items: orderInput.items,
    };

    // 1. Prepend order
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Decrement inventory of products
    setProducts((prev) =>
      prev.map((prod) => {
        const itemOrdered = orderInput.items.find((it) => it.id === prod.id);
        if (itemOrdered) {
          return {
            ...prod,
            stock_quantity: Math.max(0, prod.stock_quantity - itemOrdered.quantity),
          };
        }
        return prod;
      })
    );

    // 3. Update / create customer
    setCustomers((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.phone.trim() === orderInput.customerPhone.trim() || c.name.toLowerCase() === orderInput.customerName.toLowerCase()
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newTotalOrders = existing.total_orders + 1;
        const newTotalSpent = existing.total_spent + orderInput.totalAmount;
        updated[existingIdx] = {
          ...existing,
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          aov: Math.round(newTotalSpent / newTotalOrders),
          days_inactive: 0,
          status: 'ACTIVE_RECENT',
          last_purchase_date: dateFormatted,
        };
        return updated;
      } else {
        const newCustomer: StoreCustomer = {
          id: newOrder.customer_id,
          name: orderInput.customerName,
          phone: orderInput.customerPhone,
          total_orders: 1,
          total_spent: orderInput.totalAmount,
          aov: orderInput.totalAmount,
          return_rate: '0%',
          preferred: orderInput.items[0]?.name.toLowerCase().includes('suit') ? 'Suit' : 'Saree',
          days_inactive: 0,
          avg_interval: 30,
          status: 'ACTIVE_RECENT',
          last_purchase_date: dateFormatted,
        };
        return [newCustomer, ...prev];
      }
    });

    return { success: true, orderId };
  };

  const updateProduct = async (id: string, updates: Partial<StoreProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    return { success: true };
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'DELETED' as ProductStatus } : p))
    );
    return { success: true };
  };

  const createBill = async (billInput: {
    customerName: string;
    customerPhone: string;
    items: {
      product_id?: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      captured_image_url?: string;
    }[];
  }) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const billNumber = `INV-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerId = `CUST-${Math.floor(100 + Math.random() * 900)}`;
    const totalAmount = billInput.items.reduce(
      (sum, it) => sum + it.unit_price * it.quantity,
      0
    );
    const dateFormatted = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newBill: StoreBill = {
      billNumber,
      orderId,
      customerId,
      customerName: billInput.customerName,
      customerPhone: billInput.customerPhone,
      totalAmount,
      date: dateFormatted,
      pdfUrl: `/bills/${billNumber}.pdf`,
      items: billInput.items.map((it) => ({
        product_id: it.product_id || 'SAR-00001',
        product_name: it.product_name,
        unit_price: it.unit_price,
        quantity: it.quantity,
        captured_image_url: it.captured_image_url,
      })),
    };

    setBills((prev) => [newBill, ...prev]);

    // Create matching Order
    const newOrder: StoreOrder = {
      id: orderId,
      customer_id: customerId,
      customer_name: billInput.customerName,
      customer_phone: billInput.customerPhone,
      total_price: totalAmount,
      status: 'CONFIRMED',
      status_label: 'In-Store Purchase Confirmed',
      date: dateFormatted,
      created_at: new Date().toISOString(),
      bill_number: billNumber,
      items: billInput.items.map((it) => ({
        id: it.product_id || 'SAR-00001',
        name: it.product_name,
        price: it.unit_price,
        quantity: it.quantity,
        image: it.captured_image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      })),
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Decrement inventory
    setProducts((prev) =>
      prev.map((p) => {
        const itemSold = billInput.items.find((it) => it.product_id === p.id);
        if (itemSold) {
          return {
            ...p,
            stock_quantity: Math.max(0, p.stock_quantity - itemSold.quantity),
          };
        }
        return p;
      })
    );

    // Update customer
    setCustomers((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.phone.trim() === billInput.customerPhone.trim() || c.name.toLowerCase() === billInput.customerName.toLowerCase()
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newTotalOrders = existing.total_orders + 1;
        const newTotalSpent = existing.total_spent + totalAmount;
        updated[existingIdx] = {
          ...existing,
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          aov: Math.round(newTotalSpent / newTotalOrders),
          days_inactive: 0,
          status: 'ACTIVE_RECENT',
          last_purchase_date: dateFormatted,
        };
        return updated;
      } else {
        const newCust: StoreCustomer = {
          id: customerId,
          name: billInput.customerName,
          phone: billInput.customerPhone,
          total_orders: 1,
          total_spent: totalAmount,
          aov: totalAmount,
          return_rate: '0%',
          preferred: billInput.items[0]?.product_name.toLowerCase().includes('suit') ? 'Suit' : 'Saree',
          days_inactive: 0,
          avg_interval: 30,
          status: 'ACTIVE_RECENT',
          last_purchase_date: dateFormatted,
        };
        return [newCust, ...prev];
      }
    });

    // Check AI Followup
    let followupGenerated = false;
    let suggestedFollowupMessage;
    if (billInput.items.length >= 2 || totalAmount >= 3000) {
      followupGenerated = true;
      suggestedFollowupMessage = `Hi ${billInput.customerName}, thank you for your purchase at Sareethi! We noticed you love festive sarees and suits. Keep an eye out for our new collection arriving next week!`;
      
      const newApproval: StoreApproval = {
        id: `APPR-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'CUSTOMER_FOLLOWUP',
        title: `Customer Re-engagement Suggested: ${billInput.customerName}`,
        risk: 'LOW',
        status: 'PENDING',
        date: 'Just now',
        payload: {
          customer_name: billInput.customerName,
          suggested_message: suggestedFollowupMessage,
        },
      };
      setApprovals((prev) => [newApproval, ...prev]);
    }

    return {
      billNumber,
      orderId,
      customerId,
      totalAmount,
      pdfUrl: newBill.pdfUrl,
      followupGenerated,
      suggestedFollowupMessage,
    };
  };

  const processReturn = async (returnInput: {
    billNumber: string;
    customerName: string;
    selectedItems: string[];
    reason: string;
    refundAmount: number;
  }) => {
    const returnId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReturn: StoreReturn = {
      id: returnId,
      bill: returnInput.billNumber,
      customer: returnInput.customerName,
      amount: returnInput.refundAmount,
      reason: returnInput.reason,
      time: 'Just now',
      items: returnInput.selectedItems,
    };

    setReturns((prev) => [newReturn, ...prev]);

    // Restock returned items
    setProducts((prev) =>
      prev.map((p) => {
        if (returnInput.selectedItems.includes(p.id)) {
          return {
            ...p,
            stock_quantity: p.stock_quantity + 1,
          };
        }
        return p;
      })
    );

    return { success: true, returnId };
  };

  const processApproval = async (
    id: string,
    decision: 'APPROVED' | 'EDITED' | 'REJECTED'
  ) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: decision } : a)).filter((a) => a.id !== id)
    );
    return { success: true };
  };

  const addDelayException = async (exceptionInput: {
    orderId: string;
    customerName: string;
    delayHours: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestedMessage: string;
  }) => {
    const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApproval: StoreApproval = {
      id: approvalId,
      type: 'DELAY_ACTION',
      title: `Delayed Order ${exceptionInput.orderId} Exception Response Draft`,
      risk: exceptionInput.severity,
      status: 'PENDING',
      date: 'Just now',
      payload: {
        order_id: exceptionInput.orderId,
        customer_name: exceptionInput.customerName,
        delay_hours: exceptionInput.delayHours,
        suggested_message: exceptionInput.suggestedMessage,
      },
    };

    setApprovals((prev) => [newApproval, ...prev]);

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === exceptionInput.orderId
          ? {
              ...o,
              status: 'IN_TRANSIT',
              status_label: `Delayed by ${exceptionInput.delayHours}h (Exception Logged)`,
            }
          : o
      )
    );

    return { success: true, approvalId };
  };

  return (
    <StoreDataContext.Provider
      value={{
        products,
        orders,
        customers,
        bills,
        returns,
        approvals,
        isLoaded,
        placeOrder,
        updateProduct,
        deleteProduct,
        createBill,
        processReturn,
        processApproval,
        addDelayException,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
}
