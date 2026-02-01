import React from 'react';
import { Calendar, Clock, FileText, Lock, MoreVertical, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Exam } from '../../types';
import { motion } from 'framer-motion';

interface ExamCardProps {
    exam: Exam;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
    const navigate = useNavigate();

    const getExamTypeColor = (type: string) => {
        switch (type) {
            case 'midterm':
                return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' };
            case 'final':
                return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800' };
            case 'quiz':
                return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' };
            case 'assignment':
                return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' };
            default:
                return { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-700' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'text-slate-500';
            case 'scheduled': return 'text-blue-600 dark:text-blue-400';
            case 'ongoing': return 'text-amber-500';
            case 'completed': return 'text-emerald-600 dark:text-emerald-400';
            case 'graded': return 'text-purple-600 dark:text-purple-400';
            default: return 'text-slate-500';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isUpcoming = new Date(exam.examDate) > new Date();
    const typeStyle = getExamTypeColor(exam.examType);

    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate(`/faculty-dashboard/exams/${exam.id}`)}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all cursor-pointer relative overflow-hidden"
        >
            {/* Status Indicator Stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full ${typeStyle.bg.replace('/20', '')}`} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text} mb-2`}>
                        {exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {exam.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {exam.courseCode} • {exam.courseName}
                    </p>
                </div>
                {exam.isLocked && (
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400">
                        <Lock className="h-4 w-4" />
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4 mr-2.5 opacity-70" />
                    <span className="font-medium">{formatDate(exam.examDate)}</span>
                    {isUpcoming && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">Upcoming</span>}
                </div>

                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4 mr-2.5 opacity-70" />
                    <span>{exam.duration} mins</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="font-medium">{exam.totalMarks} Marks</span>
                </div>

                <div className="flex items-center text-sm">
                    <FileText className={`h-4 w-4 mr-2.5 ${exam.modelAnswerId ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={exam.modelAnswerId ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                        {exam.modelAnswerId ? 'Model Answer Attached' : 'No Model Answer'}
                    </span>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(exam.status).replace('text-', 'bg-')}`} />
                    <span className={`text-sm font-semibold capitalize ${getStatusColor(exam.status)}`}>
                        {exam.status}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </motion.div>
    );
};

export default ExamCard;
