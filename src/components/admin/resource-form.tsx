"use client";

import { useRouter } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import type { Field } from "@/lib/resources/fields";

type Values = Record<string, unknown>;
type Errors = Record<string, string[] | undefined>;
type Pair = { label: string; value?: string; url?: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

function defaultsFor(fields: Field[], initial: Values): Values {
  const out: Values = {};
  for (const f of fields) {
    const v = initial[f.name];
    if (v !== undefined && v !== null) out[f.name] = v;
    else if (f.type === "boolean") out[f.name] = f.name === "published";
    else if (["list", "metrics", "links", "images", "entries"].includes(f.type)) out[f.name] = [];
    else if (f.type === "number") out[f.name] = 0;
    else if (f.type === "select") out[f.name] = f.options?.[0] ?? "";
    else out[f.name] = "";
  }
  return out;
}

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/v1/admin/upload", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");
  return json.data.url as string;
}

export function ResourceForm({
  fields,
  initial,
  endpoint,
  method,
  afterCreate,
  deleteEndpoint,
  slugSource,
}: {
  fields: Field[];
  initial: Values;
  endpoint: string;
  method: "POST" | "PUT";
  afterCreate?: string;
  deleteEndpoint?: string;
  slugSource?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => defaultsFor(fields, initial));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });
  const slugTouched = useRef(Boolean(initial.slug));

  const set = (name: string, value: unknown) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      if (name === slugSource && !slugTouched.current && "slug" in v) next.slug = slugify(String(value));
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const payload: Values = {};
    for (const f of fields) {
      let v = values[f.name];
      if (f.type === "number") v = Number(v) || 0;
      if (f.type === "metrics") v = (v as Pair[]).filter((p) => p.label && p.value);
      if (f.type === "links") v = (v as Pair[]).filter((p) => p.label && p.url);
      // Drop rows whose required columns are empty, and blank optional columns.
      if (f.type === "entries")
        v = (v as Record<string, string>[])
          .filter((row) => f.subfields!.every((s) => !s.required || row[s.name]?.trim()))
          .map((row) => Object.fromEntries(Object.entries(row).filter(([, x]) => x?.trim())));
      if (["text", "textarea", "image", "color", "date", "month"].includes(f.type) && v === "") v = null;
      if (f.required && v === null) v = "";
      payload[f.name] = v;
    }
    const res = await fetch(endpoint, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setErrors(json?.error?.details ?? {});
      setStatus({ kind: "error", message: json?.error?.message ?? `Save failed (${res.status})` });
      return;
    }
    setStatus({ kind: "saved", message: "Saved. The site will refresh in a few seconds." });
    if (method === "POST" && afterCreate) router.push(`${afterCreate}/${json.data.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!deleteEndpoint || !confirm("Delete permanently? This cannot be undone.")) return;
    const res = await fetch(deleteEndpoint, { method: "DELETE" });
    if (res.ok && afterCreate) {
      router.push(afterCreate);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8" noValidate>
      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        {fields.map((f) => (
          <Fragment key={f.name}>
            {f.section && <h2 className="mt-6 border-t border-line pt-8 text-lg font-semibold tracking-tight md:col-span-2">{f.section}</h2>}
            <div className={f.wide || ["markdown", "list", "metrics", "links", "images", "entries"].includes(f.type) ? "md:col-span-2" : ""}>
              <FieldInput
                field={f}
                value={values[f.name]}
                onChange={(v) => {
                  if (f.name === "slug") slugTouched.current = true;
                  set(f.name, v);
                }}
              />
              {f.help && <p className="help">{f.help}</p>}
              {f.length && <LengthMeter value={String(values[f.name] ?? "")} range={f.length} />}
              {errors[f.name]?.map((m) => (
                <p key={m} className="mt-1 text-xs text-danger">
                  {m}
                </p>
              ))}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-10 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 px-5 py-4 md:-mx-10 md:px-10">
        <button type="submit" className="btn-primary" disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "Saving…" : "Save"}
        </button>
        {deleteEndpoint && (
          <button type="button" className="btn-danger" onClick={onDelete}>
            Delete
          </button>
        )}
        {status.message && (
          <p role="status" className={`text-sm ${status.kind === "error" ? "text-danger" : "text-muted"}`}>
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

function LengthMeter({ value, range: [min, max] }: { value: string; range: [number, number] }) {
  const n = value.trim().length;
  if (!n) return null;
  const good = n >= min && n <= max;
  return (
    <p className={`mt-1 text-xs tabular-nums ${good ? "text-muted" : "text-danger"}`}>
      {n} characters{good ? "" : n < min ? ` · aim for at least ${min}` : ` · may be cut off after ${max}`}
    </p>
  );
}

function FieldInput({ field: f, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${f.name}`;
  const label = (
    <label htmlFor={id} className="label">
      {f.label}
      {f.required && <span className="text-accent"> *</span>}
    </label>
  );

  switch (f.type) {
    case "textarea":
      return (
        <>
          {label}
          <textarea id={id} rows={3} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </>
      );
    case "markdown":
      return (
        <>
          {label}
          <textarea
            id={id}
            rows={14}
            className="input font-mono text-[13px] leading-relaxed"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder="## Heading&#10;&#10;Write in Markdown."
          />
        </>
      );
    case "number":
      return (
        <>
          {label}
          <input id={id} type="number" className="input" value={String(value ?? 0)} onChange={(e) => onChange(e.target.value)} />
        </>
      );
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-3 pt-7 text-sm">
          <input id={id} type="checkbox" className="size-4 accent-[var(--accent)]" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {f.label}
        </label>
      );
    case "select":
      return (
        <>
          {label}
          <select id={id} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </>
      );
    case "color":
      return (
        <>
          {label}
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={`${f.label} picker`}
              className="h-9 w-12 cursor-pointer rounded-md border border-line bg-bg"
              value={String(value || "#c6ff3d")}
              onChange={(e) => onChange(e.target.value)}
            />
            <input id={id} className="input font-mono" value={String(value ?? "")} placeholder="#c6ff3d" onChange={(e) => onChange(e.target.value)} />
          </div>
        </>
      );
    case "date":
      return (
        <>
          {label}
          <input id={id} type="date" className="input" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} />
        </>
      );
    case "month":
      return (
        <>
          {label}
          <input id={id} type="month" className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </>
      );
    case "list":
      return (
        <>
          {label}
          <textarea
            id={id}
            rows={4}
            className="input"
            value={((value as string[]) ?? []).join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trimStart()).filter((s, i, a) => s || i === a.length - 1))}
            onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          />
        </>
      );
    case "entries":
      return <EntriesInput field={f} value={(value as Record<string, string>[]) ?? []} onChange={onChange} />;
    case "metrics":
    case "links":
      return <PairsInput field={f} value={(value as Pair[]) ?? []} onChange={onChange} second={f.type === "metrics" ? "value" : "url"} />;
    case "image":
      return <ImageInput id={id} label={label} value={String(value ?? "")} onChange={onChange} />;
    case "images":
      return <ImagesInput label={f.label} value={(value as string[]) ?? []} onChange={onChange} />;
    default:
      return (
        <>
          {label}
          <input
            id={id}
            className={`input ${f.type === "slug" ? "font-mono" : ""}`}
            value={String(value ?? "")}
            placeholder={f.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
  }
}

