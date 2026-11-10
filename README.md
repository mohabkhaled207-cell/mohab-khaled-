# Mohab Khaled — Portfolio

A dark, premium Arabic/English portfolio built with React + Vite + Firebase Authentication + Cloud Firestore.

## Included
- Black / neon-purple responsive portfolio.
- Photo placeholder: replace the MK placeholder in `src/App.jsx` with your own portrait.
- Initial project: SKIP STORE (`https://skip-store2000-y4a.vercel.app/`).
- Bilingual Arabic / English interface.
- Firestore live project list and admin add/delete panel.
- Firebase email/password authentication for admin access.

## Setup
1. Create a Firebase project and register a Web App.
2. Enable **Authentication → Email/Password**.
3. Create your admin user in Firebase Authentication (`mohabkhaled207@gmail.com`).
4. Create a Cloud Firestore database.
5. Copy `.env.example` to `.env` and fill in the Firebase Web App config.
6. Set `VITE_WHATSAPP_NUMBER` to your WhatsApp number in international format without `+`.
7. Replace `REPLACE_WITH_ADMIN_UID` in `firestore.rules` with your Firebase Auth UID, then publish the rules.
8. Run `npm install` and `npm run dev`.
9. For Vercel, add all `VITE_FIREBASE_*` and `VITE_WHATSAPP_NUMBER` variables to Project Settings → Environment Variables, then redeploy.

## Firestore
Collection: `portfolioProjects`. Documents contain `title`, `category`, `description`, `url`, `image`, `createdAt`, and `createdBy`.

**Important:** Firestore is not active until the Firebase environment variables and real admin UID are configured. The repository does not contain credentials or secrets.
