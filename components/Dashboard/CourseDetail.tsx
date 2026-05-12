import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Course, CourseGradingScheme } from '../../types';
import Button from '../Button';
import {
    ArrowLeft,
    Save,
    FileDown,
    PieChart,
    BookOpen,
    Trash2
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
import EditCourseModal from './EditCourseModal';
import { Edit } from 'lucide-react';

const CourseDetail: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);

    // Grading Scheme State
    const [gradingScheme, setGradingScheme] = useState<CourseGradingScheme>({
        final: 0,
        midterm: 0,
        classWork: 0,
        quizzes: 0,
        practical: 0,
        project: 0,
        total: 100
    });

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            if (!courseId) return;
            const docRef = doc(db, 'courses', courseId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Course;
                setCourse({ id: docSnap.id, ...data });
                setGradingScheme(data.gradingScheme || {
                    final: 40,
                    midterm: 20,
                    classWork: 10,
                    quizzes: 10,
                    practical: 20,
                    project: 0,
                    total: 100
                });
            } else {
                navigate('/faculty-dashboard/courses');
            }
        } catch (error) {
            console.error("Error fetching course:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveScheme = async () => {
        try {
            if (!courseId) return;

            // Coerce any empty strings to 0
            const cleanScheme = {
                final: Number(gradingScheme.final) || 0,
                midterm: Number(gradingScheme.midterm) || 0,
                classWork: Number(gradingScheme.classWork) || 0,
                quizzes: Number(gradingScheme.quizzes) || 0,
                practical: Number(gradingScheme.practical) || 0,
                project: Number(gradingScheme.project) || 0,
                total: 100
            };

            // Validate total is 100
            const currentTotal = Object.values(cleanScheme).reduce((a, b) => a + b, 0) - cleanScheme.total;
            if (currentTotal !== 100) {
                alert(`Total marks must equal 100. Current total: ${currentTotal}`);
                return;
            }

            await updateDoc(doc(db, 'courses', courseId), {
                gradingScheme: cleanScheme,
                updatedAt: new Date().toISOString()
            });

            setCourse(prev => prev ? { ...prev, gradingScheme: cleanScheme } : null);
            setGradingScheme(cleanScheme);
            setIsEditing(false);
            alert("Grading scheme updated successfully!");
        } catch (error) {
            console.error("Error updating scheme:", error);
            alert("Failed to update grading scheme");
        }
    };

    const handleExportPDF = () => {
        if (!course) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Primary blue
        doc.text("Course Grading Plan", 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Course: ${course.name} (${course.code})`, 14, 32);
        doc.text(`Semester: ${course.semester}`, 14, 38);
        doc.text(`Credit Hours: ${course.creditHours}`, 14, 44);

        // Grading Table
        const tableData = [
            ['Assessment Type', 'Marks', 'Percentage'],
            ['Final Exam', gradingScheme.final, `${gradingScheme.final}%`],
            ['Midterm Exam', gradingScheme.midterm, `${gradingScheme.midterm}%`],
            ['Class Work', gradingScheme.classWork, `${gradingScheme.classWork}%`],
            ['Quizzes', gradingScheme.quizzes, `${gradingScheme.quizzes}%`],
            ['Practical / Lab', gradingScheme.practical, `${gradingScheme.practical}%`],
            ['Project', gradingScheme.project, `${gradingScheme.project}%`],
            ['Total', gradingScheme.total, '100%']
        ];

        autoTable(doc, {
            startY: 55,
            head: [tableData[0]],
            body: tableData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
            foot: [['', 'Total: 100', '']],
        });

        // Signatures Area
        const finalY = (doc as any).lastAutoTable.finalY + 40;
        doc.text("_______________________", 14, finalY);
        doc.text("Course Instructor", 14, finalY + 5);

        doc.text("_______________________", 120, finalY);
        doc.text("Department Head", 120, finalY + 5);

        doc.save(`${course.code}_Grading_Plan.pdf`);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    const chartData = [
        { name: 'Final', value: gradingScheme.final },
        { name: 'Midterm', value: gradingScheme.midterm },
        { name: 'Class Work', value: gradingScheme.classWork },
        { name: 'Quizzes', value: gradingScheme.quizzes },
        { name: 'Practical', value: gradingScheme.practical },
        { name: 'Project', value: gradingScheme.project },
    ].filter(item => item.value > 0);

    if (loading) return <div className="p-8 text-center">Loading course details...</div>;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-10"></div>
                <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <button
                            onClick={() => navigate('/faculty-dashboard/courses')}
                            className="flex items-center text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-colors mb-4 font-medium group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Courses
                        </button>
                        <div className="flex items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-bold tracking-wide">
                                        {course.code}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                        {course.semester}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{course.name}</h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {course.creditHours} Credit Hours
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleExportPDF}
                            className="flex-1 md:flex-none justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        >
                            <FileDown className="h-4 w-4 mr-2" />
                            Export Plan
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDetailsModalOpen(true)}
                            className="flex-1 md:flex-none justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                        </Button>
                        <Button
                            variant={isEditing ? 'outline' : 'primary'}
                            onClick={() => {
                                if (isEditing) handleSaveScheme();
                                else setIsEditing(true);
                            }}
                            className={isEditing ? "flex-1 md:flex-none justify-center border-violet-500 text-violet-600 hover:bg-violet-50" : "flex-1 md:flex-none justify-center shadow-lg shadow-primary/20"}
                        >
                            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <PieChart className="h-4 w-4 mr-2" />}
                            {isEditing ? 'Save Changes' : 'Edit Scheme'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grading Configuration */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                Grading Distribution
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Configure how grades are weighted for this course</p>
                        </div>

                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors ${Object.values(gradingScheme).reduce((a, b) => a + b, 0) - gradingScheme.total === 100
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400'
                            }`}>
                            <div className="text-sm font-medium">Total Weight</div>
                            <div className="text-2xl font-bold">
                                {Object.values(gradingScheme).reduce((a, b) => a + b, 0) - gradingScheme.total}%
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        {[
                            { key: 'final', label: 'Final Exam', color: 'border-blue-500' },
                            { key: 'midterm', label: 'Midterm Exam', color: 'border-indigo-500' },
                            { key: 'classWork', label: 'Class Work', color: 'border-violet-500' },
                            { key: 'quizzes', label: 'Quizzes', color: 'border-purple-500' },
                            { key: 'practical', label: 'Practical / Lab', color: 'border-fuchsia-500' },
                            { key: 'project', label: 'Project', color: 'border-pink-500' },
                        ].map((item) => (
                            <div key={item.key} className={`relative group ${!isEditing && 'opacity-75 grayscale-[0.5]'}`}>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {item.label}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        disabled={!isEditing}
                                        value={gradingScheme[item.key as keyof CourseGradingScheme] === 0 && !isEditing ? 0 : gradingScheme[item.key as keyof CourseGradingScheme]}
                                        onChange={(e) => setGradingScheme(prev => ({
                                            ...prev,
                                            [item.key]: e.target.value === '' ? '' : Number(e.target.value)
                                        }))}
                                        onFocus={(e) => e.target.select()}
                                        className={`w-full px-4 py-3 border rounded-xl transition-all font-medium text-lg ${isEditing
                                            ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm'
                                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                    <div className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${item.color.replace('border-', 'bg-')}`}></div>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl flex items-start gap-4"
                        >
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-amber-800 dark:text-amber-400">Important Note</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
                                    Changes to the grading scheme will affect how student grades are calculated. Ensure the total equals 100%. These changes are recorded in the system history.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Visualization */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 text-center">Visual Distribution</h3>
                    <div className="w-full h-72 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={6}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            </RePieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">100%</span>
                            <span className="block text-xs uppercase tracking-wider text-slate-500 font-medium">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            <EditCourseModal
                isOpen={isEditDetailsModalOpen}
                onClose={() => setIsEditDetailsModalOpen(false)}
                course={course}
                onCourseUpdated={(updatedCourse) => setCourse(updatedCourse)}
            />
        </div>
    );
};

export default CourseDetail;
