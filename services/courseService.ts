import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { DBActionResponse, CourseGradingScheme } from '../types';

const DEFAULT_GRADING_SCHEME: CourseGradingScheme = {
  midterm: 20,
  final: 40,
  classWork: 10,
  quizzes: 10,
  practical: 0,
  project: 20,
  total: 100
};

/**
 * Assigns a curated BIS course to an authenticated faculty member's profile.
 * Stores a complete Course document structure to remain fully compatible with all dashboard views.
 */
export const assignCourseToFaculty = async (
  facultyId: string, 
  courseCode: string, 
  nameAr: string, 
  nameEn: string,
  creditHours: number,
  theoryHours: number,
  practicalHours: number
): Promise<DBActionResponse> => {
  try {
    const docId = `${courseCode}_${facultyId}`;
    const docRef = doc(db, 'courses', docId);
    
    await setDoc(docRef, {
      id: docId,
      code: courseCode,
      name: nameEn, // Default name fallback
      nameAr,
      nameEn,
      creditHours,
      theoryHours,
      practicalHours,
      facultyId,
      semester: 'Fall 2026',
      academicYear: '2025-2026',
      gradingScheme: DEFAULT_GRADING_SCHEME,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning course:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Removes an existing course assignment from a faculty member's profile.
 */
export const removeCourseFromFaculty = async (facultyId: string, courseCode: string): Promise<DBActionResponse> => {
  try {
    const docId = `${courseCode}_${facultyId}`;
    const docRef = doc(db, 'courses', docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing course:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Subscribes to real-time additions or subtractions within the user's assigned roster.
 */
export const subscribeToFacultyCourses = (
  facultyId: string,
  onUpdate: (assignedCourseIds: string[]) => void
) => {
  const coursesQuery = query(collection(db, 'courses'), where('facultyId', '==', facultyId));
  
  return onSnapshot(coursesQuery, (snapshot) => {
    // Map docs to their actual course code (e.g. 'ACC102') instead of document ID
    const assignedIds = snapshot.docs.map(doc => doc.data().code as string);
    onUpdate(assignedIds);
  }, (error) => {
    console.error('Real-time courses subscription broken:', error);
  });
};
