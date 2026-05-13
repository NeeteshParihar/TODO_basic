
<!--  future improvements -->

# Backend Application Review & Future Improvement Plan

This document outlines a review of the current TodoApp backend architecture and provides a structured plan for future improvements. The application is a solid foundation built with Express, TypeScript, MongoDB, and Redis, featuring JWT-based authentication, rate limiting, and cursor-based pagination.

## Current Strengths
- **Modern Stack:** TypeScript provides good type safety. Express is lightweight and well-understood.
- **Robust Authentication:** Implementation of Access + Refresh tokens via HTTP-only cookies, combined with Redis-based JWT blacklisting for logouts, is a highly secure approach.
- **Performance:** Redis is utilized effectively for both rate limiting and token blacklisting. Cursor-based pagination on the Todo fetch API is excellent for performance on large datasets.
- **Validation:** Use of a dedicated data validation layer (Zod schemas + middleware) keeps controllers clean and type-safe.
- **CORS:** Configured with an allowlist (`http://localhost:5173`) and `credentials: true` for secure cookie-based auth with the frontend.

## Proposed Improvements

The improvements are categorized by priority and impact.

### Phase 1: Security & Stability (High Priority)
1. **Centralized Error Handling:**
   - **Current:** Every controller has a `try-catch` block repeating `res.status(500).json(...)`.
   - **Improvement:** Implement a global error-handling middleware. Create custom error classes (e.g., `AppError`, `NotFoundError`, `UnauthorizedError`) to throw from anywhere in the app, which the global handler will catch and format appropriately.
2. **Helmet Integration:**
   - **Current:** Missing standard HTTP security headers.
   - **Improvement:** Add `helmet` middleware to secure HTTP headers against common web vulnerabilities (XSS, clickjacking, etc.).
3. **Database Connection Resilience:**
   - **Current:** If MongoDB or Redis fails to connect on startup, the app crashes (`process.exit(1)`).
   - **Improvement:** Implement connection retry logic or graceful degradation so the app can recover if the DB drops temporarily.

### Phase 2: Architecture & Code Quality (Medium Priority)
1. **Controller & Service Layer Separation:**
   - **Current:** Controllers still handle some business logic (e.g., checking if a user exists before creating, complex refresh token logic).
   - **Improvement:** Move business logic entirely into the `services` layer. Controllers should only be responsible for extracting the request data, passing it to the service, and returning the HTTP response.
2. **Structured Logging:**
   - **Current:** Uses standard `console.log()` across the app (including debug logs like JWT payloads in production).
   - **Improvement:** Introduce a logging library like **Winston** or **Pino**. This allows for different log levels (info, warn, error) and saving logs to files or external monitoring services in production.
3. **API Documentation:**
   - **Current:** Endpoints must be read from the source code.
   - **Improvement:** Implement **Swagger (OpenAPI)** via `swagger-ui-express`. This creates a live UI for frontend developers to test and understand the APIs.

### Phase 3: Testing & DevOps (Long-Term Priority)
1. **Automated Testing:**
   - **Improvement:** Set up a testing framework using **Jest** and **Supertest**. Write unit tests for your services and integration tests for your API endpoints.
2. **CI/CD Pipelines:**
   - **Improvement:** Add GitHub Actions workflows to automatically lint the code, run tests, and check build success on every commit.
3. **Advanced User Features:**
   - **Improvement:** Implement Email Verification (sending an OTP or link via Nodemailer) and a "Forgot Password" flow.

---

> [!IMPORTANT]
> ## User Review Required
> Please review the proposed improvement phases above. Let me know which specific areas you would like to tackle first!
>
> **My recommendation:** We should start by implementing **Centralized Error Handling** and **Helmet**, as these will immediately clean up your codebase and secure your application.


```text
1. Improve the auth logic: edgeCase: when user refreshToken expires the frontend makes the request but can't refresh it so it tries to login but due to duplicate record error the login is failing so improve this
```

---

# API Documentation

> **Base URL:** `http://localhost:3000`
> **Authentication:** All protected routes require a valid JWT sent automatically via an HTTP-only cookie (`jwtToken`).
> All request/response bodies use `Content-Type: application/json`.
> **CORS:** Only requests from `http://localhost:5173` are allowed. Credentials (cookies) are included automatically.

---

## 🔐 User Routes — `/api/user`

Rate-limited per IP (key: `"auth"`).

---

### `POST /api/user/auth/signup`

Register a new user account.

**Auth required:** ❌ No

**Request Body:**
| Field | Type | Validation Rules |
|---|---|---|
| `username` | `string` | Trimmed, min 3 characters |
| `email` | `string` | Valid email, trimmed, lowercased |
| `password` | `string` | Trimmed, min 8 characters |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "<userId>",
      "username": "neetesh",
      "email": "neetesh@example.com"
    }
  }
}
```

**Error `400` (user already exists):**
```json
{ "success": false, "message": "User exists, Please login" }
```

**Sets cookies:** `jwtToken` (15-minute access token), `refToken` (1-day refresh token, hashed in DB)

---

### `POST /api/user/auth/login`

Log in with existing credentials.

**Auth required:** ❌ No

**Request Body:**
| Field | Type | Validation Rules |
|---|---|---|
| `email` | `string` | Valid email, trimmed, lowercased |
| `password` | `string` | Trimmed, min 8 characters |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "username": "neetesh",
      "email": "neetesh@example.com"
    }
  }
}
```

