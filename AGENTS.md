# AGENTS.md — Repo guidance for AI coding agents

Purpose
- Provide concise, actionable guidance so AI coding agents can be productive immediately.

Quick run & dev commands
- Install dependencies: `npm install`
- Run development server (default port 3000): `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

Notes and conventions
- Framework: Next.js (App Router) with TypeScript. Primary source lives under `src/` and `app/`.
- API routes: `src/api/*.ts` contains client wrappers used by the frontend.
- UI: React + Tailwind; components live in `components/` and views in `views/`.
- State/hooks: look under `hooks/`, `contexts/`, and `components/ui/` for common patterns.
- Assets: static images are in `assets/images/`; global styles are in `src/index.css` and `postcss.config.mjs`.

Environment
- The project expects a `.env.local` for secrets. README.md calls out `GEMINI_API_KEY` as required for local dev.

Common pitfalls for agents
- Port collisions: the dev script binds to port 3000. To avoid conflicts, use `PORT=3001 npm run dev` or pass `-p` to Next, or free the port before starting.
- Do not duplicate documentation: link to existing docs. See README.md for run steps and project overview.
- Keep changes minimal and focused; update AGENTS.md rather than expanding README content.

Relevant files to reference
- [package.json](package.json) — scripts and deps
- [README.md](README.md) — setup and env notes
- [next.config.ts](next.config.ts) — Next.js config

If you'd like, I can add more targeted instructions (linting rules, CI hooks, or a `copilot-instructions.md`).
