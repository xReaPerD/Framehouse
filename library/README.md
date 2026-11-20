# library/

Optional reusable material. Nothing here is required — every project carries its own brand kit and assets.

| Folder        | What goes here |
| ------------- | -------------- |
| `brands/<client>/` | **Optional.** Saved brand kits for repeat clients/products — created with `studio save-brand <project>`, reused automatically by `studio new --client <name>`. Each project otherwise gets its own fresh kit. `_example` is a filled-in reference. |
| `audio/music` | Licensed music beds you reuse. Note the licence in the filename or a sidecar `.txt`. |
| `audio/sfx`   | Whooshes, hits, risers, UI clicks. |
| `audio/voice` | Recurring voice tags / stingers. |
| `fonts/`      | Licensed font files not tied to one brand. |
| `footage/`    | Reusable b-roll, textures, overlays (grain, light leaks). |
| `images/`     | Reusable stills, backgrounds, icons. |

Productions never reference `library/` directly — the agent copies what a video uses into that
production's `assets/` so each project renders on its own, forever.
