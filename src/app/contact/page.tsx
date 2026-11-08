import { PageContent, pageMetadata } from "@/lib/pageContent";

export function generateMetadata() {
  return pageMetadata("contact");
}

/** Content lives in content/pages/contact.mdx; the studio edits it. */
export default function ContactPage() {
  return <PageContent name="contact" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" />;
}
