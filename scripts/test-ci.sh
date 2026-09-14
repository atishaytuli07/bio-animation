#!/usr/bin/env bash
#
# Rehearse iGEM's GitLab pipeline locally, in the same image, from a clean tree.
#
# The pipeline cannot be run until the team's repository exists on
# gitlab.igem.org, and a build that only ever ran on a developer's laptop is
# not evidence that it runs on a runner: a different OS, no global bun, no
# node_modules, no .output left over from yesterday. So this:
#
#   1. packs exactly what a fresh clone would contain — tracked files plus
#      new files not ignored; never node_modules, .output or dist-static
#   2. runs scripts/ci-build.sh inside node:22 (the image .gitlab-ci.yml
#      names) with CI=true and CI_PROJECT_NAME set the way GitLab sets them
#   3. copies the published `public/` back out as dist-static/, and runs
#      scripts/verify-static.mjs against it under the same base path
#
# Needs Docker. Usage: bash scripts/test-ci.sh [slug=nis-kazakhstan]
set -euo pipefail

cd "$(dirname "$0")/.."
SLUG="${1:-nis-kazakhstan}"
IMAGE="$(sed -n 's/^image: *//p' .gitlab-ci.yml | head -1)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "── packing a fresh-clone tree ────────────────────"
git ls-files -co --exclude-standard -z | tar --null -T - -cf "$WORK/src.tar"
echo "$(tar -tf "$WORK/src.tar" | wc -l) files"

# Docker Desktop on Windows needs a Windows path for the mount.
MOUNT="$WORK"
if command -v cygpath >/dev/null 2>&1; then MOUNT="$(cygpath -w "$WORK")"; fi

echo "── running .gitlab-ci.yml's job in ${IMAGE} ───────"
MSYS_NO_PATHCONV=1 docker run --rm \
  -e CI=true \
  -e CI_PROJECT_NAME="$SLUG" \
  -v "$MOUNT:/io" \
  "$IMAGE" \
  bash -c 'set -euo pipefail
    mkdir /builds && cd /builds
    tar -xf /io/src.tar
    bash scripts/ci-build.sh
    test -f public/index.html
    tar -cf /io/public.tar public'

echo "── verifying what the job published ──────────────"
rm -rf dist-static
mkdir dist-static
tar -xf "$WORK/public.tar" -C "$WORK"
cp -a "$WORK/public/." dist-static/
node scripts/verify-static.mjs --base="$SLUG"
