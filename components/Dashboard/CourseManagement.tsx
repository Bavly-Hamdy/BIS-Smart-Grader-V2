
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    BookOpen,
    Search,
    Clock,
    Users,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    PieChart,
    GraduationCap
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { Course, CourseGradingScheme } from '../../types';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from './CourseCard';
import { useToast } from '../../context/ToastContext';
import { doc, deleteDoc } from 'firebase/firestore';

const CourseManagement: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [step, setStep] = useState(1);
    
    // Real Student Counts
    const [courseStudentCounts, setCourseStudentCounts] = useState<Record<string, number>>({});
    const [totalUniqueStudents, setTotalUniqueStudents] = useState(0);

    // New Course Form State
    const [newCourse, setNewCourse] = useState({
        name: '',
        code: '',
        creditHours: 3,
        description: '',
        semester: 'Fall 2026',
        gradingScheme: {
            midterm: 20,
            final: 40,
            classWork: 10,
            quizzes: 10,
            practical: 0,
            project: 20,
            total: 100
        } as CourseGradingScheme
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            if (!auth.currentUser) return;
            const q = query(
                collection(db, 'courses'),
                where('facultyId', '==', auth.currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const coursesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Course[];
            setCourses(coursesData);

            // Fetch real student numbers
            const gradesSnap = await getDocs(collection(db, 'grades'));
            const allGrades = gradesSnap.docs.map(doc => doc.data() as any);
            
            const courseStudentsMap: Record<string, Set<string>> = {};
            const uniqueStudents = new Set<string>();

            coursesData.forEach(c => {
                courseStudentsMap[c.id] = new Set();
            });

            allGrades.forEach(grade => {
                if (grade.courseId && courseStudentsMap[grade.courseId]) {
                    courseStudentsMap[grade.courseId].add(grade.studentId);
                    uniqueStudents.add(grade.studentId);
                }
            });

            const counts: Record<string, number> = {};
            for (const courseId in courseStudentsMap) {
                counts[courseId] = courseStudentsMap[courseId].size;
            }
            
            setCourseStudentCounts(counts);
            setTotalUniqueStudents(uniqueStudents.size);
        } catch (error) {
            console.error("Error fetching courses:", error);
            addToast("Failed to load courses", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!auth.currentUser) return;

            const total = Object.values(newCourse.gradingScheme).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) - newCourse.gradingScheme.total;
            if (total !== 100) {
                addToast(`Total grading scheme must equal 100% (Current: ${total}%)`, "error");
                return;
            }

            const courseData = {
                ...newCourse,
                facultyId: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'courses'), courseData);
            setIsCreateModalOpen(false);
            setStep(1);
            addToast("Course created successfully!", "success");
            fetchCourses();

            // Reset form
            setNewCourse({
                name: '',
                code: '',
                creditHours: 3,
                description: '',
                semester: 'Fall 2026',
                gradingScheme: {
                    midterm: 20,
                    final: 40,
                    classWork: 10,
                    quizzes: 10,
                    practical: 0,
                    project: 20,
                    total: 100
                }
            });
        } catch (error) {
            console.error("Error creating course:", error);
            addToast("Failed to create course", "error");
        }
    };

    const handleSchemeChange = (field: keyof CourseGradingScheme, value: number) => {
        setNewCourse(prev => ({
            ...prev,
            gradingScheme: {
                ...prev.gradingScheme,
                [field]: value
            }
        }));
    };

    const currentTotal =
        newCourse.gradingScheme.midterm +
        newCourse.gradingScheme.final +
        newCourse.gradingScheme.classWork +
        newCourse.gradingScheme.quizzes +
        newCourse.gradingScheme.practical +
        newCourse.gradingScheme.project;

    // Derived Stats
    const totalCourses = courses.length;
    const totalCredits = courses.reduce((acc, curr) => acc + (Number(curr.creditHours) || 0), 0);
    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats Card Component
    const StatCard = ({ label, value, icon: Icon, color, delay }: any) => {
        const colorStyles = {
            violet: { bg: 'bg-violet-50 dark:bg-violet-900/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800' },
            indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
            fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/10', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-100 dark:border-fuchsia-800' },
        };
        const style = colorStyles[color as keyof typeof colorStyles] || colorStyles.violet;

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
        <div className="space-y-8 pb-12 max-w-7xl mx-auto animate-fade-in">

            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                Academic Resources
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                            My Courses
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            Manage your academic courses and configure precise grading schemes.
                        </p>
                    </div>
                    <Button
                        onClick={() => { setStep(1); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Course
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Courses" value={totalCourses} icon={BookOpen} color="violet" delay={1} />
                <StatCard label="Total Credits Taught" value={totalCredits} icon={Clock} color="indigo" delay={2} />
                <StatCard label="Total Students" value={totalUniqueStudents} icon={Users} color="fuchsia" delay={3} />
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search courses by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-violet-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {searchQuery ? 'No courses found' : 'No courses created yet'}
                        </h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first course to manage exams and grades.'}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => { setStep(1); setIsCreateModalOpen(true); }} size="lg" className="shadow-lg hover:shadow-xl bg-violet-600 text-white">
                                <Plus className="h-5 w-5 mr-2" />
                                Create First Course
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Always show Add Card first if not searching */}
                        {!searchQuery && (
                            <CourseCard
                                type="add"
                                onClick={() => { setStep(1); setIsCreateModalOpen(true); }}
                            />
                        )}
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <CourseCard
                                    title={course.name}
                                    code={course.code}
                                    description={course.description}
                                    creditHours={course.creditHours}
                                    semester={course.semester}
                                    studentCount={courseStudentCounts[course.id] || 0}
                                    onClick={() => navigate(`/faculty-dashboard/courses/${course.id}`)}
                                    onDelete={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                                            try {
                                                await deleteDoc(doc(db, 'courses', course.id));
                                                addToast('Course deleted successfully.', 'success');
                                                fetchCourses();
                                            } catch (error) {
                                                console.error('Error deleting course:', error);
                                                addToast('Failed to delete course.', 'error');
                                            }
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsCreateModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 m-auto max-w-2xl h-fit bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {step === 1 ? "Course Details" : "Grading Scheme"}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {step === 1 ? "Enter basic course information." : "Configure how students will be evaluated."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full transition-colors ${step >= 1 ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                    <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                    <div className={`h-2.5 w-2.5 rounded-full transition-colors ${step >= 2 ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                </div>
                            </div>

                            <form onSubmit={handleCreateCourse} className="p-8 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {step === 1 ? (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Course Code</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white"
                                                        placeholder="e.g., CS101"
                                                        value={newCourse.code}
                                                        onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Credit Hours</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        max="6"
                                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white"
                                                        value={newCourse.creditHours}
                                                        onChange={e => setNewCourse({ ...newCourse, creditHours: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Course Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white"
                                                    placeholder="e.g., Introduction to Computer Science"
                                                    value={newCourse.name}
                                                    onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white h-32 resize-none"
                                                    placeholder="Write a brief overview..."
                                                    value={newCourse.description}
                                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Total Score Indicator */}
                                            <div className={`p-4 rounded-xl flex items-center justify-between ${currentTotal === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <PieChart className="h-6 w-6" />
                                                    <span className="font-bold">Total Allocation</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-extrabold">{currentTotal}%</span>
                                                    {currentTotal === 100 ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                                {['final', 'midterm', 'project', 'practical', 'classWork', 'quizzes'].map((key) => (
                                                    <div key={key}>
                                                        <label className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            <span className="text-slate-400 font-mono">{newCourse.gradingScheme[key as keyof CourseGradingScheme]}%</span>
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                step="5"
                                                                value={newCourse.gradingScheme[key as keyof CourseGradingScheme]}
                                                                onChange={(e) => handleSchemeChange(key as keyof CourseGradingScheme, Number(e.target.value))}
                                                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                                            />
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={newCourse.gradingScheme[key as keyof CourseGradingScheme]}
                                                                onChange={(e) => handleSchemeChange(key as keyof CourseGradingScheme, Number(e.target.value))}
                                                                className="w-16 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-bold text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-4 pt-8 mt-4 border-t border-slate-100 dark:border-slate-800">
                                    {step === 1 ? (
                                        <>
                                            <Button variant="ghost" className="flex-1" type="button" onClick={() => setIsCreateModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                                                type="button"
                                                onClick={() => setStep(2)}
                                            >
                                                Next Step
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="outline" className="flex-1" type="button" onClick={() => setStep(1)}>
                                                <ChevronLeft className="h-4 w-4 mr-2" />
                                                Back
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                type="submit"
                                                disabled={currentTotal !== 100}
                                            >
                                                {loading ? 'Creating...' : 'Finalize Course'}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseManagement;
