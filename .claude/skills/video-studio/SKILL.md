---
name: video-studio
description: Produce trailers, teasers, promos, explainers and social cuts from a requester's brief and assets, rendered with HyperFrames (HTML + GSAP → MP4). Use whenever someone asks to make, plan, revise or render a video, trailer, teaser, promo, reel, intro/outro or launch video, gives video requirements or drops assets for one, or asks to start a new video project in a video-studio workspace (a folder with studio.config.json).
---

# video-studio

Turns *"here's what I want + here are my files"* into finished, versioned video files. Each
**production** (one campaign / product / event) lives in `projects/<slug>/` and can have several
**cuts** (trailer, teaser, vertical reel…). Every cut is its own HyperFrames project, so it can be
checked, previewed and rendered on its own.

`$STUDIO` below means `node <this skill dir>/scripts/studio.mjs` (in this repo:
`node .claude/skills/video-studio/scripts/studio.mjs`, or `npm run studio --` from the root).

## Workspace layout

```
<workspace>/
├─ studio.config.json        pinned HyperFrames version + defaults
├─ library/                  optional reusables: saved brand kits of repeat clients, music, sfx, fonts…
└─ projects/<slug>/
   ├─ project.json           machine-readable: cuts, sizes, durations, status
   ├─ brief.md               the requirements (source of truth for intent)
   ├─ CHANGELOG.md           every cut / render / feedback round
   ├─ inbox/                 raw files exactly as the requester sent them — never edited
   ├─ assets/                cleaned, renamed, render-ready media
   │  └─ brand/brand.json    THIS project's brand kit (every project has its own)
   ├─ notes/                 scripts, research, transcripts, reference stills
   ├─ cuts/<cut>/            a full HyperFrames project per deliverable
   │  ├─ index.html          the composition
   │  ├─ storyboard.md       beat sheet for this cut
   │  └─ assets/shared/      hardlinked mirror of ../../assets (managed by `studio sync`)
   └─ renders/<cut>_v###.mp4 versioned outputs, never overwritten
```

No workspace yet? Run `$STUDIO init [dir]` first.

## Hard prerequisites

1. **Load the `hyperframes` skill before writing or editing any composition.** It holds the
   render contract (`window.__timelines`, `data-*` timing attributes, seek-safe animation rules).
   If it is not installed, stop and tell the user to run `npx hyperframes skills update` and
   restart the session — do not install skills yourself. Also use `hyperframes-registry` (ready-made
   blocks) and `media-use` (music, SFX, voice, image treatments) when relevant.
2. `$STUDIO doctor` must pass (Node ≥ 22, Chrome, **FFmpeg**) before the first render.

## The loop

Move a production through these stages; record each with `$STUDIO status <slug> <stage>`.

### 1 · Brief  (`status: brief`)
- If the request is for a new production: `$STUDIO new "<Title>" [--client "<Client>"] --cut <spec> …`
  Pass `--client` whenever the work is for someone (freelance/agency work). If that client has a
  saved kit in `library/brands/`, it is reused automatically; `--brand <kit>` picks one explicitly.
  Cut spec = `name[:resolution[:seconds]]`, e.g. `trailer`, `teaser:landscape:15`,
  `reel:portrait:30`. Known names (trailer, teaser, promo, explainer, intro, outro, reel, short,
  story, post) get sensible defaults. Add cuts later with `$STUDIO add-cut`.
- Fill `brief.md` from what the requester said. Use `references/brief-intake.md` to spot gaps.
  Ask **only** questions whose answer would change the video (usually ≤ 3, in one message). For
  everything else choose a default and write it under *Assumptions*.
- Never invent facts: product claims, dates, prices, names, quotes. Use the requester's words or
  leave a clearly marked placeholder.

### 2 · Brand
The brand belongs to the project, not the workspace — every client/product looks different.
- Saved kit copied in (`status` not `draft`)? Confirm it still applies; note any overrides in the brief.
- Draft kit? Fill `assets/brand/brand.json` from whatever this client sent, in this order of
  trust: brand guidelines → logo files → their website → existing videos/marketing → the brief's
  tone words. Record each in `sources`, set `status: "ready"`. Follow `references/brand-kit.md`.
