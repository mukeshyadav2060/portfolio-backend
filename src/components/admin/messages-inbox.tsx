"use client";

import { useState } from "react";
import type { Message } from "@/db/schema";

export function MessagesInbox({ initial }: { initial: Message[] }) {
  const [messages, setMessages] = useState(initial);
  const [openId, setOpenId] = useState<number | null>(initial[0]?.id ?? null);

  async function setRead(id: number, read: boolean) {
    setMessages((all) => all.map((m) => (m.id === id ? { ...m, read } : m)));
    await fetch(`/api/v1/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ read }),
    });
  }

  async function remove(id: number) {
    if (!confirm("Delete this message permanently?")) return;
    await fetch(`/api/v1/admin/messages/${id}`, { method: "DELETE" });
    setMessages((all) => all.filter((m) => m.id !== id));
  }

  if (messages.length === 0) return <p className="mt-10 text-sm text-muted">The inbox is empty.</p>;

  return (
    <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-panel">
      {messages.map((m) => {
        const open = openId === m.id;
        return (
          <li key={m.id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => {
                setOpenId(open ? null : m.id);
                if (!m.read) void setRead(m.id, true);
              }}
              className="flex w-full items-start gap-4 px-4 py-3 text-left text-sm hover:bg-panel-2"
            >
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${m.read ? "bg-line" : "bg-accent"}`} />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted"> · {m.email}{m.company ? ` · ${m.company}` : ""}</span>
                {!open && <span className="mt-0.5 block truncate text-muted">{m.message}</span>}
              </span>
              <time className="shrink-0 text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</time>
            </button>
            {open && (
              <div className="space-y-4 px-10 pb-5 text-sm">
                {m.budget && <p className="text-muted">Budget: {m.budget}</p>}
                <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                <div className="flex flex-wrap gap-2">
                  <a className="btn-primary" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}>
                    Reply
                  </a>
                  <button type="button" className="btn-ghost" onClick={() => setRead(m.id, !m.read)}>
                    Mark as {m.read ? "unread" : "read"}
                  </button>
                  <button type="button" className="btn-danger" onClick={() => remove(m.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
