
import React from 'react';
// @ts-ignore - fix for exported member error
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import ProfilePage from './components/Dashboard/ProfilePage';
import ExamManagement from './components/Dashboard/ExamManagement';
import ExamDetail from './components/Dashboard/ExamDetail';
import GradeSheet from './components/Dashboard/GradeSheet';
import CourseManagement from './components/Dashboard/CourseManagement';
import CourseDetail from './components/Dashboard/CourseDetail';
import StudentList from './components/Dashboard/StudentList';
import StudentDetail from './components/Dashboard/StudentDetail';
import SettingsPage from './components/Dashboard/SettingsPage';
import RequireAuth from './components/RequireAuth';

import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />

              {/* Protected Faculty Dashboard Routes */}
              <Route path="/faculty-dashboard" element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="exams" element={<ExamManagement />} />
                <Route path="exams/:examId" element={<ExamDetail />} />
                <Route path="exams/:examId/grades" element={<GradeSheet />} />

                {/* Course Management Routes */}
                <Route path="courses" element={<CourseManagement />} />
                <Route path="courses/:courseId" element={<CourseDetail />} />

                {/* Student Management Routes */}
                <Route path="students" element={<StudentList />} />
                <Route path="students/:studentId" element={<StudentDetail />} />

                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
