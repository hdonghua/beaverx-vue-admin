# BeaverX Vue Admin (Frontend)

> **Language**: [简体中文](README.md) | English

Admin dashboard frontend based on [Arco Design Pro Vue](https://arco.design/vue/docs/pro/start), integrated with the `BeaverX.Admin` backend API. Menus and button permissions are served from the backend—ideal for RBAC scenarios.

## Live Demo

| Item | Details |
|------|---------|
| URL | [https://beaverxadmin.com/](https://beaverxadmin.com/) |
| Account | `admin` / `Admin@123` |

> **Demo notice**: Data is reset every **5 minutes**. Do not store important information or use this environment for production.

## Screenshots

The screenshots below are from the [live demo](https://beaverxadmin.com/), in sidebar order (original files in the repo `imgs/` folder).

### Home

![Home](imgs/首页.png)

### System Management

#### User Management

![User Management](imgs/用户管理.png)

#### Role Management

![Role Management](imgs/角色管理.png)

#### Dictionary

![Dictionary](imgs/字典管理.png)

#### Configuration

![Configuration](imgs/配置管理.png)

#### Scheduled Jobs

![API Scheduled Jobs](imgs/api定时任务.png)

Hangfire dashboard (`/hangfire`, separate credentials—see backend config):

![Hangfire Dashboard](imgs/hangfire面板.png)

#### Online Users

![Online Users](imgs/在线用户.png)

### Payment

#### Alipay

![Alipay](imgs/支付宝.png)

### Components

#### Rich Text Editor

![Rich Text](imgs/富文本.png)

### Profile

#### User Center

![User Center](imgs/用户中心.png)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 + TypeScript |
| Build | Vite 8 |
| UI | Arco Design Vue |
| Router | Vue Router 4 |
| State | Pinia |
| HTTP | Axios |
| Realtime | SignalR (`@microsoft/signalr`) |

## Requirements

- Node.js >= 20.19.0 (required by Vite 8; Node 22 LTS recommended)
- pnpm / npm / yarn
- Backend API running locally (default `http://localhost:5216`)

Backend [BeaverX.Admin](https://github.com/hdonghua/BeaverX.Admin) uses Git branches for ORM / database. **This frontend needs no changes:**

| Backend branch | ORM / Database | Notes |
|----------------|----------------|-------|
| `master` (default) | EF Core + PostgreSQL | |
| `master-mysql` | EF Core + MySQL 8+ | |
| `sqlsugar` | SqlSugar + PostgreSQL | Create empty DB first; tables sync on startup |
| `sqlsugar-mysql` | SqlSugar + MySQL 8+ | Same; Hangfire needs `Allow User Variables=True` |

For SQL Server / Oracle etc.: SqlSugar → change `DbType`; EF Core → implement drivers yourself (see backend README / docs).

## Quick Start

```bash
# Install dependencies
npm install

# Configure backend URL (see .env.development)
# VITE_API_BASE_URL=http://localhost:5216

# Start dev server (default http://localhost:5173)
npm run dev
```

Default account (from backend seed data): `admin` / `Admin@123`

### Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development mode |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview production build |
| `npm run type:check` | TypeScript check only |

## Project Structure

```
beaverx-vue-admin/
├── imgs/                   # README screenshots
├── config/                 # Vite config
├── src/
│   ├── api/                # Business APIs (by module)
│   │   └── server/
│   │       ├── auth/       # Login, profile
│   │       ├── rbac/       # Users, roles, menus
│   │       ├── system/     # Config, dict, jobs, export
│   │       ├── message/    # Site messages
│   │       ├── payment/    # Payment channels, orders
│   │       └── common/     # File upload, SignalR event types
│   ├── components/         # Global components
│   ├── config/settings.json # Layout/theme/server menu flags
│   ├── hooks/              # Composables
│   ├── locale/             # Global copy
│   ├── router/
│   │   ├── index.ts        # Router entry, / redirect
│   │   ├── guard/          # Login & permission guards
│   │   └── routes/modules/ # Static route modules
│   ├── store/modules/      # Pinia (user, app, tab-bar, etc.)
│   ├── utils/
│   │   ├── request/        # Axios interceptors, ApiResponse, token refresh
│   │   ├── auth.ts         # Token read/write
│   │   ├── server-menu.ts  # Server menu → routes/permissions
│   │   └── register-server-routes.ts
│   └── views/              # Pages (by business area)
└── .env.development        # Dev environment variables
```

## Core Concepts (Must Read)

### 1. Server-Side Menu Mode

When `menuFromServer: true` in `src/config/settings.json`:

- Sidebar menus come from `GET /api/Menu/user-menus`
- After login, routes are **registered dynamically** from backend menus (`dir-{id}` / `menu-{id}`); directories use `DEFAULT_LAYOUT`
- **`component`** lazy-loads pages under `views/`—business menus do **not** need pre-defined routes in `router/routes/modules/`
- **`path`** is the URL from the backend; on refresh, menus are re-fetched, routes re-registered, and navigation retried
- A `.vue` file matching `component` must exist under `views/`, or the menu will not work

### 2. Routing & Permissions

| File | Role |
|------|------|
| `router/guard/userLoginInfo.ts` | Redirect unauthenticated users; handle logged-in `/login` |
| `router/guard/permission.ts` | Route whitelist under server menu mode |
| `router/constants.ts` | Whitelist routes like `Home`, `403` |

Static routes in `router/routes/modules/` are mainly for **Home, component demos**, etc. when `menuFromServer: true`; business menus come from the backend.

| Field | Example | Description |
|-------|---------|-------------|
| Backend `component` | `system/user/index` | Maps to `views/system/user/index.vue` (must exist) |
| Backend `path` | `/system/user` | Registered route path (customizable) |
| Route `name` | `menu-{id}` | Auto-generated; no frontend config needed |

### 3. API Calls

- Base URL: `VITE_API_BASE_URL` in `.env.development`
- Request layer: `src/utils/request/` (interceptors in `index.ts`; imported in `main.ts`)
- Requests include `Authorization: Bearer <token>`
- Interceptor refreshes access token before expiry; 401 triggers refresh + retry
- Business APIs: `src/api/server/<module>/`, return type `ApiResponse<T>`

**Modules & imports:**

| Module | Path | Import example |
|--------|------|----------------|
| Auth | `api/server/auth/` | `import { login } from '@/api/server/auth'` |
| RBAC | `api/server/rbac/` | `import { queryUserPage } from '@/api/server/rbac/user'` |
| System | `api/server/system/` | `import { queryConfigPage } from '@/api/server/system/config'` |
| Message | `api/server/message/` | `import { getMessageList } from '@/api/server/message/message'` |
| Payment | `api/server/payment/` | `import { queryPaymentOrderPage } from '@/api/server/payment/order'` |
| Common | `api/server/common/` | `import { RealtimeEvents } from '@/api/server/common/realtime'` |

```ts
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import type { PagedResultDto } from '@/types/page';
import type { ConfigDto } from '@/api/server/system/config';

export function queryConfigPage(req: QueryConfigPageRequest) {
  return axios.get<unknown, ApiResponse<PagedResultDto<ConfigDto>>>(
    '/api/Config/list',
    { params: { page: req.current, pageSize: req.pageSize } }
  );
}
```

Entity IDs are snowflake IDs serialized as `string` in JSON; use `EntityId` (`src/types/entity-id.ts`) on the frontend.

### 4. Realtime Notifications (SignalR)

After login, `default-layout` connects to `/hubs/notifications`; JWT is passed via `accessTokenFactory`.

| File | Role |
|------|------|
| `src/utils/realtime-hub.ts` | Connection management, `onRealtimeEvent` subscription |
| `src/hooks/use-realtime-hub.ts` | Layout-level connection lifecycle |
| `src/api/server/common/realtime.ts` | Event names and payload types |

| Event | Purpose |
|-------|---------|
| `export.task.changed` | Export badge, export list status |
| `message.unread.changed` | Unread badge, message list refresh |

HTTP polling for export tasks and unread messages has been removed.

### 5. Login & Redirects

- Visit `/`: logged in → `/home`, otherwise → `/login`
- In-app navigation to login while logged in: stay on current page
- Direct `/login` while logged in: redirect to home

## Adding a Business Page (Standard Flow)

Example: **Configuration Management**.

### Step 1: Static Route

Add a child route in `src/router/routes/modules/system.ts` with a clear `name` (e.g. `ConfigList`):

```ts
{
  path: 'config',
  name: 'ConfigList',
  component: () => import('@/views/system/config/index.vue'),
  meta: { locale: 'menu.system.configList', requiresAuth: true, roles: ['*'] },
}
```

Set backend menu `component` to `system/config/index`; `path` is up to you. Parent layout routes are auto-allowed.

### Step 2: API

Wrap CRUD in `src/api/server/system/config.ts` (or the matching module); import `ApiResponse` from `@/utils/request`.

### Step 3: Page

Create `src/views/system/config/index.vue`; refer to `dict` or `user` list pages.

### Step 4: Copy

Use Chinese text directly in page templates or route `meta.title`.

### Step 5: Backend

Add menu in **Menu Management** (or `RbacDataSeeder`): `component` = `system/config/index`, custom `path`, permission codes. See [BeaverX.Admin README](https://github.com/hdonghua/BeaverX.Admin).

> Day-to-day: add static route + view + API on the frontend; configure `component` / permissions on the backend and assign to roles—**no changes** to `server-menu.ts` required.

## Layout & Global Settings

- App name, footer: `src/config/settings.json`
- Theme, dark mode, tab bar: same file, or `useAppStore().updateSettings()` at runtime

## FAQ

| Symptom | Check |
|---------|-------|
| 401 / login loop | `VITE_API_BASE_URL`, backend CORS, token expiry |
| Menu visible but 403 on page | Backend `component` matches `views/` path (e.g. `system/config/index`) |
| 404 on refresh / deep link | `permission.ts` and `register-server-routes.ts` |
| Build failure | Run `npm run type:check` first |

## Related Repositories

- Backend API: [BeaverX.Admin](https://github.com/hdonghua/BeaverX.Admin) (branches: `master` / `master-mysql` / `sqlsugar` / `sqlsugar-mysql`; frontend is shared)
