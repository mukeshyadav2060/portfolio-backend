import Link from "next/link";

const endpoints = [
  ["GET", "/api/v1/site"],
  ["GET", "/api/v1/profile"],
  ["GET", "/api/v1/projects"],
  ["GET", "/api/v1/posts"],
  ["GET", "/api/v1/github"],
  ["POST", "/api/v1/contact"],
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-20">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Portfolio API</h1>
        <p className="mt-3 max-w-xl text-muted">
          Content, contact inbox and integrations for the portfolio frontend. Manage everything from the admin panel.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin" className="btn-primary">
          Open admin
        </Link>
        <a href="/api/v1" className="btn-ghost">
          API reference (JSON)
        </a>
        <a href="/api/health" className="btn-ghost">
          Health
        </a>
      </div>
      <ul className="divide-y divide-line rounded-lg border border-line bg-panel font-mono text-sm">
        {endpoints.map(([method, path]) => (
          <li key={path} className="flex gap-4 px-4 py-3">
            <span className="w-12 text-accent">{method}</span>
            <span>{path}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
