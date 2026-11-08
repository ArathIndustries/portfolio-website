import Image from "next/image";

export interface CredentialCardProps {
  heading: string;
  image: string;
  alt: string;
  title: string;
  issuer: string;
  dates: string;
}

/** Heading over one credential: badge image, name, issuing body and validity dates. */
export function CredentialCard({ heading, image, alt, title, issuer, dates }: CredentialCardProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold font-mono mb-6 text-gray-200">{heading}</h2>
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
    </section>
  );
}
