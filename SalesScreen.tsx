
import React, { useState, useRef } from 'react';
import { Search, ShoppingCart, Minus, Plus, X, Check, Printer, FileImage, Loader2, User, Tag } from 'lucide-react';
import * as ReactToPrint from 'react-to-print';
import { toPng } from 'html-to-image';
import { TRANSLATIONS, Product, Sale, Credit, DEFAULT_LOGO } from '../types';

// Robustly handle the hook import from the bundled module
const useReactToPrint = (ReactToPrint as any).useReactToPrint || (ReactToPrint as any).default?.useReactToPrint;

interface SalesProps { store: any; }

const SalesScreen: React.FC<SalesProps> = ({ store }) => {
  const { state, recordCheckout } = store;
  const t = TRANSLATIONS[state.language];
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [lastSaleItems, setLastSaleItems] = useState<Sale[] | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Checkout form fields
  const [customerName, setCustomerName] = useState('Cash Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availableProducts = state.products.filter((p: Product) => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
    p.stock > 0
  );

  const selectedCustomer = state.credits.find((c: Credit) => 
    c.customerName.toLowerCase() === customerName.toLowerCase() || 
    (customerPhone && c.customerPhone === customerPhone)
  );

  const customerSuggestions = state.credits.filter((c: Credit) => 
    c.customerName.toLowerCase().includes(customerName.toLowerCase()) && 
    customerName.toLowerCase() !== 'cash customer'
  );

  const cartTotal = cart.reduce((acc, curr) => acc + (curr.product.sellPrice * curr.qty), 0);
  const netTotalAfterDiscount = Math.max(0, cartTotal - discount);
  const previousBalance = selectedCustomer ? selectedCustomer.totalDue : 0;

  const handleCheckout = (showInvoiceAfter: boolean) => {
    if (cart.length === 0) return;
    
    const records = recordCheckout(cart, paidAmount, discount, customerName, customerPhone);
    
    if (showInvoiceAfter && records && records.length > 0) {
      setLastSaleItems(records);
    } else {
      setLastSaleItems(null);
      setCart([]);
    }
    
    setShowCheckoutModal(false);
    // Reset fields
    setDiscount(0);
    setPaidAmount(0);
    setCustomerName('Cash Customer');
    setCustomerPhone('');
  };

  // PROFESSIONAL PRINTING
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_${lastSaleItems?.[0]?.id?.substring(0, 8)}`,
  });

  // SHARING AS IMAGE (FILE)
  const handleShareImage = async () => {
    if (!invoiceRef.current || !lastSaleItems) return;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: { padding: '20px', fontFamily: 'sans-serif' }
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Invoice_${lastSaleItems[0].id.substring(0, 8)}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Invoice from ${state.storeDetails.name}`,
            text: `Invoice for ${lastSaleItems[0].customerName}`,
          });
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') console.error("Share failed:", shareErr);
        }
      } else {
        const link = document.createElement('a');
        link.download = `Invoice_${lastSaleItems[0].id.substring(0, 8)}.png`;
        link.href = dataUrl; link.click();
      }
    } catch (err) {
      console.error(err);
      alert("Image generation failed.");
    } finally { setIsGeneratingImage(false); }
  };

  const invoiceGrossTotal = lastSaleItems?.reduce((acc, curr) => acc + (curr.quantity * curr.sellPrice), 0) || 0;
  const invoiceDiscount = lastSaleItems?.reduce((acc, curr) => acc + curr.discount, 0) || 0;
  const invoiceNetTotal = invoiceGrossTotal - invoiceDiscount;
  const invoicePrevBalance = lastSaleItems?.[0]?.previousBalance || 0;
  const invoicePaidToday = lastSaleItems?.reduce((acc, curr) => acc + curr.paidAmount, 0) || 0;
  const invoiceNewDue = (invoiceNetTotal + invoicePrevBalance) - invoicePaidToday;

  return (
    <div className="flex flex-col h-full space-y-4">
      <h2 className="text-xl font-bold text-black no-print">{t.sales}</h2>

      <div className="space-y-4 no-print">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t.search} 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 max-h-60 overflow-y-auto">
              {availableProducts.map((p: Product) => (
                <div 
                  key={p.id} 
                  onClick={() => { 
                    const existing = cart.find(c => c.product.id === p.id);
                    if (existing) {
                      if (existing.qty < p.stock) {
                        setCart(cart.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c));
                      }
                    } else {
                      setCart([...cart, { product: p, qty: 1 }]);
                    }
                    setSearchTerm(''); 
                  }}
                  className="p-3 border-b border-slate-50 flex justify-between items-center active:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <ShoppingCart size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Stock: {p.stock}</p>
                    </div>
                  </div>
                  <p className="font-black text-teal-600">৳{p.sellPrice}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-32 no-scrollbar">
          {cart.map((item) => (
            <div key={item.product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 className="font-black text-black text-sm">{item.product.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">৳{item.product.sellPrice}</p>
                  </div>
                </div>
                <button onClick={() => setCart(cart.filter(c => c.product.id !== item.product.id))} className="text-slate-200"><X size={18} /></button>
              </div>
              <div className="flex justify-between items-center pl-11">
                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg">
                  <button onClick={() => setCart(cart.map(c => c.product.id === item.product.id ? {...c, qty: Math.max(1, c.qty - 1)} : c))} className="p-1 bg-white shadow-sm rounded text-black"><Minus size={14} /></button>
                  <span className="font-black text-black w-6 text-center text-xs">{item.qty}</span>
                  <button onClick={() => setCart(cart.map(c => c.product.id === item.product.id ? {...c, qty: Math.min(item.product.stock, c.qty + 1)} : c))} className="p-1 bg-white shadow-sm rounded text-black"><Plus size={14} /></button>
                </div>
                <p className="font-black text-teal-600">৳{item.product.sellPrice * item.qty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROFESSIONAL INVOICE DISPLAY */}
      {lastSaleItems && lastSaleItems.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm overflow-y-auto print-container no-scrollbar">
          <div className="min-h-screen py-10 px-4 flex flex-col items-center no-print">
            <div 
              ref={invoiceRef} 
              className="w-full max-w-sm bg-white shadow-2xl rounded-sm p-8 flex flex-col print:shadow-none print:max-w-none print:p-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <div className="text-center mb-6 border-b-2 border-slate-900 pb-4 flex flex-col items-center">
                <div className="w-16 h-16 mb-2">
                   <img src={state.storeDetails.logo || DEFAULT_LOGO} alt="Store Logo" className="w-full h-full object-contain" />
                </div>
                <div className="inline-block bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] mb-2">Invoice / Receipt</div>
                <h1 className="text-2xl font-black text-black uppercase tracking-tighter leading-none mb-1">{state.storeDetails.name}</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{state.storeDetails.address}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-black">
                   <span className="text-[10px] font-black uppercase tracking-widest">Phone:</span>
                   <span className="text-sm font-black">{state.storeDetails.phone}</span>
                </div>
              </div>

              <div className="space-y-1 mb-6 text-[10px] font-bold text-black border-b border-dashed border-slate-200 pb-4">
                <div className="flex justify-between">
                   <span className="text-slate-400 uppercase tracking-widest">Invoice No</span>
                   <span className="uppercase">#{lastSaleItems[0].id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400 uppercase tracking-widest">Date</span>
                   <span>{new Date(lastSaleItems[0].timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span className="text-slate-400 uppercase tracking-widest">Customer</span>
                   <span className="uppercase">{lastSaleItems[0].customerName}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-900 pb-1 mb-3">
                   <span className="col-span-2">Item Description</span>
                   <span className="text-center">Qty</span>
                   <span className="text-right">Total</span>
                </div>
                <div className="space-y-4">
                   {lastSaleItems.map((item) => (
                     <div key={item.id} className="grid grid-cols-4 items-start gap-1">
                        <div className="col-span-2">
                           <p className="text-sm font-black text-black leading-tight uppercase">{item.productName}</p>
                        </div>
                        <p className="text-center text-xs font-black text-black pt-1">{item.quantity}</p>
                        <p className="text-right text-xs font-black text-black pt-1">৳{item.quantity * item.sellPrice}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="mt-auto border-t-2 border-slate-900 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Total</span>
                   <span className="text-sm font-black text-black">৳{invoiceGrossTotal.toLocaleString()}</span>
                </div>

                {invoiceDiscount > 0 && (
                   <div className="flex justify-between items-center text-teal-600 py-1 border-y border-dashed border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-widest">Discount Given</span>
                      <span className="text-sm font-black">-৳{invoiceDiscount.toLocaleString()}</span>
                   </div>
                )}
                
                {invoicePrevBalance > 0 && (
                  <div className="flex justify-between items-center py-1">
                     <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Previous Baki</span>
                     <span className="text-sm font-black text-red-500">৳{invoicePrevBalance.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Payable</span>
                   <span className="text-xl font-black text-black tracking-tighter">৳{(invoiceNetTotal + invoicePrevBalance).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                   <span>Paid Today</span>
                   <span>৳{invoicePaidToday.toLocaleString()}</span>
                </div>

                {invoiceNewDue > 0 && (
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 p-1.5 rounded">
                      <span>Remaining Baki</span>
                      <span>৳{invoiceNewDue.toLocaleString()}</span>
                   </div>
                )}
              </div>

              <div className="mt-10 pt-4 border-t border-dashed border-slate-200 text-center text-[9px] font-black text-black uppercase tracking-[0.3em]">
                 Thank You
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
               <div className="grid grid-cols-2 gap-3">
                  <button disabled={isGeneratingImage} onClick={handleShareImage} className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                    {isGeneratingImage ? <Loader2 className="animate-spin" size={16} /> : <FileImage size={16} />}
                    Share Image
                  </button>
                  <button onClick={handlePrint} className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Printer size={16} /> Print Receipt
                  </button>
               </div>
               <button onClick={() => { setLastSaleItems(null); setCart([]); }} className="w-full bg-white text-slate-400 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40 bg-white p-5 rounded-3xl shadow-2xl border border-slate-50 no-print animate-in slide-in-from-bottom-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Items</span>
              <span className="text-2xl font-black text-black tracking-tight">৳{cartTotal.toLocaleString()}</span>
            </div>
            <div className="text-right">
               <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">{cart.length} Items</span>
            </div>
          </div>
          <button onClick={() => { 
            setPaidAmount(0); 
            setDiscount(0);
            setShowCheckoutModal(true); 
          }} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Check size={20} /> Checkout
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-sm rounded-3xl p-7 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-6">Sale Details</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">{t.customerName}</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                      type="text" 
                      autoFocus
                      className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 text-sm font-bold text-black focus:ring-2 focus:ring-teal-500/10" 
                      value={customerName} 
                      onChange={e => { setCustomerName(e.target.value); setShowSuggestions(true); }} 
                   />
                </div>
                
                {showSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                    {customerSuggestions.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => { setCustomerName(c.customerName); setCustomerPhone(c.customerPhone); setShowSuggestions(false); }}
                        className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center"
                      >
                         <span className="text-sm font-bold text-black">{c.customerName}</span>
                         <span className="text-[10px] font-black text-red-500">Baki: ৳{c.totalDue}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">{t.customerPhone}</label>
                <input 
                  type="tel" 
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold text-black focus:ring-2 focus:ring-teal-500/10" 
                  placeholder="017xxxxxxxx"
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">{t.discount} (৳)</label>
                <div className="relative">
                   <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" size={16} />
                   <input 
                      type="number" 
                      className="w-full bg-teal-50 border-0 rounded-2xl p-4 pl-12 text-sm font-black text-teal-700 focus:ring-2 focus:ring-teal-500/20" 
                      placeholder="0"
                      value={discount || ''} 
                      onChange={e => setDiscount(Number(e.target.value))} 
                   />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Total</span>
                    <span className="text-sm font-black text-black">৳{cartTotal.toLocaleString()}</span>
                 </div>
                 {discount > 0 && (
                   <div className="flex justify-between items-center text-teal-600">
                      <span className="text-[10px] font-black uppercase tracking-widest">Deducted Discount</span>
                      <span className="text-sm font-black">-৳{discount.toLocaleString()}</span>
                   </div>
                 )}
                 {previousBalance > 0 && (
                   <div className="flex justify-between items-center text-red-600">
                      <span className="text-[10px] font-black uppercase tracking-widest">Previous Baki</span>
                      <span className="text-sm font-black">৳{previousBalance.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="pt-2 border-t-2 border-black flex justify-between items-center">
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Total Payable</span>
                    <span className="text-lg font-black text-black">৳{(netTotalAfterDiscount + previousBalance).toLocaleString()}</span>
                 </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Paid Today (৳)</label>
                <input 
                  type="number" 
                  className="w-full bg-teal-50 border-0 rounded-2xl p-4 text-teal-700 font-black text-lg focus:ring-2 focus:ring-teal-500/20" 
                  value={paidAmount} 
                  onChange={e => setPaidAmount(Number(e.target.value))} 
                />
              </div>
              
              <div className="space-y-3 pt-4">
                <button onClick={() => handleCheckout(false)} className="w-full py-4 text-[10px] font-black text-white bg-slate-900 rounded-2xl shadow-xl uppercase tracking-widest active:scale-95 transition-transform">
                  Quick Sale (No Invoice)
                </button>
                <button onClick={() => handleCheckout(true)} className="w-full py-4 text-[10px] font-black text-white bg-teal-600 rounded-2xl shadow-xl shadow-teal-50 uppercase tracking-widest active:scale-95 transition-transform">
                  Sale & Show Invoice
                </button>
                <button onClick={() => setShowCheckoutModal(false)} className="w-full py-3 text-[10px] font-black text-slate-400 bg-white rounded-2xl uppercase tracking-widest">
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesScreen;