**Error `400` (wrong credentials):**
```json
{ "success": false, "message": "Invalid credentials" }
```

**Sets cookies:** `jwtToken`, `refToken`

> **Note:** On each login, any previous refresh token for that user is deleted from the DB and replaced with the new one (single active session per user).

---

### `POST /api/user/auth/logout`

Log out the current user. Blocks the active JWT in Redis and deletes the refresh token from the DB.

**Auth required:** ✅ Yes (`jwtToken` cookie)

**Request Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

**Error `400` (missing cookies):**
```json
{ "success": false, "message": "Please login Again!" }
```

**Clears cookies:** `jwtToken`, `refToken`

---

### `POST /api/user/auth/refreshToken`

Issue a new access token using the refresh token cookie. Call this when the frontend receives a `401` from any protected route.

**Auth required:** ❌ No (reads `refToken` cookie directly)

**Request Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Refreshed successfully!",
  "userId": "<userId>"
}
```

**Sets cookie:** `jwtToken` (new 15-minute access token)

**Error `401` — Invalid/missing refresh token:**
```json
{
  "success": false,
  "message": "Please login Again!",
  "refreshTokenInvalid": "<RESCODE>"
}
```

**Error `401` — Refresh token expired (not found in DB or past `expiresAt`):**
```json
{
  "success": false,
  "message": "Please login Again!",
  "refreshTokenExpired": "<RESCODE>"
}
```

> **Implementation detail:** The refresh token is stored as a bcrypt-hashed value in MongoDB. Its DB record has a 1-day TTL (`expiresAt`). The server validates both the JWT signature and the DB record expiry.

---

### `GET /api/user/profile`

Fetch the authenticated user's profile.

**Auth required:** ✅ Yes

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "user": {
      "username": "neetesh",
      "email": "neetesh@example.com",
      "avatar": "...",
      "dob": "..."
    }
  }
}
```

**Error `404` (user not found):**
```json
{ "success": false, "message": "User not found" }
```

---

### `DELETE /api/user/`

Permanently delete the authenticated user's account. Also blocks the current JWT in Redis, revokes **all** refresh tokens for that user, and deletes all their todos.

**Auth required:** ✅ Yes

**Request Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Clears cookies:** `jwtToken`

---

## ✅ Todo Routes — `/api/todo`

Rate-limited per IP (key: `"todos"`). All routes require authentication.

---

### `POST /api/todo/`

Create a new todo item.

**Auth required:** ✅ Yes

**Request Body:**
| Field | Type | Validation Rules |
|---|---|---|
| `title` | `string` | Trimmed, min 3 characters, **required** |
| `date` | `string` / `Date` | Any valid date string, auto-coerced to `Date`, **required** |
| `isCompleted` | `boolean` | Optional, defaults to `false` |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Todo created successfully!",
  "data": {
    "todo": {
      "_id": "<todoId>",
      "title": "Exercise",
      "date": "2026-05-14T05:14:00.000Z",
      "isCompleted": false,
      "user": "<userId>"
    }
  }
}
```

**Error `400` — Duplicate date (MongoDB unique index violation):**
```json
{ "success": false, "message": "Please choose a different date", "errorCode": 11000 }
```

> **Note:** Each user can only have one todo per exact timestamp. A `11000` error code means the chosen date/time is already taken.

---

### `GET /api/todo/`

Fetch todos for the authenticated user, sorted newest-first, with cursor-based pagination.

**Auth required:** ✅ Yes

**Query Parameters:**
| Param | Type | Validation Rules | Default |
|---|---|---|---|
| `limit` | `number` | Coerced from string, min 1, optional | `10` |
| `cursor` | `Date string` | ISO date string, coerced to `Date`, optional — the `date` of the last item from the previous page | — |

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "todos": [ ... ],
    "hasNextPage": true,
    "nextCursor": "2026-05-10T05:14:00.000Z"
  }
}
```

> **How cursor pagination works:**
> 1. First request: omit `cursor`. Receive the first page of results.
> 2. If `hasNextPage` is `true`, pass `nextCursor` as the `cursor` query param for the next request.
> 3. Repeat until `hasNextPage` is `false` and `nextCursor` is `null`.

---

### `PATCH /api/todo/:id`

Update an existing todo by its MongoDB `_id`. At least one updatable field must be provided.

**Auth required:** ✅ Yes

**URL Params:**
| Param | Description |
|---|---|
| `id` | MongoDB ObjectId of the todo |

