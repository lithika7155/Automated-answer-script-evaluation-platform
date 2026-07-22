# AlgoAce - AI Interview Prep Platform (Frontend)

This is the frontend component of the AlgoAce platform, built with Vite, React 18, and vanilla CSS for a highly customized and performant UI.

## Features Built
- **Home Dashboard:** Hero section, dynamic statistics, quick topic filters, and a trending questions feed.
- **Questions Explorer:** Sidebar with multi-select filtering for difficulties, topics, and companies. Debounced text search and sort options.
- **Question Detail Page:** 
  - Rich Markdown support with syntax highlighting
  - Multi-language solution code block viewer
  - **AI Tab:** Uses Gemini to explain problem intuition
  - **Hints Panel:** Progressively reveals hints from gentle nudge to concrete skeleton
  - **Review System:** Type an approach and receive AI evaluation of correctness, time complexity, and edge cases
- **Company Roadmap:** Generate a custom 4-week preparation study plan for target companies via Gemini
- **User Profile:** Manage bookmarked questions and view history locally
- **Dark Premium Design System:** Extensive use of CSS custom properties, glassmorphism, fluid typography, gradients, and micro-animations for a high-end feel.

## Getting Started

### Prerequisites
You need **Node.js** installed on your system to run the Vite development server.

1. Download the Windows installer from the official Node.js website: https://nodejs.org/
2. Run the installer and follow the standard prompts.
3. Once installed, verify it's working by opening a new terminal and running:
   ```bash
   node --version
   npm --version
   ```

### Running the App

Once Node.js is installed, follow these steps from the `frontend` directory:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Access the App**
   Open your browser and navigate to `http://localhost:5173`. 
   *Note: Ensure your FastAPI backend is running on `http://localhost:8000` for data to load properly. The Vite config automatically proxies API requests to the backend.*
