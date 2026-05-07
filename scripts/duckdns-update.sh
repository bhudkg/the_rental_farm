#!/bin/bash
# Refresh the DuckDNS A record to the VM's current public IP.
# Install via: crontab -e
#   */5 * * * * /opt/the-rental-farm/scripts/duckdns-update.sh >> /var/log/duckdns.log 2>&1
#
# Required env (set in /etc/duckdns.env, sourced below):
#   DUCKDNS_DOMAIN  subdomain only, e.g. "trfdemo" (NOT trfdemo.duckdns.org)
#   DUCKDNS_TOKEN   token from https://www.duckdns.org/

set -euo pipefail

# shellcheck disable=SC1091
[ -f /etc/duckdns.env ] && . /etc/duckdns.env

: "${DUCKDNS_DOMAIN:?DUCKDNS_DOMAIN not set}"
: "${DUCKDNS_TOKEN:?DUCKDNS_TOKEN not set}"

RESPONSE=$(curl -fsS "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=")
echo "$(date -u +%FT%TZ) duckdns: $RESPONSE"
[ "$RESPONSE" = "OK" ]
