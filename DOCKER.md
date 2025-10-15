# Docker: Serve frontend static site with nginx

This repository hosts a small static frontend (HTML/CSS/JS) that calls a Lambda to generate QR codes. The Dockerfile below packages the static files into an nginx container for easy local testing and deployments.

Build the image (from the repo root):

docker build -t serverless-qr-frontend:local .
docker run --rm -p 8080:80 serverless-qr-frontend:local

```bash
# macOS / zsh
docker build -t serverless-qr-frontend:local .
```

Run the container (expose port 8080 locally):

```bash
docker run --rm -p 8080:80 serverless-qr-frontend:local
```

Open http://localhost:8080 in your browser.

Run with docker-compose on port 801 (recommended for servers)

```bash
# from repo root
docker-compose up -d --build
```

This compose file maps host port 801 -> container port 80 so after the compose run your site will be available at:

http://<HOST_IP>:801

Deploy on your own server (example steps)

1. Install Docker & Docker Compose on the server (Ubuntu example):

```bash
# install docker (official script)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# install docker-compose (v2 as plugin) - if needed
sudo apt update
sudo apt install -y docker-compose-plugin

# add your user to docker group (optional)
sudo usermod -aG docker $USER
```

2. Copy repository to the server (git clone or rsync):

```bash
# on your server
git clone <your-repo-url> serverless-qr
cd serverless-qr
```

3. Build and run with docker-compose (maps port 801):

```bash
docker compose up -d --build
# or with older docker-compose binary: docker-compose up -d --build
```

4. Make the service persistent and start on boot (systemd wrapper example):

Create: `/etc/systemd/system/serverless-qr-frontend.service`

```ini
[Unit]
Description=Serverless QR Frontend (docker-compose)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=/path/to/serverless-qr
RemainAfterExit=yes
ExecStart=/usr/bin/docker compose up -d --build
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
```

```bash
# enable and start
sudo systemctl daemon-reload
sudo systemctl enable --now serverless-qr-frontend.service
```

Notes & tips

- The container only serves the static frontend. The Lambda URL used by the frontend is still the one in `script.js`.
- If you want to host the Lambda-like endpoint locally too, I can add a small Python Flask server in another service and wire docker-compose to run both (and update `script.js` to call the local backend). This will allow full end-to-end local testing.
- If your server is behind a firewall or cloud security group, open TCP port 801 so external requests can reach the container.

Host port configuration

The included `docker-compose.yml` maps the host port using an environment variable `HOST_PORT` with a default value of `801`. You can change the host port in any of these ways:

- Create a `.env` file in the repo root (recommended):

```bash
# copy example
cp .env.example .env
# edit .env and change HOST_PORT if desired
```

- Or pass the variable inline when bringing up the compose stack:

```bash
HOST_PORT=801 docker compose up -d --build
```

Container-only port (inside the container) remains 80. The environment-only configuration ensures the app runs on port 80 inside the container but is reachable externally on whichever host port you choose (801 by default).
