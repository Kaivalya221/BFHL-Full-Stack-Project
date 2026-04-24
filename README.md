# BFHL — SRM Full Stack Engineering Challenge

A production-ready REST API + Frontend for hierarchical node processing.

---

## Project Structure

```
bfhl-project/
├── backend/
│   ├── index.js        ← Express API (/bfhl POST endpoint)
│   ├── package.json
│   └── vercel.json     ← Vercel deployment config
└── frontend/
    └── index.html      ← Single-page UI
```

---

## ⚡ Quick Start (Local)

### Backend
```bash
cd backend
npm install
npm start
# API running at http://localhost:3000
```

### Frontend
Just open `frontend/index.html` in your browser.
Set the API URL field to `http://localhost:3000`.

---

## 🚀 Deployment Guide

### Step 1 — Deploy Backend to Vercel

1. Push the `backend/` folder to a GitHub repo (e.g. `bfhl-api`)
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Other** | Root directory: `backend/` (or repo root if you pushed only backend)
4. Click Deploy
5. Your API URL: `https://bfhl-api-xxx.vercel.app`

> **BEFORE deploying**, edit `backend/index.js` lines 7–9:
> ```js
> const USER_ID = "yourname_ddmmyyyy";
> const EMAIL_ID = "your.email@srmist.edu.in";
> const COLLEGE_ROLL = "RA22XXXXXXXX";
> ```

### Step 2 — Deploy Frontend to Vercel / Netlify

**Netlify (easiest for static HTML):**
1. Push `frontend/index.html` to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Build command: *(leave blank)*, Publish directory: `.`
4. Deploy!

**Or drag-and-drop** `frontend/` folder at [app.netlify.com/drop](https://app.netlify.com/drop)

### Step 3 — Update API URL in Frontend

In `frontend/index.html`, you can change the default API URL:
```html
<input ... value="https://your-api.vercel.app" .../>
```
Or just type it in the UI when using the app.

---

## 📋 Submission Checklist

- [ ] Edit identity fields (USER_ID, EMAIL_ID, COLLEGE_ROLL) in `backend/index.js`
- [ ] Backend deployed and live (test: `POST /bfhl`)
- [ ] Frontend deployed and live
- [ ] GitHub repo is **public**
- [ ] CORS is enabled (already done in `index.js`)
- [ ] Test with: `A->B, A->C, B->D, X->Y, Y->Z, Z->X, hello, 1->2`

---

## 🧪 Test the API

```bash
curl -X POST https://your-api.vercel.app/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B","A->C","B->D","X->Y","Y->Z","Z->X","hello"]}'
```

---

## Submission Fields

| Field | Value |
|---|---|
| GitHub Repo URL | `https://github.com/yourusername/bfhl-project` |
| Frontend URL | `https://bfhl-frontend.netlify.app` |
| Backend API Base URL | `https://bfhl-api-xxx.vercel.app` *(no /bfhl at end!)* |
