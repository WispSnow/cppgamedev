# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese-language C++ game development tutorial website (cppgamedev.top). Full-stack app with React frontend and Express backend. Course content is stored as Markdown files served via API.

## Development Commands

```bash
# Install all dependencies (run from root, then each subdirectory)
npm install && cd frontend && npm install && cd ../backend && npm install

# Start backend dev server (port 5001, auto-reloads with nodemon)
cd backend && npm run dev

# Start frontend dev server (port 3000, proxies API to localhost:5001)
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build

# Run frontend tests
cd frontend && npm test
```

Both servers must run simultaneously for local development. Frontend proxies `/api/*` requests to backend via the `proxy` field in `frontend/package.json`.

## Architecture

### Frontend (`frontend/src/`)
- **React 19 + TypeScript** with Create React App
- **Styling:** styled-components (CSS-in-JS), theme via CSS variables and `ThemeContext`
- **Routing:** React Router v7 — routes defined in `App.tsx`
- **Markdown rendering pipeline:** `react-markdown` + `rehype-raw` + `remark-gfm` + `react-syntax-highlighter` (Prism)
- **API calls:** axios via service files in `services/` (`courseService.ts`, `troubleshootingService.ts`, `storageService.ts`)
- **Comments:** Giscus integration configured in `config/giscus.ts`
- **Static data:** `data/roadmapData.ts` (roadmap), `data/faqData.ts` (FAQ)

### Backend (`backend/src/`)
- **Express** server, entry point: `src/index.js`
- **API routes:**
  - `GET /api/courses` — list all courses
  - `GET /api/courses/:id` — course with parts list
  - `GET /api/courses/:id/parts/:partId` — chapter Markdown content (read from disk)
  - `GET /api/troubleshooting` — support articles
  - `GET /api/search?q=keyword` — full-text search (in-memory index built at startup)
- **Course metadata:** `data/courseData.js` — single source of truth for course structure, each part references a `contentPath` to a Markdown file
- **Content files:** Markdown in `courses/` (mainline) and `side-courses/` (supplementary), named `{NN} {title}.md` or `{NN}-{title}.md`
- **Search:** `services/searchService.js` builds index on startup from all course content

### Data Flow
Frontend page → axios call to `/api/courses/:id/parts/:partId` → backend reads Markdown file from disk → frontend renders with react-markdown

## Adding New Content

1. Create Markdown file in `backend/src/courses/{course-name}/` following existing naming pattern
2. Add corresponding entry to the `parts` array in `backend/src/data/courseData.js` with `id`, `title`, `description`, and `contentPath`
3. The search index rebuilds automatically on server restart

## Conventions

- **Commit messages:** Chinese language, prefixed with type (feat:, fix:, refactor:)
- **Course categories:** `mainline` (primary curriculum) or `side` (supplementary)
- **Difficulty scale:** 1 (entry) through 5 (expert)
- **Content paths** in `courseData.js` are relative to the project root (e.g., `backend/src/courses/...`)
- **Deployment:** Push to `deploy` branch triggers GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
