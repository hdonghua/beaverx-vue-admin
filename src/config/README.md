# settings.json 配置说明

配置分为两类：

| 类型 | 文件 / 存储 | 谁能改 |
|------|-------------|--------|
| **固定配置** | `src/config/settings.json` | 仅开发者部署时修改 |
| **用户偏好** | Pinia `app` store → `localStorage` 键 `app-user-preferences` | 登录用户通过导航栏「页面配置」修改 |

---

## 一、固定配置（settings.json）

部署前编辑 `src/config/settings.json`，修改后需重新构建或重启开发服务。

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `systemName` | `string` | `"BeaverXAdmin"` | 系统名称：浏览器标题、顶栏、登录页、首页欢迎语等。 |
| `footerText` | `string` | 见文件 | 主布局底部版权 HTML（支持 `<a>` 等标签）。`footer: true` 时显示。 |
| `loginFooter` | `boolean` | `true` | 登录页是否显示页脚。 |
| `navbarSettings` | `boolean` | `false` | 是否在导航栏显示「页面配置」齿轮；为 `false` 且无顶栏时显示右侧悬浮设置按钮。 |
| `menuFromServer` | `boolean` | `true` | `true`：侧边栏菜单来自后端权限接口；`false`：仅用前端静态菜单。 |
| `avatarEnabled` | `boolean` | `false` | 用户中心是否显示头像上传。 |

示例：

```json
{
  "systemName": "BeaverXAdmin",
  "footerText": "Copyright © BeaverX",
  "loginFooter": true,
  "navbarSettings": false,
  "menuFromServer": true,
  "avatarEnabled": false
}
```

---

## 二、用户偏好（界面可改 + 本地持久化）

在导航栏「页面配置」中调整，**自动保存到浏览器** `localStorage`（`app-user-preferences`），换设备或清缓存后恢复为代码中的默认值。

默认值定义在：`src/config/user-preference-defaults.ts`

| 字段 | 说明 |
|------|------|
| `theme` | 亮/暗色（`light` / `dark`），也可在顶栏快捷切换 |
| `themeColor` | 主题色，动态写入 Arco `--arcoblue-*` 变量 |
| `colorWeak` | 色弱模式 |
| `navbar` | 是否显示顶栏 |
| `menu` | 是否显示菜单区域 |
| `topMenu` | 菜单在顶栏横向展示（否则左侧边栏） |
| `menuCollapse` | 侧边栏是否收起 |
| `menuWidth` | 侧边栏展开宽度（px） |
| `footer` | 是否显示主布局底部 |
| `tabBar` | 是否显示多页签 |

抽屉内可点击 **恢复默认**，将上述项重置为 `user-preference-defaults.ts` 中的值。

修改项目级默认偏好（新用户首次访问时的初始值），请编辑 `user-preference-defaults.ts`，而非 `settings.json`。

---

## 三、运行时字段（勿配置）

由程序维护，不写入 `settings.json`，也不持久化：

`hideMenu`、`device`、`globalSettings`、`serverMenuFetched`、`serverMenu`、`allowedRouteNames`、`registeredServerRouteNames`

---

## 相关代码

| 用途 | 位置 |
|------|------|
| 固定配置 | `src/config/settings.json` |
| 用户偏好默认值 | `src/config/user-preference-defaults.ts` |
| Store 与持久化 | `src/store/modules/app/index.ts` |
| 主题色 / 色弱应用 | `src/utils/apply-user-preferences.ts` |
| 页面配置抽屉 | `src/components/global-setting/` |
