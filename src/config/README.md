# settings.json 配置说明

本目录下的 `settings.json` 是管理后台的**默认布局与全局展示配置**。应用启动时由 Pinia `app` store 读取，作为整站 UI 的初始状态。

配置文件路径：`src/config/settings.json`

## 如何修改

### 方式一：直接编辑 JSON（推荐用于项目级默认）

1. 打开 `src/config/settings.json`
2. 修改对应字段后保存
3. 重新启动开发服务，或重新构建部署

修改会作为**新会话的默认值**生效。

### 方式二：页面配置抽屉（临时调试）

导航栏右侧「设置」按钮可打开配置抽屉，调整开关后会立即生效。若需固化到项目：

1. 在抽屉中调整好选项
2. 点击「复制配置」
3. 将剪贴板内容粘贴并覆盖 `src/config/settings.json` 中对应字段（不必复制运行时字段，见下文）

> 注意：全局设置里提示的路径若为 `src/settings.json`，实际应写入 **`src/config/settings.json`**。

---

## 配置项说明

### 品牌与文案

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `systemName` | `string` | `"BeaverXAdmin"` | 系统名称。用于浏览器标题（`document.title`）、顶部导航 Logo 旁文字、登录页标题、首页欢迎语等。 |
| `footerText` | `string` | 见文件 | 主布局底部版权 HTML。支持 HTML 标签（如 `<a>` 链接），通过 `v-html` 渲染。仅当 `footer: true` 时显示。 |
| `loginFooter` | `boolean` | `true` | 是否在**登录页**底部显示与 `footerText` 相同内容的页脚。 |

### 主题与外观

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `"light"` \| `"dark"` | `"light"` | 亮/暗色主题初始值。用户也可在导航栏切换；切换后会同步到 `body` 的 `arco-theme` 属性，并与 `localStorage` 键 `arco-theme` 联动。 |
| `colorWeak` | `boolean` | `false` | 色弱模式。为 `true` 时对 `document.body` 应用 `filter: invert(80%)`。 |
| `themeColor` | `string` | `"#165DFF"` | 主题色（Arco 默认蓝）。**当前版本仅作为配置占位**，尚未接入动态换色；若要自定义品牌色，需配合 Arco Design 主题包或 Less 变量另行配置。 |

### 布局结构

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `navbar` | `boolean` | `true` | 是否显示顶部导航栏（搜索、主题切换、消息、用户菜单等）。 |
| `navbarSettings` | `boolean` | `false` | 是否在导航栏显示「页面配置」齿轮按钮。为 `false` 且 `navbar` 也为 `false` 时，会在页面右侧显示悬浮设置按钮。 |
| `menu` | `boolean` | `true` | 是否启用侧边/顶部菜单区域。为 `false` 时不渲染菜单。 |
| `topMenu` | `boolean` | `false` | 为 `true` 时菜单显示在**顶部导航栏内**（横向）；为 `false` 时显示为**左侧边栏**（纵向）。开启时会自动将 `menuCollapse` 设为 `false`。 |
| `menuWidth` | `number` | `220` | 侧边栏展开时的宽度（像素）。收起时固定为 48px。 |
| `menuCollapse` | `boolean` | `false` | 侧边栏是否默认收起。桌面端可通过菜单底部按钮切换；也会写入 store。 |
| `footer` | `boolean` | `false` | 是否在主内容区底部显示页脚（`footerText`）。 |
| `tabBar` | `boolean` | `true` | 是否显示多页签栏（访问过的页面以标签形式展示，支持缓存与关闭）。 |

### 菜单与路由

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `menuFromServer` | `boolean` | `true` | 为 `true` 时，侧边栏菜单主要来自后端接口（用户权限菜单），并与前端 `staticMenu` 静态路由合并；为 `false` 时仅使用前端 `router/app-menus` 静态菜单。切换为 `true` 时会触发拉取服务端菜单。 |
| `avatarEnabled` | `boolean` | `false` | 用户中心「个人信息」面板是否显示头像上传区域。为 `false` 时仅显示文字信息表单。 |

### 运行时字段（勿写入默认配置）

以下字段存在于 `settings.json` 中是为了与 store 状态结构一致，**由程序在运行时维护**，部署时不应手动配置，复制配置时也可忽略：

| 字段 | 说明 |
|------|------|
| `hideMenu` | 窄屏（宽度 &lt; 992px）下是否以抽屉形式隐藏侧边栏，由 `useResponsive` 根据窗口尺寸自动设置。 |
| `device` | 当前设备类型：`"desktop"` 或 `"mobile"`，随窗口 resize 自动更新。 |
| `globalSettings` | 页面配置抽屉是否打开，仅会话内有效。 |
| `serverMenuFetched` | 本会话是否已请求过服务端菜单（避免重复请求）。 |
| `serverMenu` | 服务端菜单转换后的路由树，登录后由接口填充。 |
| `allowedRouteNames` | 当前用户可访问的路由 `name` 列表，用于路由鉴权。 |
| `registeredServerRouteNames` | 已动态注册到 Vue Router 的服务端路由名，用于登出或刷新菜单时卸载。 |

---

## 常见组合示例

**默认后台（当前仓库默认）**

- 顶栏 + 左侧菜单 + 多页签 + 服务端菜单

```json
{
  "navbar": true,
  "menu": true,
  "topMenu": false,
  "tabBar": true,
  "menuFromServer": true,
  "footer": false
}
```

**顶部菜单布局**

```json
{
  "topMenu": true,
  "menuCollapse": false
}
```

**纯静态菜单（不依赖后端菜单接口）**

```json
{
  "menuFromServer": false
}
```

**精简界面（无顶栏、无页签）**

```json
{
  "navbar": false,
  "tabBar": false,
  "navbarSettings": true
}
```

---

## 相关代码

| 用途 | 位置 |
|------|------|
| 读取默认配置 | `src/store/modules/app/index.ts` |
| 类型定义 | `src/store/modules/app/types.ts` |
| 主布局应用配置 | `src/layout/default-layout.vue` |
| 可视化配置抽屉 | `src/components/global-setting/` |
| 响应式 `device` / `hideMenu` | `src/hooks/responsive.ts` |
| 服务端菜单拉取 | `appStore.fetchServerMenuConfig()` |

如有新增配置项，请同步更新本文件与 `AppState` 类型定义。
