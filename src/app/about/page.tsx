import { PageContent, pageMetadata } from "@/lib/pageContent";

export function generateMetadata() {
  return pageMetadata("about");
}

/** Content lives in content/pages/about.mdx; the studio edits it. */
export default function AboutPage() {
  return <PageContent name="about" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" />;
}
