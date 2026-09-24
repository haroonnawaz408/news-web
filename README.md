# TechPulse — Production-Ready Automated News & Technology Portal

**TechPulse** is an editorial-grade, modern news and technology publication engineered with React, Vite, TypeScript, Tailwind CSS, and Supabase PostgreSQL. Designed for high performance, deep technical readability, automated news ingestion, dynamic SEO/JSON-LD, and AdSense monetization.

---

## 1. Core Architecture & Tech Stack

* **Frontend Framework**: React 18 + Vite (Fast HMR & Optimized Chunks)
* **Language**: TypeScript (Strict Mode)
* **Styling & Design System**: Tailwind CSS (Curated Light & Dark themes inspired by *The Verge* and *TechCrunch*)
* **Backend Database & Auth**: Supabase (PostgreSQL with Row-Level Security, RPC view counters, triggers)
* **Routing**: React Router v7
* **Article Prose**: React Markdown + `remark-gfm` (Code blocks, blockquotes, tables, lists)
* **Typography**: Google Fonts Inter & JetBrains Mono (Body: 18px desktop, line-height: 1.8)
* **Icons**: Lucide React
* **Analytics**: Recharts (Admin engagement charts)
* **Date Utilities**: date-fns
* **Monetization**: Google AdSense Development Placeholders (Leaderboard, Rectangle, In-Article, Sticky Sidebar)

---

## 2. Key Features

### Editorial Experience
* **Hero Spotlight & Trending**: Dominant featured analysis accompanied by 3 trending stories and a sticky Most-Read (01–05) ranking.
* **Breaking News Ticker**: Smoothly animated top ticker with live status indicator and manual controls.
* **Reading Progress Bar**: Subtle header progress indicator tracking reader scroll depth.
* **Interactive Table of Contents**: Auto-extracted from markdown `H2`/`H3` tags with active scroll-spy on desktop and collapsible drawer on mobile.
* **Social Sharing**: One-click sharing for X (Twitter), LinkedIn, WhatsApp, native mobile Web Share API, and clipboard copy with toast feedback.
* **Deduplicated View Counting**: Atomic views incremented via PostgreSQL RPC and guarded by `sessionStorage` against refresh inflation.
* **Instant Search**: Real-time debounced search indexing headlines, excerpts, categories, and tags.
* **Newsletter Subscription**: Duplicate-preventing email subscription with feedback states.
* **Dark / Light Mode**: Seamless theme switching with localStorage persistence and system preference detection.

### Staff CMS & Administration (`/admin`)
* **Analytics Dashboard**: Real-time totals for articles, published vs. drafts, aggregate reads, and subscriber counts with Recharts data visualizer.
* **Article Management**: Searchable and filterable data table with quick publish/draft toggle and deletion modal.
* **Dual-Mode Markdown Authoring**: Write technical markdown with instant side-by-side Live Preview.
* **SEO Metadata Overrides**: Custom meta titles, descriptions, and URL slug management.
* **Zero-Setup Demo Mode**: Instant administrative evaluation even before connecting a live Supabase database.

---

## 3. Project Structure

