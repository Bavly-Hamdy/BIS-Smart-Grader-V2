# 🚀 BIS Smart Grader V2

An enterprise-grade, AI-driven automated grading & assessment SaaS platform tailored for Business Information Systems (BIS) curriculums. The platform automates student answer sheet ingestion, extracts metadata, evaluates handwriting against multi-modal model answers, and aggregates visual academic analytics.

---

## 1. Platform Vision & Exhaustive Features

### Deep-Dive Introduction
The Business Information Systems (BIS) department at modern universities operates at the intersection of business intelligence, systems engineering, and management science. Managing courses within this curriculum requires a complex balance of quantitative testing (programming, database management, systems analysis) and qualitative analysis (business strategies, management theories, information systems auditing).

Traditionally, grading hundreds of student scripts during midterm and final examination cycles introduces significant challenges:
1.  **Administrative Bottlenecks**: Instructors manually parse, sort, and record scores for hundreds of physical sheets, delaying grade submission cycles.
2.  **Grading Inconsistencies**: Evaluation criteria can fluctuate due to fatigue, leading to discrepancies across large student batches.
3.  **Absence of Analytics**: Physical papers offer no data aggregation. Faculty members lack real-time visibility into performance curves, failure distributions, or concept mastery metrics, preventing immediate curriculum adjustments.

**BIS Smart Grader V2** addresses these inefficiencies by combining state-of-the-art vision-based generative AI with a serverless, real-time SaaS platform. The system ingests scanned physical scripts, performs metadata extraction, grades handwriting against multi-modal references, and yields instant visual reports.

---

## 2. Exhaustive Feature Explanations

### 1. Interactive Glassmorphic Landing Page
*   **Engineering Objective**: High-conversion landing page designed to present the platform's features, capabilities, and system capabilities to new users.
*   **Core Interfaces**: `components/LandingPage.tsx`, `components/Navbar.tsx`, `components/Hero.tsx`, `components/DemoSection.tsx`, `components/NewsCard.tsx`.
*   **Key Capabilities**:
    *   *Fluid Responsive Design*: Built with glassmorphism visual styling, harmonic gradients, and responsive Bento Grid structures.
    *   *Interactive Demo Sandbox*: Allows visitors to view simulated inputs (student exam scans, model keys) and immediately see the generated OCR extraction and grading feedback.
    *   *Unified Header/Footer Hooks*: Smooth scrolling navigation links, system status indicators, dynamic navigation wrappers, and scroll-to-top micro-interactions.

### 2. University-Scoped Session Gateways
*   **Engineering Objective**: Encrypted, multi-tenant portal restricting registration to valid institutional members while protecting dashboard access.
*   **Core Interfaces**: `components/AuthPage.tsx`, `components/RequireAuth.tsx`.
*   **Key Capabilities**:
    *   *Domain Filtering Checks*: Enforces strict email verification constraints at the signup screen, restricting accounts to authorized educational emails (`*.edu.eg` or `*.aun.edu.eg`).
    *   *Session Persistence*: Leverages Firebase Authentication state observers to persist authenticated states across client-side refreshes.
    *   *Access Control Guard*: The `RequireAuth` component wraps private routes, validating active session tokens and redirecting unauthorized traffic to login.

### 3. Multi-Tenant Navigation Drawer Shell
*   **Engineering Objective**: Responsive side navigation frame coordinating layout preferences (theme, language) and serving real-time alerts.
*   **Core Interfaces**: `components/Dashboard/DashboardLayout.tsx`, `services/notificationService.ts`.
*   **Key Capabilities**:
    *   *RTL/LTR Translation Dictionary*: Synchronizes layout shifts with language preferences. Sidebars, grids, icons, and menus dynamically mirror structure when shifting Arabic/English locale states.
    *   *Realtime Alerts Counter*: Connects to Firestore notifications listener, displaying dynamic unread count badges over notifications icons.
    *   *Responsive Toggle Triggers*: Adapts layouts dynamically across mobile devices, tablets, and desktop dimensions.

