# SalesCommand 📊
AI-Powered Field Sales Manager · India

## Features
- Orders with MRP, GST (CGST + SGST), and discount tracking
- Cash & Cheque collections
- Damage & Returns management
- GPS activity log
- AI Insights powered by Claude

---

## 🚀 Deploy to Vercel (Recommended)

### Step 1 — Push to GitHub
1. Create a new repo at https://github.com/new
2. Run these commands in this folder:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salescommand.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com and sign up (free)
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Vercel auto-detects React — just click **Deploy**
5. Your app goes live at `https://salescommand.vercel.app` (or custom name)

---

## 💻 Run Locally
```bash
npm install
npm start
```
Opens at http://localhost:3000

## 🏗️ Build for Production
```bash
npm run build
```
Creates a `build/` folder — upload this to any static host.

---

## 🌐 Custom Domain (e.g. salescommand.in)
1. Buy domain at GoDaddy / Namecheap (~₹500/year for .in)
2. In Vercel → Project Settings → Domains → Add your domain
3. Update DNS records as shown by Vercel
4. Done — SSL certificate is automatic and free

---

## ⚙️ Adding Your Anthropic API Key
The app calls the Anthropic API for AI Insights.
In Vercel → Project Settings → Environment Variables, add:
```
REACT_APP_ANTHROPIC_KEY=your_key_here
```
Then update `src/App.jsx` line with `fetch("https://api.anthropic.com/v1/messages"` to include:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01"
}
```
