import { useState, type ReactNode } from "react";
import { useGetPuck } from "@puckeditor/core";

/** Remembered across selections so the choice sticks while the editor is open. */
let sourceOpen = false;

/**
 * Wraps the right-pane fields. For a Markdown block the plain textarea is the
 * fallback behind a "Source" toggle, because the prose is edited on the canvas;
 * every other block shows its fields unchanged.
 */
export function SourceToggleFields({ children }: { children: ReactNode }) {
  const getPuck = useGetPuck();
  const [open, setOpen] = useState(sourceOpen);
  if (getPuck().selectedItem?.type !== "Markdown") return <>{children}</>;
  return (
    <>
      <div className="studio-source-toggle">
        <button
          type="button"
          aria-pressed={open}
          data-testid="source-toggle"
          onClick={() => {
            sourceOpen = !open;
            setOpen(!open);
          }}
        >
          Source
        </button>
        <small>{open ? "Raw Markdown below" : "Edit the text on the page, or open Source"}</small>
      </div>
      {open ? children : null}
    </>
  );
}
