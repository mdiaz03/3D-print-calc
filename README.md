# 3D Print Cost Calculator — PWA

A Progressive Web App (installable on Android) for calculating full 3D printing costs.

## How to host on GitHub Pages (Free)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up (free).

### Step 2 — Create a new repository
1. Click the **+** button (top right) → **New repository**
2. Name it: `3d-print-calc`
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
1. On your new repo page, click **uploading an existing file**
2. Drag and drop ALL files from this folder:
   - index.html
   - style.css
   - app.js
   - sw.js
   - manifest.json
   - icon-192.png
   - icon-512.png
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to **Settings** tab in your repo
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch, **/ (root)** folder
5. Click **Save**

### Step 5 — Get your URL
After ~60 seconds, your app will be live at:
`https://YOUR_GITHUB_USERNAME.github.io/3d-print-calc/`

---

## Install on Android

1. Open the URL above in **Chrome** on your Android phone
2. Tap the **⋮ menu** (top right)
3. Tap **"Add to Home screen"**
4. Tap **Add**

The app icon will appear on your home screen and opens full-screen like a native app — with full offline support!

---

## Features
- Filament cost with markup
- Electricity (wattage × time × rate)
- Labor (prep + post-processing)
- Machine amortization + repairs
- Custom other costs
- VAT/tax
- Live bar chart breakdown
- Copy results to clipboard
- Works fully offline after first load
