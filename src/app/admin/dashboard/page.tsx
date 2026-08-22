'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useStoreData, StoreOrder, StoreCustomer } from '@/context/StoreDataContext';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  RotateCcw,
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowUpRight,
  ChevronRight,
  X,
  MapPin,
  Phone,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, orders, customers, returns, approvals } = useStoreData();
  const [graphTab, setGraphTab] = useState<'today' | 'monthly' | 'yearly'>('today');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<StoreCustomer | null>(null);

  // Compute Live Metrics
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, it) => iSum + (it.quantity || 1), 0),
    0
  );
  const totalReturns = returns.length;

  // Approximate profit calculation
  const totalProfit = orders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((iSum, it) => {
        const matchingProd = products.find((p) => p.id === it.id);
        const cost = matchingProd ? matchingProd.cost_price : Math.round(it.price * 0.55);
        return iSum + (it.price - cost) * (it.quantity || 1);
      }, 0)
    );
  }, 0);

  const profitMarginPercent = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '42.0';

  // Low Stock Items (Threshold <= 3)
  const lowStockItems = products
    .filter((p) => p.status !== 'DELETED' && p.stock_quantity <= 3)
    .slice(0, 4);

  // Top Selling Products
  const productSalesMap: Record<string, { name: string; sales: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      if (!productSalesMap[it.id]) {
        productSalesMap[it.id] = { name: it.name, sales: 0, revenue: 0 };
      }
      productSalesMap[it.id].sales += it.quantity || 1;
      productSalesMap[it.id].revenue += it.price * (it.quantity || 1);
    });
  });

  const topSellingList = Object.entries(productSalesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  // Pending Approvals
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING').slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Today's Business Overview</h1>
            <p className="text-xs text-gray-500 mt-1">Real-time metrics, live store telemetry, and operational intelligence</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/billing"
              className="px-4 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              + Create New Bill
            </Link>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Sales Total (Static Card - Link turned off) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Sales Total</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-600 block">Live synchronized</span>
          </div>

          {/* Orders (Clickable to Admin Orders Desk) */}
          <Link
            href="/admin/orders"
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2 hover:border-purple-950 hover:shadow-md transition-all group block cursor-pointer"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-purple-950">Orders</span>
              <ShoppingBag className="w-4 h-4 text-purple-950" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 font-medium">In-store & Online</span>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-purple-950" />
            </div>
          </Link>

          {/* Items Sold (Static Card - Link turned off) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Items Sold</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalItemsSold}</p>
            <span className="text-[10px] text-gray-400 font-medium block">Sarees & Suits</span>
          </div>

          {/* Returns */}
          <Link
            href="/admin/returns"
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2 hover:border-purple-950 hover:shadow-md transition-all group block cursor-pointer"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-purple-950">Returns</span>
              <RotateCcw className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalReturns}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-amber-700 font-bold">{totalReturns} restocked</span>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-purple-950" />
            </div>
          </Link>

          {/* Net Profit */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Net Profit</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-700">₹{totalProfit.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold block">{profitMarginPercent}% Margin</span>
          </div>

          {/* Customers */}
          <Link
            href="/admin/customers"
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2 hover:border-purple-950 hover:shadow-md transition-all group block cursor-pointer"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-purple-950">Customers</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 font-medium">Active database</span>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-purple-950" />
            </div>
          </Link>
        </div>

        {/* Sales Performance Graph */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">Sales Performance Curve</h2>
              <p className="text-xs text-gray-500">Visualizing gross revenue across time windows</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold text-gray-600">
              <button
                onClick={() => setGraphTab('today')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${graphTab === 'today' ? 'bg-white text-purple-950 font-bold shadow-xs' : ''}`}
              >
                Today's
              </button>
              <button
                onClick={() => setGraphTab('monthly')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${graphTab === 'monthly' ? 'bg-white text-purple-950 font-bold shadow-xs' : ''}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setGraphTab('yearly')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${graphTab === 'yearly' ? 'bg-white text-purple-950 font-bold shadow-xs' : ''}`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Graph Visual */}
          <div className="h-48 bg-gradient-to-t from-purple-50/50 to-white rounded-xl border border-purple-100 flex items-end justify-between p-4 gap-2">
            {[45, 65, 30, 85, 95, 60, 75, 100, 80, 90, 110, 120].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full bg-purple-950 rounded-t group-hover:bg-amber-400 transition-colors"
                />
                <span className="text-[9px] text-gray-400 font-mono">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Top Selling Products</h3>
            <div className="space-y-3 text-xs">
              {topSellingList.length === 0 ? (
                <p className="text-gray-400 text-xs">No sales recorded yet.</p>
              ) : (
                topSellingList.map((prod, idx) => (
                  <div key={prod.id} className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <div className="flex items-center gap-2 flex-1 pr-2">
                      <span className="font-bold font-mono text-purple-950 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">#{idx + 1}</span>
                      <span className="font-semibold text-gray-800 line-clamp-1">{prod.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-gray-900 block">₹{prod.revenue.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{prod.sales} sold</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Warnings
              </h3>
              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                {lowStockItems.length} items
              </span>
            </div>
            <div className="space-y-3 text-xs">
              {lowStockItems.length === 0 ? (
                <p className="text-emerald-700 text-xs font-semibold">All products adequately stocked!</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-amber-800 font-mono">{item.id}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-rose-600 text-sm">{item.stock_quantity} left</span>
                      <p className="text-[9px] text-gray-400">Min threshold: 3</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Worker System Status & Pending Approvals */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-950" /> AI Worker Status
              </h3>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Level 1/2 Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-purple-950">Pending Human Approvals</p>
                  <Link href="/admin/approvals" className="text-[11px] font-bold text-purple-950 underline">
                    View All
                  </Link>
                </div>
                <p className="text-gray-600 text-[11px]">
                  {pendingApprovals.length} AI recommendations awaiting owner approval
                </p>
                <div className="pt-2 space-y-1.5">
                  {pendingApprovals.length === 0 ? (
                    <p className="text-[11px] text-emerald-700 font-semibold bg-white p-2 rounded">
                      ✓ All pending items approved!
                    </p>
                  ) : (
                    pendingApprovals.map((appr) => (
                      <div key={appr.id} className="bg-white p-2 rounded border border-purple-100 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-gray-800 line-clamp-1 flex-1 pr-2">{appr.title}</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] shrink-0">
                          {appr.risk}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity: Orders, Customers, & Returns Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Feed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900">Orders ({orders.length})</h3>
              <Link href="/admin/orders" className="text-xs font-bold text-purple-950 hover:underline flex items-center gap-0.5">
                Open Orders Desk <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              {orders.length === 0 ? (
                <p className="text-gray-400 text-xs py-4 text-center">No orders placed yet.</p>
              ) : (
                orders.slice(0, 5).map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="flex items-center justify-between p-2.5 hover:bg-purple-50/50 rounded-lg transition-colors border border-gray-50 cursor-pointer"
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-950">{ord.id}</span>
                        <span className="font-semibold text-gray-900">{ord.customer_name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {ord.items.length} items • {ord.date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-gray-900 block">₹{ord.total_price.toLocaleString()}</span>
                      <span className="block text-[10px] font-bold text-purple-950">{ord.status_label || ord.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Profiles Preview */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900">Customers ({customers.length})</h3>
              <Link href="/admin/customers" className="text-xs font-bold text-purple-950 hover:underline flex items-center gap-0.5">
                Open Database <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              {customers.length === 0 ? (
                <p className="text-gray-400 text-xs py-4 text-center">No customers registered yet.</p>
              ) : (
                customers.slice(0, 5).map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="flex items-center justify-between p-2.5 hover:bg-purple-50/50 rounded-lg transition-colors border border-gray-50 cursor-pointer"
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-950 text-[10px] bg-purple-50 px-1.5 py-0.5 rounded">{cust.id}</span>
                        <span className="font-semibold text-gray-900">{cust.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Phone: {cust.phone} • {cust.total_orders} Orders
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-gray-900 block">₹{cust.total_spent.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{cust.preferred || 'Saree'}s</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Returns Feed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900">Returns Desk ({returns.length})</h3>
              <Link href="/admin/returns" className="text-xs font-bold text-purple-950 hover:underline flex items-center gap-0.5">
                Open Returns <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              {returns.length === 0 ? (
                <p className="text-gray-400 text-xs py-4 text-center">No returns processed yet.</p>
              ) : (
                returns.slice(0, 5).map((ret) => (
                  <div key={ret.id} className="p-2.5 bg-rose-50/40 rounded-lg border border-rose-100 space-y-1">
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>{ret.id} ({ret.customer})</span>
                      <span className="font-bold text-rose-700">₹{ret.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-600">Bill: {ret.bill} • Reason: {ret.reason}</p>
                    <p className="text-[10px] text-gray-400">{ret.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-950 uppercase font-mono">{selectedOrder.id}</span>
                <h3 className="font-serif text-xl font-bold text-gray-900">{selectedOrder.customer_name}</h3>
                <p className="text-xs text-gray-500">Placed: {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-purple-50/60 p-3 rounded-xl space-y-1 text-xs border border-purple-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold text-purple-950">{selectedOrder.status_label || selectedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Phone:</span>
                  <span className="font-bold text-gray-900">{selectedOrder.customer_phone}</span>
                </div>
                {selectedOrder.shipping_address && (
                  <div className="pt-1">
                    <span className="text-gray-600 block">Delivery Address:</span>
                    <span className="font-semibold text-gray-800">{selectedOrder.shipping_address}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs">Ordered Garments ({selectedOrder.items.length}):</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs border-b border-gray-100 pb-2 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded bg-gray-50" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity || 1} • ₹{item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-gray-900">₹{((item.quantity || 1) * item.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 text-gray-900">
                <span>Total Amount</span>
                <span>₹{selectedOrder.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-950 uppercase font-mono">{selectedCustomer.id}</span>
                <h3 className="font-serif text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-gray-500">Phone: {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Total Lifetime Orders</span>
                <span className="font-bold text-lg text-gray-900">{selectedCustomer.total_orders}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Lifetime Spend</span>
                <span className="font-bold text-lg text-purple-950">₹{selectedCustomer.total_spent.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Preferred Category</span>
                <span className="font-bold text-sm text-gray-900">{selectedCustomer.preferred || 'Saree'}s</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Return Rate</span>
                <span className="font-bold text-sm text-gray-900">{selectedCustomer.return_rate || '0%'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                href="/admin/customers"
                className="text-xs font-bold text-purple-950 underline hover:text-purple-800"
              >
                Open Full Customer Profile $\rightarrow$
              </Link>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
