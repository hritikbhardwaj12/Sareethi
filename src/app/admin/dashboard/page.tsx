'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useStoreData } from '@/context/StoreDataContext';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, orders, customers, returns, approvals } = useStoreData();
  const [graphTab, setGraphTab] = useState<'today' | 'monthly' | 'yearly'>('today');

  // Compute Live Metrics
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, it) => iSum + (it.quantity || 1), 0),
    0
  );
  const totalReturns = returns.length;

  // Approximate profit calculation: selling_price - cost_price (or 40% margin)
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
              className="px-4 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 transition-colors shadow-md"
            >
              + Create New Bill
            </Link>
          </div>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Sales Total</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-600">Live synchronized</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Orders</span>
              <ShoppingBag className="w-4 h-4 text-purple-950" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
            <span className="text-[10px] text-gray-400 font-medium">In-store & Online</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Items Sold</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalItemsSold}</p>
            <span className="text-[10px] text-gray-400 font-medium">Sarees & Suits</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Returns</span>
              <RotateCcw className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalReturns}</p>
            <span className="text-[10px] text-amber-700 font-bold">{totalReturns} restocked</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Net Profit</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-700">₹{totalProfit.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold">{profitMarginPercent}% Margin</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Customers</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            <span className="text-[10px] text-gray-400 font-medium">Active database</span>
          </div>
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
                className={`px-3 py-1 rounded-md transition-all ${graphTab === 'today' ? 'bg-white text-purple-950 font-bold shadow-xs' : ''}`}
              >
                Today's
              </button>
              <button
                onClick={() => setGraphTab('monthly')}
                className={`px-3 py-1 rounded-md transition-all ${graphTab === 'monthly' ? 'bg-white text-purple-950 font-bold shadow-xs' : ''}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setGraphTab('yearly')}
                className={`px-3 py-1 rounded-md transition-all ${graphTab === 'yearly' ? 'bg-white text-purple-950 font-bold shadow-xs' : ''}`}
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

        {/* Recent Activity: Orders & Returns Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Feed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900">Recent Customer Orders</h3>
              <Link href="/orders" className="text-xs font-bold text-purple-950 hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
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
                    <span className="font-bold text-gray-900">₹{ord.total_price.toLocaleString()}</span>
                    <span className="block text-[10px] font-bold text-purple-950">{ord.status_label || ord.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Returns Feed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-gray-900">Recent Customer Returns</h3>
              <Link href="/admin/returns" className="text-xs font-bold text-purple-950 hover:underline">
                Manage Returns
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              {returns.length === 0 ? (
                <p className="text-gray-400 text-xs py-4 text-center">No returns processed yet.</p>
              ) : (
                returns.slice(0, 4).map((ret) => (
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

      <Footer />
    </div>
  );
}
