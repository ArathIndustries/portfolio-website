import { WritingList } from "../WritingList";
import type { BlogPost } from "@/lib/mdx";
import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface NotesIndexProps extends BlockLayoutProps {
  heading: string;
  intro: string;
  emptyText: string;
  basePath: string;
  /**
   * Entries of the notes collection, newest first, supplied by the site
   * route at render time. Absent in the studio, which shows a placeholder.
   */
  posts?: BlogPost[];
}

/** The notes index: heading, intro, then the chronological list computed from the collection. */
export function NotesIndex({ heading, intro, emptyText, basePath, posts, hidden, space, align }: NotesIndexProps) {
  if (hidden) return null;
  return (
    <>
      <header className={cx(spaceBottomClass(space, "mb-12"), textAlignClass(align))}>
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">{heading}</h1>
        <p className="text-gray-400">{intro}</p>
      </header>

      {!posts ? (
        <p className="text-sm font-mono text-gray-500 border border-dashed border-gray-700 rounded-lg p-4">
          The list of notes is built from the notes collection when the page renders, newest first, linking to {basePath}/&lt;slug&gt;.
        </p>
      ) : posts.length > 0 ? (
        <WritingList posts={posts} basePath={basePath} />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 font-mono">{emptyText}</p>
        </div>
      )}
    </>
  );
}
