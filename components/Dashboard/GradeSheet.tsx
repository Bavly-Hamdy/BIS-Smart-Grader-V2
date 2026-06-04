import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    Award,
    Search,
    Filter,
    Eye,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard,
    Trash2,
    Send,
    Share2,
    Check,
    ArrowLeft
} from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Grade, GradeSheet } from '../../types';
import { calculateLetterGrade, prepareGradeSheet, exportToExcel, exportToPDF } from '../../services/exportService';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import GradeDetailModal from './GradeDetailModal';
import GradeAnalytics from './GradeAnalytics';
import { useLanguage } from '../../context/LanguageContext';

const GradeSheetPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { t, language, dir } = useLanguage();
    const isRTL = language === 'ar';
    const [gradeSheet, setGradeSheet] = useState<GradeSheet | null>(null);
    const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'approved' | 'published'>('all');
    const [gradeFilter, setGradeFilter] = useState<'all' | 'pass' | 'fail'>('all');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Detail Modal State
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [examModelAnswer, setExamModelAnswer] = useState<{ text?: string, pdfUrl?: string }>({});

    useEffect(() => {
        if (examId) {
            fetchGrades();
        }
    }, [examId]);

    useEffect(() => {
        filterGrades();
    }, [searchQuery, statusFilter, gradeFilter, gradeSheet]);

    const fetchGrades = async () => {
        try {
            const examQuery = query(collection(db, 'exams'), where('__name__', '==', examId));
            const examSnapshot = await getDocs(examQuery);

            if (examSnapshot.empty) {
                console.error('Exam not found');
                setLoading(false);
                return;
            }

            const examData = examSnapshot.docs[0].data();

            setExamModelAnswer({
                text: examData.modelAnswerText,
                pdfUrl: examData.modelAnswerPdfUrl
            });

            const gradesQuery = query(collection(db, 'grades'), where('examId', '==', examId));
            const gradesSnapshot = await getDocs(gradesQuery);

            const grades: Grade[] = gradesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Grade[];

            const sheet = prepareGradeSheet(
                examId!,
                examData.title,
                examData.courseCode,
                examData.courseName,
                grades
            );

            setGradeSheet(sheet);
            setFilteredGrades(sheet.grades);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching grades:', error);
            setLoading(false);
        }
    };

    const filterGrades = () => {
        if (!gradeSheet) return;

        let filtered = gradeSheet.grades;

        if (searchQuery.trim()) {
            filtered = filtered.filter(g =>
                g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.studentId.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(g => g.status === statusFilter);
        }

        if (gradeFilter === 'pass') {
            filtered = filtered.filter(g => g.percentage >= 60);
        } else if (gradeFilter === 'fail') {
            filtered = filtered.filter(g => g.percentage < 60);
        }

        setFilteredGrades(filtered);
    };

    const handleExportExcel = () => {
        if (gradeSheet) {
            exportToExcel(gradeSheet);
        }
    };

    const handleExportPDF = () => {
        if (gradeSheet) {
            exportToPDF(gradeSheet);
        }
    };

    const handleDeleteGrade = async (grade: Grade) => {
        if (!window.confirm(t('delete_grade_confirm').replace('{name}', grade.studentName))) return;
        try {
            await deleteDoc(doc(db, 'grades', grade.id));
            if (grade.submissionId) {
                await deleteDoc(doc(db, 'submissions', grade.submissionId));
            }
            fetchGrades(); // Refresh the list
        } catch (error) {
            console.error('Error deleting grade:', error);
            alert(t('delete_grade_fail'));
        }
    };

    const handleViewGrade = (grade: Grade) => {
        setSelectedGrade(grade);
        setIsDetailModalOpen(true);
    };

    const handlePublishAll = async () => {
        if (!gradeSheet || gradeSheet.grades.length === 0) return;
        
        const unpublishedGrades = gradeSheet.grades.filter(g => g.status !== 'published');
        if (unpublishedGrades.length === 0) {
            alert(t('publish_all_already'));
            return;
        }

        if (!window.confirm(t('publish_all_confirm').replace('{count}', String(unpublishedGrades.length)))) return;

        try {
            setIsPublishing(true);
            const publishPromises = unpublishedGrades.map(g => 
                updateDoc(doc(db, 'grades', g.id), { 
                    status: 'published', 
                    publishedAt: new Date().toISOString() 
                })
            );
            
            await Promise.all(publishPromises);
            alert(t('results_published_alert'));
            fetchGrades();
        } catch (error) {
            console.error('Error publishing results:', error);
            alert(t('publish_all_fail'));
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePublishGrade = async (grade: Grade) => {
        const newStatus = grade.status === 'published' ? 'draft' : 'published';
        const action = newStatus === 'published' ? 'publish' : 'unpublish';
        
        const translatedAction = isRTL 
            ? (action === 'publish' ? 'نشر' : 'إلغاء نشر') 
            : action;

        if (!window.confirm(t('publish_grade_confirm').replace('{action}', translatedAction))) return;

        try {
            await updateDoc(doc(db, 'grades', grade.id), { 
                status: newStatus,
                publishedAt: newStatus === 'published' ? new Date().toISOString() : null
            });
            fetchGrades();
        } catch (error) {
            console.error('Error updating grade status:', error);
            alert(t('publish_grade_fail'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-indigo-600 font-medium text-sm">{t('loading_grades')}</div>
                </div>
            </div>
        );
    }

    if (!gradeSheet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8" dir={dir}>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                    <FileSpreadsheet className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('no_grade_data_found')}</h3>
                <p className="text-slate-500 max-w-md">{t('no_grade_data_desc')}</p>
            </div>
        );
    }

    const stats = gradeSheet.statistics;

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto" dir={dir}>
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <button
                            onClick={() => navigate(`/faculty-dashboard/exams/${examId}`)}
                            className="flex items-center text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mb-4 font-medium group"
                        >
                            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180 group-hover:translate-x-1' : 'mr-2 group-hover:-translate-x-1'} transition-transform`} />
                            {t('back_to_exam_detail')}
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full text-center min-w-[60px]">
                                {gradeSheet.courseCode}
                            </span>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {gradeSheet.courseName}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            {gradeSheet.examTitle}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                            {t('grade_report_analytics')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`h-11 px-5 rounded-xl border-2 transition-all duration-300 font-semibold ${showAnalytics
                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                        >
                            {showAnalytics ? <LayoutDashboard className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} /> : <BarChart3 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                            {showAnalytics ? t('hide_analytics') : t('show_analytics')}
                        </Button>
                        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1 self-center"></div>
                        <Button
                            variant="secondary"
                            onClick={handleExportExcel}
                            className="h-11 px-5 rounded-xl font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 border-0"
                        >
                            <FileSpreadsheet className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('export_excel')}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleExportPDF}
                            className="h-11 px-5 rounded-xl font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 border-0"
                        >
                            <FileText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('export_pdf')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handlePublishAll}
                            isLoading={isPublishing}
                            className="h-11 px-6 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none border-0"
                        >
                            <Send className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('publish_all')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <AnimatePresence>
                {showAnalytics && gradeSheet && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <GradeAnalytics gradeSheet={gradeSheet} uniqueKey="analytics-dashboard" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    label={t('total_students')}
                    value={stats.total}
                    icon={Users}
                    trendLabel={t('enrolled')}
                    color="blue"
                />
                <StatCard
                    label={t('average_score')}
                    value={`${stats.average}%`}
                    icon={Award}
                    trendLabel={t('class_average')}
                    color="yellow"
                />
                <StatCard
                    label={t('pass_rate')}
                    value={`${stats.passRate}%`}
                    icon={TrendingUp}
                    trendLabel={`${stats.passed} ${t('passed_count')}`}
                    trendPositive={true}
                    color="emerald"
                />
                <StatCard
                    label={t('fail_rate')}
                    value={`${stats.total > 0 ? (100 - stats.passRate).toFixed(1) : '0.0'}%`}
                    icon={XCircle}
                    trendLabel={`${stats.failed} ${t('failed_count')}`}
                    trendPositive={false}
                    color="rose"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm sticky top-0 z-10">

                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
                            <input
                                type="text"
                                placeholder={t('search_by_name_id')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pr-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium ${
                                    isRTL ? 'pr-10' : 'pl-10'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'all' ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {t('all_status')}
                            </button>
                            <button
                                onClick={() => setStatusFilter('published')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {t('published')}
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 self-center mx-1"></div>

                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value as any)}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer"
                        >
                            <option value="all">{t('all_grades')}</option>
                            <option value="pass">{t('passing_status')}</option>
                            <option value="fail">{t('failing_status')}</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                                <th className={`px-6 py-5 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>{t('table_student')}</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('table_score')}</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('table_performance')}</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('table_grade')}</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('table_status')}</th>
                                <th className={`px-6 py-5 ${isRTL ? 'text-left' : 'text-right'} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>{t('table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {filteredGrades.length > 0 ? (
                                filteredGrades.map((grade, index) => (
                                    <GradeRow
                                        key={grade.id}
                                        grade={grade}
                                        index={index}
                                        onView={() => handleViewGrade(grade)}
                                        onDelete={() => handleDeleteGrade(grade)}
                                        onPublish={() => handlePublishGrade(grade)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                                <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-900 dark:text-white">{t('no_students_found')}</p>
                                            <p className="text-slate-500 text-sm mt-1">{t('adjust_filters_desc')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedGrade && (
                <GradeDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    grade={selectedGrade}
                    modelAnswerText={examModelAnswer.text}
                    modelAnswerPdfUrl={examModelAnswer.pdfUrl}
                    onGradeUpdated={fetchGrades}
                />
            )}
        </div>
    );
};

// Premium Stat Card
const StatCard = ({ label, value, icon: Icon, trendLabel, trendPositive, color }: any) => {
    const { dir } = useLanguage();
    const isRTL = dir === 'rtl';
    
    const colorStyles = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
        rose: { bg: 'bg-rose-50 dark:bg-rose-900/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800' },
        yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-100 dark:border-yellow-800' },
    };

    const style = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border ${style.border} shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}
        >
            <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                <Icon className={`h-16 w-16 ${style.text}`} />
                            </div>

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${style.bg}`}>
                                        <Icon className={`h-5 w-5 ${style.text}`} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                                </div>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
                                    {trendLabel && (
                                        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full mb-1 ${trendPositive === true ? 'bg-emerald-100 text-emerald-700' : trendPositive === false ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {trendPositive === true ? <ArrowUpRight className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} /> : trendPositive === false ? <ArrowDownRight className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} /> : null}
                                            {trendLabel}
                                        </div>
                                    )}
                                </div>
                            </div>
        </motion.div>
    );
};

