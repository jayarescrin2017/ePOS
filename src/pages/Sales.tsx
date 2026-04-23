import { 
  Download, 
  Calendar, 
  ArrowUpRight, 
  History,
  WifiOff,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { api, Sale } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';
import { printReceipt } from '../lib/printReceipt';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const data = await api.getSales();
    setSales(data.reverse()); // Show newest first
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const q = searchQuery.toLowerCase();
      const receiptId = `L_${s.id?.toString().padStart(4, '0')}`.toLowerCase();
      const itemsMatch = s.items.some(i => i.name.toLowerCase().includes(q));
      return receiptId.includes(q) || itemsMatch || s.paymentMethod.toLowerCase().includes(q);
    });
  }, [sales, searchQuery]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase leading-none">Local Transaction log</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Audit trail for standalone station REG-01</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search receipt, items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded text-xs font-black uppercase tracking-widest outline-none focus:border-orange-500 w-full md:w-64"
            />
          </div>
          <button 
            onClick={exportLedger}
            className="flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm h-full whitespace-nowrap"
          >
            <Download size={14} />
            Export Ledger
          </button>
        </div>
      </div>

      <div className="grid gap-3 overflow-auto flex-1 custom-scrollbar pb-4">
        {paginatedSales.length > 0 ? (
          paginatedSales.map((sale) => (
            <div key={sale.id} className="bg-white border border-gray-300 rounded shadow-sm hover:border-orange-500 transition-colors group">
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                    <History size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 border-b border-gray-100 pb-1">
                      <span className="text-base font-black text-gray-900 font-mono">{formatCurrency(sale.totalAmount)}</span>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-[0.1em]",
                        sale.paymentMethod === 'card' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {sale.paymentMethod}
                      </span>
                      {sale.paymentMethod === 'card' && sale.transactionReference && (
                        <span className="text-[9px] font-bold text-blue-400 font-mono uppercase border border-blue-200 px-1.5 py-0.5 rounded bg-blue-50">
                          Ref: {sale.transactionReference}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-gray-400 font-bold font-mono uppercase tracking-widest flex items-center gap-1">
                         NET PROFIT: 
                         <span className={cn("text-xs", (sale.totalProfit || 0) > 0 ? "text-green-600" : "text-red-500")}>
                           {formatCurrency(sale.totalProfit || 0)}
                         </span>
                       </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold font-mono uppercase mt-1">
                      <Calendar size={12} />
                      {new Date(sale.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex-1 md:px-6 flex flex-wrap gap-1.5">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 px-2 py-1 rounded text-[10px] font-bold text-gray-500 uppercase">
                      {item.quantity}× {item.name.substring(0, 15)}{item.name.length > 15 ? '...' : ''}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <span className="text-[10px] font-mono text-gray-400 font-bold">ID:L_{sale.id?.toString().padStart(4, '0')}</span>
                  <button 
                    onClick={() => printReceipt(sale)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    REPRINT
                    <ArrowUpRight size={12} />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-300 pt-4 mt-2">
          <div className="text-[10px] uppercase font-black tracking-widest text-gray-500">
            Page {currentPage} of {Math.max(1, totalPages)} <span className="mx-2">|</span> Total Results: {filteredSales.length}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="flex items-center justify-center p-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:grayscale transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center justify-center p-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:grayscale transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
