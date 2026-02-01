
import { db, auth } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Notification } from '../types';

export const fetchNotifications = async (): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const currentUser = auth.currentUser;

    if (!currentUser) return [];

    try {
        // 1. Check for upcoming exams (Real System Data)
        const examsRef = collection(db, 'exams');
        const q = query(
            examsRef,
            where('facultyId', '==', currentUser.uid),
            where('status', 'in', ['scheduled', 'ongoing'])
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const exam = doc.data();
            const examDate = new Date(exam.examDate);
            const today = new Date();
            const diffTime = Math.abs(examDate.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 3 && diffDays >= 0) {
                notifications.push({
                    id: `exam-${doc.id}`,
                    title: 'Upcoming Exam',
                    message: `Your exam "${exam.title}" is scheduled for ${new Date(exam.examDate).toLocaleDateString()}.`,
                    type: 'alert',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    link: '/faculty-dashboard/exams'
                });
            }
        });

        // 2. "Welcome Back" / Inactivity Notification (Simulated Logic)
        // In a real app, we'd check lastLogin in Firestore. 
        // For now, we'll simulate a "long time no see" if it's the first login of the session mock.
        const lastLogin = localStorage.getItem('lastLoginTimestamp');
        const now = new Date();

        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const daysSinceLogin = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24));

            if (daysSinceLogin > 7) {
                notifications.push({
                    id: 'welcome-back',
                    title: 'Welcome Back!',
                    message: `It's been ${daysSinceLogin} days since your last visit. Check your dashboard for updates.`,
                    type: 'info',
                    timestamp: new Date().toISOString(),
                    isRead: false
                });
            }
        }

        // Update local last login
        localStorage.setItem('lastLoginTimestamp', now.toISOString());

        // 3. System Tip (Mock "Real" Tip)
        notifications.push({
            id: 'system-tip-1',
            title: 'Grading Tip',
            message: 'Did you know? You can bulk approve grades from the Grade Sheet view to save time.',
            type: 'info',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            isRead: false
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
    }

    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
