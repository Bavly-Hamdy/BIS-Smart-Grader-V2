import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebaseConfig';
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
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// UTILITIES
// ==========================================

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// TYPES
// ==========================================

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

// ==========================================
// CONSTANTS
// ==========================================

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
// INTERNAL COMPONENTS (All Defined Before Main Export)
// ==========================================

/**
 * ToastNotification
 * Green success toast with smooth animations
 */
const ToastNotification: React.FC<{ 
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
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl bg-white dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50"
        >
          {state.type === 'success' ? (
            <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-full shadow-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="p-1.5 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 rounded-full shadow-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {state.type === 'success' ? 'Success' : 'Error'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{state.message}</p>
          </div>
          <button 
            onClick={onClose} 
            className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * CourseSkeleton
 * Pulsing loading placeholder with glassmorphism
 */
const CourseSkeleton: React.FC = () => (
  <div className="relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6 space-y-4 overflow-hidden">
    {/* Pulsing animation overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-slate-700/20 to-transparent animate-shimmer" />
    
    <div className="flex justify-between items-start relative z-10">
      <div className="h-12 w-12 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl animate-pulse"></div>
      <div className="h-7 w-20 bg-slate-200/60 dark:bg-slate-700/60 rounded-md animate-pulse"></div>
    </div>
    
    <div className="space-y-2 pt-2 relative z-10">
      <div className="h-6 w-3/4 bg-slate-200/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
      <div className="h-4 w-1/2 bg-slate-200/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
    </div>
    
    <div className="h-16 w-full bg-slate-100/60 dark:bg-slate-700/40 rounded-lg mt-4 relative z-10 animate-pulse"></div>
    
    <div className="flex justify-between items-center pt-2 relative z-10">
      <div className="h-4 w-24 bg-slate-200/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
      <div className="h-8 w-8 bg-slate-200/60 dark:bg-slate-700/60 rounded-full animate-pulse"></div>
    </div>
  </div>
);

/**
 * CourseCard
 * Glassmorphism card with gradient borders on hover
 * Supports both regular course display and "add new" variant
 */
export const CourseCard: React.FC<{ 
  course?: Course;
  type?: 'default' | 'add';
  onClick?: () => void;
}> = ({ course, type = 'default', onClick }) => {
  // Handle "Add New" variant
  if (type === 'add') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -8 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="h-full min-h-[220px] bg-white/60 dark:bg-slate-800/50 backdrop-blur-md border-2 border-dashed border-slate-300/50 dark:border-slate-700/50 rounded-xl flex flex-col items-center justify-center cursor-pointer group hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className="w-14 h-14 rounded-full bg-slate-100/80 dark:bg-slate-700/60 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
          <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </div>
        <h3 className="font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Create New Course</h3>
      </motion.div>
    );
  }

  // Regular course card
  if (!course) return null;

  const gradientClass = course.themeColor || 'from-blue-600 to-cyan-500';

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative h-full bg-white/60 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-blue-900/20 transition-all duration-300 flex flex-col group"
    >
      {/* Gradient Top Border */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      {/* Hover gradient border effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none`} />

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-shadow`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          
          <span className="px-3 py-1 text-xs font-bold tracking-wide rounded-lg bg-slate-100/80 dark:bg-slate-700/60 backdrop-blur-sm text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600/50 font-mono">
            {course.code}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300">
          {course.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 min-h-[2.5rem] flex-1">
          {course.description || 'No description provided for this course curriculum.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {course.semester}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {course.studentCount}
            </span>
          </div>
          
          <div className="p-1.5 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // If onClick is provided and course has id, wrap in button/link behavior
  if (onClick) {
    return <div onClick={onClick} className="cursor-pointer h-full">{CardContent}</div>;
  }

  // Default: Link to course detail page
  return (
    <Link to={`/faculty/courses/${course.id}`} className="block h-full">
      {CardContent}
    </Link>
  );
};

/**
 * CreateCourseModal
 * Modal with form validation and loading state
 */
export const CreateCourseModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}> = ({ isOpen, onClose, showToast }) => {
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

      showToast('Course created successfully!', 'success');
      setFormData({ title: '', code: '', semester: 'Fall 2024', description: '' });
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      showToast('Failed to create course. Please try again.', 'error');
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Course</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set up a new curriculum for this semester.</p>
                </div>
                <button 
                  onClick={onClose} 
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Introduction to AI" 
                      required
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Course Code <span className="text-red-500">*</span>
                      </label>
                      <input 
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. CS-101" 
                        required
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Semester</label>
                      <select 
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                      >
                        <option>Fall 2024</option>
                        <option>Spring 2025</option>
                        <option>Fall 2025</option>
                        <option>Spring 2026</option>
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
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!isFormValid || loading}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Course'
                    )}
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
// MAIN COMPONENT
// ==========================================

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // Real-time Firestore listener with onSnapshot
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'courses'),
      where('instructorId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];

        // Sort by creation date (newest first)
        data.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setCourses(data);
        setLoading(false);
      }, 
      (error) => {
        console.error('Firestore Error:', error);
        setLoading(false);
        showToast('Failed to load courses. Please refresh the page.', 'error');
      }
    );

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            My Courses
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
            Manage your curriculum, track student enrollment, and access grading tools.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        >
          <Plus className="h-5 w-5" />
          Create New Course
        </motion.button>
      </motion.div>

      {/* Search & Filter Bar with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center shadow-lg hover:shadow-xl transition-shadow"
      >
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
        <div className="h-8 w-[1px] bg-slate-200/50 dark:bg-slate-700/50 mx-2 hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2 px-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-white">{filteredCourses.length}</span>
          <span>results found</span>
        </div>
      </motion.div>

      {/* Grid Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {loading ? (
          // Loading Skeletons
          [...Array(4)].map((_, i) => (
            <CourseSkeleton key={`skeleton-${i}`} />
          ))
        ) : filteredCourses.length > 0 ? (
          // Course Cards
          filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))
        ) : (
          // Empty State
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/60 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-dashed border-slate-300/50 dark:border-slate-700/50 shadow-lg"
          >
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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="text-primary dark:text-blue-400 font-medium hover:underline flex items-center gap-2"
              >
                Create your first course now <Plus className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

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
