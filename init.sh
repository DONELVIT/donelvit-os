#!/usr/bin/env bash
set -euo pipefail

echo '=== DONELVIT OS Harness Initialization ==='

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Node.js and npm are required. Install Node.js 20 LTS or newer, then retry.' >&2
  exit 1
fi

if [ "${SKIP_INSTALL:-false}" != 'true' ] && [ ! -d node_modules ]; then
  echo '=== npm ci (node_modules is absent) ==='
  npm ci
fi

echo '=== npm run typecheck ==='
npm run typecheck

echo '=== npm run build ==='
npm run build

echo '=== Verification Complete ==='
echo 'Record the command result in feature_list.json and progress.md before declaring a feature complete.'
