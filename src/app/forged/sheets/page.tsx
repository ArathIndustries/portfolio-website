import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forged Sheets — Arath Industries",
  description: "Engineering reference sheets — dense, printable, exam-ready.",
};

export default function ForgedSheetsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">
        Forged Sheets
      </h1>
      <p className="white-neon max-w-xl mx-auto mb-3">
        Engineering reference sheets — dense, printable, exam-ready.
      </p>
      <p className="text-gray-600 font-mono text-sm">In the forge — first release coming soon.</p>
    </div>
  );
}
