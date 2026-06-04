import React from 'react';
import { BookOpen, Users, ArrowRight, Plus, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

interface CourseCardProps {
  type?: 'default' | 'add';
  title?: string;
  code?: string;
  studentCount?: number;
  creditHours?: number;
  semester?: string;
  description?: string;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  type = 'default',
  title,
  code,
  studentCount,
  creditHours,
  semester,
  description,
  onClick,
  onDelete
}) => {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  if (type === 'add') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="h-full min-h-[220px] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer group hover:border-primary dark:hover:border-primary/50 transition-all duration-300"
      >
        <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
          <Plus className="h-8 w-8 text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors">
          {isRTL ? 'إضافة مقرر جديد' : 'Add New Course'}
        </h3>
        <p className="text-sm text-slate-400 mt-1 max-w-[200px] text-center">
          {isRTL ? 'أنشئ مقرراً دراسياً جديداً لإدارة الامتحانات والدرجات' : 'Create a new course to manage exams and grades'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
              <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide border border-slate-200 dark:border-slate-700">
              {code}
            </span>
          </div>
          {onDelete && (
             <button
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none"
                title="Delete Course"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
             </button>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
          {description || t('no_description')}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            {creditHours !== undefined && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {creditHours} {t('credits')}
              </div>
            )}
            {semester && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {semester}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
              <Users className="h-4 w-4 me-2" />
              {studentCount || 0} {t('students_count')}
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;