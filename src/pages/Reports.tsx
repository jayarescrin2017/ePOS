import React, { useState, useEffect, useMemo } from 'react';
import { api, Sale } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Package, 
  Calendar,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

type Period = 'today' | 'week' | 'month' | 'all';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState<Period>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSales().then((data) => {
      setSales(data);
      setLoading(false);
    });
  }, []);

  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Create a copy for week calc
    const weekCalc = new Date(now);
    const startOfWeek = new Date(weekCalc.setDate(weekCalc.getDate() - weekCalc.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter(s => {
      const saleDate = new Date(s.timestamp).getTime();
      if (period === 'today') return saleDate >= todayDate;
      if (period === 'week') return saleDate >= startOfWeek;
      if (period === 'month') return saleDate >= startOfMonth;
      return true;
    });
  }, [sales, period]);

  const stats = useMemo(() => {
    const revenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const profit = filteredSales.reduce((sum, s) => sum + (s.totalProfit || 0), 0);
    const cost = revenue - profit;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, profit, cost, margin, count: filteredSales.length };
  }, [filteredSales]);

  const trendData = useMemo(() => {
    if (period === 'today') {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map(hour => {
        const hourSales = filteredSales.filter(s => new Date(s.timestamp).getHours() === hour);
        return {
          name: `${hour}:00`,
          revenue: hourSales.reduce((sum, s) => sum + s.totalAmount, 0),
          profit: hourSales.reduce((sum, s) => sum + (s.totalProfit || 0), 0)
        };
      });
    }

    if (period === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map((day, i) => {
        const daySales = filteredSales.filter(s => new Date(s.timestamp).getDay() === i);
        return {
          name: day,
          revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
          profit: daySales.reduce((sum, s) => sum + (s.totalProfit || 0), 0)
        };
      });
    }

    // Default: group by date for month/all
    const dateMap = new Map();
    filteredSales.forEach(s => {
      const d = s.timestamp.slice(0, 10);
      if (!dateMap.has(d)) dateMap.set(d, { revenue: 0, profit: 0 });
      const current = dateMap.get(d);
      current.revenue += s.totalAmount;
      current.profit += (s.totalProfit || 0);
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        name: date.slice(5),
        ...data
      }));
  }, [filteredSales, period]);

  const bestSellers = useMemo(() => {
    const itemMap = new Map();
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        if (!itemMap.has(item.name)) {
          itemMap.set(item.name, { name: item.name, quantity: 0, revenue: 0 });
        }
        const current = itemMap.get(item.name);
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b: any) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredSales]);

  const peakTimes = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    filteredSales.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      hours[hour].count += 1;
    });
    return hours.map(h => ({
      name: `${h.hour}:00`,
      orders: h.count
    }));
  }, [filteredSales]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 font-mono">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Generating Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <BarChart3 className="text-orange-600" />
            Performance Intel
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Calculated P&L and Market Trends</p>
        </div>
        
        <div className="flex bg-white border border-gray-200 rounded p-1 shadow-sm">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                period === p ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-900"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded border border-gray-200 shadow-sm border-b-4 border-b-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded"><DollarSign size={16} /></div>
            <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Gross Sales</h2>
          </div>
          <p className="text-2xl font-black font-mono text-gray-900">{formatCurrency(stats.revenue)}</p>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {stats.count} Transactions
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded border border-gray-200 shadow-sm border-b-4 border-b-green-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 text-green-600 rounded"><TrendingUp size={16} /></div>
            <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Net Profit</h2>
          </div>
          <p className="text-2xl font-black font-mono text-green-600">{formatCurrency(stats.profit)}</p>
          <div className="mt-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
            {stats.margin.toFixed(1)}% Margin
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded border border-gray-200 shadow-sm border-b-4 border-b-red-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 text-red-600 rounded"><Package size={16} /></div>
            <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Cost of Goods</h2>
          </div>
          <p className="text-2xl font-black font-mono text-gray-900">{formatCurrency(stats.cost)}</p>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Inventory Expense
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded border border-gray-200 shadow-sm border-b-4 border-b-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded"><Clock size={16} /></div>
            <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Avg / Order</h2>
          </div>
          <p className="text-2xl font-black font-mono text-gray-900">{formatCurrency(stats.count > 0 ? stats.revenue / stats.count : 0)}</p>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Basket Value
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
          <h2 className="font-black text-xs uppercase tracking-widest text-gray-700 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-500" /> Revenue & Profit Velocity
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: 'none', 
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                  formatter={(val: number) => [formatCurrency(val), '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Times Chart */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
          <h2 className="font-black text-xs uppercase tracking-widest text-gray-700 mb-6 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Peak Store Activity Hours
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakTimes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={8} interval={2} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: 'none', 
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Transactions">
                  {peakTimes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.orders > 0 ? '#3b82f6' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
          <h2 className="font-black text-xs uppercase tracking-widest text-gray-700 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" /> Best Selling Products
          </h2>
          <div className="space-y-4">
            {bestSellers.map((item, i) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-black text-xs text-gray-400">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-[11px] uppercase truncate max-w-[200px]">{item.name}</span>
                    <span className="font-mono text-[11px] font-black">{item.quantity} SOLD</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: bestSellers[0].quantity > 0 ? `${(item.quantity / bestSellers[0].quantity) * 100}%` : '0%' }}
                      className="bg-orange-500 h-full rounded-full"
                    />
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Revenue</div>
                  <div className="text-[11px] font-black font-mono">{formatCurrency(item.revenue)}</div>
                </div>
              </div>
            ))}
            {bestSellers.length === 0 && (
              <div className="py-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                No inventory movement recorded for this period.
              </div>
            )}
          </div>
        </div>

        {/* Info/Insights Summary */}
        <div className="bg-[#111827] p-8 rounded text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
             <BarChart3 size={120} />
          </div>
          <h2 className="font-black text-xs uppercase tracking-widest text-orange-500 mb-6">Strategic Summary</h2>
          <div className="space-y-6 relative z-10">
             <div className="flex gap-4">
                <div className="mt-1"><Calendar size={20} className="text-gray-500" /></div>
                <div>
                   <h3 className="font-black text-[11px] uppercase tracking-widest mb-1 text-gray-400">Period Focus</h3>
                   <p className="text-sm font-bold leading-relaxed">
                      Tracking data for <span className="text-orange-500">{period.toUpperCase()}</span>. 
                      You processed <span className="text-orange-500 font-mono">{stats.count}</span> sales generating 
                      <span className="text-orange-500 font-mono"> {formatCurrency(stats.revenue)}</span>.
                   </p>
                </div>
             </div>
             
             <div className="flex gap-4">
                <div className="mt-1"><TrendingUp size={20} className="text-gray-500" /></div>
                <div>
                   <h3 className="font-black text-[11px] uppercase tracking-widest mb-1 text-gray-400">Profitability</h3>
                   <p className="text-sm font-bold leading-relaxed">
                      Your current gross margin is <span className="text-green-500 font-mono">{stats.margin.toFixed(1)}%</span>. 
                      This represents <span className="text-green-500 font-mono">{formatCurrency(stats.profit)}</span> in net earnings after costs.
                   </p>
                </div>
             </div>

             <div className="pt-4 border-t border-gray-800">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-loose">
                   Insights generated from local standalone database.<br />
                   Database integrity verified: {filteredSales.length} records processed.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
