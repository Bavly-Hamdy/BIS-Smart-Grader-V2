
import React, { useState } from 'react';
// @ts-ignore - fix for exported member error
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  School, 
  Lock, 
  Mail, 
  ArrowRight,
  AlertCircle,
  User
} from 'lucide-react';
import Button from './Button';
import { auth, db } from '../firebase/firebaseConfig';
// @ts-ignore - fix for exported member error
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  // Removed 'role' state entirely as it's faculty only now
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        // 1. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Auth Profile
        await updateProfile(user, { displayName: fullName });

        // 3. Create User Document in Firestore (Always 'faculty' collection)
        const userData = { 
          uid: user.uid, 
          email: user.email, 
          fullName, 
          role: 'faculty', 
          createdAt: new Date().toISOString(),
          courses: []
        };

        await setDoc(doc(db, 'faculty', user.uid), userData);
        navigate('/faculty/overview');

      } else {
        // Login Logic
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verify if user is faculty
        const userDoc = await getDoc(doc(db, 'faculty', user.uid));

        if (userDoc.exists()) {
          navigate('/faculty/overview');
        } else {
          // If for some reason a student tries to login here (e.g. old account), block them
          setError("Access denied. No faculty account found.");
          await auth.signOut();
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Left Panel - Visuals */}
      <div className="md:w-1/2 bg-slate-900 relative overflow-hidden flex flex-col justify-between p-8 md:p-12 lg:p-16 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-slate-900/90 mix-blend-multiply"></div>
          <img 
            src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="University Campus" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>

        <div className="relative z-10">
          <div 
            className="flex items-center gap-3 cursor-pointer mb-12"
            onClick={() => navigate('/')}
          >
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-blue-300" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              E- <span className="text-blue-400">Written</span>
            </span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Empowering Academic Excellence through AI.
            </h1>
            <p className="text-lg text-blue-100 max-w-md leading-relaxed">
              Streamline your grading workflow, analyze student performance, and reclaim your valuable time.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12 flex items-center gap-4 text-sm text-blue-200/60">
          <span>© 2025 Assiut University</span>
          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
          <span>BIS Department</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          
          {/* Role Switcher Removed Completely */}

          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <School className="h-3 w-3" />
              Faculty Portal
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {mode === 'login' 
                ? 'Sign in to manage your courses and exams' 
                : 'Register as a new faculty member'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="e.g. Dr. Ahmed Hassan"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="name@bis.edu.eg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              variant="primary"
              className="w-full justify-center py-3"
              isLoading={isLoading}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {mode === 'login' ? "New faculty member?" : "Already have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="font-semibold text-primary dark:text-blue-400 hover:underline"
              >
                {mode === 'login' ? 'Register now' : 'Sign in'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
