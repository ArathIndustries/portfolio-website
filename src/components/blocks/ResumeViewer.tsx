import Link from "next/link";

export interface ResumeViewerProps {
  backHref: string;
  backLabel: string;
  title: string;
  pdf: string;
  downloadLabel: string;
  frameTitle: string;
}

/** Full-width PDF viewer: back link and title on the left, download button on the right, the PDF in a frame below. */
export function ResumeViewer({ backHref, backLabel, title, pdf, downloadLabel, frameTitle }: ResumeViewerProps) {
  return (
    <>
      <style>{`
        .resume-wrapper { width: 100%; padding: 1rem 2rem; }
        .resume-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .resume-frame { width: 100%; height: 85vh; border: none; display: block; border-radius: 0.5rem; }
      `}</style>
      <div className="resume-wrapper">
        <div className="resume-header">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--neon)] transition-colors font-mono text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              {backLabel}
            </Link>
            <h1 className="text-xl font-bold font-mono neon-text">{title}</h1>
          </div>
          <a href={pdf} download className="neon-btn-filled text-xs font-mono px-4 py-2 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloadLabel}
          </a>
        </div>
        <iframe src={pdf} title={frameTitle} className="resume-frame" />
      </div>
    </>
  );
}
