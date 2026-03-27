"use client";

import { useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";

const services = [
  "Task & workflow automation",
  "Data dashboards & visualization",
  "Full-stack web applications",
  "AI integration & prompt engineering",
  "Process improvement & industrial engineering",
];

export default function ContactPage() {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">Contact</h1>
      <p className="text-gray-400 mb-12">
        Have a project in mind or want to collaborate? Let&apos;s talk.
      </p>

      {/* What I can help with */}
      <section className="mb-12">
        <h2 className="text-xl font-mono font-semibold mb-4 text-gray-200">What I can help with</h2>
        <ul className="space-y-2">
          {services.map((service) => (
            <li key={service} className="flex items-center gap-3 text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] opacity-60 flex-shrink-0" />
              {service}
            </li>
          ))}
        </ul>
      </section>

      <div className="neon-divider my-12" />

      {/* Contact Form */}
      {submitted ? (
        <div className="p-8 rounded-lg text-center" style={{ border: '1px solid rgba(255,136,0,0.2)', background: 'rgba(255,136,0,0.03)' }}>
          <h3 className="text-xl font-mono font-semibold neon-text mb-2">Message sent</h3>
          <p className="text-gray-400">Thanks for reaching out. I&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <form
          action="https://formspree.io/f/xkoqlqkz"
          method="POST"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-mono text-gray-400 mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0d0b0a] border border-gray-800 text-gray-200 font-mono text-sm focus:outline-none focus:border-[var(--neon)] transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-mono text-gray-400 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0d0b0a] border border-gray-800 text-gray-200 font-mono text-sm focus:outline-none focus:border-[var(--neon)] transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-mono text-gray-400 mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-[#0d0b0a] border border-gray-800 text-gray-200 font-mono text-sm focus:outline-none focus:border-[var(--neon)] transition-colors resize-none"
              placeholder="Tell me about your project..."
            />
          </div>
          <button type="submit" className="neon-btn-filled font-mono text-sm px-8 py-3">
            Send Message
          </button>
        </form>
      )}

      {/* Direct contact */}
      <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,136,0,0.08)' }}>
        <p className="text-sm text-gray-500 mb-4">Or reach out directly:</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="mailto:Sergioarathguzman@gmail.com"
            className="text-sm text-gray-400 hover:text-[var(--neon)] transition-colors font-mono"
          >
            Sergioarathguzman@gmail.com
          </Link>
          <Link
            href="https://www.linkedin.com/in/sergioarathguzman/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-[var(--neon)] transition-colors font-mono"
          >
            LinkedIn
          </Link>
          <Link
            href="https://github.com/ArathIndustries"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-[var(--neon)] transition-colors font-mono"
          >
            GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}
