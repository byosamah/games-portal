#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="/Users/osamakhalil/dev/Game Experiments"
DEST="$SCRIPT_DIR"

EXCLUDE="--exclude=.git --exclude=.DS_Store --exclude=.claude --exclude=.vercel --exclude=.github --exclude=node_modules --exclude=CLAUDE.md --exclude=.gitignore"

echo "=== Syncing BOOM ==="
rsync -av --delete $EXCLUDE "$SOURCE/boom/" "$DEST/boom/"
echo ""

echo "=== Syncing RUNNER ==="
rsync -av --delete $EXCLUDE "$SOURCE/runner/" "$DEST/runner/"
echo ""

echo "=== Building SPACE ==="
cd "$SOURCE/space"
npm run build
echo ""

echo "=== Syncing SPACE (build output) ==="
rsync -av --delete "$SOURCE/space/dist/" "$DEST/space/"
echo ""

echo "=== Done ==="
echo "Games synced to $DEST"
echo "Run 'git status' to see what changed."
