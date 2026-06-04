import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { Grade } from '../../types';
import { User, Search, TrendingUp, BookOpen, GraduationCap, ChevronRight, Award, Trophy, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

interface StudentSummary {
    studentId: string;
    studentName: string;
    coursesCount: number;
    averageGrade: number;
}

const StudentList: React.FC = () => {
    const navigate = useNavigate();
    const { t, language, dir } = useLanguage();
    const isRTL = language === 'ar';
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredStudents(students.filter(s =>
                s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentId.includes(searchTerm)
            ));
        } else {
            setFilteredStudents(students);
        }
    }, [searchTerm, students]);

    const fetchStudents = async () => {
        try {
            if (!auth.currentUser) return;

            const examsQ = query(collection(db, 'exams'), where('facultyId', '==', auth.currentUser.uid));
            const examsSnap = await getDocs(examsQ);
            const examIds = examsSnap.docs.map(doc => doc.id);

            if (examIds.length === 0) {
                setStudents([]);
                setLoading(false);
                return;
            }

            const gradesSnap = await getDocs(collection(db, 'grades'));
            const allGrades = gradesSnap.docs.map(doc => doc.data() as Grade);

            const facultyGrades = allGrades.filter(g => examIds.includes(g.examId));

            const studentMap = new Map<string, { name: string; totalScore: number; count: number; courses: Set<string> }>();

            facultyGrades.forEach(grade => {
                if (!studentMap.has(grade.studentId)) {
                    studentMap.set(grade.studentId, {
                        name: grade.studentName,
                        totalScore: 0,
                        count: 0,
                        courses: new Set()
                    });
                }
                const record = studentMap.get(grade.studentId)!;
                record.totalScore += grade.percentage;
                record.count += 1;
                record.courses.add(grade.courseId);
            });

            const uniqueStudents: StudentSummary[] = Array.from(studentMap.entries()).map(([id, data]) => ({
                studentId: id,
                studentName: data.name,
                coursesCount: data.courses.size,
                averageGrade: Math.round(data.totalScore / data.count)
            }));

            // Sort by name by default
            uniqueStudents.sort((a, b) => a.studentName.localeCompare(b.studentName));

            setStudents(uniqueStudents);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching students:", error);
            setLoading(false);
        }
    };

    // Stats calculation
    const totalStudents = students.length;
    const topPerformers = students.filter(s => s.averageGrade >= 90).length;
    const atRiskStudents = students.filter(s => s.averageGrade < 60).length;

    // Stats Card Component
    const StatCard = ({ label, value, icon: Icon, color, delay }: any) => {
        const colorStyles = {
            cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-800' },
            emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
            rose: { bg: 'bg-rose-50 dark:bg-rose-900/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800' },
        };
        const style = colorStyles[color as keyof typeof colorStyles] || colorStyles.cyan;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay * 0.1 }}
                className={`bg-white dark:bg-slate-950 p-6 rounded-2xl border ${style.border} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}
            >
                <div className={`absolute ${isRTL ? '-left-4' : '-right-4'} -top-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                    <Icon className={`h-24 w-24 ${style.text}`} />
                </div>
                <div className="relative">
                    <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${style.text}`} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</h3>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto" dir={dir}>

            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button
                            onClick={() => navigate('/faculty-dashboard')}
                            className="flex items-center text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors mb-4 font-medium group"
                        >
                            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180 group-hover:translate-x-1' : 'mr-2 group-hover:-translate-x-1'} transition-transform`} />
                            {t('back_to_overview')}
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                {t('academic_performance')}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                            {t('students_overview')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            {t('students_overview_desc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label={t('total_students')} value={totalStudents} icon={User} color="cyan" delay={1} />
                <StatCard label={t('top_performers')} value={topPerformers} icon={Trophy} color="emerald" delay={2} />
                <StatCard label={t('need_support')} value={atRiskStudents} icon={TrendingUp} color="rose" delay={3} />
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90 sticky top-4 z-20">
                <div className="relative group">
                    <div className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center pointer-events-none`}>
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('search_students_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-medium ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                </div>
            </div>

            {/* Student Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <User className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_students_found')}</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {searchTerm ? t('no_students_found_desc_search') : t('no_students_found_desc_default')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student.studentId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/faculty-dashboard/students/${student.studentId}`)}
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Top Gradient Border */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${isRTL ? 'origin-right' : 'origin-left'}`}></div>

                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                            {student.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {student.studentName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                    {student.studentId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-slate-800 mb-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {t('courses')}
                                        </div>
                                        <p className={`text-lg font-bold text-slate-900 dark:text-white ${isRTL ? 'pr-5' : 'pl-5'}`}>
                                            {student.coursesCount}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            {t('avg_grade')}
                                        </div>
                                        <div className={`flex items-center gap-2 font-bold text-lg ${isRTL ? 'pr-5' : 'pl-5'} ${student.averageGrade >= 85 ? 'text-emerald-600' :
                                            student.averageGrade >= 70 ? 'text-blue-600' :
                                                student.averageGrade >= 50 ? 'text-amber-600' : 'text-rose-600'
                                            }`}>
                                            {student.averageGrade}%
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2">
                                    <div className="text-xs text-slate-400 font-medium">{t('click_view_performance')}</div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                                        <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentList;
