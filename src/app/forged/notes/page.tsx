import type { Metadata } from "next";
import { getCollection } from "@/lib/mdx";
import { WritingList } from "@/components/WritingList";

export const metadata: Metadata = {
  title: "Forged Notes — Arath Industries",
  description: "Working notes from the workshop — what got built, what broke, what it taught.",
};

export default function ForgedNotesPage() {
  const posts = getCollection("notes");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">
          Forged Notes
        </h1>
        <p className="text-gray-400">
          Working notes from the workshop — what got built, what broke, and what it taught.
          One chronological feed; formal write-ups carry a publication badge.
        </p>
      </header>

      {posts.length > 0 ? (
        <WritingList posts={posts} basePath="/forged/notes" />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 font-mono">In the forge — first note coming soon.</p>
        </div>
      )}
    </div>
  );
}
