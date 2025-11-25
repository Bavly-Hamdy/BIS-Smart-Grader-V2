# BIS Smart Grader: AI-Powered Assessment Platform for Assiut University

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-13C769?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/models/gemini)

BIS Smart Grader is an innovative, AI-powered assessment platform designed to streamline the grading process for educators at Assiut University. Leveraging advanced artificial intelligence, the platform automates the grading of handwritten student answers against PDF model answers, providing instant scores, detailed feedback, and identified mistakes.

## ✨ Features

*   **Real-time Dashboard:** A comprehensive overview of courses, student performance, and grading progress.
*   **Course Management:** Create, manage, and organize courses, including student rosters and exam schedules.
*   **AI Grading Engine (Handwriting + PDF Model Answer):**
    *   Upload model answers as PDF files.
    *   Students submit handwritten answers as image files.
    *   Gemini AI analyzes both inputs to generate a score, detailed feedback, and pinpoint specific mistakes.
    *   "Analyzing..." skeleton state for a professional user experience.

## 🚀 Tech Stack

*   **Frontend:**
    *   [React](https://react.dev/) - A JavaScript library for building user interfaces.
    *   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript that compiles to plain JavaScript.
    *   [Vite](https://vitejs.dev/) - Next generation frontend tooling.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
    *   [Framer Motion](https://www.framer.com/motion/) - A production-ready motion library for React.
    *   [Recharts](https://recharts.org/) - A composable charting library built with React and D3.
    *   [Lucide Icons](https://lucide.dev/) - A beautiful and customizable icon set.
*   **Backend/Database:**
    *   [Firebase Authentication](https://firebase.google.com/docs/auth) - For secure user authentication.
    *   [Cloud Firestore](https://firebase.google.com/docs/firestore) - A flexible, scalable NoSQL cloud database.
*   **Artificial Intelligence:**
    *   [Google Gemini AI](https://ai.google.dev/models/gemini) - Advanced AI model for content generation and analysis.

## 🧑‍💻 Authors

*   [Bavly Hamdy](https://github.com/Bavly-Hamdy)
*   [Sama Harby](https://github.com/SamaHarby25)

## 🛠️ Setup

To get the BIS Smart Grader project up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Bavly-Hamdy/bis-smart-grader.git
    cd bis-smart-grader
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project with your Firebase configuration and Gemini API Key. Replace the placeholder values with your actual credentials.

    ```
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_firebase_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

    # Gemini AI API Key
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## 📁 Project Structure

```
bis-smart-grader/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AuthPage.tsx
│   │   ├── Button.tsx
│   │   ├── Dashboard/
│   │   │   ├── CourseDetailView.tsx
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── MyCourses.tsx
│   │   │   └── Students.tsx
│   │   └── ... (other components)
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── ... (other source files)
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```