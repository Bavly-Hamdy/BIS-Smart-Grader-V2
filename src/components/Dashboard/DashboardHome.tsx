import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BookOpen, Users, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CourseCard, CreateCourseModal, Course } from './MyCourses';
import { db, auth } from '../../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

const DashboardHome: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stats Data
  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Students', value: 142, icon: Users, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
    { label: 'Papers Graded', value: 856, icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  // Mock Chart Data
  const barData = [
    { name: 'CS-101', avg: 85 },
    { name: 'BIS-202', avg: 72 },
    { name: 'IT-300', avg: 90 },
    { name: 'CS-400', avg: 65 },
  ];

  const pieData = [
    { name: 'Pass', value: 400 },
    { name: 'Fail', value: 50 },
  ];
  const COLORS = ['#0d9488', '#ef4444']; // Teal and Red

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'courses'),
      where('instructorId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const courseData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      // Client-side sort by createdAt descending
      courseData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setCourses(courseData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back, Doctor.</p>
        </div>
        <div className="hidden md:block text-sm text-slate-500">
          Last updated: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Average Grades per Course</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="avg" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Pass vs. Fail Ratio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CourseCard type="add" onClick={() => setIsModalOpen(true)} />
          
          {loading ? (
             // Skeletons
             [1, 2, 3].map(i => (
               <div key={i} className="h-[220px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse p-6">
                 <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                 <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
                 <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded mt-auto"></div>
               </div>
             ))
          ) : (
            courses.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                onClick={() => navigate(`/faculty/courses/${course.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        showToast={(msg, type) => {
          // Toast notification will be handled by modal internally or you can add toast state here
          console.log(`${type}: ${msg}`);
        }}
      />
    </div>
  );
};

export default DashboardHome;