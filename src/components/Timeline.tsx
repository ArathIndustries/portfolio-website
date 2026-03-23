import React from "react";

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  status?: 'completed' | 'current' | 'future';
}

export function TimelineItem({ date, title, description, status = 'completed' }: TimelineItemProps) {
  const isFuture = status === 'future';
  const isCurrent = status === 'current';

  return (
    <div className="relative pl-10">
      {/* Dot */}
      <div
        className="absolute left-0 top-[6px] w-[16px] h-[16px] rounded-full border-2"
        style={{
          borderColor: isFuture ? 'rgba(255,136,0,0.3)' : 'rgba(255,136,0,0.9)',
          background: isFuture
            ? 'rgba(255,136,0,0.05)'
            : isCurrent
              ? 'rgba(255,136,0,0.6)'
              : 'rgba(255,136,0,0.3)',
          boxShadow: isFuture
            ? 'none'
            : isCurrent
              ? '0 0 8px rgba(255,136,0,0.6), 0 0 20px rgba(255,136,0,0.3)'
              : '0 0 6px rgba(255,136,0,0.2)',
          animation: isCurrent ? 'timeline-pulse 2s ease-in-out infinite' : undefined,
        }}
      />

      {/* Date */}
      <p
        className="font-mono text-xs tracking-wider mb-1"
        style={{ color: isFuture ? 'rgba(255,136,0,0.3)' : 'rgba(255,136,0,0.7)' }}
      >
        {date}
      </p>

      {/* Title */}
      <h3
        className="font-mono text-base font-semibold mb-1"
        style={{ color: isFuture ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: isFuture ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)' }}
      >
        {description}
      </p>
    </div>
  );
}

export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative py-8 not-prose">
      {/* Vertical line */}
      <div
        className="absolute left-[7px] top-0 bottom-0 w-[2px]"
        style={{
          background: 'rgba(255,136,0,0.4)',
          boxShadow: '0 0 8px rgba(255,136,0,0.3), 0 0 20px rgba(255,136,0,0.1)',
        }}
      />

      <div className="flex flex-col gap-10">
        {children}
      </div>

      <style>{`
        @keyframes timeline-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255,136,0,0.6), 0 0 20px rgba(255,136,0,0.3); }
          50% { box-shadow: 0 0 14px rgba(255,136,0,0.9), 0 0 30px rgba(255,136,0,0.5); }
        }
      `}</style>
    </div>
  );
}
