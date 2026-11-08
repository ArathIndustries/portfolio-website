/**
 * Vite config for the studio. Also hosts the tiny file API the editor uses:
 *   GET  /api/pages            -> list of content files with their site routes
 *   GET  /api/page?file=...    -> { data } (Puck Data for that file)
 *   PUT  /api/page?file=...    -> body: Puck Data; writes the MDX back to disk
 * Only files under content/ with an .mdx extension are reachable.
 */
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { mdxToPuck } from "./convert/mdxToPuck";
import { puckToMdx } from "./convert/puckToMdx";
import { configFromEnv, promote, publish, status } from "./publish";

const repoRoot = path.resolve(__dirname, "..");
const contentDir = path.join(repoRoot, "content");
// Publishing goes to STUDIO_REMOTE (default origin); see studio/publish.ts.
const publishCfg = configFromEnv(repoRoot);

const ROUTE_PREFIX: Record<string, string> = {
  projects: "/work",
  notes: "/forged/notes",
  showcase: "/showcase",
};

function listPages() {
  const pages: { file: string; route: string; title: string }[] = [];
  for (const folder of fs.readdirSync(contentDir)) {
    const dir = path.join(contentDir, folder);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".mdx")) continue;
      const file = `${folder}/${name}`;
      const slug = name.replace(/\.mdx$/, "");
      const src = fs.readFileSync(path.join(dir, name), "utf8");
      const title = src.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1] ?? slug;
      // content/pages/<name>.mdx are top-level site pages; home.mdx is "/".
      const route = folder === "pages" ? (slug === "home" ? "/" : `/${slug}`) : `${ROUTE_PREFIX[folder] ?? "/" + folder}/${slug}`;
      pages.push({ file, route, title });
    }
  }
  return pages;
}

function safeContentPath(file: string | null): string {
  if (!file || !file.endsWith(".mdx")) throw new Error("file must be a content .mdx path");
  const abs = path.resolve(contentDir, file);
  if (!abs.startsWith(contentDir + path.sep)) throw new Error("file escapes content/");
  return abs;
}

function readBody(req: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let s = "";
    req.on("data", (c) => (s += c));
    req.on("end", () => resolve(s));
    req.on("error", reject);
  });
}

function fileApi(): Plugin {
  return {
    name: "studio-file-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        if (!url.pathname.startsWith("/api/")) return next();
        const json = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(body));
        };
        try {
          if (url.pathname === "/api/pages" && req.method === "GET") return json(200, listPages());
          if (url.pathname === "/api/page") {
            const abs = safeContentPath(url.searchParams.get("file"));
            if (req.method === "GET") {
              const data = mdxToPuck(fs.readFileSync(abs, "utf8"), path.relative(repoRoot, abs));
              return json(200, { data });
            }
            if (req.method === "PUT") {
              const data = JSON.parse(await readBody(req));
              const mdx = puckToMdx(data);
              fs.writeFileSync(abs, mdx, "utf8");
              return json(200, { ok: true, bytes: Buffer.byteLength(mdx) });
            }
          }
          // Publish flow (studio/publish.ts). Git runs with argument arrays only.
          if (url.pathname === "/api/publish/status" && req.method === "GET") {
            return json(200, status(publishCfg, url.searchParams.get("fetch") !== "0"));
          }
          if (url.pathname === "/api/publish" && req.method === "POST") {
            const body = JSON.parse((await readBody(req)) || "{}") as { title?: string };
            return json(200, publish(publishCfg, typeof body.title === "string" ? body.title : ""));
          }
          if (url.pathname === "/api/promote" && req.method === "POST") {
            return json(200, promote(publishCfg));
          }
          return json(404, { error: "not found" });
        } catch (e) {
          return json(400, { error: (e as Error).message });
        }
      });
    },
  };
}

export default defineConfig({
  root: __dirname,
  // Serve the site's public/ so /images, /studio-examples resolve in the canvas too.
  publicDir: path.join(repoRoot, "public"),
  plugins: [react(), tailwindcss(), fileApi()],
  resolve: {
    alias: {
      "@": path.join(repoRoot, "src"),
      // Blocks may use next/link for client-side navigation on the site; the editor renders a plain anchor.
      "next/link": path.join(__dirname, "shims", "next-link.tsx"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port: 24044,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
  build: { outDir: path.join(repoRoot, ".studio-dist"), emptyOutDir: true },
});
