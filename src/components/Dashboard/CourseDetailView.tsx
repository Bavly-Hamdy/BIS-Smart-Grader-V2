
import React, { useState, useEffect } from 'react';
// @ts-ignore - fix for exported member error
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
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
  Clock
} from 'lucide-react';
import Button from '../Button';
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

interface Course {
  id: string;
  title: string;
  code: string;
  studentCount: number;
  description?: string;
}

const CourseDetailView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exams' | 'settings'>('overview');

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
          navigate('/faculty-dashboard');
        }
      } catch (error) {
        console.error("Error getting course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

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

  const mockExams = [
    { id: 1, title: "Midterm Examination", date: "Oct 15, 2024", status: "Graded", papers: 45 },
    { id: 2, title: "Final Project", date: "Dec 20, 2024", status: "Pending", papers: 0 },
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
          onClick={() => navigate('/faculty-dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
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
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
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
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Exams Created</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
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
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Exam</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Upload answer keys and scanned papers to start grading.</p>
                  </div>
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                </div>

                <div className="grid gap-4">
                  {mockExams.map(exam => (
                    <div key={exam.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                          <FileText className="h-6 w-6 text-slate-500 group-hover:text-primary dark:group-hover:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{exam.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {exam.date}</span>
                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {exam.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{exam.papers}</p>
                          <p className="text-xs text-slate-500">Papers</p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default CourseDetailView;
