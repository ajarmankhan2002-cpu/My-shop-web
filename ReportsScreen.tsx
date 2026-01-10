
import React, { useMemo } from 'react';
import { TRANSLATIONS, Sale } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Box, History, Trash2, Calendar, User } from 'lucide-react';

interface ReportsProps { store: any; }

const ReportsScreen: React.FC<ReportsProps> = ({ store }) => {
  const { state, deleteSale } = store;
  const t = TRANSLATIONS[state.language];

  const { totalSales, totalProfit, totalPurchase, stockValue } = useMemo(() => ({
    totalSales: state.sales.reduce((acc: number, curr: Sale) => acc + curr.total, 0),
    totalProfit: state.sales.reduce((acc: number, curr: Sale) => acc + curr.profit, 0),
    totalPurchase: state.purchases.reduce((acc: number, curr: any) => acc + curr.cost, 0),
    stockValue: state.products.reduce((acc: number, curr: any) => acc + (curr.stock * curr.buyPrice), 0)
  }), [state.sales, state.purchases, state.products]);

  // Group sales by timestamp (Transaction Grouping)
  const groupedSales = useMemo(() => {
    const groups: Record<number, Sale[]> = {};
    state.sales.forEach(s => {
      if (!groups[s.timestamp]) groups[s.timestamp] = [];
      groups[s.timestamp].push(s);
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [state.sales]);

  const stats = [
    { label: t.sales, value: totalSales, color: 'text-teal-600', bg: 'bg-teal-50', icon: TrendingUp },
    { label: t.netProfit, value: totalProfit, color: 'text-blue-600', bg: 'bg-blue-50', icon: DollarSign },
    { label: 'Stock Value', value: stockValue, color: 'text-amber-600', bg: 'bg-amber-50', icon: Box },
  ];

  const handleVoid = (timestamp: number) => {
    if (confirm("Are you sure you want to void this transaction? Stock will be returned to inventory.")) {
      deleteSale(timestamp);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-xl font-bold text-black">{t.reports}</h2>

      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-2xl`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-black">৳{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <History size={14} /> {t.history}
        </h4>
        
        <div className="space-y-4">
          {groupedSales.map(([timestamp, sales]) => {
            const time = Number(timestamp);
            const total = sales.reduce((a, b) => a + b.total, 0);
            return (
              <div key={timestamp} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                       <Calendar size={12} />
                       <span className="text-[9px] font-black uppercase tracking-widest">{new Date(time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-black mb-2">
                       <User size={14} className="text-slate-300" />
                       <span className="text-xs font-black uppercase">{sales[0].customerName}</span>
                    </div>
                  </div>
                  <button onClick={() => handleVoid(time)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-90 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 border-t border-slate-50 pt-4 mb-4">
                  {sales.map(s => (
                    <div key={s.id} className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-600">{s.productName} (x{s.quantity} {s.unit})</span>
                      <span className="text-black">৳{s.total}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center bg-slate-50 -mx-5 -mb-5 px-5 py-3">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Total</span>
                   <span className="text-sm font-black text-teal-600">৳{total.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          {groupedSales.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100 opacity-50">
               <History size={40} className="mx-auto text-slate-200 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No Sales History</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
