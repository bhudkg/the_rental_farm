# Deployment Runbook

End-to-end production deploy of The Rental Farm to a free Oracle Cloud Always
Free VM, with HTTPS via DuckDNS + Caddy, CI by GitHub Actions, CD by Jenkins.

```
push to main
   │
   ▼
GitHub Actions  ── build → push images → ghcr.io/<repo>/{backend,frontend}:<sha>
   │ webhook
   ▼
Jenkins (on VM) ── wait for image → backup DB → migrate → approve → deploy → smoke → rollback on fail
   │
   ▼
docker-compose.prod.yml   (postgres + backend + frontend)
   ▲
   └── Caddy (HTTPS for <sub>.duckdns.org, also serves /jenkins/)
```

---

## 0. Prerequisites you create yourself

- **Oracle Cloud account** (free tier).
- **DuckDNS subdomain + token** from <https://www.duckdns.org/>.
- **GitHub account** with this repo pushed to it.
- **GHCR PAT** — a classic personal access token with `read:packages` scope.

---

## 1. Provision the Oracle VM

1. Console → Compute → Instances → **Create instance**.
2. Image: **Canonical Ubuntu 22.04**. Shape: **VM.Standard.A1.Flex** (Ampere ARM), 2 OCPU / 12 GB RAM (Always Free).
3. Networking: assign a public IPv4. Add your SSH public key.
4. After it boots, edit the VCN's **Security List** → add ingress rules for **TCP 80** and **TCP 443** from `0.0.0.0/0`. (22 is open by default.)
5. SSH in: `ssh ubuntu@<VM-IP>`.

## 2. Run the bootstrap

```bash
# from your laptop
scp -r scripts ubuntu@<VM-IP>:/tmp/
ssh ubuntu@<VM-IP> 'sudo bash /tmp/scripts/server-setup.sh'
```

This installs Docker, creates the `deploy` user, opens the firewall, creates the `trf_edge` Docker network, installs the DuckDNS cron, and prints your VM's public IP.

## 3. Point DuckDNS at the VM

```bash
ssh ubuntu@<VM-IP>
sudo nano /etc/duckdns.env       # fill DUCKDNS_DOMAIN + DUCKDNS_TOKEN
sudo bash /opt/the-rental-farm/scripts/duckdns-update.sh   # should print OK
```

Verify: `dig +short <sub>.duckdns.org` returns the VM IP.

## 4. Copy the repo + config to the VM

```bash
# from your laptop, in the repo root
rsync -a --exclude .git --exclude node_modules --exclude __pycache__ \
    ./ deploy@<VM-IP>:/opt/the-rental-farm/
```

On the VM, create the two env files:

```bash
ssh deploy@<VM-IP>
cd /opt/the-rental-farm

# Platform env (Caddy + Jenkins)
cat > .platform.env <<EOF
DOMAIN=<sub>.duckdns.org
ACME_EMAIL=you@example.com
EOF
chmod 600 .platform.env

# App env (backend) — copy from .env.example and fill in real values
cp backend/.env.example backend/.env
nano backend/.env
chmod 600 backend/.env
```

## 5. Start the platform stack (Caddy + Jenkins)

```bash
cd /opt/the-rental-farm
docker compose -f docker-compose.platform.yml up -d
docker compose -f docker-compose.platform.yml logs -f caddy   # watch for cert issuance
```

When Caddy logs show a successful Let's Encrypt cert, visit:
- `https://<sub>.duckdns.org/jenkins/` → Jenkins setup screen
- `https://<sub>.duckdns.org/` → 502 (frontend not deployed yet — expected)

## 6. Configure Jenkins (one-time)

The first-boot wizard is disabled — get the initial admin password and create your admin user via the unlock screen:

```bash
docker exec trf_jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

In the Jenkins UI:

1. **Plugins** (Manage Jenkins → Plugins, install + restart):
   - GitHub Branch Source
   - Pipeline
   - Docker Pipeline
   - Credentials Binding
   - Timestamper
   - AnsiColor

2. **Global tools** — none needed; the Jenkins container has the host docker CLI mounted in.

3. **Credentials** (Manage Jenkins → Credentials → System → Global):
   - `ghcr-pat` — Username with password. Username = your GitHub login. Password = the GHCR PAT.
   - `trf-prod-env` — Secret file. Upload your filled-in `backend/.env`.

4. **Global properties → Environment variables**:
   - `APP_DIR` = `/opt/the-rental-farm`
   - `GHCR_REPO` = `ghcr.io/<owner>/<repo>` *(lowercase)*
   - `DOMAIN` = `<sub>.duckdns.org`

5. **New item → Multibranch Pipeline** named `the-rental-farm`:
   - Source: GitHub. Repository = `<owner>/<repo>`. Use the same `ghcr-pat` credential (the PAT also has repo read).
   - Build configuration: by Jenkinsfile (default). Path: `Jenkinsfile`.
   - Behaviors: discover branches → all branches; **filter to `main` only** for now.
   - Save → it will scan the repo and find `main`.

6. **GitHub webhook**: GitHub repo → Settings → Webhooks → Add.
   - Payload URL: `https://<sub>.duckdns.org/jenkins/github-webhook/`
   - Content type: `application/json`
   - Events: just push events.

## 7. Add GitHub Actions secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Name | Value |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | from Google Cloud OAuth |
| `VITE_MAPPLS_TOKEN` | from Mappls |
| `VITE_CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | from Cloudinary |

(`GITHUB_TOKEN` is auto-injected for GHCR pushes — nothing to add.)

## 8. First deploy

```bash
git push origin main
```

Watch:
- **GitHub Actions** tab → CI runs (lint + Trivy), then "Build & Push Images" runs.
- **Jenkins** → multibranch pipeline kicks off in parallel. It waits for the GHCR images to appear, runs migrations, then **pauses for manual approval**. Click **Deploy**.
- After Smoke test passes, visit `https://<sub>.duckdns.org/` — the app should be live.

## 9. Verifying & operating

```bash
# Health
curl -fsS https://<sub>.duckdns.org/api/health

# Logs
ssh deploy@<VM-IP>
docker compose -f /opt/the-rental-farm/docker-compose.prod.yml logs -f backend

# Manual rollback (if something slips past Jenkins)
cd /opt/the-rental-farm
PREV=$(cat PREVIOUS_TAG)
GHCR_REPO=<repo> TAG=$PREV docker compose -f docker-compose.prod.yml up -d

# Backups
ls /opt/the-rental-farm/backups
```

---

## Free-tier limits to be aware of

- **Oracle A1 capacity**: regions sometimes refuse new instances. If you can't launch in your home region, try Phoenix or Frankfurt.
- **GHCR storage**: 500 MB free for public packages, more for private. Keep cleanup pruning on.
- **GitHub Actions minutes**: 2,000/month for private repos. Public repos are unlimited.
- **DuckDNS**: 5 subdomains per account, no rate limits worth worrying about.

## What's intentionally not here yet

- Tests (deferred — you said testing only).
- Off-VM backups (script writes to `/opt/the-rental-farm/backups`; pipe to R2/B2 later).
- Monitoring (add Uptime Kuma to `docker-compose.platform.yml` when needed).
- Staging environment (current pipeline is single-environment).
