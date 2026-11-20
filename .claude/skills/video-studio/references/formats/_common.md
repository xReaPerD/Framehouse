# Rules shared by every format

## Canvas & safe areas
| Canvas | Title-safe inset | Notes |
| --- | --- | --- |
| 16:9 1920×1080 | 96 px all sides | YouTube player chrome covers the bottom ~120 px on hover. |
| 9:16 1080×1920 | top 220 px, bottom 420 px, sides 72 px | Reels/TikTok/Shorts UI covers bottom & right edge. |
| 1:1 1080×1080 | 72 px all sides | Feed posts. |

## Type
- Minimum on-screen text: 1080p → 40 px body, 64 px+ headlines. Vertical → 56 px body.
- Reading time: hold text ≥ 0.3 s per word, never < 1.2 s for a card.
- Max ~7 words per card in trailers/teasers. Split long lines across beats instead.
- Contrast ≥ 4.5 : 1 against whatever is behind it (add a scrim on footage).

## Pacing
- **Hook in the first 2 s** — motion, a question, or the most striking shot. No slow logo intros.
- Cut length rises in energy: 2–3 s shots early, 0.5–1 s at the climax, then a held button.
- Leave a breath (0.3–0.8 s of near-silence or a held frame) before the biggest reveal.
- Cuts land on beats when there's music; measure with `npx hyperframes audio <track>`.

## Audio
- Music bed around −16 LUFS integrated for web; VO sits 6–9 dB above the bed (duck under VO).
- Fade music out over ≥ 1 s at the end; never hard-cut audio unless it's the creative choice.
- Sound-off platforms: every message must work silently (text + captions).

## End card
- Logo + one action line (URL / date / "Wishlist now" / "Coming soon"). Hold ≥ 2.5 s.
- Legal lines from `brand.json → legal`, small but legible.

## Never
- Invent claims, dates, prices, reviews, quotes or ratings.
- Use another work's footage, music, logos or characters without the requester providing rights.
