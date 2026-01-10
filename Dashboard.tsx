
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Package, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  PlusCircle,
  BarChart3,
  Users,
  ArrowDownLeft
} from 'lucide-react';
import { TRANSLATIONS } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  store: any;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ store, setActiveTab }) => {
  const { state } = store;
  const t = TRANSLATIONS[state.language];

  const today = new Date().setHours(0,0,0,0);
  
  const todaySales = state.sales
    .filter((s: any) => s.timestamp >= today)
    .reduce((acc: number, curr: any) => acc + curr.total, 0);

  const todayPurchases = state.purchases
    .filter((p: any) => p.timestamp >= today)
    .reduce((acc: number, curr: any) => acc + curr.cost, 0);

  const totalDue = state.credits.reduce((acc: number, curr: any) => acc + curr.totalDue, 0);

  const lowStockItems = state.products.filter((p: any) => p.stock <= (p.lowStockThreshold || 10));
  
  const now = new Date();
  const threeMonthsFromNow = new Date(now.setMonth(now.getMonth() + 3));
  const expiringSoonItems = state.products.filter((p: any) => {
    const expiry = new Date(p.expiryDate);
    return expiry <= threeMonthsFromNow && expiry >= new Date();
  });

  // Sample data for chart (last 7 sales)
  const chartData = state.sales.slice(0, 7).reverse().map((s: any) => ({
    name: s.productName.substring(0, 5),
    amt: s.total
  }));

  return (
    <div className="space-y-6">
      {/* Welcome & Highlights */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-teal-50 p-2 rounded-lg w-fit">
            <TrendingUp className="text-teal-600 w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t.todaySales}</p>
            <h3 className="text-lg font-black text-black">৳{todaySales.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-red-50 p-2 rounded-lg w-fit">
            <ArrowDownLeft className="text-red-600 w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Today's Purchase</p>
            <h3 className="text-lg font-black text-red-600">৳{todayPurchases.toLocaleString()}</h3>
          </div>
        </div>
      </section>

      <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-lg">
            <Users className="text-orange-600 w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t.totalDue}</p>
            <h3 className="text-lg font-black text-orange-600">৳{totalDue.toLocaleString()}</h3>
          </div>
        </div>
        <button onClick={() => setActiveTab('due')} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
           <ChevronRight size={20} />
        </button>
      </section>

      {/* Quick Actions */}
      <section className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveTab('sales')}
          className="flex-shrink-0 flex items-center gap-2 bg-teal-600 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-teal-100 font-bold text-sm uppercase tracking-wider"
        >
          <PlusCircle size={18} /> {t.sales}
        </button>
        <button 
          onClick={() => setActiveTab('purchase')}
          className="flex-shrink-0 flex items-center gap-2 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-slate-100 font-bold text-sm uppercase tracking-wider"
        >
          <ArrowDownLeft size={18} /> {t.purchase}
        </button>
      </section>

      {/* Alerts */}
      <section className="space-y-3">
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="text-amber-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900">{lowStockItems.length} {t.lowStock}</p>
              <p className="text-[10px] text-amber-700 font-medium uppercase">Check Inventory Levels</p>
            </div>
          </div>
          <ChevronRight className="text-amber-400 w-5 h-5" />
        </div>

        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Clock className="text-red-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-red-900">{expiringSoonItems.length} {t.expiringSoon}</p>
              <p className="text-[10px] text-red-700 font-medium uppercase">Near Expiry Alert</p>
            </div>
          </div>
          <ChevronRight className="text-red-400 w-5 h-5" />
        </div>
      </section>

      {/* Sales Visualized */}
      {chartData.length > 0 && (
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.recentSales} Trends</h4>
             <BarChart3 size={16} className="text-teal-600" />
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="amt" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
