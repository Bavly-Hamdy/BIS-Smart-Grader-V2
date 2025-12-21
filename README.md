
<div align="center">
  <div style="background: linear-gradient(to right, #2563eb, #06b6d4); padding: 2px; border-radius: 20px; display: inline-block;">
    <div style="background: #0f172a; padding: 40px; border-radius: 18px;">
       <h1 style="color: white; font-size: 3em; margin: 0;">🎓 BIS Smart Grader</h1>
       <p style="color: #94a3b8; font-size: 1.2em; margin-top: 10px;">AI-Powered Academic Assessment & Faculty Management System</p>
    </div>
  </div>
  
  <br /> <br />

  [![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-10.0-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

---

## 🚀 Overview

**BIS Smart Grader** is a cutting-edge, web-based platform designed to revolutionize the grading workflow for university faculty. Built with modern web technologies, it offers a seamless, secure, and visually stunning environment for managing courses, tracking student performance, and streamlining the assessment process using AI capabilities.

The platform provides a **premium User Experience (UX)** with a completely English-only interface, featuring glassmorphism design elements, smooth formatting animations, and responsive interactive dashboards.

## ✨ Key Features

### 🔐 Advanced Authentication
*   **Secure Access**: Role-based authentication (Faculty) secured by Firebase Auth.
*   **University Validation**: Strict domain validation (`@aun.edu.eg`) to ensure official access.
*   **Premium UI**: A stunning login/register experience with gradient visuals and smooth transitions.

### 📊 Comprehensive Faculty Dashboard
*   **Real-time Analytics**: Instant view of active courses, total students, and pending grading tasks.
*   **Interactive Charts**: Data visualization using `recharts` to track performance trends and grade distributions.
*   **Action Items**: Smart suggestions for immediate attention (e.g., "Grade Exam X", "Review Submission Y").

### 📚 Course Management 2.0
*   **Dynamic Course Creation**: Create and manage detailed course profiles with credit hours and semester info.
*   **Smart Grading Schemes**: Define custom grading weights (Midterm, Final, CW) with visual validation.
*   **Visual Course Plans**: Donut charts and animated breakdowns of course assessment structures.

### 📝 Exam & Assessment Hub
*   **Digital Exam Creation**: Link exams to specific courses and set full marks/passing scores.
*   **Paper Management**: Support for physical exam paper tracking and digital grade entry.
*   **Auto-Grading Ready**: Architecture prepared for AI-assisted image recognition and grading (Gemini AI integration).

### 🎓 Student Performance Tracking
*   **360° Student Profiles**: Detailed academic history, current enrollment, and performance metrics.
*   **Progress Timeline**: Visual line charts tracking a student's improvement over time.
*   **Detailed Grade Sheets**: Color-coded performance indicators (Excellent, Good, Average, Risk).

### 🎨 Technical Excellence
*   **Modern Tech Stack**: React, TypeScript, Tailwind CSS, Framer Motion.
*   **Cloud-Native**: Fully integrated with Google Firebase (Firestore, Auth, Storage).
*   **Responsive Design**: Mobile-first architecture ensuring access from any device.
*   **Export Capabilities**: Generate professional PDF reports and Grade Sheets instantly.

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|--------------|
| **Frontend Core** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS 3.4, Framer Motion, Lucide React (Icons) |
| **Backend & DB** | Firebase Authentication, Cloud Firestore |
| **State Mgmt** | React Context API, Custom Hooks |
| **Data Viz** | Recharts |
| **Utilities** | jsPDF (Reporting), XLSX (Excel Export), CLSX |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   A Firebase project with Firestore and Auth enabled.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/bis-smart-grader.git
    cd bis-smart-grader
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your Firebase credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:5173`.

---

## 📂 Project Structure

```
bis-smart-grader/
├── components/          # Reusable UI components
│   ├── Dashboard/       # Dashboard specific widgets (Home, Courses, Students, etc.)
│   ├── ...
├── context/             # Global state (Auth, Toast Notifications)
├── firebase/            # Firebase configuration and service initialization
├── services/            # Business logic (NotificationService, Cloudinary, etc.)
├── types/               # TypeScript interfaces and type definitions
├── utils/               # Helper functions and mock data generators
├── App.tsx              # Main application entry point
└── tailwind.config.js   # Style configuration
```

---

## 🔮 Future Roadmap

- [ ] **AI-Powered OCR**: Automatically scan and grade physical exam papers using Google Gemini Vision.
- [ ] **LMS Integration**: Sync rosters directly from university systems.
- [ ] **Advanced Reporting**: Department-level analytics and accreditation reports.
- [ ] **Student Portal**: Dedicated view for students to check grades and feedback.

---

<div align="center">
  <p>Built with ❤️ for the BIS Department, Assiut University</p>
  <p>© 2025 BIS Smart Grader Team</p>
</div>
