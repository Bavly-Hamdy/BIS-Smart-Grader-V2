
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Upload,
    Play,
    CheckCircle,
    AlertCircle,
    BarChart2,
    Save,
    Loader2,
    Camera
} from 'lucide-react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { uploadPdfToCloudinary, uploadImageToCloudinary } from '../../services/cloudinaryService';
import { motion } from 'framer-motion';
import Button from '../Button';
import BulkUploadModal from './modals/BulkUploadModal';
import { Exam, StudentSubmission } from '../../types';
import { batchGradeSubmissions, GradingRequest } from '../../services/geminiGradingService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

const ExamDetail: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { t, language, dir } = useLanguage();
    const { addToast } = useToast();
    const isRTL = language === 'ar';

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

    // Model Answer State
    const [modelAnswerMode, setModelAnswerMode] = useState<'text' | 'pdf' | 'image'>('text');
    const [modelAnswerText, setModelAnswerText] = useState('');
    const [modelAnswerPdfUrl, setModelAnswerPdfUrl] = useState('');
    const [modelAnswerPdfName, setModelAnswerPdfName] = useState('');
    const [modelAnswerImageUrl, setModelAnswerImageUrl] = useState('');
    const [modelAnswerImageName, setModelAnswerImageName] = useState('');
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSavingModelAnswer, setIsSavingModelAnswer] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Grading State
    const [isGrading, setIsGrading] = useState(false);
    const [gradingProgress, setGradingProgress] = useState({ current: 0, total: 0 });
    const [gradingError, setGradingError] = useState<string | null>(null);

    useEffect(() => {
        if (examId) {
            fetchExamData();
        }
    }, [examId]);

    const fetchExamData = async () => {
        if (!examId) return;

        try {
            setLoading(true);
            // Fetch Exam
            const examDoc = await getDoc(doc(db, 'exams', examId));
            if (examDoc.exists()) {
                const data = examDoc.data() as Exam;
                setExam({ id: examDoc.id, ...data });
                // @ts-ignore - Load model answer data
                if (data.modelAnswerText) {
                    setModelAnswerText(data.modelAnswerText);
                    setModelAnswerMode('text');
                }
                // @ts-ignore
                if (data.modelAnswerPdfUrl) {
                    setModelAnswerPdfUrl(data.modelAnswerPdfUrl);
                    // @ts-ignore
                    setModelAnswerPdfName(data.modelAnswerPdfName || 'model-answer.pdf');
                    setModelAnswerMode('pdf');
                }
                // @ts-ignore
                if (data.modelAnswerImageUrl) {
                    setModelAnswerImageUrl(data.modelAnswerImageUrl);
                    // @ts-ignore
                    setModelAnswerImageName(data.modelAnswerImageName || 'model-answer.png');
                    setModelAnswerMode('image');
                }
            } else {
                console.error('Exam not found');
                navigate('/faculty-dashboard/exams');
            }

            // Fetch Submissions
            const q = query(collection(db, 'submissions'), where('examId', '==', examId));
            const snapshot = await getDocs(q);
            const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudentSubmission[];
            setSubmissions(subs);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveModelAnswer = async () => {
        if (!examId || !modelAnswerText.trim()) return;

        try {
            setIsSavingModelAnswer(true);
            await updateDoc(doc(db, 'exams', examId), {
                modelAnswerText: modelAnswerText,
                modelAnswerId: 'text-entry',
                modelAnswerPdfUrl: '', // Clear PDF if switching to text
                modelAnswerPdfName: '',
                modelAnswerImageUrl: '', // Clear image
                modelAnswerImageName: '',
                updatedAt: new Date().toISOString()
            });
            setIsSavingModelAnswer(false);
        } catch (error) {
            console.error('Error saving model answer:', error);
            setIsSavingModelAnswer(false);
        }
    };

    const handlePdfUpload = async (file: File) => {
        if (!examId || !file) return;

        try {

            setUploadProgress(0);

            const folder = `model-answers/${examId}`;

            const result = await uploadPdfToCloudinary(file, folder, (progress) => {
                setUploadProgress(progress);
            });

            await updateDoc(doc(db, 'exams', examId), {
                modelAnswerPdfUrl: result.secure_url,
                modelAnswerPdfName: file.name,
                modelAnswerId: 'pdf-upload',
                modelAnswerText: '',
                modelAnswerImageUrl: '',
                modelAnswerImageName: '',
                updatedAt: new Date().toISOString()
            });

            setModelAnswerPdfUrl(result.secure_url);
            setModelAnswerPdfName(file.name);
            setIsUploadingPdf(false);
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            setIsUploadingPdf(false);
            addToast(isRTL ? 'فشل رفع ملف PDF. يرجى المحاولة مرة أخرى.' : 'Failed to upload PDF. Please try again.', 'error');
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!examId || !file) return;

        try {
            setUploadProgress(0);
            setIsUploadingImage(true);

            const folder = `model-answers/${examId}`;

            const result = await uploadImageToCloudinary(file, folder, (progress) => {
                setUploadProgress(progress);
            });

            await updateDoc(doc(db, 'exams', examId), {
                modelAnswerImageUrl: result.secure_url,
                modelAnswerImageName: file.name,
                modelAnswerId: 'image-upload',
                modelAnswerText: '',
                modelAnswerPdfUrl: '',
                modelAnswerPdfName: '',
                updatedAt: new Date().toISOString()
            });

            setModelAnswerImageUrl(result.secure_url);
            setModelAnswerImageName(file.name);
            setIsUploadingImage(false);
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading image:', error);
            setIsUploadingImage(false);
            addToast(isRTL ? 'فشل رفع الصورة. يرجى المحاولة مرة أخرى.' : 'Failed to upload Image. Please try again.', 'error');
        }
    };

    const handleDeletePdf = async () => {
        if (!examId || !modelAnswerPdfUrl) return;

        try {
            await updateDoc(doc(db, 'exams', examId), {
                modelAnswerPdfUrl: '',
                modelAnswerPdfName: '',
                modelAnswerId: '',
                updatedAt: new Date().toISOString()
            });

            setModelAnswerPdfUrl('');
            setModelAnswerPdfName('');
        } catch (error) {
            console.error('Error deleting PDF:', error);
        }
    };

    const handleDeleteImage = async () => {
        if (!examId || !modelAnswerImageUrl) return;

        try {
            await updateDoc(doc(db, 'exams', examId), {
                modelAnswerImageUrl: '',
                modelAnswerImageName: '',
                modelAnswerId: '',
                updatedAt: new Date().toISOString()
            });

            setModelAnswerImageUrl('');
            setModelAnswerImageName('');
        } catch (error) {
            console.error('Error deleting Image:', error);
        }
    };

    const handleStartGrading = async () => {
        if (!exam || submissions.length === 0) return;
        if (!modelAnswerText && !modelAnswerPdfUrl && !modelAnswerImageUrl) return;

        setIsGrading(true);
        setGradingError(null);
        setGradingProgress({ current: 0, total: submissions.length });

        try {
            // Group pending submissions by studentId
            const pendingSubmissions = submissions.filter(s => s.status === 'pending' || s.status === 'processing');

            if (pendingSubmissions.length === 0) {
                addToast(t('all_graded_alert'), 'info');
                setIsGrading(false);
                return;
            }

            // Group by studentId
            const studentGroups: Record<string, typeof submissions> = {};
            pendingSubmissions.forEach(sub => {
                if (!studentGroups[sub.studentId]) {
                    studentGroups[sub.studentId] = [];
                }
                studentGroups[sub.studentId].push(sub);
            });

            const uniqueStudentIds = Object.keys(studentGroups);
            setGradingProgress({ current: 0, total: uniqueStudentIds.length });

            let completed = 0;

            for (const studentId of uniqueStudentIds) {
                const studentSubmissions = studentGroups[studentId];
                const studentName = studentSubmissions[0].studentName;
                const imageUrls = studentSubmissions.map(s => s.imageUrl);

                try {
                    // Update all status to processing
                    for (const sub of studentSubmissions) {
                        await updateDoc(doc(db, 'submissions', sub.id), { status: 'processing' });
                    }

                    // Prepare request with all images
                    const request: GradingRequest = {
                        studentAnswerImageUrls: imageUrls,
                        modelAnswerText: modelAnswerText || undefined,
                        modelAnswerPdfUrl: modelAnswerPdfUrl || undefined,
                        modelAnswerImageUrl: modelAnswerImageUrl || undefined,
                        maxScore: exam.totalMarks,
                        examTitle: exam.title,
                        gradingRubric: "Grade strictly based on the model answer provided. This submission contains multiple pages."
                    };

                    // Call AI
                    const result = await batchGradeSubmissions([request]);
                    const gradeData = result[0];

                    // Create Grade Record in Firestore
                    const gradeRecord = {
                        studentId: gradeData.detectedStudentId || studentId,
                        studentName: gradeData.detectedStudentName || studentName,
                        examId: exam.id,
                        facultyId: exam.facultyId || auth.currentUser?.uid,
                        examTitle: exam.title,
                        courseId: exam.courseId,
                        courseName: exam.courseName,
                        courseCode: exam.courseCode,
                        score: gradeData.grade,
                        maxScore: exam.totalMarks,
                        percentage: (gradeData.grade / exam.totalMarks) * 100,
                        letterGrade: calculateLetterGrade((gradeData.grade / exam.totalMarks) * 100),
                        status: 'draft',
                        gradedAt: new Date().toISOString(),
                        submissionId: studentSubmissions[0].id, // Reference the first submission doc
                        submissionIds: studentSubmissions.map(s => s.id), // Store all page refs
                        gradingResult: {
                            ...gradeData,
                            gradedBy: 'AI-Gemini',
                            detectedStudentName: gradeData.detectedStudentName || null,
                            detectedStudentId: gradeData.detectedStudentId || null,
                            pageCount: imageUrls.length
                        }
                    };

                    // Save Grade
                    await addDocFirestore(collection(db, 'grades'), gradeRecord);

                    // Update all Submissions Status
                    for (const sub of studentSubmissions) {
                        await updateDoc(doc(db, 'submissions', sub.id), {
                            status: 'graded',
                            aiGrade: gradeData.grade,
                            finalGrade: gradeData.grade
                        });
                    }

                    completed++;
                    setGradingProgress({ current: completed, total: uniqueStudentIds.length });

                } catch (err) {
                    console.error(`Error grading submission for student ${studentId}:`, err);
                    // Continue to next
                }
            }

            // Update Exam Status
            await updateDoc(doc(db, 'exams', exam.id), {
                status: 'graded',
                gradedCount: (exam.gradedCount || 0) + completed
            });

            setIsGrading(false);
            navigate(`/faculty-dashboard/exams/${examId}/grades`);

        } catch (error) {
            console.error('Grading error:', error);
            setGradingError(t('grading_error_msg'));
            setIsGrading(false);
        }
    };

    const calculateLetterGrade = (percentage: number) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const handleDeleteSubmission = async (subId: string) => {
        if (!window.confirm(t('delete_submission_confirm'))) return;
        try {
            await deleteDoc(doc(db, 'submissions', subId));
            setSubmissions(prev => prev.filter(s => s.id !== subId));
        } catch (error) {
            console.error('Error deleting submission:', error);
            addToast(t('delete_submission_fail'), 'error');
        }
    };

    // Helper for Firestore
    const addDocFirestore = async (coll: any, data: any) => {
        return addDoc(coll, data);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!exam) return null;

    const isReadyToGrade = (modelAnswerText.length > 0 || modelAnswerPdfUrl.length > 0 || modelAnswerImageUrl.length > 0) && submissions.length > 0;
    const hasModelAnswer = modelAnswerText.length > 0 || modelAnswerPdfUrl.length > 0 || modelAnswerImageUrl.length > 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto" dir={dir}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/faculty-dashboard/exams')}
                        className="flex items-center text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4 font-medium group"
                    >
                        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180 group-hover:translate-x-1' : 'mr-2 group-hover:-translate-x-1'} transition-transform`} />
                        {t('back_to_exams')}
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        {exam.title}
                        <span className={`text-xs px-2 py-1 rounded-full ${exam.status === 'graded' ? 'bg-green-100 text-green-700' :
                            exam.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {t(exam.status).toUpperCase()}
                        </span>
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-slate-600 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(exam.examDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {exam.duration} {isRTL ? 'دقيقة' : 'mins'}</span>
                        <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> {exam.totalMarks} {isRTL ? 'درجة' : 'Marks'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate(`/faculty-dashboard/exams/${examId}/grades`)}>
                        <BarChart2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('view_results')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Model Answer */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            {t('model_answer_rubric')}
                        </h2>

                        {/* Mode Toggle */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setModelAnswerMode('text')}
                                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${modelAnswerMode === 'text'
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                            >
                                {t('text_mode')}
                            </button>
                            <button
                                onClick={() => setModelAnswerMode('pdf')}
                                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${modelAnswerMode === 'pdf'
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                            >
                                {t('pdf_mode')}
                            </button>
                            <button
                                onClick={() => setModelAnswerMode('image')}
                                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${modelAnswerMode === 'image'
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                            >
                                {t('image_mode')}
                            </button>
                        </div>
                    </div>

                    {modelAnswerMode === 'text' ? (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('enter_answers_instruction')}
                            </p>
                            <textarea
                                className="flex-1 w-full min-h-[300px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none font-mono text-sm"
                                placeholder={isRTL ? "مثال:\n1. تعريف نظام المعلومات: مجموعة من المكونات التي تجمع وتعالج وتخزن وتوزع المعلومات... (٥ درجات)\n2. أنواع الشبكات: LAN, WAN, MAN... (١٠ درجات)\n..." : "Example:\n1. Definition of Information System: A set of components that collect, process, store and distribute information... (5 marks)\n2. Types of Networks: LAN, WAN, MAN... (10 marks)\n..."}
                                value={modelAnswerText}
                                onChange={(e) => setModelAnswerText(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleSaveModelAnswer}
                                    isLoading={isSavingModelAnswer}
                                    disabled={!modelAnswerText}
                                >
                                    <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {t('save_text')}
                                </Button>
                            </div>
                        </>
                    ) : modelAnswerMode === 'pdf' ? (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('upload_pdf_hint')}
                            </p>

                            {modelAnswerPdfUrl ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg">
                                    <FileText className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{modelAnswerPdfName}</p>
                                    <p className="text-sm text-slate-500 mb-4">{isRTL ? 'تم رفع ملف PDF بنجاح' : 'PDF uploaded successfully'}</p>
                                    <div className="flex gap-3">
                                        <a
                                            href={modelAnswerPdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            {t('view_pdf_btn')}
                                        </a>
                                        <button
                                            onClick={handleDeletePdf}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                            {t('delete_btn')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                    {isUploadingPdf ? (
                                        <div className="w-full max-w-md">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-slate-500 text-center mt-2">{Math.round(uploadProgress)}% {isRTL ? 'مرفوع' : 'uploaded'}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-12 w-12 text-slate-400 mb-4" />
                                            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('upload_pdf_title')}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('click_to_browse')}</p>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handlePdfUpload(file);
                                                }}
                                                className="hidden"
                                                id="pdf-upload-input"
                                            />
                                            <label htmlFor="pdf-upload-input">
                                                <Button type="button" onClick={() => document.getElementById('pdf-upload-input')?.click()}>
                                                    <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                    {t('choose_pdf')}
                                                </Button>
                                            </label>
                                            <p className="text-xs text-slate-400 mt-3">{t('max_file_size')}</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('upload_image_hint')}
                            </p>

                            {modelAnswerImageUrl ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg">
                                    <img src={modelAnswerImageUrl} alt="Model Answer" className="h-24 w-auto object-contain mb-4 rounded-md shadow-sm" />
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{modelAnswerImageName}</p>
                                    <p className="text-sm text-slate-500 mb-4">{isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'}</p>
                                    <div className="flex gap-3">
                                        <a
                                            href={modelAnswerImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            {t('view_image_btn')}
                                        </a>
                                        <button
                                            onClick={handleDeleteImage}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                            {t('delete_btn')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                    {isUploadingImage ? (
                                        <div className="w-full max-w-md">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-slate-500 text-center mt-2">{Math.round(uploadProgress)}% {isRTL ? 'مرفوع' : 'uploaded'}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-12 w-12 text-slate-400 mb-4" />
                                            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('upload_image_title')}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('click_to_browse')}</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file);
                                                }}
                                                className="hidden"
                                                id="image-upload-input"
                                            />
                                            <label htmlFor="image-upload-input">
                                                <Button type="button" onClick={() => document.getElementById('image-upload-input')?.click()}>
                                                    <Camera className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                    {t('choose_image')}
                                                </Button>
                                            </label>
                                            <p className="text-xs text-slate-400 mt-3">{t('max_file_size')}</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Column: Submissions & Actions */}
                <div className="space-y-6">
                    {/* Upload Section */}
                     <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Upload className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-500`} />
                                {t('student_submissions')}
                            </h2>
                            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
                                {t('upload_answer_sheets')}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{submissions.length}</p>
                                <p className="text-xs text-slate-500">{t('total_uploaded')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {submissions.filter(s => s.status === 'graded').length}
                                </p>
                                <p className="text-xs text-slate-500">{t('graded_count_label')}</p>
                            </div>
                        </div>

                        {submissions.length > 0 ? (
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                                {submissions.map((sub, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            <span className="font-medium">{sub.studentName} ({sub.studentId})</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {t(sub.status)}
                                            </span>
                                            <button 
                                                onClick={() => handleDeleteSubmission(sub.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                title="Delete Submission"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                                <p>{t('no_submissions_uploaded')}</p>
                            </div>
                        )}
                    </div>

                    {/* Grading Action */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                            <Play className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('ai_auto_grading')}
                        </h2>
                        <p className="text-indigo-100 text-sm mb-6">
                            {t('ai_grading_subtitle')}
                        </p>

                        {isGrading ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{isRTL ? 'جاري التصحيح التلقائي...' : 'Grading in progress...'}</span>
                                    <span>{Math.round((gradingProgress.current / gradingProgress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-indigo-900/50 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-white h-full rounded-full transition-all duration-300"
                                        style={{ width: `${(gradingProgress.current / gradingProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-indigo-200 mt-2 text-center">
                                    {isRTL ? `جاري معالجة ${gradingProgress.current} من أصل ${gradingProgress.total} طالب` : `Processing ${gradingProgress.current} of ${gradingProgress.total} students`}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={handleStartGrading}
                                disabled={!isReadyToGrade}
                                className={`w-full py-3 rounded-lg font-bold text-center transition-all ${isReadyToGrade
                                    ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-md'
                                    : 'bg-indigo-800/50 text-indigo-400 cursor-not-allowed'
                                    }`}
                            >
                                {submissions.length === 0 ? t('upload_submissions_first') :
                                    !hasModelAnswer ? t('enter_model_answer_first') :
                                        t('start_grading_now')}
                            </button>
                        )}

                        {gradingError && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {gradingError}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BulkUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                examId={examId!}
                examTitle={exam.title}
                onComplete={() => {
                    setIsUploadModalOpen(false);
                    fetchExamData();
                }}
            />
        </div>
    );
};

export default ExamDetail;
