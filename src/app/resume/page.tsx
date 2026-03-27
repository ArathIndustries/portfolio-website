import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "Sergio Arath Guzman — Resume",
};

export default function ResumePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/founder"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--neon)] transition-colors font-mono text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Founder
          </Link>
          <h1 className="text-xl font-bold font-mono neon-text">Resume</h1>
        </div>
        <a
          href="/Sergio_Arath_Guzman_Resume.pdf"
          download
          className="neon-btn-filled text-xs font-mono px-4 py-2 inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </a>
      </div>

      {/* PDF Preview */}
      <div
        className="rounded-lg overflow-hidden border"
        style={{
          borderColor: 'rgba(255,136,0,0.15)',
          background: '#fff',
          height: 'calc(100vh - 140px)',
          minHeight: '700px',
        }}
      >
        <iframe
          src="/Sergio_Arath_Guzman_Resume.pdf"
          title="Resume Preview"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
