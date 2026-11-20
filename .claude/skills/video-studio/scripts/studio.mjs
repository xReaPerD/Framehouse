#!/usr/bin/env node
// video-studio CLI — manages a multi-production video workspace on top of HyperFrames.
// Zero dependencies. Node >= 22. Works on Windows, macOS and Linux.
//
//   node studio.mjs <command> [args]
//
// Run `node studio.mjs help` for the command list.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_DIR = path.join(SKILL_DIR, "templates");
const CONFIG_NAME = "studio.config.json";
const DEFAULT_HF_VERSION = "0.9.41";

const RESOLUTIONS = {
  landscape: [1920, 1080],
  portrait: [1080, 1920],
  square: [1080, 1080],
  "landscape-4k": [3840, 2160],
  "portrait-4k": [2160, 3840],
  "square-4k": [2160, 2160],
};

// Sensible defaults per well-known cut name. Anything else falls back to landscape / 30 s.
const CUT_PRESETS = {
  trailer: { resolution: "landscape", duration: 60 },
  teaser: { resolution: "landscape", duration: 15 },
  promo: { resolution: "landscape", duration: 30 },
  explainer: { resolution: "landscape", duration: 90 },
  intro: { resolution: "landscape", duration: 8 },
  outro: { resolution: "landscape", duration: 8 },
  reel: { resolution: "portrait", duration: 30 },
  short: { resolution: "portrait", duration: 30 },
  story: { resolution: "portrait", duration: 15 },
  post: { resolution: "square", duration: 15 },
};

// ---------------------------------------------------------------- helpers

function die(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function info(msg) {
  console.log(`• ${msg}`);
}

function parseArgs(argv) {
  const pos = [];
  const flags = {};
  const passthrough = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") {
      passthrough.push(...argv.slice(i + 1));
      break;
    }
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=", 2);
      let val = true;
      if (v !== undefined) val = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) val = argv[++i];
      // Repeated flags (e.g. --cut a --cut b) accumulate into an array.
      flags[k] = k in flags ? [].concat(flags[k], val) : val;
    } else pos.push(a);
  }
  return { pos, flags, passthrough };
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

function findWorkspace(start = process.cwd()) {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, CONFIG_NAME))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function loadWorkspace() {
  const root = findWorkspace();
  if (!root) die(`No ${CONFIG_NAME} found here or in any parent folder. Run \`studio init\` first.`);
  const config = readJson(path.join(root, CONFIG_NAME));
  return {
    root,
    config,
    hf: config.hyperframesVersion || DEFAULT_HF_VERSION,
    projectsDir: path.join(root, config.projectsDir || "projects"),
    libraryDir: path.join(root, config.libraryDir || "library"),
  };
}

function loadProject(ws, slug) {
  if (!slug) die("Missing <project> argument.");
  const dir = path.join(ws.projectsDir, slug);
  const file = path.join(dir, "project.json");
  if (!fs.existsSync(file)) die(`Project "${slug}" not found (expected ${file}).`);
  return { dir, file, data: readJson(file) };
}

function getCut(project, cutName) {
  const cuts = project.data.cuts || [];
  if (!cutName) {
    if (cuts.length === 1) return cuts[0];
    die(`Project has ${cuts.length} cuts — name one: ${cuts.map((c) => c.id).join(", ")}`);
  }
  const cut = cuts.find((c) => c.id === cutName);
  if (!cut) die(`Cut "${cutName}" not in project. Available: ${cuts.map((c) => c.id).join(", ") || "(none)"}`);
  return cut;
}

function run(cmd, args, opts = {}) {
  const shown = [cmd, ...args].join(" ");
  info(`$ ${shown}${opts.cwd ? `   (in ${path.relative(process.cwd(), opts.cwd) || "."})` : ""}`);
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  if (res.error) die(res.error.message);
  return res.status ?? 1;
}

function hf(ws, args, opts) {
  return run("npx", ["--yes", `hyperframes@${ws.hf}`, ...args], opts);
}

function copyDir(src, dest, { overwrite = false } = {}) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, { overwrite });
    else if (overwrite || !fs.existsSync(d)) fs.copyFileSync(s, d);
  }
}

