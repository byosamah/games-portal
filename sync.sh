#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="/Users/osamakhalil/dev/Game Experiments"
HALCYON_SRC="/Users/osamakhalil/dev/halcyon"
DEST="$SCRIPT_DIR"

EXCLUDE="--exclude=.git --exclude=.DS_Store --exclude=.claude --exclude=.vercel --exclude=.github --exclude=node_modules --exclude=CLAUDE.md --exclude=.gitignore"

echo "=== Syncing BOOM ==="
rsync -av --delete $EXCLUDE "$SOURCE/boom/" "$DEST/boom/"
echo ""

echo "=== Syncing RUNNER ==="
rsync -av --delete $EXCLUDE "$SOURCE/runner/" "$DEST/runner/"
echo ""

echo "=== Building AL-MADINA ==="
cd "$SOURCE/al-madina"
# Temporarily patch ASSET_BASE to use relative path for subdirectory deployment
sed -i.bak "s|ASSET_BASE = '/assets'|ASSET_BASE = './assets'|" src/config.ts
npx vite build --base='./'
# Restore original
mv src/config.ts.bak src/config.ts
echo ""

echo "=== Syncing AL-MADINA (build output) ==="
rsync -av --delete "$SOURCE/al-madina/dist/" "$DEST/al-madina/"
echo ""

# HALCYON lives in its own repo, not in "Game Experiments", and needs no source
# patching: --base='./' is enough because the game loads zero files at runtime.
# Everything in it is generated in code, so the build output is only JavaScript.
#
# WARNING: this builds the WORKING TREE, not the last commit. Halcyon is built by
# waves of agents editing that tree in parallel, so check `git status` in
# $HALCYON_SRC first. A half-finished shader will ship if you do not.
# To build exactly what is committed instead:
#   git -C "$HALCYON_SRC" archive HEAD | tar -x -C /tmp/halcyon-clean
echo "=== Building HALCYON ==="
cd "$HALCYON_SRC"
npx vite build --base='./' --outDir dist --emptyOutDir
echo ""

echo "=== Syncing HALCYON (build output) ==="
rsync -av --delete "$HALCYON_SRC/dist/" "$DEST/halcyon/"
echo ""

echo "=== Done ==="
echo "Games synced to $DEST"
echo "Run 'git status' to see what changed."
