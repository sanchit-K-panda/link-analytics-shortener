# Product Requirements Document (PRD)

## LinkSnip — URL Shortener & Analytics

**Version**: 2.0.0  
**Date**: March 9, 2026  
**Author**: Sanchit K Panda  
**Status**: V2 Released (Neon DB Integration)  
**Repository**: [sanchit-K-panda/link-analytics-shortener](https://github.com/sanchit-K-panda/link-analytics-shortener)

---

## 1. Product Overview

**LinkSnip** is a fast, responsive URL shortener with built-in click analytics and cloud database persistence. It allows users to register, create trackable short links with optional expiration limits, and monitor engagement through a real-time dashboard. Building upon a local-first MVP, LinkSnip V2 leverages Neon Serverless PostgreSQL to ensure links are securely stored in the cloud while maintaining a blazing-fast user experience. 

### 1.1 Vision
Provide a fast, reliable, privacy-first URL shortening and analytics tool for the **VIBEATHON 2026** competition that demonstrates robust frontend and backend integration using a modern tech stack.

### 1.2 Target Audience
- Hackathon judges and participants.
- Developers needing quick, trackable short links with analytics and management capabilities.

---

## 2. Problem Statement

Standard URL shorteners often lack advanced capabilities like link expiration or require expensive tiers for analytics. Additionally, relying solely on local storage (as in V1) limits usability across different browsers or devices.
**LinkSnip** solves this by providing a unified, full-featured dashboard to manage links, monitor click counts, edit URLs, disable links, and enforce click limits, backed by a resilient Neon PostgreSQL database.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Cloud Persistence | Links stored securely in Postgres | 100% |
| Link Resolution | Short code to original URL redirect time | < 500ms |
| Data Accuracy | Click tracking accuracy | 100% |
| User Flow | Time to sign up and create a link | < 10 seconds |

---

## 4. Features & Requirements

### 4.1 Core Features (v2.0)

| # | Feature | Priority | Status |
|---|---|---|---|
| F1 | **User Authentication** — Local registration and login system with session management via localStorage. | P0 | ✅ Done |
| F2 | **Cloud DB Integration** — Persistent link storage using Neon Serverless PostgreSQL. | P0 | ✅ Done |
| F3 | **URL Shortening** — Generate unique 6-character alphanumeric short codes for full URLs. | P0 | ✅ Done |
| F4 | **Click Analytics** — Accurately track and increment clicks on each access, logging the last accessed timestamp. | P0 | ✅ Done |
| F5 | **Link Expiration (Click Limits)** — Optional setting to cap the maximum number of clicks a link can receive. | P1 | ✅ Done |
| F6 | **Link Management** — Edit the destination URL of existing short links. | P1 | ✅ Done |
| F7 | **Status Toggles** — Enable or disable links instantly from the dashboard. | P1 | ✅ Done |
| F8 | **Analytics Dashboard** — View Total Links, Total Clicks, Active Links, Expired Links, and Top Performing Link. | P1 | ✅ Done |
| F9 | **Copy to Clipboard** — One-click copy with inline success feedback. | P1 | ✅ Done |
| F10 | **Responsive Dark UI** — Sidebar navigation, dynamic grids, and glassmorphism styling tailored for modern web apps. | P2 | ✅ Done |

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 |
| **Build Tool** | Vite 6 |
| **Routing** | React Router DOM 6 (HashRouter) |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) |
| **Authentication** | Client-side (localStorage session tokens) |
| **Styling** | Vanilla CSS (Dark Theme + Custom Properties) |

### 5.2 Data Model

**Table: `links` (Neon PostgreSQL)**
- `id` (Serial, Primary Key)
- `original_url` (Text)
- `short_code` (Varchar 6, Unique constraint)
- `clicks` (Integer, Default 0)
- `max_clicks` (Integer, Nullable)
- `enabled` (Boolean, Default true)
- `owner` (Text, references the local username)
- `created_at` (Timestamp, Default NOW())
- `last_accessed_at` (Timestamp, Nullable)

---

## 6. User Flows

### 6.1 Authentication
1. User visits `/auth`.
2. Toggles between Login and Register.
3. Submits username and password.
4. On success, session is stored and user redirects to `/`.

### 6.2 Managing Links
1. **Create:** In "Create Link" tab, paste URL, optionally add a maximum click limit. Save. Database handles saving and short code generation.
2. **Edit:** In "My Links" tab, click the ✏️ icon to modify the `original_url`.
3. **Toggle:** Click "Active/Disabled" badge to toggle `enabled` state.

### 6.3 Visit a Short Link
1. User clicks `#/r/:code`.
2. `RedirectHandler` fetches link from Neon DB.
3. Validates if `enabled` is true and `clicks` < `max_clicks` (if limit set).
4. If valid, increments click count natively in Postgres and redirects.
5. If invalid or missing, shows an error screen or redirects to the homepage.

---

## 7. Design Specifications

### 7.1 Color Palette
- `--bg-primary`: `#0a0a0f`
- `--bg-secondary`: `#12121a`
- `--accent`: `#6366f1` (Indigo)
- `--purple`: `#a855f7`
- `--green`: `#22c55e` (Active states)
- `--orange`: `#f97316` (Expired states)
- `--text-primary`: `#f1f1f4`

### 7.2 Responsiveness
- Collapsible sidebar with overlay for mobile screens (`≤ 768px`).
- Fluid stat cards grid switching from 4 columns to 2 to 1 based on viewport width.
- Responsive data table with horizontal scrolling.

---

## 8. Constraints & Deployment

| Platform | URL | Method |
|---|---|---|
| **Database** | Neon.tech | Serverless SQL connection string |
| **Hosting** | Vercel / Netlify | Static SPA deployment |
| **Build command** | `npm run build` | Vite build to `/dist` |

**Limitations:**
- Authentication is currently stored client-side in localStorage (`linksnip_users`); clearing site data will log the user out and erase their local account. Links, however, belong to the username and are preserved in the database.

---
**Build. Adapt. Ship.** 🚀
