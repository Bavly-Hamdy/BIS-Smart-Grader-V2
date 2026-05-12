
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, FileText } from 'lucide-react';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';

interface CreateExamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Course {
    id: string;
    name: string;
    code: string;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [courseId, setCourseId] = useState('');
    const [title, setTitle] = useState('');
    const [examType, setExamType] = useState<'midterm' | 'final' | 'quiz' | 'assignment'>('midterm');
    const [examDate, setExamDate] = useState('');
    const [duration, setDuration] = useState('120');
    const [totalMarks, setTotalMarks] = useState('100');
    const [isMultiPage, setIsMultiPage] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        if (!auth.currentUser) return;

        try {
            const q = query(
                collection(db, 'courses'),
                where('facultyId', '==', auth.currentUser.uid)
            );

            const snapshot = await getDocs(q);
            const courseData = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                code: doc.data().code
            }));

            setCourses(courseData);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!auth.currentUser) {
                throw new Error('Not authenticated');
            }

            // Validate
            if (!courseId || !title || !examDate || !duration || !totalMarks) {
                throw new Error('Please fill in all required fields');
            }

            const selectedCourse = courses.find(c => c.id === courseId);
            if (!selectedCourse) {
                throw new Error('Invalid course selected');
            }

            // Validate date is in future
            const examDateTime = new Date(examDate);
            if (examDateTime < new Date()) {
                throw new Error('Exam date must be in the future');
            }

            // Create exam
            const examData = {
                courseId,
                courseName: selectedCourse.name,
                courseCode: selectedCourse.code,
                title,
                examType,
                examDate: examDateTime.toISOString(),
                duration: parseInt(duration),
                totalMarks: parseInt(totalMarks),
                facultyId: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: examDateTime > new Date() ? 'scheduled' : 'draft',
                isLocked: false,
                submissionsCount: 0,
                gradedCount: 0,
                isMultiPage: isMultiPage
            };

            await addDoc(collection(db, 'exams'), examData);

            // Reset form
            resetForm();
            onClose();
        } catch (err: any) {
            console.error('Error creating exam:', err);
            setError(err.message || 'Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCourseId('');
        setTitle('');
        setExamType('midterm');
        setExamDate('');
        setDuration('120');
        setTotalMarks('100');
        setError(null);
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50"
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Create New Exam
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Set up exam details and upload model answer later
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Course *
                            </label>
                            <select
                                required
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                            >
                                <option value="">Select a course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Exam Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Exam Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Midterm Exam - Fall 2026"
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Exam Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Exam Type *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { value: 'midterm', label: 'Midterm' },
                                    { value: 'final', label: 'Final' },
                                    { value: 'quiz', label: 'Quiz' },
                                    { value: 'assignment', label: 'Assignment' }
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setExamType(type.value as any)}
                                        className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${examType === type.value
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <CalendarIcon className="inline h-4 w-4 mr-2" />
                                    Exam Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <Clock className="inline h-4 w-4 mr-2" />
                                    Duration (minutes) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Total Marks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <FileText className="inline h-4 w-4 mr-2" />
                                    Total Marks *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isMultiPage}
                                            onChange={(e) => setIsMultiPage(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Multi-page Exam
                                    </span>
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            isLoading={loading}
                            className="flex-1"
                        >
                            Create Exam
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateExamModal;
