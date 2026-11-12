import Image from "next/image";
import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface CredentialEntry {
  image: string;
  alt: string;
  title: string;
  issuer: string;
  dates: string;
}

export interface CredentialCardProps extends BlockLayoutProps, CredentialEntry {
  heading: string;
  /**
   * Credentials shown after the one in the props above. The first credential
   * stays in the flat props so pages written before this field keep working
   * and stay editable; anything further goes in this list.
   */
  more?: CredentialEntry[];
}

function Card({ image, alt, title, issuer, dates }: CredentialEntry) {
  return (
    <div className="flex items-center gap-5 p-5 rounded-lg border border-gray-800" style={{ background: "rgba(13,11,10,0.6)" }}>
      <Image src={image} alt={alt} width={88} height={88} className="flex-shrink-0" />
      <div>
        <h3 className="font-mono font-semibold text-sm mb-1" style={{ color: "rgba(255,136,0,0.8)" }}>
          {title}
        </h3>
        <p className="text-sm text-gray-400 mb-1">{issuer}</p>
        <p className="text-xs font-mono text-gray-600">{dates}</p>
      </div>
    </div>
  );
}

/** Heading over one or more credentials: badge image, name, issuing body and validity dates. */
export function CredentialCard({ heading, image, alt, title, issuer, dates, more, hidden, space, align }: CredentialCardProps) {
  if (hidden) return null;
  const extra = (more || []).filter((c) => c && (c.title || c.image));
  return (
    <section className={cx(spaceBottomClass(space, "mb-12"), textAlignClass(align))}>
      <h2 className="text-2xl font-bold font-mono mb-6 text-gray-200">{heading}</h2>
      {extra.length ? (
        <div className="space-y-4">
          <Card image={image} alt={alt} title={title} issuer={issuer} dates={dates} />
          {extra.map((c, i) => (
            <Card key={i} {...c} />
          ))}
        </div>
      ) : (
        <Card image={image} alt={alt} title={title} issuer={issuer} dates={dates} />
      )}
    </section>
  );
}
