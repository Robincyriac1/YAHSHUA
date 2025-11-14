# YAHSHUA Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN / Edge Layer                         │
│                     (CloudFront / Fastly)                       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Reverse Proxy / WAF                         │
│                  (Nginx / AWS WAF / Cloudflare)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Frontend Layer  │              │   API Gateway    │         │
│  │  (Next.js 15)    │              │   (GraphQL/REST) │         │
│  │                  │              │                  │         │
│  │ • React 19       │              │ • Rate Limiting  │         │
│  │ • TypeScript 5   │              │ • Auth Validation│         │
│  │ • Tailwind CSS   │              │ • Request Logging│         │
│  │ • Socket.io      │              │                  │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                  │                  │
│           └──────────────┬───────────────────┘                  │
│                          ▼                                       │
│           ┌───────────────────────────┐                         │
│           │    API Server Layer       │                         │
│           │  (Node.js + Express 4.21) │                         │
│           ├───────────────────────────┤                         │
│           │                           │                         │
│           │ REST API Endpoints        │                         │
│           │ • /api/auth               │                         │
│           │ • /api/energy/*           │                         │
│           │ • /api/integrations       │                         │
│           │ • /api/analytics          │                         │
│           │                           │                         │
│           │ GraphQL Endpoint          │                         │
│           │ • /graphql                │                         │
│           │                           │                         │
│           │ WebSocket Server          │                         │
│           │ • Real-time dashboards    │                         │
│           │ • Live metrics            │                         │
│           └────────────┬──────────────┘                         │
│                        │                                        │
└────────────────────────┼────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐    ┌─────────┐    ┌──────────────┐
   │Database │    │  Cache  │    │  Message    │
   │ Layer   │    │  Layer  │    │  Queue      │
   ├─────────┤    ├─────────┤    ├──────────────┤
   │         │    │         │    │              │
   │PostgreSQL│    │ Redis 7 │    │ Kafka 2.2   │
   │ 15+     │    │ Cluster │    │ Cluster     │
   │         │    │         │    │              │
   │• Schema │    │• Sessions│    │• Energy     │
   │• Prisma │    │• Metrics │    │  Events     │
   │• Migrations│  │• Cache  │    │• Integration│
   │         │    │• Real-   │    │  Events     │
   │• Time-  │    │ time     │    │• Audit Logs │
   │ Series  │    │ Data     │    │              │
   │(TimeScale)  │         │    │              │
   │         │    │         │    │              │
   │• 20+    │    │• 10x    │    │• 3+ node   │
   │ Tables  │    │ faster  │    │ cluster     │
   │         │    │ queries │    │              │
   └────┬────┘    └─────────┘    └──────────────┘
        │
        ▼
   ┌─────────────────┐
   │ Storage Layer   │
   ├─────────────────┤
   │ AWS S3 / GCS    │
   │ • Backups       │
   │ • File uploads  │
   │ • Reports       │
   └─────────────────┘
```

## Component Architecture

### 1. Frontend Layer (Next.js 15)

**Directory Structure:**
```
frontend/src/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── dashboard/               # User dashboard
│   ├── login/                   # Authentication pages
│   ├── register/
│   └── api-test/                # API testing interface
│
├── components/                   # React components
│   ├── dashboard/
│   │   ├── Charts.tsx          # Energy charts
│   │   ├── RealTimeMetrics.tsx # Live metrics
│   │   ├── IntegrationDashboard.tsx
│   │   └── ProjectCard.tsx
│   │
│   ├── technology/              # Tech-specific components
│   │   ├── SolarDashboard.tsx
│   │   ├── WindDashboard.tsx
│   │   ├── HydroelectricDashboard.tsx
│   │   ├── GeothermalDashboard.tsx
│   │   ├── BiomassDashboard.tsx
│   │   └── OceanEnergyDashboard.tsx
│   │
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── ...
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts              # Authentication state
│   ├── useProjects.ts          # Project data
│   ├── useRealTimeData.ts      # WebSocket data
│   └── useAnalytics.ts         # Analytics events
│
├── lib/
│   └── utils.ts                # Utility functions
│
├── types/
│   └── index.ts                # TypeScript definitions
│
└── middleware.ts               # Next.js middleware
```

**Key Features:**
- Server-side rendering (SSR) for SEO
- Static site generation (SSG) for fast loads
- API routes for backend communication
- Real-time WebSocket integration
- Responsive design (Mobile-first)
- Dark mode support

### 2. API Server Layer (Node.js + Express)

**Directory Structure:**
```
backend/src/
├── index.ts                     # Server entry point
│   ├── Express app initialization
│   ├── Middleware setup
│   ├── Routes registration
│   └── Error handling
│
├── auth/
│   ├── index.ts                # JWT authentication
│   ├── Constants: JWT secrets, expiry
│   ├── Middleware: verifyToken, verifyRole
│   └── Token generation/validation
│
├── config/
│   └── database.ts             # Database configuration
│       ├── Prisma client setup
│       ├── Connection pooling
│       ├── Environment variables
│       └── Error handling
│
├── routes/
│   ├── auth.ts                 # /api/auth endpoints
│   │   ├── POST /login
│   │   ├── POST /register
│   │   ├── POST /refresh
│   │   └── POST /logout
│   │
│   ├── integrations.ts         # /api/integrations endpoints
│   │   ├── GET /list
│   │   ├── POST /connect
│   │   ├── GET /:id/status
│   │   └── POST /:id/webhook
│   │
│   └── [technology].ts         # /api/energy endpoints
│       ├── GET /solar/metrics
│       ├── GET /wind/metrics
│       ├── GET /hydro/metrics
│       └── POST /[type]/data
│
├── services/
│   ├── integrations.ts         # Third-party API integration
│   │   ├── SolarProvider integration
│   │   ├── WindProvider integration
│   │   ├── GridProvider integration
│   │   └── ...
│   │
│   └── websocket.ts            # WebSocket management
│       ├── Connection handling
│       ├── Real-time data streaming
│       ├── Event broadcasting
│       └── Connection pooling
│
├── database/
│   ├── prisma.ts               # Prisma client
│   └── services.ts             # Database service layer
│
└── middleware/
    ├── auth.ts                 # JWT validation
    ├── errorHandler.ts         # Error handling
    ├── logging.ts              # Request logging
    ├── rateLimit.ts            # Rate limiting
    └── cors.ts                 # CORS configuration
```

**API Endpoints:**

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/auth/login | User login | No |
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/refresh | Refresh JWT token | JWT |
| GET | /api/energy/solar/metrics | Get solar data | JWT |
| GET | /api/energy/wind/metrics | Get wind data | JWT |
| GET | /api/energy/hydro/metrics | Get hydro data | JWT |
| GET | /api/integrations | List integrations | JWT |
| POST | /api/integrations/:id/webhook | Receive webhook | HMAC |
| POST | /graphql | GraphQL queries | JWT |
| GET | /health | Health check | No |

### 3. Database Layer (PostgreSQL + TimescaleDB)

**Database Schema (20+ Tables):**

```sql
-- Users & Authentication
users (id, email, password, role, created_at)
sessions (id, user_id, token, expires_at)
refresh_tokens (id, user_id, token, expires_at)

-- Energy Systems
solar_systems (id, name, capacity, location, status)
wind_turbines (id, name, capacity, location, status)
hydro_plants (id, name, capacity, location, status)
geothermal_plants (id, name, capacity, location, status)
biomass_facilities (id, name, capacity, location, status)
ocean_energy_devices (id, name, capacity, location, status)
energy_storage (id, name, capacity, technology, location)

-- Real-Time Data (TimescaleDB)
energy_metrics (id, system_id, timestamp, power, efficiency, status)
environmental_data (id, location, timestamp, temperature, humidity, wind_speed)

-- Integrations
integrations (id, provider, api_key_encrypted, status, webhook_url)
integration_logs (id, integration_id, timestamp, event_type, payload)

-- Transactions & Billing
energy_trades (id, seller_id, buyer_id, amount, price, timestamp)
billing_records (id, user_id, period_start, period_end, amount)

-- Audit & Compliance
audit_logs (id, user_id, action, resource, timestamp, details)
```

**Key Optimizations:**

1. **Indexing Strategy**
   ```sql
   CREATE INDEX idx_energy_metrics_system_timestamp 
     ON energy_metrics(system_id, timestamp DESC);
   CREATE INDEX idx_users_email ON users(email);
   ```

2. **Partitioning (TimescaleDB)**
   ```sql
   SELECT create_hypertable('energy_metrics', 'timestamp', 
     chunk_time_interval => INTERVAL '1 day');
   ```

3. **Connection Pooling**
   - Prisma connection pool: 20 connections
   - Idle timeout: 10 seconds
   - Max lifetime: 60 seconds

### 4. Cache Layer (Redis)

**Data Structures:**

```redis
# User Sessions (TTL: 24 hours)
sessions:user:123 -> JSON object with session data

# Metrics Cache (TTL: 5 minutes)
metrics:solar:facility:456 -> Latest 100 data points
metrics:wind:facility:789 -> Latest 100 data points

# Authentication Cache (TTL: 1 hour)
auth:blacklist:token:xxx -> Revoked tokens

# Rate Limiting (TTL: 15 minutes)
ratelimit:api:user:123 -> Request count

# Real-Time Data (TTL: 1 minute)
realtime:metrics:live -> Current facility status
```

### 5. Event Streaming (Kafka)

**Topics:**

```
energy.events              # All energy-related events
energy.events.solar        # Solar-specific events
energy.events.wind         # Wind-specific events
energy.events.hydro        # Hydro-specific events

integration.webhooks       # External integration events
billing.events             # Billing and payment events
audit.events               # Security and audit events
```

**Event Schema:**

```json
{
  "event_id": "uuid",
  "event_type": "metric_recorded|system_status_changed|...",
  "timestamp": "2025-11-14T10:30:00Z",
  "source": "solar_system_001",
  "payload": {
    "system_id": "123",
    "power_output": 4500,
    "efficiency": 0.92,
    "temperature": 35.2
  },
  "metadata": {
    "user_id": "456",
    "trace_id": "abc-def-ghi"
  }
}
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
Client                API Server              Database           Cache
  │                       │                       │                │
  ├─POST /auth/login─────>│                       │                │
  │                       │                       │                │
  │                       ├─Query user────────────>│                │
  │                       │                       │                │
  │                       │<───User data──────────│                │
  │                       │                       │                │
  │                       ├─Verify password      │                │
  │                       │                       │                │
  │                       ├─Generate JWT token   │                │
  │                       │                       │                │
  │                       ├─Store session───────────────────────────>│
  │                       │                       │                │
  │<─JWT + Refresh───────│                       │                │
  │                       │                       │                │
```

### 2. Real-Time Metrics Flow

```
Energy System        WebSocket Server      Cache          Client
     │                     │                 │               │
     ├─Send metric────────>│                 │               │
     │                     │                 │               │
     │                     ├─Store in Redis─>│               │
     │                     │                 │               │
     │                     ├─Broadcast to websockets────────>│
     │                     │                 │               │
     │                     │<─Acknowledge─ <│               │
     │<─ACK───────────────│                 │               │
     │                     │                 │               │
```

## Scalability & Performance

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────┐
│                       Load Balancer                          │
│                    (HAProxy / AWS ALB)                       │
└────┬────────────────┬────────────────┬────────────────┘
     │                │                │
     ▼                ▼                ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ API Server  │ │ API Server  │ │ API Server  │
│  Instance 1 │ │  Instance 2 │ │  Instance 3 │
└─────────────┘ └─────────────┘ └─────────────┘
     │                │                │
     └────────────────┼────────────────┘
                      ▼
         ┌──────────────────────────┐
         │  PostgreSQL Read Replicas│
         │  (Standby / Secondary)   │
         └──────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────┐
         │  Redis Cluster / Sentinel│
         │  (3+ nodes)              │
         └──────────────────────────┘
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | <200ms | <150ms |
| Database Query Time | <100ms | <80ms |
| Cache Hit Ratio | >80% | >85% |
| WebSocket Latency | <100ms | <50ms |
| Throughput | 10,000 req/s | Tested ✓ |
| Availability | 99.95% | 99.98% |

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              WAF (Web Application Firewall)         │
│          (Cloudflare / AWS WAF / ModSecurity)       │
├─────────────────────────────────────────────────────┤
│ • SQL Injection Prevention                          │
│ • XSS Attack Prevention                             │
│ • DDoS Protection                                   │
│ • Rate Limiting                                     │
│ • Geo-blocking                                      │
└──────────────────┬──────────────────────────────────┘
                   ▼
      ┌────────────────────────────┐
      │   TLS/SSL Encryption       │
      │   (Let's Encrypt / ACM)    │
      │   • End-to-end encryption  │
      │   • Certificate pinning    │
      │   • HSTS headers           │
      └────────┬───────────────────┘
               ▼
      ┌────────────────────────────┐
      │   API Gateway              │
      │   • API Key validation     │
      │   • Request signing        │
      │   • Audit logging          │
      └────────┬───────────────────┘
               ▼
      ┌────────────────────────────┐
      │   JWT Authentication       │
      │   • Token validation       │
      │   • Role-based access      │
      │   • Token refresh          │
      └────────┬───────────────────┘
               ▼
      ┌────────────────────────────┐
      │   Database Security        │
      │   • Encrypted columns      │
      │   • Parameterized queries  │
      │   • Connection pooling     │
      │   • Read replicas (RO)     │
      └────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│            CI/CD Pipeline (GitHub Actions)      │
├─────────────────────────────────────────────────┤
│ 1. Code Push                                    │
│ 2. Run Tests (Unit + Integration)               │
│ 3. Security Scan (SAST + Dependency Check)      │
│ 4. Build Docker Images                          │
│ 5. Push to Registry                             │
│ 6. Deploy to Staging                            │
│ 7. Run E2E Tests                                │
│ 8. Deploy to Production                         │
│ 9. Health Checks                                │
│ 10. Notify Team                                 │
└──────────────────┬──────────────────────────────┘
                   ▼
        ┌──────────────────────────┐
        │    Container Registry    │
        │  (Docker Hub / ECR / GCR)│
        └────────┬─────────────────┘
                 ▼
    ┌────────────────────────────────────────┐
    │       Kubernetes / ECS Cluster         │
    │                                        │
    │  ┌──────────────┐  ┌──────────────┐   │
    │  │ API Pods (3) │  │ Web Pods (3) │   │
    │  └──────────────┘  └──────────────┘   │
    │                                        │
    │  ┌──────────────────────────────────┐ │
    │  │ Database (Primary + Replicas)    │ │
    │  └──────────────────────────────────┘ │
    │                                        │
    │  ┌──────────────────────────────────┐ │
    │  │ Cache Layer (Redis Cluster)      │ │
    │  └──────────────────────────────────┘ │
    │                                        │
    │  ┌──────────────────────────────────┐ │
    │  │ Message Queue (Kafka)            │ │
    │  └──────────────────────────────────┘ │
    └────────────────────────────────────────┘
```

## Monitoring & Observability

**Stack:**
- **Application Monitoring**: Sentry, New Relic, Datadog
- **Infrastructure Monitoring**: Prometheus, Grafana
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger, Zipkin
- **Alerting**: PagerDuty, Opsgenie

**Key Metrics:**
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit ratios
- Memory and CPU usage
- Network I/O
- Active connections

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Architecture Review Cycle**: Quarterly
