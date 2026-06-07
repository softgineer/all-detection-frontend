# ALL Detection System
### Multi-Stage Ensemble Learning for Acute Lymphoblastic Leukemia Detection

Built from Chapter 3 methodology: ResNet50 deep features + GLCM/Shape/Statistical handcrafted features,
fused via PCA and classified by SVM + Random Forest + Gradient Boosting majority vote.

---

## 🚀 Deploy to Vercel (5 steps)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Login to Vercel
```bash
vercel login
```

### 4. Add your Anthropic API key
Either via CLI:
```bash
vercel env add ANTHROPIC_API_KEY
# paste your key when prompted, select all environments
```
Or via the Vercel dashboard:
- Go to your project → **Settings** → **Environment Variables**
- Add `ANTHROPIC_API_KEY` = `sk-ant-...`

### 5. Deploy
```bash
vercel --prod
```
Your app will be live at `https://all-detection-system.vercel.app` (or similar).

---

## 💻 Run Locally

```bash
# 1. Copy env file and fill in your key
cp .env.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...

# 2. Install and start
npm install
npm start
```
App runs at http://localhost:3000. The `/api/claude` serverless function runs via `vercel dev`:
```bash
vercel dev   # instead of npm start — enables the API proxy locally
```

---

## 📁 Project Structure

```
all-detection-system/
├── api/
│   └── claude.js          # Vercel serverless function (API proxy)
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.js             # Main ALL Detection System component
├── .env.example           # Environment variable template
├── .gitignore
├── package.json
├── vercel.json            # Vercel routing config
└── README.md
```

---

## 🔑 How the API proxy works

The `api/claude.js` serverless function runs on Vercel's servers and:
1. Receives POST requests from the browser at `/api/claude`
2. Attaches your `ANTHROPIC_API_KEY` (stored securely as an env var)
3. Forwards the request to `https://api.anthropic.com/v1/messages`
4. Returns the response to the browser

Your API key is **never exposed** to the client.

---

## 📊 Datasets Referenced
- **ALL-IDB1 / ALL-IDB2** — University of Milan: https://homes.di.unimi.it/scotti/all/
- **C-NMC 2019** — Cancer Imaging Archive: https://wiki.cancerimagingarchive.net/display/Public/C-NMC+2019
