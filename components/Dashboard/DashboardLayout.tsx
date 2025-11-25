import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search
} from 'lucide-react';
import { auth } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/faculty-dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/faculty-dashboard/courses' },
    { icon: Users, label: 'Students', path: '/faculty-dashboard/students' },
    { icon: Settings, label: 'Settings', path: '/faculty-dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-blue-900/20 p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-primary dark:text-blue-400" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">Smart Grader</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/5 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar Overlay */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10">
          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-md mx-4 hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search courses or students..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-8 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
              DR
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 md:hidden flex flex-col"
              >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">Smart Grader</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6 text-slate-500" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary/5 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;