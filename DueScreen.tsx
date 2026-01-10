
import React, { useState, useRef } from 'react';
import { Search, Phone, History, CreditCard, X, Printer, FileImage, Loader2, Edit3, User, Plus, Users } from 'lucide-react';
import * as ReactToPrint from 'react-to-print';
import { toPng } from 'html-to-image';
import { TRANSLATIONS, Credit } from './types';

const useReactToPrint = (ReactToPrint as any).useReactToPrint || (ReactToPrint as any).default?.useReactToPrint;

interface DueProps { store: any; }

const DueScreen: React.FC<DueProps> = ({ store }) => {
  const { state, recordDuePayment, updateCreditAccount, addCreditAccount } = store;
  const t = TRANSLATIONS[state.language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const paymentReceiptRef = useRef<HTMLDivElement>(null);

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const filteredCredits = state.credits.filter((c: Credit) => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerPhone.includes(searchTerm)
  );

  const handlePayment = () => {
    if (!selectedCredit || paymentAmount <= 0) return;
    const payment = recordDuePayment(selectedCredit.id, paymentAmount);
    if (payment) {
      setLastPayment(payment);
    }
    setSelectedCredit(null);
    setPaymentAmount(0);
  };

  const handleUpdateDetails = () => {
    if (!selectedCredit) return;
    updateCreditAccount(selectedCredit.id, editName, editPhone);
    setIsEditingAccount(false);
    setSelectedCredit({ ...selectedCredit, customerName: editName, customerPhone: editPhone });
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    const added = addCreditAccount(newCustName, newCustPhone, openingBalance);
    if (added) {
      setIsAddingCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
      setOpeningBalance(0);
    } else {
      alert("Customer already exists.");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: paymentReceiptRef,
    documentTitle: `PaymentReceipt_${lastPayment?.id?.substring(0, 8)}`,
  });

  const handleShareImage = async () => {
    if (!paymentReceiptRef.current || !lastPayment) return;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(paymentReceiptRef.current, {
        quality: 1, pixelRatio: 2, backgroundColor: '#ffffff',
        style: { padding: '20px', fontFamily: 'sans-serif' }
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Payment_${lastPayment.id.substring(0, 8)}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Payment Receipt', text: `Receipt for ${lastPayment.customerName}` });
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') console.error("Share failed:", shareErr);
        }
      } else {
        const link = document.createElement('a');
        link.download = `Payment_${lastPayment.id.substring(0, 8)}.png`;
        link.href = dataUrl; link.click();
      }
    } catch (err) {
      console.error(err);
      alert("Image generation failed.");
    } finally { setIsGeneratingImage(false); }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-black">{t.restList} (Baki)</h2>
        <button 
          onClick={() => setIsAddingCustomer(true)}
          className="bg-teal-600 text-white p-2.5 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative no-print">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder={t.search} 
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3 no-print">
        {filteredCredits.map((c: Credit) => (
          <div 
            key={c.id} 
            onClick={() => { 
              setSelectedCredit(c); 
              setPaymentAmount(0); 
              setEditName(c.customerName);
              setEditPhone(c.customerPhone);
              setIsEditingAccount(false);
            }}
            className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all ${c.totalDue > 0 ? 'hover:border-red-100' : 'hover:border-teal-100'}`}
          >
            <div className="flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-bold text-black">{c.customerName}</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                   <Phone size={10} /> {c.customerPhone || 'No Phone'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
              <p className={`text-lg font-black ${c.totalDue > 0 ? 'text-red-600' : 'text-teal-600'}`}>৳{c.totalDue.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {lastPayment && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm overflow-y-auto print-container">
          <div className="min-h-screen py-10 px-4 flex flex-col items-center no-print">
            <div ref={paymentReceiptRef} className="w-full max-w-sm bg-white rounded-sm p-8 shadow-2xl flex flex-col print:shadow-none print:p-0">
               <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
                  <h1 className="text-2xl font-black text-black uppercase tracking-tighter mb-1">{state.storeDetails.name}</h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{state.storeDetails.address}</p>
               </div>
               {/* Receipt Body */}
               <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid</span>
                     <span className="text-xl font-black text-teal-600">৳{lastPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remaining Baki</span>
                     <span className="text-sm font-black text-red-600">৳{lastPayment.remainingDue.toLocaleString()}</span>
                  </div>
               </div>
            </div>
            <button onClick={() => setLastPayment(null)} className="mt-4 text-white">Close</button>
          </div>
        </div>
      )}

      {selectedCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-black">Account Details</h3>
                 <button onClick={() => setSelectedCredit(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              {/* Profile / Payments UI here */}
              <div className="pt-4 border-t border-slate-100">
                 <input 
                    type="number" 
                    className="w-full bg-teal-50 border-0 rounded-2xl p-4 text-xl font-black text-teal-700 focus:ring-2 focus:ring-teal-200" 
                    value={paymentAmount || ''}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    placeholder="Enter Payment Amount"
                 />
                 <button 
                    onClick={handlePayment}
                    className="w-full bg-teal-600 text-white py-4 mt-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-teal-50"
                 >
                    {t.makePayment} & Receipt
                 </button>
              </div>
           </div>
        </div>
      )}

      {isAddingCustomer && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-7 shadow-2xl">
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-6">{t.addCustomer}</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <input required type="text" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" placeholder="Name" value={newCustName} onChange={e => setNewCustName(e.target.value)} />
              <input type="tel" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold" placeholder="Phone" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
              <input type="number" className="w-full bg-red-50 border-0 rounded-2xl p-4 text-sm font-black text-red-600" placeholder="Opening Balance" value={openingBalance || ''} onChange={e => setOpeningBalance(Number(e.target.value))} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingCustomer(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl shadow-xl">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueScreen;
