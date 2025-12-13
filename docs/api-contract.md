# API Contract

Base URL: `http://localhost:3000/api`

---

## Authentication

### Register

**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum6chars"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Cookies Set:**
- `refreshToken` (HttpOnly, 7 days)

**Errors:**
| Status | Error |
|--------|-------|
| 400 | Email and password are required |
| 400 | Password must be at least 6 characters |
| 409 | Email already registered |

---

### Login

**POST** `/auth/login`

Authenticates an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Cookies Set:**
- `refreshToken` (HttpOnly, 7 days)

**Errors:**
| Status | Error |
|--------|-------|
| 400 | Email and password are required |
| 401 | Invalid credentials |

---

### Logout

**POST** `/auth/logout`

Clears the refresh token cookie.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `refreshToken`

---

### Refresh Token

**POST** `/auth/refresh`

Exchanges refresh token for new access token.

**Request:**
- Requires `refreshToken` cookie (sent automatically)

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Cookies Set:**
- `refreshToken` (new token, HttpOnly, 7 days)

**Errors:**
| Status | Error |
|--------|-------|
| 401 | No refresh token |
| 401 | Refresh token expired |
| 401 | Invalid refresh token |
| 401 | User not found |

---

### Get Current User

**GET** `/auth/me`

Returns the authenticated user's info.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Errors:**
| Status | Error |
|--------|-------|
| 401 | No token provided |
| 401 | Token expired |
| 401 | Invalid token |
| 401 | User not found |

---

## Protected Routes

### Test Protected Endpoint

**GET** `/protected`

Test endpoint to verify authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "email": "user@example.com"
  }
}
```

**Errors:**
| Status | Error |
|--------|-------|
| 401 | No token provided |
| 401 | Token expired |
| 401 | Invalid token |

---

## Health Check

### Server Health

**GET** `/health`

Check if server is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-13T08:00:00.000Z"
}
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. REGISTER / LOGIN                                        │
│     POST /auth/register or /auth/login                      │
│     ↓                                                       │
│     Response: { accessToken, user }                         │
│     Cookie: refreshToken (HttpOnly)                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. ACCESS PROTECTED RESOURCES                              │
│     GET /protected (or any protected route)                 │
│     Header: Authorization: Bearer <accessToken>             │
│     ↓                                                       │
│     Response: { ok: true, user: {...} }                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. TOKEN EXPIRED (401)                                     │
│     POST /auth/refresh                                      │
│     Cookie: refreshToken (sent automatically)               │
│     ↓                                                       │
│     Response: { accessToken, user }                         │
│     Retry original request with new token                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Token Details

| Token | Storage | Expiry | Purpose |
|-------|---------|--------|---------|
| Access Token | Memory (client) | 15 min | API authorization |
| Refresh Token | HttpOnly Cookie | 7 days | Get new access tokens |

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Validation errors may include details:

```json
{
  "error": "Validation Error",
  "details": ["Field1 is required", "Field2 must be valid"]
}
```

