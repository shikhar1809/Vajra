# Vajra Production Deployment Guide

You do NOT need to run `docker-compose up` manually every time. Here is how to make it run permanently on a server (like DigitalOcean, AWS, or a home server).

## 1. Run in Background (Daemon Mode)
Instead of just `up`, add the `-d` flag. This frees up your terminal and runs it in the background.

```bash
docker-compose up -d --build
```

## 2. Auto-Restarting
We have already added `restart: always` to your `docker-compose.yml` file.
This means:
- If the app crashes, Docker restarts it.
- If the server reboots, Docker starts the app automatically when it boots up.

**You don't need to do anything else.** Just run `docker-compose up -d` once, and it will stay running forever until you stop it.

## 3. Updating the App
When you change code, just run:
```bash
# 1. Pull latest changes (if using git)
git pull

# 2. Rebuild and restart (Docker handles the swap gracefully)
docker-compose up -d --build
```

## 4. Production Checklist (Optional Enhancements)
If deploying to a real domain (e.g., `vajra.yourmcompany.com`):

1. **Reverse Proxy (Nginx/Caddy)**: Put Nginx in front of port 3000/8080 to handle HTTPS (SSL).
2. **Environment Variables**: Create a `.env.production` file with real passwords.
   ```env
   POSTGRES_PASSWORD=SuperSecretPassword123!
   REDIS_PASSWORD=AnotherSecret!
   ```
3. **Firewall**: Block ports 5432 (DB) and 6379 (Redis) from the outside world. Only allow 80/443.

## Summary
**No, you do not need to run it manually.**
1. SSH into your server.
2. Run `docker-compose up -d`.
3. Disconnect. It will keep running 24/7.