// Mirror a folder using hardlinks (no extra disk space; works on NTFS without admin),
// falling back to a copy across drives/filesystems. Removes stale files in dest.
function mirror(src, dest) {
  let linked = 0;
  let copied = 0;
  const walk = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    const wanted = new Set();
    for (const entry of fs.readdirSync(s, { withFileTypes: true })) {
      if (entry.name === ".gitkeep") continue;
      wanted.add(entry.name);
      const sp = path.join(s, entry.name);
      const dp = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(sp, dp);
        continue;
      }
      if (fs.existsSync(dp)) {
        const a = fs.statSync(sp);
        const b = fs.statSync(dp);
        if (a.ino === b.ino && a.ino !== 0) continue;
        if (a.size === b.size && a.mtimeMs <= b.mtimeMs) continue;
        fs.rmSync(dp);
      }
      try {
        fs.linkSync(sp, dp);
        linked++;
      } catch {
        fs.copyFileSync(sp, dp);
        copied++;
      }
    }
    for (const name of fs.readdirSync(d)) {
      if (!wanted.has(name)) fs.rmSync(path.join(d, name), { recursive: true, force: true });
    }
  };
  if (fs.existsSync(src)) walk(src, dest);
  return { linked, copied };
}

function fillTemplate(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function appendChangelog(projectDir, line) {
  const file = path.join(projectDir, "CHANGELOG.md");
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
  fs.appendFileSync(file, `- ${stamp} — ${line}\n`);
}

function parseCutSpec(spec, flags = {}) {
  // "teaser", "teaser:portrait", "teaser:portrait:15"
  const [rawId, res, dur] = spec.split(":");
  const id = slugify(rawId);
  if (!id) die(`Bad cut spec "${spec}".`);
  const base = Object.entries(CUT_PRESETS).find(([k]) => id === k || id.startsWith(k + "-"))?.[1] || {
    resolution: "landscape",
    duration: 30,
  };
  const resolution = res || flags.resolution || base.resolution;
  if (!RESOLUTIONS[resolution]) die(`Unknown resolution "${resolution}". Use: ${Object.keys(RESOLUTIONS).join(", ")}`);
  const duration = Number(dur || flags.duration || base.duration);
  if (!(duration > 0)) die(`Bad duration in "${spec}".`);
  const [width, height] = RESOLUTIONS[resolution];
  return { id, resolution, width, height, duration, fps: Number(flags.fps || 30) };
}

// ---------------------------------------------------------------- commands

function cmdInit({ pos, flags }) {
  const root = path.resolve(pos[0] || ".");
  fs.mkdirSync(root, { recursive: true });
  const cfgPath = path.join(root, CONFIG_NAME);
  if (fs.existsSync(cfgPath) && !flags.force) die(`${cfgPath} already exists (use --force to overwrite).`);
  writeJson(cfgPath, {
    $comment: "video-studio workspace config. See .claude/skills/video-studio/SKILL.md",
    hyperframesVersion: flags.hyperframes || DEFAULT_HF_VERSION,
    projectsDir: "projects",
    libraryDir: "library",
    defaults: { fps: 30, quality: "looks" },
  });
  copyDir(path.join(TEMPLATE_DIR, "library"), path.join(root, "library"));
  fs.mkdirSync(path.join(root, "projects"), { recursive: true });
  info(`Workspace ready at ${root}`);
  info("Next: studio new <project-name> --cut trailer --cut teaser:portrait:15");
}

function cmdNew({ pos, flags }) {
  const ws = loadWorkspace();
  const title = pos[0];
  if (!title) die("Usage: studio new <project-name> [--client <name>] [--brand <saved-kit>] [--cut trailer] …");
  const slug = slugify(flags.slug || title);
  const dir = path.join(ws.projectsDir, slug);
  if (fs.existsSync(dir)) die(`Project "${slug}" already exists at ${dir}`);

  // Brand is per project. Use a saved kit when asked for (--brand) or when the client
  // already has one in the library (repeat client); otherwise start a fresh draft kit
  // that the agent fills from whatever the client sends.
  const client = flags.client ? String(flags.client).trim() : null;
  const brandsDir = path.join(ws.libraryDir, "brands");
  let brand = flags.brand ? String(flags.brand).trim() : null;
  if (brand && !fs.existsSync(path.join(brandsDir, brand))) {
    const saved = fs.existsSync(brandsDir) ? fs.readdirSync(brandsDir).filter((n) => !n.startsWith("_")) : [];
    die(`No saved brand kit "${brand}" in library/brands/. Saved kits: ${saved.join(", ") || "(none)"}.\n  Omit --brand to start a fresh kit for this project.`);
  }
  if (!brand && client && fs.existsSync(path.join(brandsDir, slugify(client)))) brand = slugify(client);

  // Scaffold the production folder from the template.
  const vars = {
    title,
    slug,
    date: today(),
    client: client || "—",
    brandSource: brand ? `saved kit \`library/brands/${brand}\`` : "new draft — fill from client material",
  };
  const tpl = path.join(TEMPLATE_DIR, "project");
  const walk = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
      const sp = path.join(s, e.name);
      const dp = path.join(d, e.name);
      if (e.isDirectory()) walk(sp, dp);
      else if (/\.(md|json|txt)$/.test(e.name)) fs.writeFileSync(dp, fillTemplate(fs.readFileSync(sp, "utf8"), vars));
      else fs.copyFileSync(sp, dp);
    }
  };
  walk(tpl, dir);

  const brandDir = path.join(dir, "assets", "brand");
  if (brand) {
    copyDir(path.join(brandsDir, brand), brandDir);
    info(`Using saved brand kit "${brand}" → assets/brand/`);
  } else {
    const kit = readJson(path.join(TEMPLATE_DIR, "brand.template.json"));
    kit.name = client || title;
    fs.mkdirSync(path.join(brandDir, "logo"), { recursive: true });
    fs.mkdirSync(path.join(brandDir, "fonts"), { recursive: true });
    writeJson(path.join(brandDir, "brand.json"), kit);
    info("Started a draft brand kit → assets/brand/brand.json (fill from the client's material)");
  }

  writeJson(path.join(dir, "project.json"), {
    slug,
    title,
    client,
    brand: brand || "project",
    createdAt: new Date().toISOString(),
    hyperframesVersion: ws.hf,
    status: "brief",
    cuts: [],
  });
  appendChangelog(dir, "Project created.");
  info(`Created projects/${slug}/`);

  const cutSpecs = [].concat(flags.cut || []).flatMap((c) => String(c).split(","));
  for (const spec of cutSpecs) addCut(ws, slug, parseCutSpec(spec, flags));

  info("Next: fill in brief.md, drop source files into inbox/, then plan the storyboard.");
}

