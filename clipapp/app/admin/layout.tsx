'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Compass, 
  AlertTriangle, 
  LogOut, 
  Lock, 
  Database,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

// Define Context Types
interface AdminContextType {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  user: User | null;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Throttling / Security state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLockout = localStorage.getItem('admin_lockout_until');
      const savedAttempts = localStorage.getItem('admin_failed_attempts');
      if (savedLockout) {
        const parsedLockout = parseInt(savedLockout, 10);
        if (parsedLockout > Date.now()) {
          setLockoutUntil(parsedLockout);
          setTimeLeft(Math.ceil((parsedLockout - Date.now()) / 1000));
        } else {
          localStorage.removeItem('admin_lockout_until');
        }
      }
      if (savedAttempts) {
        setFailedAttempts(parseInt(savedAttempts, 10));
      }
    }
  }, []);

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setTimeLeft(0);
        setFailedAttempts(0);
        setLoginError('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_lockout_until');
          localStorage.setItem('admin_failed_attempts', '0');
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const pathname = usePathname();
  const router = useRouter();

  // Listen to Firebase Auth state
  useEffect(() => {
    // If in demo mode, skip firebase listener
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // Handle live login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check lockout status
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setLoginError(`Demasiados intentos fallidos. Intenta de nuevo en ${timeLeft} segundos.`);
      return;
    }

    // Input validation & character limits
    const sanitizedEmail = email.trim();
    if (sanitizedEmail.length > 80 || password.length > 80) {
      setLoginError('El correo y la contraseña no deben exceder los 80 caracteres.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setLoginError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setLoginError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoginLoading(true);
    const startTime = Date.now();
    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      setIsDemoMode(false);
      setFailedAttempts(0);
      setLockoutUntil(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_lockout_until');
        localStorage.setItem('admin_failed_attempts', '0');
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error(error);
      
      // Delay response for security to slow down brute force speed
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
      }
      
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_failed_attempts', nextAttempts.toString());
      }

      if (nextAttempts >= 5) {
        const lockoutTime = Date.now() + 60 * 1000; // 60 seconds lockout
        setLockoutUntil(lockoutTime);
        setTimeLeft(60);
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_lockout_until', lockoutTime.toString());
        }
        setLoginError('Demasiados intentos fallidos. Acceso bloqueado temporalmente por 60 segundos.');
      } else {
        let errMsg = 'Credenciales inválidas.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          errMsg = 'Correo o contraseña incorrectos.';
        }
        setLoginError(`${errMsg} Intentos restantes: ${5 - nextAttempts}`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
    } else {
      await signOut(auth);
    }
    router.push('/admin');
  };

  // Navigation Links
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Provincias & Sectores', path: '/admin/provincias', icon: Map },
    { name: 'Usuarios', path: '/admin/usuarios', icon: Users },
    { name: 'Salidas (Cordada)', path: '/admin/salidas', icon: Compass },
    { name: 'Reportes', path: '/admin/reportes', icon: AlertTriangle },
  ];

  // If loading, show a beautiful dark spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-medium">Cargando Panel de Control...</p>
      </div>
    );
  }

  // If NOT logged in (no user), show modern dark login page
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">ClipApp Admin</h1>
            <p className="text-sm text-zinc-400 mt-2">Panel de Administración de Vías e Información</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-800/40 text-red-200 text-sm rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={80}
                placeholder="admin@clipapp.com"
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={80}
                placeholder="••••••••"
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 transition outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading || !!lockoutUntil}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-zinc-950 font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Iniciando sesión...' : lockoutUntil ? `Bloqueado (${timeLeft}s)` : 'Iniciar Sesión (Firebase)'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If logged in, render Dashboard with Navigation Sidebar
  return (
    <AdminContext.Provider value={{ isDemoMode, setIsDemoMode, user, loading }}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        
        {/* Sidebar */}
        <aside className={`bg-zinc-900 border-r border-zinc-800 flex flex-col z-20 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          {/* Logo Section */}
          <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <span className="font-black text-zinc-950 text-sm">C</span>
              </div>
              {sidebarOpen && <span className="font-extrabold text-white tracking-wide text-lg">ClipApp Admin</span>}
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-800 rounded-md"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Connection Indicator */}
          {sidebarOpen && (
            <div className="px-4 py-3 border-b border-zinc-800/50">
              {isDemoMode ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs">
                  <Database className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                  <span>Modo Demo (Estado Local)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                  <Database className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Conectado a Firebase</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive 
                      ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10 font-bold' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-emerald-400'}`} />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
            {sidebarOpen ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/40 border border-zinc-800/40">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-zinc-200 truncate">{user.displayName || 'Admin'}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="h-16 border-b border-zinc-800 bg-zinc-900/40 px-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {navItems.find(item => pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path)))?.name || 'Administración'}
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-full">
                Versión Web 1.0.0
              </span>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto bg-zinc-950/20">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
