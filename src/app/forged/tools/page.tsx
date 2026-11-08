import { PageContent, pageMetadata } from "@/lib/pageContent";

export function generateMetadata() {
  return pageMetadata("forged-tools");
}

/** Content lives in content/pages/forged-tools.mdx; the studio edits it. */
export default function ForgedToolsPage() {
  return <PageContent name="forged-tools" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" />;
}