function addCut(ws, slug, cut) {
  const project = loadProject(ws, slug);
  if (project.data.cuts.some((c) => c.id === cut.id)) die(`Cut "${cut.id}" already exists in ${slug}.`);
  const cutsDir = path.join(project.dir, "cuts");
  fs.mkdirSync(cutsDir, { recursive: true });

  const code = hf(
    ws,
    ["init", cut.id, "--example", "blank", "--non-interactive", "--skip-skills", "--resolution", cut.resolution],
    { cwd: cutsDir },
  );
  if (code !== 0) die(`hyperframes init failed for cut "${cut.id}".`);

  const cutDir = path.join(cutsDir, cut.id);
  // Set the requested duration on the starter composition.
  const indexPath = path.join(cutDir, "index.html");
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, "utf8").replace(/data-duration="10"/g, `data-duration="${cut.duration}"`);
    fs.writeFileSync(indexPath, html);
  }
  // Per-cut storyboard.
  const sbTpl = path.join(TEMPLATE_DIR, "storyboard.template.md");
  if (fs.existsSync(sbTpl)) {
    fs.writeFileSync(
      path.join(cutDir, "storyboard.md"),
      fillTemplate(fs.readFileSync(sbTpl, "utf8"), { ...cut, title: project.data.title, slug }),
    );
  }

  project.data.cuts.push({ ...cut, dir: `cuts/${cut.id}`, createdAt: new Date().toISOString() });
  writeJson(project.file, project.data);
  appendChangelog(project.dir, `Added cut "${cut.id}" (${cut.width}x${cut.height}, ${cut.duration}s).`);
  syncProject(ws, project.dir, project.data);
  info(`Cut "${cut.id}" ready at projects/${slug}/cuts/${cut.id}/`);
}

