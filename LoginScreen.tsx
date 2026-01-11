
import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck, UserPlus, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from './types';
import { auth } from './firebase';
// Re-fix: Using standard modular imports for authentication actions.
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  language: 'en' | 'bn';
  toggleLanguage: () => void;
  logo: string;
}

const LoginScreen: React.FC<LoginProps> = ({ language, toggleLanguage, logo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const t = TRANSLATIONS[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Re-fix: Standard usage of modular createUserWithEmailAndPassword.
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Re-fix: Standard usage of modular signInWithEmailAndPassword.
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-teal-600 flex flex-col justify-center items-center px-6 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-teal-500 rounded-full blur-[80px] opacity-50"></div>
      
      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl mx-auto flex items-center justify-center mb-6 overflow-hidden p-3">
             <img src="logo.png" alt="Ideal Pharma Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">IDEAL PHARMA</h1>
          <p className="text-teal-100 text-xs font-bold uppercase tracking-widest opacity-80">Cloud Management</p>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">
              {isSignUp ? 'Create Account' : t.login}
            </h2>
            <button 
              onClick={toggleLanguage}
              type="button"
              className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-widest"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@gmail.com"
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 text-sm font-bold text-black focus:ring-2 focus:ring-teal-500/10"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 text-sm font-bold text-black focus:ring-2 focus:ring-teal-500/10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-xl flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isSignUp ? 'Create My Shop' : t.login}
            </button>

            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2"
            >
              {isSignUp ? 'Already have an account? Login' : 'New here? Create an Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400">
               <ShieldCheck size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Cloud Sync Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
