/**
 * The Puck config = the block registry.
 *
 * Each block is a real site component (src/components/blocks/index.ts) plus a
 * schema entry (studio/schema.ts). This file only zips the two together, so
 * adding a block never requires touching it.
 */
import type { Config, ComponentConfig } from "@puckeditor/core";
import { blockComponents } from "../src/components/blocks";
import { blockSchemas } from "./schema";

const components: Record<string, ComponentConfig> = {};
const categories: NonNullable<Config["categories"]> = {};

for (const [name, schema] of Object.entries(blockSchemas)) {
  const Component = blockComponents[name];
  if (!Component) {
    throw new Error(`Block "${name}" has a schema in studio/schema.ts but no component in src/components/blocks/index.ts`);
  }
  components[name] = {
    label: name,
    fields: schema.fields,
    defaultProps: schema.defaultProps,
    render: (props) => {
      // Puck passes `id` and `puck` alongside the field values; the component only wants the fields.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, puck, editMode, ...fieldProps } = props as Record<string, unknown>;
      return <Component {...fieldProps} />;
    },
  };
  const cat = (categories[schema.category] ??= { components: [] });
  cat.components!.push(name);
}

for (const name of Object.keys(blockComponents)) {
  if (!blockSchemas[name]) {
    throw new Error(`Component "${name}" is exported from src/components/blocks but has no schema in studio/schema.ts`);
  }
}

export const puckConfig: Config = {
  categories,
  components,
  root: {
    fields: {
      frontmatter: { type: "textarea", label: "Frontmatter (YAML)" },
    },
    render: ({ children }) => (
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">{children}</article>
    ),
  },
};
