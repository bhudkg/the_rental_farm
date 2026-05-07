#!/bin/bash
#
# One-time VPS provisioning for The Rental Farm on Oracle Cloud Always Free
# Ampere A1 (Ubuntu 22.04+ ARM64). Run as root:
#
#   scp scripts/server-setup.sh ubuntu@<VM-IP>:/tmp/
#   ssh ubuntu@<VM-IP> 'sudo bash /tmp/server-setup.sh'
#
# After this finishes, see DEPLOYMENT.md for the remaining manual steps
# (DuckDNS env, .platform.env, Jenkins first-boot, GitHub secrets).

set -euo pipefail

APP_DIR="/opt/the-rental-farm"
DEPLOY_USER="deploy"
EDGE_NETWORK="trf_edge"

echo "==> Updating system packages..."
apt-get update && apt-get upgrade -y

echo "==> Installing Docker..."
apt-get install -y ca-certificates curl gnupg rsync
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "==> Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    mkdir -p /home/$DEPLOY_USER/.ssh
    cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/ 2>/dev/null \
        || cp /home/ubuntu/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/ 2>/dev/null \
        || true
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true
fi

echo "==> Creating app directory tree..."
mkdir -p "$APP_DIR"/{backend,scripts,backups}
chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"

echo "==> Creating shared Docker network ($EDGE_NETWORK)..."
docker network inspect "$EDGE_NETWORK" >/dev/null 2>&1 \
    || docker network create "$EDGE_NETWORK"

echo "==> Configuring firewall (ufw)..."
# Oracle blocks ports at the VCN security list level too — open 80/443 there.
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Oracle Ubuntu images ship with iptables rules that drop inbound traffic.
# Persist accept rules for HTTP/HTTPS so Caddy is reachable.
if command -v netfilter-persistent >/dev/null 2>&1; then
    iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
    netfilter-persistent save
fi

echo "==> Installing DuckDNS updater..."
install -m 755 "$(dirname "$0")/duckdns-update.sh" /opt/the-rental-farm/scripts/duckdns-update.sh 2>/dev/null || true
if [ ! -f /etc/duckdns.env ]; then
    cat > /etc/duckdns.env <<'EOF'
# Fill these in then test: bash /opt/the-rental-farm/scripts/duckdns-update.sh
DUCKDNS_DOMAIN=
DUCKDNS_TOKEN=
EOF
    chmod 600 /etc/duckdns.env
fi
# Cron entry (idempotent)
CRON_LINE="*/5 * * * * /opt/the-rental-farm/scripts/duckdns-update.sh >> /var/log/duckdns.log 2>&1"
(crontab -l 2>/dev/null | grep -v duckdns-update.sh; echo "$CRON_LINE") | crontab -

echo "==> Enabling Docker on boot..."
systemctl enable docker
systemctl start docker

cat <<EOF

=============================================
  Server setup complete!
=============================================

Next steps (see DEPLOYMENT.md for full detail):

  1. Edit /etc/duckdns.env with your DuckDNS subdomain + token, then run:
       bash /opt/the-rental-farm/scripts/duckdns-update.sh

  2. Copy your repo to $APP_DIR (or let Jenkins do it on first deploy):
       rsync -a --exclude .git ./ $DEPLOY_USER@<VM-IP>:$APP_DIR/

  3. Create $APP_DIR/.platform.env:
       DOMAIN=<sub>.duckdns.org
       ACME_EMAIL=you@example.com

  4. Bring up the platform stack (Caddy + Jenkins):
       cd $APP_DIR
       docker compose -f docker-compose.platform.yml up -d

  5. Visit https://<sub>.duckdns.org/jenkins/ — finish first-boot setup,
     create credentials (ghcr-pat, trf-prod-env), point a multibranch pipeline
     at this repo, and add the GitHub webhook.

VM public IP: $(curl -sf ifconfig.me || echo '<unknown>')
EOF
