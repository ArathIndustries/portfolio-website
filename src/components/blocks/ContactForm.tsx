"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { cx, spaceBottomClass, type BlockLayoutProps } from "./layout";

export interface ContactFormProps extends BlockLayoutProps {
  action: string;
  /** Field labels and placeholders. Unset falls back to the wording below. */
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder: string;
  buttonLabel: string;
  successTitle: string;
  successBody: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-[#0d0b0a] border border-gray-800 text-gray-200 font-mono text-sm focus:outline-none focus:border-[var(--neon)] transition-colors";
const labelClass = "block text-sm font-mono text-gray-400 mb-2";

/** Name, email and message form posted to a Formspree endpoint; swaps to a thank-you panel after sending. */
export function ContactForm({
  action,
  nameLabel = "Name",
  namePlaceholder = "Your name",
  emailLabel = "Email",
  emailPlaceholder = "your@email.com",
  messageLabel = "Message",
  messagePlaceholder,
  buttonLabel,
  successTitle,
  successBody,
  hidden,
  space,
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setSubmitted(true);
    } catch {
      // Fallback: let the form submit normally
      form.submit();
    }
  }

  if (hidden) return null;

  if (submitted) {
    return (
      <div className={cx("p-8 rounded-lg text-center", spaceBottomClass(space))} style={{ border: "1px solid rgba(255,136,0,0.2)", background: "rgba(255,136,0,0.03)" }}>
        <h3 className="text-xl font-mono font-semibold neon-text mb-2">{successTitle}</h3>
        <p className="text-gray-400">{successBody}</p>
      </div>
    );
  }

  return (
    <form action={action} method="POST" onSubmit={handleSubmit} className={cx("space-y-6", spaceBottomClass(space))}>
      <div>
        <label htmlFor="name" className={labelClass}>{nameLabel}</label>
        <input type="text" id="name" name="name" required className={inputClass} placeholder={namePlaceholder} />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>{emailLabel}</label>
        <input type="email" id="email" name="email" required className={inputClass} placeholder={emailPlaceholder} />
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>{messageLabel}</label>
        <textarea id="message" name="message" required rows={5} className={`${inputClass} resize-none`} placeholder={messagePlaceholder} />
      </div>
      <button type="submit" className="neon-btn-filled font-mono text-sm px-8 py-3">
        {buttonLabel}
      </button>
    </form>
  );
}
