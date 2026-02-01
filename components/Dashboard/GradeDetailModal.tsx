
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, FileText, AlertCircle, Percent, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Grade, StudentSubmission } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Button from '../Button';

interface GradeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    grade: Grade;
    modelAnswerText?: string;
    modelAnswerPdfUrl?: string; // Optional: To show model answer for comparison
}

const GradeDetailModal: React.FC<GradeDetailModalProps> = ({ isOpen, onClose, grade, modelAnswerText, modelAnswerPdfUrl }) => {
    const [activeTab, setActiveTab] = useState<'analysis' | 'paper'>('analysis');
    const [submission, setSubmission] = useState<StudentSubmission | null>(null);
    const [loadingSubmission, setLoadingSubmission] = useState(false);
    const [imageError, setImageError] = useState(false);

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
        if (!grade.submissionId) return;
        setLoadingSubmission(true);
        try {
            const docRef = doc(db, 'submissions', grade.submissionId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSubmission({ id: docSnap.id, ...docSnap.data() } as StudentSubmission);
            }
        } catch (error) {
            console.error("Error fetching submission:", error);
        } finally {
            setLoadingSubmission(false);
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
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                {grade.studentName}
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {grade.studentId}
                                </span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {grade.examTitle} • {grade.courseCode}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${isPassing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {grade.score} <span className="text-sm text-slate-400 font-normal">/ {grade.maxScore}</span>
                                </div>
                                <div className="text-sm text-slate-500 font-medium">
                                    Grade: {grade.letterGrade} ({grade.percentage}%)
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
                            AI Analysis & Insights
                        </button>
                        <button
                            onClick={() => setActiveTab('paper')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'paper'
                                ? 'border-primary text-primary bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            Paper vs Model Answer
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
                                                AI Confidence Score
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
                                            The AI is <strong>{result.confidence}% confident</strong> in this grading based on clarity of handwriting and match with the model answer.
                                        </p>
                                    </div>
                                )}

                                {/* Analysis Text */}
                                {result?.analysis && (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-purple-500" />
                                            Detailed Feedback
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
                                            What Went Well
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
                                            <p className="text-sm text-slate-500 italic">No specific strengths highlighted.</p>
                                        )}
                                    </div>

                                    {/* Missed Points */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-red-200 dark:border-red-900/30 shadow-sm">
                                        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                            <XCircle className="h-5 w-5" />
                                            Areas for Improvement
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
                                            <p className="text-sm text-slate-500 italic">No specific errors found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[500px]">
                                {/* Student Paper */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Student's Answer</h3>
                                        {submission?.imageUrl && (
                                            <a
                                                href={submission.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                                Open Original <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto bg-slate-100 dark:bg-black p-4 flex items-center justify-center relative">
                                        {loadingSubmission ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        ) : imageError ? (
                                            <div className="text-center text-slate-400">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Failed to load image</p>
                                            </div>
                                        ) : submission?.imageUrl ? (
                                            <img
                                                src={submission.imageUrl}
                                                alt="Student Answer"
                                                className="max-w-full h-auto rounded shadow-sm"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No image available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Model Answer */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Model Answer</h3>
                                    </div>
                                    <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-900">
                                        {modelAnswerText ? (
                                            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                                                {modelAnswerText}
                                            </div>
                                        ) : modelAnswerPdfUrl ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                                                <p className="mb-4 text-slate-600 dark:text-slate-400">Model answer is a PDF document.</p>
                                                <a
                                                    href={modelAnswerPdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                                >
                                                    View PDF Model Answer
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400 italic">
                                                No model answer provided.
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
