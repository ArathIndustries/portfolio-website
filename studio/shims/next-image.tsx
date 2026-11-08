/**
 * Stand-in for next/image inside the studio (Vite, no Next image optimizer).
 * Renders a plain <img>; `fill` becomes an absolutely positioned cover box.
 */
import type { CSSProperties, ImgHTMLAttributes } from "react";

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
}

export default function Image({ src, fill, priority: _p, quality: _q, unoptimized: _u, style, ...rest }: ImageProps) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", color: "transparent" }
    : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} style={{ ...fillStyle, ...style }} {...rest} />;
}
