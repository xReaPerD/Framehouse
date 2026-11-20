# REVIEW — Framehouse teaser v001

**Render:** `../../renders/teaser_v001.mp4` · 15.0 s · 1920×1080 · 30 fps · H.264 + AAC · 4.2 MB
**README GIF:** `docs/framehouse-teaser.gif` (720 px, 12 fps, 3.3 MB)

## Creative calls
- Built to the approved board v2 (fruity glassmorphism): one canvas, no hard cuts; the glass 16:9 panel is the hero object and becomes the logo mark.
- Glass is real `backdrop-filter` blur over gradient blobs that drift for the whole film.
- Audio: original pad (C, Am, F, C chords changing on each beat) + a soft pink-noise whoosh, both synthesized with FFmpeg (not signed in to the HeyGen catalog; requester approved).

## Measured
- `hyperframes check`: 0 errors. 1 warning kept: `first_frame_empty`. Frame 0 shows the four fruit blobs at low strength (the hook blooms them), which the detector counts as background.
- Fixed after the first stills: the typed prompt and ruler ticks were mispositioned (a shared `.abs` rule outranked them); a stray text cursor reappeared after beat 2 (blink tween ended visible); "PROMPT" failed contrast and four labels were under the 28 px floor; the wordmark started under the still-moving panel.
- Audio in the render: −17.1 LUFS integrated, true peak −7.4 dBTP, no clipping; near-silence 11.41–11.75 s (the breath). Measured, not heard.

## Weakest shot
- 7.8–8.3 s: the six tiles travel to the timeline row on separate paths and briefly overlap. With more time: move them as one group, or stagger them left to right.
- The pad is plain sine chords; a catalog track would sound richer.
