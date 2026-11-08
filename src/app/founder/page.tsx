import { PageContent, pageMetadata } from "@/lib/pageContent";

export function generateMetadata() {
  return pageMetadata("founder");
}

/** Content lives in content/pages/founder.mdx; the studio edits it. */
export default function FounderPage() {
  return <PageContent name="founder" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" />;
}
