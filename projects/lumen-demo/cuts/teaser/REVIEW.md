# REVIEW — Lumen teaser v001

**Render:** `../../renders/teaser_v001.mp4` · 15.0 s · 1920×1080 · 30 fps · H.264 + AAC · 1.0 MB

## Creative calls
- Built exactly to the approved six-beat board: one canvas, no hard cuts, the point of light is the hero object in every beat and lands as the wordmark's full stop.
- The lamp is only suggested (arm stroke, head, cone, pool); never shown whole (teaser rule: withhold).
- Audio: original pad (three chords: A, F#m7, A) and a pink-noise whoosh, synthesized with FFmpeg (not signed in to the HeyGen music catalog; the requester approved the FFmpeg plan).

## Measured
- `hyperframes check`: 0 errors. 1 warning kept: `dead_stretch` 4.88–8.25 s is a false positive. The range snapshot shows continuous motion (line contracts, point rises, arm draws, desk line spreads, cone falls); the detector appears to key off text changes.
- Contrast: 9/9 text checks pass WCAG AA. Layout: 0 issues.
- Audio in the render: −16.6 LUFS integrated, true peak −5.1 dBTP, no clipping; loudest moment at 12.27 s (whoosh into the dot's glow); near-silence 11.42–11.62 s (the breath). Measured, not heard.

## Weakest shot
- Beat 4 → 5 hand-off (10.6–11.0 s): the arm, cone and ring fade out together, which is a soft fade rather than a true collapse. With more time: shrink the cone into the head and have the ring close in on the pool so everything visibly pours into the point.
- The pad is plain sine chords; a real music bed from the catalog would sound richer.
