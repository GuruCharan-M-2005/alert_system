# Alertify — Cross-Platform Alert App

React PWA + Firebase + Google Tasks

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite (PWA) |
| Auth | Firebase Auth (Google OAuth) |
| Database | Firebase Firestore |
| Notifications | Google Tasks API |
| Hosting | Firebase Hosting (auto-deploy via GitHub Actions) |

---

## How It Works

- User signs in with Google
- Create alert → saved to Firestore + created as a Google Task
- Google Tasks app fires notification at the scheduled time
- Edit alert → old task deleted, new task created
- Delete alert → removed from Firestore + Google Tasks
- Works on Android, iOS, Windows, Mac — anywhere Google Tasks is installed

---

## Setup

### 1. Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (test mode, asia-south1)
4. Enable **Authentication** → Google provider
5. Register a Web App → copy the `firebaseConfig` values
6. Enable **Firebase Hosting**

### 2. Google Tasks API

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your Firebase project
3. Search **"Google Tasks API"** → Enable
4. APIs & Services → Credentials → copy the OAuth 2.0 Client ID

### 3. Environment Variables

Copy `.env.example` → `.env` and fill in:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_CLIENT_ID=
```

### 4. GitHub Secrets

Add all 7 env vars as GitHub repository secrets:
- Repo → Settings → Secrets and variables → Actions → New repository secret

### 5. Local Development

```bash
npm install
npm run dev
```

### 6. Deploy

Push to `main` branch → GitHub Actions auto-builds and deploys to Firebase Hosting.

Live URL: `https://YOUR_PROJECT_ID.web.app`

---

## Firestore Structure

**alerts collection:**
```
id            (auto)
user_id       string
title         string
message       string
scheduled_at  string (ISO)
task_id       string
list_id       string
created_at    timestamp
```

---

## For iOS Users

Install **Google Tasks** from the App Store, sign in with the same Google account, and enable notifications. Alerts will arrive natively on iOS without any Apple Developer account needed.

---

## Pages

- `/` — Main app
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