### 4. Analytic Metrics Dashboard (Overview)
*   **Engineering Objective**: Consolidated visual control center presenting aggregated metrics, grade trends, and action logs.
*   **Core Interfaces**: `components/Dashboard/DashboardHome.tsx`, `components/Dashboard/ActionItemsPanel.tsx`, `components/Dashboard/GradeAnalytics.tsx`.
*   **Key Capabilities**:
    *   *KPI Counters Matrix*: Tracks overall registered courses counts, active student profiles, average graded scores, and assessment totals.
    *   *Dynamic Analytics Graphs*: Renders interactive SVG visual reports utilizing Recharts:
        *   `Performance Trend Curve`: Area graph rendering class average grade shifts across consecutive exam cycles.
        *   `Grade Distribution Chart`: Bar/Pie diagrams grouping student scores into standard academic grade bounds (A, B, C, D, F).
    *   *Action Warnings Feed*: Aggregates prioritized warnings, alert prompts, and system actions:
        *   Exams missing model answers.
        *   Ungraded submission queues.
        *   At-risk students profiling (scores dropping under 60%).

### 5. Curriculum & Grading Schemes Manager (My Courses)
*   **Engineering Objective**: Course registry module coordinating credit hour allocations and customizing grading distributions.
*   **Core Interfaces**: `components/Dashboard/CourseManagement.tsx`, `components/Dashboard/AddCourseModal.tsx`, `components/Dashboard/EditCourseModal.tsx`, `components/Dashboard/CourseDetail.tsx`, `components/Dashboard/CourseCard.tsx`.
*   **Key Capabilities**:
    *   *Dynamic Grading Schemes Editor*: Instructors can customize grade weights (Midterm %, Final %, Classwork %, Practical Labs %, Project %) totaling 100%. Ensures all assignments obey these schemas during grade compilation.
    *   *BIS Dynamic Syllabus Catalog*: Search-friendly autocompletion tool utilizing `utils/bisCurriculum.ts`, synchronizing metadata inputs with official Assiut University BIS Curriculum criteria (Course Code, Arabic Title, English Title, Weekly Lecture/Lab distribution).
    *   *Performance Roster*: Lists enrolled student profiles alongside course-specific averages and grade statistics.

### 6. Assessment & Model Answer Hub (Exams Manager)
*   **Engineering Objective**: Module for managing exam specifications, scheduling, and model answers.
*   **Core Interfaces**: `components/Dashboard/ExamManagement.tsx`, `components/Dashboard/CreateExamModal.tsx`, `components/Dashboard/ExamDetail.tsx`, `components/Dashboard/ExamCard.tsx`.
*   **Key Capabilities**:
    *   *Scheduling Controls*: Manages scheduling dates, durations, and locking options.
    *   *Multimodal Model Answer Ingestion*: Instructors can configure model answers as Markdown texts, scanned reference images, or PDF keys.
    *   *Ingestion Monitoring Panel*: Displays lists of uploaded student scripts, processing states (`pending`, `processing`, `graded`), confidence logs, and final scores.

### 7. Scanned Script Ingestion & AI Evaluator
*   **Engineering Objective**: Automation engine processing student hand-written papers, extracting details, and grading them against rubrics.
*   **Core Interfaces**: `components/Dashboard/BulkUploadModal.tsx`, `services/geminiService.ts`, `services/cloudinaryService.ts`, `components/Dashboard/GradeDetailModal.tsx`.
*   **Key Capabilities**:
    *   *Cloudinary Asset Pipeline*: Processes scanned student papers, resizes image sizes (max width of `1024px`), and uploads them to the CDN.
    *   *Gemini Vision Ingestion*: Decouples grading request payloads to invoke the `gemini-2.5-flash` model under strict JSON schema options.
    *   *Grading Breakdown View*: Interactive overlay showing marked correct points, missed key concepts, AI confidence, and handwriting OCR validation checks.

### 8. Interactive Grade Ledger Spreadsheet
*   **Engineering Objective**: Spreadsheet interface displaying student grades and supporting manual score edits.
*   **Core Interfaces**: `components/Dashboard/GradeSheet.tsx`, `components/Dashboard/StudentList.tsx`, `components/Dashboard/StudentDetail.tsx`.
*   **Key Capabilities**:
    *   *Real-time Grade Adjustment Ledger*: Cell-level modifications are saved directly to Firestore, recalculating class averages and standard distributions on the fly.
    *   *Roster Search Filters*: Autocomplete filtering inputs by Student ID, Student Name, Course, or Grade boundaries.

