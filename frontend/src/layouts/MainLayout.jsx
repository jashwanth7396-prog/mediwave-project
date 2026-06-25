import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiLogOut, FiMenu, FiHome, FiAlertTriangle, FiBarChart2, FiClipboard } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import { fetchNotificationSummary } from '../services/notificationService.js';

const navItems = [
  { label: 'Dashboard', to: '/', icon: <FiHome className="h-5 w-5" /> },
  { label: 'Medicines', to: '/medicines', icon: <FaPills className="h-5 w-5" /> },
  { label: 'Damaged Stock', to: '/damaged', icon: <FiAlertTriangle className="h-5 w-5" /> },
  { label: 'Returns', to: '/returns', icon: <FiPackage className="h-5 w-5" /> },
  { label: 'Reports', to: '/reports', icon: <FiBarChart2 className="h-5 w-5" /> },
  { label: 'Notifications', to: '/notifications', icon: <FiBell className="h-5 w-5" /> },
  { label: 'Audit Logs', to: '/audit', icon: <FiClipboard className="h-5 w-5" /> }
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotificationSummary = async () => {
      try {
        const { data } = await fetchNotificationSummary();
        setUnreadCount(data.unreadNotifications || 0);
      } catch (error) {
        console.error(error);
      }
    };

    loadNotificationSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col page-container px-4 py-4 md:px-6">
        <header className="mb-6 flex flex-col gap-4 rounded-[24px] bg-white/85 p-4 shadow-glass backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMenu(!showMenu)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 md:hidden">
              <FiMenu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-slate-500">Welcome back,</p>
              <h1 className="text-xl font-semibold text-slate-900">{user?.name || 'MediWave User'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-slate-500">Monitor inventory, damaged stock, returns and analytics from one place.</p>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
            </div>
            <button onClick={() => navigate('/notifications')} className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-sm transition hover:bg-sky-400">
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.65rem] font-semibold leading-none text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">{(user?.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-white transition hover:bg-red-600">
              <FiLogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          {showMenu && (
            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
              aria-label="Close menu"
            />
          )}
          <aside className={`glass-card flex flex-col gap-4 p-4 transition-all duration-300 ${showMenu ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} fixed inset-y-0 left-0 z-50 w-[280px] transform overflow-y-auto border-r border-slate-200 bg-white/95 shadow-2xl md:static md:top-4 md:translate-x-0 md:opacity-100 md:block md:w-[280px] md:sticky`}>
            <div className="space-y-4 border-b border-slate-200 pb-4">
              <div className="rounded-[24px] bg-gradient-to-r from-emerald-400 to-indigo-500 p-4 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] opacity-90">MediWave</p>
                <h2 className="mt-2 text-lg font-semibold">Inventory Pulse</h2>
              </div>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-[24px] px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'} `
                  }
                  onClick={() => setShowMenu(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <motion.main
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 min-w-0"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
