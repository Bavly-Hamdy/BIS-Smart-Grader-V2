import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  ChevronDown
} from 'lucide-react';
import { auth, db } from '../../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string, role: string } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'faculty', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as any);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    fetchProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/faculty/overview' },
    { icon: BookOpen, label: 'My Courses', path: '/faculty/courses' },
    { icon: Users, label: 'Students', path: '/faculty/students' },
    { icon: Settings, label: 'Settings', path: '/faculty/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-blue-900/20 p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-primary dark:text-blue-400" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Smart Grader</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary/5 text-primary dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      <p>No new notifications</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                   {userProfile?.fullName ? userProfile.fullName.charAt(0) : <User className="h-4 w-4" />}
                </div>
                <div className="hidden lg:block text-left mr-1">
                   <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">
                     {userProfile?.fullName || 'Faculty Member'}
                   </p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instructor</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
                       <p className="text-sm font-medium text-slate-900 dark:text-white">
                         {userProfile?.fullName || 'Faculty Member'}
                       </p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">Instructor</p>
                    </div>
                    <button onClick={() => navigate('/faculty/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Profile Settings
                    </button>
                    <button onClick={() => navigate('/faculty/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Help Center
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-primary/5 text-primary dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area - THE OUTLET IS CRITICAL HERE */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
