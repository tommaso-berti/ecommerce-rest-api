# VPS Deploy Runbook (Demo)

Production-style deploy for `shop.tommasoberti.com` using:

- Caddy (HTTPS + reverse proxy)
- systemd (backend process)
- PostgreSQL local on VPS
- GitHub Actions (frontend + backend)
- Versioned releases (`releases/vX.Y.Z` + `current` symlink)
- Database reset on every backend deploy (demo mode)

No Docker. Same domain for frontend and backend. API under `/api`.

## 1) Final architecture

```text
/srv/webapps/shop.tommasoberti.com/
  frontend/
    releases/vX.Y.Z/
    current -> releases/vX.Y.Z
  backend/
    releases/vX.Y.Z/
    current -> releases/vX.Y.Z
    shared/.env
```

- Caddy serves static frontend from `frontend/current`.
- Caddy proxies `/api/*` to `127.0.0.1:3001`.
- Backend service runs as `shop` user.
- Frontend and backend deploy independently.

## 2) DNS and network prerequisites

In Cloudflare DNS:

- `A shop -> <VPS_IP>` (DNS only)
- `A www.shop -> <VPS_IP>` (DNS only)

On VPS firewall:

- open `80/tcp`
- open `443/tcp`
- open `22/tcp`

## 3) One-time VPS setup

### 3.1 Create users/folders

```bash
sudo adduser --system --group --home /srv/webapps/shop.tommasoberti.com shop

sudo mkdir -p /srv/webapps/shop.tommasoberti.com/frontend/releases
sudo mkdir -p /srv/webapps/shop.tommasoberti.com/backend/releases
sudo mkdir -p /srv/webapps/shop.tommasoberti.com/backend/shared
sudo chown -R shop:shop /srv/webapps/shop.tommasoberti.com

# allow deploy user to write releases
sudo usermod -aG shop deploy
sudo chmod -R 2775 /srv/webapps/shop.tommasoberti.com/frontend
sudo chmod -R 2775 /srv/webapps/shop.tommasoberti.com/backend
```

### 3.2 Install packages

```bash
sudo apt update
sudo apt install -y caddy postgresql postgresql-contrib nodejs npm
```

### 3.3 Configure PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE shop_tommasoberti;
CREATE USER shop_app WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE shop_tommasoberti TO shop_app;
\q
```

Grant schema permissions (required for `schema.sql` reset):

```bash
sudo -u postgres psql -d shop_tommasoberti
ALTER DATABASE shop_tommasoberti OWNER TO shop_app;
GRANT ALL ON SCHEMA public TO shop_app;
ALTER SCHEMA public OWNER TO shop_app;
ALTER ROLE shop_app SET search_path TO public;
\q
```

### 3.4 Create backend env

You can copy the template:

```bash
sudo cp /srv/webapps/shop.tommasoberti.com/repo/deploy/backend.env.example /srv/webapps/shop.tommasoberti.com/backend/shared/.env
```

or create file manually:

```bash
sudo nano /srv/webapps/shop.tommasoberti.com/backend/shared/.env
```

Required content:

```env
NODE_ENV=production
PORT=3001
DB_USER=shop_app
DB_HOST=127.0.0.1
DB_NAME=shop_tommasoberti
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_PORT=5432
SESSION_SECRET=CHANGE_ME_LONG_RANDOM
CLIENT_ORIGIN=https://shop.tommasoberti.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://shop.tommasoberti.com/api/auth/google/callback
```

Generate session secret:

```bash
openssl rand -hex 64
```

Secure file:

```bash
sudo chown shop:shop /srv/webapps/shop.tommasoberti.com/backend/shared/.env
sudo chmod 600 /srv/webapps/shop.tommasoberti.com/backend/shared/.env
```

### 3.5 Install Caddy site config

```bash
sudo cp /srv/webapps/shop.tommasoberti.com/repo/deploy/caddy/shop.tommasoberti.com.caddy /etc/caddy/sites-enabled/shop.tommasoberti.com.caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Main Caddyfile must include:

```caddy
import sites-enabled/*
```

### 3.6 Install systemd backend service

```bash
sudo cp /srv/webapps/shop.tommasoberti.com/repo/deploy/systemd/shop-tommasoberti-backend.service /etc/systemd/system/shop-tommasoberti-backend.service
sudo systemctl daemon-reload
sudo systemctl enable shop-tommasoberti-backend
sudo systemctl restart shop-tommasoberti-backend
```

