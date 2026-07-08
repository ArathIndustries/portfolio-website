import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forged Tools — Arath Industries",
  description: "Small, sharp tools for engineering students and working engineers.",
};

export default function ForgedToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">
        Forged Tools
      </h1>
      <p className="white-neon max-w-xl mx-auto mb-3">
        Small, sharp tools for engineering students and working engineers.
      </p>
      <p className="text-gray-600 font-mono text-sm">In the forge — first release coming soon.</p>
    </div>
  );
}
