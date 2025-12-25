# Vajra Platform (Monorepo)

Vajra is a functional Security Operations Center (SOC) in a box for SMBs. This repository uses a Monorepo architecture to unify the dashboard and the "Twin Engines" backend.

## Architecture

- **Apps**
  - `apps/web`: Next.js 15 Dashboard.

- **Services**
  - `services/shield-engine`: Golang + Coraza WAF. (Port 8080)
  - `services/brain-worker`: Python FastAPI Scanner. (Port 8000)

- **Infrastructure**
  - Redis: Rate Limiting.
  - Postgres: Logger & Reports.

## Quick Start

1. **Start Infrastructure**:
   ```bash
   docker-compose up --build
   ```

2. **Access**:
   - Dashboard: http://localhost:3000
   - Shield WAF: http://localhost:8080
   - Brain API: http://localhost:8000/docs
