# YAHSHUA Universal Renewable Energy Platform

[![GitHub License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-20%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![Security Audit](https://img.shields.io/badge/security-audited-green)](SECURITY.md)

## 🌍 Overview

**YAHSHUA** is an enterprise-grade, full-stack renewable energy operating system serving all renewable technologies (Solar, Wind, Hydro, Geothermal, Biomass, Ocean Energy) with **automation-first architecture**, real-time monitoring, and **500+ partner integration framework**. Engineered for mission-critical renewable energy management with 75-96% automation capability.

### Key Capabilities
- 🏭 **Multi-Technology Support**: Solar, Wind, Hydro, Geothermal, Biomass, Ocean Energy, Storage
- ⚡ **Real-Time Monitoring**: WebSocket-powered live dashboards with <100ms latency
- 🔐 **Enterprise Security**: JWT authentication, RBAC with 6 user roles, encrypted data transmission
- 📊 **Time-Series Analytics**: TimescaleDB optimized for energy data with historical analysis
- 🔄 **Event-Driven Architecture**: Kafka-based event streaming for multi-system coordination
- 🌐 **API-First Design**: REST + GraphQL APIs, 20+ endpoints, comprehensive partner integrations
- 📱 **Multi-Platform**: Web (Next.js), Mobile ready, Admin Dashboard
- 🐳 **Container-Ready**: Docker & Kubernetes orchestration, production-grade deployments

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State Management**: React Context & Hooks
- **Real-Time**: WebSocket/Socket.io integration
- **Charts**: Advanced data visualization (renewable energy metrics)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.21+
- **Language**: TypeScript 5 (strict mode)
- **GraphQL**: Apollo Server (schema-driven API)
- **Authentication**: JWT tokens, bcryptjs hashing
- **Event System**: Kafka 2.2 for event streaming

### Database & Cache
- **Primary Database**: PostgreSQL 15+
- **Time-Series**: TimescaleDB (energy data optimization)
- **ORM**: Prisma 6.14+ (type-safe queries)
- **Cache Layer**: Redis 7.0 (sessions, real-time data)
- **Schema**: 20+ normalized tables, automatic migrations

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes-ready architecture
- **Reverse Proxy**: Nginx (production)
- **Deployment**: GitHub Actions CI/CD ready
- **Monitoring**: Structured logging, performance metrics

## 🚀 Quick Start

### Prerequisites
```bash
# Verify installations
node --version          # v20.0 or higher
npm --version          # 10.0 or higher
docker --version       # 24.0 or higher
docker-compose --version  # 2.20 or higher
```

### Development Setup
```bash
# 1. Clone repository
git clone https://github.com/Robincyriac1/YAHSHUA.git
cd YAHSHUA

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# 3. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Start development environment
docker-compose up -d

# 5. Initialize database
cd backend && npm run prisma:migrate:dev && cd ..

# 6. Run development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# GraphQL: http://localhost:3001/graphql
```

### Using Docker
```bash
# Start entire stack in containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
YAHSHUA/
├── backend/                    # Node.js/TypeScript API
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── auth/              # JWT authentication
│   │   ├── config/            # Environment configuration
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── database/          # Prisma integration
│   │   └── middleware/        # Custom middleware
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (20+ tables)
│   │   ├── seed.ts            # Initial data seeding
│   │   └── migrations/        # Schema evolution
│   ├── .env.example           # Configuration template
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript config
│
├── frontend/                   # Next.js/React web app
│   ├── src/
│   │   ├── app/               # Next.js 15 app router
│   │   ├── components/        # React components
│   │   │   ├── dashboard/     # Energy dashboards
│   │   │   ├── technology/    # Tech-specific UI
│   │   │   └── ui/            # Shared components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities
│   │   ├── types/             # TypeScript definitions
│   │   └── middleware.ts      # Next.js middleware
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml         # Multi-container orchestration
├── .gitignore                 # Security: excludes secrets
├── .env.example               # Configuration template
├── package.json               # Root dependencies
└── docs/                      # Documentation

```

## 🔐 Security & Configuration

### Environment Variables
Create `backend/.env` from `backend/.env.example`:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/yahshua

# Authentication
JWT_SECRET=your-secure-jwt-secret-min-32-chars
JWT_EXPIRY=7d

# API
API_HOST=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# Kafka (optional)
KAFKA_BROKERS=localhost:9092
```

### Security Features
✅ No hardcoded credentials (environment variables only)
✅ JWT token-based authentication
✅ Password hashing with bcryptjs
✅ CORS and CSRF protection
✅ Rate limiting on API endpoints
✅ SQL injection prevention (Prisma ORM)
✅ Comprehensive .gitignore for secret files
✅ Audit logging for sensitive operations

See [SECURITY.md](SECURITY.md) for detailed security audit.

## 📊 Database Schema

**20+ Tables** covering:
- **Users**: Multi-tenant user management with RBAC
- **Authentication**: Sessions, tokens, refresh tokens
- **Energy Systems**: Solar, Wind, Hydro, Geothermal, Biomass, Ocean, Storage
- **Real-Time Data**: Metrics, analytics, performance tracking
- **Integrations**: Partner APIs, webhooks, event logs
- **Infrastructure**: Devices, sensors, gateways
- **Transactions**: Billing, energy trading, settlements

See `backend/prisma/schema.prisma` for full schema.

## 🔌 API Examples

### REST API
```bash
# Authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure"}'

# Get energy data
curl -X GET http://localhost:3001/api/energy/solar/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### GraphQL API
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ getEnergyMetrics(type: SOLAR) { id, power, timestamp } }"
  }'
```

## 🚢 Production Deployment

See [PRODUCTION.md](PRODUCTION.md) for:
- AWS/GCP/Azure deployment guides
- Docker image building and publishing
- Kubernetes manifests
- Database scaling strategies
- Monitoring and alerting setup
- Security hardening checklist

## 📚 Documentation

- [PRODUCTION.md](PRODUCTION.md) - Deployment & scaling guide
- [SECURITY.md](SECURITY.md) - Security audit & best practices
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical deep-dive
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Endpoint reference
- [SETUP_SUCCESS_STATUS.md](SETUP_SUCCESS_STATUS.md) - Project status
- [DATABASE_MODELS_SUCCESS.md](DATABASE_MODELS_SUCCESS.md) - Schema details

## Development Guidelines
- Follow TypeScript strict mode
- Maintain >90% test coverage
- Use conventional commit messages
- All PRs require code review
- API-first development approach

## Contributing
1. Create feature branch from `develop`
2. Implement changes with tests
3. Submit pull request
4. Code review and merge

## License
Proprietary - All rights reserved
