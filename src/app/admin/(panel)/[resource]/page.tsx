import Link from "next/link";
import { notFound } from "next/navigation";
import { isResourceName, resourceConfigs, type ResourceConfig } from "@/lib/resources/fields";
import { listResource } from "@/lib/resources/server";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">) {
  const { resource } = await params;
  return { title: isResourceName(resource) ? resourceConfigs[resource].label : "Not found" };
}

function cell(value: unknown, type?: string) {
  if (type === "boolean") return value ? "Yes" : "—";
  if (type === "date" && value) return new Date(String(value)).toLocaleDateString();
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default async function ResourceList({ params }: PageProps<"/admin/[resource]">) {
  const { resource } = await params;
  if (!isResourceName(resource)) notFound();
  const config: ResourceConfig = resourceConfigs[resource];
  const rows = await listResource(resource);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.label}</h1>
          <p className="mt-1 text-sm text-muted">{config.description}</p>
        </div>
        <Link href={`/admin/${resource}/new`} className="btn-primary">
          New {config.singular.toLowerCase()}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                {config.columns.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-panel-2">
                  {config.columns.map((c, i) => (
                    <td key={c.name} className="px-4 py-3">
                      {i === 0 ? (
                        <Link href={`/admin/${resource}/${row.id}`} className="font-medium hover:text-accent">
                          {cell(row[c.name], c.type)}
                        </Link>
                      ) : (
                        <span className="text-muted">{cell(row[c.name], c.type)}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
