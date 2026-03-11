# 📚 LitSurvey — Collaborative Literature Survey Platform

A **private, collaborative** literature survey platform for researchers. Share it with your friends — everyone can post papers, tag them across categories, and search by **ideas**, not just keywords.

> **100% free to host and run.** No paid APIs, no server costs.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔒 **Private Access** | Supabase Auth — only invited collaborators can view or post |
| 📎 **Smart Paper Import** | Paste an arXiv link → auto-fetches title, authors, abstract |
| 🏷️ **Flexible Tags** | Papers tagged with `VLA`, `Diffusion`, `Robotics`, etc. A paper can have many tags |
| 🧠 **Semantic "Idea" Search** | Search "robot learns from video" → finds Vision-Language-Action papers. Powered by open-source AI embeddings in-browser |
| 👥 **Collaborative Feed** | See what your friends posted, when, and discuss papers |

---

## 🚀 Tech Stack (Free & Open Source)

| Layer | Technology | Cost |
|---|---|---|
| **Frontend** | [Vite](https://vitejs.dev/) + [React](https://react.dev/) | Free |
| **Styling** | Vanilla CSS (custom dark theme) | Free |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) | Free Tier |
| **Semantic Search** | [Transformers.js](https://huggingface.co/docs/transformers.js/) (`all-MiniLM-L6-v2`) + Supabase `pgvector` | Free (runs in browser) |
| **Hosting** | [GitHub Pages](https://pages.github.com/) via GitHub Actions | Free |

---

## 📂 Project Structure

```
Literature Survey/
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── .env.example              # Supabase keys template
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions → GitHub Pages
├── supabase/
│   └── schema.sql            # Database tables & pgvector setup
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── supabase.js       # Supabase client init
    │   ├── arxiv.js          # ArXiv metadata fetcher
    │   └── embeddings.js     # Transformers.js vector embeddings
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── PaperCard.jsx
    │   ├── AddPaperModal.jsx
    │   ├── SearchBar.jsx
    │   └── LoginPage.jsx
    └── context/
        └── AuthContext.jsx   # Supabase auth state management
```

---

## 🛠️ Setup Guide (Step-by-Step)

### 1. Clone & Install

```bash
git clone https://github.com/<YOUR_USERNAME>/literature-survey.git
cd literature-survey
npm install
```

### 2. Set Up Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com/) → Create a new project (free).
2. In your project dashboard, go to **Settings → API** and copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon / public` key → this is your `VITE_SUPABASE_ANON_KEY`
3. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql) to create all tables.
4. Enable the `pgvector` extension (the SQL script does this for you).
5. Go to **Authentication → Providers** and enable **Email/Password** sign-ups.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and paste your Supabase URL and Key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to your repo → **Settings → Pages** → Source: **GitHub Actions**.
3. Every push to `main` will automatically build & deploy via the included `.github/workflows/deploy.yml`.
4. Your site will be live at `https://<YOUR_USERNAME>.github.io/literature-survey/`.

> ⚠️ **Important**: For GitHub Pages, you need to set your Supabase keys as **Repository Secrets**:
> - Go to repo **Settings → Secrets and variables → Actions → New repository secret**
> - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## 📋 Supabase Database Schema

The SQL schema (in `supabase/schema.sql`) creates:

| Table | Purpose |
|---|---|
| `profiles` | User profiles (linked to Supabase Auth) |
| `papers` | Paper records (title, abstract, authors, url, posted_by) |
| `tags` | Tag definitions (VLA, Diffusion, Robotics, etc.) |
| `paper_tags` | Many-to-many relationship between papers and tags |

Plus `pgvector` extension and an `embedding` column on the `papers` table for semantic search.

---

## 🧠 How Semantic Search Works

1. When a paper is added, its **abstract** is passed through `all-MiniLM-L6-v2` (a 22MB model that runs **entirely in your browser** via Transformers.js).
2. The model converts the abstract into a **384-dimensional vector** capturing the paper's core *ideas*.
3. This vector is stored alongside the paper in Supabase (`pgvector`).
4. When you search, your query is also converted to a vector, and we find papers with the **closest conceptual match** using cosine similarity — no keyword matching needed.

---

## 🗺️ Roadmap

- [x] Core UI with feed, tags, paper cards
- [x] ArXiv link auto-import
- [x] Supabase Auth integration
- [x] Semantic search with Transformers.js
- [x] GitHub Pages deployment workflow
- [ ] Comments / discussion threads on papers
- [ ] PDF viewer integration
- [ ] Export survey as markdown/LaTeX

---

## 📜 License

MIT — free to use, modify, and share.
