<div align="center">
  <img src="./routenest/public/logo.png" alt="RouteNest Logo" width="100"/>
  <h1>RouteNest 🗺️</h1>
  <p><strong>Your Intelligent Travel Memory Vault & AI Itinerary Planner</strong></p>
  <p>
    Built with React, Express, Supabase, Clerk, and Google Gemini AI.<br>
    Featuring a custom-built, fully responsive <i>Neo-Brutalist</i> User Interface.
  </p>
</div>

---

## ⚡ Overview

**RouteNest** is a full-stack, production-ready web application designed to take the guesswork out of traveling. Whether you want to generate a hyper-realistic, day-by-day travel itinerary using advanced AI or safely vault your precious vacation memories (with photos), RouteNest beautifully handles it all. 

Designed entirely with modern **Neo-Brutalism** aesthetics, it features sharp angles, harsh shadows, and bold colors that make user interaction incredibly satisfying.

## 🌟 Key Features

* **🤖 AI Itinerary Generation:** Describe your dream trip, budget, and vibe—and let Google Gemini AI build a sensible, day-by-day personalized Markdown travel plan.
* **📸 Travel Memory Vault:** Document past trips by securely uploading up to 5 photos per memory directly to Supabase Storage, alongside notes and locations.
* **🔗 Public Trip Sharing:** Instantly convert any private itinerary into a sleek, Read-Only Public URL to securely share your curated trips with friends or social media.
* **🔒 Bulletproof Authentication:** Fully integrated with Clerk Auth on both the Frontend UI and Backend API for strict data protection.
* **📱 Responsive Neo-Brutalist UI:** Custom TailwindCSS architecture delivering satisfying micro-animations, bold typography, and extreme visual clarity.

## 🛠️ Technology Stack

**Frontend (`/routenest`):**
* React.js (Vite)
* TailwindCSS & Lucide Icons
* Clerk React (Auth)
* Axios & React-Markdown

**Backend (`/server`):**
* Node.js & Express.js
* `@clerk/express` (Route Protection)
* `@google/genai` (Gemini AI Engine)
* `@supabase/supabase-js` (PostgreSQL Database & Blob Storage)
* Multer (Memory-based image parsing)

---

## 🏛️ System Architecture

RouteNest operates on a completely decoupled **Client-Server architecture** designed for extreme scalability, data integrity, and strict separation of concerns.

### 1. The Client Engine (React SPA)
- **State & Routing:** Handled locally within the React context via React Router. The frontend functions as a Single Page Application (SPA), dynamically rendering deep component states based on standard user workflows.
- **Design System:** Employs a custom styling engine wired over TailwindCSS utilizing pure Neo-Brutalist elements (hard borders, heavy active shadows, and hyper-legible uppercase typography) to ensure a memorable, tactile interface.
- **Edge Authentication:** Integrates `<SignedIn>` and `<SignedOut>` components driven by Clerk, proactively evaluating user sessions before routing them to protected Dashboards.

### 2. The API Gateway (Express Node)
- **RESTful Topology:** A dedicated Express.js backend operates totally independently from the client, answering asynchronously formatted JSON HTTP structures point-to-point.
- **Stateless Authorization:** Utilizes tight `@clerk/express` middleware interceptors on all private routes (`/itineraries`, `/memories`, `/upload`). The server cryptographically unpackages the incoming `Bearer Tokens` from the client to strictly bind database payload requests to their verified physical `user_id`, averting any possibility of cross-user data spillage.

### 3. The Data Persistence Layer (Supabase PostgreSQL + Storage)
- **Relational Integrity:** Stores curated user memories and raw markup itineraries uniformly inside structured, relation-mapped PostgreSQL tables.
- **Memory-Optimized Blob Management:** To ensure high performance, image uploads bypass the filesystem entirely. They are intercepted by `multer` directly inside active RAM buffers and continuously pushed into the Supabase CDN, preventing massive file IO bottlenecking on the deployed backend hardware.

### 4. The Intelligence Layer (Google Gemini 2.5 Flash)
- **Safeguarded Generation:** Instead of the frontend conversing with Google API servers dynamically (exposing keys), the Express server acts as a robust middleman. It constructs and rigorously validates strict system prompts completely invisible to the user—ensuring output remains high quality, sensible, and exclusively formatted as strict Markdown block data.

---

<div align="center">
  <i>Developed to make exploring the world less complicated and beautifully recorded.</i>
</div>
