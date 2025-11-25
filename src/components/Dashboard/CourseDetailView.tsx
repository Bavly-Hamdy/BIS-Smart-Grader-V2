import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, QuerySnapshot, DocumentData, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import {
  ArrowLeft,
  Users,
  BookOpen,
  FileText,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Clock,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  FileText as FileTextIcon, // Using alias for clarity
  Image as ImageIcon,
  GraduationCap
} from 'lucide-react';
import Button from '../../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ==========================================
// CONSTANTS
// ==========================================
const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; // Replace with your actual Gemini API key

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]); // Get base64 string without data:mime/type;base64,
      } else {
        reject(new Error("Failed to convert file to Base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

const imageUrlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error("Failed to convert image URL to Base64"));
          }
        };
      })
      .catch(error => reject(error));
  });
};

// ==========================================
// TYPES
// ==========================================

interface Course {
  id: string;
  title: string;
  code: string;
  studentCount: number;
  description?: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  totalMarks: number;
  modelAnswerPdf?: string; // Storing Base64 PDF
  status: 'Draft' | 'Published' | 'Graded';
  createdAt?: any;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface GradingResult {
  score: number;
  max_score: number;
  feedback: string;
  mistakes: string[];
}

// ==========================================
// INTERNAL COMPONENTS
// ==========================================

/**
 * ToastNotification
 * Success/Error toast notification
 */
const ToastNotification: React.FC<{
  state: ToastState;
  onClose: () => void;
}> = ({ state, onClose }) => {
  useEffect(() => {
    if (state.show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.show, onClose]);

  return (
    <AnimatePresence>
      {state.show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl bg-white dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50"
        >
          {state.type === 'success' ? (
            <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-full shadow-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="p-1.5 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 rounded-full shadow-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {state.type === 'success' ? 'Success' : 'Error'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{state.message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * CreateExamModal
 * Modal for creating a new exam with PDF model answer
 */
const CreateExamModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}> = ({ isOpen, onClose, courseId, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    totalMarks: '',
    modelAnswerPdf: '', // Will store Base64 string
    status: 'Draft' as 'Draft' | 'Published' | 'Graded'
  });
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, modelAnswerPdf: base64 }));
        showToast('PDF converted to Base64 successfully!', 'success');
      } catch (error) {
        console.error('Error converting PDF to Base64:', error);
        setFormData(prev => ({ ...prev, modelAnswerPdf: '' }));
        setSelectedFileName(null);
        showToast('Failed to convert PDF. Please try again.', 'error');
      }
    } else {
      setFormData(prev => ({ ...prev, modelAnswerPdf: '' }));
      setSelectedFileName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setLoading(true);
    try {
      const examData = {
        ...formData,
        totalMarks: Number(formData.totalMarks),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'courses', courseId, 'exams'), examData);

      showToast('Exam created successfully!', 'success');
      setFormData({
        title: '',
        date: '',
        totalMarks: '',
        modelAnswerPdf: '',
        status: 'Draft'
      });
      setSelectedFileName(null);
      onClose();
    } catch (error) {
      console.error('Error creating exam:', error);
      showToast('Failed to create exam. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.date.trim().length > 0 &&
    formData.totalMarks.trim().length > 0 &&
    Number(formData.totalMarks) > 0 &&
    formData.modelAnswerPdf.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Exam</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define the exam details and model answer for AI grading.</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Exam Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Midterm Examination"
                      required
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Exam Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Total Marks <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="totalMarks"
                        type="number"
                        value={formData.totalMarks}
                        onChange={handleChange}
                        placeholder="100"
                        min="1"
                        required
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Graded">Graded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Model Answer (PDF) <span className="text-red-500">*</span>
                      <span className="text-xs text-slate-500 ml-2">(Upload PDF for AI grading)</span>
                    </label>
                    <label
                      htmlFor="modelAnswerPdf"
                      className="flex items-center justify-center w-full h-32 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 text-slate-500 cursor-pointer hover:border-primary hover:text-primary transition-all"
                    >
                      <input
                        id="modelAnswerPdf"
                        name="modelAnswerPdf"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        disabled={loading}
                        className="hidden"
                      />
                      {selectedFileName ? (
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-5 w-5" />
                          <span>{selectedFileName}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, modelAnswerPdf: '' }));
                              setSelectedFileName(null);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="h-8 w-8" />
                          <p className="text-sm">Drag & drop PDF here, or click to browse</p>
                          <p className="text-xs text-slate-400">(Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Exam'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};


/**
 * GradingLabModal
 * Modal for AI grading interface
 */
const GradingLabModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  courseId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}> = ({ isOpen, onClose, exam, courseId, showToast }) => {
  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [studentImagePreview, setStudentImagePreview] = useState<string | null>(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setStudentImage(files[0]);
      setStudentImagePreview(URL.createObjectURL(files[0]));
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentImage(file);
      setStudentImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGrade = async () => {
    if (!studentImage || !exam.modelAnswerPdf) {
      showToast('Please upload both student paper and ensure a model answer PDF is set.', 'error');
      return;
    }

    setGradingLoading(true);
    setGradingResult(null);

    try {
      const studentImageBase64 = await fileToBase64(studentImage);

      const payload = {
        contents: [
          {
            parts: [
              { text: "You are a strict academic professor. You are provided with a Model Answer (PDF) and a Student's Handwritten Answer (Image). Grade the student's answer strictly against the model answer. Provide the response in a JSON format with the following keys: 'score' (number), 'max_score' (number), 'feedback' (string), and 'mistakes' (string[]). Do not include any other text or formatting outside the JSON." },
              { inlineData: { mimeType: 'application/pdf', data: exam.modelAnswerPdf } },
              { inlineData: { mimeType: studentImage.type, data: studentImageBase64 } }
            ]
          }
        ]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResponse) {
        // Attempt to parse JSON. Gemini might wrap it in markdown.
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : textResponse;
        const result: GradingResult = JSON.parse(jsonString);
        setGradingResult(result);
        showToast('Paper graded successfully!', 'success');

        // Optionally update exam status to 'Graded' or store results
        await updateDoc(doc(db, 'courses', courseId, 'exams', exam.id), {
          status: 'Graded',
          lastGraded: serverTimestamp(),
          lastGradeResult: result // Store the full result for history
        });

      } else {
        throw new Error('No text response from Gemini API');
      }

    } catch (error) {
      console.error('Error grading paper:', error);
      showToast(`Failed to grade paper: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setGradingLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStudentImage(null);
      setStudentImagePreview(null);
      setGradingResult(null);
      setGradingLoading(false);
    }
  }, [isOpen]);

  const gradesTab = (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-blue-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary dark:text-blue-400" />
          AI Grading Lab for "{exam.title}"
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Upload student handwritten papers to be graded automatically against the model answer PDF using Gemini AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Student Paper Upload */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-500" />
            Student Paper (Handwritten Image)
          </h4>
          <div
            className="flex flex-col items-center justify-center w-full min-h-[200px] px-4 py-6 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 cursor-pointer hover:border-primary hover:text-primary transition-all"
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onClick={() => document.getElementById('studentImageInput')?.click()}
          >
            <input
              id="studentImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={gradingLoading}
            />
            {studentImagePreview ? (
              <img src={studentImagePreview} alt="Student Paper Preview" className="max-h-48 rounded-md shadow-md" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="h-10 w-10" />
                <p className="text-sm font-medium">Drag & drop image here, or click to upload</p>
                <p className="text-xs text-slate-400">JPEG, PNG, GIF up to 5MB</p>
              </div>
            )}
          </div>
          {studentImage && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 text-center">
              Selected: {studentImage.name}
            </p>
          )}

          <Button
            variant="primary"
            className="w-full mt-6"
            onClick={handleGrade}
            disabled={!studentImage || !exam.modelAnswerPdf || gradingLoading}
          >
            {gradingLoading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...</>
            ) : (
              'Grade Paper with AI'
            )}
          </Button>
          {!exam.modelAnswerPdf && (
            <p className="text-red-500 text-sm mt-2 text-center">
              No model answer PDF set for this exam. Please edit the exam to upload one.
            </p>
          )}
        </div>

        {/* Right: Grading Results */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-500" />
            Grading Results
          </h4>
          {gradingLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          )}
          {gradingResult ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {gradingResult.score} / {gradingResult.max_score}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Feedback</p>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{gradingResult.feedback}</p>
              </div>
              {gradingResult.mistakes && gradingResult.mistakes.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Mistakes Identified</p>
                  <ul className="list-disc list-inside text-red-600 dark:text-red-400 text-sm space-y-1">
                    {gradingResult.mistakes.map((mistake, index) => (
                      <li key={index}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            !gradingLoading && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p>Upload a student paper and click "Grade Paper" to see results.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Grading Lab</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Grade student papers using advanced AI.</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={gradingLoading}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {gradesTab}
              </div>
              <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-end bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
                <Button variant="outline" onClick={onClose} disabled={gradingLoading}>
                  Close Lab
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};


// ==========================================
// MAIN COMPONENT
// ==========================================

const CourseDetailView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exams' | 'settings'>('overview');
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [isGradingLabModalOpen, setIsGradingLabModalOpen] = useState(false);
  const [selectedExamForGrading, setSelectedExamForGrading] = useState<Exam | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data()! } as Course);
        } else {
          console.log("No such course!");
          navigate('/faculty/courses');
        }
      } catch (error) {
        console.error("Error getting course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  // Real-time fetch exams from sub-collection
  useEffect(() => {
    if (!courseId) {
      setExamsLoading(false);
      return;
    }

    const examsRef = collection(db, 'courses', courseId, 'exams');

    const unsubscribe = onSnapshot(
      examsRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const examsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Exam[];

        // Sort by creation date (newest first)
        examsData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setExams(examsData);
        setExamsLoading(false);
      },
      (error) => {
        console.error('Error fetching exams:', error);
        setExamsLoading(false);
        showToast('Failed to load exams. Please refresh the page.', 'error');
      }
    );

    return () => unsubscribe();
  }, [courseId]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const handleOpenGradingLab = (exam: Exam) => {
    setSelectedExamForGrading(exam);
    setIsGradingLabModalOpen(true);
  };

  const getStatusBadgeColor = (status: Exam['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'Published':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Mock Data for Charts and Lists
  const performanceData = [
    { name: 'Quiz 1', avg: 82 },
    { name: 'Midterm', avg: 75 },
    { name: 'Essay', avg: 88 },
    { name: 'Final', avg: 70 },
  ];

  const mockStudents = [
    { id: 1, name: "Ali Ahmed", id_num: "2021001", status: "Active", grade: "A" },
    { id: 2, name: "Sarah Mahmoud", id_num: "2021045", status: "Active", grade: "B+" },
    { id: 3, name: "Omar Youssef", id_num: "2021089", status: "At Risk", grade: "C-" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => navigate('/faculty/courses')}
          className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {course.code}
              </span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              {course.description || "Manage course materials, view student roster, and grade exams for this semester."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {activeTab === 'exams' && (
              <Button variant="primary" size="sm" onClick={() => setIsCreateExamModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['overview', 'students', 'exams', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                relative py-4 px-1 text-sm font-medium capitalize transition-colors
                ${activeTab === tab
                  ? 'text-primary dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}
              `}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-blue-400"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary dark:text-blue-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{course.studentCount}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
                    <FileTextIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Exams Created</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{exams.length}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg. Attendance</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">88%</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Class Performance History</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="avg" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Timeline</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-1"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">New grades published</p>
                        <p className="text-xs text-slate-500 mb-1">Midterm Examination</p>
                        <span className="text-xs text-slate-400">2 days ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
               <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                     type="text"
                     placeholder="Search student..."
                     className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                   />
                 </div>
                 <Button variant="outline" size="sm">Download Roster</Button>
               </div>
               <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                   <tr>
                     <th className="px-6 py-4">Student Name</th>
                     <th className="px-6 py-4">ID Number</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Current Grade</th>
                     <th className="px-6 py-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                   {mockStudents.map(student => (
                     <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                       <td className="px-6 py-4 text-slate-500 font-mono text-xs">{student.id_num}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                           student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                         }`}>
                           {student.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{student.grade}</td>
                       <td className="px-6 py-4 text-right">
                         <button className="text-slate-400 hover:text-primary"><MoreVertical className="h-4 w-4" /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}

          {activeTab === 'exams' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exam Management</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Create and manage exams with model answers for AI-powered grading.</p>
                  </div>
                  <Button variant="primary" onClick={() => setIsCreateExamModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </Button>
                </div>

                {examsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : exams.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <FileTextIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No exams yet</h3>
                    <p className="text-slate-500 mb-6">Create your first exam to start managing assessments and grading.</p>
                    <Button variant="primary" onClick={() => setIsCreateExamModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Exam
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {exams.map(exam => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <FileTextIcon className="h-6 w-6 text-slate-500 group-hover:text-primary dark:group-hover:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-slate-900 dark:text-white">{exam.title}</h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(exam.status)}`}>
                                {exam.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(exam.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileTextIcon className="h-3 w-3" />
                                {exam.totalMarks} Marks
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {exam.modelAnswerPdf ? 'Model Answer Set' : 'No Answer Key'}
                            </p>
                            <p className="text-xs text-slate-500">Ready for grading</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleOpenGradingLab(exam)}>
                            Grade with AI
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Course Settings</h3>
              <p className="text-slate-500">Archiving and deletion options will appear here.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals & Notifications */}
      {courseId && (
        <CreateExamModal
          isOpen={isCreateExamModalOpen}
          onClose={() => setIsCreateExamModalOpen(false)}
          courseId={courseId}
          showToast={showToast}
        />
      )}
      {isGradingLabModalOpen && selectedExamForGrading && (
        <GradingLabModal
          isOpen={isGradingLabModalOpen}
          onClose={() => setIsGradingLabModalOpen(false)}
          exam={selectedExamForGrading}
          courseId={courseId!}
          showToast={showToast}
        />
      )}

      <ToastNotification
        state={toast}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default CourseDetailView;
