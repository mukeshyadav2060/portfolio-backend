/**
 * Seeds the portfolio content from Mukesh Kumar Yadav's CV. Everything here can be edited
 * afterwards in the admin panel; re-seeding overwrites those edits.
 *
 *   npm run db:seed            – seeds only when the database is empty
 *   npm run db:seed -- --force – wipes content tables (not messages) and re-seeds
 */
import { createClient } from "@libsql/client";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/portfolio.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
const db = drizzle(client, { schema });
const force = process.argv.includes("--force");

const [{ n }] = await db.select({ n: count() }).from(schema.profile);
if (n > 0 && !force) {
  console.log("Database already has content. Use --force to reset and re-seed.");
  process.exit(0);
}

if (force) {
  for (const table of [schema.projects, schema.experience, schema.services, schema.skills, schema.posts, schema.profile]) {
    await db.delete(table);
  }
}

await db.insert(schema.profile).values({
  id: 1,
  name: "Mukesh Kumar Yadav",
  handle: "mukesh-yadav",
  role: "Full Stack Developer",
  headline: "I build fast, living interfaces.",
  heroWords: ["Next.js", "React", "TypeScript", "Node.js", "technical SEO"],
  intro:
    "Full stack developer shipping production Next.js sites: server-rendered, API-driven and fast enough to score 99 on Lighthouse.",
  about: `I'm a full stack developer in Kathmandu with a year of production experience building Next.js sites for a press release distribution agency. I joined EasyPRwire as an intern and was promoted to full-time after three months.

Today I build and maintain frontend features and API integrations across the company's four production websites. I built most of easyprwire.com, a 35+ route Next.js platform with a newsroom, Stripe payments and order tracking, and raised its desktop Lighthouse performance from 60–70 to 99.

My strongest ground is React and Next.js, API integration, web performance and technical SEO: Core Web Vitals, canonicals, sitemaps and structured data. Outside work I build full-stack side projects, from an e-commerce CMS on Supabase to a Real-ESRGAN image enhancer I fine-tuned and served with FastAPI.`,
  location: "Kathmandu, Nepal",
  timezone: "Asia/Kathmandu",
  email: "mukeshyadav2060@gmail.com",
  phone: "+977 9818932039",
  availability: "Full-time at EasyPRwire; open to freelance projects and new conversations.",
  availableForWork: true,
  githubUsername: "mukeshyadav2060",
  socials: [
    { label: "GitHub", url: "https://github.com/mukeshyadav2060" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/mukesh-yadav-331668370/" },
  ],
  stats: [
    { label: "Shipping production Next.js", value: "1+ yr" },
    { label: "Production sites maintained", value: "4" },
    { label: "Desktop Lighthouse on easyprwire.com", value: "99" },
  ],
  education: [
    {
      degree: "B.E. in Computer Engineering",
      school: "Kathford International College of Engineering and Management",
      location: "Kathmandu, Nepal",
      year: "2026",
    },
  ],
  certifications: [
    {
      name: "AWS Cloud Quest: Cloud Practitioner",
      issuer: "AWS",
      date: "Sep 2026",
      url: "https://www.credly.com/badges/d44b20de-f3ee-4c81-af7b-07e90ba8b377/public_url",
    },
    {
      name: "AWS Academy Cloud Foundations",
      issuer: "AWS Academy",
      date: "Jul 2025",
      url: "https://www.credly.com/badges/bbff2581-cad9-4aee-855a-88606a051575/public_url",
    },
  ],
  accent: "#c6ff3d",
  seoTitle: "Mukesh Kumar Yadav — Full Stack Developer in Kathmandu",
  seoDescription:
    "Mukesh Kumar Yadav is a full stack developer in Kathmandu, Nepal, building fast, server-rendered Next.js and React sites, REST APIs and technical SEO.",
  seoKeywords: [
    "Mukesh Kumar Yadav",
    "Mukesh Yadav developer",
    "full stack developer Nepal",
    "Next.js developer Kathmandu",
    "React developer Nepal",
    "freelance web developer Nepal",
    "technical SEO developer",
  ],
  alternateNames: ["Mukesh Yadav", "mukeshyadav2060"],
});

await db.insert(schema.services).values([
  {
    title: "Next.js product sites",
    summary: "Server-rendered Next.js sites built from wireframes to production, with content, payments and support flows wired to real APIs.",
    points: ["App Router and Pages Router, SSR and ISR", "CMS-driven pages (Sanity, headless APIs)", "Stripe payments and order tracking", "Responsive, component-based UI in Tailwind CSS"],
    sortOrder: 1,
  },
  {
    title: "APIs and integrations",
    summary: "REST APIs and the integrations around them, validated and secured so the frontend can trust what it receives.",
    points: ["Node.js, Express and FastAPI", "Zod validation, signed sessions, rate limiting", "Supabase, MongoDB and Firebase", "Stripe, Resend, Cloudinary and NextAuth"],
    sortOrder: 2,
  },
  {
    title: "Performance and technical SEO",
    summary: "Making existing sites fast and findable: measured with Lighthouse, fixed at the rendering and indexing level.",
    points: ["Core Web Vitals: LCP, FCP, font loading", "Canonicals, redirects and sitemap coverage", "Structured data and Open Graph", "Dependency scanning with Trivy in CI"],
    sortOrder: 3,
  },
]);

// Case studies from the project write-ups. Images are uploaded in the admin and aren't seeded.
await db.insert(schema.projects).values([
  {
    slug: "easyprwire",
    title: "EasyPRwire",
    summary: "The main platform for a press release distribution agency. Customers browse packages, pay, submit their release and track its distribution, all in one Next.js app.",
    content: `## The problem

The site was slow, especially on mobile, and customers had no single place to pay, submit their press release, follow its progress and get help.

## My role

I joined as an intern and became the main developer on a live, revenue-generating site. Every change had to ship without breaking checkout or SEO rankings, while working against a backend owned by another team.

## What I built

- Most of the platform, starting with a reusable component library
- API-driven pages, plus the newsroom and blog
- Stripe checkout
- A multi-step order-tracking wizard with file uploads and revision requests
- A support-ticket system linked to orders
- CSV and XLSX report exports

## Key decisions

- Moved key pages to server-side rendering to cut client-side JavaScript and improve load speed.
- Replaced the xlsx package with exceljs to fix a known vulnerability without losing export features.
- Added Trivy vulnerability scanning to the GitHub Actions pipeline and fixed the high-severity issues it reported.

## Results

Desktop Lighthouse went from 60–70 to 99, and mobile from 40–50 to 75. Customers can now complete the whole journey on the site, from purchase to delivery.`,
    role: "Primary Frontend / Full Stack Developer (intern → full-time)",
    client: "EasyPRwire",
    year: "2025–2026",
    category: "Web platform / E-commerce",
    status: "production",
    stack: ["Next.js", "React", "Tailwind CSS", "Stripe", "REST APIs", "Docker", "GitHub Actions", "Trivy"],
    metrics: [
      { label: "Desktop Lighthouse", value: "60–70 → 99" },
      { label: "Mobile Lighthouse", value: "40–50 → 75" },
      { label: "Routes", value: "35+" },
      { label: "Share of commits", value: "~75%" },
    ],
    liveUrl: "https://easyprwire.com",
    accent: "#2FC4A7",
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    slug: "linkible",
    title: "Linkible.io",
    summary: "Marketing and ordering site for a link-building agency, with service and case-study content driven by a CMS, and Stripe payments.",
    content: `## The problem

Content changed often and had to update without a developer, while staying fast and indexable in the Docker production setup.

## My role

I took over an existing codebase and became its main frontend developer, extending it without rewriting what was already there.

## What I built

- Dynamic pages driven by CMS content
- Stripe payment and payment-status flows
- Most-viewed lists with view-count tracking for blogs and case studies
- Team verification
- Responsive fixes across the site

## Key decisions

- Chose between ISR (\`revalidate: 60\`) and dynamic rendering page by page, so content stayed fresh in the Docker deployment.
- Kept payment status in session storage so confirmation pages work correctly after the redirect back from Stripe.
- Fixed heading levels (for example, FAQ questions as H3) to improve the page structure search engines read.

## Results

The site is in production, and content updates no longer need code changes.`,
    role: "Frontend Developer (main frontend developer since Jan 2026)",
    client: "Linkible",
    year: "2026",
    category: "Marketing site / E-commerce",
    status: "production",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Headless CMS", "Stripe", "Docker"],
    metrics: [
      { label: "Share of commits since joining", value: "~60%" },
      { label: "Page routes", value: "20+" },
    ],
    liveUrl: "https://linkible.io",
    accent: "#3C2DF1",
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    slug: "settl-chat",
    title: "Settl.chat",
    summary: "Marketing website for Settl, a fintech product that automates loan repayment collection over WhatsApp.",
    content: `## The problem

The new product needed a public website to explain the offer, show pricing and collect leads.

## My role

I started the project and built the first production version. The product was renamed during the build (ARCredit → Settl), so content and branding had to be easy to update.

## What I built

- Every page: home, pricing, about, contact and legal
- A contact form that sends automated emails through Resend
- A homepage stats section, client logos and a data protection policy
- On the separate admin dashboard: password reset, form validation, billing packages, and charts that show amounts in lakh and crore

## Key decisions

- Made the backend API optional, so the contact form keeps working through Resend even when the API is down.
- Restructured pages into reusable components, which made the rebrand and the later redesign quick.

## Results

Launched the first version of the site; it later became the base for a teammate's visual redesign.`,
    role: "Frontend Developer (built the landing page; contributed to the dashboard)",
    client: "Settl",
    year: "2026",
    category: "Landing page / Fintech",
    status: "production",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Resend", "Motion"],
    metrics: [
      { label: "Built from scratch", value: "First commit → all pages" },
      { label: "Share of commits", value: "~46%" },
    ],
    liveUrl: "https://settl.chat",
    accent: "#45D367",
    featured: true,
    published: true,
    sortOrder: 3,
  },
  {
    slug: "mini2k",
    title: "mini2k",
    summary: "Full-stack e-commerce storefront with a mobile-first admin CMS and proper social-media link previews for a single-page app.",
    content: `## The problem

Single-page apps show blank link previews when shared on WhatsApp or Facebook, and the shop owner needed to manage the store from a phone.

## My role

I built and deployed everything myself, on Vercel serverless functions.

## What I built

- The storefront
- A 10-module admin CMS
- A content manager with 30+ dynamic fields
- A layer that detects social-media crawlers at the edge and serves them server-rendered Open Graph previews

## Key decisions

- Detected crawlers in edge middleware instead of moving the whole app to server-side rendering.
- Used HMAC-SHA256 signed session cookies, IP rate limiting with 15-minute lockouts, and audit logs for admin actions.
- Validated input with shared Zod schemas on every endpoint.

## Results

Shared links show a rich preview on 20+ platforms, and the admin is fully usable on a phone.`,
    role: "Solo developer",
    year: "",
    category: "Full Stack / E-commerce",
    status: "production",
    stack: ["React 19", "TypeScript", "Express", "Supabase (PostgreSQL)", "Vercel Edge Middleware", "Zod", "Cloudinary", "Tailwind CSS"],
    metrics: [
      { label: "REST endpoints secured", value: "35" },
      { label: "Admin CMS modules", value: "10" },
      { label: "Social crawlers detected", value: "20+" },
    ],
    liveUrl: "https://mini2k.vercel.app/",
    repoUrl: "https://github.com/mukeshyadav2060/jewelry-shop",
    accent: "#ffb020",
    featured: true,
    published: true,
    sortOrder: 4,
  },
  {
    slug: "announce-chain",
    title: "Announce Chain",
    summary: "Marketing website for a press release distribution company, with content from Sanity CMS and dynamic service and industry pages.",
    content: `## The problem

The company needed a fast site that ranks well in search and that the marketing team can update without a developer.

## My role

Part-time contributor on a small team, working alongside a full-time job.

## What I built

- The homepage, and the service and industry pages
- The blog's table of contents and content layout
- Pricing-package modals
- The SEO setup: redirects, sitemap, robots.txt and Open Graph images

## Key decisions

- Added permanent redirects for changed URLs so existing search rankings weren't lost.

## Results

A live site with structured metadata and a sitemap that covers every page.`,
    role: "Frontend Developer (part-time)",
    client: "Announce Chain",
    year: "2025–2026",
    category: "Marketing site",
    status: "production",
    stack: ["Next.js 16", "React 19", "Tailwind CSS 4", "Sanity CMS"],
    metrics: [],
    liveUrl: "https://announcechain.com",
    accent: "#2E5BFF",
    featured: false,
    published: true,
    sortOrder: 5,
  },
  {
    slug: "ai-image-enhancer",
    title: "AI Image Enhancer",
    summary: "Full-stack web app that upscales images 4× with a Real-ESRGAN model I trained, and still runs on a server without a GPU.",
    content: `## The problem

Super-resolution models need a lot of GPU memory and a heavy PyTorch install, which makes them expensive to host.

## My role

I led the team and built the whole pipeline (model training, the inference API and the web app) and deployed it with limited compute.

## What I built

- Trained the Real-ESRGAN model and exported it to ONNX Runtime
- A FastAPI inference service that processes images in tiles
- A Next.js frontend with a before/after slider, canvas editing, Firebase Auth and signed Cloudinary uploads

## Key decisions

- Exported to ONNX so the server can run on CPU without PyTorch.
- Processed images in overlapping 192px tiles to cap memory use without visible seams between tiles.
- Signed uploads on the server so API keys never reach the browser.

## Results

Peak VRAM dropped from ~5 GB to ~200 MB, and the app runs on CPU servers.`,
    role: "Team Lead; built the model, backend and frontend",
    year: "",
    category: "AI / Full Stack",
    status: "open-source",
    stack: ["PyTorch", "Real-ESRGAN", "ONNX Runtime", "FastAPI", "Next.js 16", "React 19", "TypeScript", "Docker", "Firebase", "Cloudinary"],
    metrics: [
      { label: "Peak VRAM", value: "~5 GB → ~200 MB" },
      { label: "Upscaling", value: "4×" },
    ],
    repoUrl: "https://github.com/mukeshyadav2060/image-enhancer",
    accent: "#6ee7ff",
    featured: false,
    published: true,
    sortOrder: 6,
  },
  {
    slug: "mediax",
    title: "mediaX.agency",
    summary: "Performance and indexing work on a production agency site: desktop Lighthouse from the low 60s to 90+.",
    content: `## The problem

A slow site with search indexing issues.

## What I did

- Optimised Core Web Vitals (LCP, FCP, font loading), raising desktop Lighthouse performance from the low 60s to 90+.
- Fixed search indexing issues: canonicals, redirects and sitemap coverage.`,
    role: "Full Stack Developer",
    client: "EasyPRwire",
    year: "2026",
    category: "Performance + SEO",
    status: "production",
    stack: ["Next.js", "Core Web Vitals", "Technical SEO"],
    metrics: [
      { label: "Desktop Lighthouse", value: "60s → 90+" },
    ],
    liveUrl: "https://mediax.agency/",
    accent: "#ff9ad5",
    featured: false,
    published: true,
    sortOrder: 7,
  },
  {
    slug: "eventpass",
    title: "EventPass",
    summary: "Event discovery and booking platform with Stripe payments and role-based access.",
    content: `## The problem

The starter project had no payments or access control, and it ran one database query per event.

## My role

I extended a course starter project with production features; the stack was fixed by the starter.

## What I built

- Stripe Checkout with signed webhook verification
- Price checks on the server
- Role-based access control with NextAuth v5
- Query optimisation

## Key decisions

- Checked prices on the server against the database so clients can't tamper with them.
- Replaced one query per event with a single MongoDB \`$lookup\` aggregation.
- Added a unique compound index on \`(eventId, email)\` to block duplicate bookings.

## Results

Secure payments, and event lists load with a single query.`,
    role: "Solo developer (extended from a course starter project)",
    year: "",
    category: "Full Stack",
    status: "production",
    stack: ["Next.js 16", "TypeScript", "MongoDB", "NextAuth v5", "Stripe", "Cloudinary", "PostHog"],
    metrics: [
      { label: "Event-list queries", value: "N → 1" },
      { label: "Duplicate bookings", value: "Blocked at the database level" },
    ],
    liveUrl: "https://dev-events-sepia.vercel.app/",
    repoUrl: "https://github.com/mukeshyadav2060/dev-events",
    accent: "#ffd84d",
    featured: false,
    published: true,
    sortOrder: 8,
  },
]);

await db.insert(schema.experience).values([
  {
    company: "EasyPRwire",
    role: "Full Stack Developer",
    location: "Kathmandu, Nepal (On-site)",
    employmentType: "Full-time",
    startDate: "2026-03",
    endDate: null,
    summary: "Promoted from intern after three months. I build and maintain frontend features and API integrations across the company's four production websites.",
    highlights: [
      "Built most of easyprwire.com (35+ routes) and raised its desktop Lighthouse performance from 60–70 to 99 through server-side rendering",
      "Raised mediaX.agency from the low 60s to 90+ on desktop Lighthouse and fixed its search indexing issues",
      "Main frontend developer on linkible.io: CMS-driven pages, Stripe flows and ISR vs. dynamic rendering for a Docker deployment",
      "Built settl.chat from scratch in Next.js 16 with an automated Resend contact flow",
      "Fixed high-severity dependency vulnerabilities flagged by Trivy scans in CI",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe", "Docker"],
    url: "https://easyprwire.com/",
    sortOrder: 1,
  },
  {
    company: "EasyPRwire",
    role: "Full Stack Developer Intern",
    location: "Kathmandu, Nepal (On-site)",
    employmentType: "Internship",
    startDate: "2025-12",
    endDate: "2026-02",
    summary: "Turned easyprwire.com from static pages into an API-driven site.",
    highlights: [
      "Built a reusable component library for easyprwire.com",
      "Replaced static content with backend APIs, including dynamic routing and API-driven page layouts",
      "Shipped a support-ticket system, downloadable sample reports and table-of-contents navigation for long-form content",
    ],
    stack: ["Next.js", "React", "REST APIs"],
    url: "https://easyprwire.com/",
    sortOrder: 2,
  },
  {
    company: "Announce Chain",
    role: "Frontend Developer",
    location: "Kathmandu, Nepal",
    employmentType: "Part-time",
    startDate: "2025-07",
    endDate: "2025-12",
    summary: "Press release distribution.",
    highlights: ["Built pages for the company's Next.js 16 marketing site from Sanity CMS content", "Set up redirects, the sitemap and Open Graph metadata"],
    stack: ["Next.js 16", "Sanity CMS"],
    sortOrder: 3,
  },
]);

// Levels are self-assessed starting points; adjust them in the admin panel.
const skill = (category: string, names: string[], level: number) =>
  names.map((name, i) => ({ name, category, level: Math.max(60, level - i * 3), sortOrder: i }));

await db.insert(schema.skills).values([
  ...skill("Frontend", ["Next.js", "React", "Tailwind CSS", "Server-side rendering", "Responsive design"], 90),
  ...skill("Languages", ["JavaScript", "TypeScript", "HTML & CSS", "Python", "SQL"], 88),
  ...skill("Backend & data", ["Node.js", "Express", "REST APIs", "Supabase", "MongoDB", "FastAPI", "Firebase", "Zod"], 84),
  ...skill("SEO & performance", ["Lighthouse", "Core Web Vitals", "Structured data", "Sitemaps", "Open Graph"], 88),
  ...skill("Tools", ["Git & GitHub", "Vercel", "Stripe", "Docker", "GitHub Actions", "NextAuth", "Cloudinary", "PostHog", "Trivy"], 84),
]);

// Draft posts: not shown on the site until written and published from the admin panel.
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString();
await db.insert(schema.posts).values([
  {
    slug: "from-70-to-99-on-lighthouse",
    title: "From 70 to 99 on Lighthouse with server-side rendering",
    excerpt: "Draft: what moved the needle on easyprwire.com.",
    content: "Draft — write this up from the easyprwire.com performance work.",
    tags: ["Performance", "Next.js"],
    published: false,
    publishedAt: daysAgo(1),
  },
  {
    slug: "og-previews-for-a-single-page-app",
    title: "Open Graph previews for a single-page app",
    excerpt: "Draft: serving crawlers server-rendered previews from Vercel Edge Middleware.",
    content: "Draft — write this up from the mini2k crawler-detection work.",
    tags: ["SEO", "Edge"],
    published: false,
    publishedAt: daysAgo(1),
  },
]);

console.log("✓ content seeded from CV");
client.close();
