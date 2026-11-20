# Framehouse — video studio workspace

This repo produces trailers, teasers, promos, explainers and social cuts with
[HyperFrames](https://hyperframes.heygen.com). Many unrelated productions live side by side in
`projects/`; reusable brand kits and media live in `library/`.

**For any video request — new video, new requirements, new assets, feedback, render — load the
`video-studio` skill first** (`.claude/skills/video-studio/SKILL.md`). It defines the workflow
(brief → assets → storyboard → build → review → render) and the folder conventions.
Before editing any composition, also load the `hyperframes` skill.

- CLI: `npm run studio -- <command>` (`help` lists commands). Pinned HyperFrames version is in `studio.config.json`.
- Each `projects/<slug>/cuts/<cut>/` is a standalone HyperFrames project with its own `CLAUDE.md`.
- Never edit files in a project's `inbox/`; never overwrite anything in `renders/`.
