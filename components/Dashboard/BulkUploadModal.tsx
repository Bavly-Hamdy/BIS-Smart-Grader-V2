import React, { useState, useCallback } from 'react';
import { X, Upload, FileImage, AlertCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { extractStudentInfo } from '../../services/geminiGradingService';
import Button from '../Button';

interface BulkUploadModalProps {
    examId: string;
    examTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

interface UploadFile {
    id: string;
    file: File;
    preview: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    studentId?: string;
    studentName?: string;
    isExtracting?: boolean;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
    examId,
    examTitle,
    isOpen,
    onClose,
    onComplete
}) => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    };

    const processFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB for Cloudinary free tier

            return (isImage || isPDF) && isValidSize;
        });

        const uploadFiles: UploadFile[] = validFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            status: 'pending',
            progress: 0,
            isExtracting: true
        }));

        setFiles(prev => [...prev, ...uploadFiles]);

        // Kick off extraction for all new files
        uploadFiles.forEach(async (uFile) => {
            try {
                const info = await extractStudentInfo(uFile.file);
                setFiles(prev => prev.map(f => {
                    if (f.id === uFile.id) {
                        return {
                            ...f,
                            isExtracting: false,
                            studentId: info.studentId || '',
                            studentName: info.studentName || ''
                        };
                    }
                    return f;
                }));
            } catch (error) {
                console.error('Extraction failed for', uFile.file.name, error);
                setFiles(prev => prev.map(f => f.id === uFile.id ? { ...f, isExtracting: false } : f));
            }
        });
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    const updateFileStudent = (id: string, studentId: string, studentName: string) => {
        setFiles(prev =>
            prev.map(f => f.id === id ? { ...f, studentId, studentName } : f)
        );
    };

    const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
        if (!auth.currentUser || !uploadFile.studentId) {
            throw new Error('Missing required data');
        }

        try {
            // Update status
            setFiles(prev =>
                prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'uploading' as const, progress: 0 }
                        : f
                )
            );

            // Upload to Cloudinary
            const folder = `answer-sheets/${examId}/${uploadFile.studentId}`;
            const result = await uploadImageToCloudinary(
                uploadFile.file,
                folder,
                (progress) => {
                    setFiles(prev =>
                        prev.map(f =>
                            f.id === uploadFile.id
                                ? { ...f, progress }
                                : f
                        )
                    );
                }
            );

            // Save submission to Firestore
            await addDoc(collection(db, 'submissions'), {
                examId,
                studentId: uploadFile.studentId,
                studentName: uploadFile.studentName,
                imageUrl: result.secure_url,
                imagePath: result.public_id, // Cloudinary public_id for potential deletion
                uploadedAt: new Date().toISOString(),
                uploadedBy: auth.currentUser!.uid,
                status: 'pending'
            });

            setFiles(prev =>
                prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'success', progress: 100 }
                        : f
                )
            );
        } catch (error: any) {
            console.error('Upload error:', error);
            setFiles(prev =>
                prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'error', error: error.message }
                        : f
                )
            );
            throw error;
        }
    };

    const handleUploadAll = async () => {
        const filesWithStudents = files.filter(f => f.studentId && f.status === 'pending');

        if (filesWithStudents.length === 0) {
            alert('Please assign students to all files before uploading');
            return;
        }

        setIsUploading(true);

        for (const file of filesWithStudents) {
            try {
                await uploadFile(file);
            } catch (error) {
                console.error(`Failed to upload ${file.file.name}:`, error);
            }
        }

        setIsUploading(false);

        if (onComplete) {
            onComplete();
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            // Clean up previews
            files.forEach(f => {
                if (f.preview) {
                    URL.revokeObjectURL(f.preview);
                }
            });
            setFiles([]);
            onClose();
        }
    };

    if (!isOpen) return null;

    const allUploaded = files.length > 0 && files.every(f => f.status === 'success');
    const canUpload = files.length > 0 && files.every(f => f.studentId) && !isUploading;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    رفع أوراق الإجابة / Upload Answer Sheets
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {examTitle}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isUploading}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Drop Zone */}
                        {!allUploaded && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-primary'
                                    }`}
                            >
                                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                                <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Drop Answer Sheets Here
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    or click to browse files
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf"
                                    onChange={handleFileInput}
                                    className="hidden"
                                    id="file-input"
                                />
                                <label htmlFor="file-input">
                                    <Button type="button" onClick={() => document.getElementById('file-input')?.click()}>
                                        <FileImage className="h-5 w-5 mr-2" />
                                        Select Files
                                    </Button>
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                                    Supported: JPG, PNG, PDF • Max 5MB per file
                                </p>
                            </div>
                        )}

                        {/* Files List */}
                        {files.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Files ({files.length})
                                </h3>
                                {files.map(file => (
                                    <FileCard
                                        key={file.id}
                                        file={file}
                                        onRemove={() => removeFile(file.id)}
                                        onStudentAssign={(studentId, studentName) =>
                                            updateFileStudent(file.id, studentId, studentName)
                                        }
                                        disabled={isUploading || file.status !== 'pending'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isUploading}
                            className="flex-1"
                        >
                            {allUploaded ? 'Close' : 'Cancel'}
                        </Button>
                        {!allUploaded && (
                            <Button
                                onClick={handleUploadAll}
                                disabled={!canUpload}
                                isLoading={isUploading}
                                className="flex-1"
                            >
                                Upload All ({files.filter(f => f.studentId).length}/{files.length})
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// File Card Component
interface FileCardProps {
    file: UploadFile;
    onRemove: () => void;
    onStudentAssign: (studentId: string, studentName: string) => void;
    disabled: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ file, onRemove, onStudentAssign, disabled }) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    {file.file.type.startsWith('image/') ? (
                        <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FileImage className="h-8 w-8 text-slate-400" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {file.file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(file.file.size / 1024).toFixed(1)} KB
                    </p>

                    {/* Student Assignment */}
                    {file.status === 'pending' && (
                        <div className="mt-2">
                            {file.isExtracting ? (
                                <div className="flex items-center gap-2 text-sm text-primary">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>AI is detecting Student Info...</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Student ID"
                                        value={file.studentId || ''}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            onStudentAssign(id, file.studentName || `Student ${id}`);
                                        }}
                                        disabled={disabled}
                                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                    {file.studentName && (
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            Identified as: {file.studentName}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress */}
                    {file.status === 'uploading' && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all"
                                        style={{ width: `${file.progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {Math.round(file.progress)}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    {file.status === 'success' && (
                        <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-medium">Uploaded</span>
                        </div>
                    )}

                    {file.status === 'error' && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs">{file.error}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {file.status === 'pending' && (
                    <button
                        onClick={onRemove}
                        disabled={disabled}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BulkUploadModal;
