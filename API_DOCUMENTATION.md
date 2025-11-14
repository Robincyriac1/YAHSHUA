# YAHSHUA API Documentation

## Base URL
```
Production: https://api.yahshua.energy/api
Development: http://localhost:3001/api
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

**Header Format:**
```
Authorization: Bearer <JWT_TOKEN>
```

**JWT Token Structure:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "operator",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Auth Endpoints

### 1. User Login
**Endpoint**: `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_value",
  "expires_in": 86400,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "operator"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email or password format
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

---

### 2. User Registration
**Endpoint**: `POST /auth/register`

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "secure_password_min_8_chars",
  "name": "Jane Doe",
  "company": "Energy Corp",
  "role": "operator"
}
```

**Response** (201 Created):
```json
{
  "id": "user-456",
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "company": "Energy Corp",
  "role": "operator",
  "created_at": "2025-11-14T10:30:00Z"
}
```

**Validation Rules:**
- Email: Valid format, unique
- Password: Minimum 8 characters, 1 uppercase, 1 number, 1 special char
- Name: 2-100 characters
- Role: Must be valid enum (operator, manager, admin, etc.)

---

### 3. Refresh Token
**Endpoint**: `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "refresh_token_value"
}
```

**Response** (200 OK):
```json
{
  "access_token": "new_jwt_token",
  "expires_in": 86400
}
```

---

### 4. Logout
**Endpoint**: `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## Energy Endpoints

### Solar Energy

#### Get Solar System Metrics
**Endpoint**: `GET /energy/solar/metrics`

**Query Parameters:**
```
facility_id: string (required)
time_range: string (optional, default: "24h")
  - "1h", "6h", "24h", "7d", "30d"
limit: integer (optional, default: 100, max: 1000)
```

