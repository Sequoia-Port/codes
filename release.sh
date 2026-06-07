#!/usr/bin/env bash
#
# release.sh — one command to authenticate, build, and publish
#              @sequoiaport/codes to npm. No more manual `npm login`.
#
# USAGE
#   ./release.sh                       # auth (if needed) + build + publish current version
#   NPM_TOKEN=npm_xxx ./release.sh     # fully headless: use the token (also persists it to ~/.npmrc)
#   ./release.sh --set-version 1.0.0   # bump version first, then build + publish
#   ./release.sh --tag-only            # don't publish from here — just commit+push a git tag
#                                      #   so the GitHub Actions OIDC workflow publishes it
#   ./release.sh --dry-run             # do everything except the actual publish
#
# AUTH (in priority order):
#   1. $NPM_TOKEN env var  -> written to ~/.npmrc (persisted; never asked again)
#   2. an already-valid session/token in ~/.npmrc
#   3. interactive `npm login` (opens your browser, one time)
#
# DIST-TAG is chosen automatically: a pre-release version (anything with a
# hyphen, e.g. 1.0.0-beta.0) publishes under `beta`; clean semver -> `latest`.

set -euo pipefail
cd "$(dirname "$0")"

REGISTRY="https://registry.npmjs.org/"
TAG_ONLY=false
DRY_RUN=false
SET_VERSION=""

# ---- args ------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag-only)    TAG_ONLY=true; shift ;;
    --dry-run)     DRY_RUN=true; shift ;;
    --set-version) SET_VERSION="${2:?--set-version needs a version}"; shift 2 ;;
    -h|--help)     sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1 (try --help)"; exit 1 ;;
  esac
done

# ---- optional version bump -------------------------------------------------
if [[ -n "$SET_VERSION" ]]; then
  echo "==> setting version to $SET_VERSION"
  npm version "$SET_VERSION" --no-git-tag-version >/dev/null
fi

NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"
if [[ "$VERSION" == *-* ]]; then DIST_TAG="beta"; else DIST_TAG="latest"; fi
echo "==> $NAME@$VERSION   (dist-tag: $DIST_TAG)"

# ---- CI path: tag + push, let GitHub Actions publish via OIDC --------------
if $TAG_ONLY; then
  if ! git diff --quiet -- package.json; then
    git add package.json && git commit -m "release: v$VERSION"
  fi
  git tag "v$VERSION"
  git push
  git push origin "v$VERSION"
  echo "==> pushed tag v$VERSION — GitHub Actions will build + publish via OIDC."
  echo "    (requires the one-time Trusted Publisher config on npmjs.com — see PUBLISHING.md)"
  exit 0
fi

# ---- ensure npm auth -------------------------------------------------------
if [[ -n "${NPM_TOKEN:-}" ]]; then
  echo "==> using NPM_TOKEN from env (persisting to ~/.npmrc)"
  npm config set "@sequoiaport:registry" "$REGISTRY"
  npm config set "//registry.npmjs.org/:_authToken" "$NPM_TOKEN"
elif npm whoami >/dev/null 2>&1; then
  echo "==> already authenticated as $(npm whoami)"
else
  echo "==> not authenticated — launching 'npm login' (opens your browser)…"
  npm login
fi

# ---- build -----------------------------------------------------------------
echo "==> installing deps + building…"
npm ci
npm run build

# ---- publish ---------------------------------------------------------------
PUBLISH_ARGS=(--tag "$DIST_TAG" --access public)
if $DRY_RUN; then
  echo "==> DRY RUN: npm publish ${PUBLISH_ARGS[*]} --dry-run"
  npm publish "${PUBLISH_ARGS[@]}" --dry-run
  echo "==> dry run complete (nothing published)."
  exit 0
fi

echo "==> publishing $NAME@$VERSION to '$DIST_TAG'…"
npm publish "${PUBLISH_ARGS[@]}"
echo ""
echo "==> published: https://www.npmjs.com/package/${NAME}/v/${VERSION}"
echo "    install:   npm i ${NAME}@${VERSION}"
