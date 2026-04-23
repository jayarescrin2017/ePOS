/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  ShoppingCart, 
  Settings,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Store,
  LogIn,
  LogOut,
  DollarSign,
  WifiOff,
  Wifi,
  Building,
  BarChart3,
  Keyboard,
  RefreshCw,
  Download,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './lib/api';
import { cn } from './lib/utils';
import { db } from './lib/db';

// Pages
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Dashboard from './pages/Dashboard';
import StoreSettingsPage from './pages/StoreSettings';
import Reports from './pages/Reports';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'Point of Sale', path: '/pos' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: History, label: 'Sales History', path: '/sales' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Building, label: 'Store', path: '/store' },
];

function Sidebar({ logoUrl }: { logoUrl: string | null }) {
  const location = useLocation();
  const operatorRole = localStorage.getItem('operator_role') as 'admin' | 'cashier';

  const filteredNav = NAV_ITEMS.filter(item => {
    if (operatorRole === 'cashier') {
      return ['/pos', '/sales', '/'].includes(item.path);
    }
    return true;
  });

  return (
    <aside className="w-20 bg-gray-100 border-r border-gray-300 flex flex-col gap-1 p-1 h-screen sticky top-0">
      <div className="mb-2 p-2">
        <Link to="/" className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white mx-auto shadow-sm overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Store" className="w-full h-full object-cover" />
          ) : (
            <Store size={22} />
          )}
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-3 rounded transition-all group relative",
                isActive 
                  ? "bg-white border border-orange-500 text-orange-600 shadow-sm" 
                  : "text-gray-500 hover:bg-white hover:text-gray-900"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-900")} />
              <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <a
          href="/USER_GUIDE.md"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center py-3 rounded text-gray-500 hover:bg-white hover:text-gray-900 transition-all group relative"
        >
          <HelpCircle size={20} className="text-gray-400 group-hover:text-gray-900" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Guide</span>
        </a>
      </nav>

      <div className="mt-auto p-2 border-t border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gray-600 mx-auto flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-inner">
          OFF
        </div>
      </div>
    </aside>
  );
}

function KeyboardShortcuts() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key) {
          case '1': navigate('/'); break;
          case '2': navigate('/pos'); break;
          case '3': navigate('/inventory'); break;
          case '4': navigate('/sales'); break;
          case '5': navigate('/reports'); break;
          case '6': navigate('/store'); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

  return null;
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const operatorRole = localStorage.getItem('operator_role');
  const navigate = useNavigate();

  useEffect(() => {
    if (allowedRoles && operatorRole && !allowedRoles.includes(operatorRole)) {
      navigate('/pos');
    }
  }, [operatorRole, allowedRoles, navigate]);

  if (allowedRoles && operatorRole && !allowedRoles.includes(operatorRole)) {
    return null;
  }

  return <>{children}</>;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return { isOnline, deferredPrompt, installApp };
}

export default function App() {
  const [operator, setOperator] = useState<string | null>(localStorage.getItem('operator_name'));
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('ACE HARDWARE PRO');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);

  const { isOnline, deferredPrompt, installApp } = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!isOnline) return;
    setSyncing(true);
    try {
      await api.syncOfflineData();
      alert('Data synchronized with server successfully!');
    } catch (e) {
      console.error('Sync failed', e);
      alert('Sync failed. Please check your connection.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    api.getSettings().then(settings => {
      setStoreName(settings.name);
      setStoreLogo(settings.logoUrl || null);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const user = await api.login(username, password);
      localStorage.setItem('operator_name', user.name);
      localStorage.setItem('operator_role', user.role);
      setOperator(user.name);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('operator_name');
    localStorage.removeItem('operator_role');
    setOperator(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#E5E7EB] font-mono">
        <div className="text-center space-y-4">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-16 h-16 bg-[#111827] rounded-xl mx-auto flex items-center justify-center text-orange-500 shadow-2xl border border-gray-700"
          >
             <Store size={32} />
          </motion.div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Local System Loading</p>
          </div>
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#E5E7EB] p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-gray-300 rounded shadow-2xl overflow-hidden">
          <div className="bg-[#111827] p-8 text-center border-b border-gray-800">
            <div className="relative inline-block">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg overflow-hidden">
                {storeLogo ? (
                  <img src={storeLogo} alt="Store" className="w-full h-full object-cover bg-white" />
                ) : (
                  <Store size={32} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-300">
                <WifiOff size={10} className="text-red-500" />
              </div>
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">{storeName}</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Standalone Offline Mode</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Username</label>
                <input 
                  name="username"
                  required
                  autoFocus
                  placeholder="USERNAME"
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded font-black text-xs uppercase tracking-widest focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Password</label>
                <input 
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded font-black text-xs focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                <WifiOff size={14} />
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all high-density-shadow active:translate-y-1"
            >
              <LogIn size={18} />
              Login to Session
            </button>

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-loose">
                Data stored locally in this browser.<br />NO INTERNET CONNECTION REQUIRED.
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <KeyboardShortcuts />
      <div className="flex flex-col h-screen bg-[#E5E7EB] font-sans text-gray-900 overflow-hidden">
        {/* Top Header from Design */}
        <header className="bg-[#111827] text-white px-4 py-2 flex items-center justify-between border-b border-gray-700 shadow-sm z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 rounded overflow-hidden flex items-center justify-center" style={{ width: '30px', height: '30px' }}>
                {storeLogo ? (
                  <img src={storeLogo} alt="Store" className="w-full h-full object-cover bg-white" />
                ) : (
                  <Store size={18} className="text-white" />
                )}
              </div>
              <span className="font-bold tracking-tight text-lg uppercase truncate max-w-[200px]">{storeName}</span>
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-2 py-0.5 border rounded text-[9px] font-black uppercase tracking-widest ml-1 transition-colors",
                isOnline 
                  ? "bg-green-900/40 border-green-500/30 text-green-400" 
                  : "bg-red-900/40 border-red-500/30 text-red-400"
              )}>
                {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
              {isOnline && (
                <button 
                  onClick={handleSync}
                  disabled={syncing}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 bg-blue-900/40 border border-blue-500/30 rounded text-[9px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-800/60 transition-all",
                    syncing && "animate-pulse"
                  )}
                >
                  <RefreshCw size={10} className={cn(syncing && "animate-spin")} />
                  {syncing ? 'Syncing...' : 'Sync Data'}
                </button>
              )}
              {deferredPrompt && (
                <button 
                  onClick={installApp}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-900/40 border border-orange-500/30 rounded text-[9px] font-black text-orange-400 uppercase tracking-widest hover:bg-orange-800/60 transition-all"
                >
                  <Download size={10} />
                  Install POS
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex flex-col items-end leading-tight">
              <p className="text-gray-400">SESSION: LOCAL_ONLY</p>
              <div className="flex items-center gap-2">
                <p className="text-orange-400 font-bold uppercase tracking-tighter truncate max-w-[100px]">{operator}</p>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut size={12} />
                </button>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-gray-700"></div>
            <div className="text-right leading-tight">
              <p className="text-gray-400 uppercase">{new Date().toLocaleDateString()}</p>
              <p className="text-lg font-bold leading-none">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar logoUrl={storeLogo} />
          <main className="flex-1 overflow-auto bg-[#E5E7EB]">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin']}><Inventory /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
              <Route path="/store" element={<ProtectedRoute allowedRoles={['admin']}><StoreSettingsPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
