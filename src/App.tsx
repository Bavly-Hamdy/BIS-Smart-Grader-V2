import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

// Components Imports
import LandingPage from '../components/LandingPage';
import AuthPage from '../components/AuthPage';
import Button from '../components/Button';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import Students from './components/Dashboard/Students';
import MyCourses from './components/Dashboard/MyCourses';
import Settings from './components/Dashboard/Settings';
import CourseDetailView from './components/Dashboard/CourseDetailView';
import RequireAuth from '../components/RequireAuth';

// Placeholder for Student Portal (To be developed in Phase 5)
const StudentPortal = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 text-center border border-slate-100 dark:border-slate-800">
      <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <GraduationCap className="h-8 w-8 text-secondary dark:text-teal-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Student Portal</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Welcome, Student. Your exam results and feedback will be displayed here.
      </p>
      <div className="space-y-3">
        <Link to="/" className="block">
          <Button variant="outline" className="w-full justify-center">Return to Home</Button>
        </Link>
        <Link to="/login" className="block">
          <span className="text-sm text-slate-500 hover:text-primary cursor-pointer">Log Out</span>
        </Link>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Protected Faculty Dashboard Routes */}
        <Route path="/faculty" element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }>
          {/* Redirect /faculty to /faculty/overview */}
          <Route index element={<Navigate to="overview" replace />} />
          
          <Route path="overview" element={<DashboardHome />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/:courseId" element={<CourseDetailView />} />
          <Route path="students" element={<Students />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student-portal" element={<StudentPortal />} />
        
        {/* Fallback Routes (Redirect legacy paths to new structure) */}
        <Route path="/faculty-dashboard" element={<Navigate to="/faculty" replace />} />
        <Route path="/faculty-dashboard/*" element={<Navigate to="/faculty" replace />} />
        
        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;