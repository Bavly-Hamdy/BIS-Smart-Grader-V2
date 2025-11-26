# Security Policy

We take the security of **BIS Smart Grader** seriously. As an academic project dealing with student assessments and AI integration, we appreciate your help in disclosing any vulnerabilities in a responsible manner.

## Supported Versions

Currently, we are actively supporting the latest major version of the project.

| Version | Supported          |
| :------ | :----------------- |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project (e.g., issues with Firebase rules, API key exposure, or data leakage), please follow these steps:

1.  **Do NOT open a public issue.** Publicly reporting a security vulnerability can put the application and user data at risk before we have a chance to fix it.
2.  **Email the maintainers** directly at: `your-email@example.com` (Replace with your actual email).
    * Please include "SECURITY" in the subject line.
    * Provide a detailed description of the vulnerability.
    * If possible, include steps to reproduce the issue.
3.  **Response Timeline:** We will acknowledge your report within **48 hours** and provide an estimated timeline for the fix.

## Security Best Practices for Contributors

If you are contributing to this project, please adhere to the following guidelines:

* **Never commit `.env` files.** Ensure all API keys (Gemini, Firebase) are stored in environment variables and included in `.gitignore`.
* **Firebase Rules:** When modifying database rules, ensure that student data is only readable/writable by authorized users (Admins/Professors).
* **Sanitization:** Ensure that inputs sent to the Gemini API are sanitized to prevent prompt injection attacks.

## Attribution

We will publicly acknowledge the contribution of security researchers who report vulnerabilities responsibly (unless you prefer to remain anonymous).
