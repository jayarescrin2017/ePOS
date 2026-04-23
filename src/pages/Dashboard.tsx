import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  ClipboardList,
  WifiOff
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import React, { useState, useEffect, useMemo } from 'react';
import { api, Sale, Product } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [salesData, productsData] = await Promise.all([
      api.getSales(),
      api.getProducts()
    ]);
    setSales(salesData);
    setProducts(productsData);
  };

  const stats = useMemo(() => {
    let totalSales = 0;
    sales.forEach(s => totalSales += s.totalAmount);
    
    let lowStockItems = 0;
    products.forEach(p => {
      if (p.stockQuantity <= 5) lowStockItems++;
    });

    return {
      totalSales,
      totalTransactions: sales.length,
      lowStockItems,
      efficiency: 98.4
    };
  }, [sales, products]);

  const recentSales = useMemo(() => {
    return [...sales].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }, [sales]);

  const chartData = [
    { name: 'MON', sales: 4000 },
    { name: 'TUE', sales: 3000 },
    { name: 'WED', sales: 2000 },
    { name: 'THU', sales: 2780 },
    { name: 'FRI', sales: 1890 },
    { name: 'SAT', sales: 2390 },
    { name: 'SUN', sales: 3490 },
  ];

  const operatorRole = localStorage.getItem('operator_role');

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 pointer-events-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-orange-600"></div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase leading-none">Standalone Command</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Local Telemetry & Database Status</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-[9px] font-black text-gray-400 uppercase tracking-widest">
          <WifiOff size={10} className="text-red-500" />
          No Network Connection Required
        </div>
      </div>

      {operatorRole === 'admin' && products.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border-2 border-orange-200 p-4 rounded flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shrink-0">
              <ClipboardList size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-orange-900">System Setup Required</h4>
              <p className="text-[10px] font-bold text-orange-700 uppercase tracking-tighter">Your inventory is empty. Launch the setup guide to configure your store.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href="/USER_GUIDE.md" 
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-orange-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-sm"
            >
              Read Setup Guide
            </a>
            <button 
              onClick={() => window.location.href = '/inventory'}
              className="px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-sm"
            >
              Start Inventory
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={DollarSign} 
          label="Local Gross" 
          value={formatCurrency(stats.totalSales)} 
          trend="Session" 
          positive 
        />
        <StatCard 
          icon={ClipboardList} 
          label="Txn Log" 
          value={stats.totalTransactions.toString()} 
          trend="Local" 
          positive 
        />
        <StatCard 
          icon={Package} 
          label="Risk Alert" 
          value={stats.lowStockItems.toString()} 
          trend={stats.lowStockItems > 3 ? "URGENT" : "STABLE"} 
          positive={stats.lowStockItems === 0} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Unit Health" 
          value={`${stats.efficiency}%`} 
          trend="NOMINAL" 
          positive 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-300 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">Historical Sales Data</h3>
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Local Records Only</div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#9CA3AF' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#9CA3AF' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '4px', 
                    border: '1px solid #D1D5DB', 
                    boxShadow: 'none',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#f97316" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 text-white rounded p-4 shadow-xl flex flex-col min-h-[300px]">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
            Local Transaction Stream
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-3 group border-b border-gray-700 pb-2">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-colors flex-shrink-0">
                  <DollarSign size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase truncate group-hover:text-orange-400 transition-colors">
                    {sale.items[0]?.name}
                  </p>
                  <p className="text-[8px] font-mono text-gray-500 tracking-tighter uppercase">
                    ID:L_{sale.id?.toString().padStart(4, '0')} • {sale.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black font-mono text-orange-400">{formatCurrency(sale.totalAmount)}</p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-50">
                <WifiOff size={24} />
                <p className="text-[9px] font-black uppercase tracking-widest">No local sales yet</p>
              </div>
            )}
          </div>
          <p className="mt-4 text-[8px] font-mono text-gray-500 uppercase text-center tracking-widest border-t border-gray-700 pt-2">Local Storage Head</p>
        </div>
      </div>
    </div>
  );
}

import { useMemo as useMemoDashboard } from 'react';

function StatCard({ icon: Icon, label, value, trend, positive }: any) {
  return (
    <div className="bg-white border border-gray-300 p-4 rounded shadow-sm hover:border-orange-500 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 relative z-10 transition-transform group-hover:-translate-y-0.5">
        <div className="p-1.5 bg-gray-50 rounded border border-gray-200 group-hover:bg-gray-800 group-hover:text-white transition-colors">
          <Icon size={14} />
        </div>
        <div className={cn(
          "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
          positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <h4 className="text-xl font-black text-gray-900 tracking-tighter font-mono">{value}</h4>
      </div>
      <div className="absolute -bottom-2 -right-2 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <Icon size={64} strokeWidth={1} />
      </div>
    </div>
  );
}
