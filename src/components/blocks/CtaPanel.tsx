import Link from "next/link";
import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface CtaPanelProps extends BlockLayoutProps {
  body: string;
  label: string;
  href: string;
}

/** Centered panel with a paragraph and one neon button. */
export function CtaPanel({ body, label, href, hidden, space, align }: CtaPanelProps) {
  if (hidden) return null;
  return (
    <section
      className={cx("p-8 rounded-lg", textAlignClass(align, "text-center"), spaceBottomClass(space))}
      style={{ border: "1px solid rgba(255,136,0,0.15)", background: "rgba(255,136,0,0.02)" }}
    >
      <p className="text-gray-400 mb-4">{body}</p>
      <Link href={href} className="neon-btn font-mono text-sm inline-block">
        {label}
      </Link>
    </section>
  );
}
