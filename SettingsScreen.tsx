
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  Store, 
  MapPin, 
  Phone, 
  Cloud, 
  Mail, 
  HardDrive,
  AlertCircle,
  History,
  RotateCcw,
  Clock,
  Camera,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { TRANSLATIONS, DEFAULT_LOGO } from './types';

interface SettingsProps { store: any; }

const SettingsScreen: React.FC<SettingsProps> = ({ store }) => {
  const { state, backupToLocal, performCloudSync, unlinkGoogle, restoreData, toggleLanguage, updateStoreDetails } = store;
  const t = TRANSLATIONS[state.language];
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [restorePoints, setRestorePoints] = useState<any[]>([]);
  
  const [shopDetails, setShopDetails] = useState(state.storeDetails);

  useEffect(() => {
    const saved = localStorage.getItem('pharma_restore_points');
    if (saved) setRestorePoints(JSON.parse(saved));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Logo must be smaller than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setShopDetails({ ...shopDetails, logo: base64 });
        updateStoreDetails({ ...shopDetails, logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    const success = await performCloudSync();
    setIsSyncing(false);
    if (success) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } else {
      alert("Manual sync failed. Please check your connection.");
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (restoreData(content)) {
          alert("Data restored successfully!");
          window.location.reload();
        } else {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRestoreFromPoint = (point: any) => {
    if (confirm(`Restore data from ${new Date(point.timestamp).toLocaleString()}? Current unsaved changes will be lost.`)) {
      if (restoreData(point.data)) {
        alert("Restore point applied successfully.");
        window.location.reload();
      }
    }
  };

  const handleEmailBackup = () => {
    const data = backupToLocal();
    const mailtoUrl = `mailto:?subject=MY SHOP Data Backup - ${new Date().toLocaleDateString()}&body=Keep this data safe to restore your shop records later.%0D%0A%0D%0A${encodeURIComponent(data)}`;
    window.location.href = mailtoUrl;
  };

  const saveShopDetails = () => {
    updateStoreDetails(shopDetails);
    setIsEditingShop(false);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout? Cloud sync will be paused until you login again.")) {
      await unlinkGoogle();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-xl font-bold text-black">{t.settings}</h2>

      <div className="space-y-5">
        {/* Logo & Brand Identity */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 w-full text-center">{t.brandIdentity}</h4>
           <div className="relative">
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden mb-4">
                 <img 
                    src={shopDetails.logo || DEFAULT_LOGO} 
                    alt="Logo Preview" 
                    className="w-full h-full object-contain p-2"
                 />
              </div>
              <label className="absolute bottom-4 right-[-8px] bg-teal-600 text-white p-2.5 rounded-2xl shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform active:scale-90">
                 <Camera size={16} />
                 <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.changeLogo}</p>
        </div>

        {/* Shop Profile Section */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white">
                   <Store size={20} />
                </div>
                <h3 className="font-bold text-black">{t.storeSettings}</h3>
             </div>
             {!isEditingShop && (
               <button 
                 onClick={() => setIsEditingShop(true)}
                 className="text-[10px] font-black text-teal-600 uppercase bg-teal-50 px-3 py-1.5 rounded-full"
               >
                 Edit
               </button>
             )}
          </div>

          {isEditingShop ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{t.storeName}</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm font-bold text-black" 
                  value={shopDetails.name}
                  onChange={e => setShopDetails({...shopDetails, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{t.storePhone}</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm font-bold text-black" 
                  value={shopDetails.phone}
                  onChange={e => setShopDetails({...shopDetails, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{t.storeAddress}</label>
                <textarea 
                  className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm font-bold text-black min-h-[80px]" 
                  value={shopDetails.address}
                  onChange={e => setShopDetails({...shopDetails, address: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditingShop(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-wider">Cancel</button>
                <button onClick={saveShopDetails} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-100">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-bold text-black">
                 <Store size={14} className="text-slate-400" />
                 <span>{state.storeDetails.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                 <Phone size={14} className="text-slate-400" />
                 <span>{state.storeDetails.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-500">
                 <MapPin size={14} className="text-slate-400 mt-1" />
                 <span className="leading-relaxed">{state.storeDetails.address}</span>
              </div>
            </div>
          )}
        </div>

        {/* Backup Hub */}
        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Backup & Recovery Hub</h4>
           
           {/* Google Cloud Card */}
           <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-2xl">
                       <Cloud className="text-blue-600" size={20} />
                    </div>
                    <div>
                       <h5 className="text-sm font-black text-black leading-none">{t.cloudBackup}</h5>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Auto Sync</p>
                    </div>
                 </div>
                 <button onClick={handleLogout} className="flex items-center gap-1.5 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                   <LogOut size={14} />
                   <span className="text-[9px] font-black uppercase">{t.logout}</span>
                 </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-black text-blue-600">G</div>
                      <span className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{state.linkedEmail || "Connected"}</span>
                    </div>
                    <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Auto Sync Active</span>
                </div>
                <button 
                    onClick={handleCloudSync}
                    disabled={isSyncing}
                    className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all ${
                      syncSuccess ? 'bg-green-500 text-white' : 'bg-blue-600 text-white shadow-blue-50 active:scale-95'
                    }`}
                >
                    {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : syncSuccess ? <ShieldCheck size={16} /> : <Cloud size={16} />}
                    {isSyncing ? t.syncing : syncSuccess ? "Backup Success!" : "Sync to Gmail Now"}
                </button>
                {state.lastSync && (
                    <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Last Successful Sync: {new Date(state.lastSync).toLocaleString()}
                    </p>
                )}
              </div>
           </div>

           {/* Version History / Restore Points */}
           {restorePoints.length > 0 && (
             <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100">
               <div className="flex items-center gap-3 mb-4">
                 <div className="bg-purple-50 p-2.5 rounded-2xl">
                    <History className="text-purple-600" size={20} />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-black leading-none">Auto-Restore Points</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatic Local Snapshots</p>
                 </div>
               </div>
               
               <div className="space-y-2">
                 {restorePoints.slice(0, 3).map((point: any) => (
                   <div key={point.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                     <div>
                       <p className="text-[11px] font-black text-black leading-tight">{point.trigger}</p>
                       <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 uppercase">
                         <Clock size={8} /> {new Date(point.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </p>
                     </div>
                     <button 
                       onClick={() => handleRestoreFromPoint(point)}
                       className="p-2.5 bg-white text-purple-600 rounded-xl shadow-sm border border-purple-50 active:scale-90 transition-all"
                       title="Restore this version"
                     >
                       <RotateCcw size={14} />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Local Device Card */}
           <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-teal-50 p-2.5 rounded-2xl">
                    <HardDrive className="text-teal-600" size={20} />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-black leading-none">{t.localBackup}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Offline Manual Storage</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <button 
                    onClick={() => { backupToLocal(); }}
                    className="py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                 >
                    <Download size={14} /> Export File
                 </button>
                 <label className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                    <Upload size={14} /> Import File
                    <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                 </label>
              </div>

              <button 
                onClick={handleEmailBackup}
                className="w-full py-4 border border-teal-100 text-teal-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors"
              >
                 <Mail size={16} /> {t.backupToGmail}
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <button 
            onClick={toggleLanguage}
            className="w-full p-5 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 font-black text-sm text-black">
              <Globe size={18} className="text-blue-500" />
              App Language
            </div>
            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-widest">
              {state.language === 'en' ? 'English' : 'বাংলা'}
            </span>
          </button>

          <button 
            onClick={() => {
              if (confirm('Are you sure? This will clear ALL data from this device permanentely.')) {
                localStorage.removeItem('pharma_flow_v1_data');
                localStorage.removeItem('pharma_restore_points');
                window.location.reload();
              }
            }}
            className="w-full p-5 flex items-center justify-between hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-red-500 font-black text-sm uppercase tracking-tight">
              <Trash2 size={18} />
              Reset All App Data
            </div>
          </button>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
          <ShieldCheck size={40} className="text-teal-400 mb-4" />
          <h4 className="font-black text-white text-base uppercase tracking-tight">Enterprise Auto-Protect</h4>
          <p className="text-[11px] text-slate-400 mt-2 font-bold leading-relaxed">
            Your inventory is automatically protected by real-time cloud sync and rolling local snapshots.
          </p>
        </div>

        <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] pt-4">
          v1.6.1 • Cloud Sync Fixed
        </p>
      </div>
    </div>
  );
};

export default SettingsScreen;
