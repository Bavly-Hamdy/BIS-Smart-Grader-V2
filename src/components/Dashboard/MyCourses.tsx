
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Calendar, 
  Users, 
  X, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  GraduationCap, 
  MoreVertical,
  Clock
} from 'lucide-react';
// @ts-ignore - fix for exported member error
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export interface Course {
  id: string;
  title: string;
  code: string;
  semester: string;
  description?: string;
  studentCount: number;
  instructorId: string;
  instructorName?: string;
  themeColor?: string;
  createdAt?: any;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

// --- Constants ---
const GRADIENTS = [
  'from-blue-600 to-cyan-500',
  'from-emerald-500 to-teal-400',
  'from-violet-600 to-purple-500',
  'from-orange-500 to-amber-400',
  'from-pink-600 to-rose-400',
  'from-indigo-600 to-blue-500',
];

const getRandomGradient = () => GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

// ==========================================
// INTERNAL COMPONENTS
// ==========================================

/**
 * ToastNotification
 * A custom animated toast message for user feedback.
 */
export const ToastNotification: React.FC<{ 
  state: ToastState; 
  onClose: () => void; 
}> = ({ state, onClose }) => {
  useEffect(() => {
    if (state.show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.show, onClose]);

  return (
    <AnimatePresence>
      {state.show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        >
          {state.type === 'success' ? (
            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {state.type === 'success' ? 'Success' : 'Error'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{state.message}</p>
          </div>
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * CourseSkeleton
 * Loading state placeholder.
 */
export const CourseSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
      <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
    </div>
    <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg mt-4"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
      <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
    </div>
  </div>
);

/**
 * CourseCard
 * Display component for a single course.
 */
export const CourseCard: React.FC<{ 
  course?: Course; 
  type?: 'default' | 'add';
  onClick?: () => void;
  // Legacy props for compatibility with DashboardHome if passing raw data
  title?: string;
  code?: string;
  studentCount?: number;
  description?: string;
}> = ({ course, type = 'default', onClick, title, code, studentCount, description }) => {
  
  // Handle "Add New" variant
  if (type === 'add') {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="h-full min-h-[220px] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer group hover:border-primary dark:hover:border-blue-400 transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
          <Plus className="h-6 w-6 text-slate-400 group-hover:text-primary dark:group-hover:text-blue-400" />
        </div>
        <h3 className="font-semibold text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">Create New Course</h3>
      </motion.div>
    );
  }

  // Normalize data (handle if course object is passed or individual props)
  const data = course || {
    id: 'temp',
    title: title || 'Untitled',
    code: code || 'N/A',
    semester: 'Current',
    description: description || '',
    studentCount: studentCount || 0,
    themeColor: 'from-blue-600 to-cyan-500'
  };

  const gradientClass = data.themeColor || 'from-blue-600 to-cyan-500';

  const CardContent = (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 group flex flex-col"
    >
      {/* Top Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass} bg-opacity-10 text-white shadow-lg shadow-blue-500/20`}>
            <BookOpen className="h-6 w-6" />
          </div>
          
          <span className="px-2.5 py-1 text-xs font-bold tracking-wide rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
            {data.code}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 transition-colors">
          {data.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 min-h-[2.5rem]">
          {data.description || 'No description provided for this course curriculum.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {data.semester}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {data.studentCount}
            </span>
          </div>
          
          <div className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // If onClick is provided, behave like a button (for dashboard view)
  if (onClick && !course?.id) {
    return <div onClick={onClick} className="cursor-pointer h-full">{CardContent}</div>;
  }

  // Otherwise link to course details
  return (
    <Link to={`/faculty/courses/${data.id}`} className="block h-full">
      {CardContent}
    </Link>
  );
};

/**
 * CreateCourseModal
 * Modal for adding a new course with validation and loading state.
 */
export const CreateCourseModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  showToast?: (msg: string, type: 'success' | 'error') => void;
  // Legacy prop
  onCourseAdded?: () => void;
}> = ({ isOpen, onClose, showToast, onCourseAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    semester: 'Fall 2024',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'courses'), {
        ...formData,
        instructorId: auth.currentUser.uid,
        instructorName: auth.currentUser.displayName || 'Faculty Member',
        studentCount: 0,
        createdAt: serverTimestamp(),
        themeColor: getRandomGradient()
      });

      if (showToast) showToast('Course created successfully!', 'success');
      if (onCourseAdded) onCourseAdded();
      
      setFormData({ title: '', code: '', semester: 'Fall 2024', description: '' });
      onClose();
    } catch (error) {
      console.error(error);
      if (showToast) showToast('Failed to create course.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim().length > 0 && formData.code.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Course</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set up a new curriculum for this semester.</p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Course Title</label>
                    <input 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Introduction to AI" 
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Course Code</label>
                      <input 
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. CS-101" 
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Semester</label>
                      <select 
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option>Fall 2024</option>
                        <option>Spring 2025</option>
                        <option>Fall 2025</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Brief overview of the curriculum..." 
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!isFormValid || loading}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// MAIN COMPONENT (MyCourses)
// ==========================================

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // Real-time Fetch
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'courses'),
      where('instructorId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      // Sort client-side (Newest first)
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setCourses(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary dark:text-blue-400" />
            My Courses
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
            Manage your curriculum, track student enrollment, and access grading tools.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Create New Course
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title, code, or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
        </div>
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2 px-4 text-sm text-slate-500">
          <span className="font-medium">{filteredCourses.length}</span> results found
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Skeletons
          [...Array(4)].map((_, i) => <CourseSkeleton key={i} />)
        ) : filteredCourses.length > 0 ? (
          // Course Cards
          filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          // Empty State
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No matches found' : 'No courses yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you are looking for.' 
                : 'Get started by creating your first course to begin managing your students and exams.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-primary dark:text-blue-400 font-medium hover:underline"
              >
                Create your first course now &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Internal Modals & Notifications */}
      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        showToast={showToast}
      />
      
      <ToastNotification 
        state={toast} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
};

export default MyCourses;
