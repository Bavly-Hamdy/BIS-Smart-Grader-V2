// Mock data utilities for testing dashboard features
// This can be replaced with real Firestore data later

export interface GradeData {
    id: string;
    courseId: string;
    courseName: string;
    studentId: string;
    studentName: string;
    score: number; // 0-100
    gradedAt: Date;
    gradedBy: 'ai' | 'manual';
}

export interface ExamPaper {
    id: string;
    courseId: string;
    courseName: string;
    studentId: string;
    studentName: string;
    status: 'pending' | 'auto-graded' | 'manual-review' | 'finalized';
    aiConfidence: number; // 0-100
    uploadedAt: Date;
}

export interface Exam {
    id: string;
    courseId: string;
    courseName: string;
    examName: string;
    examDate: Date;
    totalStudents: number;
    gradedPapers: number;
}

// Generate random grade following normal distribution (mean=75, std=12)
function generateNormalGrade(mean: number = 75, stdDev: number = 12): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const grade = mean + z0 * stdDev;
    return Math.max(0, Math.min(100, Math.round(grade)));
}

// Generate mock grades for courses
export function generateMockGrades(courseId: string, courseName: string, count: number = 30): GradeData[] {
    const grades: GradeData[] = [];

    for (let i = 0; i < count; i++) {
        grades.push({
            id: `grade-${courseId}-${i}`,
            courseId,
            courseName,
            studentId: `student-${i}`,
            studentName: `Student ${i + 1}`,
            score: generateNormalGrade(),
            gradedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
            gradedBy: Math.random() > 0.8 ? 'manual' : 'ai'
        });
    }

    return grades;
}

// Generate mock exam papers
export function generateMockExamPapers(courses: { id: string; title: string }[]): ExamPaper[] {
    const papers: ExamPaper[] = [];
    const statuses: ExamPaper['status'][] = ['pending', 'auto-graded', 'manual-review', 'finalized'];

    courses.forEach(course => {
        const paperCount = Math.floor(Math.random() * 10) + 5; // 5-15 papers per course

        for (let i = 0; i < paperCount; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            papers.push({
                id: `paper-${course.id}-${i}`,
                courseId: course.id,
                courseName: course.title,
                studentId: `student-${i}`,
                studentName: `Student ${i + 1}`,
                status,
                aiConfidence: status === 'pending' ? 0 : Math.floor(Math.random() * 40) + 60,
                uploadedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) // Last 3 days
            });
        }
    });

    return papers;
}

// Generate mock upcoming exams
export function generateMockExams(courses: { id: string; title: string }[]): Exam[] {
    const exams: Exam[] = [];

    courses.forEach((course, index) => {
        // Some courses have upcoming exams
        if (Math.random() > 0.3) {
            const daysAhead = Math.floor(Math.random() * 14) + 1; // 1-14 days
            exams.push({
                id: `exam-${course.id}`,
                courseId: course.id,
                courseName: course.title,
                examName: `Midterm Exam`,
                examDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
                totalStudents: Math.floor(Math.random() * 50) + 20,
                gradedPapers: 0
            });
        }
    });

    return exams;
}

// Calculate grade distribution for bell curve
export function calculateGradeDistribution(grades: GradeData[]): { range: string; count: number; percentage: number }[] {
    const ranges = [
        { min: 0, max: 59, label: 'F (0-59)' },
        { min: 60, max: 69, label: 'D (60-69)' },
        { min: 70, max: 79, label: 'C (70-79)' },
        { min: 80, max: 89, label: 'B (80-89)' },
        { min: 90, max: 100, label: 'A (90-100)' }
    ];

    const distribution = ranges.map(range => {
        const count = grades.filter(g => g.score >= range.min && g.score <= range.max).length;
        return {
            range: range.label,
            count,
            percentage: grades.length > 0 ? Math.round((count / grades.length) * 100) : 0
        };
    });

    return distribution;
}

// Calculate pass/fail statistics
export function calculatePassFailStats(grades: GradeData[], passThreshold: number = 60): {
    pass: number;
    fail: number;
    passRate: number;
    failRate: number;
} {
    const pass = grades.filter(g => g.score >= passThreshold).length;
    const fail = grades.filter(g => g.score < passThreshold).length;
    const total = grades.length;

    return {
        pass,
        fail,
        passRate: total > 0 ? Math.round((pass / total) * 100) : 0,
        failRate: total > 0 ? Math.round((fail / total) * 100) : 0
    };
}

// Calculate average grade
export function calculateAverageGrade(grades: GradeData[]): number {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.score, 0);
    return Math.round(sum / grades.length);
}

// Generate histogram data for bell curve (0-100 in intervals of 5)
export function generateBellCurveData(grades: GradeData[]): { score: number; count: number }[] {
    const intervals = 20; // 0-100 in steps of 5
    const data: { score: number; count: number }[] = [];

    for (let i = 0; i <= intervals; i++) {
        const min = i * 5;
        const max = min + 5;
        const count = grades.filter(g => g.score >= min && g.score < max).length;
        data.push({
            score: min,
            count
        });
    }

    return data;
}
