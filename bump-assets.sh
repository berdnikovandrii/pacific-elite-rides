#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# Cache-busting for css/style.css and js/main.js.
#
# Why this exists: on 2026-09-30 a CSS change shipped with the HTML that
# needed it, but returning visitors kept a cached stylesheet. The result
# was a block of text ("Sending your request…") rendered raw at the top
# of the booking form for anyone who had visited before — i.e. exactly
# the people coming back from an ad.
#
# The version is the file's own content hash, so it changes when and only
# when the file changes. Run this after touching css/style.css or
# js/main.js, before committing:
#
#     ./bump-assets.sh
#
# It rewrites every HTML file in the repo root and in blog/, handles both
# the root-relative and ../ forms, and is safe to run twice.
# ──────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

hash_of() {
  if command -v md5 >/dev/null 2>&1; then md5 -q "$1" | cut -c1-8      # macOS
  else md5sum "$1" | cut -c1-8; fi                                      # Linux
}

CSS_V="$(hash_of css/style.css)"
JS_V="$(hash_of js/main.js)"

echo "css/style.css -> v=$CSS_V"
echo "js/main.js    -> v=$JS_V"

changed=0
for f in *.html blog/*.html; do
  [ -e "$f" ] || continue
  before="$(cat "$f")"
  # strip any existing ?v=… then append the current one
  perl -0pi -e "
    s{(href=\")((?:\.\./)?css/style\.css)(\?v=[0-9a-f]+)?(\")}{\$1\$2?v=$CSS_V\$4}g;
    s{(src=\")((?:\.\./)?js/main\.js)(\?v=[0-9a-f]+)?(\")}{\$1\$2?v=$JS_V\$4}g;
  " "$f"
  if [ "$before" != "$(cat "$f")" ]; then
    changed=$((changed+1))
  fi
done

echo "updated $changed file(s)"