**Example:**
```
GET /energy/solar/metrics?facility_id=solar-001&time_range=24h
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK):
```json
{
  "facility_id": "solar-001",
  "facility_name": "North Solar Farm",
  "capacity_mw": 50,
  "data": [
    {
      "timestamp": "2025-11-14T10:30:00Z",
      "power_output_mw": 48.5,
      "efficiency_percent": 92.5,
      "irradiance_w_m2": 850,
      "temperature_celsius": 35.2,
      "status": "operational"
    },
    {
      "timestamp": "2025-11-14T10:29:00Z",
      "power_output_mw": 48.3,
      "efficiency_percent": 92.2,
      "irradiance_w_m2": 845,
      "temperature_celsius": 35.1,
      "status": "operational"
    }
  ],
  "summary": {
    "avg_power_mw": 48.2,
    "peak_power_mw": 49.1,
    "min_power_mw": 47.0,
    "avg_efficiency_percent": 91.8,
    "total_energy_mwh": 1152.5
  }
}
```

#### Post Solar Data
**Endpoint**: `POST /energy/solar/data`

**Request:**
```json
{
  "facility_id": "solar-001",
  "timestamp": "2025-11-14T10:30:00Z",
  "power_output_mw": 48.5,
  "efficiency_percent": 92.5,
  "irradiance_w_m2": 850,
  "temperature_celsius": 35.2,
  "status": "operational"
}
```

**Response** (201 Created):
```json
{
  "id": "metric-789",
  "facility_id": "solar-001",
  "timestamp": "2025-11-14T10:30:00Z",
  "power_output_mw": 48.5,
  "created_at": "2025-11-14T10:30:01Z"
}
```

---

### Wind Energy

#### Get Wind System Metrics
**Endpoint**: `GET /energy/wind/metrics`

**Parameters:** Same as Solar

**Response** (200 OK):
```json
{
  "facility_id": "wind-001",
  "facility_name": "Coastal Wind Farm",
  "capacity_mw": 120,
  "data": [
    {
      "timestamp": "2025-11-14T10:30:00Z",
      "power_output_mw": 110.2,
      "efficiency_percent": 91.8,
      "wind_speed_m_s": 12.5,
      "wind_direction_degrees": 240,
      "rotor_speed_rpm": 8500,
      "status": "operational"
    }
  ],
  "summary": {
    "avg_power_mw": 108.5,
    "peak_power_mw": 119.8,
    "avg_wind_speed_m_s": 12.3,
    "total_energy_mwh": 2604
  }
}
```

---

### Hydroelectric Energy

#### Get Hydro System Metrics
**Endpoint**: `GET /energy/hydro/metrics`

**Response** (200 OK):
```json
{
  "facility_id": "hydro-001",
  "facility_name": "Mountain Hydroelectric Plant",
  "capacity_mw": 200,
  "data": [
    {
      "timestamp": "2025-11-14T10:30:00Z",
      "power_output_mw": 195.5,
      "efficiency_percent": 94.2,
      "water_level_m": 285.4,
      "water_flow_m3_s": 150.2,
      "turbine_speed_rpm": 720,
      "status": "operational"
    }
  ],
  "summary": {
    "avg_power_mw": 194.8,
    "peak_power_mw": 199.2,
    "avg_water_level_m": 285.2,
    "total_energy_mwh": 4675.2
  }
}
```

---

### Geothermal Energy

#### Get Geothermal System Metrics
**Endpoint**: `GET /energy/geothermal/metrics`

**Response** (200 OK):
```json
{
  "facility_id": "geo-001",
  "facility_name": "Geothermal Power Station",
  "capacity_mw": 75,
  "data": [
    {
      "timestamp": "2025-11-14T10:30:00Z",
      "power_output_mw": 72.4,
      "efficiency_percent": 96.5,
      "inlet_temp_celsius": 180,
      "outlet_temp_celsius": 120,
      "steam_pressure_bar": 45,
      "status": "operational"
    }
  ],
  "summary": {
    "avg_power_mw": 72.1,
    "peak_power_mw": 74.8,
    "avg_inlet_temp_celsius": 179.5,
    "capacity_factor_percent": 96.1
  }
}
```

---

## Integrations Endpoints

### List Integrations
**Endpoint**: `GET /integrations`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK):
```json
{
  "integrations": [
    {
      "id": "integration-001",
      "provider": "SolarProvider",
      "name": "Solar Provider Integration",
      "status": "connected",
      "last_sync": "2025-11-14T10:25:00Z",
      "facilities_synced": 5,
      "next_sync": "2025-11-14T10:30:00Z"
    },
    {
      "id": "integration-002",
      "provider": "GridOperator",
      "name": "Grid Operator Feed",
      "status": "connected",
      "last_sync": "2025-11-14T10:28:00Z",
      "facilities_synced": 12,
      "next_sync": "2025-11-14T10:29:00Z"
    }
  ],
  "total": 2
}
```

### Connect Integration
**Endpoint**: `POST /integrations/connect`

**Request:**
```json
{
  "provider": "SolarProvider",
  "api_key": "encrypted_api_key",
  "webhook_url": "https://api.yahshua.energy/webhooks/solar",
  "config": {
    "sync_interval": 300,
    "retry_attempts": 3
  }
}
```

**Response** (201 Created):
```json
{
  "id": "integration-003",
  "provider": "SolarProvider",
  "status": "connecting",
  "webhook_url": "https://api.yahshua.energy/webhooks/solar",
  "created_at": "2025-11-14T10:30:00Z"
}
```

### Get Integration Status
**Endpoint**: `GET /integrations/{id}/status`

**Response** (200 OK):
```json
{
  "id": "integration-001",
  "provider": "SolarProvider",
  "status": "connected",
  "health": {
    "is_healthy": true,
    "last_error": null,
    "error_count_24h": 0,
    "avg_sync_time_ms": 2500
  },
  "stats": {
    "total_records_synced": 150000,
    "facilities_monitored": 5,
    "last_sync": "2025-11-14T10:28:00Z"
  }
}
```

### Webhook Receiver
**Endpoint**: `POST /integrations/{id}/webhook`

**Headers:**
```
Content-Type: application/json
X-Webhook-Signature: HMAC-SHA256-signature
```

**Request:**
```json
{
  "event_type": "metric_update",
  "facility_id": "solar-001",
  "timestamp": "2025-11-14T10:30:00Z",
  "data": {
    "power_output_mw": 48.5,
    "efficiency_percent": 92.5
  }
}
```

**Response** (200 OK):
```json
{
  "status": "acknowledged",
  "event_id": "evt-12345"
}
```

---

## Analytics Endpoints

### Get Energy Analytics
**Endpoint**: `GET /analytics/energy`

**Query Parameters:**
```
facility_id: string (optional)
start_date: string (ISO 8601, required)
end_date: string (ISO 8601, required)
granularity: string (optional, default: "hourly")
  - "5m", "15m", "hourly", "daily", "monthly"
