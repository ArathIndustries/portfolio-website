import { PageContent, pageMetadata } from "@/lib/pageContent";
import { getAllProjects } from "@/lib/mdx";
import { workCards } from "@/lib/workCards";
import { WorkIndex, type WorkIndexProps } from "@/components/blocks/WorkIndex";

export function generateMetadata() {
  return pageMetadata("work");
}

/**
 * Content lives in content/pages/work.mdx; the studio edits it. The cards
 * are computed here, at render time: a card appears when its project exists
 * in content/projects.
 */
function WorkIndexWithEntries(props: WorkIndexProps) {
  const existing = new Set(getAllProjects().map((p) => p.slug));
  const entries = Object.fromEntries(Object.entries(workCards).filter(([slug]) => existing.has(slug)));
  return <WorkIndex {...props} entries={entries} />;
}

export default function WorkPage() {
  return <PageContent name="work" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16" overrides={{ WorkIndex: WorkIndexWithEntries }} />;
}
