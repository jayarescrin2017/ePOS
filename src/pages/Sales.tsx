import { 
  Download, 
  Calendar, 
  ArrowUpRight, 
  History,
  WifiOff
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api, Sale } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';
import { printReceipt } from '../lib/printReceipt';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const data = await api.getSales();
    setSales(data.reverse()); // Show newest first
  };

  const exportLedger = () => {
    const csvContent = [
      ["ID", "Timestamp", "Total", "Payment Method", "Items"],
      ...sales.map(s => [
        `L_${s.id?.toString().padStart(4, '0')}`,
        s.timestamp,
        s.totalAmount,
        s.paymentMethod,
        `"${s.items.map(i => `${i.quantity}x ${i.name}`).join(' | ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ledger_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto h-full flex flex-col pointer-events-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase leading-none">Local Transaction log</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Audit trail for standalone station REG-01</p>
        </div>
        <button 
          onClick={exportLedger}
          className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={14} />
          Export Ledger
        </button>
      </div>

      <div className="grid gap-2 overflow-auto flex-1 h-0 pr-1 custom-scrollbar">
        {sales.length > 0 ? (
          sales.map((sale) => (
            <div key={sale.id} className="bg-white border border-gray-300 rounded shadow-sm hover:border-orange-500 transition-colors group">
              <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                    <History size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-black text-gray-900 font-mono">{formatCurrency(sale.totalAmount)}</span>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em]",
                        sale.paymentMethod === 'card' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      )}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold font-mono uppercase">
                      <Calendar size={10} />
                      {sale.timestamp?.toLocaleString() || 'UNK_TIME'}
                    </div>
                  </div>
                </div>

                <div className="flex-1 md:px-4 flex flex-nowrap overflow-x-auto gap-1">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500 uppercase">
                      {item.quantity}× {item.name.split(' ')[0]}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-gray-400">ID:L_{sale.id?.toString().padStart(4, '0')}</span>
                  <button 
                    onClick={() => printReceipt(sale)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-black"
                  >
                    REPRINT
                    <ArrowUpRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-300 rounded p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
            <WifiOff size={32} className="mx-auto mb-4 opacity-20" />
            No offline transactions detected.
          </div>
        )}
      </div>
    </div>
  );
}
