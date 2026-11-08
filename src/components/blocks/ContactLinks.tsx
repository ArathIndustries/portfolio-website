import Link from "next/link";

export interface ContactLink {
  label: string;
  href: string;
}

export interface ContactLinksProps {
  intro: string;
  links: ContactLink[];
}

/** Rule, a short line, then a row of plain text links; mailto links open in place, others in a new tab. */
export function ContactLinks({ intro, links }: ContactLinksProps) {
  return (
    <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,136,0,0.08)" }}>
      <p className="text-sm text-gray-500 mb-4">{intro}</p>
      <div className="flex flex-wrap gap-4">
        {(links || []).map((link, i) => {
          const mail = link.href.startsWith("mailto");
          return (
            <Link
              key={i}
              href={link.href}
              target={mail ? undefined : "_blank"}
              rel={mail ? undefined : "noopener noreferrer"}
              className="text-sm text-gray-400 hover:text-[var(--neon)] transition-colors font-mono"
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
