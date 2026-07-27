# Alertify — Cross-Platform Alert App

PWA + Google Apps Script + OneSignal

---

## Setup Order

### 1. Google Sheets

1. Create a new Google Sheet
2. Rename Sheet1 → `users`, add Sheet2 → `alerts`
3. Add headers:

**users sheet (Row 1):**
```
id | email | password | onesignal_player_id
```

**alerts sheet (Row 1):**
```
id | user_id | title | message | scheduled_at | onesignal_notification_id | sent
```

4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

---

### 2. Google Apps Script

1. In your Sheet → Extensions → Apps Script
2. Paste the contents of `apps-script/Code.gs`
3. Go to Project Settings → Script Properties → Add:
   - `SHEET_ID` = your sheet ID
   - `ONESIGNAL_APP_ID` = your OneSignal app ID
   - `ONESIGNAL_REST_API_KEY` = your OneSignal REST API key
4. Deploy → New Deployment → Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL

> ⚠️ Every time you edit Code.gs, create a **new deployment** to pick up changes.

---

### 3. OneSignal

1. Sign up at [onesignal.com](https://onesignal.com)
2. New App → Web → enter your Netlify URL
3. Settings → Keys & IDs → copy:
   - **OneSignal App ID** → goes in `.env`
   - **REST API Key** → goes in Apps Script Script Properties

---

### 4. React App

1. Copy `.env.example` → `.env`
2. Fill in:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```
3. Install and run:
```bash
npm install
npm run dev
```

---

### 5. Deploy to Netlify

1. Push to GitHub
2. Connect repo to Netlify
3. Add environment variables in Netlify dashboard (same as `.env`)
4. Deploy

---

## How it works

- User registers/logs in → stored in Google Sheets
- On login, browser registers with OneSignal → `player_id` saved to user row
- Create alert → Apps Script writes to Sheets + calls OneSignal `send_after` API
- OneSignal fires push notification at exact scheduled time
- Edit alert → old notification cancelled, new one created
- Delete alert → notification cancelled, row deleted