**Request Body** (at least one field required):
| Field | Type | Validation Rules |
|---|---|---|
| `title` | `string` | Trimmed, min 3 characters, optional |
| `isCompleted` | `boolean` | optional |
| `date` | `string` / `Date` | Valid date, auto-coerced, optional |

**Error `400` — Empty body (no fields provided):**
```json
{ "success": false, "message": "Invalid update request!" }
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Todo Updated successfully",
  "data": {
    "todo": { ... }
  }
}
```

**Error `404` — Todo not found:**
```json
{ "success": false, "message": "Todo not found!" }
```

**Error `400` — Duplicate date:**
```json
{ "success": false, "message": "Please choose a different date", "errorCode": 11000 }
```

---

### `DELETE /api/todo/:id`

Delete a todo by its MongoDB `_id`.

**Auth required:** ✅ Yes

**URL Params:**
| Param | Description |
|---|---|
| `id` | MongoDB ObjectId of the todo |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Todo deleted successfully!"
}
```

**Error `404` — Todo not found:**
```json
{ "success": false, "message": "Todo not found" }
```

---

### `GET /api/todo/get`

Fetch todos filtered by a date range and/or completion status, sorted newest-first, with cursor-based pagination.

**Auth required:** ✅ Yes

**Query Parameters:**
| Param | Type | Validation Rules | Default |
|---|---|---|---|
| `startDate` | `Date string` | ISO date, coerced to `Date`, optional | — |
| `endDate` | `Date string` | ISO date, coerced to `Date`, optional | — |
| `isCompleted` | `"true"` / `"false"` | Enum string, transformed to boolean, optional | — (returns both) |
| `limit` | `number` | Coerced from string, min 1, max 20, optional | `15` |
| `cursor` | `Date string` | ISO date, coerced to `Date`, optional | — |

**Validation Rules (cross-field):**
- `cursor` must NOT be earlier than `startDate` (if both are provided)
- `startDate` must NOT be later than `endDate` (if both are provided)

**Error `400` — Cross-field validation failure:**
```json
{ "success": false, "message": "Invalid get request!" }
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "todos": [ ... ],
    "hasNextPage": false,
    "nextCursor": null
  }
}
```

> **Pagination behaviour:** Works the same as `GET /api/todo/` — pass `nextCursor` as `cursor` on subsequent requests to get the next page.

---

### `GET /api/todo/graph`

Fetch a todo activity graph for a specific day. Returns todos grouped by hour, showing the minutes within each hour that have a todo scheduled. Used to visualize todo density across the day.

**Auth required:** ✅ Yes

**Query Parameters:**
| Param | Type | Validation Rules |
|---|---|---|
| `targetDate` | `Date string` | ISO date string, coerced to `Date`, **required** |

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "graph": {
      "8": [30, 45],
      "13": [0, 15],
      "20": [0]
    }
  }
}
```

> **Graph structure:** The response `graph` object is a map where each key is an **hour of the day** (0–23, UTC) and the value is an **array of minutes** within that hour that have at least one todo. Hours with no todos are omitted entirely.
>
> **Example:** `{ "8": [30, 45] }` means the user has todos scheduled at 08:30 and 08:45 on the target date.

---

## 🔴 Common Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad request — validation failed or invalid input |
| `401` | Unauthorized — missing, invalid, or expired JWT / refresh token |
| `404` | Resource not found |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

**Standard error body shape:**
```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```

---

## 🏗️ Project Architecture

```
src/
├── index.ts              # App entry point — Express setup, CORS, DB connections
├── routes/
│   ├── user.ts           # User route definitions (/api/user/*)
│   └── todo.ts           # Todo route definitions (/api/todo/*)
├── controllers/
│   ├── user.ts           # Handles auth: signup, login, logout, refresh, profile, delete
│   └── Todo.ts           # Handles todos: create, read, update, delete, graph
├── services/
│   ├── user.ts           # DB operations: create/get/delete user
│   ├── Todo.ts           # DB operations: CRUD + date-range query + aggregation graph
│   ├── token.ts          # Refresh token: create/get/delete/revoke-all (hashed in DB)
│   └── redis.ts          # JWT blocklist via Redis (blockJWT)
├── middleware/
│   ├── users.ts          # validateJwt — decodes cookie JWT, attaches req.user
│   ├── dataValidation.ts # validateData — runs Zod schema, puts result in res.locals
│   └── rateLimiter.ts    # rateLimiter(key) — Redis-based per-IP rate limiting
├── dataValidation/
│   ├── user.ts           # Zod schemas: userSignupSchema, userloginSchema
│   └── todo.ts           # Zod schemas: TodoSchema, TodoUpdateSchema, TodoGetSchema,
│                         #              TodoGetByDateRangeSchema, TodoGetGraphSchema
├── models/               # Mongoose models: User, Todo, RefreshToken
├── utils/                # Helpers: JWT, bcrypt, constants, env loader
├── types/                # Shared TypeScript types (e.g. IRefreshToken, req.user)
└── dbconfig/             # MongoDB + Redis connection logic
```
