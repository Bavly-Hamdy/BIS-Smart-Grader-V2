import React from 'react';
import { BookOpen, Users, ArrowRight, Plus, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  type?: 'default' | 'add';
  title?: string;
  code?: string;
  studentCount?: number;
  creditHours?: number;
  semester?: string;
  description?: string;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  type = 'default',
  title,
  code,
  studentCount,
  creditHours,
  semester,
  description,
  onClick
}) => {
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
        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors">Add New Course</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-[200px] text-center">Create a new course to manage exams and grades</p>
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
          <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
            <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide border border-slate-200 dark:border-slate-700">
            {code}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
          {description || "No description provided."}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            {creditHours !== undefined && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {creditHours} Credits
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
              <Users className="h-4 w-4 mr-2" />
              {studentCount || 0} Students
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;