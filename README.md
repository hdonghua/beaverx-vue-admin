# BeaverX Vue Admin（前端）

基于 [Arco Design Pro Vue](https://arco.design/vue/docs/pro/start) 的管理后台前端，对接 `BeaverX.Admin` 后端 API。菜单与按钮权限由服务端下发，适合 RBAC 场景。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite 3 |
| UI | Arco Design Vue |
| 路由 | Vue Router 4 |
| 状态 | Pinia |
| HTTP | Axios |
| 国际化 | vue-i18n |

## 环境要求

- Node.js >= 16（推荐 18+）
- pnpm / npm / yarn 均可
- 本地已启动后端 API（默认 `http://localhost:5216`）

## 快速开始

```bash
# 安装依赖
npm install

# 配置后端地址（见 .env.development）
# VITE_API_BASE_URL=http://localhost:5216

# 启动开发服务（默认 http://localhost:5173）
npm run dev
```

默认账号（由后端种子数据提供）：`admin` / `admin123`

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run type:check` | 仅 TypeScript 检查 |

## 目录结构

```
beaverx-vue-admin/
├── config/                 # Vite 配置
├── src/
│   ├── api/                # 接口封装
│   │   ├── interceptor.ts  # Axios 拦截器（Token、刷新、错误）
│   │   └── server/         # 业务 API（按模块分文件）
│   ├── components/         # 全局组件
│   ├── config/settings.json # 布局/主题/是否服务端菜单等
│   ├── hooks/              # 组合式函数
│   ├── locale/             # 全局文案
│   ├── router/
│   │   ├── index.ts        # 路由入口、/ 重定向逻辑
│   │   ├── guard/          # 登录守卫、权限守卫
│   │   └── routes/modules/ # 静态路由模块
│   ├── store/modules/      # Pinia（user、app、tab-bar 等）
│   ├── utils/
│   │   ├── auth.ts         # Token 读写
│   │   ├── server-menu.ts  # 服务端菜单 → 路由/权限映射
│   │   └── register-server-routes.ts
│   └── views/              # 页面（按业务分目录）
└── .env.development        # 开发环境变量
```

## 核心机制（必读）

### 1. 服务端菜单模式

`src/config/settings.json` 中 `menuFromServer: true` 时：

- 侧边栏菜单来自接口 `GET /api/Menu/user-menus`
- 路由是否可访问由 `allowedRouteNames` 控制（见 `permission.ts`）
- **新增系统菜单页面时**，必须在 `src/utils/server-menu.ts` 的 `PATH_TO_ROUTE_NAME` 中增加映射，例如：

```ts
const PATH_TO_ROUTE_NAME: Record<string, string> = {
  '/system/config': 'ConfigList', // path → 路由 name
};
```

否则会出现：菜单能显示，但点击进入 **403**。

### 2. 路由与权限

| 文件 | 作用 |
|------|------|
| `router/guard/userLoginInfo.ts` | 未登录跳转登录；已登录访问 `/login` 的处理 |
| `router/guard/permission.ts` | 服务端菜单下的路由白名单校验 |
| `router/constants.ts` | `Home`、`403` 等白名单路由 |

静态路由定义在 `router/routes/modules/`，需与后端菜单的 `path`、`component` 一致，例如：

- 后端 `path`: `/system/config`
- 后端 `component`: `system/config/index`
- 前端路由：`path: 'config'`，组件 `@/views/system/config/index.vue`

### 3. API 调用

- 基础地址：`.env.development` 的 `VITE_API_BASE_URL`
- 请求自动附带 `Authorization: Bearer <token>`
- Access Token 将过期时由拦截器调用 refresh；401 会尝试刷新后重试
- 业务代码统一使用 `src/api/server/*.ts`，返回类型为 `ApiResponse<T>`

示例：

```ts
import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';

export function queryConfigPage(req: QueryConfigPageRequest) {
  return axios.get<unknown, ApiResponse<PagedResultDto<ConfigDto>>>(
    '/api/Config/list',
    { params: { page: req.current, pageSize: req.pageSize } }
  );
}
```

### 4. 登录与跳转

- 访问 `/`：已登录 → `/home`，未登录 → `/login`
- 应用内已登录再点登录页：取消跳转，留在当前页
- 地址栏直接打开 `/login` 且已登录：重定向到首页

## 新增业务页面（标准流程）

以「配置管理」为例，完整链路如下。

### 步骤 1：静态路由

`src/router/routes/modules/system.ts` 增加子路由，`name` 与 `PATH_TO_ROUTE_NAME` 保持一致：

```ts
{
  path: 'config',
  name: 'ConfigList',
  component: () => import('@/views/system/config/index.vue'),
  meta: { locale: 'menu.system.configList', requiresAuth: true, roles: ['*'] },
}
```

### 步骤 2：菜单 path 映射

`src/utils/server-menu.ts` → `PATH_TO_ROUTE_NAME` 增加 `/system/config: 'ConfigList'`。

### 步骤 3：API

`src/api/server/config.ts` 封装 CRUD 接口。

### 步骤 4：页面

`src/views/system/config/index.vue`，可参考 `dict`、`user` 列表页写法。

### 步骤 5：文案

`src/locale/zh-CN.ts`、`en-US.ts` 增加 `menu.system.configList`。

### 步骤 6：后端配合

后端需同步提供：菜单种子、权限码、Controller。详见 [BeaverX.Admin README](https://github.com/hdonghua/BeaverX.Admin)。

## 布局与全局配置

- 系统名称、页脚：`src/config/settings.json`
- 主题色、暗色模式、Tab 栏等：同上，或在运行时通过 `useAppStore().updateSettings()` 修改

## 常见问题

| 现象 | 排查 |
|------|------|
| 接口 401 / 一直跳登录 | 检查 `VITE_API_BASE_URL`、后端 CORS、Token 是否过期 |
| 有菜单但进页面 403 | 检查 `PATH_TO_ROUTE_NAME` 是否配置 |
| 刷新外链/子路由 404 | 检查 `permission.ts` 与 `register-server-routes.ts` |
| 构建失败 | 先执行 `npm run type:check` 定位 TS 错误 |

## 相关仓库

- 后端 API：[BeaverX.Admin](https://github.com/hdonghua/BeaverX.Admin)
