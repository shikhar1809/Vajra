# VAJRA Security Platform

> Full-scale enterprise security platform with AI-driven vulnerability analysis, real-time threat detection, and compliance reporting.

## 🚀 Quick Start

```bash
cd vajra

# 1. Configure environment
cp .env.example backend/.env
# Add your GEMINI_API_KEY to backend/.env

# 2. Start services
docker-compose up -d --build

# 3. Access platform
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

## 📋 Features

### Command Center
- **Live Threat Stream**: Real-time SSE threat monitoring
- **Portfolio Risk Analysis**: Tremor charts for risk visualization
- **Fortress Mode**: System-wide read-only lockdown
- **AI Vulnerability Analysis**: Drag-and-drop code scanning

### Vendor Risk Management
- Risk scoring and tracking
- Simulate breach scenarios
- Real-time risk updates

### Compliance & Reporting
- AI-generated SOC2 reports
- Event logging and analysis
- Markdown export

## 🛠️ Tech Stack

- **Backend**: FastAPI, DuckDB, Semgrep, Trivy, Gemini 1.5 Pro
- **Frontend**: Next.js 14, Tailwind CSS, Tremor, Framer Motion
- **Infrastructure**: Docker, Docker Compose

## 📚 Documentation

See [walkthrough.md](./walkthrough.md) for complete implementation details.

## 🔐 Security Features

- ✅ SAST scanning with Semgrep
- ✅ Container scanning with Trivy
- ✅ AI-powered code fixes
- ✅ Rate limiting (20 req/sec)
- ✅ Fortress Mode lockdown
- ✅ Real-time threat detection

## 📊 API Endpoints

```
GET  /api/v1/threats/stream       # SSE threat feed
GET  /api/v1/vendors               # Vendor management
POST /api/v1/scan/upload           # Code analysis
POST /api/v1/fortress/toggle       # Fortress Mode
GET  /api/v1/compliance/report     # SOC2 reports
```

## 🎯 Status

**Production Ready** - All features implemented and tested.
