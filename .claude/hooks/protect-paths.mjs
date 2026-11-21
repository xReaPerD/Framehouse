#!/usr/bin/env node
// PreToolUse hook: enforces the workspace rules from CLAUDE.md
//   - never edit files in a project's inbox/  (requester's originals)
//   - never overwrite anything in renders/    (versioned deliverables)
// Exit code 2 blocks the tool call and shows stderr to the agent.
import fs from "node:fs";
import path from "node:path";

const INBOX = /(^|\/)projects\/[^/]+\/inbox\//;
const RENDERS = /(^|\/)projects\/[^/]+\/renders\//;

function block(msg) {
  process.stderr.write(`Blocked by .claude/hooks/protect-paths.mjs: ${msg}\n`);
  process.exit(2);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0); // never break the session on malformed input
}

const tool = input.tool_name || "";
const ti = input.tool_input || {};
const root = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const norm = (p) => p.replace(/\\/g, "/");

// File-editing tools
const filePath = ti.file_path || ti.notebook_path;
if (filePath) {
  const abs = path.resolve(root, filePath);
  const rel = norm(path.relative(root, abs));
  if (INBOX.test(rel) && !rel.endsWith("/inbox/README.md")) {
    block(`${rel} is in inbox/, which holds the requester's original files. Copy what you need into assets/ instead.`);
  }
  if (RENDERS.test(rel) && !rel.endsWith("/.gitkeep")) {
    if (tool !== "Write" || fs.existsSync(abs)) {
      block(`${rel} is an existing render. Renders are never overwritten; render to the next version instead.`);
    }
  }
  process.exit(0);
}

// Shell tools: catch obvious destructive commands aimed at inbox/ or renders/
const cmd = typeof ti.command === "string" ? norm(ti.command) : "";
if (cmd) {
  const destructive = /(^|[\s;&|(])(rm|rmdir|del|erase|mv|move|ren|rename|Remove-Item|Move-Item|Rename-Item|Clear-Content|Set-Content|Out-File|truncate|shred)\b/i;
  const target = /projects\/[^/\s"']+\/(inbox|renders)\//;
  const redirect = />{1,2}\s*["']?[^\s"']*projects\/[^/\s"']+\/(inbox|renders)\//;
  if ((destructive.test(cmd) && target.test(cmd)) || redirect.test(cmd)) {
    block("this command would delete, move or overwrite files in inbox/ or renders/. Those folders are read-only for agents.");
  }
}
process.exit(0);
