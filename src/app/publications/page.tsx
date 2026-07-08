import type { Metadata } from "next";
import { getCollection } from "@/lib/mdx";
import { WritingList } from "@/components/WritingList";

export const metadata: Metadata = {
  title: "Publications",
  description: "Formal write-ups: condensed project reports, case studies, and papers.",
};

export default function PublicationsPage() {
  const posts = getCollection("publications");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">
          Publications
        </h1>
        <p className="text-gray-400">
          Formal write-ups: condensed project reports, case studies, and papers. The finished
          record — for the working notes, see the{" "}
          <a href="/forged/notes" className="text-[var(--neon)] hover:underline">
            forge
          </a>
          .
        </p>
      </header>

      {posts.length > 0 ? (
        <WritingList posts={posts} basePath="/publications" />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 font-mono">The first publication is in the forge.</p>
        </div>
      )}
    </div>
  );
}
