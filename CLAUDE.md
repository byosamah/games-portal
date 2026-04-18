# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static game launcher site at games.osama.me. Landing page with 3 game cards linking to /boom/, /runner/, /space/.

## Architecture

Pure static files, no framework, no build step for the portal itself. Deployed to Vercel.

- `index.html` + `styles.css` — Landing page
- `img/` — Landing-page card screenshots (not game assets)
- `boom/`, `runner/` — Copied verbatim from `/dev/Game Experiments/`
- `space/` — Vite build output (not raw source)
- `sync.sh` — Copies games from source, builds Space
- `vercel.json` — `trailingSlash: true` (required for relative asset paths in games)

## Local Preview

`npx vercel dev` — runs the site with `trailingSlash` behavior applied. Plain `open index.html` won't exercise the slash-redirect that games depend on, so bugs there won't surface until production.

## Updating Games

Run `./sync.sh` to sync all games, or rsync individual games manually.
For boom/runner: straight copy. For space: builds with Vite first.

## Critical Gotchas

- **Vercel must use `trailingSlash: true`** — Games use relative paths for assets. Without trailing slash, paths resolve against root instead of the game subdirectory.
- **Space build requires two patches** — `--base='./'` for Vite AND `ASSET_BASE = './assets'` in config.ts. The sync script handles both via sed + restore.
- **Never modify game source files permanently** — sync.sh patches before build and restores after.
- **Game source lives at** `/Users/osamakhalil/dev/Game Experiments/` (boom, runner, space)
- **Never edit inside `boom/`, `runner/`, or `space/`** — sync.sh runs `rsync --delete` against these dirs, so local changes here get wiped on next sync. Edit the sources in `/Users/osamakhalil/dev/Game Experiments/` instead.
- **Run `sync.sh` from the repo root** — it resolves `SCRIPT_DIR` from its own location but the `cd` into the Space source assumes that layout.

## Deploy

Auto-deploys on push to main via Vercel + GitHub integration.
Manual: `npx vercel --prod --yes --scope byosama`
