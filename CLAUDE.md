# CLAUDE.md

## Project Overview

Static game launcher site at games.osama.me. Landing page with 3 game cards linking to /boom/, /runner/, /space/.

## Architecture

Pure static files, no framework, no build step for the portal itself. Deployed to Vercel.

- `index.html` + `styles.css` — Landing page
- `boom/`, `runner/` — Copied verbatim from `/dev/Game Experiments/`
- `space/` — Vite build output (not raw source)
- `sync.sh` — Copies games from source, builds Space
- `vercel.json` — `trailingSlash: true` (required for relative asset paths in games)

## Updating Games

Run `./sync.sh` to sync all games, or rsync individual games manually.
For boom/runner: straight copy. For space: builds with Vite first.

## Critical Gotchas

- **Vercel must use `trailingSlash: true`** — Games use relative paths for assets. Without trailing slash, paths resolve against root instead of the game subdirectory.
- **Space build requires two patches** — `--base='./'` for Vite AND `ASSET_BASE = './assets'` in config.ts. The sync script handles both via sed + restore.
- **Never modify game source files permanently** — sync.sh patches before build and restores after.
- **Game source lives at** `/Users/osamakhalil/dev/Game Experiments/` (boom, runner, space)

## Deploy

Auto-deploys on push to main via Vercel + GitHub integration.
Manual: `npx vercel --prod --yes --scope byosama`
