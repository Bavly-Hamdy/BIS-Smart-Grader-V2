import React, { useState, useEffect } from 'react';
import {
    Moon,
    Sun,
    Monitor,
    Globe,
    Type,
    Eye,
    Bell,
    Shield,
    Lock,
    LogOut,
    Check,
    ChevronRight,
    Loader,
    CheckCircle2,
    Settings,
    User,
    Laptop,
    ArrowLeft
} from 'lucide-react';
import Button from '../Button';
import { auth, db } from '../../firebase/firebaseConfig';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t, setLanguage, language, dir } = useLanguage();
    const isRTL = language === 'ar';
    const { addToast } = useToast();
    const { theme, setTheme: setGlobalTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security'>('appearance');

    // Accessibility State
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
    });

    // Load settings from Firestore on mount
    useEffect(() => {
        const loadSettings = async () => {
            if (!auth.currentUser) return;
            const docRef = doc(db, 'faculty', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().settings) {
                const settings = docSnap.data().settings;
                if (settings.theme) {
                    setGlobalTheme(settings.theme);
                }
                if (settings.fontSize) {
                    setFontSize(settings.fontSize);
                    applyFontSize(settings.fontSize);
                }
                if (settings.highContrast !== undefined) {
                    setHighContrast(settings.highContrast);
                    applyHighContrast(settings.highContrast);
                }
                if (settings.reducedMotion !== undefined) {
                    setReducedMotion(settings.reducedMotion);
                    applyReducedMotion(settings.reducedMotion);
                }
                if (settings.notifications) setNotifications(settings.notifications);
            } else {
                // Fallback to local storage
                const savedTheme = localStorage.getItem('theme') as any || 'system';
                const savedFontSize = localStorage.getItem('fontSize') as any || 'medium';
                setGlobalTheme(savedTheme);
                applyFontSize(savedFontSize);
            }
        };
        loadSettings();
    }, []);

    // Save settings to Firestore
    const saveSettings = async (newSettings: any) => {
        if (!auth.currentUser) return;
        try {
            const docRef = doc(db, 'faculty', auth.currentUser.uid);
            await setDoc(docRef, { settings: newSettings }, { merge: true });
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };


    const applyFontSize = (size: string) => {
        const root = window.document.documentElement;
        root.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
    };

    const applyHighContrast = (enabled: boolean) => {
        if (enabled) document.body.classList.add('high-contrast');
        else document.body.classList.remove('high-contrast');
    };

    const applyReducedMotion = (enabled: boolean) => {
        if (enabled) document.body.classList.add('reduced-motion');
        else document.body.classList.remove('reduced-motion');
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setGlobalTheme(newTheme);
        saveSettings({ theme: newTheme });
        addToast(t('theme_set_success').replace('{theme}', t(newTheme)), 'success');
    };

    const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
        setFontSize(newSize);
        localStorage.setItem('fontSize', newSize);
        applyFontSize(newSize);
        saveSettings({ fontSize: newSize });
        addToast(t('font_size_updated'), 'success');
    };

    const handleHighContrastChange = (val: boolean) => {
        setHighContrast(val);
        applyHighContrast(val);
        saveSettings({ highContrast: val });
        addToast(val ? t('high_contrast_enabled') : t('high_contrast_disabled'), 'info');
    };

    const handleReducedMotionChange = (val: boolean) => {
        setReducedMotion(val);
        applyReducedMotion(val);
        saveSettings({ reducedMotion: val });
        addToast(val ? t('reduced_motion_enabled') : t('reduced_motion_disabled'), 'info');
    };

    const handleNotificationChange = async (key: string) => {
        let newVal = !notifications[key as keyof typeof notifications];

        // Real Browser Permission Request for Push
        if (key === 'push' && newVal === true) {
            if (!("Notification" in window)) {
                addToast(t('browser_not_support_notifications'), 'error');
                return;
            }
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                addToast(t('notification_permission_denied'), 'warning');
                newVal = false;
            } else {
                addToast(t('push_notifications_enabled'), 'success');
                new Notification(t('test_notification_title'), {
                    body: t('test_notification_body')
                });
            }
        } else {
            if (newVal) {
                addToast(key === 'email' ? t('email_notifications_enabled') : t('push_notifications_enabled'), 'success');
            } else {
                addToast(key === 'email' ? t('email_notifications_disabled') : t('push_notifications_disabled'), 'info');
            }
        }

        const newNotifs = { ...notifications, [key]: newVal };
        setNotifications(newNotifs);
        saveSettings({ notifications: newNotifs });
    };

    const handleChangePassword = async () => {
        if (!auth.currentUser?.email) return;
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, auth.currentUser.email);
            addToast(t('password_reset_sent').replace('{email}', auth.currentUser.email), 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'appearance', label: t('appearance'), icon: Monitor },
        { id: 'general', label: t('language_region'), icon: Globe },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'security', label: t('security'), icon: Shield },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12" dir={dir}>

            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 end-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -me-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 start-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -ms-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 md:p-10">
                    <button
                        onClick={() => navigate('/faculty-dashboard')}
                        className="flex items-center text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mb-4 font-medium group"
                    >
                        <ArrowLeft className={`h-4 w-4 me-2 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                        {t('back_to_overview')}
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                        {t('settings_title')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                        {t('settings_subtitle') || "Manage your preferences, account settings, and notification preferences."}
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                            {tab.label}
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={async () => {
                                await signOut(auth);
                                navigate('/login');
                                addToast(t('sign_out_success'), 'info');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            {t('sign_out')}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'appearance' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                                <Monitor className="h-6 w-6 text-indigo-500" />
                                                {t('theme_preferences')}
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'light', icon: Sun, label: t('light') },
                                                    { id: 'dark', icon: Moon, label: t('dark') },
                                                    { id: 'system', icon: Laptop, label: t('system') },
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleThemeChange(option.id as any)}
                                                        className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${theme === option.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                                                            }`}
                                                    >
                                                        {theme === option.id && (
                                                            <div className="absolute top-3 end-3 text-indigo-500">
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <option.icon className={`h-8 w-8 mb-4 ${theme === option.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                                        <span className="font-bold">{option.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                                <Eye className="h-6 w-6 text-purple-500" />
                                                {t('accessibility')}
                                            </h2>

                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <label className="font-semibold text-slate-700 dark:text-slate-300">{t('interface_font_size')}</label>
                                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                                                            {t(fontSize)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                                                        {(['small', 'medium', 'large'] as const).map((size) => (
                                                            <button
                                                                key={size}
                                                                onClick={() => handleFontSizeChange(size)}
                                                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${fontSize === size
                                                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white transform scale-[1.02]'
                                                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                                    }`}
                                                            >
                                                                {size === 'small' ? t('compact') : size === 'medium' ? t('default') : t('comfortable')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{t('high_contrast')}</h3>
                                                            <p className="text-sm text-slate-500 mt-0.5">{t('high_contrast_desc')}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleHighContrastChange(!highContrast)}
                                                            className={`w-14 h-8 rounded-full transition-all relative focus:outline-none ${highContrast ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                        >
                                                            <span className={`absolute top-1 start-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${highContrast ? (isRTL ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{t('reduced_motion')}</h3>
                                                            <p className="text-sm text-slate-500 mt-0.5">{t('reduced_motion_desc')}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleReducedMotionChange(!reducedMotion)}
                                                            className={`w-14 h-8 rounded-full transition-all relative focus:outline-none ${reducedMotion ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                        >
                                                            <span className={`absolute top-1 start-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${reducedMotion ? (isRTL ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'general' && (
                                    <div className="space-y-8">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Globe className="h-6 w-6 text-cyan-500" />
                                            {t('language_region')}
                                        </h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => {
                                                    setLanguage('en');
                                                    addToast('Language changed to English', 'success');
                                                }}
                                                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${language === 'en'
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-4xl shadow-sm rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">🇺🇸</span>
                                                    <div className="text-start">
                                                        <p className={`font-bold text-lg ${language === 'en' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>English</p>
                                                        <p className="text-sm text-slate-500">{t('united_states')}</p>
                                                    </div>
                                                </div>
                                                {language === 'en' && <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div>}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setLanguage('ar');
                                                    addToast('تم تغيير اللغة إلى العربية', 'success');
                                                }}
                                                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${language === 'ar'
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-4xl shadow-sm rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">🇪🇬</span>
                                                    <div className="text-start">
                                                        <p className={`font-bold text-lg ${language === 'ar' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>العربية</p>
                                                        <p className="text-sm text-slate-500">{t('egypt')}</p>
                                                    </div>
                                                </div>
                                                {language === 'ar' && <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-8">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Bell className="h-6 w-6 text-amber-500" />
                                            {t('notification_preferences')}
                                        </h2>

                                        <div className="space-y-4">
                                            {[
                                                { id: 'email', label: t('email_notifications'), desc: t('email_notifications_desc') },
                                                { id: 'push', label: t('push_notifications'), desc: t('push_notifications_desc') },
                                            ].map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{item.label}</h3>
                                                        <p className="text-slate-500 max-w-lg mt-1">{item.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleNotificationChange(item.id)}
                                                        className={`w-14 h-8 rounded-full transition-all relative focus:outline-none ${notifications[item.id as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                    >
                                                        <span className={`absolute top-1 start-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${notifications[item.id as keyof typeof notifications] ? (isRTL ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-8">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Shield className="h-6 w-6 text-emerald-500" />
                                            {t('security_settings')}
                                        </h2>

                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-emerald-600">
                                                    <Lock className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t('password_auth')}</h3>
                                                    <p className="text-slate-500 mt-1">{t('password_auth_desc')}</p>

                                                    <div className="mt-6">
                                                        <Button
                                                            onClick={handleChangePassword}
                                                            disabled={loading}
                                                            className="w-full sm:w-auto flex items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm px-6 py-4 h-auto"
                                                        >
                                                            <div className="text-start">
                                                                <span className="block font-bold">{t('change_password')}</span>
                                                                <span className="text-xs text-slate-400 font-normal">{t('change_password_desc')}</span>
                                                            </div>
                                                            {loading ? <Loader className="h-5 w-5 animate-spin text-indigo-500" /> : <ChevronRight className={`h-5 w-5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