function cmdAddCut({ pos, flags }) {
  const ws = loadWorkspace();
  const [slug, spec] = pos;
  if (!slug || !spec) die("Usage: studio add-cut <project> <cut>[:resolution[:seconds]]");
  addCut(ws, slug, parseCutSpec(spec, flags));
}

function syncProject(ws, projectDir, data) {
  const src = path.join(projectDir, "assets");
  for (const cut of data.cuts || []) {
    const dest = path.join(projectDir, cut.dir, "assets", "shared");
    const { linked, copied } = mirror(src, dest);
    if (linked || copied) info(`Synced assets → ${cut.dir}/assets/shared (${linked} linked, ${copied} copied)`);
  }
}

function cmdSync({ pos }) {
  const ws = loadWorkspace();
  const project = loadProject(ws, pos[0]);
  syncProject(ws, project.dir, project.data);
  info("Assets in sync.");
}

function cmdList() {
  const ws = loadWorkspace();
  if (!fs.existsSync(ws.projectsDir)) return info("No projects yet.");
  const rows = fs
    .readdirSync(ws.projectsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(ws.projectsDir, e.name, "project.json")))
    .map((e) => readJson(path.join(ws.projectsDir, e.name, "project.json")));
  if (!rows.length) return info("No projects yet. Create one with `studio new <name>`.");
  for (const p of rows) {
    const renders = path.join(ws.projectsDir, p.slug, "renders");
    const count = fs.existsSync(renders) ? fs.readdirSync(renders).filter((f) => !f.startsWith(".")).length : 0;
    const who = [p.client && `client: ${p.client}`, p.brand && p.brand !== "project" && `kit: ${p.brand}`].filter(Boolean);
    console.log(`\n${p.slug}  —  ${p.title}   [${p.status}]${who.length ? "   " + who.join(" · ") : ""}`);
    for (const c of p.cuts || []) console.log(`   └ ${c.id.padEnd(16)} ${c.width}x${c.height}  ${c.duration}s @ ${c.fps}fps`);
    console.log(`   renders: ${count}`);
  }
  console.log("");
}

function cmdPassthrough(hfCommand) {
  return ({ pos, flags, passthrough }) => {
    const ws = loadWorkspace();
    const project = loadProject(ws, pos[0]);
    const cut = getCut(project, pos[1]);
    syncProject(ws, project.dir, project.data);
    const extra = Object.entries(flags).flatMap(([k, v]) => (v === true ? [`--${k}`] : [`--${k}`, String(v)]));
    process.exit(hf(ws, [hfCommand, ...extra, ...passthrough], { cwd: path.join(project.dir, cut.dir) }));
  };
}

function nextVersion(rendersDir, cutId, ext) {
  const re = new RegExp(`^${cutId}_v(\\d{3})(?:_draft)?\\.${ext}$`);
  const max = fs.existsSync(rendersDir)
    ? Math.max(0, ...fs.readdirSync(rendersDir).map((f) => Number(f.match(re)?.[1] || 0)))
    : 0;
  return String(max + 1).padStart(3, "0");
}

