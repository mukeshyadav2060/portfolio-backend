import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { HttpError } from "@/lib/http";
import { isResourceName, resourceConfigs, type ResourceConfig } from "@/lib/resources/fields";
import { getResource } from "@/lib/resources/server";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource, id } = await params;
  if (!isResourceName(resource)) return { title: "Not found" };
  return { title: `${id === "new" ? "New" : "Edit"} ${resourceConfigs[resource].singular.toLowerCase()}` };
}

export default async function ResourceEditor({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource, id } = await params;
  if (!isResourceName(resource)) notFound();
  const config: ResourceConfig = resourceConfigs[resource];
  const isNew = id === "new";

  let row: Record<string, unknown> | null = null;
  if (!isNew) {
    try {
      row = await getResource(resource, Number(id));
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) notFound();
      throw error;
    }
  }

  return (
    <>
      <Link href={`/admin/${resource}`} className="text-sm text-muted hover:text-ink">
        ← {config.label}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        {isNew ? `New ${config.singular.toLowerCase()}` : String(row?.[config.titleField] ?? config.singular)}
      </h1>
      <ResourceForm
        fields={config.fields}
        initial={row ?? {}}
        endpoint={isNew ? `/api/v1/admin/${resource}` : `/api/v1/admin/${resource}/${id}`}
        method={isNew ? "POST" : "PUT"}
        afterCreate={`/admin/${resource}`}
        deleteEndpoint={isNew ? undefined : `/api/v1/admin/${resource}/${id}`}
        slugSource={config.titleField}
      />
    </>
  );
}
