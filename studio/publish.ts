/**
 * The publish flow: preview branch first, then master.
 *
 *   publish(title)  -> studio/preview = <remote>/master + the working tree's content/,
 *                      one commit "studio: <title>", force-pushed to the remote.
 *                      The branch is rebuilt from master every time, so it never
 *                      drifts; nothing is checked out and the working tree is not
 *                      touched (a temporary index file builds the tree).
 *   promote()       -> master = studio/preview. Fast-forward when master has not
 *                      moved; otherwise a --no-ff merge made in a throwaway
 *                      worktree. Pushed to the remote.
 *   status()        -> is preview ahead of master, last preview commit, dirty files.
 *
 * Every git call is execFile with an argument array: user text (the title)
 * only ever travels as one argv entry after "-m", never through a shell.
 * The remote comes from STUDIO_REMOTE (default "origin") so the flow can be
 * exercised against a throwaway bare repository before it touches GitHub.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const PREVIEW_BRANCH = "studio/preview";
export const CONTENT_PATHS = ["content"];

export interface PublishConfig {
  repoRoot: string;
  remote: string;
  /** Vercel project and team slug used only to print the preview URL pattern. */
  vercelProject: string;
  vercelTeam: string;
}

export function configFromEnv(repoRoot: string, env: NodeJS.ProcessEnv = process.env): PublishConfig {
  const remote = env.STUDIO_REMOTE || "origin";
  if (!/^[A-Za-z0-9_.-]+$/.test(remote)) throw new Error(`STUDIO_REMOTE "${remote}" is not a plain remote name`);
  return {
    repoRoot,
    remote,
    vercelProject: env.STUDIO_VERCEL_PROJECT || "arath-industries",
    vercelTeam: env.STUDIO_VERCEL_TEAM || "arathindustries-projects",
  };
}

function git(cfg: Pick<PublishConfig, "repoRoot">, args: string[], env?: NodeJS.ProcessEnv): string {
  try {
    return execFileSync("git", args, {
      cwd: cfg.repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: env ? { ...process.env, ...env } : process.env,
    }).trim();
  } catch (e) {
    const err = e as { stderr?: string; status?: number };
    throw new Error(`git ${args.slice(0, 2).join(" ")} failed (exit ${err.status}): ${(err.stderr || "").trim()}`);
  }
}

function tryGit(cfg: Pick<PublishConfig, "repoRoot">, args: string[]): string | null {
  try {
    return git(cfg, args);
  } catch {
    return null;
  }
}

/** Vercel's URL for a branch deployment: <project>-git-<branch with / as ->-<team>.vercel.app */
export function previewUrl(cfg: PublishConfig, branch = PREVIEW_BRANCH): string {
  const slug = branch.replace(/[^A-Za-z0-9-]+/g, "-").toLowerCase();
  return `https://${cfg.vercelProject}-git-${slug}-${cfg.vercelTeam}.vercel.app`;
}

function fetchRemote(cfg: PublishConfig): void {
  // --prune so a deleted preview branch disappears from status too.
  git(cfg, ["fetch", "--quiet", "--prune", cfg.remote]);
}

function remoteRef(cfg: PublishConfig, branch: string): string | null {
  return tryGit(cfg, ["rev-parse", "--verify", "--quiet", `refs/remotes/${cfg.remote}/${branch}`]);
}

/** Working-tree changes under content/, as `git status --porcelain` lines. */
export function dirtyContent(cfg: PublishConfig): string[] {
  const out = git(cfg, ["status", "--porcelain", "--untracked-files=all", "--", ...CONTENT_PATHS]);
  return out ? out.split("\n").filter(Boolean) : [];
}

export interface PublishResult {
  branch: string;
  remote: string;
  commit: string;
  base: string;
  changed: boolean;
  files: string[];
  previewUrl: string;
  message: string;
}

