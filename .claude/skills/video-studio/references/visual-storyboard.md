# Visual storyboard

Before building any cut, show the requester a **visual board**: one drawn 16:9 frame per beat,
so flow, colour, layout and animation can be judged and changed before anything is built.
Added 2026-11-17 after a requester rejected a trailer built straight from a text beat table.

## What the board contains (per beat)
1. **Key frame**: the most telling moment of the shot, drawn at real proportions with the
   project's real colours, fonts, logo and assets (block SVGs, UI elements). Not a sketch with
   grey boxes, and not a screenshot of the app.
2. **Motion**: one line on what moves inside the shot (what enters, how, what the camera does).
3. **Into next**: how this shot *becomes* the next one (which element carries over or morphs).
4. **Time, super, sound**: time range, on-screen words (accent word marked), SFX idea.
5. Optional: a small "before → after" pair of frames for complicated motion.

Put a palette + type strip at the top of the board, and the total runtime.

## How to make it
- Write the board as one HTML file in `cuts/<cut>/storyboard/board.html` that draws each frame
  in HTML/CSS (a 1920×1080 frame scaled down), using `assets/` files by relative path. Drawing
  the frames in HTML means the same CSS later becomes the build.
- Publish it as a page (Artifact) so the requester can open it; also render the frames to PNG
  (headless Chrome `--screenshot`) into `cuts/<cut>/storyboard/frames/` for the record.
- Number the beats; the requester gives notes by number. Log each round in `storyboard.md`.

## Craft rules (from studio-grade product ads: Zelios LangEase / StoreTrack / Jobster, Writesonic)
These are what makes them look "expensive". Check every board against them.
- **One canvas.** One neutral background (off-white or near-black) for the whole film, plus at
  most one saturated brand-colour field used for a section. Never a new background per scene.
- **Two colours.** Neutral + one accent hue (+ one supporting). Extra colours only inside the
  product UI itself.
- **No hard cuts.** Every shot turns into the next: an element morphs (button → star → logo,
  bar → progress bar), the camera flies through, or a shape wipes. Plan the hand-off per beat.
- **Isolate the UI.** Show one card, one button, one panel, large and clean, often redrawn as
  simplified vector UI. Full screens only briefly, tilted in 3D with a soft shadow/glow.
  Never shrink a full screen recording until its text is unreadable.
- **Type.** Short sentence-case lines, medium weight, centred, lots of air. Words arrive one at
  a time with a blur-in; one keyword in the accent colour (or on an accent chip).
- **Blur on motion.** Fast moves and text reveals use blur (directional or defocus). This, plus
  consistent easing, is the "smoothness" — the references are only 30 fps.
- **A cursor drives the story**: it clicks, drags, picks. Payoffs are small and satisfying:
  counters ticking to 100, a check drawing on, confetti in brand colours.
- **Problem → product → features → logo.** Open on the pain (floating questions, chaos of
  documents), collapse it into the product, then one feature per beat, end on a logo built from
  an element already on screen.
- **Pace:** a new beat every 1.5–3 s; 20–45 s for an ad. No holds on a static frame.
- **One recurring hero object** (a sparkle, a pin, a block) that travels through the film.
