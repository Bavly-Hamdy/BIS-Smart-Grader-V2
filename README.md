<div align="center">

  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Project Banner" width="100%" />

  <br />
  <br />

  <h1 align="center" style="font-size: 3rem; font-weight: 900; color: #1e293b;">🎓 BIS Smart Grader</h1>
  
  <h3 align="center" style="color: #64748b; font-weight: 500;">
    The Intelligent Academic Assessment & Faculty Management System
  </h3>

  <p align="center">
    Built for <strong>Assiut University, BIS Department</strong>
  </p>

  <p align="center">
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/React_18-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://item.vercel.app/firebase">
      <img src="https://img.shields.io/badge/Firebase_10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    </a>
    <a href="https://vitejs.dev/">
      <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
  </p>
  
  <br />

  <p align="center">
    <a href="#-about-the-project"><strong>Explore The Project »</strong></a>
    <br />
    <br />
    <a href="#-installation-guide">View Demo</a>
    ·
    <a href="https://github.com/bavlyhamdy/bis-smart-grader/issues">Report Bug</a>
    ·
    <a href="https://github.com/bavlyhamdy/bis-smart-grader/issues">Request Feature</a>
  </p>
</div>

<br />
<br />

> [!IMPORTANT]
> This system is currently in **Active Development Phase (v1.0.0)** and is designed specifically for academic institutional use.

---

## 📋 Table of Contents

