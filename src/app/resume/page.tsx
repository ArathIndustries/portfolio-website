import { PageContent, pageMetadata } from "@/lib/pageContent";

export function generateMetadata() {
  return pageMetadata("resume");
}

/** Content lives in content/pages/resume.mdx; the studio edits it. Full width, so no wrapper. */
export default function ResumePage() {
  return <PageContent name="resume" />;
}