### 9. Multi-Format Academic Document Exporters
*   **Engineering Objective**: Reporting tools compiling grading results to spreadsheet and PDF document formats.
*   **Core Interfaces**: `services/exportService.ts`.
*   **Key Capabilities**:
    *   *Analytical Excel Workbook*: Generates structured sheets containing student name lists, seat numbers, raw scores, letter boundaries, and class performance averages.
    *   *Official PDF Report Sheet*: Outputs printable PDF report sheets with school letterheads, course summaries, average marks, and grade curves.

---

## 3. Complete Technical Architecture & Data Flow

### The Lifecycle of a Submission
The platform orchestrates image transformations, AI grading requests, and database transactions in a sequential data lifecycle:

```text
                                  ┌──────────────────────────┐
                                  │   Faculty Dashboard UI   │
                                  └─────────────┬────────────┘
                                                │
                                                │ (1) Ingest scanned paper image
                                                ▼
                                  ┌──────────────────────────┐
                                  │   Cloudinary Service     │
                                  └─────────────┬────────────┘
                                                │
                                                │ (2) Store, optimize & crop
                                                ▼
                                  ┌──────────────────────────┐
                                  │    Secure CDN URL        │
                                  └─────────────┬────────────┘
                                                │
                                                │ (3) Invoke grading controller with model & rubrics
                                                ▼
                                  ┌──────────────────────────┐
                                  │  Gemini Service (AI Core)│
                                  └─────────────┬────────────┘
                                                │
                                                │ (4) OCR extraction + comparison via gemini-2.5-flash
                                                ▼
                                  ┌──────────────────────────┐
                                  │  JSON Payload Validation │
                                  └─────────────┬────────────┘
                                                │
                                                │ (5) Structural validation / Error fallback rules
                                                ▼
                                  ┌──────────────────────────┐
                                  │  Firestore Batched Write │
                                  └─────────────┬────────────┘
                                                │
                                                │ (6) Save grades, update status & send notifications
                                                ▼
                                  ┌──────────────────────────┐
                                  │   Cloud Firestore DB     │
                                  └─────────────┬────────────┘
                                                │
                                                │ (7) Real-time socket notification update (onSnapshot)
                                                ▼
                                  ┌──────────────────────────┐
                                  │   Real-Time UI Refresh   │
                                  └──────────────────────────┘
```

