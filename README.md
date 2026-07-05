<div align="center">
  <img src="./routenest/public/logo.png" alt="RouteNest Logo" width="100"/>
  <h1>RouteNest 🗺️</h1>
  <p><strong>Your Intelligent Travel Memory Vault, AI Itinerary Planner & Community Hub</strong></p>
  <p>
    Built with React, Express, Supabase, Clerk, and Google Gemini AI.<br>
    Featuring a custom-built, fully responsive <i>Neo-Brutalist</i> User Interface.
  </p>
</div>

---

## ⚡ Overview

**RouteNest** is a full-stack, production-ready web application designed to take the guesswork out of traveling and connect travelers. Whether you want to generate a hyper-realistic, day-by-day travel itinerary using advanced AI, safely vault your precious vacation memories (with photos), or share travel experiences anonymously in interest-based community groups, RouteNest handles it all in a single elegant platform.

Designed entirely with modern **Neo-Brutalism** aesthetics, it features sharp angles, harsh shadows, bold colors, and smooth micro-animations that make user interaction incredibly satisfying.

---

## 🌟 Key Features

* **🤖 AI Itinerary Generation:** Describe your dream destination, budget, duration, and vibe—and let Google Gemini AI build a sensible, day-by-day personalized Markdown travel plan.
* **📸 Travel Memory Vault:** Document past trips by securely uploading up to 5 photos per memory directly to Supabase Storage, alongside notes, destinations, and dates.
* **👥 Travel Communities (Anonymous Board):**
  * **Channel Creation:** Join interest-based groups (e.g., `backpacking-europe`, `solo-travelers`) or create your own custom channels.
  * **Anonymous Posting:** Share itineraries, travel stories, or general discussions.
  * **Import Stored Content:** Publish your previously saved vault memories or saved AI itineraries anonymously with a single click.
  * **Reddit-style Voting:** Upvote and downvote posts to help bubble up the best recommendations.
  * **Comment Threads:** Collaborate on posts under deterministically assigned pseudonyms (e.g. `Nomadic Panda #43`), protecting user privacy.
* **🔗 Public Trip Sharing:** Instantly convert any private itinerary into a sleek, Read-Only Public URL to securely share your curated trips with friends or social media.
* **🔒 Bulletproof Authentication:** Fully integrated with Clerk Auth on both the Frontend UI and Backend API for strict data protection.
* **📱 Responsive Neo-Brutalist UI:** Custom TailwindCSS architecture delivering satisfying micro-animations, bold typography, and extreme visual clarity.

---

## 🛠️ Technology Stack

**Frontend (`/routenest`):**
* **Framework:** React.js (Vite)
* **Styling:** TailwindCSS v4 & Lucide Icons
* **Authentication:** Clerk React (Auth)
* **Utilities:** Axios (API client) & React-Markdown (renders AI itineraries)

**Backend (`/server`):**
* **Framework:** Node.js (Express.js)
* **Auth Middleware:** `@clerk/express` (Cryptographic Bearer Token validation)
* **AI Engine:** `@google/genai` (Gemini 2.5 Flash API)
* **Database & CDN:** `@supabase/supabase-js` (PostgreSQL Database & Blob Storage)
* **File Uploads:** Multer (Memory-based image parsing)

---

## 🏛️ System Architecture

RouteNest operates on a completely decoupled **Client-Server architecture** designed for data integrity, security, and performance.

### 1. The Client Engine (React SPA)
* **State & Routing:** Managed locally using React state hooks and React Router SPA.
* **Design System:** Built using pure Neo-Brutalist elements (thick borders, offset active shadows, and uppercase bold typography).
* **Edge Authentication:** Integrates Clerk's `<SignedIn>` and `<SignedOut>` components, evaluating user sessions on the client side before routing to protected pages.

### 2. The API Gateway (Express Node)
* **RESTful Topology:** A dedicated Express.js backend handles all requests asynchronously, responding with standardized JSON payloads.
* **Stateless Authorization:** Intercepts incoming requests with `@clerk/express` middleware. The server decodes the `Bearer JWT` token, dynamically retrieving the verified `userId` to prevent cross-user data exposure.
* **Deterministic Privacy Hash:** To support anonymous community interactions, the server hashes the user's Clerk ID deterministically into unique pseudonyms (e.g., `Wandering Explorer #187`), preserving complete privacy.

### 3. Data Persistence Layer (Supabase PostgreSQL + Storage)
* **Relational Database:** Stores user records inside structured PostgreSQL tables. Performs relation joins to compute post upvotes, downvotes, and comments in a single query.
* **Blob CDN Management:** Directs image uploads through Express RAM buffers into Supabase Storage buckets via `@supabase/supabase-js` to optimize upload times and avoid disk storage bottlenecks.

### 4. The Intelligence Layer (Google Gemini 2.5 Flash)
* **System Prompting:** Prompts are structured, validated, and sent from the Express backend securely (hiding keys from the client). The output is streamed or returned as clean Markdown to the frontend.

---

## 💾 Database Schema

RouteNest utilizes six core PostgreSQL tables in Supabase:

```
                  +-----------------------+
                  |      communities      |
                  +-----------------------+
                              | (1)
                              |
                              | (N)
+------------+    +-----------------------+    +-----------------------+
|  memories  |--->|    community_posts    |<---|      itineraries      |
+------------+    +-----------------------+    +-----------------------+
  (Optional)                  | (1)                  (Optional)
                              |
                     +--------+--------+
                     |                 |
                     | (N)             | (N)
          +-------------------+   +--------------------+
          | community_comments|   |community_post_votes|
          +-------------------+   +--------------------+
```

* **`memories`:** Stores personal trip diaries, notes, locations, dates, and Supabase image links.
* **`itineraries`:** Stores generated trip itineraries, destinations, day counts, and public sharing permissions.
* **`communities`:** Stores created community groups (slugified name, description, creator ID).
* **`community_posts`:** Stores post titles, content, type (general, story, itinerary), location, and image array.
* **`community_comments`:** Stores discussion comments.
* **`community_post_votes`:** Manages upvotes/downvotes (composite key `(post_id, user_id)` to ensure single vote integrity).

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Supabase Account & Database
* Clerk Auth Account
* Google Gemini API Key

### Backend Setup (`/server`)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment configuration:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   GEMINI_API_KEY=your_gemini_key
   ```
4. Execute SQL migrations in your Supabase SQL Editor:
   - Run [server/supabase_schema.sql](file:///c:/Users/anshi/OneDrive/GitHub/RouteNest/server/supabase_schema.sql)
   - Run [server/supabase_community_schema.sql](file:///c:/Users/anshi/OneDrive/GitHub/RouteNest/server/supabase_community_schema.sql)
5. Run the dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup (`/routenest`)
1. Navigate to the routenest folder:
   ```bash
   cd routenest
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   # Comment out VITE_API_URL to fallback to localhost:5000 in development
   # VITE_API_URL=https://routenest.onrender.com
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173` (or the port shown in your terminal).

---

<div align="center">
  <i>Developed to make exploring the world collaborative, less complicated, and beautifully recorded.</i>
</div>
