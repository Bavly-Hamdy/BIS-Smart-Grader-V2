
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { Grade, Course } from '../../types';
import {
    ArrowLeft,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Calendar,
    Award
} from 'lucide-react';
import Button from '../Button';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface StudentCoursePerformance {
    courseId: string;
    courseName: string;
    courseCode: string;
    grades: Grade[];
    average: number;
    highest: number;
    lowest: number;
}

const StudentDetail: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState('');
    const [performances, setPerformances] = useState<StudentCoursePerformance[]>([]);

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            if (!auth.currentUser || !studentId) return;

            const examsQ = query(collection(db, 'exams'), where('facultyId', '==', auth.currentUser.uid));
            const examsSnap = await getDocs(examsQ);
            const examIds = examsSnap.docs.map(doc => doc.id);

            const gradesQ = query(collection(db, 'grades'), where('studentId', '==', studentId));
            const gradesSnap = await getDocs(gradesQ);
            const allGrades = gradesSnap.docs.map(doc => doc.data() as Grade);

            const relevantGrades = allGrades.filter(g => examIds.includes(g.examId));

            if (relevantGrades.length > 0) {
                setStudentName(relevantGrades[0].studentName);
            }

            const courseMap = new Map<string, Grade[]>();
            relevantGrades.forEach(g => {
                if (!courseMap.has(g.courseId)) {
                    courseMap.set(g.courseId, []);
                }
                courseMap.get(g.courseId)?.push(g);
            });

            const perfs: StudentCoursePerformance[] = [];

            for (const [courseId, grades] of courseMap.entries()) {
                grades.sort((a, b) => new Date(a.gradedAt).getTime() - new Date(b.gradedAt).getTime());

                const scores = grades.map(g => g.percentage);
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                const max = Math.max(...scores);
                const min = Math.min(...scores);
                const courseName = grades[0].courseName;
                const courseCode = grades[0].courseCode;

                perfs.push({
                    courseId,
                    courseName,
                    courseCode,
                    grades,
                    average: avg,
                    highest: max,
                    lowest: min
                });
            }

            setPerformances(perfs);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching student details:", error);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <button
                                onClick={() => navigate('/faculty-dashboard/students')}
                                className="flex items-center text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors mb-4 font-medium group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Students
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 shadow-inner flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-3xl font-bold border-2 border-white dark:border-slate-700">
                                    {studentName.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {studentName}
                                        </h1>
                                        <span className="px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold font-mono text-slate-600 dark:text-slate-300">
                                            {studentId}
                                        </span>
                                    </div>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-cyan-500" />
                                        Enrolled in <span className="font-bold text-slate-900 dark:text-white">{performances.length}</span> active courses
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Course Performance Cards */}
            <div className="space-y-8">
                {performances.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Academic Records</h3>
                        <p className="text-slate-500">This student has no graded exams yet.</p>
                    </div>
                ) : (
                    performances.map(perf => (
                        <div key={perf.courseId} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl transition-shadow duration-300">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {perf.courseName}
                                        </h2>
                                        <p className="text-sm font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs w-fit mt-1">{perf.courseCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Highest</p>
                                        <p className="text-lg font-bold text-emerald-600">{perf.highest}%</p>
                                    </div>
                                    <div className="text-right bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Average</p>
                                        <p className={`text-2xl font-black ${perf.average >= 85 ? 'text-emerald-500' : perf.average >= 70 ? 'text-blue-500' : 'text-slate-700'}`}>
                                            {perf.average}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-0 xl:divide-x dark:divide-slate-800">
                                {/* Performance Chart */}
                                <div className="xl:col-span-2 p-6 md:p-8">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-cyan-500" />
                                        Performance Trend
                                    </h3>
                                    <div className="h-72 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={perf.grades}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="examTitle"
                                                    stroke="#94a3b8"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    padding={{ left: 20, right: 20 }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={[0, 100]}
                                                    tickMargin={10}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        borderRadius: '12px',
                                                        border: 'none',
                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="percentage"
                                                    stroke="#06b6d4"
                                                    strokeWidth={4}
                                                    dot={{ fill: '#06b6d4', strokeWidth: 4, r: 4, stroke: '#fff' }}
                                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#0891b2' }}
                                                    name="Score (%)"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Grades Table */}
                                <div className="xl:col-span-1 p-6 md:p-8 bg-slate-50/30 dark:bg-slate-800/10">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-amber-500" />
                                        Recent Assessments
                                    </h3>
                                    <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                                        {perf.grades.map((grade, idx) => (
                                            <div key={idx} className="group flex justify-between items-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:shadow-md transition-all">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">
                                                        {grade.examTitle}
                                                    </p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(grade.gradedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-bold text-lg leading-none ${grade.percentage >= 80 ? 'text-emerald-600' :
                                                        grade.percentage >= 60 ? 'text-blue-600' :
                                                            'text-rose-600'
                                                        }`}>
                                                        {grade.percentage}%
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 font-medium">
                                                        {grade.score} / {grade.maxScore}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
