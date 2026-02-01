
import React from 'react';
import { AlertCircle, Calendar, FileWarning, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionItem {
    id: string;
    type: 'exam' | 'review' | 'alert' | 'activity';
    title: string;
    description: string;
    date?: Date;
    priority: 'high' | 'medium' | 'low';
    courseName?: string;
}

interface ActionItemsPanelProps {
    items: ActionItem[];
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ items }) => {
    const getIcon = (type: ActionItem['type']) => {
        switch (type) {
            case 'exam':
                return Calendar;
            case 'review':
                return FileWarning;
            case 'alert':
                return TrendingDown;
            default:
                return AlertCircle;
        }
    };

    const getPriorityColor = (priority: ActionItem['priority']) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'medium':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            default:
                return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    const getIconColor = (type: ActionItem['type']) => {
        switch (type) {
            case 'exam':
                return 'text-blue-600 dark:text-blue-400';
            case 'review':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'alert':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-slate-600 dark:text-slate-400';
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        All Caught Up! 🎉
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        No pending action items. Great work!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    جدول الأعمال / Action Items
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {items.length} pending task{items.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item, index) => {
                    const Icon = getIcon(item.type);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${getPriorityColor(item.priority)}`}>
                                    <Icon className={`h-5 w-5 ${getIconColor(item.type)}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-slate-900 dark:text-white">
                                            {item.title}
                                        </h4>
                                        {item.date && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {item.description}
                                    </p>

                                    {item.courseName && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 rounded">
                                            {item.courseName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActionItemsPanel;
