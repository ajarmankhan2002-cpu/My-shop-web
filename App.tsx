
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Settings, 
  ArrowDownLeft,
  Users,
  Cloud,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useLocalStore } from './store';
import { TRANSLATIONS, DEFAULT_LOGO } from './types';
import Dashboard from './Dashboard'; // Root
import SalesScreen from './SalesScreen'; // Subdir
import InventoryScreen from './InventoryScreen'; // Root
import PurchaseScreen from './PurchaseScreen'; // Subdir
import ReportsScreen from './ReportsScreen'; // Subdir
import SettingsScreen from './SettingsScreen'; // Subdir
import DueScreen from './DueScreen'; // Root
import LoginScreen from './LoginScreen'; // Root
import { auth } from './firebase';
// Re-fix: Using standard modular import for authentication state listener.
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const store = useLocalStore();
  const { language, lastSync, isSyncing, storeDetails } = store.state;
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Re-fix: Proper usage of modular onAuthStateChanged.
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-teal-600">
        <RefreshCw className="text-white animate-spin" size={40} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen 
      language={language} 
      toggleLanguage={store.toggleLanguage} 
      logo={storeDetails.logo || DEFAULT_LOGO}
    />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard store={store} setActiveTab={setActiveTab} />;
      case 'sales': return <SalesScreen store={store} />;
      case 'inventory': return <InventoryScreen store={store} />;
      case 'purchase': return <PurchaseScreen store={store} />;
      case 'due': return <DueScreen store={store} />;
      case 'reports': return <ReportsScreen store={store} />;
      case 'settings': return <SettingsScreen store={store} />;
      default: return <Dashboard store={store} setActiveTab={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'sales', icon: ShoppingCart, label: t.sales },
    { id: 'due', icon: Users, label: t.due },
    { id: 'inventory', icon: Package, label: t.inventory },
    { id: 'purchase', icon: ArrowDownLeft, label: t.purchase },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 border-x overflow-hidden shadow-2xl relative">
      <header className="bg-teal-600 text-white p-4 shadow-md flex justify-between items-center z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <img 
              src={storeDetails.logo || DEFAULT_LOGO} 
              alt="Logo" 
              className="w-7 h-7 object-contain rounded-lg bg-white p-0.5 shadow-sm"
            />
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">
              {storeDetails.name}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-1 ml-9 h-3">
             {isSyncing ? (
               <div className="flex items-center gap-1 animate-pulse">
                 <RefreshCw size={10} className="text-white animate-spin" />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Syncing...</span>
               </div>
             ) : user ? (
               <>
                 <Cloud size={10} className="text-teal-200" />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-teal-100">
                   {t.synced} • {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                 </span>
               </>
             ) : (
               <>
                 <ShieldCheck size={10} className="text-white/40" />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Local Active</span>
               </>
             )}
          </div>
        </div>
        <button 
          onClick={store.toggleLanguage}
          className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-sm"
        >
          {language === 'en' ? 'বাংলা' : 'EN'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 scroll-smooth no-scrollbar">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-around items-center h-18 py-2 z-20 safe-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full transition-all ${
              activeTab === item.id ? 'text-teal-600 scale-110' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