### 3.7 Allow deploy user to reload/restart services without password

```bash
sudo visudo -f /etc/sudoers.d/deploy-caddy-backend
```

Insert:

```text
Cmnd_Alias SHOP_DEPLOY_CMDS = /usr/bin/systemctl reload caddy, /usr/bin/systemctl restart shop-tommasoberti-backend
deploy ALL=(root) NOPASSWD: SHOP_DEPLOY_CMDS
```

Validate automatically on save with `visudo`.

## 4) GitHub Actions setup

Workflows:

- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-backend.yml`

Required repo secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY_SHOP`

### Dedicated SSH key for this project

On local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-shop" -f ~/.ssh/shop_deploy_key
cat ~/.ssh/shop_deploy_key.pub
```

On VPS:

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

Add private key to GitHub secret:

```bash
cat ~/.ssh/shop_deploy_key
```

## 5) Deploy flow

Frontend workflow:

1. Build `client/dist`
2. Upload to `/frontend/releases/vX.Y.Z`
3. `current -> release`
4. `systemctl reload caddy`
5. keep last 5 releases

Backend workflow:

1. Pack `server/` + `database/schema.sql`
2. Upload to `/backend/releases/vX.Y.Z`
3. `npm ci --omit=dev`
4. `current -> release`
5. reset DB with `schema.sql` (demo clean state)
6. `systemctl restart shop-tommasoberti-backend`
7. keep last 5 releases

## 6) Validation checklist

```bash
dig +short shop.tommasoberti.com
dig +short www.shop.tommasoberti.com

curl -I https://shop.tommasoberti.com
curl -I https://www.shop.tommasoberti.com
curl -i https://shop.tommasoberti.com/api/health
curl -i https://shop.tommasoberti.com/api/products

sudo systemctl status caddy
sudo systemctl status shop-tommasoberti-backend

readlink -f /srv/webapps/shop.tommasoberti.com/frontend/current
readlink -f /srv/webapps/shop.tommasoberti.com/backend/current
```

## 7) Troubleshooting (most common)

### `ERR_SSL_PROTOCOL_ERROR`

- check DNS `A` records for `shop` and `www.shop`
- check Caddy site file includes both hosts
- run:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo journalctl -u caddy -n 200 --no-pager
```

### Frontend returns `403`

Usually file/directory permissions.

```bash
FRONT_RELEASE="$(readlink -f /srv/webapps/shop.tommasoberti.com/frontend/current)"
sudo chmod 755 /srv /srv/webapps /srv/webapps/shop.tommasoberti.com /srv/webapps/shop.tommasoberti.com/frontend /srv/webapps/shop.tommasoberti.com/frontend/releases
sudo find "$FRONT_RELEASE" -type d -exec chmod 755 {} \;
sudo find "$FRONT_RELEASE" -type f -exec chmod 644 {} \;
sudo systemctl reload caddy
```

### `/api/products` returns `500`

Usually DB schema missing or `public` schema permissions missing.
Re-run section **3.3**, then:

```bash
set -a
source /srv/webapps/shop.tommasoberti.com/backend/shared/.env
set +a
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /srv/webapps/shop.tommasoberti.com/backend/current/database/schema.sql
sudo systemctl restart shop-tommasoberti-backend
```

### `/api/me` returns `401`

Normal if not logged in.  
If it stays `401` after login, make sure backend is deployed with latest code (proxy session fix in `server/src/app.js` using `trust proxy` in production), then clear browser cookies and login again.

### Browser console errors from `bootstrap-autofill-overlay.js`

That is a browser extension (not app/backend).  
Test in incognito with extensions disabled for clean debugging.

## 8) Optional cleanup

If you used a temporary clone for templates:

```bash
rm -rf /srv/webapps/shop.tommasoberti.com/repo
```

Deploy runtime does not require it.

## 9) Public repository security checklist

Before making the repository public:

1. Confirm `.env` is not tracked by git.
2. Keep only placeholder values in `.env.example`.
3. Rotate production secrets if they were ever committed:
   - DB password (`shop_app`)
   - `SESSION_SECRET`
   - any OAuth client secret
4. Keep deploy private key only in GitHub Secrets (`VPS_SSH_KEY_SHOP`), never in repo files.
5. Use least privilege:
   - deploy user limited sudo commands only
   - backend process user separated from deploy user
