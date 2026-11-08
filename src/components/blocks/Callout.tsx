import type { ReactNode } from "react";

export type CalloutTone = "note" | "warning" | "success";

export interface CalloutProps {
  tone: CalloutTone;
  title: ReactNode;
  body: ReactNode;
}

const TONE: Record<CalloutTone, { border: string; bg: string; label: string }> = {
  note: { border: "rgba(255,136,0,0.5)", bg: "rgba(255,136,0,0.06)", label: "NOTE" },
  warning: { border: "rgba(255,80,80,0.6)", bg: "rgba(255,80,80,0.06)", label: "WARNING" },
  success: { border: "rgba(80,220,120,0.6)", bg: "rgba(80,220,120,0.06)", label: "OK" },
};

/** Boxed aside with a tone. Title and body are editable in place. */
export function Callout({ tone, title, body }: CalloutProps) {
  const t = TONE[tone] || TONE.note;
  return (
    <aside className="not-prose my-6 rounded-md p-4 border-l-4" style={{ borderColor: t.border, background: t.bg }}>
      <div className="font-mono text-xs tracking-widest text-gray-500 mb-1">{t.label}</div>
      <div className="font-mono font-semibold text-[#e0e0e0]">{title}</div>
      <div className="mt-1 text-sm text-gray-300 leading-relaxed">{body}</div>
    </aside>
  );
}
