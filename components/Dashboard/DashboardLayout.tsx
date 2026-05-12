
import React, { useState, useEffect } from 'react';
// @ts-ignore - fix for exported member error
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
  Search,
  UserCircle,
  FileText,
  GraduationCap,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { auth, db } from '../../firebase/firebaseConfig';
// @ts-ignore - fix for exported member error
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FacultyProfile, Notification } from '../../types';
import { fetchNotifications } from '../../services/notificationService';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [facultyData, setFacultyData] = useState<FacultyProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchFacultyData();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const fetchFacultyData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const facultyDoc = await getDoc(doc(db, 'faculty', user.uid));
        if (facultyDoc.exists()) {
          setFacultyData(facultyDoc.data() as FacultyProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    }
  };

  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('overview'), path: '/faculty-dashboard' },
    { icon: UserCircle, label: t('profile'), path: '/faculty-dashboard/profile' },
    { icon: FileText, label: t('exams'), path: '/faculty-dashboard/exams' },
    { icon: BookOpen, label: t('my_courses'), path: '/faculty-dashboard/courses' },
    { icon: Users, label: t('students'), path: '/faculty-dashboard/students' },
    { icon: Settings, label: t('settings'), path: '/faculty-dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar for Desktop */}
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-20 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-gradient-to-tr from-primary to-blue-600 dark:from-blue-600 dark:to-blue-400 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight block">E-WRITTEN</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Faculty Space</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Main Section */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Main</h3>
            <div className="space-y-1">
              <button
                onClick={() => navigate('/faculty-dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${location.pathname === '/faculty-dashboard'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <LayoutDashboard className={`h-5 w-5 ${location.pathname === '/faculty-dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                Overview
              </button>
            </div>
          </div>

          {/* Academic Section */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Academic</h3>
            <div className="space-y-1">
              {[
                { icon: FileText, label: 'Exams Manager', path: '/faculty-dashboard/exams' },
                { icon: BookOpen, label: 'My Courses', path: '/faculty-dashboard/courses' },
                { icon: Users, label: 'Students', path: '/faculty-dashboard/students' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${location.pathname.startsWith(item.path)
                    ? 'bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname.startsWith(item.path) ? 'text-primary dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Account</h3>
            <div className="space-y-1">
              {[
                { icon: UserCircle, label: 'My Profile', path: '/faculty-dashboard/profile' },
                { icon: Settings, label: 'Settings', path: '/faculty-dashboard/settings' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${location.pathname === item.path
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group"
          >
            <div className="bg-red-100 dark:bg-red-900/20 p-1.5 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar Overlay */}
      <div className="flex-1 flex flex-col md:ml-72 transition-all duration-300">
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

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors focus:outline-none rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors relative focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-40 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {unreadCount} New
                        </span>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                if (notification.link) navigate(notification.link);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors flex items-start gap-3"
                            >
                              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.type === 'alert' ? 'bg-red-500' :
                                notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`} />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{notification.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary dark:text-blue-400 font-medium hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors focus:outline-none"
              >
                <div className="h-8 w-8 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {facultyData?.fullName?.charAt(0).toUpperCase() || 'DR'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{facultyData?.fullName || 'Loading...'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{facultyData?.academicRank || ''}</p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-40"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {facultyData?.fullName || 'Faculty Member'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {facultyData?.email || ''}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigate('/faculty-dashboard/profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        Manage Account
                      </button>

                      <button
                        onClick={() => {
                          navigate('/faculty-dashboard/settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 confirm-logout-separator"></div>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </motion.div>
                  </>
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
                  <span className="font-bold text-lg text-slate-900 dark:text-white">E-WRITTEN</span>
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
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${location.pathname === item.path
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
      </div >
    </div >
  );
};

export default DashboardLayout;
