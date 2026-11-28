import { useId, useRef, useState, type ChangeEvent } from "react";
import { FieldLabel, type CustomField, type Field } from "@puckeditor/core";
import type { StudioFileSpec } from "../schema";
import { StudioIcon } from "./icons";

const BASE = import.meta.env.BASE_URL;

/**
 * Side-pane field for a public-file path (an image, a PDF): the path in a
 * text input plus an Upload button that posts a file from the device to
 * studio/api/upload and writes the resulting /images/... path into the field.
 * On the phone the two controls are 44 px tall so a thumb hits them.
 */
function FileFieldInput({ value, onChange, label, spec, readOnly }: { value: string; onChange: (v: string) => void; label?: string; spec: StudioFileSpec; readOnly?: boolean }) {
  const id = useId();
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; late?: boolean } | null>(null);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    setNote(null);
    try {
      const r = await fetch(`${BASE}api/upload?dir=${encodeURIComponent(spec.dir)}&name=${encodeURIComponent(f.name)}`, {
        method: "POST",
        headers: { "content-type": f.type || "application/octet-stream" },
        body: f,
      });
      const body = (await r.json()) as { path?: string; bytes?: number; error?: string };
      if (!r.ok || !body.path) throw new Error(body.error ?? r.statusText);
      onChange(body.path);
      setNote({ text: `uploaded ${Math.round((body.bytes ?? f.size) / 1024)} KB to ${body.path}` });
    } catch (err) {
      setNote({ text: `upload failed: ${(err as Error).message}`, late: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <FieldLabel label={label ?? "File"} icon={<StudioIcon name="upload" />} readOnly={readOnly}>
      <div className="studio-file" data-testid="file-field">
        <input
          id={id}
          className="studio-input studio-touch"
          type="text"
          value={value ?? ""}
          placeholder={spec.placeholder}
          readOnly={readOnly}
          aria-invalid={note?.late ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="studio-btn studio-touch" disabled={busy || readOnly} onClick={() => file.current?.click()} data-testid="file-upload">
          <StudioIcon name="upload" />
          <span>{busy ? "Uploading…" : "Upload"}</span>
        </button>
        <input ref={file} type="file" accept={spec.accept} hidden onChange={upload} aria-hidden="true" tabIndex={-1} />
      </div>
      {note ? (
        <small className={note.late ? "studio-err" : "studio-help"} role={note.late ? "alert" : "status"}>
          {note.text}
        </small>
      ) : null}
    </FieldLabel>
  );
}

/** A schema field marked `studioFile` (studio/schema.ts) becomes a FileField; everything else passes through. */
export function withFileFields<F extends Record<string, Field>>(fields: F): F {
  const out: Record<string, Field> = {};
  for (const [name, field] of Object.entries(fields)) {
    const spec = (field as { studioFile?: StudioFileSpec }).studioFile;
    if (field.type === "custom" && spec) {
      const custom: CustomField<string> = {
        ...(field as CustomField<string>),
        render: ({ value, onChange, field: f, readOnly }) => <FileFieldInput value={value} onChange={onChange} label={f.label} spec={spec} readOnly={readOnly} />,
      };
      out[name] = custom;
    } else if (field.type === "array") {
      out[name] = { ...field, arrayFields: withFileFields(field.arrayFields) };
    } else if (field.type === "object") {
      out[name] = { ...field, objectFields: withFileFields(field.objectFields) };
    } else {
      out[name] = field;
    }
  }
  return out as F;
}
