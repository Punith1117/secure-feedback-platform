# Secure Feedback Platform

A web-based system for collecting anonymous student feedback using one-time access codes and real-time data synchronization.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

## System Overview

This platform facilitates anonymous feedback collection for educational institutions. It is designed to solve two primary problems: ensuring the integrity of anonymous responses and providing immediate, real-time feedback to administrators.

### Core Engineering Features

*   **Transactional Integrity**: Feedback submissions are processed within database transactions to ensure that an access code is marked as "used" if and only if the response data is successfully recorded.
*   **Real-time Pub/Sub**: Integration with **Ably** allows the admin dashboard to receive sub-second updates as students submit feedback, without polling the database.
*   **Decoupled Data Modeling**: The schema separates feedback instances, course offerings, and faculty members into a normalized structure, allowing for reusable templates and flexible reporting.
*   **End-to-End Type Safety**: Shared TypeScript types across the database schema (Drizzle), server actions, and frontend components reduce runtime errors and improve developer experience.

---

## Technical Stack

*   **Framework**: Next.js 15 (App Router) with React 19 Server Components.
*   **Authentication**: Better Auth (supporting Role-Based Access Control).
*   **Database**: PostgreSQL hosted on Neon, managed via Drizzle ORM.
*   **Real-time**: Ably (WebSocket-based Pub/Sub).
*   **Reporting**: jsPDF for client-side report generation.
*   **Styling**: Tailwind CSS 4.0.

---

## System Architecture

The application follows a **Modular Monolith** pattern, leveraging Next.js Server Actions for secure, type-safe communication between the client and the database.

```mermaid
graph TD
    subgraph Client_Layer [Client Layer]
        A[Admin Dashboard]
        B[Student Submission Form]
    end

    subgraph Logic_Layer [Logic Layer - Next.js Server Actions]
        C[Session & RBAC Validation]
        D[Submission Transaction]
        E[Pub/Sub Broadcast]
    end

    subgraph Data_Layer [Data Layer]
        F[(PostgreSQL - Drizzle)]
        G[Ably Pub/Sub]
    end

    A -->|Auth Request| C
    B -->|Submit Feedback| D
    D -->|Atomic Update| F
    D -->|Trigger Update| E
    E -->|Broadcast| G
    G -->|WebSocket Sync| A
```

### Data Modeling & Schema
The database schema is designed for normalization and referential integrity:
*   **`feedback_instances`**: Represents a single feedback session (e.g., "Semester 1 Feedback").
*   **`course_offerings`**: Reusable course definitions linked to evaluation templates.
*   **`student_access_codes`**: Unique identifiers generated per instance to control access and ensure one-time usage.
*   **`feedback_submissions`**: Transactional records linking an access code usage to a specific instance.
*   **`feedback_responses`**: Normalized storage for individual question ratings.

### Security Design
1.  **Access Control**: Administrative routes are protected via server-side session validation.
2.  **Anonymization**: Submissions are decoupled from student identities. While an access code proves authorization, it is not linked back to a user profile in the database.
3.  **One-Time Use**: The system enforces a strict "claim-and-consume" logic within a transaction to prevent replay attacks or multiple submissions with the same code.

---

## Development & Deployment

### Prerequisites
*   Node.js 20+
*   pnpm
*   PostgreSQL (Neon recommended)

### Setup

1.  **Install dependencies**
    ```bash
    pnpm install
    ```

2.  **Environment Variables**
    Configure `.env` with the following:
    ```env
    DATABASE_URL="your_postgres_url"
    BETTER_AUTH_SECRET="your_secret"
    BETTER_AUTH_URL="http://localhost:3000"
    ABLY_API_KEY="your_ably_key"
    NEXT_PUBLIC_ABLY_API_KEY="your_ably_key"
    ```

3.  **Database Migration**
    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```

4.  **Run Development Server**
    ```bash
    pnpm dev
    ```

---

## Roadmap

*   **Testing**: Implementation of Playwright for end-to-end testing of the submission flow.
*   **Analytics**: Historical trend analysis for faculty performance.
* **AI-Assisted Insights**: Automated clustering and summarization of qualitative feedback to identify recurring concerns and trends.
*   **DevOps**: GitHub Actions for automated linting and schema validation.

---
## License
MIT License.