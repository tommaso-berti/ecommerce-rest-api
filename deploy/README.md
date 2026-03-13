# VPS Deploy Guide (Demo) - shop.tommasoberti.com

This setup keeps frontend and backend on the same domain:

- frontend static files on `https://shop.tommasoberti.com`
- backend proxied under `https://shop.tommasoberti.com/api/*`
- local PostgreSQL on VPS
- backend on `127.0.0.1:3001`
- versioned releases + `current` symlink
- database reset on every backend deploy (demo mode)

## 1) VPS folder structure

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

## 2) Manual VPS operations (run once)

0. Optional: clone repository for templates/manual files

You do not need a permanent clone on VPS for automated deploys.  
If you want to copy template files easily, use:

```bash
sudo mkdir -p /srv/webapps/shop.tommasoberti.com/repo
sudo chown -R "$USER:$USER" /srv/webapps/shop.tommasoberti.com/repo
git clone <YOUR_REPO_URL> /srv/webapps/shop.tommasoberti.com/repo
```

1. Create service user:

```bash
sudo adduser --system --group --home /srv/webapps/shop.tommasoberti.com shop
```

2. Create folders:

```bash
sudo mkdir -p /srv/webapps/shop.tommasoberti.com/frontend/releases
sudo mkdir -p /srv/webapps/shop.tommasoberti.com/backend/releases
sudo mkdir -p /srv/webapps/shop.tommasoberti.com/backend/shared
sudo chown -R shop:shop /srv/webapps/shop.tommasoberti.com
```

3. Install dependencies (if missing):

```bash
sudo apt update
sudo apt install -y caddy postgresql postgresql-contrib nodejs npm
```

4. Create PostgreSQL database and user:

```bash
sudo -u postgres psql
CREATE DATABASE shop_tommasoberti;
CREATE USER shop_app WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE shop_tommasoberti TO shop_app;
\q
```

`CHANGE_ME_STRONG_PASSWORD` is the real PostgreSQL password for `shop_app`.
Use the same exact value later in `.env` as `DB_PASSWORD`.

5. Create backend env file:

```bash
sudo cp /srv/webapps/shop.tommasoberti.com/repo/deploy/backend.env.example /srv/webapps/shop.tommasoberti.com/backend/shared/.env
sudo chown shop:shop /srv/webapps/shop.tommasoberti.com/backend/shared/.env
sudo chmod 600 /srv/webapps/shop.tommasoberti.com/backend/shared/.env
sudo nano /srv/webapps/shop.tommasoberti.com/backend/shared/.env
```

Inside `/srv/webapps/shop.tommasoberti.com/backend/shared/.env`:

- set `DB_PASSWORD` to the same password used in `CREATE USER shop_app ... PASSWORD '...'`
- generate `SESSION_SECRET` with:

```bash
openssl rand -hex 64
```

and paste the output as:

```env
SESSION_SECRET=<generated-value>
```

6. Install Caddy site config:

```bash
sudo cp /srv/webapps/shop.tommasoberti.com/repo/deploy/caddy/shop.tommasoberti.com.caddy /etc/caddy/sites-enabled/shop.tommasoberti.com.caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

7. Install backend systemd service:

```bash
sudo cp /srv/webapps/shop.tommasoberti.com/repo/deploy/systemd/shop-tommasoberti-backend.service /etc/systemd/system/shop-tommasoberti-backend.service
sudo systemctl daemon-reload
sudo systemctl enable shop-tommasoberti-backend
sudo systemctl restart shop-tommasoberti-backend
```

## 3) GitHub Actions workflows

- Frontend workflow: `.github/workflows/deploy-frontend.yml`
- Backend workflow: `.github/workflows/deploy-backend.yml`

Deploy target paths used by GitHub Actions:

- frontend deploys to `/srv/webapps/shop.tommasoberti.com/frontend/releases/...`
- backend deploys to `/srv/webapps/shop.tommasoberti.com/backend/releases/...`

The optional `/srv/webapps/shop.tommasoberti.com/repo` clone is not used at runtime.

Required GitHub secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY_SHOP`

### SSH key setup for this project (manual, recommended)

Generate a dedicated key on your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-shop" -f ~/.ssh/shop_deploy_key
```

Print the public key:

```bash
cat ~/.ssh/shop_deploy_key.pub
```

Then on VPS, add it to `deploy` user:

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
```

Paste the full public key in a new line, save, then:

```bash
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

Test from local machine:

```bash
ssh -i ~/.ssh/shop_deploy_key deploy@<VPS_HOST> "echo ok"
```

Set secret `VPS_SSH_KEY_SHOP` with the private key content:

```bash
cat ~/.ssh/shop_deploy_key
```

## 4) How schema and sample data are loaded

Your backend code resets DB only in development (`NODE_ENV=development`).
In production/demo, reset is handled by backend deploy workflow:

```bash
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f /srv/webapps/shop.tommasoberti.com/backend/current/database/schema.sql
```

Because `database/schema.sql` already includes sample products, every backend deploy starts from a clean demo dataset.

## 5) Verify after deploy

```bash
curl -I https://shop.tommasoberti.com
curl https://shop.tommasoberti.com/api/health
sudo systemctl status shop-tommasoberti-backend
readlink -f /srv/webapps/shop.tommasoberti.com/frontend/current
readlink -f /srv/webapps/shop.tommasoberti.com/backend/current
journalctl -u shop-tommasoberti-backend -f
```

## 6) Optional cleanup after automation works

Once Actions deploy correctly and both `current` symlinks are healthy, you can remove the temporary clone:

```bash
rm -rf /srv/webapps/shop.tommasoberti.com/repo
```
