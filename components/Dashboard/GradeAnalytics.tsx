
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { GradeSheet, Grade } from '../../types';
import { TrendingUp, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GradeAnalyticsProps {
    uniqueKey: string; // Force re-render/animation
    gradeSheet: GradeSheet;
}

const GradeAnalytics: React.FC<GradeAnalyticsProps> = ({ gradeSheet, uniqueKey }) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    // 1. Prepare Data for Grade Distribution (A, B, C, D, F)
    const gradeDistributionData = useMemo(() => {
        const counts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
        gradeSheet.grades.forEach(g => {
            if (counts[g.letterGrade as keyof typeof counts] !== undefined) {
                counts[g.letterGrade as keyof typeof counts]++;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [gradeSheet]);

    // 2. Prepare Data for Pass/Fail Pie Chart
    const passFailData = useMemo(() => {
        const passed = gradeSheet.statistics.passed;
        const failed = gradeSheet.statistics.failed;
        return [
            { name: t('passed'), value: passed },
            { name: t('failed'), value: failed }
        ];
    }, [gradeSheet, t]);

    // 3. Prepare Data for Score Ranges (Binning)
    const scoreRangeData = useMemo(() => {
        const bins = [
            { name: '0-59', min: 0, max: 59, count: 0 },
            { name: '60-69', min: 60, max: 69, count: 0 },
            { name: '70-79', min: 70, max: 79, count: 0 },
            { name: '80-89', min: 80, max: 89, count: 0 },
            { name: '90-100', min: 90, max: 100, count: 0 },
        ];

        gradeSheet.grades.forEach(g => {
            const p = g.percentage;
            const bin = bins.find(b => p >= b.min && p <= b.max);
            if (bin) bin.count++;
        });

        return bins.map(b => ({ name: b.name, value: b.count }));
    }, [gradeSheet]);

    const COLORS_PASS_FAIL = ['#10b981', '#f43f5e']; // Emerald, Rose
    const COLORS_GRADES = {
        'A': '#10b981', // emerald-500
        'B': '#3b82f6', // blue-500
        'C': '#eab308', // yellow-500
        'D': '#f97316', // orange-500
        'F': '#f43f5e'  // rose-500
    };

    return (
        <motion.div
            key={uniqueKey}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
            {/* Chart 1: Grade Distribution */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {t('grade_distribution')}
                    </h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {gradeDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_GRADES[entry.name as keyof typeof COLORS_GRADES] || '#94a3b8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Pass vs Fail */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {t('pass_rate_overview')}
                    </h3>
                </div>
                <div className="h-64 w-full relative" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <Pie
                                data={passFailData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {passFailData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_PASS_FAIL[index % COLORS_PASS_FAIL.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Pass Rate */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{gradeSheet.statistics.passRate}%</span>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{t('pass_rate')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart 3: Score Range Distribution */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        {t('score_performance_ranges')}
                    </h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreRangeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};

export default GradeAnalytics;
