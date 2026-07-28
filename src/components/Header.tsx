"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/work", label: "Projects" },
  { href: "/about", label: "About" },
];

const toolsLinks = [
  { href: "/forged/tools", label: "Apps" },
  { href: "/forged/sheets", label: "Sheets" },
];

function NavDropdown({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  return (
    <div className="relative group">
      <button
        className="white-neon hover:text-[var(--neon)] transition-colors font-mono text-sm inline-flex items-center gap-1"
        data-responds-to="header"
        aria-haspopup="true"
      >
        {label}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className="absolute left-0 top-full pt-2 hidden group-hover:block group-focus-within:block">
        <div
          className="flex flex-col min-w-[140px] rounded-md py-2 bg-[#090706]/95 backdrop-blur-sm"
          style={{ border: '1px solid rgba(255,136,0,0.15)' }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-gray-400 hover:text-[var(--neon)] transition-colors font-mono text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#090706]/80 backdrop-blur-sm" data-grid-node="header" style={{ borderBottom: '1px solid rgba(255,136,0,0.08)' }}>
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-mono font-bold neon-text transition-opacity hover:opacity-80"
          >
            Arath.Industries
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="white-neon hover:text-[var(--neon)] transition-colors font-mono text-sm"
                data-responds-to="header"
              >
                {link.label}
              </Link>
            ))}

            <NavDropdown label="Tools" links={toolsLinks} />

            <Link
              href="/forged/notes"
              className="white-neon hover:text-[var(--neon)] transition-colors font-mono text-sm"
              data-responds-to="header"
            >
              Feed
            </Link>

            <Link
              href="/contact"
              className="neon-btn font-mono text-sm white-neon"
              data-responds-to="header"
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-[var(--neon)] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4" style={{ borderTop: '1px solid rgba(255,136,0,0.08)' }}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-[var(--neon)] transition-colors font-mono text-sm"
                >
                  {link.label}
                </Link>
              ))}

              {/* Tools group */}
              <span className="text-gray-600 font-mono text-xs uppercase tracking-wider">Tools</span>
              {toolsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="pl-4 text-gray-400 hover:text-[var(--neon)] transition-colors font-mono text-sm"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/forged/notes"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-[var(--neon)] transition-colors font-mono text-sm"
              >
                Feed
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="neon-btn font-mono text-sm w-fit"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
