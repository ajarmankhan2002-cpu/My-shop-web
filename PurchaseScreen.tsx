
import React, { useState, useEffect } from 'react';
import { Search, Truck, Package, PlusCircle, Calendar, CreditCard, History, Tag, X, Check, Plus, Minus, Calculator } from 'lucide-react';
import { TRANSLATIONS, Product, Purchase } from '../types';

interface PurchaseProps {
  store: any;
}

interface CartItem {
  product: Product;
  qty: number;
  cost: number;
  batchNumber: string;
  expiryDate: string;
}

const PurchaseScreen: React.FC<PurchaseProps> = ({ store }) => {
  const { state, recordPurchase, addProduct } = store;
  const t = TRANSLATIONS[state.language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplier, setSupplier] = useState('');

  // Entry Form state
  const [entryQty, setEntryQty] = useState<number>(0);
  const [unitBuyPrice, setUnitBuyPrice] = useState<number>(0);
  const [totalBatchCost, setTotalBatchCost] = useState<number>(0);
  const [entryBatch, setEntryBatch] = useState('');
  const [entryExpiry, setEntryExpiry] = useState('');

  // Auto-calculation logic
  useEffect(() => {
    if (entryQty > 0 && unitBuyPrice > 0) {
      setTotalBatchCost(entryQty * unitBuyPrice);
    }
  }, [entryQty, unitBuyPrice]);

  const handleTotalCostChange = (val: number) => {
    setTotalBatchCost(val);
    if (entryQty > 0) {
      setUnitBuyPrice(Number((val / entryQty).toFixed(2)));
    }
  };

  // Add New Product Form state
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', batchNumber: '', buyPrice: 0, sellPrice: 0, stock: 0, expiryDate: '', lowStockThreshold: 10
  });

  const filteredProducts = state.products.filter((p: Product) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = () => {
    if (!selectedProduct || entryQty <= 0 || totalBatchCost <= 0) return;
    
    const newItem: CartItem = {
      product: selectedProduct,
      qty: entryQty,
      cost: totalBatchCost,
      batchNumber: entryBatch || selectedProduct.batchNumber,
      expiryDate: entryExpiry || selectedProduct.expiryDate
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setEntryQty(0);
    setUnitBuyPrice(0);
    setTotalBatchCost(0);
    setEntryBatch('');
    setEntryExpiry('');
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !supplier) return;
    
    cart.forEach(item => {
      // Logic inside recordPurchase handles updating the existing name's stock
      recordPurchase(item.product.id, item.qty, item.cost, supplier, item.batchNumber, item.expiryDate);
    });

    setCart([]);
    setShowCheckout(false);
    setSearchTerm('');
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addProduct(newProduct);
    setSelectedProduct(created);
    setUnitBuyPrice(created.buyPrice);
    setEntryBatch(created.batchNumber);
    setEntryExpiry(created.expiryDate);
    setShowAddModal(false);
    setNewProduct({
      name: '', category: '', batchNumber: '', buyPrice: 0, sellPrice: 0, stock: 0, expiryDate: '', lowStockThreshold: 10
    });
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-black">{t.purchase} (Croy)</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-slate-100"
        >
          <PlusCircle size={14} /> New Item
        </button>
      </div>

      {/* Main Selection Area */}
      <section className="no-print">
        {!selectedProduct ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t.search} 
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select an item to increase its stock:</p>

            <div className="space-y-3">
              {filteredProducts.map((p: Product) => (
                <div 
                  key={p.id} 
                  onClick={() => {
                    setSelectedProduct(p);
                    setUnitBuyPrice(p.buyPrice);
                    setEntryBatch(p.batchNumber);
                    setEntryExpiry(p.expiryDate);
                  }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all hover:border-teal-100"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Package size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-black leading-tight">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Existing: {p.stock} Units • Batch: {p.batchNumber}</p>
                     </div>
                  </div>
                  <div className="bg-teal-50 p-2 rounded-xl">
                     <PlusCircle className="text-teal-600" size={20} />
                  </div>
                </div>
              ))}
              {searchTerm && filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium mb-4">Item not in stock list</p>
                  <button 
                    onClick={() => {
                      setNewProduct({...newProduct, name: searchTerm});
                      setShowAddModal(true);
                    }}
                    className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-50"
                  >
                    Add "{searchTerm}" to List
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-50 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-3 rounded-2xl">
                  <Truck className="text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg leading-tight">{selectedProduct.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Update Existing Stock</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 text-slate-300 hover:bg-slate-50 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Adding {t.quantity}</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-2xl font-black text-black focus:ring-2 focus:ring-teal-500/10" 
                  value={entryQty || ''} 
                  onChange={e => setEntryQty(Number(e.target.value))} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">New Unit Price (৳)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-xl font-black text-black" 
                    value={unitBuyPrice || ''} 
                    onChange={e => setUnitBuyPrice(Number(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Total Cost (৳)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full bg-red-50 border-0 rounded-2xl p-4 text-xl font-black text-red-600" 
                    value={totalBatchCost || ''} 
                    onChange={e => handleTotalCostChange(Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Batch Update #</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-0 rounded-xl p-3 text-xs font-bold text-slate-700" 
                    value={entryBatch} 
                    onChange={e => setEntryBatch(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Expiry Update</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-0 rounded-xl p-3 text-xs font-bold text-slate-700" 
                    value={entryExpiry} 
                    onChange={e => setEntryExpiry(e.target.value)} 
                  />
                </div>
              </div>
              
              <button 
                onClick={addToCart}
                disabled={entryQty <= 0 || totalBatchCost <= 0}
                className="w-full py-4 mt-2 font-black text-white bg-teal-600 rounded-2xl shadow-xl shadow-teal-50 uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-50"
              >
                Confirm Quantity Increase
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Cart Indicator / Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-slate-900 p-5 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">{cart.length} Items</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update List</span>
             </div>
             <div className="text-right">
                <span className="text-[10px] text-slate-500 font-black mr-2 uppercase">TOTAL:</span>
                <span className="text-xl font-black text-white">৳{cartTotal.toLocaleString()}</span>
             </div>
          </div>
          <button 
            onClick={() => setShowCheckout(true)}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check size={18} /> Update Stock Levels
          </button>
        </div>
      )}

      {/* History Section */}
      {!selectedProduct && cart.length === 0 && (
        <section className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg"><History size={16} className="text-slate-600" /></div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Change Log</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            {state.purchases.length > 0 ? (
              state.purchases.slice(0, 15).map((pur: Purchase) => (
                <div key={pur.id} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm transition-all hover:border-teal-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Package className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-black leading-tight">{pur.productName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{pur.supplier}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-teal-600">+{pur.quantity} Units</p>
                      <p className="text-[10px] font-black text-red-500">৳{pur.cost.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1"><Tag size={10} /> {pur.batchNumber}</span>
                     <span className="flex items-center gap-1"><Calendar size={10} /> Exp: {pur.expiryDate}</span>
                     <span className="text-slate-300">{new Date(pur.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-100">
                <Truck size={32} className="mx-auto mb-3 text-slate-200" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No entries found</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-3xl p-7 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-black uppercase tracking-tight">Purchase Confirmation</h3>
                 <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={20} className="text-slate-300" /></button>
              </div>

              <div className="space-y-5">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Supplier / Vendor Name</label>
                    <div className="relative">
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Pharma Ltd."
                        className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 text-sm font-bold text-black focus:ring-2 focus:ring-teal-500/10"
                        value={supplier}
                        onChange={e => setSupplier(e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="bg-slate-50 p-5 rounded-2xl max-h-48 overflow-y-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Tag size={12} /> Stock Update Preview
                    </p>
                    <div className="space-y-3">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
                           <div className="max-w-[70%]">
                              <p className="text-xs font-black text-black leading-tight truncate">{item.product.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Adding {item.qty} units</p>
                           </div>
                           <span className="text-xs font-black text-red-600">৳{item.cost}</span>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 py-4 text-[10px] font-black text-slate-500 bg-slate-50 rounded-2xl uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleCheckout}
                      disabled={!supplier}
                      className="flex-[2] py-4 text-[10px] font-black text-white bg-teal-600 rounded-2xl shadow-xl shadow-teal-50 uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
                    >
                      Update Stock
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-black uppercase tracking-tight">New Inventory Item</h3>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={20} className="text-slate-300" /></button>
            </div>
            <form onSubmit={handleAddNewProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Item Name</label>
                <input required type="text" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                  <input required type="text" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Batch #</label>
                  <input required type="text" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black" value={newProduct.batchNumber} onChange={e => setNewProduct({...newProduct, batchNumber: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Default Buy</label>
                  <input required type="number" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black" value={newProduct.buyPrice || ''} onChange={e => setNewProduct({...newProduct, buyPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Default Sell</label>
                  <input required type="number" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black" value={newProduct.sellPrice || ''} onChange={e => setNewProduct({...newProduct, sellPrice: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Initial Expiry</label>
                <input required type="date" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black" value={newProduct.expiryDate} onChange={e => setNewProduct({...newProduct, expiryDate: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-[2] py-4 text-[10px] font-black text-white bg-slate-900 rounded-2xl shadow-xl uppercase tracking-widest active:scale-95 transition-all">Create & Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseScreen;
