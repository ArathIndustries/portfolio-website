/**
 * Puck Data -> MDX file text.
 *
 * Markdown blocks are written verbatim. Every other block becomes one JSX
 * element; string props become "quoted" attributes, anything else becomes a
 * {JSON} expression. Blocks declaring `childrenAs` are written in the nested
 * form the site's content already uses.
 */
import type { Data } from "@puckeditor/core";
import { blockSchemas } from "../schema";

function attrValue(v: unknown): string {
  if (typeof v === "string") {
    if (!v.includes('"') && !v.includes("\n")) return `"${v}"`;
    return `{${JSON.stringify(v)}}`;
  }
  if (v === true) return "";
  return `{${JSON.stringify(v)}}`;
}

function attrs(props: Record<string, unknown>, skip: Set<string>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (skip.has(k) || v === undefined) continue;
    const val = attrValue(v);
    parts.push(val === "" ? k : `${k}=${val}`);
  }
  return parts.length ? " " + parts.join(" ") : "";
}

export function blockToMdx(type: string, props: Record<string, unknown>): string {
  const schema = blockSchemas[type];
  if (!schema) throw new Error(`Cannot write unknown block type "${type}"`);
  if (type === "Markdown") {
    const text = props.text;
    if (typeof text !== "string") throw new Error("Markdown block text must be a string");
    return text;
  }
  const skip = new Set(["id"]);
  const adapter = schema.mdx?.childrenAs;
  if (adapter && Array.isArray(props[adapter.prop])) {
    skip.add(adapter.prop);
    const children = (props[adapter.prop] as Record<string, unknown>[])
      .map((item) => `  <${adapter.child}${attrs(item, new Set())} />`)
      .join("\n");
    return `<${type}${attrs(props, skip)}>\n${children}\n</${type}>`;
  }
  return `<${type}${attrs(props, skip)} />`;
}

export function puckToMdx(data: Data): string {
  const rootProps = (data.root?.props ?? {}) as { frontmatter?: string; eol?: string };
  const fm = rootProps.frontmatter ?? "";
  const header = fm.trim().length ? `---\n${fm.replace(/^\n+|\n+$/g, "")}\n---\n` : "";
  const blocks = data.content.map((c) => blockToMdx(c.type, c.props as Record<string, unknown>));
  const body = blocks.join("\n\n");
  const out = header + (header && body ? "\n" : "") + body + (body.endsWith("\n") ? "" : "\n");
  return rootProps.eol === "\r\n" ? out.replace(/\n/g, "\r\n") : out;
}
