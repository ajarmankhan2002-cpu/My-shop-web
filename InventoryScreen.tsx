
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { TRANSLATIONS, Product } from './types';

interface InventoryProps { store: any; }

const InventoryScreen: React.FC<InventoryProps> = ({ store }) => {
  const { state, addProduct, updateProduct, deleteProduct } = store;
  const t = TRANSLATIONS[state.language];
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = state.products.filter((p: Product) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '', category: '', batchNumber: '', unit: 'Pcs', buyPrice: 0, sellPrice: 0, stock: 0, expiryDate: '', lowStockThreshold: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...formData, id: editingProduct.id });
      setEditingProduct(null);
    } else {
      addProduct(formData);
    }
    setIsAdding(false);
    setFormData({ name: '', category: '', batchNumber: '', unit: 'Pcs', buyPrice: 0, sellPrice: 0, stock: 0, expiryDate: '', lowStockThreshold: 10 });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-black">{t.inventory}</h2>
        <button onClick={() => { setIsAdding(true); setEditingProduct(null); }} className="bg-teal-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform"><Plus size={24} /></button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder={t.search} className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-black focus:ring-2 focus:ring-teal-500/20 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="space-y-3 pb-24">
        {filteredProducts.map((p: Product) => (
          <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-black">{p.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black">{p.category} • {p.unit}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingProduct(p); setFormData(p); setIsAdding(true); }} className="p-2 bg-slate-50 rounded-lg text-slate-400 active:scale-90"><Edit2 size={16} /></button>
                <button onClick={() => confirm('Delete?') && deleteProduct(p.id)} className="p-2 bg-red-50 rounded-lg text-red-400 active:scale-90"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-[9px] text-slate-400 uppercase font-bold">{t.stock}</p>
                <p className={`font-black text-sm ${p.stock <= p.lowStockThreshold ? 'text-amber-600' : 'text-black'}`}>{p.stock} <span className="text-[9px] opacity-40">{p.unit}</span></p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-[9px] text-slate-400 uppercase font-bold">{t.sellPrice}</p>
                <p className="font-black text-sm text-teal-600">৳{p.sellPrice}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-[9px] text-slate-400 uppercase font-bold">{t.expiry}</p>
                <p className={`font-black text-[10px] ${new Date(p.expiryDate) <= new Date() ? 'text-red-600' : 'text-black'}`}>{p.expiryDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-black">{editingProduct ? 'Edit Product' : t.addProduct}</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-300"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.productName}</label>
                <input required type="text" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.category}</label>
                  <input required type="text" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.unit}</label>
                  <select className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    <option value="Pcs">Pcs</option>
                    <option value="Strip">Strip</option>
                    <option value="Box">Box</option>
                    <option value="Bottle">Bottle</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.buyPrice}</label>
                  <input required type="number" step="any" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.sellPrice}</label>
                  <input required type="number" step="any" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.stock}</label>
                   <input required type="number" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.expiry}</label>
                   <input required type="date" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 mt-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">{t.save}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryScreen;