```

**Response** (200 OK):
```json
{
  "facility_id": "solar-001",
  "period": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-30T23:59:59Z"
  },
  "metrics": {
    "total_energy_mwh": 34560,
    "avg_power_mw": 47.5,
    "peak_power_mw": 49.8,
    "min_power_mw": 2.3,
    "uptime_percent": 99.8,
    "capacity_factor_percent": 93.2
  },
  "trends": [
    {
      "timestamp": "2025-11-01T00:00:00Z",
      "energy_mwh": 1152,
      "avg_power_mw": 48.0,
      "efficiency_percent": 92.5
    }
  ]
}
```

---

## Health Check Endpoint

### System Health
**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "UP",
  "timestamp": "2025-11-14T10:30:00Z",
  "services": {
    "database": {
      "status": "UP",
      "response_time_ms": 15
    },
    "redis": {
      "status": "UP",
      "response_time_ms": 5
    },
    "kafka": {
      "status": "UP",
      "brokers_connected": 3
    }
  },
  "version": "1.0.0"
}
```

---

## Error Responses

### Error Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was malformed or invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2025-11-14T10:30:00Z",
  "request_id": "req-12345-67890"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## Rate Limiting

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1636814400
```

**Limits:**
- Standard: 100 requests per 15 minutes
- Premium: 1,000 requests per 15 minutes
- Enterprise: Custom limits

**When Exceeded** (429 Too Many Requests):
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retry_after": 300
  }
}
```

---

## GraphQL API

### Endpoint
```
POST /graphql
```

### Example Query

```graphql
query GetEnergyMetrics($facilityId: String!, $limit: Int = 100) {
  energyMetrics(facilityId: $facilityId, limit: $limit) {
    id
    timestamp
    powerOutput
    efficiency
    status
  }
  facilityInfo(id: $facilityId) {
    id
    name
    capacity
    technology
    location {
      latitude
      longitude
    }
  }
}
```

### Example Mutation

```graphql
mutation RecordEnergyData($input: EnergyDataInput!) {
  recordEnergyMetric(input: $input) {
    id
    facilityId
    timestamp
    powerOutput
    status
  }
}
```

---

## WebSocket API

### Connection
```
ws://localhost:3001/socket.io
wss://api.yahshua.energy/socket.io (Production)
```

### Real-Time Metrics

**Subscribe:**
```javascript
socket.emit('subscribe:metrics', {
  facility_id: 'solar-001',
  interval: 1000  // milliseconds
});
```

**Receive:**
```javascript
socket.on('metrics:update', (data) => {
  console.log('Energy metrics:', data);
  // {
  //   facility_id: 'solar-001',
  //   timestamp: '2025-11-14T10:30:00Z',
  //   power_output_mw: 48.5,
  //   efficiency_percent: 92.5
  // }
});
```

---

## SDK & Client Libraries

### JavaScript/TypeScript
```javascript
import { YAHSHUAClient } from '@yahshua/sdk';

const client = new YAHSHUAClient({
  apiUrl: 'https://api.yahshua.energy',
  apiKey: 'your-api-key'
});

// Get metrics
const metrics = await client.energy.solar.getMetrics('solar-001');
```

### Python
```python
from yahshua import Client

client = Client(api_url='https://api.yahshua.energy', api_key='your-api-key')
metrics = client.energy.solar.get_metrics('solar-001')
```

---

## Best Practices

1. **Use HTTPS in Production**: All API calls must use HTTPS
2. **Handle Rate Limiting**: Implement exponential backoff for retries
3. **Store Tokens Securely**: Never log or expose JWT tokens
4. **Validate Webhooks**: Always verify webhook signatures
5. **Use Pagination**: For large datasets, use limit/offset
6. **Monitor Health**: Regularly check `/health` endpoint
7. **Cache Data**: Use appropriate TTLs for cached responses
8. **Error Handling**: Implement proper error handling and logging

---

**API Version**: 1.0
**Last Updated**: November 2025
**Documentation Status**: Complete & Production Ready
