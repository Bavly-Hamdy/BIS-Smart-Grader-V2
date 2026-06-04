import React, { ReactNode } from 'react';

export interface BaseProps {
  children?: ReactNode;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  delay?: number;
}

export interface FacultyProfile {
  uid: string;
  email: string;
  fullName: string;
  department: string;
  academicRank: 'أستاذ' | 'أستاذ مساعد' | 'مدرس' | 'مدرس مساعد' | 'معيد';
  specialization: string;
  role: 'faculty';
  courses: string[];
  createdAt: string;
  updatedAt: string;
  photoUrl?: string; // Profile picture URL
}

export interface Exam {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  title: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  examDate: string;
  duration: number; // minutes
  totalMarks: number;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'graded';
  modelAnswerId?: string;
  modelAnswerText?: string; // Text-based model answer
  modelAnswerPdfUrl?: string; // PDF-based model answer URL
  modelAnswerPdfName?: string; // PDF filename
  modelAnswerImageUrl?: string; // Image-based model answer URL
  modelAnswerImageName?: string; // Image filename
  isLocked: boolean;
  submissionsCount?: number;
  gradedCount?: number;
  isMultiPage?: boolean;
}

export interface ModelAnswer {
  id: string;
  examId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  isActive: boolean;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  imageUrl: string; // Firebase Storage URL
  imagePath: string; // Storage path for deletion
  uploadedAt: string;
  uploadedBy: string; // facultyId
  status: 'pending' | 'processing' | 'graded' | 'approved' | 'rejected';
  aiGrade?: number;
  finalGrade?: number;
  gradingResultId?: string;
}

export interface GradingResult {
  id: string;
  submissionId: string;
  examId: string;
  studentId: string;
  aiSuggestedGrade: number;
  aiConfidence: number; // 0-100
  aiAnalysis: string; // Detailed feedback from Gemini
  matchedPoints?: string[];
  missedPoints?: string[];
  manualGrade?: number;
  finalGrade: number;
  gradedBy: string; // facultyId
  gradedAt: string;
  isApproved: boolean;
  approvedAt?: string;
  comments?: string;
}

export interface GradingCriteria {
  examId: string;
  modelAnswerUrl: string;
  rubric: string; // Grading instructions for Gemini
  maxScore: number;
  partialCreditEnabled: boolean;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'draft' | 'approved' | 'published';
  gradedAt: string;
  approvedAt?: string;
  submissionId?: string;
  submissionIds?: string[]; // Multiple pages
  gradingResult?: {
    grade: number;
    confidence: number;
    analysis: string;
    matchedPoints: string[];
    missedPoints: string[];
    detectedStudentName?: string;
    detectedStudentId?: string;
    gradedBy: string;
  };
  studentImageUrl?: string; // To store image URL directly for easier access
}

export interface GradeSheet {
  examId: string;
  examTitle: string;
  courseCode: string;
  courseName: string;
  grades: Grade[];
  statistics: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    average: number;
    highest: number;
    lowest: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface CourseGradingScheme {
  final: number;
  midterm: number;
  classWork: number;
  quizzes: number;
  practical: number;
  project: number;
  total: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  creditHours: number;
  theoryHours?: number;
  practicalHours?: number;
  facultyId: string;
  semester: string;
  academicYear: string;
  gradingScheme: CourseGradingScheme;
  createdAt: string;
  updatedAt: string;
}

export interface BISCourse {
  code: string;
  nameAr: string;
  nameEn: string;
  theoryHours: number;
  practicalHours: number;
  creditHours: number;
  preRequisite?: string;
}

export interface DBActionResponse {
  success: boolean;
  error?: string;
}