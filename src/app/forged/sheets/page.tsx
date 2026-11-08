import { PageContent, pageMetadata } from "@/lib/pageContent";

export function generateMetadata() {
  return pageMetadata("forged-sheets");
}

/** Content lives in content/pages/forged-sheets.mdx; the studio edits it. */
export default function ForgedSheetsPage() {
  return <PageContent name="forged-sheets" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24" />;
}
