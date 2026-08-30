#!/usr/bin/env bash
#
# One command that must pass before anything is committed.
#
# It exists because of a real failure: the check being run was
#
#   bun run build 2>&1 | grep -E "✓ built" | head -1 && git commit …
#
# A pipeline takes its exit status from the LAST command, and `head` always
# succeeds. So the build could fail, grep could match nothing, and the commit
# would still run. A broken build was committed and pushed that way.
#
# `set -euo pipefail` is the whole point of this file: pipefail makes a
# pipeline fail if ANY stage fails, and -e stops on the first error.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "── lint ──────────────────────────────────────────"
./node_modules/.bin/eslint src --max-warnings=0

echo "── types ─────────────────────────────────────────"
./node_modules/.bin/tsc --noEmit

echo "── build ─────────────────────────────────────────"
bun run build

echo
echo "✓ lint, types and build all pass"
