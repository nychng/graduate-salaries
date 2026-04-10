#!/bin/bash
# Deploy graduatesalary.co to SiteGround.
# Builds the Astro site and syncs it in two passes so old hashed assets
# remain available while the cache catches up to the new HTML.
# See: the SiteGround Dynamic Cache holds stale HTML for a while after
# a deploy, and if it references an asset that we already deleted, the
# client gets a 404 and the React island fails to hydrate.

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)/app"
REMOTE_USER="u3943-y1apabtx2mzd"
REMOTE_HOST="gsgpm1055.siteground.biz"
REMOTE_PORT="18765"
REMOTE_PATH="~/www/graduatesalary.co/public_html/"
SSH_CMD="ssh -p $REMOTE_PORT"

cd "$APP_DIR"

echo "==> Building..."
npm run build

echo "==> Uploading new assets (additive, no delete)..."
# Pass 1: upload everything without --delete so new hashed files appear
# alongside the old ones. Stale HTML served from cache can still resolve
# its script/CSS references.
rsync -avz \
  -e "$SSH_CMD" \
  "$APP_DIR/dist/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

echo "==> Syncing HTML and cleaning up old files..."
# Pass 2: run with --delete to remove anything that's no longer in dist/.
# By this point the new HTML is already on disk too, so the delete only
# affects unused hashed assets from previous builds.
rsync -avz --delete \
  -e "$SSH_CMD" \
  "$APP_DIR/dist/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

echo "==> Flushing SiteGround dynamic cache..."
# SiteGround exposes `sg-cache-purge` on some shared hosts. If it isn't
# available, we rely on the .htaccess no-cache headers for HTML and on
# Site Tools > Speed > Caching > Flush Cache for the one-off manual flush.
$SSH_CMD "$REMOTE_USER@$REMOTE_HOST" \
  "sg-cache-purge 2>/dev/null || echo '(sg-cache-purge not available; .htaccess handles HTML)'"

echo "==> Done. https://graduatesalary.co/"
