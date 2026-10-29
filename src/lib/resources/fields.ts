/**
 * Admin form definitions. Client-safe (no database imports): the admin UI renders forms
 * from these, and the server registry pairs each resource with its table and validator.
 */
export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "list"
  | "metrics"
  | "links"
  | "image"
  | "images"
  | "date"
  | "month"
  | "select"
  | "color"
  | "entries";

export type SubField = { name: string; label: string; placeholder?: string; required?: boolean };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: string[];
  /** For `entries`: the columns of each repeatable row. */
  subfields?: SubField[];
  /** Spans the full form width. */
  wide?: boolean;
  /** Starts a new titled group of fields. */
  section?: string;
  /** Ideal character range; the form shows a live count against it. */
  length?: [number, number];
};

export type ResourceConfig = {
  label: string;
  singular: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  columns: { name: string; label: string; type?: "boolean" | "date" | "text" }[];
  fields: Field[];
};

export const resourceConfigs = {
  projects: {
    label: "Projects",
    singular: "Project",
    description: "Case studies shown in the Work section and on /work/[slug].",
    titleField: "title",
    subtitleField: "summary",
    columns: [
      { name: "title", label: "Title" },
      { name: "year", label: "Year" },
      { name: "status", label: "Status" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true, help: "Used in the URL: /work/<slug>" },
      { name: "summary", label: "Summary", type: "textarea", required: true, wide: true, help: "One or two sentences." },
      { name: "content", label: "Case study", type: "markdown", wide: true },
      { name: "role", label: "Your role", type: "text" },
      { name: "client", label: "Client", type: "text" },
      { name: "year", label: "Year", type: "text", placeholder: "2025" },
      { name: "category", label: "Category", type: "text", placeholder: "Web app" },
      { name: "status", label: "Status", type: "select", options: ["production", "open-source", "in-progress", "archived", "concept"] },
      { name: "accent", label: "Accent colour", type: "color" },
      { name: "stack", label: "Stack", type: "list", help: "One per line." },
      { name: "metrics", label: "Outcomes", type: "metrics", help: "Real, verifiable numbers only." },
      { name: "coverImage", label: "Cover image", type: "image", wide: true },
      { name: "gallery", label: "Gallery", type: "images", wide: true },
      { name: "liveUrl", label: "Live URL", type: "text" },
      { name: "repoUrl", label: "Repository URL", type: "text" },
      { name: "featured", label: "Featured on home page", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "seoTitle", label: "SEO title", type: "text", wide: true, section: "Search & social", length: [30, 60], help: "50–60 characters. Leave empty to use the project title." },
      { name: "seoDescription", label: "SEO description", type: "textarea", wide: true, length: [120, 160], help: "140–160 characters shown in Google results. Leave empty to use the summary." },
      { name: "seoKeywords", label: "SEO keywords", type: "list", help: "One per line. Also used as article tags." },
      { name: "ogImage", label: "Social share image", type: "image", wide: true, help: "1200×630. Leave empty for a generated card." },
    ],
  },
  experience: {
    label: "Experience",
    singular: "Role",
    description: "Career timeline, newest first by sort order.",
    titleField: "role",
    subtitleField: "company",
    columns: [
      { name: "role", label: "Role" },
      { name: "company", label: "Company" },
      { name: "startDate", label: "Start" },
      { name: "endDate", label: "End" },
    ],
    fields: [
      { name: "role", label: "Role", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "url", label: "Company URL", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "employmentType", label: "Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"] },
      { name: "startDate", label: "Start", type: "month", required: true },
      { name: "endDate", label: "End", type: "month", help: "Leave empty for a current role." },
      { name: "summary", label: "Summary", type: "textarea", wide: true },
      { name: "highlights", label: "Highlights", type: "list", wide: true, help: "One achievement per line." },
      { name: "stack", label: "Stack", type: "list" },
      { name: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  services: {
    label: "Services",
    singular: "Service",
    description: "The stacked “What I do” cards.",
    titleField: "title",
    subtitleField: "summary",
    columns: [
      { name: "title", label: "Title" },
      { name: "sortOrder", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true, wide: true },
      { name: "points", label: "Points", type: "list", wide: true, help: "One per line." },
      { name: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  skills: {
    label: "Skills",
    singular: "Skill",
    description: "Grouped by category on the site.",
    titleField: "name",
    subtitleField: "category",
    columns: [
      { name: "name", label: "Name" },
      { name: "category", label: "Category" },
      { name: "level", label: "Level" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true, placeholder: "Frontend" },
      { name: "level", label: "Proficiency (0–100)", type: "number" },
      { name: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  posts: {
    label: "Writing",
    singular: "Post",
    description: "Blog posts in Markdown.",
    titleField: "title",
    subtitleField: "excerpt",
    columns: [
      { name: "title", label: "Title" },
      { name: "publishedAt", label: "Published", type: "date" },
      { name: "published", label: "Live", type: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { name: "content", label: "Content", type: "markdown", wide: true },
      { name: "coverImage", label: "Cover image", type: "image", wide: true },
      { name: "tags", label: "Tags", type: "list" },
      { name: "publishedAt", label: "Publish date", type: "date" },
      { name: "published", label: "Published", type: "boolean" },
      { name: "seoTitle", label: "SEO title", type: "text", wide: true, section: "Search & social", length: [30, 60], help: "50–60 characters. Leave empty to use the post title." },
      { name: "seoDescription", label: "SEO description", type: "textarea", wide: true, length: [120, 160], help: "140–160 characters shown in Google results. Leave empty to use the excerpt." },
      { name: "seoKeywords", label: "SEO keywords", type: "list", help: "One per line. Also used as article tags." },
      { name: "ogImage", label: "Social share image", type: "image", wide: true, help: "1200×630. Leave empty for a generated card." },
    ],
  },
} satisfies Record<string, ResourceConfig>;

export type ResourceName = keyof typeof resourceConfigs;
export const resourceNames = Object.keys(resourceConfigs) as ResourceName[];
export const isResourceName = (v: string): v is ResourceName => v in resourceConfigs;

export const profileFields: Field[] = [
  { name: "name", label: "Full name", type: "text", required: true },
  { name: "handle", label: "Handle", type: "text", required: true, help: "Shown as the wordmark: ~/handle" },
  { name: "role", label: "Role", type: "text", required: true },
  { name: "location", label: "Location", type: "text" },
  { name: "timezone", label: "Time zone (IANA)", type: "text", placeholder: "Asia/Kathmandu" },
  { name: "headline", label: "Hero headline", type: "text", required: true, wide: true, help: "Keep it under ~40 characters." },
  { name: "heroWords", label: "Rotating words", type: "list", help: "Cycled after the role in the hero." },
  { name: "intro", label: "Intro sentence", type: "textarea", required: true, wide: true },
  { name: "about", label: "About", type: "markdown", wide: true },
  { name: "availability", label: "Availability note", type: "text", wide: true },
  { name: "availableForWork", label: "Available for work", type: "boolean" },
  { name: "email", label: "Email", type: "text", required: true },
  { name: "phone", label: "Phone", type: "text" },
  { name: "githubUsername", label: "GitHub username", type: "text", help: "Powers the live activity section." },
  { name: "accent", label: "Accent colour", type: "color" },
  { name: "avatarUrl", label: "Portrait", type: "image", wide: true },
  { name: "resumeUrl", label: "CV / résumé (PDF)", type: "image", wide: true, help: "Upload a PDF or paste a URL." },
  { name: "socials", label: "Social links", type: "links", wide: true },
  { name: "stats", label: "Hero facts", type: "metrics", wide: true, help: "Real facts only, e.g. “5+ years”." },
  {
    name: "education",
    label: "Education",
    type: "entries",
    wide: true,
    subfields: [
      { name: "degree", label: "Degree", placeholder: "B.E. in Computer Engineering", required: true },
      { name: "school", label: "School", required: true },
      { name: "location", label: "Location" },
      { name: "year", label: "Year", placeholder: "2026", required: true },
    ],
  },
  {
    name: "certifications",
    label: "Certifications",
    type: "entries",
    wide: true,
    subfields: [
      { name: "name", label: "Name", required: true },
      { name: "issuer", label: "Issuer", placeholder: "AWS" },
      { name: "date", label: "Date", placeholder: "Sep 2026", required: true },
      { name: "url", label: "Credential URL", placeholder: "https://" },
    ],
  },
  { name: "seoTitle", label: "SEO title", type: "text", wide: true, section: "Search & social", length: [30, 60], help: "Home page title, 50–60 characters. Lead with your name and role." },
  { name: "seoDescription", label: "SEO description", type: "textarea", wide: true, length: [120, 160], help: "Home page description, 140–160 characters." },
  { name: "seoKeywords", label: "SEO keywords", type: "list", help: "One per line, e.g. “Next.js developer Nepal”." },
  { name: "alternateNames", label: "Also known as", type: "list", help: "Name variants people search for, one per line." },
  { name: "ogImage", label: "Social share image", type: "image", wide: true, help: "1200×630. Leave empty for a generated card." },
  { name: "twitterHandle", label: "X / Twitter handle", type: "text", placeholder: "@handle" },
  { name: "googleVerification", label: "Google Search Console code", type: "text", help: "The content value of the google-site-verification meta tag." },
  { name: "bingVerification", label: "Bing Webmaster code", type: "text", help: "The content value of the msvalidate.01 meta tag." },
];
