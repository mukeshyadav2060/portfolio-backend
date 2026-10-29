import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { resourceConfigs, resourceNames } from "@/lib/resources/fields";
import { LogoutButton } from "@/components/admin/logout-button";
import { NavLink } from "@/components/admin/nav-link";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-panel px-3 py-5 max-md:hidden">
        <Link href="/admin" className="px-3 font-mono text-sm">
          ~/cms
        </Link>
        <nav className="mt-8 flex flex-col gap-0.5 text-sm">
          <NavLink href="/admin">Overview</NavLink>
          <NavLink href="/admin/profile">Profile</NavLink>
          {resourceNames.map((name) => (
            <NavLink key={name} href={`/admin/${name}`}>
              {resourceConfigs[name].label}
            </NavLink>
          ))}
          <NavLink href="/admin/messages">Messages</NavLink>
        </nav>
        <div className="mt-auto space-y-2 px-3 text-xs text-muted">
          <a href={env.FRONTEND_URL} target="_blank" rel="noreferrer" className="block hover:text-ink">
            View site ↗
          </a>
          <p className="truncate">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="flex gap-4 overflow-x-auto border-b border-line px-4 py-3 text-sm md:hidden">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/profile">Profile</Link>
          {resourceNames.map((name) => (
            <Link key={name} href={`/admin/${name}`}>
              {resourceConfigs[name].label}
            </Link>
          ))}
          <Link href="/admin/messages">Messages</Link>
        </nav>
        <main className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}