- Nothing usable (brand-new product, personal project)? Propose a small kit (palette, type
  pairing, motion feel) in the storyboard message and let the requester approve it with the plan.
- After delivery for a client likely to return, offer `$STUDIO save-brand <slug>` so the next
  project for them starts from their kit.

### 3 · Assets
- The requester drops files in `inbox/` (or gives paths/links). Inspect each: dimensions,
  duration, fps, audio, transparency. `npx hyperframes audio <file>` measures sound.
- Copy what the video needs into `assets/<kind>/` with descriptive kebab-case names
  (`gameplay-boss-fight-4k.mp4`, `logo-white.svg`). Convert awkward formats (HEVC/MOV/ProRes →
  H.264 MP4, oversized images → ≤ 2× canvas). Leave `inbox/` untouched.
- Log every asset in the brief's table, including usage rights if known.
- Compositions reference media as `assets/shared/<kind>/<file>`; run `$STUDIO sync <slug>` after
  changing `assets/` (check/preview/render sync automatically).

### 4 · Storyboard  (`status: storyboard`)  — **visual, and approved before any build**
- **References first.** If the requester gave reference videos (or links), download them
  (`yt-dlp`), pull timestamped contact sheets with ffmpeg and study them before designing. Write
  what makes them work into `notes/reference-analysis.md`. No references? Propose 2–3 and ask.
- For each cut, read the matching guide in `references/formats/` and fill
  `cuts/<cut>/storyboard.md`: hook, arc, beat table with timings, text, audio cues, assets.
- **Then draw it.** A text beat table is not a storyboard. Build a visual board —
  one 16:9 frame per beat, drawn with the real brand colours, fonts and assets — showing the key
  frame, the motion inside the shot and **how it turns into the next shot**. Follow
  `references/visual-storyboard.md`. Save it in `cuts/<cut>/storyboard/` and share it as a page.
- Time beats to the music when there is music (measure the track first). Music can wait until the
  picture is approved if the requester says so.
- Get a yes on the visual board before building, unless they said to go straight through.
  Changes are cheap on the board and expensive in the build. Mark it in the brief's Approval
  checklist.

### 5 · Build  (`status: building`)
- With the `hyperframes` skill loaded, author `cuts/<cut>/index.html` from the storyboard.
  Pull colours, fonts, logo and motion feel from `assets/shared/brand/brand.json` (the project kit).
- Shorter cuts of the same production should reuse the longer cut's look (copy shared CSS /
  scenes) so the campaign feels like one family.
- Search `hyperframes-registry` before hand-building common pieces (lower thirds, captions,
  logo reveals, transitions).

### 6 · Review  (`status: review`)
- `$STUDIO check <slug> <cut>` → fix every error and warning.
- `$STUDIO snapshot <slug> <cut> --at <key moments>` → **look at the stills**. Verify: text legible
  and inside safe areas (see `references/formats/_common.md`), brand colours right, nothing
  clipped, hook lands in the first 2 s, end card holds long enough to read.
- Quick motion check: `$STUDIO render <slug> <cut> --draft`.
- Hand the requester the draft or a live preview (`$STUDIO preview <slug> <cut> --background`)
  and collect notes. Log each feedback round in the storyboard's *Review notes* and CHANGELOG.

### 7 · Render  (`status: rendered` → `delivered`)
- `$STUDIO render <slug> <cut>` (or `all`). Output: `renders/<cut>_v###.mp4`, auto-versioned.
  Use `--quality delivery` for final masters, `--format webm|mov|gif` when asked.
- Report the file path(s), duration, resolution and what changed since the last version.

## Revisions
Never overwrite a delivered render — re-render to the next version. Keep the storyboard in sync
with what was actually built, so the next person (or agent) can pick the project up cold.

## References
- `references/brief-intake.md` — the gap checklist and default assumptions
- `references/formats/_common.md` — safe areas, type sizes, pacing, audio levels, end cards
- `references/formats/{trailer,teaser,promo,explainer,social-short}.md` — structures per format
- `references/brand-kit.md` — the `brand.json` schema
- `references/visual-storyboard.md` — how to make the visual board, plus the craft rules learned
  from studio-grade SaaS/product ads (one canvas, no hard cuts, morph transitions, isolated UI)
