import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Sale, Purchase, Credit, Language, AppState, StoreDetails } from './types';
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, auth } from "./firebase";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const STORAGE_KEY = 'pharma_flow_v1_data';

const initialState: AppState = {
  products: [],
  sales: [],
  purchases: [],
  credits: [],
  storeDetails: {
    name: 'MY SHOP',
    phone: '01XXXXXXXXX',
    address: 'Street Address, City'
  },
  language: 'en',
  linkedEmail: undefined,
  lastSync: undefined,
  isSyncing: false
};

// Helper function to prevent circular references and clean undefined values
const sanitizeForFirestore = (obj: any) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'undefined' ? null : value
  ));
};

export function useLocalStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    try {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed, isSyncing: false };
    } catch (e) {
      return initialState;
    }
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Firebase Real-time Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubDoc = onSnapshot(doc(db, "shops", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as AppState;
            if (!stateRef.current.lastSync || (cloudData.lastSync && cloudData.lastSync > stateRef.current.lastSync)) {
               setState(prev => ({ 
                 ...prev, 
                 ...cloudData, 
                 linkedEmail: user.email || undefined,
                 isSyncing: false 
               }));
            }
          }
        });
        return () => unsubDoc();
      } else {
        setState(prev => ({ ...prev, linkedEmail: undefined, lastSync: undefined }));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Sync Local to Cloud (Fixed Circular Logic)
  useEffect(() => {
    const cleanState = sanitizeForFirestore(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));

    const user = auth.currentUser;
    if (user && !state.isSyncing) {
      const timeout = setTimeout(async () => {
        const syncTime = Date.now();
        try {
          const dataToSync = sanitizeForFirestore({
            products: stateRef.current.products,
            sales: stateRef.current.sales,
            purchases: stateRef.current.purchases,
            credits: stateRef.current.credits,
            storeDetails: stateRef.current.storeDetails,
            language: stateRef.current.language,
            lastSync: syncTime
          });
          
          await setDoc(doc(db, "shops", user.uid), dataToSync);
          setState(prev => ({ ...prev, lastSync: syncTime, isSyncing: false }));
        } catch (e) {
          console.error("Cloud sync failed", e);
          setState(prev => ({ ...prev, isSyncing: false }));
        }
      }, 10000); 
      return () => clearTimeout(timeout);
    }
  }, [state.products, state.sales, state.purchases, state.credits, state.storeDetails, state.language]);

  const performCloudSync = async () => {
    const user = auth.currentUser;
    if (!user) return false;
    
    setState(prev => ({ ...prev, isSyncing: true }));
    try {
      const syncTime = Date.now();
      const dataToSync = sanitizeForFirestore({
        products: stateRef.current.products,
        sales: stateRef.current.sales,
        purchases: stateRef.current.purchases,
        credits: stateRef.current.credits,
        storeDetails: stateRef.current.storeDetails,
        language: stateRef.current.language,
        lastSync: syncTime
      });
      await setDoc(doc(db, "shops", user.uid), dataToSync);
      setState(prev => ({ ...prev, lastSync: syncTime, isSyncing: false }));
      return true;
    } catch (e) {
      setState(prev => ({ ...prev, isSyncing: false }));
      return false;
    }
  };

  const unlinkGoogle = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (e) {
      return false;
    }
  };

  const updateStoreDetails = (details: StoreDetails) => {
    setState(prev => ({ ...prev, storeDetails: details }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  const recordCheckout = (items: { product: Product; qty: number }[], totalPaid: number, totalDiscount: number, customerName: string = 'Cash Customer', customerPhone: string = '') => {
    const timestamp = Date.now();
    const newSales: Sale[] = [];
    let transactionGrossTotal = 0;

    for (const item of items) {
      const p = state.products.find(prod => prod.id === item.product.id);
      if (!p || p.stock < item.qty) return null;
      transactionGrossTotal += item.qty * p.sellPrice;
    }

    const netTransactionTotal = Math.max(0, transactionGrossTotal - totalDiscount);
    const totalDueForTransaction = netTransactionTotal - totalPaid;
    const discountFactor = transactionGrossTotal > 0 ? totalDiscount / transactionGrossTotal : 0;
    const paidFactor = netTransactionTotal > 0 ? totalPaid / netTransactionTotal : 0;

    const newProducts = [...state.products];
    items.forEach(item => {
      const product = newProducts.find(p => p.id === item.product.id)!;
      const itemGross = item.qty * product.sellPrice;
      const itemNet = itemGross * (1 - discountFactor);
      const itemPaid = itemNet * paidFactor;
      const itemDue = itemNet - itemPaid;
      const itemProfit = itemNet - (item.qty * product.buyPrice);

      newSales.push({
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity: item.qty,
        unit: product.unit,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
        total: itemNet,
        discount: itemGross * discountFactor,
        paidAmount: itemPaid,
        dueAmount: itemDue,
        previousBalance: 0,
        customerName,
        customerPhone,
        profit: itemProfit,
        timestamp
      });
      product.stock -= item.qty;
    });

    let updatedCredits = [...state.credits];
    const customer = updatedCredits.find(c => c.customerName.toLowerCase() === customerName.toLowerCase() || (customerPhone && c.customerPhone === customerPhone));

    if (customer) {
      newSales.forEach(s => s.previousBalance = customer.totalDue);
      if (totalDueForTransaction !== 0) {
        customer.totalDue += totalDueForTransaction;
        customer.history = [{ id: crypto.randomUUID(), amount: Math.abs(totalDueForTransaction), type: (totalDueForTransaction > 0 ? 'purchase' : 'payment') as 'purchase' | 'payment', timestamp, note: `Purchase Ref: ${newSales[0].id.substring(0,5)}` }, ...customer.history];
      }
    } else if (totalDueForTransaction > 0) {
      updatedCredits.push({ id: crypto.randomUUID(), customerName, customerPhone, totalDue: totalDueForTransaction, history: [{ id: crypto.randomUUID(), amount: totalDueForTransaction, type: 'purchase', timestamp, note: `New Account Purchase` }] });
    }

    setState(prev => ({ ...prev, sales: [...newSales, ...prev.sales], products: newProducts, credits: updatedCredits }));
    return newSales;
  };

  const deleteSale = (timestamp: number) => {
    setState(prev => {
      const salesToVoid = prev.sales.filter(s => s.timestamp === timestamp);
      if (salesToVoid.length === 0) return prev;
      const firstSale = salesToVoid[0];
      const products = [...prev.products];
      salesToVoid.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) product.stock += sale.quantity;
      });
      const credits = prev.credits.map(c => {
        if (c.customerName === firstSale.customerName) {
          const totalVoidDue = salesToVoid.reduce((acc, s) => acc + s.dueAmount, 0);
          return { ...c, totalDue: Math.max(0, c.totalDue - totalVoidDue), history: c.history.filter(h => h.timestamp !== timestamp) };
        }
        return c;
      });
      return { ...prev, sales: prev.sales.filter(s => s.timestamp !== timestamp), products, credits };
    });
  };

  const recordPurchase = (productId: string, quantity: number, cost: number, supplier: string, batchNumber?: string, expiryDate?: string) => {
    setState(prev => {
      const product = prev.products.find(p => p.id === productId);
      if (!product) return prev;
      const newPurchase: Purchase = { id: crypto.randomUUID(), productId, productName: product.name, quantity, cost, supplier, batchNumber: batchNumber || product.batchNumber, expiryDate: expiryDate || product.expiryDate, timestamp: Date.now() };
      const updatedProducts = prev.products.map(p => p.id === productId ? { ...p, stock: p.stock + quantity, buyPrice: quantity > 0 ? cost / quantity : p.buyPrice, batchNumber: batchNumber || p.batchNumber, expiryDate: expiryDate || p.expiryDate } : p);
      return { ...prev, purchases: [newPurchase, ...prev.purchases], products: updatedProducts };
    });
  };

  const recordDuePayment = (creditId: string, amount: number) => {
    const targetCredit = stateRef.current.credits.find(c => c.id === creditId);
    if (!targetCredit) return null;
    const paymentId = crypto.randomUUID();
    const timestamp = Date.now();
    const remainingDue = Math.max(0, targetCredit.totalDue - amount);
    setState(prev => ({
      ...prev,
      credits: prev.credits.map(c => c.id === creditId ? { ...c, totalDue: remainingDue, history: [{ id: paymentId, amount, type: 'payment', timestamp, note: 'Cash Payment Received' }, ...c.history] } : c)
    }));
    return { id: paymentId, customerName: targetCredit.customerName, amount, remainingDue, timestamp };
  };

  const updateCreditAccount = (id: string, name: string, phone: string) => {
    setState(prev => ({ ...prev, credits: prev.credits.map(c => c.id === id ? { ...c, customerName: name, customerPhone: phone } : c) }));
  };

  const addCreditAccount = (name: string, phone: string, openingBalance: number = 0) => {
    const existing = state.credits.find(c => c.customerPhone === phone && phone !== '');
    if (existing) return null;
    const newCredit: Credit = { id: crypto.randomUUID(), customerName: name, customerPhone: phone, totalDue: openingBalance, history: openingBalance > 0 ? [{ id: crypto.randomUUID(), amount: openingBalance, type: 'purchase', timestamp: Date.now(), note: 'Opening Balance (Baki)' }] : [] };
    setState(prev => ({ ...prev, credits: [newCredit, ...prev.credits] }));
    return newCredit;
  };

  const restoreData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products && parsed.sales) {
        setState({ ...initialState, ...parsed, isSyncing: false });
        return true;
      }
    } catch (e) { console.error("Restore failed", e); }
    return false;
  };

  return {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
    recordCheckout,
    deleteSale,
    recordPurchase,
    recordDuePayment,
    updateCreditAccount,
    addCreditAccount,
    updateStoreDetails,
    performCloudSync,
    unlinkGoogle,
    toggleLanguage: () => setState(p => ({ ...p, language: p.language === 'en' ? 'bn' : 'en' })),
    backupToLocal: () => {
      const cleanState = sanitizeForFirestore(state);
      const str = JSON.stringify(cleanState);
      const blob = new Blob([str], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      return str;
    },
    restoreData
  };
}
