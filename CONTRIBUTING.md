# 👋 Welcome to the BIS Smart Grader Contribution Guide

Thank you for your interest in contributing to **BIS Smart Grader**! We believe in the power of teamwork and open source. Your contribution, no matter how small—whether it's fixing a bug, suggesting a feature, or improving documentation—makes a big difference.

This guide will take you on a quick tour to get to know the project and how to contribute effectively.

## 🚀 About The Project

**BIS Smart Grader** is an intelligent platform for student assessment and automatic exam grading using Artificial Intelligence, designed specifically for the Business Information Systems (BIS) program at Assiut University.

* **Goal:** Automate the grading process, save faculty time, and provide accurate analytics of student performance.
* **Core Technology:** We utilize the **Google Gemini API** to analyze handwritten answers and compare them against model answers.

## 🛠️ Tech Stack

Before you start, please ensure you are familiar with the tools and technologies we use:

| Technology | Purpose | Notes |
| :--- | :--- | :--- |
| **React (Vite)** | Frontend | We use TypeScript to ensure code quality. |
| **Tailwind CSS** | Styling | We rely on Utility-first classes. |
| **Firebase** | Backend | Auth, Firestore, & Storage. |
| **Gemini API** | AI Engine | We use the `@google/genai` SDK. |
| **Recharts** | Charts | For displaying analytics in the dashboard. |
| **Framer Motion** | Animations | For a smooth user experience. |

## ⚙️ Setup & Installation

To run the project locally, please follow these steps carefully:

### 1. Prerequisites
* **Node.js:** Ensure you have a recent version installed (v18 or later).
* **Git:** For version control and code management.

### 2. Clone the Repository
```bash
git clone [https://github.com/Bavly-Hamdy/BIS-Smart-Grader.git](https://github.com/Bavly-Hamdy/BIS-Smart-Grader.git)
cd BIS-Smart-Grader
````

### 3\. Install Dependencies

```bash
npm install
```

### 4\. Environment Variables (.env)

Create a `.env` file in the root directory of the project and add the following keys (you can request demo keys from the project manager):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_key
```

### 5\. Run Local Server

```bash
npm run dev
```

You can now access the application in your browser at: `http://localhost:3000`

## 🤝 How to Contribute

We follow the standard GitHub Flow for contributions:

1.  **Fork:** Create a copy (Fork) of the project to your account.
2.  **Branch:** Create a new branch for the feature or fix you are working on.
      * *Naming convention:* `feature/new-login-screen` or `fix/grading-bug`.
3.  **Code:** Write your code.
      * Adhere to the existing Code Style.
      * Use clear Comments where necessary.
4.  **Commit:** Save your changes with a clear and concise message.
      * *Example:* `feat: Add dark mode support to dashboard`
5.  **Push:** Upload the branch to your GitHub account.
6.  **Pull Request:** Create a Pull Request (PR) to the main branch in the original repository.

## 🐞 Bug Reporting

If you encounter any issues, please do not hesitate to open a new Issue. Please include the following details:

  * A clear description of the problem.
  * Steps to reproduce the error.
  * Images or screenshots if possible.
  * Browser type and device used.

## 📜 Code of Conduct

We are committed to providing a friendly and inclusive environment for everyone. Please treat all contributors with respect and professionalism. We do not tolerate any form of harassment or discrimination.

> **Thank you for contributing to making BIS Smart Grader better\! 🚀💙**

```
```