export function publish(cfg: PublishConfig, title: string): PublishResult {
  const clean = (title || "").replace(/[\r\n]+/g, " ").trim() || "content update";
  const message = `studio: ${clean}`;
  fetchRemote(cfg);
  const base = remoteRef(cfg, "master");
  if (!base) throw new Error(`${cfg.remote} has no master branch`);

  // Build master's tree + the working tree's content/ in a private index.
  const indexFile = path.join(os.tmpdir(), `studio-index-${process.pid}-${Date.now()}`);
  const env = { GIT_INDEX_FILE: indexFile };
  let tree: string;
  try {
    git(cfg, ["read-tree", base], env);
    git(cfg, ["add", "--all", "--", ...CONTENT_PATHS], env);
    tree = git(cfg, ["write-tree"], env);
  } finally {
    fs.rmSync(indexFile, { force: true });
  }
  const baseTree = git(cfg, ["rev-parse", `${base}^{tree}`]);
  const changed = tree !== baseTree;
  const files = changed ? git(cfg, ["diff-tree", "--no-commit-id", "--name-only", "-r", baseTree, tree]).split("\n").filter(Boolean) : [];

  const commit = changed ? git(cfg, ["commit-tree", tree, "-p", base, "-m", message]) : base;
  git(cfg, ["update-ref", `refs/heads/${PREVIEW_BRANCH}`, commit]);
  git(cfg, ["push", "--quiet", "--force", cfg.remote, `refs/heads/${PREVIEW_BRANCH}:refs/heads/${PREVIEW_BRANCH}`]);
  return { branch: PREVIEW_BRANCH, remote: cfg.remote, commit, base, changed, files, previewUrl: previewUrl(cfg), message };
}

export interface PromoteResult {
  remote: string;
  method: "fast-forward" | "merge" | "nothing-to-do";
  master: string;
  previousMaster: string;
}

export function promote(cfg: PublishConfig): PromoteResult {
  fetchRemote(cfg);
  const master = remoteRef(cfg, "master");
  const preview = remoteRef(cfg, PREVIEW_BRANCH);
  if (!master) throw new Error(`${cfg.remote} has no master branch`);
  if (!preview) throw new Error(`${cfg.remote} has no ${PREVIEW_BRANCH} branch; save to preview first`);
  if (preview === master) return { remote: cfg.remote, method: "nothing-to-do", master, previousMaster: master };

  const isAncestor = tryGit(cfg, ["merge-base", "--is-ancestor", master, preview]) !== null;
  if (isAncestor) {
    git(cfg, ["push", "--quiet", cfg.remote, `${preview}:refs/heads/master`]);
    return { remote: cfg.remote, method: "fast-forward", master: preview, previousMaster: master };
  }

  // master moved since the preview was cut: merge in a throwaway worktree.
  const wt = fs.mkdtempSync(path.join(os.tmpdir(), "studio-promote-"));
  try {
    git(cfg, ["worktree", "add", "--quiet", "--detach", wt, master]);
    const wtCfg = { repoRoot: wt };
    git(wtCfg, ["merge", "--no-ff", "--no-edit", "-m", `Merge ${PREVIEW_BRANCH} into master (studio promote)`, preview]);
    const merged = git(wtCfg, ["rev-parse", "HEAD"]);
    git(cfg, ["push", "--quiet", cfg.remote, `${merged}:refs/heads/master`]);
    return { remote: cfg.remote, method: "merge", master: merged, previousMaster: master };
  } finally {
    tryGit(cfg, ["worktree", "remove", "--force", wt]);
    fs.rmSync(wt, { recursive: true, force: true });
  }
}

export interface StatusResult {
  remote: string;
  branch: string;
  previewUrl: string;
  previewExists: boolean;
  aheadOfMaster: number;
  behindMaster: number;
  master: string | null;
  preview: string | null;
  lastCommit: { hash: string; subject: string; date: string } | null;
  dirtyContent: string[];
  /** `git diff --name-only <remote>/master <remote>/studio/preview`: what a promote would change. */
  changedFiles: string[];
}

export function status(cfg: PublishConfig, fetch = true): StatusResult {
  if (fetch) fetchRemote(cfg);
  const master = remoteRef(cfg, "master");
  const preview = remoteRef(cfg, PREVIEW_BRANCH);
  let ahead = 0;
  let behind = 0;
  let changedFiles: string[] = [];
  if (master && preview) {
    const [b, a] = git(cfg, ["rev-list", "--left-right", "--count", `${master}...${preview}`]).split(/\s+/).map(Number);
    ahead = a;
    behind = b;
    changedFiles = git(cfg, ["diff", "--name-only", master, preview]).split("\n").filter(Boolean);
  }
  const ref = preview ?? master;
  const last = ref ? git(cfg, ["log", "-1", "--format=%H%x1f%s%x1f%cI", ref]).split("\x1f") : null;
  return {
    remote: cfg.remote,
    branch: PREVIEW_BRANCH,
    previewUrl: previewUrl(cfg),
    previewExists: Boolean(preview),
    aheadOfMaster: ahead,
    behindMaster: behind,
    master,
    preview,
    lastCommit: last ? { hash: last[0], subject: last[1], date: last[2] } : null,
    dirtyContent: dirtyContent(cfg),
    changedFiles,
  };
}
