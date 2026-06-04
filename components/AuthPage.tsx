import React, { useState } from 'react';
// @ts-ignore - fix for exported member error
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  School,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import Button from './Button';
import { auth, db } from '../firebase/firebaseConfig';
// @ts-ignore - fix for exported member error
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');

  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [academicRank, setAcademicRank] = useState<string>('Assistant Professor');
  const [specialization, setSpecialization] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email domain validation
  const validateUniversityEmail = (emailStr: string): boolean => {
    return emailStr.toLowerCase().endsWith('.edu.eg');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast(t('enter_email_first'), 'warning');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      addToast(t('password_reset_sent').replace('{email}', email), 'success');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError(isRTL ? "لا يوجد حساب بهذا البريد الإلكتروني." : "No user found with this email.");
      } else {
        setError(err.message || (isRTL ? "فشل إرسال البريد الإلكتروني لإعادة التعيين." : "Failed to send reset email."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate university email for registration
    if (mode === 'register' && !validateUniversityEmail(email)) {
      setError(t('email_invalid_domain'));
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          uid: user.uid,
          email: user.email,
          fullName,
          department,
          academicRank,
          specialization,
          role: 'faculty',
          courses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'faculty', user.uid), userData);
        
        // Force sign out immediately after registration to prevent auto-login redirect
        await signOut(auth);
        
        // Switch view variant to Sign In
        setMode('login');
        setPassword(''); // Clear password field for safety
        
        // Localized Success Toast
        addToast(t('account_created_success'), 'success');

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'faculty', user.uid));

        if (userDoc.exists()) {
          navigate('/faculty-dashboard');
        } else {
          setError(isRTL ? "لا يوجد حساب هيئة تدريس مسجل بهذه البيانات." : "No faculty account found with these credentials.");
          await signOut(auth);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError(isRTL ? "البريد الإلكتروني أو كلمة المرور غير صالحة." : "Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError(isRTL ? "هذا البريد الإلكتروني مسجل بالفعل." : "This email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError(isRTL ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل." : "Password should be at least 6 characters.");
      } else {
        setError(isRTL ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row font-sans overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Panel - Premium Visuals */}
      <div className="md:w-1/2 relative hidden md:flex flex-col justify-between p-12 lg:p-16 text-white overflow-hidden bg-slate-900">

        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-violet-600/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-900/90 backdrop-blur-[1px]"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer mb-8"
              onClick={() => navigate('/')}
            >
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg ring-1 ring-white/20">
                <GraduationCap className="h-7 w-7 text-violet-200" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white/90">
                E- <span className="text-violet-300">WRITTEN</span>
              </span>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); navigate('/'); }}
              className="group flex items-center gap-2 text-slate-300 hover:text-white transition-all px-4 py-2 rounded-lg hover:bg-white/5 w-fit"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
              <span className="text-sm font-medium">{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 backdrop-blur-sm text-violet-200 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{isRTL ? 'بوابة أعضاء هيئة التدريس الآمنة' : 'Secure Faculty Portal'}</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
              {isRTL ? (
                <>
                  تمكين التميز <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-blue-200">
                    الأكاديمي
                  </span>
                </>
              ) : (
                <>
                  Empowering <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-blue-200">
                    Academic Excellence
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              {isRTL 
                ? 'جرب الجيل القادم من تصحيح الامتحانات. تقييم مبسط، تحليلات ذكية، وأمان لا يضاهى.' 
                : 'Experience the next generation of grading. Streamlined assessment, intelligent analytics, and uncompromised security.'}
            </p>
          </motion.div>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-500" /> {isRTL ? 'دخول مصرح به' : 'Authorized Access'}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-500" /> {isRTL ? 'بيانات مشفرة' : 'Encrypted Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-white dark:bg-slate-950">
        <div className="w-full max-w-[480px] space-y-8 relative z-10">

          <div className="space-y-2 text-center md:text-start">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' 
                ? (isRTL ? 'مرحباً بك مجدداً' : 'Welcome Back') 
                : (isRTL ? 'تسجيل أعضاء هيئة التدريس' : 'Faculty Registration')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {mode === 'login'
                ? (isRTL ? 'سجل الدخول لإدارة مقرراتك ودرجاتك.' : 'Sign in to manage your courses and grades.')
                : (isRTL ? 'انضم إلى شبكة أعضاء هيئة التدريس للبدء.' : 'Join the faculty network to get started.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {isRTL ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <div className="relative group">
                        <User className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors`} />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white`}
                          placeholder={isRTL ? 'د. جون دو' : 'Dr. John Doe'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {isRTL ? 'القسم' : 'Department'}
                      </label>
                      <div className="relative group">
                        <School className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors`} />
                        <input
                          type="text"
                          required
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white text-sm`}
                          placeholder={isRTL ? 'قسم نظم المعلومات' : 'IS Dept'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {isRTL ? 'الدرجة العلمية' : 'Rank'}
                      </label>
                      <select
                        required
                        value={academicRank}
                        onChange={(e) => setAcademicRank(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white text-sm cursor-pointer"
                      >
                        <option value="Professor">{isRTL ? 'أستاذ' : 'Professor'}</option>
                        <option value="Associate Professor">{isRTL ? 'أستاذ مساعد' : 'Assoc. Prof'}</option>
                        <option value="Assistant Professor">{isRTL ? 'مدرس' : 'Assist. Prof'}</option>
                        <option value="Lecturer">{isRTL ? 'مدرس مساعد' : 'Lecturer'}</option>
                        <option value="Teaching Assistant">{isRTL ? 'معيد' : 'TA'}</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {isRTL ? 'التخصص' : 'Specialization'}
                      </label>
                      <input
                        type="text"
                        required
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white"
                        placeholder={isRTL ? 'مثال: الذكاء الاصطناعي' : 'e.g. Artificial Intelligence'}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isRTL ? 'البريد الإلكتروني الجامعي' : 'University Email'}
                  {mode === 'register' && <span className="text-xs text-violet-500 ml-2 font-normal">(*.edu.eg)</span>}
                </label>
                <div className="relative group">
                  <Mail className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white placeholder:text-slate-400`}
                    placeholder="user@bis.edu.eg"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'كلمة المرور' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                    >
                      {t('forgot_password')}
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors`} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white placeholder:text-slate-400 font-mono`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-relaxed">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-4 text-base font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
              isLoading={isLoading}
            >
              {mode === 'login' 
                ? (isRTL ? 'تسجيل الدخول إلى لوحة التحكم' : 'Sign In to Dashboard') 
                : (isRTL ? 'إنشاء حساب هيئة التدريس' : 'Create Faculty Account')}
              {!isLoading && <ArrowRight className={`ml-2 h-5 w-5 ${isRTL ? 'rotate-180 mr-2 ml-0' : ''}`} />}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-600 dark:text-slate-400">
              {mode === 'login' 
                ? (isRTL ? "ليس لديك حساب؟" : "Don't have an account?") 
                : (isRTL ? "مسجل بالفعل؟" : "Already registered?")}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold text-violet-600 hover:text-violet-700 transition-colors ml-1 cursor-pointer bg-transparent border-0 p-0 outline-none"
              >
                {mode === 'login' 
                  ? (isRTL ? 'سجل الآن' : 'Register now') 
                  : (isRTL ? 'تسجيل الدخول' : 'Sign in')}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
