#!/bin/sh
set -eu

if [ -z "${ZENITH_AUTH_TOKEN:-}" ]; then
  ZENITH_AUTH_TOKEN="$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')"
  export ZENITH_AUTH_TOKEN
  printf '%s\n' "WARN: ZENITH_AUTH_TOKEN is not configured; generated one-time access token: ${ZENITH_AUTH_TOKEN}" >&2
fi

exec "$@"
