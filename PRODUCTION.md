# YAHSHUA Production Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Docker Build & Deployment](#docker-build--deployment)
4. [Database Setup](#database-setup)
5. [Cloud Deployment](#cloud-deployment)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling Strategies](#scaling-strategies)
9. [Disaster Recovery](#disaster-recovery)

---

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables configured in CI/CD
- [ ] SSL/TLS certificates obtained
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] Security audit completed (✅ PASSED)
- [ ] Load testing completed
- [ ] Incident response plan documented
- [ ] Team trained on deployment process
- [ ] DNS records configured
- [ ] CDN/Reverse proxy configured

---

## Environment Configuration

### Production .env Variables

```bash
# Server Configuration
NODE_ENV=production
API_HOST=https://api.yahshua.energy
FRONTEND_URL=https://app.yahshua.energy
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://prod_user:${SECURE_PASSWORD}@db-prod.example.com:5432/yahshua_prod
DATABASE_POOL_SIZE=20
DATABASE_SSL=true
DATABASE_TIMEOUT=10000

# Authentication & Security
JWT_SECRET=${STRONG_JWT_SECRET_MIN_32_CHARS}
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=${STRONG_REFRESH_SECRET}
REFRESH_TOKEN_EXPIRY=7d
SESSION_SECRET=${STRONG_SESSION_SECRET}
BCRYPT_ROUNDS=12

# Redis Cache
REDIS_URL=redis://:${REDIS_PASSWORD}@cache.example.com:6379
REDIS_POOL_SIZE=10
REDIS_TIMEOUT=5000

# Kafka Event Streaming
KAFKA_BROKERS=kafka1.example.com:9092,kafka2.example.com:9092,kafka3.example.com:9092
KAFKA_GROUP_ID=yahshua-prod-consumer
KAFKA_SECURITY_PROTOCOL=SASL_SSL
KAFKA_SASL_USERNAME=${KAFKA_USER}
KAFKA_SASL_PASSWORD=${KAFKA_PASSWORD}

# File Storage
STORAGE_TYPE=s3
S3_BUCKET=yahshua-prod-data
S3_REGION=us-east-1
S3_ACCESS_KEY=${AWS_ACCESS_KEY_ID}
S3_SECRET_KEY=${AWS_SECRET_ACCESS_KEY}

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=${SENDGRID_API_KEY}
SMTP_FROM=noreply@yahshua.energy

# API Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=${SENTRY_DSN_PROD}
DATADOG_API_KEY=${DATADOG_API_KEY}
NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY}

# Logging
LOG_DRIVER=json
LOG_SERVICE=yahshua-api
LOG_ENVIRONMENT=production
```

### Secrets Management

**Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault:**

```bash
# AWS Secrets Manager Example
aws secretsmanager create-secret --name yahshua/prod/database --secret-string '{
  "username": "prod_user",
  "password": "SECURE_PASSWORD",
  "host": "db-prod.example.com",
  "port": 5432,
  "dbname": "yahshua_prod"
}'
```

---

## Docker Build & Deployment

### Building Production Images

```bash
# Backend Image
docker build -t yahshua-api:1.0.0 \
  -f backend/Dockerfile \
  --build-arg NODE_ENV=production \
  .

# Frontend Image
docker build -t yahshua-web:1.0.0 \
  -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yahshua.energy \
  .

# Tag for Registry
docker tag yahshua-api:1.0.0 registry.example.com/yahshua-api:1.0.0
docker tag yahshua-web:1.0.0 registry.example.com/yahshua-web:1.0.0

# Push to Registry
docker push registry.example.com/yahshua-api:1.0.0
docker push registry.example.com/yahshua-web:1.0.0
```

### Docker Compose Production

```yaml
version: '3.9'

services:
  api:
    image: registry.example.com/yahshua-api:1.0.0
    container_name: yahshua-api-prod
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "3001:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - yahshua-net
    volumes:
      - /var/log/yahshua:/app/logs
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

  web:
    image: registry.example.com/yahshua-web:1.0.0
    container_name: yahshua-web-prod
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yahshua.energy
    ports:
      - "3000:3000"
    networks:
      - yahshua-net
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

  postgres:
    image: postgres:15-alpine
    container_name: yahshua-db-prod
    restart: always
    environment:
      - POSTGRES_DB=yahshua_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - /backups:/backups
    ports:
      - "5432:5432"
    networks:
      - yahshua-net
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  redis:
    image: redis:7-alpine
    container_name: yahshua-cache-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - yahshua-net
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  nginx:
    image: nginx:alpine
    container_name: yahshua-proxy-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt/live:/etc/nginx/certs:ro
    networks:
      - yahshua-net
    depends_on:
      - api
      - web

networks:
  yahshua-net:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

---

## Database Setup

### PostgreSQL Production Configuration

```sql
-- Create production user
CREATE USER prod_user WITH PASSWORD 'SECURE_PASSWORD';

-- Create database
CREATE DATABASE yahshua_prod OWNER prod_user;

-- Enable required extensions
\c yahshua_prod
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS hstore;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE yahshua_prod TO prod_user;
ALTER USER prod_user WITH CREATEDB;
```

### Migrations

```bash
# Apply all pending migrations
npm run prisma:migrate:deploy

# Create migration
npm run prisma:migrate:create -- --name add_feature_x

# Verify schema
npm run prisma:db:validate
```

### Backups

```bash
# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -U prod_user -h localhost yahshua_prod | gzip > $BACKUP_DIR/yahshua_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/yahshua_$DATE.sql.gz s3://yahshua-backups/db/
```

---

## Cloud Deployment

### AWS ECS Deployment

```bash
# Create ECS Cluster
aws ecs create-cluster --cluster-name yahshua-prod

# Register Task Definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create Service
aws ecs create-service \
  --cluster yahshua-prod \
  --service-name yahshua-api \
  --task-definition yahshua-api:1 \
  --desired-count 3 \
  --load-balancers targetGroupArn=arn:aws:...,containerName=yahshua-api,containerPort=3001
```

### Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yahshua-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yahshua-api
  template:
    metadata:
      labels:
        app: yahshua-api
    spec:
      containers:
      - name: api
        image: registry.example.com/yahshua-api:1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yahshua-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

---

## Security Hardening

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.yahshua.energy;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    location / {
        proxy_pass http://yahshua-api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw default deny incoming
ufw enable
```

### Database Security

```sql
-- Enforce SSL connections
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
SELECT pg_reload_conf();

-- Restrict user access
ALTER USER prod_user WITH PASSWORD 'STRONG_PASSWORD';
REVOKE ALL ON public.* FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO prod_user;
```

---

## Monitoring & Logging

### Application Monitoring

```typescript
// Backend: Sentry Integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: true, request: true }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Logging

```typescript
// Structured Logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: '/var/log/yahshua/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/yahshua/combined.log' 
    }),
  ],
});
```

### Health Checks

```typescript
// Health Check Endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    database: checkDatabase(),
    redis: checkRedis(),
    kafka: checkKafka(),
  };
  res.status(200).json(health);
});
```

---

## Scaling Strategies

### Horizontal Scaling

```bash
# Use load balancer (HAProxy, AWS ALB, etc.)
# Multiple API instances behind load balancer
# Database read replicas for reporting queries
# Redis cluster for distributed caching
```

### Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX idx_energy_data_timestamp ON energy_data(timestamp DESC);
CREATE INDEX idx_energy_data_facility ON energy_data(facility_id);
CREATE INDEX idx_user_email ON users(email);

-- Partition time-series data
SELECT create_hypertable('energy_data', 'timestamp', if_not_exists => TRUE);
```

