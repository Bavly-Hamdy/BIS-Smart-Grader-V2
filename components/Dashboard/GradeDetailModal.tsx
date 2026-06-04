
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, FileText, AlertCircle, Percent, ExternalLink, Image as ImageIcon, Edit2, Save, ArrowLeft } from 'lucide-react';
import { Grade, StudentSubmission } from '../../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Button from '../Button';
import { useLanguage } from '../../context/LanguageContext';

interface GradeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    grade: Grade;
    modelAnswerText?: string;
    modelAnswerPdfUrl?: string; // Optional: To show model answer for comparison
    onGradeUpdated?: () => void;
}

const GradeDetailModal: React.FC<GradeDetailModalProps> = ({ isOpen, onClose, grade, modelAnswerText, modelAnswerPdfUrl, onGradeUpdated }) => {
    const { t, language, dir } = useLanguage();
    const isRTL = language === 'ar';
    const [activeTab, setActiveTab] = useState<'analysis' | 'paper'>('analysis');
    const [submission, setSubmission] = useState<StudentSubmission | null>(null);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [activePage, setActivePage] = useState(0);
    const [loadingSubmission, setLoadingSubmission] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isEditingScore, setIsEditingScore] = useState(false);
    const [editedScore, setEditedScore] = useState(grade.score);
    const [isSavingScore, setIsSavingScore] = useState(false);

    // Manual Details State
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editedName, setEditedName] = useState(grade.studentName);
    const [editedId, setEditedId] = useState(grade.studentId);
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    useEffect(() => {
        if (isOpen && grade.submissionId) {
            fetchSubmission();
        }
        return () => {
            setSubmission(null);
            setImageError(false);
        };
    }, [isOpen, grade]);

    const fetchSubmission = async () => {
        const ids = grade.submissionIds || (grade.submissionId ? [grade.submissionId] : []);
        if (ids.length === 0) return;
        
        setLoadingSubmission(true);
        try {
            const fetchedSubmissions: StudentSubmission[] = [];
            for (const id of ids) {
                const docRef = doc(db, 'submissions', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    fetchedSubmissions.push({ id: docSnap.id, ...docSnap.data() } as StudentSubmission);
                }
            }
            
            setSubmissions(fetchedSubmissions);
            if (fetchedSubmissions.length > 0) {
                setSubmission(fetchedSubmissions[0]);
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoadingSubmission(false);
        }
    };

    const calculateLetterGrade = (percentage: number) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const handleSaveScore = async () => {
        if (!grade.id) return;
        try {
            setIsSavingScore(true);
            const percentage = grade.maxScore > 0 ? (editedScore / grade.maxScore) * 100 : 0;
            const letter = calculateLetterGrade(percentage);

            await updateDoc(doc(db, 'grades', grade.id), {
                score: editedScore,
                percentage: percentage,
                letterGrade: letter
            });

            if (grade.submissionId) {
                await updateDoc(doc(db, 'submissions', grade.submissionId), {
                    finalGrade: editedScore
                });
            }

            setIsEditingScore(false);
            if (onGradeUpdated) onGradeUpdated();
        } catch (error) {
            console.error('Error updating score:', error);
            alert(t('failed_to_update_score'));
        } finally {
            setIsSavingScore(false);
        }
    };

    const handleSaveDetails = async () => {
        if (!grade.id) return;
        try {
            setIsSavingDetails(true);
            
            await updateDoc(doc(db, 'grades', grade.id), {
                studentName: editedName,
                studentId: editedId
            });

            if (grade.submissionId) {
                await updateDoc(doc(db, 'submissions', grade.submissionId), {
                    studentName: editedName,
                    studentId: editedId
                });
            }

            setIsEditingDetails(false);
            if (onGradeUpdated) onGradeUpdated();
        } catch (error) {
            console.error('Error updating student details:', error);
            alert(t('failed_to_update_details'));
        } finally {
            setIsSavingDetails(false);
        }
    };

    if (!isOpen) return null;

    const result = grade.gradingResult;
    const isPassing = grade.percentage >= 60;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    dir={dir}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                        <div className="flex-1">
                            {isEditingDetails ? (
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                        <div className="relative w-full sm:w-64">
                                            <input
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                className="w-full px-3 py-2 text-lg font-bold border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                placeholder={t('student_name')}
                                            />
                                        </div>
                                        <div className="relative w-full sm:w-48">
                                            <input
                                                type="text"
                                                value={editedId}
                                                onChange={(e) => setEditedId(e.target.value)}
                                                className="w-full px-3 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                placeholder={t('student_id')}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleSaveDetails} 
                                                disabled={isSavingDetails}
                                                className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                                                title={t('save_details')}
                                            >
                                                <Save className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    setIsEditingDetails(false); 
                                                    setEditedName(grade.studentName); 
                                                    setEditedId(grade.studentId); 
                                                }}
                                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                                title={t('cancel')}
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        {grade.studentName}
                                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {grade.studentId}
                                        </span>
                                        <button 
                                            onClick={() => setIsEditingDetails(true)}
                                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                            title={t('edit_student_details')}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                                        {grade.examTitle} • {grade.courseCode}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                {isEditingScore ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max={grade.maxScore}
                                            value={editedScore}
                                            onChange={(e) => setEditedScore(Number(e.target.value))}
                                            className="w-20 px-2 py-1 text-lg font-bold border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                        <span className="text-sm text-slate-400 font-normal mt-1">/ {grade.maxScore}</span>
                                        <button 
                                            onClick={handleSaveScore} 
                                            disabled={isSavingScore}
                                            className="p-1.5 ml-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                        >
                                            <Save className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => { setIsEditingScore(false); setEditedScore(grade.score); }}
                                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`text-2xl font-bold flex items-center justify-end gap-2 ${isPassing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {grade.score} <span className="text-sm text-slate-400 font-normal">/ {grade.maxScore}</span>
                                        <button 
                                            onClick={() => setIsEditingScore(true)}
                                            className="text-slate-400 hover:text-primary transition-colors p-1"
                                            title={t('edit_ai_grade')}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="text-sm text-slate-500 font-medium">
                                    {t('grade_label')}: {grade.letterGrade} ({grade.percentage.toFixed(1)}%)
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'analysis'
                                ? 'border-primary text-primary bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <AlertCircle className="h-4 w-4" />
                            {t('ai_analysis_insights')}
                        </button>
                        <button
                            onClick={() => setActiveTab('paper')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'paper'
                                ? 'border-primary text-primary bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            {t('paper_vs_model')}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50">
                        {activeTab === 'analysis' ? (
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {/* AI Confidence */}
                                {result?.confidence !== undefined && (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Percent className="h-5 w-5 text-blue-500" />
                                                {t('ai_confidence_score')}
                                            </h3>
                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${result.confidence > 80 ? 'bg-green-100 text-green-700' :
                                                result.confidence > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {result.confidence}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${result.confidence > 80 ? 'bg-green-500' :
                                                    result.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${result.confidence}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-slate-500 mt-3">
                                            {language === 'ar' ? (
                                                <span>الذكاء الاصطناعي واثق بنسبة <strong>{result.confidence}%</strong> من هذا التصحيح بناءً على وضوح الخط والمطابقة مع نموذج الإجابة.</span>
                                            ) : (
                                                <span>The AI is <strong>{result.confidence}% confident</strong> in this grading based on clarity of handwriting and match with the model answer.</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Analysis Text */}
                                {result?.analysis && (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-purple-500" />
                                            {t('detailed_feedback')}
                                        </h3>
                                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {result.analysis}
                                        </div>
                                    </div>
                                )}

                                {/* Matched Points */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-green-200 dark:border-green-900/30 shadow-sm">
                                        <h3 className="font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />
                                            {t('what_went_well')}
                                        </h3>
                                        {result?.matchedPoints && result.matchedPoints.length > 0 ? (
                                            <ul className="space-y-3">
                                                {result.matchedPoints.map((point, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                                        <div className="mt-1 min-w-[16px]">
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                        </div>
                                                        <span className="text-sm">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">{t('no_strengths_highlighted')}</p>
                                        )}
                                    </div>

                                    {/* Missed Points */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-red-200 dark:border-red-900/30 shadow-sm">
                                        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                            <XCircle className="h-5 w-5" />
                                            {t('areas_for_improvement')}
                                        </h3>
                                        {result?.missedPoints && result.missedPoints.length > 0 ? (
                                            <ul className="space-y-3">
                                                {result.missedPoints.map((point, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                                        <div className="mt-1 min-w-[16px]">
                                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                                        </div>
                                                        <span className="text-sm">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">{t('no_errors_found')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[500px]">
                                {/* Student Paper */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{t('student_answer')}</h3>
                                            {submissions.length > 1 && (
                                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                                                    {t('page_of').replace('{current}', String(activePage + 1)).replace('{total}', String(submissions.length))}
                                                </span>
                                            )}
                                        </div>
                                        {submissions[activePage]?.imageUrl && (
                                            <a
                                                href={submissions[activePage].imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                                {t('open_original')} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto bg-slate-100 dark:bg-black p-4 flex flex-col items-center justify-center relative">
                                        {loadingSubmission ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        ) : imageError ? (
                                            <div className="text-center text-slate-400">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>{t('failed_to_load_image')}</p>
                                            </div>
                                        ) : submissions.length > 0 ? (
                                            <>
                                                <img
                                                    src={submissions[activePage].imageUrl}
                                                    alt={`Page ${activePage + 1}`}
                                                    className="max-w-full h-auto rounded shadow-sm transition-opacity duration-300"
                                                    onError={() => setImageError(true)}
                                                />
                                                
                                                {submissions.length > 1 && (
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-10 border border-white/10">
                                                        <button 
                                                            disabled={activePage === 0}
                                                            onClick={() => setActivePage(p => Math.max(0, p - 1))}
                                                            className="p-1 text-white hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <div className="flex gap-1.5 px-1">
                                                            {submissions.map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setActivePage(i)}
                                                                    className={`w-2 h-2 rounded-full transition-all ${activePage === i ? 'bg-indigo-400 w-4' : 'bg-white/40'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <button 
                                                            disabled={activePage === submissions.length - 1}
                                                            onClick={() => setActivePage(p => Math.min(submissions.length - 1, p + 1))}
                                                            className="p-1 text-white hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            <ArrowLeft className={`h-4 w-4 ${isRTL ? '' : 'rotate-180'}`} />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>{t('no_image_available')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Model Answer */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{t('model_answer')}</h3>
                                    </div>
                                    <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-900">
                                        {modelAnswerText ? (
                                            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                                                {modelAnswerText}
                                            </div>
                                        ) : modelAnswerPdfUrl ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                                                <p className="mb-4 text-slate-600 dark:text-slate-400">{t('model_answer_pdf_desc')}</p>
                                                <a
                                                    href={modelAnswerPdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                                >
                                                    {t('view_pdf_model_answer')}
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400 italic">
                                                {t('no_model_answer_provided')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GradeDetailModal;
