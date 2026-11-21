// Tideline Cover Press — hand-in for the Make GTA 6 Cover Art bounty.
// This program stages the finished cover maker into the folder the grader
// reads: it copies the app and its screenshots there, then writes the
// dossier the judge reads, built with the kit's own dossier library so the
// bytes match the scorer's rebuild exactly. Plain Node 22+, no build step,
// no network, no extra packages: `node main.ts`.

import { cpSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

// The repository root is wherever this file lives, so the program works no
// matter which directory it is started from.
const repoDir = dirname(fileURLToPath(import.meta.url));

// The grader hands this folder to the program; anywhere else, the
// MAKEFUN_OUTPUT_DIR variable points at a scratch folder instead.
const handInDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

// The gate's own caps, as the competition's gate.json states them: the text
// budget for the dossier, at most four screenshots of at most 256 KiB each,
// and the app's file-count and byte caps.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
};

// The two folders the entry hands in, named as they sit in this repository.
const handedFolders = ["app", "screenshots"];

// Replace a folder in the output area with a fresh copy from the repository,
// so a stale file from an earlier run can never ride along.
function stageFolder(name: string): void {
  const from = join(repoDir, name);
  const to = join(handInDir, name);
  rmSync(to, { force: true, recursive: true });
  cpSync(from, to, { recursive: true });
}

function handIn(): void {
  if (handInDir === repoDir) {
    throw new Error("Refusing to hand the app into its own repository folder.");
  }
  mkdirSync(handInDir, { recursive: true });
  for (const name of handedFolders) {
    stageFolder(name);
    console.log(`staged ${name}/ into ${handInDir}`);
  }
  const dossierBytes = buildDossier(handInDir, dossierCaps);
  const dossierPath = join(handInDir, "dossier.json");
  writeFileSync(dossierPath, dossierBytes);
  const written = statSync(dossierPath).size;
  console.log(`wrote ${dossierPath} (${written} bytes)`);
  console.log("Tideline Cover Press handed in: app, screenshots and dossier ready.");
}

handIn();
