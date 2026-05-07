#!/bin/bash
# pg_dump from the running trf_postgres container.
# Called by Jenkins before migrations; also safe to run from cron.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/the-rental-farm/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

if ! docker ps --format '{{.Names}}' | grep -q '^trf_postgres$'; then
    echo "trf_postgres not running — skipping backup (first deploy?)"
    exit 0
fi

OUT="$BACKUP_DIR/db-${TS}.sql.gz"
docker exec trf_postgres pg_dump \
    -U "${POSTGRES_USER:-rental_farm_user}" \
    -d "${POSTGRES_DB:-the_rental_farm}" \
    | gzip -9 > "$OUT"

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"

find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete
