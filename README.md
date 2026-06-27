# E-Written: BIS Smart Grader V2

E-Written is an automated grading and academic analytics platform built specifically for the Business Information Systems (BIS) department at Assiut University. It bridges the gap between traditional paper exams and digital academic tracking by utilizing AI vision models to transcribe, grade, and analyze handwritten student scripts.

The platform handles the entire grading pipeline: scanning script sheets, uploading assets through optimized CDNs, extracting student metadata, evaluating answers against multi-modal grading keys using Gemini, and exporting official academic ledgers in Excel and PDF formats.

---

## 🛠️ Tech Stack & Key Integrations

* **Frontend Framework:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (for interface transitions).
* **Database & Auth:** Firebase (Authentication, Cloud Firestore real-time listeners).
* **AI Evaluation Engine:** Google Gemini 2.5 Flash (utilizing structured JSON schema outputs).
* **Asset Pipeline:** Cloudinary REST API (asynchronous image uploads with client-side progress tracking).
* **Document Generation:** `xlsx` (Excel grade sheets) and `jsPDF` / `jspdf-autotable` (examiner-signed report cards).

---

## 🏗️ System Architecture & Data Lifecycle

The application operates as a serverless Single Page Application (SPA). Instead of introducing local state synchronization libraries (like Redux or Zustand) which can drift from the server state, E-Written binds components directly to Firestore collections via real-time `onSnapshot` listeners. 

### The Journey of a Scanned Exam Sheet

```
[ Faculty Dashboard ] ──(Upload Image)──> [ Cloudinary API ]
                                                  │ (Optimize & Resize to 1024px)
                                                  ▼
[ Firestore DB ] <──(Save Record)── [ Gemini API Engine ]
        │                                 ▲ (OCR + Compare with Rubrics)
        │ (Realtime Sync)                 │
        ▼                                 │
[ Live UI Update ] ───────────────────────┘
```

1. **Ingestion & CDN Offloading:** An instructor uploads scanned exam sheets (images or PDFs). The `cloudinaryService` optimizes the image resolution (capping width at `1024px`) and stores the asset securely.
2. **AI Grading Payload:** The system constructs a multi-modal payload containing the optimized image URL, the model answer (text, PDF, or image key), the rubric configurations, and the exam's maximum score.
3. **Structured Inference:** Gemini 2.5 Flash processes the handwriting (supporting Arabic and English), extracts the student's name and ID from the paper header, grades the answers, and outputs a strict JSON payload matching our schema constraints.
4. **Atomic Database Commits:** The resulting grade sheet, parsed student metadata, and AI confidence records are committed in a batched write transaction to Firestore. The live socket listeners immediately update the instructor's dashboard.

---

## 📂 Repository Topology

Below is the directory layout of the repository, highlighting the restructured modals folder and core integration adapters:

```text
BIS-Smart-Grader-V2-main/
├── components/                 # UI Layouts & Presentational Views
│   ├── Dashboard/              # Faculty Dashboard Workspaces
│   │   ├── modals/             # Reorganized Modal Subfolders
│   │   │   ├── BulkUploadModal.tsx   # Asynchronous batch script uploader
│   │   │   ├── CreateExamModal.tsx   # Exam scheduler & key configuration
│   │   │   ├── EditCourseModal.tsx   # Grading scheme configurations
│   │   │   └── GradeDetailModal.tsx  # Detailed AI grading justification & overrides
│   │   ├── CourseCard.tsx
│   │   ├── CourseDetail.tsx          # Syllabus details & custom grading schemes
│   │   ├── CourseManagement.tsx      # Main courses dashboard list
│   │   ├── DashboardHome.tsx         # Analytical statistics overview (fixes memory leaks)
│   │   ├── DashboardLayout.tsx       # Dynamic drawer shell with RTL layout mirror
│   │   ├── ExamCard.tsx
│   │   ├── ExamDetail.tsx            # Submission list, status tracks, and grading triggers
│   │   ├── ExamManagement.tsx        # Exam schedules catalog
│   │   ├── GradeAnalytics.tsx        # Recharts interactive graphs (Score curves, Grade boundaries)
│   │   ├── GradeSheet.tsx            # Cell-level inline spreadsheet ledger
│   │   ├── ProfilePage.tsx           # Faculty profile settings
│   │   ├── SettingsPage.tsx          # System theme (Dark/Light) and language configuration
│   │   ├── StudentDetail.tsx         # Comprehensive student progress logs
│   │   └── StudentList.tsx           # Academic rosters
│   ├── AuthPage.tsx            # Session login & whitelisted registration
│   ├── LandingPage.tsx         # Public marketing home with interactive demo console
│   └── RequireAuth.tsx         # Client-side router authentication guard
├── context/                    # Shared Global State Providers
│   ├── LanguageContext.tsx     # Arabic (RTL) / English (LTR) localization mapping
│   ├── ThemeContext.tsx        # Dark / Light UI coordinator
│   └── ToastContext.tsx        # Custom non-blocking animation-driven notifications
├── firebase/                   # Firebase Config Setup
│   └── firebaseConfig.ts       # Firebase SDK v10 client initializer
├── services/                   # Business Logic & Core API Adapters
│   ├── cloudinaryService.ts    # CDN image/PDF upload handlers
│   ├── courseService.ts        # Course transactions
│   ├── exportService.ts        # Document exporters (XLSX, Custom PDF layouts)
│   ├── geminiGradingService.ts # Gemini model options, prompts, and schema enforcement
│   └── notificationService.ts  # Database notification alerts publisher
├── utils/                      # Static catalogs
│   └── bisCurriculum.ts        # Official Assiut University BIS syllabus dataset
├── types.ts                    # Global TypeScript interfaces
├── firestore.rules             # Granular database security rules
├── firebase.json               # Firebase CLI rules & hosting configurations
├── .firebaserc                 # Firebase CLI project association
└── vite.config.ts              # Vite asset bundler configuration
```

---

## 🔒 Security & Data Isolation Guardrails

To protect grading integrity and meet institutional data constraints, security policies are implemented at two levels:

### 1. Whitelisted Domain Access
Academic registration is locked at the authentication gateway. Faculty accounts must register using an authorized university domain suffix matching `*.edu.eg` or `*.aun.edu.eg`.

### 2. Multi-Tenant Firestore Rules
Database level access policies are declared in `firestore.rules` preventing unauthorized cross-tenant operations:
* **Courses, Exams, Submissions, Grades:** Can only be read, created, updated, or deleted if the authenticated user's UID matches the resource owner's `facultyId` attribute (`resource.data.facultyId == request.auth.uid`).
* **Faculty Profiles:** A user can only view or edit their own profile document (`request.auth.uid == facultyId`). Deletion is disabled.
* **Student Rosters:** Authenticated faculty members have read-only access. Direct write/delete actions are prohibited globally.

---

## 📝 Firestore Schema Specifications

The Firestore database layout is defined by the following TypeScript interfaces:

### 1. Faculty Profile (`/faculty/{uid}`)
```typescript
interface FacultyProfile {
  uid: string;              // Auth UID match
  email: string;            // Whitelisted university email
  fullName: string;         // Full academic name
  department: string;       // Department name
  academicRank: string;     // 'Professor', 'Associate Professor', etc.
  specialization: string;   // Specialized field of study
  role: 'faculty';          // Static security role
  courses: string[];        // Array of Course IDs
  photoUrl?: string;        // Profile picture URL
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

### 2. Courses (`/courses/{id}`)
```typescript
interface Course {
  id: string;
  code: string;             // e.g., 'BIS 203'
  name: string;
  nameAr?: string;          // Arabic title
  nameEn?: string;          // English title
  description?: string;
  creditHours: number;
  theoryHours?: number;
  practicalHours?: number;
  facultyId: string;        // Owner Reference
  semester: string;         // e.g., 'Fall 2026'
  academicYear: string;     // e.g., '2026/2027'
  gradingScheme: {          // Dynamic evaluation bounds
    final: number;          // Final weight
    midterm: number;        // Midterm weight
    classWork: number;
    quizzes: number;
    practical: number;
    project: number;
    total: number;          // Must equal 100
  };
  createdAt: string;
  updatedAt: string;
}
```

### 3. Exams (`/exams/{id}`)
```typescript
interface Exam {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  title: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  examDate: string;
  duration: number;         // In minutes
  totalMarks: number;       // Exam scale (e.g., 20)
  facultyId: string;
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'graded';
  modelAnswerText?: string;
  modelAnswerPdfUrl?: string;
  modelAnswerImageUrl?: string;
  isLocked: boolean;
  submissionsCount?: number;
  gradedCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### 4. Submissions (`/submissions/{id}`)
```typescript
interface StudentSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  imageUrl: string;         // Cloudinary asset link
  imagePath: string;        // Cloudinary reference key
  status: 'pending' | 'processing' | 'graded' | 'approved' | 'rejected';
  aiGrade?: number;         // Suggested AI score
  finalGrade?: number;      // Manual override score
  gradingResultId?: string; // Referenced Grade Document ID
  uploadedAt: string;
  uploadedBy: string;
}
```

---

## ⚡ The AI Prompt & Evaluation Blueprint

The core grading mechanism utilizes the `gemini-2.5-flash` model, configured with strict JSON schemas to extract structured grading data.

The system processes the following prompt schema:
```text
You are an expert academic grader for "{examTitle}".

**CRITICAL TASK - IDENTIFY STUDENT:**
Before grading, you MUST first identify the student from the top of the exam paper.
1. Student Name: Look for "Name", "اسم الطالب". Extract the full name written next to it.
2. Student ID: Look for "ID", "Code", "رقم القيد", "الكود". Extract the alphanumeric ID.

**Grading Task:**
1. Carefully read the handwritten student answer in the ATTACHED images (there may be multiple pages).
2. Compare it with the model answer provided.
3. Grade the answer based on the rubric, considering all provided pages as a single exam submission.
4. Provide detailed analysis.

Model Answer:
{modelAnswerText}

Grading Rubric:
{rubric}

Maximum Score: {maxScore}

Instructions:
- Read the student's handwriting carefully (it may be in Arabic or English)
- Award partial credit for partially correct answers
- Be fair and consistent
- Identify specific points the student got right and wrong
- If you find the Name or ID, include them in the response. If absolutely not found, return null.

Response Format (JSON only):
{
  "studentName": "<extracted name or null>",
  "studentId": "<extracted ID or null>",
  "grade": <number between 0 and maxScore>,
  "confidence": <number between 0 and 100 indicating your confidence>,
  "analysis": "<detailed explanation of grading decision>",
  "matchedPoints": ["<point 1 student got correct>", "<point 2>", ...],
  "missedPoints": ["<point 1 student missed>", "<point 2>", ...]
}
```

---

## 🛠️ Local Development & Quickstart

To run the application locally on your machine, follow these steps:

### Prerequisites
* **Node.js** v18.0.0 or higher
* A Firebase Project (with Firestore and Authentication enabled)
* A Cloudinary Account (with an unsigned upload preset configured)
* A Google AI Studio Gemini API Key

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Bavly-Hamdy/BIS-Smart-Grader-V2.git
cd BIS-Smart-Grader-V2
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
# Gemini API Key (Generate from Google AI Studio)
VITE_GEMINI_API_KEY="your_gemini_api_key"

# Firebase Client SDK Credentials
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://your_project_id-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# Cloudinary CDN Configuration
VITE_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
VITE_CLOUDINARY_UPLOAD_PRESET="your_unsigned_upload_preset"
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

<sub>© 2026 Assiut University - BIS Department. All Rights Reserved. Fully localized supporting Arabic (RTL) & English (LTR).</sub>
