<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1uKr-tqtiMUx1p6a75wsN6f2TuFn6q0fp

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in [.env.local](.env.local):
   - `GEMINI_API_KEY` - Your Gemini API key
   - `VITE_FIREBASE_*` - Firebase credentials (already configured)

3. Run the app:
   
   **Option 1 (Windows):** Double-click `start.bat`
   
   **Option 2 (Manual):** Open two terminals:
   - Terminal 1: `npm run server` (backend on port 4000)
   - Terminal 2: `npm run dev` (frontend on port 3000)

## Firebase Integration ✅

This app uses Firebase Firestore for:
- ✅ Real-time submission synchronization
- ✅ Cloud data storage
- ✅ Multi-user support
- ✅ Offline support with localStorage fallback

See [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md) for details.

"# Finale" 
