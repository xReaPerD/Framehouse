# Framehouse Teaser — `teaser` storyboard

**Canvas:** 1920×1080 · **Target length:** 15s · **FPS:** 30
**Format guide:** `references/formats/teaser.md` · **Brief:** `../../brief.md`
**Visual board:** `storyboard/board.html`

## Spine
- **Look:** fruity glassmorphism. Deep grape ground; four soft blobs (mango, strawberry, lime, blueberry) drift slowly behind frosted-glass panels for the whole film.
- **Hook (first 2s):** the blobs bloom out of the dark and a frosted 16:9 glass panel forms over them.
- **Arc:** empty glass panel → a prompt types into it → it splits into six glass storyboard tiles that get approved → the tiles slide into a glass timeline and render → one finished glass frame → it becomes the logo mark.
- **Hero object:** the glass 16:9 panel. Each step's keyword takes one fruit colour: Describe = mango, Approve = lime, Render = strawberry.
- **Music / pacing:** FFmpeg-synthesized bright pad, lifts at each of the three lines; near-silence 11.0–11.8; one soft whoosh as the panel becomes the mark; tail fades 13.5–15.0.

## Beats

| # | Time (s) | Visual | On-screen text | Audio / SFX | Into next |
| - | -------- | ------ | -------------- | ----------- | --------- |
| 1 | 0.0–2.0  | Dark grape. Four fruit-coloured blobs bloom in; a frosted 16:9 glass panel (960×540, rounded) fades up over them, its border catching light. | — | pad fades in | a white text cursor appears inside the panel |
| 2 | 2.0–4.8  | A prompt types into the panel in mono: "A 15-second launch teaser. / Bright, fruity, glassy." | **Describe** it. (mango) | pad lift | the text fades and the panel splits along a 3×2 grid |
| 3 | 4.8–7.8  | Six small glass tiles fan out, each with a simple drawn key frame. A lime "Approved" chip pops on with a check. | **Approve** it. (lime) | pad lift | the tiles shrink and slide down into one row |
| 4 | 7.8–11.0 | The row sits in a long glass timeline bar with a ruler; a white playhead sweeps; a strawberry render bar fills 0 → 100% with `teaser_v001.mp4`. | **Render** it. (strawberry) | pad lift | the timeline folds back into one panel; the bar becomes a play button |
| 5 | 11.0–11.8 | Breath: the single glass panel, blobs glowing through it, a play button at centre. Still. | — | near-silence | on the whoosh the panel shrinks and slides left |
| 6 | 11.8–15.0 | End card. The panel lands as the logo mark (small rounded glass tile, fruit colours inside) beside "Framehouse"; "Your AI video studio" fades in at 12.6. Hold 12.4 → 15.0 (2.6 s). | **Framehouse** / Your AI video studio | whoosh lands; tail fades | — (end) |

## End card
- Mark (rounded glass tile with the four fruit colours blurred inside) + "Framehouse" (Poppins 600, white) + "Your AI video studio" (Poppins 300, lilac-grey). Centred. Hold 2.6 s.

## Review notes
<!-- feedback rounds go here, newest first: date — note — what changed -->
- 2026-11-20 — Board v1 (warm near-black + ember) rejected: "looks too Claude-themed". Changed to fruity glassmorphism; the beats are unchanged.
- 2026-11-20 — Board v2 approved. Built; fixed prompt/tick positioning, stray cursor, label contrast/size after first stills; rendered v001.
