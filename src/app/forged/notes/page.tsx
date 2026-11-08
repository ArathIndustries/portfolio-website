import { PageContent, pageMetadata } from "@/lib/pageContent";
import { getCollection } from "@/lib/mdx";
import { NotesIndex, type NotesIndexProps } from "@/components/blocks/NotesIndex";

export function generateMetadata() {
  return pageMetadata("forged-notes");
}

/** Content lives in content/pages/forged-notes.mdx; the list of notes is computed here from the collection. */
function NotesIndexWithPosts(props: NotesIndexProps) {
  return <NotesIndex {...props} posts={getCollection("notes")} />;
}

export default function ForgedNotesPage() {
  return (
    <PageContent
      name="forged-notes"
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      overrides={{ NotesIndex: NotesIndexWithPosts }}
    />
  );
}
