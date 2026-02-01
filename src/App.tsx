
import React from 'react';
// @ts-ignore - fix for exported member error
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import Students from './components/Dashboard/Students';
import MyCourses from './components/Dashboard/MyCourses';
import Settings from './components/Dashboard/Settings';
import CourseDetailView from './components/Dashboard/CourseDetailView';
import RequireAuth from './components/RequireAuth';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Protected Faculty Dashboard Routes */}
        <Route path="/faculty" element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardHome />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/:courseId" element={<CourseDetailView />} />
          <Route path="students" element={<Students />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback & Legacy Redirects */}
        <Route path="/faculty-dashboard/*" element={<Navigate to="/faculty" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
