import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, Product } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';
import { ConfirmationModal } from '../components/ConfirmationModal';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Confirmation Modal states
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await api.getProducts();
    setProducts(data);
  };
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    unit: 'pcs'
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        unit: product.unit
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        name: '',
        category: '',
        price: '',
        stockQuantity: '',
        unit: 'pcs'
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await api.deleteProduct(id);
    loadProducts();
    setDeleteId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingSubmit(true);
  };

  const confirmSubmit = async () => {
    const productData = {
      sku: formData.sku,
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      unit: formData.unit as any
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id!, productData);
    } else {
      await api.addProduct(productData);
    }
    loadProducts();
    setIsModalOpen(false);
    setPendingSubmit(false);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto h-full flex flex-col pointer-events-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase">Master Inventory (Local)</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Standalone CSV Database & Stock Levels</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all high-density-shadow active:translate-y-0.5"
        >
          <Plus size={16} />
          New Product (F9)
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search catalog by SKU, name, or category..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold uppercase outline-none placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-[10px] font-mono text-gray-400 font-bold uppercase">Total: {filteredProducts.length} items</div>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-[0.2em]">
                <th className="px-4 py-2 border-r border-gray-700">SKU/Barcode</th>
                <th className="px-4 py-2 border-r border-gray-700">Product Description</th>
                <th className="px-4 py-2 border-r border-gray-700">Cat</th>
                <th className="px-4 py-2 border-r border-gray-700 text-center">Stock</th>
                <th className="px-4 py-2 border-r border-gray-700 text-right">Unit Price</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-orange-50 transition-colors group">
                    <td className="px-4 py-2 font-bold text-gray-500 border-r border-gray-100">{product.sku}</td>
                    <td className="px-4 py-2 font-black text-gray-900 border-r border-gray-100 uppercase truncate max-w-[200px]">{product.name}</td>
                    <td className="px-4 py-2 border-r border-gray-100">
                      <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">
                        {product.category || 'DEF'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-r border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={cn(
                          "font-black",
                          product.stockQuantity <= 5 ? "text-red-600" : "text-gray-900"
                        )}>
                          {product.stockQuantity}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">{product.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-black text-orange-600 text-right border-r border-gray-100">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(product)}
                          className="p-1 hover:text-orange-600 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => product.id && setDeleteId(product.id)}
                          className="p-1 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">
                    Local database is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative bg-white rounded shadow-2xl w-full max-w-sm overflow-hidden border border-gray-300"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest">
                  {editingProduct ? 'Update Local SKU' : 'New Local SKU'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">SKU / Barcode</label>
                    <input 
                      required
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-[11px] focus:border-orange-500 outline-none"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-bold text-[11px] uppercase focus:border-orange-500 outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <input 
                    required
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-black text-[11px] uppercase focus:border-orange-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Unit Price ($)</label>
                    <input 
                      required type="number" step="0.01"
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-xs font-bold focus:border-orange-500 outline-none"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">UOM</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-bold text-[11px] uppercase focus:border-orange-500 outline-none appearance-none"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value as any})}
                    >
                      <option value="pcs">EACH (PCS)</option>
                      <option value="kg">KILO (KG)</option>
                      <option value="m">METER (M)</option>
                      <option value="set">SET</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Stock On Hand</label>
                  <input 
                    required type="number"
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-xs font-bold focus:border-orange-500 outline-none"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    Commit DB
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={pendingSubmit}
        onClose={() => setPendingSubmit(false)}
        onConfirm={confirmSubmit}
        title={editingProduct ? "Update Product" : "Add Product"}
        message={`Are you sure you want to ${editingProduct ? 'save changes' : 'add this new product'} to the inventory?`}
        confirmLabel="Save"
      />
    </div>
  );
}