function cmdRender({ pos, flags, passthrough }) {
  const ws = loadWorkspace();
  const project = loadProject(ws, pos[0]);
  const cuts = pos[1] === "all" ? project.data.cuts : [getCut(project, pos[1])];
  syncProject(ws, project.dir, project.data);

  const rendersDir = path.join(project.dir, "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const draft = !!flags.draft;
  const format = flags.format || "mp4";
  const quality = draft ? "draft" : flags.quality || ws.config.defaults?.quality || "looks";

  let failed = 0;
  for (const cut of cuts) {
    const ext = format === "png" ? "png" : format;
    const v = nextVersion(rendersDir, cut.id, ext);
    const out = path.join(rendersDir, `${cut.id}_v${v}${draft ? "_draft" : ""}.${ext}`);
    const args = ["render", "-o", out, "-q", quality];
    if (flags.format) args.push("--format", format);
    if (flags.fps) args.push("--fps", String(flags.fps));
    const code = hf(ws, [...args, ...passthrough], { cwd: path.join(project.dir, cut.dir) });
    if (code === 0) {
      appendChangelog(project.dir, `Rendered ${cut.id} v${v} (${quality}) → renders/${path.basename(out)}`);
      info(`✔ ${path.relative(ws.root, out)}`);
    } else {
      failed++;
      appendChangelog(project.dir, `Render of ${cut.id} FAILED (exit ${code}).`);
    }
  }
  if (!draft && !failed) {
    project.data.status = "rendered";
    writeJson(project.file, project.data);
  }
  process.exit(failed ? 1 : 0);
}

function cmdStatus({ pos }) {
  const ws = loadWorkspace();
  const project = loadProject(ws, pos[0]);
  const allowed = ["brief", "storyboard", "building", "review", "rendered", "delivered", "archived"];
  if (!allowed.includes(pos[1])) die(`Status must be one of: ${allowed.join(", ")}`);
  project.data.status = pos[1];
  writeJson(project.file, project.data);
  appendChangelog(project.dir, `Status → ${pos[1]}.`);
  info(`${project.data.slug}: ${pos[1]}`);
}

function cmdSaveBrand({ pos, flags }) {
  const ws = loadWorkspace();
  const project = loadProject(ws, pos[0]);
  const name = slugify(pos[1] || project.data.client || project.data.slug);
  const src = path.join(project.dir, "assets", "brand");
  if (!fs.existsSync(path.join(src, "brand.json"))) die(`No assets/brand/brand.json in ${project.data.slug}.`);
  const dest = path.join(ws.libraryDir, "brands", name);
  if (fs.existsSync(dest) && !flags.force) die(`library/brands/${name} already exists (use --force to update it).`);
  copyDir(src, dest, { overwrite: true });
  appendChangelog(project.dir, `Saved brand kit to library/brands/${name}.`);
  info(`Saved → library/brands/${name}/  (reuse with: studio new "<title>" --brand ${name}, or --client "${project.data.client || name}")`);
}

function cmdDoctor() {
  const ws = findWorkspace() ? loadWorkspace() : { hf: DEFAULT_HF_VERSION };
  process.exit(hf(ws, ["doctor"]));
}

function cmdHelp() {
  console.log(`
video-studio — multi-production video workspace on HyperFrames

  studio init [dir]                         Create a workspace (studio.config.json, library/, projects/)
  studio new <name> [--client c] [--brand kit] [--cut spec]
                                            New production. Gets its own brand kit: a saved one
                                            (--brand, or auto when --client has a saved kit) or a
                                            fresh draft. --cut is repeatable / comma-separated:
                                              trailer | teaser:portrait | reel:portrait:20
  studio save-brand <project> [name]        Save a project's brand kit to library/brands/ for reuse
  studio add-cut <project> <cut-spec>       Add another deliverable (its own HyperFrames project)
  studio list                               All productions, cuts, render counts
  studio sync <project>                     Hardlink project assets/ → every cut's assets/shared/
  studio check <project> [cut]              hyperframes check (lint + runtime + layout + motion)
  studio snapshot <project> [cut] [--at 1,3,5]   PNG stills for visual review
  studio preview <project> [cut]            Live Studio preview (pass --background for agents)
  studio render <project> [cut|all] [--draft] [--quality delivery] [--format mp4|webm|mov|gif]
                                            Versioned output → projects/<p>/renders/<cut>_v###.mp4
  studio status <project> <status>          brief|storyboard|building|review|rendered|delivered|archived
  studio doctor                             Check Node / Chrome / FFmpeg

  Resolutions: ${Object.keys(RESOLUTIONS).join(", ")}
  Anything after "--" is passed straight to hyperframes.
`);
}

const COMMANDS = {
  init: cmdInit,
  new: cmdNew,
  "add-cut": cmdAddCut,
  list: cmdList,
  ls: cmdList,
  sync: cmdSync,
  check: cmdPassthrough("check"),
  snapshot: cmdPassthrough("snapshot"),
  preview: cmdPassthrough("preview"),
  render: cmdRender,
  status: cmdStatus,
  "save-brand": cmdSaveBrand,
  doctor: cmdDoctor,
  help: cmdHelp,
};

const [command, ...rest] = process.argv.slice(2);
(COMMANDS[command] || cmdHelp)(parseArgs(rest));
