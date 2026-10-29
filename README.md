# Portfolio — Backend

REST API and admin CMS for the portfolio, built with **Next.js 16** route handlers,
**Drizzle ORM** and **libSQL/SQLite** (Turso in production).

It serves all content to the
[portfolio frontend](https://github.com/mukeshyadav2060/portfolio-frontend), hosts the admin
panel at `/admin`, stores contact messages, handles file uploads and pulls GitHub activity.

## Features

- Admin CMS at `/admin` for profile, projects, experience, services, skills, posts and messages
- Public read API under `/api/v1`
- Contact endpoint with Zod validation, per-visitor rate limiting, hashed IPs and optional
  email forwarding through Resend
- On-demand revalidation: every admin edit tells the frontend exactly which pages to refresh
- GitHub integration: repositories and the contribution calendar
- Search engines are kept out with `X-Robots-Tag: noindex` on everything except `/uploads/`

## Requirements

- Node.js 20.9 or newer

## Getting started

```bash
npm install
cp .env.example .env.local    # set ADMIN_PASSWORD and AUTH_SECRET at minimum
npm run setup                 # create the database and seed content
npm run dev                   # http://localhost:4000  ·  admin at /admin
```

Locally, the database is a SQLite file at `data/portfolio.db` and uploads go to
`data/uploads/`. Both are git-ignored.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | `file:./data/portfolio.db` locally, `libsql://<db>-<org>.turso.io` in production |
| `DATABASE_AUTH_TOKEN` | Production | Turso database token |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password. Never leave it as `change-me`. |
| `AUTH_SECRET` | Yes | 32+ random characters for signing session cookies |
| `ADMIN_API_TOKEN` | No | Bearer token for scripts or CI calling the admin API |
| `CORS_ORIGINS` | Yes | Comma-separated origins allowed to call the API from a browser |
| `FRONTEND_URL` | Yes | Frontend base URL, where revalidation webhooks are sent |
| `REVALIDATE_SECRET` | Yes | Shared with the frontend. Must match exactly. |
| `PUBLIC_URL` | Yes | Public URL of this backend, used to build absolute upload URLs |
| `UPLOAD_DIR` | No | Upload directory (default `./data/uploads`) |
| `GITHUB_TOKEN` | No | Enables the contribution calendar. A classic token with `read:user` covers public activity; add `repo` to include private work. |
| `RESEND_API_KEY` | No | Forward contact messages by email |
| `CONTACT_NOTIFY_EMAIL` | No | Where forwarded contact messages go |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 4000 |
| `npm run build` / `npm run start` | Production build and server |
| `npm run db:generate` | Generate a migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations in `drizzle/` to `DATABASE_URL` |
| `npm run db:seed` | Seed content (`-- --force` re-seeds over existing data) |
| `npm run setup` | Migrate and seed |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks |

## API

`GET /api/v1` returns the full list of endpoints.

- **Public:** `site`, `profile`, `projects`, `projects/:slug`, `experience`, `services`,
  `skills`, `posts`, `posts/:slug`, `github`, `POST contact`
- **Admin** (session cookie, or `Authorization: Bearer $ADMIN_API_TOKEN`): `login`, `logout`,
  `profile`, `:resource` and `:resource/:id` for `projects | experience | services | skills | posts`,
  `messages`, `upload`, `stats`
- Responses are `{ data }` on success and `{ error: { message, details } }` on failure.
  Validation errors return 422 with per-field details.

## Deploying to Vercel

1. **Database.** Create a [Turso](https://turso.tech) database. SQLite files do not persist
   on Vercel. Then run the migrations and seed against it from your machine:

   ```bash
   DATABASE_URL=libsql://<db>-<org>.turso.io DATABASE_AUTH_TOKEN=<token> npm run setup
   ```

2. **Import** this repository in Vercel. The framework preset is **Next.js** and the default
   build settings work as they are.
3. **Environment variables.** Add the variables above. In production `FRONTEND_URL` and
   `CORS_ORIGINS` are the frontend's URL and `PUBLIC_URL` is this backend's URL.
4. **Uploads.** `/api/v1/admin/upload` writes to the local disk, and Vercel's file system
   is temporary. Files uploaded on Vercel disappear. Before uploading images in production,
   switch the upload route (`src/app/api/v1/admin/upload/route.ts`) to object storage such as
   Vercel Blob, S3 or Cloudflare R2.

## Project structure

```
src/
  app/admin/      admin CMS
  app/api/v1/     public and admin API routes
  app/uploads/    serves uploaded files
  db/             Drizzle schema and client
  lib/            env, auth, HTTP helpers
  proxy.ts        CORS and admin route protection
drizzle/          SQL migrations
scripts/          migrate and seed scripts
```
