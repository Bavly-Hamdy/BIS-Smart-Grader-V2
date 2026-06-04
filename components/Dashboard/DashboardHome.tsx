import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BookOpen, Users, FileCheck, Clock, TrendingUp, AlertTriangle, Calendar, GraduationCap, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './CourseCard';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { Course, Exam, FacultyProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  // Derived Real Stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [showStudentBreakdown, setShowStudentBreakdown] = useState(false);
  const [studentBreakdown, setStudentBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // Set initial name from auth, but fetch real profile to be sure
    setUserName(auth.currentUser.displayName || '');

    const fetchData = async () => {
      try {
        setLoading(true);

        // 0. Fetch User Profile for Name from 'faculty' collection
        try {
          const userDocRef = doc(db, 'faculty', uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as FacultyProfile;
            // Prefer fullName from Firestore profile
            setUserName(userData.fullName || auth.currentUser?.displayName || 'Doctor');
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }

        // 1. Fetch Courses
        const coursesQuery = query(collection(db, 'courses'), where('facultyId', '==', uid));
        const coursesUnsub = onSnapshot(coursesQuery, (snapshot) => {
          const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
          courseData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setCourses(courseData);
        });

        // 2. Fetch Exams (to see active exams)
        const examsQuery = query(collection(db, 'exams'), where('facultyId', '==', uid));
        const examsUnsub = onSnapshot(examsQuery, async (snapshot) => {
          const examData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exam[];
          setExams(examData);

          if (examData.length > 0) {
            const examIds = examData.map(e => e.id);
            const chunks = [];
            for (let i = 0; i < examIds.length; i += 10) {
              chunks.push(examIds.slice(i, i + 10));
            }

            const allGrades: any[] = [];
            for (const chunk of chunks) {
              const q = query(collection(db, 'grades'), where('examId', 'in', chunk));
              const snap = await getDocs(q);
              allGrades.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
            processGrades(allGrades);
          } else {
            setGrades([]);
            processGrades([]);
          }
        });

        const processGrades = (gradeData: any[]) => {
          setGrades(gradeData);
          
          // Unique students overall
          const uniqueStudents = new Set(gradeData.map(g => g.studentId));
          setTotalStudents(uniqueStudents.size);

          // Breakdown per course
          const breakdownMap: Record<string, { name: string, code: string, students: Set<string> }> = {};
          gradeData.forEach(g => {
            if (!breakdownMap[g.courseId]) {
              breakdownMap[g.courseId] = { 
                name: g.courseName || 'Unknown Course', 
                code: g.courseCode || '',
                students: new Set() 
              };
            }
            breakdownMap[g.courseId].students.add(g.studentId);
          });

          const breakdown = Object.entries(breakdownMap).map(([id, data]) => ({
            courseId: id,
            courseName: data.name,
            courseCode: data.code,
            count: data.students.size
          })).sort((a, b) => b.count - a.count);
          
          setStudentBreakdown(breakdown);

          if (gradeData.length > 0) {
            const total = gradeData.reduce((acc, curr) => acc + (curr.totalScore || curr.score || 0), 0);
            const avg = total / gradeData.length;
            setAverageScore(Math.round(avg * 10) / 10);

            const dist = [0, 0, 0, 0, 0];
            gradeData.forEach(g => {
              const s = g.percentage || 0;
              if (s >= 85) dist[4]++;
              else if (s >= 75) dist[3]++;
              else if (s >= 65) dist[2]++;
              else if (s >= 50) dist[1]++;
              else dist[0]++;
            });
            setGradeDistribution([
              { name: 'F', count: dist[0] },
              { name: 'D', count: dist[1] },
              { name: 'C', count: dist[2] },
              { name: 'B', count: dist[3] },
              { name: 'A', count: dist[4] },
            ]);

          } else {
            setAverageScore(0);
            setGradeDistribution([]);
          }
        };

        return () => {
          coursesUnsub();
          examsUnsub();
        };

      } catch (error) {
        console.error("Error asking dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.currentUser]);

  const activeExams = exams.length;
  const recentGradesCount = grades.length; // Simplified for demo

  // Premium Stat Card Component
  const StatCard = ({ label, value, icon: Icon, color, delay, onClick, isClickable }: any) => {
    const colorStyles = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
      teal: { bg: 'bg-teal-50 dark:bg-teal-900/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-800' },
      rose: { bg: 'bg-rose-50 dark:bg-rose-900/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800' },
    };

    const style = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
        onClick={onClick}
        className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border ${style.border} shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${isClickable ? 'cursor-pointer active:scale-95' : ''}`}
      >
        <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
          <Icon className={`h-24 w-24 ${style.text}`} />
        </div>

        <div className="relative">
          <div className="flex justify-between items-start">
            <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${style.text}`} />
            </div>
            {isClickable && (
              <div className={`p-1.5 rounded-full ${style.bg} ${style.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {showStudentBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </motion.div>
    );
  };

  const passCount = grades.filter(g => (g.percentage || g.score || 0) >= 50).length;
  const failCount = grades.length - passCount;
  const pieData = [
    { name: isRTL ? 'ناجح' : 'Pass', value: passCount },
    { name: isRTL ? 'راسب' : 'Fail', value: failCount },
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full font-mono">
                {t('academic_year')}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
              {t('dashboard_title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {t('welcome_back_name')} <span className="font-semibold text-slate-900 dark:text-white">{userName}</span>
            </p>
          </div>

          <div className="hidden md:block text-end">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <StatCard label={t('active_courses')} value={courses.length} icon={BookOpen} color="blue" delay={1} />
        <StatCard 
          label={t('total_students')} 
          value={totalStudents} 
          icon={Users} 
          color="teal" 
          delay={2} 
          isClickable={true}
          onClick={() => setShowStudentBreakdown(!showStudentBreakdown)}
        />
        <StatCard label={t('active_exams')} value={activeExams} icon={Calendar} color="purple" delay={3} />
        <StatCard label={t('new_grades')} value={recentGradesCount} icon={FileCheck} color="indigo" delay={4} />
        <StatCard label={t('avg_score')} value={`${averageScore}%`} icon={TrendingUp} color="emerald" delay={5} />
        <StatCard label={t('at_risk')} value={failCount} icon={AlertTriangle} color="rose" delay={6} />
      </div>

      {/* Student Breakdown Section */}
      <AnimatePresence>
        {showStudentBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isRTL ? 'الطلاب المسجلين لكل مقرر' : 'Unique Students per Course'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentBreakdown.length > 0 ? (
                  studentBreakdown.map((item, idx) => (
                    <motion.div
                      key={item.courseId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center group hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">{item.courseCode}</span>
                        <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.courseName}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{item.count}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{t('students_count')}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    {isRTL ? 'لا توجد بيانات طلاب متاحة للمقررات بعد.' : 'No student data available for courses yet.'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                {t('grade_distribution')}
              </h3>
              <p className="text-sm text-slate-500">{t('overall_performance_curve')}</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {grades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gradeDistribution}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b' }}
                    labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <GraduationCap className="h-10 w-10 mb-2 opacity-50" />
                <span>{isRTL ? 'لا تتوفر بيانات للدرجات بعد' : 'No grade data available yet'}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pass/Fail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                {isRTL ? 'نسبة النجاح' : 'Success Rate'}
              </h3>
              <p className="text-sm text-slate-500">{t('pass_fail_ratio')}</p>
            </div>
          </div>
          <div className="h-72 w-full flex items-center justify-center relative" dir="ltr">
            {grades.length > 0 ? (
              <div className="bg-white/80 dark:bg-white/90 backdrop-blur-md border border-white shadow-lg shadow-slate-200/50 dark:shadow-none rounded-2xl p-6 flex flex-col items-center justify-center w-60 h-60 relative group hover:shadow-xl transition-all duration-300">
                <div className="w-36 h-36 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={6}
                        className="overflow-visible"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" dir={isRTL ? 'rtl' : 'ltr'}>
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {((passCount / grades.length) * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">{t('pass_rate')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
                <span>{isRTL ? 'لا تتوفر بيانات بعد' : 'No data available yet'}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('active_courses') || 'Active Courses'}</h2>
          </div>
          <button
            onClick={() => navigate('/faculty-dashboard/courses')}
            className="text-sm font-semibold text-primary hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 group"
          >
            {t('view_all') || 'View All'}
            <span className={`transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-[200px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse p-6" />
            ))
          ) : courses.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {isRTL ? 'لا توجد دورات نشطة بعد' : 'No active courses yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {isRTL ? 'ابدأ بتعيين مقرراتك الدراسية الأولى لإدارة الامتحانات والدرجات.' : 'Start by selecting your first course to manage exams and grades.'}
              </p>
              <button
                onClick={() => navigate('/faculty-dashboard/courses')}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
              >
                {isRTL ? 'اختر مقرراتك' : 'Select Courses'}
              </button>
            </div>
          ) : (
            courses.slice(0, 4).map(course => (
              <CourseCard
                key={course.id}
                title={isRTL ? course.nameAr || course.name : course.nameEn || course.name}
                code={course.code}
                description={course.description}
                creditHours={course.creditHours}
                semester={course.semester}
                studentCount={grades.filter(g => g.courseId === course.id).length || 0}
                onClick={() => navigate(`/faculty-dashboard/courses/${course.id}`)}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;