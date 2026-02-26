# HireFlow: Enterprise-Grade AI Talent Acquisition Pipeline

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Architecture](https://img.shields.io/badge/architecture-Microservices-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Abstract
HireFlow is an advanced, fully automated end-to-end recruitment orchestrator designed to minimize human intervention in the initial and intermediate stages of talent acquisition. Utilizing a distributed microservices architecture, the platform seamlessly integrates traditional applicant tracking methodologies with state-of-the-art artificial intelligence models for real-time candidate evaluation, proctoring, and data verification.



## Core Architecture & Modules

The system is structurally divided into two primary interfaces, governed by a robust Role-Based Access Control (RBAC) middleware.

### 1. Administrative & Recruitment Console (HR Workspace)
This module acts as the central command center for talent acquisition teams, offering highly granular control over the recruitment lifecycle.

* **Dynamic Pipeline Configuration:** Administrators can initiate multi-stage hiring drives. Parameters include project allocation, required operational capacity, strict deadlines, and target demographic metrics.
* **Algorithmic Assessment Engine:** A highly configurable testing environment.
    * *General Aptitude Module:* Parameterized generation of domain-specific quantitative and qualitative queries.
    * *Coding Assessment Module:* Language-agnostic coding environments with customizable difficulty matrices and topic constraints.
* **Intelligent Interview Orchestration:** * *AI-Driven Interviews:* Automated conversational interfaces programmed to extract technical depth based on predefined cognitive thresholds.
    * *Human-in-the-loop (HITL) Integration:* Seamless generation and dispatch of secure meeting links for final round evaluations.
* **Automated KYC & Document Parsing:** Post-selection verification flows requiring mandatory document uploads (e.g., PAN, Aadhaar) utilizing optical character recognition and pattern matching constraints.
* **Internal Resource Allocation:** Direct integration with internal company rosters to automatically transition verified candidates into active employee status within assigned teams.

### 2. Candidate Telemetry & Evaluation Portal
A high-performance, low-latency interface designed for candidate interaction, ensuring strict compliance with assessment integrity protocols.

* **Asynchronous Application Flow:** Real-time data extraction from uploaded curriculum vitae to auto-populate application matrices, reducing drop-off rates.
* **Stateful Progress Tracking:** A persistent, stateless dashboard reflecting real-time pipeline status (Application -> Assessment -> Interview -> Verification).
* **Secure Proctored Environment:** * Browser-locked assessment windows with active tab-switching detection.
    * Continuous background video telemetry for anomaly detection during both cognitive and technical rounds.
* **Post-Offer Onboarding:** Encrypted channels for transmitting sensitive verification documents directly to the administrative verification queue.

## Technical Specifications & Stack

* **Client Interface (Frontend):** React.js, TypeScript, Tailwind CSS (implementing a strict glassmorphism design language for optimal cognitive load distribution).
* **Core Orchestrator (Backend):** Node.js running on Express framework. Handles route multiplexing, state management, and primary database transactions.
* **Data Persistence Layer:** MongoDB (NoSQL) for highly flexible schema management of dynamic assessment arrays and user profiles.
* **Artificial Intelligence Microservice:** Python via FastAPI. Operates as an isolated service for heavy computational tasks including natural language processing (NLP), resume parsing, and evaluation algorithms.
* **Authentication & Security:** JWT-based stateless authentication with strict RBAC implementation.

## Deployment & Initialization

To initialize the development server locally, ensure both Node and Python runtime environments are configured.

```bash
# Clone the repository
git clone [https://github.com/your-org/hireflow-core.git](https://github.com/your-org/hireflow-core.git)

# Initialize Core Backend dependencies
cd backend
npm install
npm run dev

# Initialize AI Microservice
cd ../ai-engine
pip install -r requirements.txt
uvicorn main:app --reload

# Initialize Client Interface
cd ../frontend
npm install
npm run start