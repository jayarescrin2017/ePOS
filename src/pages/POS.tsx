import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  CheckCircle2,
  DollarSign,
  Package,
  Barcode,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, Product as DbProduct } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';

interface CartItem extends DbProduct {
  quantity: number;
}

import { printReceipt } from '../lib/printReceipt';

export default function POS() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [lastSale, setLastSale] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await api.getProducts();
    setProducts(data);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const addToCart = (product: DbProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.12;
    return { subtotal, tax, total: subtotal + tax };
  }, [cart]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - totals.total);
  }, [cashReceived, totals.total, paymentMethod]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived) || 0;
      if (received < totals.total) {
        alert("Insufficient cash received.");
        return;
      }
    }

    setProcessing(true);

    try {
      const saleData: any = {
        timestamp: new Date().toISOString(),
        totalAmount: totals.total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined,
        change: paymentMethod === 'cash' ? changeAmount : undefined,
        items: cart.map(item => ({
          id: item.id!.toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }))
      };

      const result = await api.addSale(saleData);
      setLastSale({ ...result, timestamp: new Date(result.timestamp) });
      setSuccess(true);
      setCart([]);
      setCashReceived('');
      loadProducts(); // Refresh stock levels
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error instanceof Error ? error.message : "Checkout error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#E5E7EB]">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="SCAN BARCODE OR SEARCH TOOLS..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-black uppercase tracking-widest placeholder:text-gray-300 transition-all font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded font-black text-[10px] uppercase tracking-widest">
            <Barcode size={14} className="text-orange-500" />
            Scanner Active
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className={cn(
                  "flex flex-col text-left bg-white border border-gray-300 rounded overflow-hidden hover:border-orange-500 transition-all group",
                  product.stockQuantity <= 0 && "opacity-50 grayscale pointer-events-none"
                )}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100 p-4 relative overflow-hidden text-gray-200">
                   <Package size={48} strokeWidth={1} />
                   <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-gray-100 text-[8px] font-black uppercase text-gray-500 rounded border border-gray-200">
                     {product.category || 'GEN'}
                   </div>
                   {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                     <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-100 text-[8px] font-black uppercase text-red-600 rounded border border-red-200 animate-pulse">
                       Low Stock
                     </div>
                   )}
                </div>
                <div className="p-2 border-t border-gray-100">
                  <div className="text-[10px] font-mono text-gray-400 font-bold mb-0.5 uppercase tracking-tighter truncate">{product.sku}</div>
                  <div className="font-black text-[10px] text-gray-900 uppercase leading-none h-6 mb-2 line-clamp-2">{product.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-orange-600 font-mono">{formatCurrency(product.price)}</span>
                    <span className="text-[8px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                      {product.stockQuantity} {product.unit}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-[380px] bg-white border-l border-gray-300 flex flex-col shadow-2xl relative z-10">
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800">
            <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-orange-500">
              <ShoppingCart size={16} />
            </div>
            <h2 className="font-black text-xs uppercase tracking-widest leading-none">Transaction Cart</h2>
          </div>
          <span className="text-[10px] font-mono font-black bg-gray-200 px-2 py-1 rounded text-gray-600 uppercase">
            Items: {cart.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-gray-50/50">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-2 border border-gray-200 rounded shadow-sm group hover:border-orange-500 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 flex-shrink-0 group-hover:bg-gray-800 group-hover:text-orange-500 transition-colors">
                    <Package size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono text-gray-400 uppercase leading-none mb-1">{item.sku}</div>
                    <div className="font-black text-[10px] text-gray-900 uppercase leading-tight truncate mb-1">{item.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateQuantity(item.id!, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-500 rounded border border-gray-100"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-mono text-xs font-black min-w-[24px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id!, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-500 rounded border border-gray-100"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono font-black text-orange-600">{formatCurrency(item.price * item.quantity)}</div>
                        <button 
                          onClick={() => removeFromCart(item.id!)}
                          className="text-[8px] font-black text-gray-400 hover:text-red-600 uppercase tracking-widest mt-1"
                        >
                          Remove Line
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 py-20 pointer-events-none">
              <ShoppingCart size={48} strokeWidth={1} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center w-40">Cart is currently empty. Awaiting SKU entry.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-800 text-white shadow-2xl space-y-4">
          <div className="space-y-1 border-b border-gray-700 pb-4">
            <div className="flex justify-between text-[11px] font-mono text-gray-400">
              <span className="uppercase font-bold">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-gray-400">
              <span className="uppercase font-bold">Tax (VAT 12%)</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Grand Total</span>
              <span className="text-3xl font-black font-mono leading-none tracking-tighter text-white">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded border transition-all gap-1",
                paymentMethod === 'cash' 
                  ? "bg-orange-600 border-orange-400 text-white" 
                  : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-650"
              )}
            >
              <Banknote size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest font-mono">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded border transition-all gap-1",
                paymentMethod === 'card' 
                  ? "bg-orange-600 border-orange-400 text-white" 
                  : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-650"
              )}
            >
              <CreditCard size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest font-mono">Card</span>
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cash Received</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-6 pr-2 py-2 bg-gray-700 border border-gray-600 rounded text-xs font-black font-mono text-white outline-none focus:border-orange-500"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Change Due</label>
                <div className="w-full px-2 py-2 bg-gray-900 border border-gray-600 rounded text-xs font-black font-mono text-orange-400">
                  {formatCurrency(changeAmount)}
                </div>
              </div>
            </div>
          )}

          <button 
            disabled={cart.length === 0 || processing || (paymentMethod === 'cash' && (parseFloat(cashReceived) || 0) < totals.total)}
            onClick={handleCheckout}
            className="w-full py-4 bg-white text-gray-950 rounded font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl active:translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
          >
            {processing ? (
              <div className="w-5 h-5 border-4 border-gray-800 border-t-orange-500 rounded-full animate-spin" />
            ) : (
              <>
                <DollarSign size={18} />
                Finalize Order
              </>
            )}
          </button>
          <div className="pt-2 flex items-center justify-center gap-2 opacity-50 px-2 py-1 rounded bg-black/20">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[8px] font-mono font-bold uppercase text-gray-400">Offline Processing Mode Enabled</p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center max-w-xs w-full text-center border-b-8 border-orange-500"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-1">Success!</h2>
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                Order finalized and stock updated.
              </p>
              
              <div className="w-full space-y-2">
                <button 
                  onClick={() => {
                    if (lastSale) printReceipt(lastSale);
                  }}
                  className="w-full py-3 bg-orange-600 text-white rounded font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2 group"
                >
                  <Package size={16} className="group-active:scale-125 transition-transform" />
                  Print Receipt
                </button>
                <button 
                  onClick={() => setSuccess(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Done
                </button>
                <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-normal pt-2">
                  Tip: If printing doesn't open, try<br />opening the app in a new tab.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal ends here, we no longer need the inline hidden div */}
    </div>
  );
}
