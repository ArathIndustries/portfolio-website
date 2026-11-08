/**
 * Vite config for the studio. Also hosts the tiny file API the editor uses:
 *   GET  /studio/api/pages            -> list of content files with their site routes
 *   GET  /studio/api/page?file=...    -> { data } (Puck Data for that file)
 *   PUT  /studio/api/page?file=...    -> body: Puck Data; writes the MDX back to disk
 * Only files under content/ with an .mdx extension are reachable.
 *
 * Everything is served under the base path /studio/ (editor, API, Vite's own
 * client and HMR websocket) so the hub can reverse-proxy the whole app at the
 * same path without rewriting URLs: http://127.0.0.1:24044/studio/ directly,
 * or <hub>/studio/ through the hub's relay.
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
const publicDir = path.join(repoRoot, "public");
/** Base path of the whole app; App.tsx reads it back as import.meta.env.BASE_URL. */
export const STUDIO_BASE = "/studio/";
const API_PREFIX = `${STUDIO_BASE}api/`;
// Publishing goes to STUDIO_REMOTE (default origin); see studio/publish.ts.
const publishCfg = configFromEnv(repoRoot);

const ROUTE_PREFIX: Record<string, string> = {
  projects: "/work",
  notes: "/forged/notes",
  showcase: "/showcase",
};

/**
 * content/pages/<name>.mdx is a top-level site page. The file name is the
 * route unless listed here (home is "/", the forged pages live under /forged).
 */
const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  "forged-notes": "/forged/notes",
  "forged-tools": "/forged/tools",
  "forged-sheets": "/forged/sheets",
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
      const route = folder === "pages" ? (PAGE_ROUTES[slug] ?? `/${slug}`) : `${ROUTE_PREFIX[folder] ?? "/" + folder}/${slug}`;
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
        if (!url.pathname.startsWith(API_PREFIX)) return next();
        // Route names below are relative to /studio/api/.
        const route = url.pathname.slice(API_PREFIX.length);
        const json = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(body));
        };
        try {
          if (route === "pages" && req.method === "GET") return json(200, listPages());
          if (route === "page") {
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
          if (route === "publish/status" && req.method === "GET") {
            return json(200, status(publishCfg, url.searchParams.get("fetch") !== "0"));
          }
          if (route === "publish" && req.method === "POST") {
            const body = JSON.parse((await readBody(req)) || "{}") as { title?: string };
            return json(200, publish(publishCfg, typeof body.title === "string" ? body.title : ""));
          }
          if (route === "promote" && req.method === "POST") {
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

/**
 * The site's pages reference public files by root path (/images/..., /studio-examples/...).
 * With base = /studio/ Vite serves public/ at /studio/images/...; this rewrites a root
 * request for an existing public file onto the base so the canvas still finds it when
 * the studio is opened directly on 24044. (Through the hub relay a root path reaches
 * the hub instead; the hub does not have the site's images.)
 */
function publicRootFallback(): Plugin {
  return {
    name: "studio-public-root-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const pathname = (req.url ?? "/").split("?")[0];
        if (pathname === "/" || pathname.startsWith(STUDIO_BASE)) return next();
        const candidate = path.resolve(publicDir, "." + pathname);
        if (candidate.startsWith(publicDir + path.sep) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          req.url = STUDIO_BASE.slice(0, -1) + req.url;
        }
        return next();
      });
    },
  };
}

export default defineConfig({
  root: __dirname,
  base: STUDIO_BASE,
  // Serve the site's public/ so /images, /studio-examples resolve in the canvas too.
  publicDir,
  plugins: [react(), tailwindcss(), fileApi(), publicRootFallback()],
  resolve: {
    alias: {
      "@": path.join(repoRoot, "src"),
      // Blocks may use next/link for client-side navigation on the site; the editor renders a plain anchor.
      "next/link": path.join(__dirname, "shims", "next-link.tsx"),
      "next/image": path.join(__dirname, "shims", "next-image.tsx"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    // The hub passes STUDIO_PORT from its settings; 24044 is the registered default.
    port: Number(process.env.STUDIO_PORT) || 24044,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
  build: { outDir: path.join(repoRoot, ".studio-dist"), emptyOutDir: true },
});
