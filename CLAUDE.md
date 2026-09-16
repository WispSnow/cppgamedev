# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese-language C++ game development tutorial website (cppgamedev.top). Full-stack app with React frontend and Express backend. Course content is stored as Markdown files served via API.

## Development Commands

```bash
# Install all dependencies (frontend and backend are separate npm projects; there is no root package.json)
cd frontend && npm install && cd ../backend && npm install

# Start backend dev server (port 5001, auto-reloads with nodemon)
cd backend && npm run dev

# Start frontend dev server (port 3000, proxies API to localhost:5001)
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build

# Run tests (CI runs both before building and deploying)
cd frontend && npm test
cd backend && npm test   # node --test; needs no installed dependencies
```

Both servers must run simultaneously for local development. Frontend proxies `/api/*` requests to backend via the `proxy` field in `frontend/package.json`.

## Architecture

### Frontend (`frontend/src/`)
- **React 19 + TypeScript** with Create React App
- **Styling:** styled-components (CSS-in-JS). Theme colors are CSS variables defined in `index.css` and switched by `<html data-theme>`: an inline script in `public/index.html` sets it before first paint (the stored choice, otherwise the system preference) and `context/ThemeContext.tsx` toggles it. Use the variables (e.g. `--on-primary-color` for text on primary-colored backgrounds) instead of hard-coded colors so dark mode keeps working
- **Routing:** React Router v7 — routes defined in `App.tsx`
- **Markdown rendering pipeline:** `react-markdown` + `rehype-raw` + `remark-gfm` + `react-syntax-highlighter` (Prism), custom renderers via `hooks/useMarkdownComponents.tsx`
- **Mermaid diagrams:** ```` ```mermaid ```` fences render as diagrams via `components/MermaidDiagram.tsx` (the `mermaid` package is dynamically imported only on pages that contain one)
- **API calls:** `fetch` via service files in `services/` (`api.ts` holds the shared JSON helper and `isNotFoundError`; `courseService.ts` and `troubleshootingService.ts` take an optional `AbortSignal`); `SearchModal` calls `/api/search` directly. `storageService.ts` wraps localStorage (bookmarks, reading progress)
- **Comments:** Giscus integration configured in `config/giscus.ts`
- **Static data:** `data/roadmapData.ts` (roadmap), `data/faqData.tsx` (FAQ)
- **Shared types:** `types/index.ts` — `Course`, `CoursePart`, `TroubleshootingArticle`, etc.
- **Analytics:** GA4 (`G-JLHZH11YW4`) + 百度统计 (`_hmt`). `public/index.html` loads both only in production builds and turns off their automatic page views; `SEOHelmet` reports each page view through `utils/analytics.ts` once the page title is known. Every routed page must render `SEOHelmet` (pages that fetch data render it after the data arrives, so the reported title is final)

#### Key components
- `SEOHelmet` — page-level `<title>` / `<meta>` / canonical tags using React 19's built-in metadata support (React hoists them into `<head>`; `index.tsx` removes the default description/keywords from `index.html` at startup so each exists once); also reports the page view (see Analytics)
- `ScrollManager` — rendered in `App.tsx`; scrolls to the top on link navigation. On back / forward / reload it restores what was on screen: it records the element at the top of the viewport (DOM path + offset) and re-aligns to it once the async content renders, so lazy images that have not loaded yet do not throw the position off. Positions live in sessionStorage; a freshly opened page is never restored
- `VideoPlayer` — lazy-load embedded Bilibili / YouTube iframe (click-to-play)
- `MarkdownPage` — generic page that fetches and renders a static Markdown file from `frontend/public/content/` (takes `title` and `description`)
- `TableOfContents` — slide-out drawer listing the current course's chapters, used in chapter pages
- `ChapterNavigation` — prev/next chapter links at bottom of course pages
- `ProgressIndicator` — reading progress bar for long pages
- `ScrollToTopButton` — floating back-to-top button shown after scrolling 400px, used in chapter pages
- `ErrorState` / `Skeleton` — standard error and loading-state UI
- `utils/difficultyUtils.ts` — maps difficulty level (1–5) to label and color

### Backend (`backend/src/`)
- **Express** server, entry point: `src/index.js` (no CORS or body parsing: the API is same-origin and read-only GET)
- **API routes:**
  - `GET /api/courses` — list all courses
  - `GET /api/courses/:id` — course with parts list
  - `GET /api/courses/:id/parts/:partId` — chapter Markdown content (read from disk)
  - `GET /api/troubleshooting` — support articles
  - `GET /api/search?q=keyword` — full-text search (in-memory index built at startup)
- **Course metadata:** `data/courseData.js` — single source of truth for course structure, each part references a `contentPath` to a Markdown file
- **Content files:** Markdown in `courses/` (mainline) and `side-courses/` (supplementary), named `{NN} {title}.md` or `{NN}-{title}.md`
- **Search:** `services/searchService.js` builds the index on startup from all course content. Prose and fenced code are indexed separately (code-only matches rank lower, so API names like `SDL_GetError` are searchable); whitespace-separated keywords are AND-matched. Tests live in `services/searchService.test.js`

### Data Flow

There are two distinct content delivery patterns:

**Course content (API-served):**
Frontend page → `fetch` call to `/api/courses/:id/parts/:partId` → backend reads Markdown file from disk → frontend renders with react-markdown

**Static info pages (directly served):**
`MarkdownPage` component fetches `/content/{file}.md` directly from `frontend/public/content/` — no backend involved. Used by About, Contact, and Collaborate pages (FAQ and Roadmap render from `data/`).

## Adding New Content

### New course chapter
1. Create Markdown file in `backend/src/courses/{course-name}/` following existing naming pattern
2. Add corresponding entry to the `parts` array in `backend/src/data/courseData.js` with `id`, `title`, `description`, and `contentPath`
3. The search index rebuilds automatically on server restart

### New static info page
1. Create Markdown file in `frontend/public/content/{slug}.md`
2. Create `frontend/src/pages/{Name}Page.tsx` using `<MarkdownPage title="..." description="..." contentUrl="/content/{slug}.md" />`
3. Register the route in `App.tsx` (lazy import + `<Route>`) and add it to `staticPages` in `scripts/generate-sitemap.js`
4. Add a link in `Footer.tsx` and/or relevant existing pages

## Conventions

- **Commit messages:** Chinese language, prefixed with type (feat:, fix:, refactor:)
- **Course categories:** `mainline` (primary curriculum) or `side` (supplementary)
- **Difficulty scale:** 1 (entry) through 5 (expert)
- **Content paths** in `courseData.js` are relative to the project root (e.g., `backend/src/courses/...`)
- **Deployment:** Push to `deploy` branch triggers GitHub Actions CI/CD (`.github/workflows/deploy.yml`): frontend and backend tests → build → rsync to the server → backend restart with a health check

## Agent Files

- `AGENTS.md` is a symlink to this file — both Claude Code and other agents read the same guidance.
- `SERVER.local.md` (gitignored, local only) documents the production server: SSH access,
  directory layout, systemd/nginx setup, and the deploy pipeline. **Read it before any
  server-side operation.** It is not in the repo; if it is missing, ask the user for it.
- `.env` (gitignored) holds the server IP / username / password. Passwordless SSH is configured
  as the host alias `cppgamedev`, so the password is rarely needed. Never copy credentials into
  tracked files or send them to external services.