### Detailed Lifecycle Steps
1.  **Ingestion**: The instructor uploads a single sheet or batch upload zip of scanned student exam papers via the `BulkUploadModal` or `ExamDetail` components.
2.  **Asset Offloading**: The `cloudinaryService` receives the image files, uploads them to the Cloudinary CDN, and applies resizing logic to maintain a maximum width of `1024px` for optimal processing speed.
3.  **AI Engine Invocation**: The `geminiService` is triggered, receiving the Cloudinary student image URL, the model answer data (text, PDF URL, or image URL), the maximum score, and the grading rubrics.
4.  **Generative Assessment**: The Gemini model parses handwriting and compares it to the model answer, outputting structured grading results.
5.  **Payload Validation**: The service parses the JSON response, enforces bounds constraints (constraining grades between `0` and the exam's maximum score, and confidence scores between `0.0` and `1.0`), and implements fallback routines if parsing fails.
6.  **Database Synchronization**: Grading records, student profiles, updated exam submission counts, and user notifications are committed in a batched write transaction to Firestore.
7.  **Sub-second UI Rendering**: Direct WebSocket connections established via Firestore's `onSnapshot` listener distribute updates instantly across active client views.

### State Orchestration Architecture
The application layout relies on three core global contexts operating in tandem to handle visual styling, language mapping, and temporary alert states:

*   **`ThemeContext`**: Manages light, dark, and system-level visual states. It attaches classes to the document root element, enabling Tailwind's `dark:` utility styles.
*   **`LanguageContext`**: Manages localized translations and controls document direction. Changing the language updates the document root structure:
    *   *Arabic*: Sets `dir="rtl"` and `lang="ar"` on the `html` element.
    *   *English*: Sets `dir="ltr"` and `lang="en"` on the `html` element.
*   **`ToastContext`**: Provides non-blocking notifications, presenting visual feedback banners for database modifications, upload failures, and API status alerts.

#### Realtime Firestore Synchronization (`onSnapshot`)
Rather than relying on heavy client-side state managers like Redux or Zustand, which can lead to local state mismatch, overhead, and state drift from backend resources, BIS Smart Grader V2 leverages Firestore's native `onSnapshot` real-time listeners.

This choice provides several architecture advantages:
1.  **Immediate UI Updates**: Any update in the database (e.g., progress on batch grading) triggers immediate UI refreshes without polling.
2.  **Local Offline Cache**: Out-of-the-box support for offline read and write queues, ensuring the UI remains responsive during network drops.
3.  **Simplified Component Design**: Eliminates boilerplate state-synchronization code. Components directly bind to database collections, ensuring consistent rendering across concurrent browser tabs.

---

## 4. Exhaustive Database Schema Documentation

The system architecture utilizes Cloud Firestore as its primary data store, with the database schemas documented below:

### `faculty` Collection
Each document stores the profile data of an authenticated academic instructor.
*   *Document ID*: User's Firebase Auth UID (`request.auth.uid`).
*   *Schema*:
    ```typescript
    interface FacultyProfile {
      uid: string;              // Unique Identifier (Auth UID)
      email: string;            // University email address (*.edu.eg domain)
      fullName: string;         // Instructor's full name
      department: string;       // Assigned academic department
      academicRank: string;     // Academic rank ('Professor', 'Associate Professor', etc.)
      specialization: string;   // Research/teaching specialization field
      role: 'faculty';          // Static role indicator
      courses: string[];        // Array of referenced Course IDs
      photoUrl?: string;        // Optional profile image CDN link
      createdAt: string;        // ISO-8601 creation timestamp
      updatedAt: string;        // ISO-8601 update timestamp
    }
    ```

### `courses` Collection
Stores metadata for registered academic courses.
*   *Document ID*: Auto-generated UUID.
*   *Schema*:
    ```typescript
    interface Course {
      id: string;               // Unique Course ID
      code: string;             // Official course code (e.g., 'BIS 101')
      name: string;             // Course name (English fallback)
      nameAr?: string;          // Optional Arabic course title
      nameEn?: string;          // Optional English course title
      description?: string;     // Short syllabus description
      creditHours: number;      // Academic credit hours weight
      theoryHours?: number;     // Assigned weekly theory lecture hours
      practicalHours?: number;  // Assigned weekly lab practical hours
      facultyId: string;        // Owner Reference -> faculty.uid
      semester: string;         // Academic semester (e.g., 'Fall 2026')
      academicYear: string;     // Academic calendar year (e.g., '2026/2027')
      gradingScheme: {          // Course grading scheme breakdown
        final: number;          // Final exam mark weight
        midterm: number;        // Midterm exam mark weight
        classWork: number;      // Class activities weight
        quizzes: number;        // Quizzes total weight
        practical: number;      // Lab practical weight
        project: number;        // Project marks weight
        total: number;          // Total course marks weight (usually 100)
      };
      createdAt: string;        // ISO-8601 creation timestamp
      updatedAt: string;        // ISO-8601 update timestamp
    }
    ```

### `exams` Collection
Contains specifications and model answers for scheduled assessments.
*   *Document ID*: Auto-generated UUID.
*   *Schema*:
    ```typescript
    interface Exam {
      id: string;               // Unique Exam ID
      courseId: string;         // Parent Course Reference -> courses.id
      courseName: string;       // Cached course name
      courseCode: string;       // Cached course code
      title: string;            // Exam title (e.g., 'Midterm Exam')
      examType: 'midterm' | 'final' | 'quiz' | 'assignment';
      examDate: string;         // Scheduled date & time (ISO format)
      duration: number;         // Exam duration limit (in minutes)
      totalMarks: number;       // Maximum possible exam score
      facultyId: string;        // Owner Reference -> faculty.uid
      status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'graded';
      modelAnswerText?: string; // Markdown text-based model answer
      modelAnswerPdfUrl?: string; // Cloudinary PDF model answer asset link
      modelAnswerPdfName?: string; // PDF model answer filename
      modelAnswerImageUrl?: string; // Cloudinary Image model answer asset link
      modelAnswerImageName?: string; // Image model answer filename
      isLocked: boolean;        // Lock status to prevent grading schema changes
      submissionsCount?: number; // Total ingested student submissions count
      gradedCount?: number;     // Total graded student submissions count
      isMultiPage?: boolean;    // Dynamic multi-page scanning indicator
      createdAt: string;        // ISO-8601 creation timestamp
      updatedAt: string;        // ISO-8601 update timestamp
    }
    ```

### `submissions` Collection
Represents individual scanned student sheets awaiting AI assessment.
*   *Document ID*: Auto-generated UUID.
*   *Schema*:
    ```typescript
    interface StudentSubmission {
      id: string;               // Unique Submission ID
      examId: string;           // Parent Exam Reference -> exams.id
      studentId: string;        // Student Identification number
      studentName: string;      // Student full name
      imageUrl: string;         // Cloudinary script image asset link
      imagePath: string;        // Cloudinary reference public ID
      status: 'pending' | 'processing' | 'graded' | 'approved' | 'rejected';
      aiGrade?: number;         // Score suggested by Gemini
      finalGrade?: number;      // Confirmed/adjusted manual grade
      gradingResultId?: string; // Referenced Grading result -> grades.id
      uploadedAt: string;       // ISO-8601 upload timestamp
      uploadedBy: string;       // Ingesting Faculty Reference -> faculty.uid
    }
    ```

### `grades` Collection
Aggregated grading record containing detailed feedback log and performance outputs.
*   *Document ID*: Auto-generated UUID (corresponds to `submissions.gradingResultId`).
*   *Schema*:
    ```typescript
    interface Grade {
      id: string;               // Unique Grade ID
      studentId: string;        // Student Identification code
      studentName: string;      // Student full name
      examId: string;           // Parent Exam Reference -> exams.id
      examTitle: string;        // Cached exam title
      courseId: string;         // Grandparent Course Reference -> courses.id
      courseName: string;       // Cached course name
      courseCode: string;       // Cached course code
      score: number;            // Final awarded grade score
      maxScore: number;         // Exam maximum possible score
      percentage: number;       // Percent grade (score / maxScore * 100)
      letterGrade: 'A' | 'B' | 'C' | 'D' | 'F'; // letter grade boundary
      status: 'draft' | 'approved' | 'published';
      submissionId?: string;    // Reference to source submission -> submissions.id
      submissionIds?: string[]; // Referenced submission ids for multi-page answers
      studentImageUrl?: string; // Cloudinary student script visual link
      gradedAt: string;         // ISO-8601 grading completed timestamp
      approvedAt?: string;      // ISO-8601 approval timestamp
      gradingResult?: {         // Structured feedback logs
        grade: number;          // AI generated grading score
        confidence: number;     // AI evaluation confidence index (0-100)
        analysis: string;       // Comprehensive grading justification summary
        matchedPoints: string[]; // Correct answers matches found
        missedPoints: string[];  // Missed rubric conditions list
        detectedStudentName?: string; // Student name read from script header
        detectedStudentId?: string;   // Student ID read from script header
        gradedBy: string;       // Grading Faculty Reference -> faculty.uid
      };
    }
    ```

---

## 5. The Gemini AI Prompt Engineering Layer (The Core Engine)

The core grading mechanism utilizes the `gemini-2.5-flash` model, configured with strict JSON schemas to prevent model hallucinations and extract structured grading data.

### System Instructions & Core Prompt
The Gemini API is invoked with multi-modal content parts (student script images, model answer files, grading rubrics) alongside the following system instruction prompt:

```text
You are an expert academic grader for "{examTitle}".

**CRITICAL TASK - IDENTIFY STUDENT:**
Before grading, you MUST first identify the student from the top of the exam paper.
1. **Student Name**: Look for "Name", "Student Name", "الاسم", "اسم الطالب". Extract the full name written next to it.
2. **Student ID**: Look for "ID", "Student ID", "Code", "الرقم الجامعي", "رقم القيد", "الكود". Extract the numeric/alphanumeric ID.
3. If the handwriting is messy, try your best to interpret it.

**Grading Task:**
1. Carefully read the handwritten student answer in the ATTACHED images (there may be multiple pages).
2. Compare it with the model answer provided.
3. Grade the answer based on the rubric, considering all provided pages as a single exam submission.
4. Provide detailed analysis.

**Model Answer:**
{modelAnswerText}

**Grading Rubric:**
{rubric}

**Maximum Score:** {maxScore}

**Instructions:**
- Read the student's handwriting carefully (it may be in Arabic or English)
- Award partial credit for partially correct answers
- Be fair and consistent
- Identify specific points the student got right and wrong
- If you find the Name or ID, include them in the response. If absolutely not found, return null.

**Response Format (JSON only):**
{
  "studentName": "<extracted name or null>",
  "studentId": "<extracted ID or null>",
  "grade": <number between 0 and maxScore>,
  "confidence": <number between 0 and 100 indicating your confidence>,
  "analysis": "<detailed explanation of grading decision>",
  "matchedPoints": ["<point 1 student got correct>", "<point 2>", ...],
  "missedPoints": ["<point 1 student missed>", "<point 2>", ...]
}

Respond ONLY with valid JSON, no additional text.
```

### JSON Schema Enforcement
The request is initialized with `generationConfig: { responseMimeType: "application/json" }`, forcing the model to restrict its output stream to a valid JSON format. This avoids markdown wrappers (e.g., ` ```json `) and guarantees parsability.

#### Mock Structured JSON Output (Enforced Schema)
The following structured payload shows an expected response from the Gemini API:

```json
{
  "studentName": "Bavly Hamdy",
  "studentId": "221165973",
  "grade": 13.5,
  "confidence": 95,
  "analysis": "The student has demonstrated a strong understanding of system software concepts, correctly defining operating systems and utility drivers. However, they partially missed the explanation of dynamic memory management, referring only to physical storage limitations rather than cache swapping policies.",
  "matchedPoints": [
    "Correctly defined operating systems and gave Windows as an example",
    "Properly distinguished system software from application software"
  ],
  "missedPoints": [
    "Failed to explain the role of virtual memory in dynamic scheduling allocations"
  ]
}
```

---

## 6. Full Repository Directory Topology

Below is the complete repository file structure of **BIS Smart Grader V2**, detailing every major module, service, and layout component in the system:

```text
BIS-Smart-Grader-V2-main/
├── components/                 # View Components Layer
│   ├── Dashboard/              # Authenticated Faculty Workspaces
│   │   ├── ActionItemsPanel.tsx     # Rapid warning cues and task notifications
│   │   ├── AddCourseModal.tsx       # Interactive course enrollment modal
│   │   ├── BulkUploadModal.tsx      # Multi-student script file batch loader
│   │   ├── CourseCard.tsx           # Course index grid visual container
│   │   ├── CourseDetail.tsx         # Detailed single course syllabus dashboard
│   │   ├── CourseManagement.tsx     # Course schemes editor (Logical: MyCourses.tsx)
│   │   ├── CreateExamModal.tsx      # Exam registration modal
│   │   ├── DashboardHome.tsx        # High-level metrics charts (Logical: Overview.tsx)
│   │   ├── DashboardLayout.tsx      # Grid dashboard drawer & layout frame
│   │   ├── EditCourseModal.tsx      # Course settings update panel
│   │   ├── ExamCard.tsx             # Exam state card container
│   │   ├── ExamDetail.tsx           # Submissions tracker (Logical: ExamsManager.tsx)
│   │   ├── ExamManagement.tsx       # Exams list visual container
│   │   ├── GradeAnalytics.tsx       # Recharts student analytics visualizations
│   │   ├── GradeDetailModal.tsx     # Student script scoring breakdown panel
│   │   ├── GradeSheet.tsx           # Inline spreadsheet grade adjustment ledger
│   │   ├── ProfilePage.tsx          # User details settings interface
│   │   ├── SettingsPage.tsx         # Dark/Light theme & language selector toggle
│   │   ├── StudentDetail.tsx        # Individual student progress metrics
│   │   └── StudentList.tsx          # Academic class rosters (Logical: Students.tsx)
│   ├── AuthPage.tsx            # Domain email login & registration panel
│   ├── LandingPage.tsx         # Promotional home interface
│   └── RequireAuth.tsx         # Route authorization guard
├── context/                    # Shared Global State Contexts
│   ├── LanguageContext.tsx     # Translation keys & document layout direction (RTL/LTR)
│   ├── ThemeContext.tsx        # Light/Dark/System styling coordinator
│   └── ToastContext.tsx        # Global transient message dispatcher
├── firebase/                   # Data Store Integration Layer
│   └── firebaseConfig.ts       # Firebase v10 client SDK config initialization
├── services/                   # Backend Integration Adapters
│   ├── cloudinaryService.ts    # Multipart binary image upload client
│   ├── courseService.ts        # Database course CRUD transactional adapters
│   ├── exportService.ts        # PDF grading reports & Excel spreadsheet generators
│   ├── geminiGradingService.ts # Gemini Vision API configuration & prompts core
│   ├── geminiService.ts        # Auto grading service matching expected JSON outputs
│   └── notificationService.ts  # Database notification alerts publisher
├── utils/                      # Auxiliary Modules & Mock databases
│   ├── bisCurriculum.ts        # Hardcoded curriculum dataset catalog
│   └── mockData.ts             # Chart layouts validation mock inputs
├── types.ts                    # Application-wide TypeScript interface definitions
├── firestore.rules             # Backend database security rules
├── index.css                   # Global styling rules & Tailwind directives
├── index.html                  # HTML structure entry point template
├── index.tsx                   # React app mounting script
├── package.json                # Project script execution pipelines and dependencies
├── tailwind.config.js          # Typography styling extensions & themes
└── vite.config.ts              # Bundler configs and plugin switches
```

---

## 7. Security & Access Control Guardrails

### 1. Restricted Domain Authentication
To protect academic grading integrity, account registration checks are enforced during authentication:
*   *Validation Rule*: All registering faculty emails must match university domain endings (e.g., ending with `*.edu.eg` or `*.aun.edu.eg`).
*   *Implementation*: Handled securely at the registration screen during Firebase Authentication signup routines.

### 2. Multi-Tenant Firestore Isolation
Security policies are declared in `firestore.rules` to enforce multi-tenant isolation directly on the database engine level:

*   **Faculty Profiles (`/faculty/{uid}`)**:
    *   `allow read`: Allowed for any authenticated faculty user.
    *   `allow create`: Evaluates ownership via matching UID (`request.auth.uid == userId`) and enforces the `.edu.eg` domain suffix constraint.
    *   `allow update`: Allowed only for the profile owner, restricting email modifications.
    *   `allow delete`: Prohibited globally.

*   **Courses & Exams (`/courses/{id}`, `/exams/{id}`)**:
    *   `allow read, write`: Permitted only if the authenticated instructor's UID matches the object owner reference (`resource.data.facultyId == request.auth.uid`).

*   **Student Rosters (`/students/{id}`)**:
    *   `allow read`: Open to all authenticated faculty members.
    *   `allow write`: Prohibited globally.

*   **Submissions & Grades (`/submissions/{id}`, `/grades/{id}`)**:
    *   `allow read, write`: Permitted only if the instructor UID matches the object owner reference (`resource.data.facultyId == request.auth.uid`).

---

## 8. Local Quick-Start Guide

### Prerequisites
Ensure the following tools are installed on your development workstation:
*   **Node.js**: `v18.0.0` or higher
*   **npm** / **yarn** package manager

### 1. Clone & Install
Retrieve project files and install dependencies:
```bash
git clone https://github.com/Bavly-Hamdy/BIS-Smart-Grader-V2.git
cd BIS-Smart-Grader-V2
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and populate it with your environment variables:

```env
# Firebase Web App SDK Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Decoupled Cloudinary API Credentials
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Google AI Studio Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Development Server
Boot up the local hot-reloading development server:
```bash
npm run dev
```
The application will boot at `http://localhost:5173`.

---

<sub>© 2026 Assiut University - BIS Department. All Rights Reserved. Fully localized supporting Arabic (RTL) & English (LTR).</sub>
