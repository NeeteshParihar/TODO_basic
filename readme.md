
<!--  futute improvements -->

# Backend Application Review & Future Improvement Plan

This document outlines a review of the current TodoApp backend architecture and provides a structured plan for future improvements. The application is a solid foundation built with Express, TypeScript, MongoDB, and Redis, featuring JWT-based authentication, rate limiting, and cursor-based pagination. 

## Current Strengths
- **Modern Stack:** TypeScript provides good type safety. Express is lightweight and well-understood.
- **Robust Authentication:** Implementation of Access + Refresh tokens via HTTP-only cookies, combined with Redis-based JWT blacklisting for logouts, is a highly secure approach.
- **Performance:** Redis is utilized effectively for both rate limiting and token blacklisting. Cursor-based pagination on the Todo fetch API is excellent for performance on large datasets.
- **Validation:** Use of a dedicated data validation layer (middleware + schemas) keeps controllers cleaner.

## Proposed Improvements

The improvements are categorized by priority and impact.

### Phase 1: Security & Stability (High Priority)
1. **Centralized Error Handling:**
   - **Current:** Every controller has a `try-catch` block repeating `res.status(500).json(...)`.
   - **Improvement:** Implement a global error-handling middleware. Create custom error classes (e.g., `AppError`, `NotFoundError`, `UnauthorizedError`) to throw from anywhere in the app, which the global handler will catch and format appropriately.
2. **CORS & Helmet Integration:**
   - **Current:** Missing CORS configuration and standard HTTP security headers.
   - **Improvement:** Add `cors` middleware to explicitly allow only trusted frontend domains. Add `helmet` middleware to secure HTTP headers against common web vulnerabilities.
3. **Database Connection Resilience:**
   - **Current:** If MongoDB or Redis fails to connect on startup, the app crashes (`process.exit(1)`).
   - **Improvement:** Implement connection retry logic or graceful degradation so the app can recover if the DB drops temporarily.

### Phase 2: Architecture & Code Quality (Medium Priority)
1. **Controller & Service Layer Separation:**
   - **Current:** Controllers still handle some business logic (e.g., checking if a user exists before creating, complex refresh token logic).
   - **Improvement:** Move business logic entirely into the `services` layer. Controllers should only be responsible for extracting the request data, passing it to the service, and returning the HTTP response.
2. **Structured Logging:**
   - **Current:** Uses standard `console.log()` across the app.
   - **Improvement:** Introduce a logging library like **Winston** or **Pino**. This allows for different log levels (info, warn, error) and saving logs to files or external monitoring services in production.
3. **API Documentation:**
   - **Current:** Endpoints must be read from the source code.
   - **Improvement:** Implement **Swagger (OpenAPI)** via `swagger-ui-express`. This creates a beautiful UI for frontend developers to test and understand the APIs.

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
> **My recommendation:** We should start by implementing **Centralized Error Handling** and **CORS/Helmet**, as these will immediately clean up your codebase and secure your application for frontend integration.


```text
1. Improve the auth logic: edgeCase: when user refreshToken expires the frontend makes the request but can't refresh it so it tries to login but due to duplicate record error the login is failing so imporve htis
```

---

# API Documentation

> **Base URL:** `http://localhost:3000`  
> **Authentication:** All protected routes require a valid JWT sent automatically via an HTTP-only cookie (`jwtToken`).  
> All request/response bodies use `Content-Type: application/json`.

---

## 🔐 User Routes — `/api/user`

Rate-limited per IP.

---

### `POST /api/user/auth/signup`

Register a new user account.

**Auth required:** ❌ No

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `username` | `string` | min 3 characters |
| `email` | `string` | valid email format, lowercased |
| `password` | `string` | min 8 characters |

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

**Sets cookies:** `jwtToken` (access token), `refToken` (refresh token)

---

### `POST /api/user/auth/login`

Log in with existing credentials.

**Auth required:** ❌ No

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `email` | `string` | valid email, lowercased |
| `password` | `string` | min 8 characters |

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

**Sets cookies:** `jwtToken`, `refToken`

---

### `POST /api/user/auth/logout`

Log out the current user. Blocks the active JWT and deletes the refresh token from the DB.

**Auth required:** ✅ Yes

**Request Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

**Clears cookies:** `jwtToken`, `refToken`

---

### `POST /api/user/auth/refreshToken`

Issue a new access token using the refresh token cookie. Call this when the frontend receives a `401` from any protected route.

**Auth required:** ❌ No (uses `refToken` cookie)

**Request Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Refreshed successfully!",
  "userId": "<userId>"
}
```

**Sets cookie:** `jwtToken` (new access token)

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

---

### `DELETE /api/user/`

Permanently delete the authenticated user's account. Also blocks the current JWT and revokes all refresh tokens.

**Auth required:** ✅ Yes

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## ✅ Todo Routes — `/api/todo`

Rate-limited per IP. All routes require authentication.

---

### `POST /api/todo/`

Create a new todo.

**Auth required:** ✅ Yes

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `title` | `string` | min 3 characters |
| `date` | `string` / `Date` | any valid date string, auto-coerced to `Date` |
| `isCompleted` | `boolean` | optional, defaults to `false` |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Todo created successfully!",
  "data": {
    "todo": { ... }
  }
}
```

**Error `400` (duplicate date):**
```json
{ "success": false, "message": "Please choose a different date", "errorCode": 11000 }
```

---

### `GET /api/todo/`

Fetch todos for the authenticated user with cursor-based pagination.

**Auth required:** ✅ Yes

**Query Parameters:**
| Param | Type | Rules | Default |
|---|---|---|---|
| `limit` | `number` | min 1, optional | `10` |
| `cursor` | `Date string` | ISO date string, optional — the `date` of the last item from the previous page | — |

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "todos": [ ... ],
    "hasNextPage": true,
    "nextCursor": "2024-01-15T00:00:00.000Z"
  }
}
```

> **How cursor pagination works:** On the first request, omit `cursor`. For the next page, pass the `nextCursor` value returned in the previous response as the `cursor` query parameter.

---

### `PATCH /api/todo/:id`

Update an existing todo by its MongoDB `_id`.

**Auth required:** ✅ Yes

**URL Params:**
| Param | Description |
|---|---|
| `id` | MongoDB ObjectId of the todo |

**Request Body** (at least one field required):
| Field | Type | Rules |
|---|---|---|
| `title` | `string` | min 3 characters, optional |
| `isCompleted` | `boolean` | optional |
| `date` | `string` / `Date` | valid date, optional |

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

---

### `GET /api/todo/get`

Fetch todos filtered by a date range, with cursor-based pagination and completion status filter.

**Auth required:** ✅ Yes

**Query Parameters:**
| Param | Type | Rules | Default |
|---|---|---|---|
| `startDate` | `Date string` | ISO date, optional | — |
| `endDate` | `Date string` | ISO date, optional | — |
| `isCompleted` | `boolean` | `true` or `false`, optional | — |
| `limit` | `number` | min 1, max 20, optional | `15` |
| `cursor` | `Date string` | must be ≥ `startDate` if both provided, optional | — |

> **Validation Rules:**  
> - `cursor` must not be earlier than `startDate`  
> - `startDate` must not be later than `endDate`

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

---

## 🔴 Common Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad request — validation failed or invalid input |
| `401` | Unauthorized — missing or invalid/expired JWT |
| `404` | Resource not found |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

**Error body shape:**
```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```
