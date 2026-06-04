import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BIS_CURRICULUM } from '../../utils/bisCurriculum';
import { assignCourseToFaculty, removeCourseFromFaculty, subscribeToFacultyCourses } from '../../services/courseService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { 
  BookOpen, 
  CheckCircle, 
  PlusCircle, 
  Search, 
  Layers, 
  GraduationCap, 
  Clock, 
  Users, 
  ArrowLeft,
  ExternalLink,
  Trash2,
  Filter,
  X,
  HelpCircle
} from 'lucide-react';

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const { language, t, dir } = useLanguage();
  const { addToast } = useToast();
  
  const currentUser = auth.currentUser;
  const isRTL = language === 'ar';

  // State Management
  const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewFilter, setViewFilter] = useState<'all' | 'assigned'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hoveredCourseCode, setHoveredCourseCode] = useState<string | null>(null);
  
  // Real stats metrics
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  // Sync assigned courses from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToFacultyCourses(currentUser.uid, (ids) => {
      setAssignedCourseIds(ids);
      setLoading(false);
      
      // Calculate total credits of assigned courses
      const credits = BIS_CURRICULUM
        .filter(c => ids.includes(c.code))
        .reduce((sum, c) => sum + (c.creditHours || 0), 0);
      setTotalCredits(credits);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch unique students across all assigned courses for statistics
  useEffect(() => {
    const fetchStudentsCount = async () => {
      if (!currentUser) return;
      try {
        const gradesSnap = await getDocs(collection(db, 'grades'));
        const allGrades = gradesSnap.docs.map(doc => doc.data() as any);
        
        // Filter grades where courseId starts with the assigned course codes for this faculty
        const facultyCourseDocs = assignedCourseIds.map(code => `${code}_${currentUser.uid}`);
        const uniqueStudents = new Set<string>();

        allGrades.forEach(grade => {
          if (grade.courseId && facultyCourseDocs.includes(grade.courseId)) {
            uniqueStudents.add(grade.studentId);
          }
        });
        setTotalStudents(uniqueStudents.size);
      } catch (error) {
        console.error("Error fetching students count:", error);
      }
    };

    if (assignedCourseIds.length > 0) {
      fetchStudentsCount();
    } else {
      setTotalStudents(0);
    }
  }, [assignedCourseIds, currentUser]);

  // Handle assigning / unassigning courses
  const handleCourseToggle = async (
    courseCode: string, 
    nameAr: string, 
    nameEn: string, 
    creditHours: number,
    theoryHours: number,
    practicalHours: number,
    isAssigned: boolean
  ) => {
    if (!currentUser) {
      addToast(isRTL ? 'خطأ في المصادقة الحالية' : 'Authentication state unresolved', 'error');
      return;
    }

    setProcessingId(courseCode);
    if (isAssigned) {
      if (window.confirm(isRTL ? 'هل أنت متأكد من إلغاء تعيين هذه المادة؟ سيتم إزالة إعدادات خطة المادة أيضاً.' : 'Are you sure you want to drop this course? The grading scheme configurations will be removed.')) {
        const response = await removeCourseFromFaculty(currentUser.uid, courseCode);
        if (response.success) {
          addToast(isRTL ? 'تم إلغاء تعيين المادة بنجاح' : 'Course dropped successfully', 'success');
        } else {
          addToast(response.error || 'Operation failed', 'error');
        }
      }
    } else {
      const response = await assignCourseToFaculty(
        currentUser.uid, 
        courseCode, 
        nameAr, 
        nameEn, 
        creditHours, 
        theoryHours, 
        practicalHours
      );
      if (response.success) {
        addToast(isRTL ? 'تم تعيين المادة بنجاح لخطة تدريسك' : 'Course assigned to your schedule successfully', 'success');
      } else {
        addToast(response.error || 'Operation failed', 'error');
      }
    }
    setProcessingId(null);
  };

  // Helper to find prerequisite name
  const getPrerequisiteName = useCallback((prereqCode: string) => {
    const found = BIS_CURRICULUM.find(c => c.code === prereqCode);
    if (!found) return prereqCode;
    return isRTL ? found.nameAr : found.nameEn;
  }, [isRTL]);

  // Reset filters helper
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setViewFilter('all');
    setLevelFilter('all');
    addToast(isRTL ? 'تم إعادة تعيين عوامل التصفية والبحث' : 'Filters and search reset successfully', 'info');
  }, [isRTL, addToast]);

  // Perform search and level indexing
  const filteredCourses = useMemo(() => {
    return BIS_CURRICULUM.filter(course => {
      // 1. Search Query Match
      const matchesSearch = 
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.nameAr.includes(searchQuery) ||
        course.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
        
      // 2. View Filter Match ('all' vs 'assigned')
      const matchesView = viewFilter === 'all' || assignedCourseIds.includes(course.code);

      // 3. Level Filter Match (Level 100, 200, 300, 400)
      const firstDigit = course.code.match(/\d/)?.[0];
      const matchesLevel = levelFilter === 'all' || firstDigit === levelFilter;
      
      return matchesSearch && matchesView && matchesLevel;
    });
  }, [searchQuery, viewFilter, levelFilter, assignedCourseIds]);

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
    exit: { opacity: 0, x: isRTL ? -20 : 20, transition: { duration: 0.15 } }
  };

  // Skeleton list row shimmer layout
  const SkeletonRow = () => (
    <div className="flex items-center justify-between p-5 border-b animate-pulse bg-slate-50/40 border-black/5 dark:bg-slate-900/10 dark:border-white/5">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded w-1/3 bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <div className="h-3 rounded w-16 bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-3 rounded w-12 bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-3 rounded w-12 bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>
      <div className="w-32 h-10 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto" dir={dir}>
      
      {/* Header Banner - Premium Glassmorphism Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button
              onClick={() => navigate('/faculty-dashboard')}
              className="flex items-center text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mb-4 font-semibold group"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'} group-hover:-translate-x-1 transition-transform`} />
              {isRTL ? 'العودة للرئيسية' : 'Back to Overview'}
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full">
                {isRTL ? 'مقررات شعبة نظم معلومات الأعمال' : 'BIS Curriculum Resources'}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
              {isRTL ? 'إدارة المقررات الدراسية' : 'My Courses'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              {isRTL 
                ? 'استكشف الدليل الدراسي الشامل لشعبة BIS وحدد المواد التي تقوم بتدريسها لمتابعة الامتحانات والدرجات.' 
                : 'Browse the official BIS program curriculum catalog and assign the courses you currently teach to manage exams.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Courses - Resets Filter */}
        <button
          onClick={() => {
            setViewFilter('all');
            addToast(isRTL ? 'تم عرض جميع المقررات' : 'Showing all catalog courses', 'info');
          }}
          className={`text-start p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group active:scale-98 shadow-sm ${
            viewFilter === 'all'
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              viewFilter === 'all' ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500/10'
            }`}>
              <BookOpen className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'دليل مواد BIS' : 'BIS Catalog'}</p>
              <h3 className="text-2xl font-black mt-0.5">{BIS_CURRICULUM.length}</h3>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
            viewFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-400'
          }`}>
            {isRTL ? 'نشط' : 'Active'}
          </div>
        </button>

        {/* Selected Roster - Toggles to Assigned */}
        <button
          onClick={() => {
            setViewFilter('assigned');
            addToast(isRTL ? 'تم التصفية على موادي المسجلة فقط' : 'Showing your assigned teaching roster', 'info');
          }}
          className={`text-start p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group active:scale-98 shadow-sm ${
            viewFilter === 'assigned'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              viewFilter === 'assigned' ? 'bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500/10'
            }`}>
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'موادي التدريسية' : 'Teaching Roster'}</p>
              <h3 className="text-2xl font-black mt-0.5 text-emerald-500 dark:text-emerald-400">{assignedCourseIds.length}</h3>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
            viewFilter === 'assigned' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-emerald-400'
          }`}>
            {isRTL ? 'نشط' : 'Active'}
          </div>
        </button>

        {/* Total Credits */}
        <div className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group`}>
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
            <Clock className="h-24 w-24 text-violet-500" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'الساعات المعتمدة المسجلة' : 'Credits Registered'}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCredits} {isRTL ? 'ساعة' : 'Hrs'}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Control Strip & Interactive Filtering */}
      <div className="p-4 rounded-3xl border backdrop-blur-xl flex flex-col gap-4 shadow-lg bg-white/40 border-black/5 shadow-slate-200/50 dark:bg-slate-900/40 dark:border-white/10 dark:shadow-black/20">
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRTL ? 'right-3' : 'left-3'} text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث بكود المقرر أو اسم المادة...' : 'Search by course code or title...'}
              className="w-full py-3 rounded-xl border text-sm outline-none transition-all ps-10 pe-4 bg-white/60 border-black/10 focus:border-indigo-500 text-slate-900 dark:bg-slate-950/40 dark:border-white/5 dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Filter buttons */}
          <div className="flex p-1.5 rounded-xl border self-start md:self-auto bg-slate-100 border-black/5 dark:bg-slate-950/60 dark:border-white/5">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                viewFilter === 'all' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {isRTL ? 'دليل مواد BIS بالكامل' : 'All BIS Catalog'}
            </button>
            <button
              onClick={() => setViewFilter('assigned')}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                viewFilter === 'assigned' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isRTL ? 'مقرراتي التدريسية' : 'My Assigned Courses'}
            </button>
          </div>
        </div>

        {/* Academic Level Filters Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            {isRTL ? 'المستوى الأكاديمي:' : 'Academic Level:'}
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', en: 'All Levels', ar: 'كل المستويات' },
              { id: '1', en: 'Level 100', ar: 'المستوى الأول' },
              { id: '2', en: 'Level 200', ar: 'المستوى الثاني' },
              { id: '3', en: 'Level 300', ar: 'المستوى الثالث' },
              { id: '4', en: 'Level 400', ar: 'المستوى الرابع' },
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setLevelFilter(lvl.id as any)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all border shrink-0 ${
                  levelFilter === lvl.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isRTL ? lvl.ar : lvl.en}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main List Layout */}
      {loading ? (
        <div className="rounded-2xl border divide-y overflow-hidden bg-white/20 border-black/5 divide-black/5 dark:bg-slate-900/20 dark:border-white/10 dark:divide-white/5">
          {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="rounded-2xl border backdrop-blur-xl overflow-hidden divide-y shadow-sm bg-white/20 border-black/5 divide-black/5 dark:bg-slate-900/20 dark:border-white/10 dark:divide-white/5"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const isAssigned = assignedCourseIds.includes(course.code);
                const isBusy = processingId === course.code;
                const isHovered = hoveredCourseCode === course.code;

                return (
                  <motion.div
                    key={course.code}
                    variants={itemVariants}
                    layoutId={`course_row_${course.code}`}
                    exit="exit"
                    onMouseEnter={() => setHoveredCourseCode(course.code)}
                    onMouseLeave={() => setHoveredCourseCode(null)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-colors gap-4 group hover:bg-slate-900/5 dark:hover:bg-white/5"
                  >
                    
                    {/* Left: Code Box + Title info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 font-mono text-sm font-black rounded-2xl flex items-center justify-center tracking-wider border shadow-sm transition-all duration-300 ${
                        isAssigned 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 scale-105 shadow-emerald-500/5'
                          : 'bg-white border-black/5 text-slate-700 dark:bg-slate-950/60 dark:border-white/5 dark:text-slate-300'
                      }`}>
                        {course.code}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base tracking-wide text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                          <span>
                            {isRTL ? course.nameAr : course.nameEn}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            [{course.code}]
                          </span>
                        </h3>
                        
                        {/* Course Hours & Prerequisite badges */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {isRTL ? `${course.creditHours} ساعة معتمدة` : `${course.creditHours} Credits`}
                          </span>
                          <span className="opacity-45">•</span>
                          <span>{isRTL ? `نظري: ${course.theoryHours} ساعة` : `Theory: ${course.theoryHours} Hrs`}</span>
                          <span className="opacity-45">•</span>
                          <span>{isRTL ? `تدريبي: ${course.practicalHours} ساعة` : `Practical: ${course.practicalHours} Hrs`}</span>
                          
                          {/* Prerequisite Preview Badge */}
                          {course.preRequisite && (
                            <>
                              <span className="opacity-45">•</span>
                              <span className="text-amber-500 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                {isRTL ? `المتطلب السابق: ${course.preRequisite}` : `Prerequisite: ${course.preRequisite}`}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Inline Prerequisite Name Preview (Expands on Hover) */}
                        <AnimatePresence>
                          {isHovered && course.preRequisite && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -2 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -2 }}
                              className="text-[11px] font-bold text-indigo-400 flex items-center gap-1 pt-1"
                            >
                              <span>{isRTL ? '←' : '→'}</span>
                              <span>
                                {isRTL 
                                  ? `يتطلب دراسة: ${getPrerequisiteName(course.preRequisite)}` 
                                  : `Requires: ${getPrerequisiteName(course.preRequisite)}`
                                }
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    </div>

                    {/* Right: Actions and Assignment status toggles */}
                    <div className="flex items-center gap-3">
                      {isAssigned && (
                        <button
                          onClick={() => navigate(`/faculty-dashboard/courses/${course.code}_${currentUser?.uid}`)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm active:scale-95`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'لوحة المادة' : 'Manage Course'}</span>
                        </button>
                      )}

                      <button
                        disabled={isBusy}
                        onClick={() => handleCourseToggle(
                          course.code, 
                          course.nameAr, 
                          course.nameEn, 
                          course.creditHours,
                          course.theoryHours,
                          course.practicalHours,
                          isAssigned
                        )}
                        className={`w-32 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center overflow-hidden border active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                          isAssigned
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-rose-500/10 hover:border-rose-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border-transparent'
                        }`}
                      >
                        {isBusy ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : isAssigned ? (
                          <AnimatePresence mode="wait">
                            {isHovered ? (
                              <motion.div
                                key="drop"
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -15, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-rose-500">{isRTL ? 'إلغاء' : 'Drop'}</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="assigned"
                                initial={{ y: -15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 15, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">{isRTL ? 'مسجل' : 'Teaching'}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'تدريس' : 'Teach'}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Enhanced Empty-State view
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 text-center flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm border bg-slate-100 border-black/5 dark:bg-slate-800 dark:border-white/5">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-2">
                  {isRTL ? 'لم يتم العثور على مقررات' : 'No courses found'}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  {isRTL 
                    ? 'لم نجد أي مادة مطابقة لمعايير البحث الحالية. جرب تغيير عوامل التصفية أو مسح البحث.' 
                    : 'We couldn\'t find any courses matching your current search queries or level filters.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center gap-2 active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  {isRTL ? 'إعادة ضبط عوامل التصفية' : 'Reset Filters & Search'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default CourseManagement;
