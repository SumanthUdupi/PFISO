# Interactive Isometric Pixel Portfolio

## Overview
This is an interactive portfolio website that simulates an isometric pixel art office. Users can explore the environment to discover projects, skills, and contact information.

## Tech Stack
- **Frontend**: React, TypeScript, Three.js (React Three Fiber), Vite.
- **Backend**: Python (Flask).

## Setup & Running

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)

### Backend Setup
1. Navigate to the `backend` directory.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open the link provided (usually `http://localhost:5173`).

### Deployment to GitHub Pages
GitHub Pages only hosts static content. The React frontend can be built and deployed there, but the Python backend **will not run on GitHub Pages**.

**To deploy the frontend:**
1. Update `vite.config.ts` with your base URL (e.g., `base: '/repo-name/'`).
2. Run `npm run build`.
3. Deploy the `dist` folder content to the `gh-pages` branch.

**Backend Note:**
For the contact form to work in production, you must host the Python backend on a service like Render, Heroku, or Railway, and update the fetch URL in `src/components/ui/ContactForm.tsx`.
