/**
 * The component side of the block registry. Every block that can appear on a
 * page is exported here under the name used in MDX and in studio/schema.ts.
 * The Next pages hand this map to MDXRemote; the studio builds Puck renderers
 * from the same map, so one file controls what "a block" is.
 */
import { Timeline } from "../Timeline";
import { Hero } from "./Hero";
import { Markdown } from "./Markdown";
import { Figure } from "./Figure";
import { Stats } from "./Stats";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { TwoColumn } from "./TwoColumn";
import { Divider } from "./Divider";
import { NeonCard } from "./NeonCard";
import { Sparks } from "./Sparks";
import { PlotlyChart } from "./PlotlyChart";
import { MapBlock } from "./MapBlock";
import { Scrolly } from "./Scrolly";
import { ThreeBlock } from "./ThreeBlock";
import { DataTable } from "./DataTable";
import { Embed } from "./Embed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockComponents: Record<string, React.ComponentType<any>> = {
  Timeline,
  Hero,
  Markdown,
  Figure,
  Stats,
  CodeBlock,
  Callout,
  TwoColumn,
  Divider,
  NeonCard,
  Sparks,
  PlotlyChart,
  MapBlock,
  Scrolly,
  ThreeBlock,
  DataTable,
  Embed,
};

export type BlockName = keyof typeof blockComponents;