1. [📖 About The Project](#-about-the-project)
    - [The Problem](#the-problem)
    - [The Solution](#the-solution)
2. [✨ Comprehensive Features](#-comprehensive-features)
    - [Secure Authentication](#secure-authentication)
    - [Advanced Dashboard](#advanced-dashboard)
    - [Course Management](#course-management)
    - [Student Profiling](#student-profiling)
    - [Exam & Grading Architecture](#exam--grading-architecture)
3. [🎨 UI/UX Design Philosophy](#-uiux-design-philosophy)
4. [🛠️ Technical Architecture](#-technical-architecture)
5. [📂 Project Structure](#-project-structure)
6. [💻 Installation Guide](#-installation-guide)
7. [👥 The Creative Team](#-the-creative-team)
8. [📄 License & Copyright](#-license--copyright)

---

## 📖 About The Project

### The Problem
In the modern academic landscape, university faculties face significant challenges in managing the grading lifecycle. Traditional methods often involve:
*   **Fragmented Data**: Student records, exam papers, and grade sheets scattered across physical files and disconnected spreadsheets.
*   **Manual Errors**: High risk of calculation errors when aggregating grades manually.
*   **Time Consumption**: Hours spent on administrative tasks rather than teaching and research.
*   **Lack of Insight**: Difficulty in tracking real-time student performance trends across semesters.

### The Solution
**BIS Smart Grader** is a cutting-edge web application engineered to digitize and automate the entire academic assessment workflow. It serves as a centralized hub where:
1.  **Faculty members** can manage courses, exams, and students seamlessly.
2.  **Grading workflows** are automated and error-checked.
3.  **Data insights** are instant, providing clear visualizations of academic performance.

This project is not just a tool; it is a **digital transformation initiative** for the BIS Department at Assiut University.

---

## ✨ Comprehensive Features

### Secure Authentication
We prioritize security without compromising user experience.
*   **University Domain Validation**: The system strictly restricts registration to users with `@aun.edu.eg` email addresses, ensuring only authorized faculty members can access the platform.
*   **Role-Based Access Control (RBAC)**: secure Firestore rules ensure that faculty members can only modify data within their own jurisdiction.
*   **Secure Session Management**: Powered by Firebase Authentication for robust, persistent, and secure user sessions.

### Advanced Dashboard
The command center of the application.
*   **KPI Cards**: Instant visibility into "Total Active Courses", "Total Enrolled Students", and "Pending Grading Tasks".
*   **Performance Metrics**: Dynamic donut charts representing the status of course completion and student distribution.
*   **Actionable Insights**: An intelligent "Action Items" panel that flags urgency (e.g., "3 Exams need grading", "Finalize Course Plan for IS301").

### Course Management
A complete ecosystem for curriculum handling.
*   **Dynamic Course Creation**: Interfaces to define Course Code, Name, Credit Hours, and Semester.
*   **Visual Grading Schemes**: A unique, interactive tool that allows professors to allocate grade percentages (Midterm, Final, Practical, Oral) with real-time validation to ensure the total equals 100%.
*   **Information Architecture**: Organized views to see all courses at a glance with search and filter capabilities.

### Student Profiling
Moving beyond simple lists to deep academic profiles.
*   **Student 360 View**: A detailed profile page for every student showing their ID, photo, and academic history.
*   **Performance Trajectory**: Interactive line charts using `recharts` to visualize a student's grade trend over time/semesters.
*   **Academic Risk Detection**: Visual indicators (Red/Green/Yellow) highlighting students who are struggling or excelling based on their average grades.

### Exam & Grading Architecture
The core engine of the system.
*   **Exam Creation Wizard**: Step-by-step process to define exam metadata (Date, Max Score, Type).
*   **Digital Grade Sheets**: A modern, spreadsheet-like interface for entering and modifying student grades.
*   **Export Capabilities**: One-click generation of PDF reports and Excel sheets for official university submission.

---

## � UI/UX Design Philosophy

Our design language prioritizes **Clarity**, **Modernity**, and **Efficiency**.

*   **Glassmorphism**: We utilize backdrop blurs (`backdrop-blur-xl`), translucent white layers, and subtle borders to create a sense of depth and hierarchy.
*   **Vibrant Gradients**: Each section (Courses, Students, Exams) has a distinct color identity using modern Tailwind gradients (e.g., `from-blue-600 to-cyan-500`).
*   **Motion Design**: Every page transition, modal opening, and button hover is animated using **Framer Motion**. This makes the application feel "alive" and responsive.
*   **Accessibility**: High-contrast text, clear iconography (using `lucide-react`), and large touch-friendly targets ensure the system is usable by everyone.

---

## 🛠️ Technical Architecture

The project is built on a **Serverless Architecture** to ensure scalability and low maintenance.

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | The industry standard for building interactive UIs. |
| **Language** | **TypeScript** | Ensures type safety, reducing runtime errors and improving code quality. |
| **Styling** | **Tailwind CSS** | Enables rapid, utility-first styling with consistent design tokens. |
| **Backend / DB** | **Firebase** | Provides real-time NoSQL database (Firestore) and secure Auth out of the box. |
| **Build Tool** | **Vite** | Extremely fast build times and Hot Module Replacement (HMR) for better DX. |
| **State Management** | **Context API** | Lightweight global state management for Auth and UI states. |
| **Visualization** | **Recharts** | Composable, reliable charting library constructed on SVG. |
| **PDF Generation** | **jsPDF** | Client-side PDF generation for reports. |

---

## 📂 Project Structure

A clean, modular architecture ensures maintainability.

```bash
bis-smart-grader/
├── src/
│   ├── components/
│   │   ├── Auth/           # Authentication forms and logic
│   │   ├── Dashboard/      # Main application widgets
│   │   │   ├── CourseManagement.tsx
│   │   │   ├── StudentList.tsx
│   │   │   ├── ExamManagement.tsx
│   │   │   └── ...
│   │   └── UI/             # Shared atom components (Buttons, Cards, Inputs)
│   ├── context/            # React Context providers (AuthContext, ToastContext)
│   ├── firebase/           # Firebase SDK initialization and config
│   ├── hooks/              # Custom React hooks (useAuth, useFirestore)
│   ├── types/              # TypeScript interfaces (Course, Student, Exam)
│   └── utils/              # Helper functions (DateFormatting, CSVExport)
├── public/                 # Static assets
└── ...config files         # Tailwind, Vite, TSConfig
```

---

## 💻 Installation Guide

Follow these detailed steps to set up the development environment.

### Prerequisites
Ensure you have the following installed:
*   **Node.js** (v18.0.0 or higher) - [Download Here](https://nodejs.org/)
*   **npm** (Node Package Manager)

### Step 1: Clone the Repository
```bash
git clone https://github.com/bavlyhamdy/bis-smart-grader.git
cd bis-smart-grader
```

### Step 2: Install Dependencies
This command installs all necessary packages defined in `package.json`.
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory. You will need to obtain these credentials from your Firebase Console.

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Run the Application
Start the local development server.
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 👥 The Creative Team

This project was conceptually designed, architected, and brought to life by:

<div align="center">
  <table style="border: none;">
    <tr>
      <td align="center" width="300">
        <img src="https://via.placeholder.com/150/000000/FFFFFF/?text=BH" style="border-radius: 50%; width: 120px; height: 120px; margin-bottom: 10px;" alt="Bavly Hamdy" />
        <br />
        <h3 style="margin-bottom: 0;">Bavly Hamdy</h3>
        <p style="color: #64748b; font-size: 0.9em; margin-top: 5px;">Lead Full-Stack Engineer</p>
        <p style="font-size: 0.85em;">Responsible for System Architecture, Backend Logic (Firebase), and Core Functionality Implementation.</p>
        <a href="https://github.com/bavlyhamdy"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" height="20" /></a>
        <a href="#"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" height="20" /></a>
      </td>
      <td align="center" width="300">
        <img src="https://via.placeholder.com/150/000000/FFFFFF/?text=SH" style="border-radius: 50%; width: 120px; height: 120px; margin-bottom: 10px;" alt="Sama Harby" />
        <br />
        <h3 style="margin-bottom: 0;">Sama Harby</h3>
        <p style="color: #64748b; font-size: 0.9em; margin-top: 5px;">UI/UX & Frontend Engineer</p>
        <p style="font-size: 0.85em;">Responsible for User Interface Design, Visual Aesthetics, Motion Graphics, and User Experience Research.</p>
        <a href="#"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" height="20" /></a>
        <a href="#"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" height="20" /></a>
      </td>
    </tr>
  </table>
</div>

---

## 📄 License & Copyright

**© 2025 Assiut University - BIS Department**. All Rights Reserved.

This software is the intellectual property of the creators and the BIS Department. Unauthorized reproduction, distribution, or use of this source code without explicit permission is strictly prohibited.

---

<div align="center">
  <sub>Made with 💙 and ☕ by Bavly & Sama</sub>
</div>
