# Brand kit (`brand.json`)

**Every project has its own kit** at `projects/<slug>/assets/brand/brand.json` (inside a cut:
`assets/shared/brand/brand.json`). Brands differ per client/product, so nothing brand-specific
lives at workspace level unless deliberately saved for a repeat client.

## Where a project's kit comes from
| Situation | What `studio new` does | What you do |
| --- | --- | --- |
| New client / new product | Writes a **draft** kit (`status: "draft"`, empty fields) | Fill it from the client's material (below). |
| Repeat client (`--client X` and `library/brands/x/` exists) | Copies the saved kit | Confirm it's still current; log overrides in the brief. |
| Explicit saved kit (`--brand x`) | Copies `library/brands/x/` | Same as above. |

## Filling a draft kit — in order of trust
1. **Brand guidelines** (PDF/deck): copy colours, fonts, logo rules, tone verbatim.
2. **Logo files**: copy into `assets/brand/logo/` (prefer SVG). If no palette given, sample
   primary/accent from the logo; pick ground/ink for contrast.
3. **Website / social** URL: read fonts and colours from it; note in `sources`.
4. **Existing videos or marketing**: motion feel, pacing, end-card style.
5. **The brief's tone words** only: propose a kit and get approval with the storyboard.

Record each source in `sources` (e.g. `"inbox/Acme-Brand-Guide.pdf"`, `"https://acme.com"`) and
set `status` to `"ready"` (or `"proposed"` while awaiting approval). Never invent a logo for a
real company — if none was supplied, use a clean wordmark of the name and flag it.

## Fields
| Field | Use in the composition |
| --- | --- |
| `name`, `tagline`, `url` | End card and lower thirds. Copy verbatim. |
| `colors.ground` / `ink` | Map to the composition's `--ground` / `--ink` CSS variables. |
| `colors.primary` / `accent` | Highlights, wipes, underlines. Accent sparingly (≤ 10 % of frame). |
| `fonts.display` / `body` | `family`, `weight`, `source` (`google` → Google Fonts; `local` → file in `fonts/` via `@font-face`). |
| `logo.*` | Paths relative to the brand folder. Respect `minHeightPx` and `clearSpace`. |
| `voice.tone` / `avoid` | Governs on-screen copy you write. |
| `motion.feel` / `defaultEase` / `cutRhythm` | Governs GSAP eases and edit pacing. |
| `endCard.lines` / `holdSeconds` | Default end card. |
| `legal` | Lines that must appear (small, end card). |

## Reuse
`studio save-brand <project> [name]` copies the project's kit to `library/brands/<name>/`
(defaults to the client name). Next time, `studio new "<title>" --client "<Client>"` picks it up.
`library/brands/_example/` is a filled-in reference, not a default.
