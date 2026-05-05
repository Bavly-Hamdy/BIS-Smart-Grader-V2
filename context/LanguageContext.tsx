import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

const translations: Translations = {
    en: {
        // Sidebar
        'overview': 'Overview',
        'profile': 'Profile',
        'exams': 'Exams',
        'my_courses': 'My Courses',
        'students': 'Students',
        'settings': 'Settings',
        'sign_out': 'Sign Out',
        'smart_grader': 'E-WRITTEN',
        'faculty_space': 'Faculty Space',
        'main': 'Main',
        'academic': 'Academic',
        'account': 'Account',

        // Dashboard Home
        'academic_dashboard': 'Academic Dashboard',
        'welcome_back': 'Welcome back, Doctor.',
        'active_courses': 'Active Courses',
        'total_students': 'Total Students',
        'pending_papers': 'Pending Papers',
        'graded_this_week': 'Graded This Week',
        'average_grade': 'Average Grade',
        'grade_distribution': 'Grade Distribution',
        'pass_fail_analysis': 'Pass vs. Fail Analysis',
        'passed': 'Passed',
        'failed': 'Failed',
        'view_all': 'View All',

        // Settings
        'settings_title': 'Settings & Preferences',
        'settings_subtitle': 'Customize your workspace to fit your needs.',
        'appearance': 'Appearance',
        'theme': 'Theme',
        'light': 'Light',
        'dark': 'Dark',
        'system': 'System',
        'accessibility': 'Accessibility',
        'font_size': 'Font Size',
        'high_contrast': 'High Contrast Mode',
        'reduced_motion': 'Reduced Motion',
        'language_region': 'Language & Region',
        'notifications': 'Notifications',
        'security': 'Security & Login',
        'change_password': 'Change Password',
        'danger_zone': 'Danger Zone',
        'email_notifications': 'Email Notifications',
        'push_notifications': 'Push Notifications'
    },
    ar: {
        // Sidebar
        'overview': 'نظرة عامة',
        'profile': 'الملف الشخصي',
        'exams': 'الامتحانات',
        'my_courses': 'موادي الدراسية',
        'students': 'الطلاب',
        'settings': 'الإعدادات',
        'sign_out': 'تجيل خروج',
        'smart_grader': 'E-WRITTEN',
        'faculty_space': 'مساحة أعضاء هيئة التدريس',
        'main': 'الرئيسية',
        'academic': 'أكاديمي',
        'account': 'الحساب',

        // Dashboard Home
        'academic_dashboard': 'لوحة القيادة الأكاديمية',
        'welcome_back': 'أهلاً بك يا دكتور.',
        'active_courses': 'الدورات النشطة',
        'total_students': 'إجمالي الطلاب',
        'pending_papers': 'أوراق قيد الانتظار',
        'graded_this_week': 'تم تصحيحها هذا الأسبوع',
        'average_grade': 'متوسط الدرجات',
        'grade_distribution': 'توزيع الدرجات',
        'pass_fail_analysis': 'تحليل النجاح والرسوب',
        'passed': 'ناجح',
        'failed': 'راسب',
        'view_all': 'عرض الكل',

        // Settings
        'settings_title': 'الإعدادات والتفضيلات',
        'settings_subtitle': 'قم بتخصيص مساحة العمل الخاصة بك.',
        'appearance': 'المظهر',
        'theme': 'السمة',
        'light': 'فاتح',
        'dark': 'داكن',
        'system': 'النظام',
        'accessibility': 'إمكانية الوصول',
        'font_size': 'حجم الخط',
        'high_contrast': 'تباين عالي',
        'reduced_motion': 'تقليل الحركة',
        'language_region': 'اللغة والمنطقة',
        'notifications': 'الإشعارات',
        'security': 'الأمان وتسجيل الدخول',
        'change_password': 'تغيير كلمة المرور',
        'danger_zone': 'منطقة الخطر',
        'email_notifications': 'إشعارات البريد الإلكتروني',
        'push_notifications': 'الإشعارات الفورية'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang) {
            setLanguageState(savedLang);
            document.documentElement.lang = savedLang;
            document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir: language === 'ar' ? 'rtl' : 'ltr' }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
