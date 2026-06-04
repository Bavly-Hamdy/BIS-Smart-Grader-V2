import { db, auth } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Notification, Exam, StudentSubmission, Grade } from '../types';

/**
 * Fetch and construct real-time notifications based on the Firestore database state
 * Handles upcoming exams, pending grading queues, low performance warnings, and success logs.
 *
 * @param language User's active locale ('ar' | 'en') to localize title and message texts
 */
export const fetchNotifications = async (language: 'ar' | 'en' = 'en'): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const currentUser = auth.currentUser;
    const isAr = language === 'ar';

    if (!currentUser) return [];

    try {
        // 1. Fetch all exams registered under the current faculty member
        const examsRef = collection(db, 'exams');
        const examsQuery = query(examsRef, where('facultyId', '==', currentUser.uid));
        const examsSnapshot = await getDocs(examsQuery);
        
        const exams: Exam[] = [];
        const examIds: string[] = [];
        
        examsSnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() } as Exam;
            exams.push(data);
            examIds.push(doc.id);
        });

        // If the teacher has no exams yet, return default welcome and tips
        if (examIds.length === 0) {
            notifications.push({
                id: 'welcome-notification',
                title: isAr ? 'مرحباً بك في E-WIRRETN' : 'Welcome to E-WIRRETN',
                message: isAr
                    ? 'ابدأ بتسجيل مقرراتك الدراسية وإنشاء امتحاناتك لبدء استخدام منصة التقييم الذكية.'
                    : 'Get started by registering your academic courses and creating exams to begin using the smart evaluation platform.',
                type: 'info',
                timestamp: new Date().toISOString(),
                isRead: false,
                link: '/faculty-dashboard/courses'
            });
            return notifications;
        }

        // 2. Alert for Upcoming Exams (Scheduled or Ongoing within the next 7 days)
        exams.forEach((exam) => {
            if (exam.status === 'scheduled' || exam.status === 'ongoing') {
                const examDate = new Date(exam.examDate);
                const today = new Date();
                const diffTime = examDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Trigger alert if exam is scheduled in the next 7 days
                if (diffDays <= 7 && diffDays >= 0) {
                    const formattedDate = examDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    notifications.push({
                        id: `exam-upcoming-${exam.id}`,
                        title: isAr ? 'امتحان يقترب' : 'Upcoming Exam',
                        message: isAr 
                            ? `الامتحان "${exam.title}" لمقرر (${exam.courseCode}) مجدول في تاريخ ${formattedDate}.`
                            : `Your exam "${exam.title}" for course (${exam.courseCode}) is scheduled for ${formattedDate}.`,
                        type: 'alert',
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        link: `/faculty-dashboard/exams/${exam.id}`
                    });
                }
            }
        });

        // 3. Alert for Student Submissions Awaiting Grading (pending or processing)
        const submissionsRef = collection(db, 'submissions');
        const submissionsQuery = query(
            submissionsRef,
            where('uploadedBy', '==', currentUser.uid)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        let pendingCount = 0;
        submissionsSnapshot.forEach((doc) => {
            const sub = doc.data() as StudentSubmission;
            if (sub.status === 'pending' || sub.status === 'processing') {
                pendingCount++;
            }
        });

        if (pendingCount > 0) {
            notifications.push({
                id: 'submissions-pending',
                title: isAr ? 'أوراق إجابة بانتظار التصحيح' : 'Grading Required',
                message: isAr
                    ? `لديك عدد ${pendingCount} أوراق إجابة مرفوعة بانتظار التقييم والمراجعة بالذكاء الاصطناعي.`
                    : `You have ${pendingCount} student answer sheets uploaded awaiting review and AI grading.`,
                type: 'warning',
                timestamp: new Date().toISOString(),
                isRead: false,
                link: '/faculty-dashboard/exams'
            });
        }

        // 4. Low Performance Warnings (At-risk students scoring under 60%)
        const chunks = [];
        for (let i = 0; i < examIds.length; i += 10) {
            chunks.push(examIds.slice(i, i + 10));
        }

        const lowGrades: Grade[] = [];
        const successGrades: Grade[] = [];

        for (const chunk of chunks) {
            const gradesQuery = query(
                collection(db, 'grades'), 
                where('examId', 'in', chunk)
            );
            const gradesSnapshot = await getDocs(gradesQuery);
            gradesSnapshot.forEach((doc) => {
                const grade = doc.data() as Grade;
                if (grade.percentage < 60) {
                    lowGrades.push(grade);
                } else if (grade.percentage >= 85) {
                    successGrades.push(grade);
                }
            });
        }

        // Process failing grades (up to 3 latest alerts)
        lowGrades.sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());
        const latestLowGrades = lowGrades.slice(0, 3);
        latestLowGrades.forEach((grade) => {
            notifications.push({
                id: `low-perf-${grade.studentId}-${grade.examId}`,
                title: isAr ? 'تنبيه مستوى أكاديمي' : 'Low Performance Warning',
                message: isAr
                    ? `حصل الطالب "${grade.studentName}" على نسبة ${grade.percentage}% في امتحان "${grade.examTitle}" ويحتاج لمتابعة ودعم.`
                    : `Student "${grade.studentName}" scored ${grade.percentage}% in "${grade.examTitle}" and may need academic support.`,
                type: 'alert',
                timestamp: grade.gradedAt,
                isRead: false,
                link: `/faculty-dashboard/students`
            });
        });

        // 5. Success/Outstanding Grade Notifications (Students scoring >= 85%)
        successGrades.sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());
        const latestSuccessGrades = successGrades.slice(0, 2);
        latestSuccessGrades.forEach((grade) => {
            notifications.push({
                id: `success-graded-${grade.studentId}-${grade.examId}`,
                title: isAr ? 'أداء ممتاز' : 'Outstanding Performance',
                message: isAr
                    ? `حقق الطالب "${grade.studentName}" نتيجة ممتازة بنسبة ${grade.percentage}% في امتحان "${grade.examTitle}".`
                    : `Student "${grade.studentName}" achieved outstanding performance with ${grade.percentage}% in "${grade.examTitle}".`,
                type: 'success',
                timestamp: grade.gradedAt,
                isRead: false,
                link: `/faculty-dashboard/exams/${grade.examId}`
            });
        });

        // 6. Generic system tip of the day (translated)
        notifications.push({
            id: 'system-tip-general',
            title: isAr ? 'نصيحة تقييم' : 'Grading Tip',
            message: isAr
                ? 'هل تعلم؟ يمكنك اعتماد ورصد جميع درجات الطلاب دفعة واحدة من صفحة رصد الدرجات لتوفير الوقت.'
                : 'Did you know? You can bulk approve and publish grades from the Grade Sheet view to save time.',
            type: 'info',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            isRead: false
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
    }

    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