// Premium Grade Row
const GradeRow: React.FC<{ grade: Grade; index: number; onView: () => void; onDelete: () => void; onPublish: () => void }> = ({ grade, index, onView, onDelete, onPublish }) => {
    const isPassing = grade.percentage >= 60;
    const { t, dir } = useLanguage();
    const isRTL = dir === 'rtl';

    // Generate initials
    const initials = grade.studentName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const gradeColors = {
        'A': 'text-emerald-700 bg-emerald-100 border-emerald-200',
        'B': 'text-blue-700 bg-blue-100 border-blue-200',
        'C': 'text-yellow-700 bg-yellow-100 border-yellow-200',
        'D': 'text-orange-700 bg-orange-100 border-orange-200',
        'F': 'text-rose-700 bg-rose-100 border-rose-200'
    };

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {initials}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{grade.studentName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{grade.studentId}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-base font-bold text-slate-900 dark:text-white">
                    {grade.score} <span className="text-slate-400 text-xs font-normal">/ {grade.maxScore}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="w-full max-w-[100px] mx-auto bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-1">
                    <div
                        className={`h-full rounded-full ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${grade.percentage}%` }}
                    />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{grade.percentage.toFixed(1)}%</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold border-2 ${gradeColors[grade.letterGrade as keyof typeof gradeColors] || 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    {grade.letterGrade}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${grade.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t(grade.status)}
                </span>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} flex items-center justify-end gap-2`}>
                <button
                    onClick={onPublish}
                    className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow ${grade.status === 'published' 
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40' 
                        : 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40'}`}
                    title={grade.status === 'published' ? t('unpublish_result') : t('publish_result')}
                >
                    {grade.status === 'published' ? <Check className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                </button>
                <button
                    onClick={onView}
                    className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-xl transition-all shadow-sm hover:shadow"
                    title={t('view_detailed_analysis')}
                >
                    <Eye className="h-5 w-5" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl transition-all shadow-sm hover:shadow"
                    title={t('delete_record')}
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </td>
        </motion.tr>
    );
};

export default GradeSheetPage;
