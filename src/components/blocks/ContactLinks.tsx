import Link from "next/link";
import { cx, rowAlignClass, spaceTopClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface ContactLink {
  label: string;
  href: string;
  /** Where the link opens. "auto" keeps mailto in place and sends the rest to a new tab. */
  target?: "auto" | "same" | "new";
}

export interface ContactLinksProps extends BlockLayoutProps {
  intro: string;
  links: ContactLink[];
}

/** Rule, a short line, then a row of plain text links; mailto links open in place, others in a new tab. */
export function ContactLinks({ intro, links, hidden, space, align }: ContactLinksProps) {
  if (hidden) return null;
  return (
    <div className={cx(spaceTopClass(space, "mt-12"), "pt-8", textAlignClass(align))} style={{ borderTop: "1px solid rgba(255,136,0,0.08)" }}>
      <p className="text-sm text-gray-500 mb-4">{intro}</p>
      <div className={cx("flex flex-wrap gap-4", rowAlignClass(align))}>
        {(links || []).map((link, i) => {
          const newTab = link.target === "new" || (link.target !== "same" && !link.href.startsWith("mailto"));
          return (
            <Link
              key={i}
              href={link.href}
              target={newTab ? "_blank" : undefined}
              rel={newTab ? "noopener noreferrer" : undefined}
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
