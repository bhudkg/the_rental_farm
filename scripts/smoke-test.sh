#!/bin/bash
# Post-deploy smoke test. Hits the backend health endpoint and the frontend root
# from inside the trf_edge network so we don't depend on DNS/HTTPS being up yet.
set -euo pipefail

NETWORK="${NETWORK:-trf_edge}"
TIMEOUT="${TIMEOUT:-60}"

check() {
    local name="$1" url="$2" deadline=$(( $(date +%s) + TIMEOUT ))
    while [ "$(date +%s)" -lt "$deadline" ]; do
        if docker run --rm --network "$NETWORK" curlimages/curl:8.10.1 -fsS -m 5 "$url" >/dev/null 2>&1; then
            echo "  $name OK"
            return 0
        fi
        sleep 2
    done
    echo "  $name FAILED ($url)"
    return 1
}

echo "Smoke testing on network=$NETWORK timeout=${TIMEOUT}s"
check "backend /api/health" "http://trf_backend:8000/api/health"
check "frontend /"          "http://trf_frontend/"
echo "Smoke tests passed."
