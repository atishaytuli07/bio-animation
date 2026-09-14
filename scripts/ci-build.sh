#!/usr/bin/env bash
#
# The wiki's build, exactly as iGEM's GitLab runner runs it.
#
# `.gitlab-ci.yml` calls this file and nothing else, and so does the local
# Docker rehearsal in scripts/test-ci.sh — one list of steps, so the check and
# the real pipeline cannot drift apart.
#
# What iGEM requires of it (teams.igem.org/go/deliverables/wiki/requirements):
#   - built from source on every push to main — no committed export
#   - "reproducible from a fresh clone with no manual steps"
#   - pinned dependencies: the lockfile is installed frozen, bun is pinned
#   - static output only, published from `public/`
#   - build output under the artifact size limit (5 MB)
#
# Why it is not the template's `vite build`: this app renders on a server, so
# a plain build produces a server bundle, not pages. build-static.mjs builds it,
# runs that server locally inside the job, crawls every route in the site map
# and writes each page as static HTML. Nothing runs on iGEM's side but files.
set -euo pipefail

cd "$(dirname "$0")/.."

# The base path is the repository's own name on gitlab.igem.org, which is the
# team slug. Taken from the project rather than hard-coded, so the links a build
# writes always match the place the build is served from.
SLUG="${CI_PROJECT_NAME:-${1:-nis-kazakhstan}}"
BUN_VERSION="1.3.8"
LIMIT_BYTES=$((5 * 1000 * 1000))

echo "── toolchain ─────────────────────────────────────"
node --version
if ! command -v bun >/dev/null 2>&1 || [ "$(bun --version)" != "$BUN_VERSION" ]; then
  npm install --global "bun@${BUN_VERSION}"
fi
bun --version

echo "── dependencies (frozen lockfile) ────────────────"
bun install --frozen-lockfile

echo "── static export under /${SLUG}/ ─────────────────"
node scripts/build-static.mjs --base="$SLUG"

echo "── size ──────────────────────────────────────────"
BYTES=$(du -sb dist-static | cut -f1)
echo "dist-static: ${BYTES} bytes (limit ${LIMIT_BYTES})"
if [ "$BYTES" -gt "$LIMIT_BYTES" ]; then
  echo "Build output exceeds iGEM's 5 MB artifact limit." >&2
  echo "Move images to static.igem.wiki via the Uploads tool." >&2
  exit 1
fi

echo "── publish to public/ ────────────────────────────"
# GitLab Pages serves the job's `public` artifact. This repository ALSO has a
# source folder called public/ — vite's static files, every image on the wiki.
# The export already contains copies of all of them, so in CI the folder is
# replaced rather than merged, and nothing stale can be published by accident.
#
# ONLY IN CI. On a runner the checkout is thrown away after the job; on a
# laptop this line would delete the site's source images. GitLab sets CI=true
# in every job, and the local rehearsal sets it inside its own container.
if [ "${CI:-}" = "true" ]; then
  rm -rf public
  cp -a dist-static public
  echo "published $(find public -type f | wc -l) files"
else
  echo "not in CI: leaving the source public/ alone. The export is in dist-static/."
fi