```
d:/News web/
├── public/
│   ├── favicon.svg             # Modern TechPulse brand mark
│   ├── robots.txt              # SEO crawler directives
│   └── sitemap.xml             # XML sitemap
│
├── scripts/
│   └── generate-sitemap.js     # Automated sitemap generation script
│
├── src/
│   ├── components/
│   │   ├── ads/                # Google AdSense placement slots
│   │   │   └── AdPlaceholder.tsx
│   │   ├── articles/           # Editorial components
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleContent.tsx
│   │   │   ├── FeaturedArticle.tsx
│   │   │   ├── ReadingProgress.tsx
│   │   │   ├── RelatedArticles.tsx
│   │   │   ├── SocialShare.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── TrendingArticles.tsx
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── OptimizedImage.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/             # Layout navigation
│   │   │   ├── BreakingNews.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── newsletter/         # Subscription widgets
│   │   │   └── NewsletterSignup.tsx
│   │   ├── search/             # Search bar and results
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   └── seo/                # Dynamic Head & JSON-LD
│   │       └── SEO.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx     # Supabase Auth & Demo Admin
│   │   └── ThemeContext.tsx    # Light / Dark mode
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts      # Search query debouncing
│   │   ├── usePostViews.ts     # Session-guarded post views
│   │   └── useTheme.ts         # Theme hook
│   │
│   ├── lib/
│   │   ├── constants.ts        # Categories, breaking alerts, sample articles
│   │   ├── supabase.ts         # Supabase client singleton
│   │   └── utils.ts            # Formatting, reading time, slugify
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx   # Metrics & Recharts overview
│   │   │   ├── EditPost.tsx    # Article editor
│   │   │   ├── Login.tsx       # Auth portal
│   │   │   ├── NewPost.tsx     # Article creation
│   │   │   └── Posts.tsx       # Catalog & data table
│   │   ├── About.tsx
│   │   ├── ArticlePage.tsx     # Long-form article layout
│   │   ├── CategoryPage.tsx    # Domain feeds
│   │   ├── Contact.tsx
│   │   ├── EditorialPolicy.tsx
│   │   ├── Home.tsx            # Editorial homepage
│   │   ├── Privacy.tsx
│   │   ├── SearchPage.tsx
│   │   └── Terms.tsx
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx       # Route definitions & ProtectedRoute
│   │
│   ├── services/
│   │   ├── analytics.ts        # Dashboard statistics
│   │   ├── automation.ts       # AI & n8n duplicate checking
│   │   ├── newsletter.ts       # Subscriber services
│   │   └── posts.ts            # Article queries & fallbacks
│   │
│   ├── types/
│   │   ├── article.ts          # Domain interfaces
│   │   └── database.ts         # Supabase PostgreSQL schema
│   │
│   ├── App.tsx
│   ├── index.css               # Design tokens & reading typography
│   └── main.tsx
│
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql  # Tables, RLS, Indexes, Triggers, RPC
    └── seed.sql                    # High quality sample tech articles
```

---

## 4. Quick Start: Running Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The application runs immediately with full sample data and interactivity.

---

## 5. Supabase Setup Instructions

To connect your live PostgreSQL cloud database:

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.

### 2. Run Database Migrations
1. In your Supabase Dashboard, navigate to the **SQL Editor**.
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
3. Next, copy and paste `supabase/seed.sql` and click **Run** to populate 10+ tech articles and authors.

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
Restart your dev server (`npm run dev`). TechPulse will automatically detect your live Supabase connection!

---

## 6. Admin Portal Setup

* **URL**: `/admin` (or click "Staff" in the header)
* **Supabase Authentication**: Create an administrator user in your Supabase Dashboard under **Authentication -> Users**.
* **Instant Demo Mode**: When running without Supabase or in preview mode, click **"Launch Instant Demo Admin Mode"** on `/admin/login` or sign in with:
  * **Email**: `admin@techpulse.dev`
  * **Password**: `admin123`

---

## 7. Connecting Future AI & News Automation Pipelines

TechPulse is engineered with clean boundaries for automated news ingestion (n8n, Make, Python scrapers, or OpenAI/Anthropic pipelines).

### Ingestion Schema
Automated scripts can insert articles directly into Supabase via the REST API or client:
```typescript
import { validateAndDeduplicate } from '@/services/automation';

const payload = {
  title: "New AI Architecture Breaks Inference Latency Records",
  content: "## Full markdown analysis...",
  category: "AI",
  tags: ["AI", "Neural Networks"],
  featured_image: "https://...",
  source_url: "https://arxiv.org/abs/...",
  source_name: "arXiv Preprint",
  author_name: "TechPulse AI Wire",
};

// 1. Validates content length and detects semantic duplicates (>75% similarity or same URL)
const result = await validateAndDeduplicate(payload);
if (result.isValid) {
  // 2. Safe to insert into Supabase posts table
}
```

---

## 8. Build & Deployment

### Production Build
```bash
npm run build
```
Creates an optimized, production-ready bundle in `dist/`.

### Preview Production Build
```bash
npm run preview
```

### Cloud Deployment
* **Vercel**: Push your repository to GitHub, connect to Vercel, set Framework to `Vite`, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Environment Variables.
* **Netlify**: Ensure Publish directory is set to `dist` and build command is `npm run build`.
* **Cloudflare Pages**: Connect repository with `npm run build` and `dist` output.
