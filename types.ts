
export interface Product {
  id: string;
  name: string;
  category: string;
  batchNumber: string;
  unit: string; // New: e.g., Pcs, Strip, Box
  buyPrice: number;
  sellPrice: number;
  stock: number;
  expiryDate: string;
  lowStockThreshold: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  sellPrice: number;
  buyPrice: number;
  total: number;
  discount: number;
  paidAmount: number;
  dueAmount: number;
  previousBalance: number;
  customerName: string;
  customerPhone?: string;
  profit: number;
  timestamp: number;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  supplier: string;
  batchNumber: string;
  expiryDate: string;
  timestamp: number;
}

export interface Credit {
  id: string;
  customerName: string;
  customerPhone: string;
  totalDue: number;
  history: {
    id: string;
    amount: number;
    type: 'purchase' | 'payment';
    timestamp: number;
    note?: string;
    relatedSaleId?: string;
  }[];
}

export interface StoreDetails {
  name: string;
  phone: string;
  address: string;
  logo?: string; // New: Base64 logo string
}

export type Language = 'en' | 'bn';

export interface RestorePoint {
  id: string;
  timestamp: number;
  data: string;
  trigger: string;
}

export interface AppState {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  credits: Credit[];
  storeDetails: StoreDetails;
  language: Language;
  linkedEmail?: string;
  lastSync?: number;
  isSyncing?: boolean;
}

export const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/4320/4320350.png";

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    sales: "Sales",
    purchase: "Purchase",
    inventory: "Inventory",
    reports: "Reports",
    settings: "Settings",
    todaySales: "Today's Sale",
    totalStock: "Total Stock",
    lowStock: "Low Stock",
    expiringSoon: "Expiring Soon",
    addProduct: "Add Product",
    productName: "Product Name",
    category: "Category",
    batch: "Batch #",
    unit: "Unit",
    buyPrice: "Buy Price",
    sellPrice: "Sell Price",
    stock: "Stock",
    expiry: "Expiry Date",
    save: "Save",
    cancel: "Cancel",
    confirmSale: "Confirm Sale",
    quantity: "Qty",
    total: "Total",
    profit: "Profit",
    backup: "Backup Data",
    restore: "Restore Data",
    noData: "No data available",
    recentSales: "Recent Sales",
    supplier: "Supplier",
    addStock: "Add Stock",
    netProfit: "Net Profit",
    search: "Search products...",
    due: "Due (Rest)",
    restList: "Rest List",
    paidAmount: "Paid Amount",
    dueAmount: "Due Amount",
    customerName: "Customer Name",
    customerPhone: "Phone Number",
    invoice: "Invoice",
    printInvoice: "Print / PDF",
    share: "Share Invoice",
    totalDue: "Total Due",
    makePayment: "Payment",
    storeSettings: "Shop Profile",
    storeName: "Shop Name",
    storePhone: "Shop Phone",
    storeAddress: "Shop Address",
    discount: "Discount",
    login: "Login",
    email: "Gmail Address",
    password: "Password",
    logout: "Logout",
    syncing: "Syncing to Cloud...",
    lastSync: "Last Sync",
    addCustomer: "Add Customer",
    openingBalance: "Opening Balance",
    cloudBackup: "Google Cloud Backup",
    linkGoogle: "Link Gmail Account",
    localBackup: "Local Storage",
    backupToGmail: "Backup to Gmail Storage",
    synced: "Data Synced",
    notSynced: "Local Only",
    autoBackupEnabled: "Auto Backup Enabled",
    restoring: "Restoring...",
    void: "Void",
    voidSale: "Void Transaction",
    history: "Transaction History",
    changeLogo: "Change Logo",
    brandIdentity: "Brand Identity"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    sales: "বিক্রয় (Bikroy)",
    purchase: "ক্রয় (Croy)",
    inventory: "ইনভেন্টরি",
    reports: "হিসাব নিকাশ",
    settings: "সেটিংস",
    todaySales: "আজকের বিক্রয়",
    totalStock: "মোট স্টক",
    lowStock: "কম স্টক",
    expiringSoon: "মেয়াদোত্তীর্ণ শীঘ্রই",
    addProduct: "পণ্য যোগ করুন",
    productName: "পণ্যের নাম",
    category: "ক্যাটাগরি",
    batch: "ব্যাচ নং",
    unit: "ইউনিট",
    buyPrice: "ক্রয়মূল্য",
    sellPrice: "বিক্রয়মূল্য",
    stock: "স্টক",
    expiry: "মেয়াদ",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    confirmSale: "বিক্রয় নিশ্চিত করুন",
    quantity: "পরিমাণ",
    total: "মোট",
    profit: "লাভ",
    backup: "ব্যাকআপ",
    restore: "রিস্টোর",
    noData: "কোন তথ্য নেই",
    recentSales: "সাম্প্রতিক বিক্রয়",
    supplier: "সরবরাহকারী",
    addStock: "স্টক যোগ করুন",
    netProfit: "নীট লাভ",
    search: "পণ্য খুঁজুন...",
    due: "বাকি (Due)",
    restList: "বাকির তালিকা",
    paidAmount: "পরিশোধিত",
    dueAmount: "বাকি পরিমাণ",
    customerName: "ক্রেতার নাম",
    customerPhone: "মোবাইল নম্বর",
    invoice: "চালান (Invoice)",
    printInvoice: "প্রিন্ট / PDF",
    share: "শেয়ার করুন",
    totalDue: "মোট বাকি",
    makePayment: "পেমেন্ট",
    storeSettings: "দোকানের প্রোফাইল",
    storeName: "দোকানের নাম",
    storePhone: "দোকানের ফোন",
    storeAddress: "দোকানের ঠিকানা",
    discount: "ছাড়",
    login: "লগইন",
    email: "জিমেইল অ্যাড্রেস",
    password: "পাসওয়ার্ড",
    logout: "লগআউট",
    syncing: "ক্লাউড ব্যাকআপ হচ্ছে...",
    lastSync: "শেষ সিনঙ্ক",
    addCustomer: "ক্রেতা যোগ করুন",
    openingBalance: "শুরুর বাকি (ব্যালেন্স)",
    cloudBackup: "গুগল ক্লাউড ব্যাকআপ",
    linkGoogle: "জিমেইল যুক্ত করুন",
    localBackup: "লোকাল স্টোরেজ",
    backupToGmail: "জিমেইলে ব্যাকআপ রাখুন",
    synced: "ডাটা সিনঙ্ক হয়েছে",
    notSynced: "শুধুমাত্র অফলাইন",
    autoBackupEnabled: "অটো ব্যাকআপ সচল",
    restoring: "পুনরুদ্ধার হচ্ছে...",
    void: "বাতিল",
    voidSale: "ট্রানজাকশন বাতিল করুন",
    history: "লেনদেন ইতিহাস",
    changeLogo: "লোগো পরিবর্তন",
    brandIdentity: "ব্র্যান্ড লোগো"
  }
};
