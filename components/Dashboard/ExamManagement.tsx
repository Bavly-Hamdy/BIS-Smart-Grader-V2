
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, FileText, Clock, CheckCircle, AlertCircle, Filter, Search, ArrowLeft } from 'lucide-react';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Button from '../Button';
import CreateExamModal from './CreateExamModal';
import ExamCard from './ExamCard';
import { Exam } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const ExamManagement: React.FC = () => {
    const navigate = useNavigate();
    const { t, language, dir } = useLanguage();
    const isRTL = language === 'ar';
    const [exams, setExams] = useState<Exam[]>([]);
    const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'midterm' | 'final' | 'quiz' | 'assignment'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'exams'),
            where('facultyId', '==', auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const examData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Exam[];

            // Client-side sort
            examData.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

            setExams(examData);
            setFilteredExams(examData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching exams:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = exams;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(exam => exam.examType === filterType);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(exam =>
                exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredExams(filtered);
    }, [exams, filterType, searchQuery]);

    // Calculate stats
    const stats = {
        total: exams.length,
        upcoming: exams.filter(e => new Date(e.examDate) > new Date() && e.status !== 'completed').length,
        completed: exams.filter(e => e.status === 'completed' || e.status === 'graded').length,
        withModelAnswer: exams.filter(e => e.modelAnswerId).length
    };

    const examTypes = [
        { value: 'all', label: t('all_types') },
        { value: 'midterm', label: t('midterm') },
        { value: 'final', label: t('final') },
        { value: 'quiz', label: t('quiz') },
        { value: 'assignment', label: t('assignment') },
    ];

    // Stats Card Component
    const StatCard = ({ label, value, icon: Icon, color, delay }: any) => {
        const colorStyles = {
            blue: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
            emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
            amber: { bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
            purple: { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' },
        };
        const style = colorStyles[color as keyof typeof colorStyles];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay * 0.1 }}
                className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border ${style.border} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}
            >
                <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
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
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button
                            onClick={() => navigate('/faculty-dashboard')}
                            className="flex items-center text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4 font-medium group"
                        >
                            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180 group-hover:translate-x-1' : 'mr-2 group-hover:-translate-x-1'} transition-transform`} />
                            {t('back_to_overview')}
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                {t('examinations')}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                            {t('exams_manager')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            {t('exams_subtitle')}
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-base font-semibold"
                    >
                        <Plus className="h-5 w-5" />
                        {t('create_new_exam')}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label={t('total_exams')} value={stats.total} icon={FileText} color="blue" delay={1} />
                <StatCard label={t('upcoming')} value={stats.upcoming} icon={Clock} color="amber" delay={2} />
                <StatCard label={t('completed')} value={stats.completed} icon={CheckCircle} color="emerald" delay={3} />
                <StatCard label={t('with_model_answers')} value={stats.withModelAnswer} icon={AlertCircle} color="purple" delay={4} />
            </div>

            {/* Filters & Control Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-4 z-10 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
                <div className="flex flex-col md:flex-row gap-4 p-2">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <div className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center pointer-events-none`}>
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search_exams_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-medium ${
                                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                            }`}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {examTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value as any)}
                                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${filterType === type.value
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {type.label}
                                {filterType === type.value && (
                                    <motion.span layoutId="activeFilter" className="w-1.5 h-1.5 bg-white rounded-full ml-1" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exams Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {searchQuery || filterType !== 'all' ? t('no_exams_found') : t('no_exams_created')}
                        </h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            {searchQuery || filterType !== 'all'
                                ? t('no_exams_found_desc')
                                : t('no_exams_created_desc')}
                        </p>
                        {!searchQuery && filterType === 'all' && (
                            <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="shadow-lg hover:shadow-xl">
                                <Plus className="h-5 w-5 me-2" />
                                {t('create_first_exam')}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExams.map((exam, index) => (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ExamCard exam={exam} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Exam Modal */}
            <CreateExamModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default ExamManagement;
