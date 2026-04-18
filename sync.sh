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

echo "=== Done ==="
echo "Games synced to $DEST"
echo "Run 'git status' to see what changed."
