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
| `UPLOAD_DIR` | No | Local upload directory (default `./data/uploads`), used when Blob is not set |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob token. When set, uploads go to Blob. Added automatically when you connect a Blob store to the Vercel project. |
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
| `npm run db:push-local` | Copy the local database to Turso and its uploaded files to Vercel Blob, rewriting file URLs. Replaces all content in the target. |
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

   If you already have content in a local database, copy it across instead of seeding:
   run `npm run db:migrate`, then `npm run db:push-local` (needs the Blob token from step 4).

2. **Import** this repository in Vercel. The framework preset is **Next.js** and the default
   build settings work as they are.
3. **Environment variables.** Add the variables above. In production `FRONTEND_URL` and
   `CORS_ORIGINS` are the frontend's URL and `PUBLIC_URL` is this backend's URL.
4. **Uploads.** In the Vercel project, open **Storage → Create → Blob**, choose public access
   and connect it to this project. That adds `BLOB_READ_WRITE_TOKEN`, and uploads then go to
   Blob. Vercel's own file system is temporary, so uploads would otherwise be lost.
5. **Region.** Set **Settings → Functions → Function Region** to the region closest to the
   Turso database.
6. **Keep-alive.** `vercel.json` runs a daily cron job that calls `/api/health`. That runs a
   query, which stops Turso's free plan from archiving the database when the site is quiet.

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
