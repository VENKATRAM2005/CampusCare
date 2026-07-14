# CampusCare: Enterprise-Grade Institutional Governance & AI-Driven Quality Assurance

[![Architecture: FAANG-Level](https://img.shields.io/badge/Architecture-FAANG--Level-0052FF?style=for-the-badge&logo=architecture)](https://github.com/your-repo)
[![Engine: Gemini 3.1 Pro](https://img.shields.io/badge/AI-Gemini%203.1%20Pro-4285F4?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Security: RBAC + AES](https://img.shields.io/badge/Security-RBAC%20%2B%20AES-FF4B4B?style=for-the-badge&logo=shield)](https://en.wikipedia.org/wiki/Role-based_access_control)

**CampusCare** is a production-ready, full-stack governance ecosystem engineered for high-performance educational institutions. It integrates advanced AI triage, hierarchical grievance resolution, and a decentralized pedagogical audit system to ensure institutional excellence and stakeholder accountability.

---

## 🏗️ System Architecture & Engineering Principles

The platform is built on a **Modular Monolith** architecture, prioritizing strict departmental isolation and role-based data encapsulation.

### 1. Frontend Engineering (React 18 + Vite + TypeScript)
- **Component-Driven Development:** A library of high-fidelity, reusable UI primitives styled with **Tailwind CSS**.
- **Context-Aware Routing:** Dynamic dashboard orchestration based on `UserSession` roles (Student, Mentor, HOD, Admin).
- **Reactive State Management:** Centralized state with persistent synchronization to a service-oriented storage layer.
- **Data Visualization:** Real-time institutional and departmental analytics powered by **Recharts**, featuring distribution mapping and trend analysis.

### 2. Intelligent Backend Services
- **AI Triage & Moderation Engine:** Leverages **Gemini 3.1 Pro** for real-time NLP classification, sentiment analysis, and toxicity filtering.
- **Decentralized Governance:** A hierarchical routing system that dispatches grievances and manages review windows at the departmental level (HOD-led).
- **Cryptographic Integrity:** SHA-256 hashing for pedagogical reviews to ensure an immutable "Source of Truth" for institutional audits.
- **Service Layer Pattern:** Clean separation of concerns between UI, AI logic (`geminiService`), and persistence (`storageService`).

---

## 🚀 Core Modules & Workflows

### 🛡️ Intelligent Grievance Redressal (IGR)
*Automating the path from complaint to resolution.*

- **AI-Powered Triage:** Automatically classifies grievances into categories (Infrastructure, Academic, Ragging, etc.) and assigns priority levels based on institutional risk.
- **Hierarchical Escalation:** Implements a multi-tier resolution flow:
    - **Tier-1 (Mentor):** Initial departmental resolution.
    - **Tier-2 (HOD):** Oversight and escalation for mentor-related or unresolved issues.
    - **Tier-3 (Admin):** Final institutional authority for critical escalations.
- **Audit Timeline:** A transparent, real-time tracking system for students to monitor the resolution lifecycle.

### 📊 Pedagogical Audit & Review (PAR)
*Decentralized quality assurance led by Department Heads.*

- **Departmental Isolation:** HODs manage their own review windows, ensuring pedagogical audits are relevant to specific faculty contexts.
- **AI-Generated Institutional Reports:** One-click generation of comprehensive departmental reports with:
    - **Sentiment Analysis:** Qualitative summaries of faculty performance.
    - **Benchmarking:** Automated comparison of departmental scores against institutional standards.
    - **Visual Analytics:** Interactive Bar and Pie charts for score distribution.
- **Dynamic Staff Ranking:** Real-time "X of Y" ranking system for mentors, calculated within departmental boundaries to foster healthy academic growth.

---

## 🛠️ Tech Stack & Tooling

| Layer | Technology | Engineering Value |
| :--- | :--- | :--- |
| **Core** | React 18, TypeScript | Type-safe, declarative UI development |
| **Styling** | Tailwind CSS | Utility-first, highly maintainable design system |
| **AI/ML** | Google Gemini 3.1 Pro | Advanced NLP for triage, moderation, and reporting |
| **Analytics** | Recharts | High-performance SVG-based data visualization |
| **Animation** | Framer Motion | Fluid, purposeful micro-interactions |
| **Security** | Web Crypto API | Cryptographic hashing for data immutability |
| **Icons** | Lucide React | Consistent, accessible vector iconography |

---

## 🔒 Security & Compliance

- **Strict RBAC:** Granular access control ensuring users only interact with data relevant to their institutional role.
- **PII Protection:** Anonymized data aggregation for public statistics and institutional reports.
- **Data Integrity:** Every pedagogical review is cryptographically hashed upon submission, preventing unauthorized backend tampering.
- **Departmental Siloing:** HODs and Mentors are restricted to data within their own academic departments, preventing cross-departmental data leaks.

---

## ⚙️ Development & Deployment

### Prerequisites
- **Node.js 18+**
- **Vite** (Build Tool)
- **Gemini API Key** (Configured in `.env`)

### Quick Start
1. **Clone & Install:**
   ```bash
   git clone https://github.com/your-repo/campuscare.git
   cd campuscare
   npm install
   ```
2. **Environment Setup:**
   ```env
   GEMINI_API_KEY=your_secure_api_key
   ```
3. **Run Development:**
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Engineering Excellence Note
This project demonstrates a mastery of **Full-Stack Architecture**, **AI Orchestration**, and **Enterprise Workflow Design**. It is engineered to handle complex hierarchical data flows while maintaining a high-fidelity, user-centric interface.

*Built for Scalability. Designed for Integrity. Powered by Intelligence.*