function EntriesInput({ field, value, onChange }: { field: Field; value: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void }) {
  const cols = field.subfields ?? [];
  const update = (i: number, key: string, v: string) => onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  return (
    <fieldset>
      <legend className="label">{field.label}</legend>
      <div className="space-y-3">
        {value.map((row, i) => (
          <div key={i} className="flex gap-2 rounded-md bg-panel p-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {cols.map((c) => (
                <input
                  key={c.name}
                  className="input"
                  aria-label={c.label}
                  placeholder={`${c.label}${c.required ? " *" : ""}${c.placeholder ? ` — ${c.placeholder}` : ""}`}
                  value={row[c.name] ?? ""}
                  onChange={(e) => update(i, c.name, e.target.value)}
                />
              ))}
            </div>
            <button type="button" className="btn-ghost self-start" aria-label="Remove row" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost mt-2" onClick={() => onChange([...value, {}])}>
        Add {field.label.toLowerCase().replace(/s$/, "")}
      </button>
    </fieldset>
  );
}

function PairsInput({ field, value, onChange, second }: { field: Field; value: Pair[]; onChange: (v: Pair[]) => void; second: "value" | "url" }) {
  const update = (i: number, key: keyof Pair, v: string) => onChange(value.map((p, j) => (j === i ? { ...p, [key]: v } : p)));
  return (
    <fieldset>
      <legend className="label">{field.label}</legend>
      <div className="space-y-2">
        {value.map((p, i) => (
          <div key={i} className="flex gap-2">
            <input className="input" aria-label="Label" placeholder="Label" value={p.label ?? ""} onChange={(e) => update(i, "label", e.target.value)} />
            <input
              className="input"
              aria-label={second === "url" ? "URL" : "Value"}
              placeholder={second === "url" ? "https://" : "Value"}
              value={p[second] ?? ""}
              onChange={(e) => update(i, second, e.target.value)}
            />
            <button type="button" className="btn-ghost" aria-label="Remove row" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost mt-2" onClick={() => onChange([...value, { label: "", [second]: "" }])}>
        Add row
      </button>
    </fieldset>
  );
}

function UploadButton({ onUploaded, accept = "image/*,application/pdf" }: { onUploaded: (url: string) => void; accept?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <label className={`btn-ghost cursor-pointer ${busy ? "opacity-50" : ""}`}>
        {busy ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError(null);
            try {
              onUploaded(await upload(file));
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {error && <span className="text-xs text-danger">{error}</span>}
    </>
  );
}

const isImage = (url: string) => /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(url);

function ImageInput({ id, label, value, onChange }: { id: string; label: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <>
      {label}
      <div className="flex flex-wrap items-center gap-2">
        <input id={id} className="input min-w-0 flex-1" placeholder="https://… or upload" value={value} onChange={(e) => onChange(e.target.value)} />
        <UploadButton onUploaded={onChange} />
      </div>
      {value && isImage(value) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-3 max-h-48 rounded-md border border-line object-cover" />
      )}
      {value && !isImage(value) && (
        <a href={value} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-muted underline">
          Open file
        </a>
      )}
    </>
  );
}

function ImagesInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-24 w-36 rounded-md border border-line object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs opacity-0 transition group-hover:opacity-100 focus:opacity-100"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <UploadButton accept="image/*" onUploaded={(url) => onChange([...value, url])} />
      </div>
    </fieldset>
  );
}