### Caching Strategy

```typescript
// Redis caching for frequently accessed data
const getCachedEnergyMetrics = async (facilityId: string) => {
  const cacheKey = `metrics:${facilityId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const data = await prisma.energyMetrics.findMany({
    where: { facility_id: facilityId },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
  
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
  return data;
};
```

---

## Disaster Recovery

### Backup & Recovery Plan

| Component | Backup Frequency | Retention | Recovery RTO |
|-----------|------------------|-----------|-------------|
| Database | Daily (hourly prod) | 30 days | 1 hour |
| Redis | Daily | 7 days | 15 mins |
| Code | Git commits | Permanent | 5 mins |
| Configs | Daily | 30 days | 30 mins |

### Automated Failover

```bash
# Health check daemon
while true; do
  if ! curl -f http://api:3001/health; then
    # Trigger failover
    kubectl delete pod yahshua-api-xxx
    # Kubernetes automatically spins up new replica
  fi
  sleep 30
done
```

### Incident Response

1. **Detection**: Alert triggered from Sentry/Datadog
2. **Diagnosis**: Review logs and metrics
3. **Mitigation**: Scale services, rollback code if needed
4. **Recovery**: Verify system health
5. **Post-Incident**: Root cause analysis, update runbooks

---

## Deployment Checklist

```bash
# Pre-deployment
- [ ] Run security audit: npm run security:audit
- [ ] Run tests: npm run test:e2e
- [ ] Verify environment variables
- [ ] Database migration: npm run prisma:migrate:deploy
- [ ] Build Docker images with version tag
- [ ] Push images to registry
- [ ] Update DNS/CDN if needed

# During deployment
- [ ] Monitor application logs
- [ ] Monitor performance metrics
- [ ] Monitor error rates in Sentry
- [ ] Check API health endpoints
- [ ] Smoke test critical workflows

# Post-deployment
- [ ] Verify all services running
- [ ] Test user login flow
- [ ] Confirm data persistence
- [ ] Update deployment documentation
- [ ] Notify stakeholders
- [ ] Schedule post-deployment review
```

---

## Support & Rollback

### Quick Rollback

```bash
# If critical issues detected
docker-compose down
docker-compose -f docker-compose.backup.yml up -d

# Or with Kubernetes
kubectl set image deployment/yahshua-api \
  yahshua-api=registry.example.com/yahshua-api:1.0.0-previous
```

### Emergency Contacts

Maintain 24/7 on-call schedule for production incidents.

---

**Last Updated**: November 2025
**Version**: 1.0
**Maintained By**: DevOps Team
