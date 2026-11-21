# Framehouse — video studio workspace

This repo produces trailers, teasers, promos, explainers and social cuts with
[HyperFrames](https://hyperframes.heygen.com). Many unrelated productions live side by side in
`projects/`; reusable brand kits and media live in `library/`.

## Read these instructions before working (they are not auto-loaded for Gemini)

The workflow lives in "skills" — plain Markdown files. Gemini does not discover the workspace
skill on its own, so **open and follow the files below with your file-reading tool**:

1. **For any video request — new video, new requirements, new assets, feedback, render — read
   `.claude/skills/video-studio/SKILL.md` first and follow it.** It defines the workflow
   (brief → assets → storyboard → build → review → render) and the folder conventions. When it
   points to `references/…`, `templates/…` or `scripts/…`, those paths are relative to
   `.claude/skills/video-studio/`.
2. **Before writing or editing any composition (`index.html`, `compositions/`), read the
   `hyperframes` skill**: `~/.gemini/skills/hyperframes/SKILL.md` (also installed at
   `~/.agents/skills/` and `~/.claude/skills/`). It holds the render contract
   (`window.__timelines`, `data-*` timing attributes, seek-safe animation rules). Compositions
   written without it break.
3. Read the other HyperFrames skills from the same folder when relevant:
   `hyperframes-cli` (CLI by job), `hyperframes-registry` (ready-made blocks — search before
   hand-building any named visual), `media-use` (music, SFX, voice, images, colour treatments),
   `reverse-any-video`, `style-sampling`.
4. When working inside a cut (`projects/<slug>/cuts/<cut>/`), also read that cut's `AGENTS.md`.

How to translate skill wording for Gemini:
- "Load / invoke the `X` skill" or "`/X`" → read `~/.gemini/skills/X/SKILL.md` (or
  `.claude/skills/X/SKILL.md` for `video-studio`), then read any `references/*.md` it tells you to.
- "Share it as a page" → save an HTML file in the project and give the user its path (or open it
  in the browser).
- If a HyperFrames skill is missing, run `npx hyperframes skills update` yourself, then tell the
  user to restart the session so the new skills load.

## Rules

- CLI: `npm run studio -- <command>` (`help` lists commands). Pinned HyperFrames version is in
  `studio.config.json`. `npm run studio -- doctor` must pass (Node ≥ 22, Chrome, FFmpeg) before
  the first render.
- Each `projects/<slug>/cuts/<cut>/` is a standalone HyperFrames project with its own `AGENTS.md`.
- Never edit files in a project's `inbox/`; never overwrite anything in `renders/`.
- Get approval on the visual storyboard before building, and look at snapshot stills before
  rendering — exactly as `video-studio/SKILL.md` describes.
- Never invent product claims, dates, prices, names or quotes.
- Install missing tools (ffmpeg, npm libs, HyperFrames skills) yourself rather than handing it
  back to the user.
