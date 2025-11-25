
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  QueryDocumentSnapshot, 
  DocumentData,
  endBefore,
  limitToLast
} from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Mail,
  GraduationCap,
  Loader2
} from 'lucide-react';
import Button from '../../../components/Button';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  fullName: string;
  email: string;
  level: string;
  role: string;
}

const ITEMS_PER_PAGE = 10;

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageStartHistory, setPageStartHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);

  useEffect(() => {
    fetchStudents('initial');
  }, []);

  const fetchStudents = async (direction: 'initial' | 'next' | 'prev') => {
    setLoading(true);
    try {
      let q;
      const studentsRef = collection(db, 'students');

      if (direction === 'initial') {
        q = query(studentsRef, orderBy('fullName'), limit(ITEMS_PER_PAGE));
        setPage(1);
        setPageStartHistory([]);
      } else if (direction === 'next' && lastVisible) {
        q = query(studentsRef, orderBy('fullName'), startAfter(lastVisible), limit(ITEMS_PER_PAGE));
        setPage(p => p + 1);
      } else if (direction === 'prev' && pageStartHistory.length > 1) {
        q = query(studentsRef, orderBy('fullName'), endBefore(firstVisible), limitToLast(ITEMS_PER_PAGE));
        setPage(p => p - 1);
      } else {
        q = query(studentsRef, orderBy('fullName'), limit(ITEMS_PER_PAGE));
      }

      const querySnapshot = await getDocs(q);
      
      const fetchedStudents: Student[] = [];
      querySnapshot.forEach((doc) => {
        fetchedStudents.push({ id: doc.id, ...(doc.data() as any) } as Student);
      });

      setStudents(fetchedStudents);

      if (querySnapshot.docs.length > 0) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        if (direction === 'next' || direction === 'initial') {
            setPageStartHistory(prev => [...prev, querySnapshot.docs[0]]);
        } else if (direction === 'prev') {
            setPageStartHistory(prev => prev.slice(0, -1));
        }
        setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-primary dark:text-blue-400" />
            Student Directory
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and view enrolled students.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter current page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
          <Button variant="outline" size="sm">Export CSV</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary dark:text-blue-400" />
                    </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 flex items-center justify-center text-primary dark:text-blue-300 font-bold mr-3">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{student.fullName}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">Level {student.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-900 dark:text-white">{page}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchStudents('prev')}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchStudents('next')}
              disabled={!hasMore || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
