import Link from "next/link";
import { cx, rowAlignClass, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface LinkButton {
  label: string;
  href: string;
  variant?: "outline" | "filled";
  icon?: "none" | "document";
  /** Where the link opens. "auto" keeps mailto and site paths in place and sends the rest to a new tab. */
  target?: "auto" | "same" | "new";
}

export interface LinkButtonsProps extends BlockLayoutProps {
  heading: string;
  links: LinkButton[];
}

/** Heading over a row of neon buttons; mailto links open in place, others in a new tab. */
export function LinkButtons({ heading, links, hidden, space, align }: LinkButtonsProps) {
  if (hidden) return null;
  return (
    <section className={cx(textAlignClass(align), spaceBottomClass(space)) || undefined}>
      <h2 className="text-xl font-bold font-mono mb-4 text-gray-200">{heading}</h2>
      <div className={cx("flex flex-wrap gap-4", rowAlignClass(align))}>
        {(links || []).map((link, i) => {
          const inPlace = link.href.startsWith("mailto") || link.href.startsWith("/");
          const newTab = link.target === "new" || (link.target !== "same" && !inPlace);
          const filled = link.variant === "filled";
          return (
            <Link
              key={i}
              href={link.href}
              target={newTab ? "_blank" : undefined}
              rel={newTab ? "noopener noreferrer" : undefined}
              className={filled ? "neon-btn-filled text-sm font-mono inline-flex items-center gap-2" : "neon-btn text-sm font-mono"}
            >
              {link.icon === "document" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              ) : null}
              {link.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
