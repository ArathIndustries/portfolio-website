/**
 * Stand-in for next/link inside the studio (Vite, no Next router). Renders a
 * plain anchor with the same props, so blocks may import next/link and keep
 * client-side navigation on the site while still loading in the editor.
 */
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: ReactNode;
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
}

export default function Link({ href, children, prefetch: _p, scroll: _s, replace: _r, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
