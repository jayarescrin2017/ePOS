import React, { useState, useEffect, useMemo } from 'react';
import { api, Sale } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    api.getSales().then(setSales);
  }, []);

  const chartData = useMemo(() => {
    // Basic day aggregation for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    return last7Days.map(date => ({
      name: date.slice(5),
      sales: sales.filter(s => s.timestamp.startsWith(date))
                  .reduce((sum, s) => sum + s.totalAmount, 0)
    }));
  }, [sales]);

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Business Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded"><DollarSign /></div>
            <h2 className="font-black text-xs uppercase tracking-widest text-gray-500">Total Revenue</h2>
          </div>
          <p className="text-3xl font-black font-mono text-gray-900">{formatCurrency(totalSales)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded"><BarChart3 /></div>
            <h2 className="font-black text-xs uppercase tracking-widest text-gray-500">Total Transactions</h2>
          </div>
          <p className="text-3xl font-black font-mono text-gray-900">{sales.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-black text-xs uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
          <TrendingUp size={16} /> Sales Trend (7 Days)
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => formatCurrency(val)} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Area type="monotone" dataKey="sales" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
