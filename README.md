# dsh-ui-alt

在保持原版 UI 大风格不变的情况下，进行减小圆角、紧凑化、秩序化、整洁化改进。使 UI 视觉更加冷静、专业、高效。可在设置中单独调整每一项改动。

插件由 CSS 覆盖加少量 DOM 注入组成，所有改动都可以在 设置 →「UI 改进」里逐项开关；关掉开关即恢复原版外观。

## 功能

**外观**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| 隐藏左上角 Logo | 关 | 隐藏侧栏顶部的 Logo |
| Windows 默认微软雅黑字体 | 关 | Windows 端默认字体改为微软雅黑，低分辨率屏幕 200% 以下缩放带 hinting，更锐利；手动设置字体或 macOS 不受影响 |

**布局**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| 减小圆角与紧凑界面 | 开 | 缩小全局圆角、缩小侧栏部分字号、收紧间距，使界面更高效 |
| 统一新会话按钮样式 | 开 | 新会话按钮样式改为与导航按钮一致 |
| 折叠侧栏导航功能 | 开 | 折叠侧栏导航，点击箭头展开收起 |
| 弱化工作区名称 | 开 | 工作区名称弱化，使工作区和会话更易区分 |
| 会话前圆点 | 开 | 会话前显示一个圆点 |
| 移除工作区与会话悬停提示 | 开 | 悬停在侧栏工作区、会话上时不再显示详情卡片，使滚动更流畅 |
| 隐藏会话悬停多余按钮 | 开 | 悬停会话行时只保留菜单和置顶，其余按钮（含插件添加的）隐藏；若有插件按钮未在右键菜单中，可关闭 |
| 设置面板全屏 | 开 | 使用非窗口化的设置页面 |

另有一些不挂开关的固定样式：设置导航列宽 220px、归档会话标题画删除线、选择题选中项的序号反色高亮、浅色主题下选中会话背景加强、工作区行悬停时保持文件夹图标。

## 安装

在 DeepSeek Harness 里用插件管理器安装本仓库目录：

```text
plugin_manager install_bundle  target=<本仓库绝对路径>
```

安装后刷新 Web 页面，设置里会出现「UI 改进」一栏，侧栏设置导航同时出现对应图标。

插件以 `link` 方式登记到 profile，因此本仓库目录需要保留在原位；移动或删除目录前请先卸载。

## 设置项与持久化

开关状态存放在 `localStorage` 的 `dsh-ui-alt:prefs:v1` 键下，写成 `html[data-dcc-*]` 属性驱动样式：

| 属性 | 取值 |
| --- | --- |
| `data-dcc-radius` | `on` / `off` |
| `data-dcc-new` | `on` / `off` |
| `data-dcc-nav` | `collapsed` / `expanded` |
| `data-dcc-dim` | `on` / `off` |
| `data-dcc-logo` | `hidden` / `shown` |
| `data-dcc-dot` | `on` / `off` |
| `data-dcc-font` | `on` / `off` |
| `data-dcc-full` | `on` / `off` |
| `data-dcc-hover` | `on` / `off` |

## 目录结构

```text
dsh-ui-alt/
├── package.json      ← 名称/版本/exports/files/dsh 清单
├── cordis.patch.yml  ← 插入行：id/name = dsh-ui-alt
├── index.js          ← Host 半（空 apply，无 Host 逻辑）
├── client.js         ← 全部功能：CSS 覆盖 + 少量 DOM 注入
├── locale/
│   ├── zh.json       ← 插件管理器标题/描述
│   └── en.json
└── icon.svg          ← 设置页导航图标 + 插件图标
```

`client.js` 内部：

- 预置数据：`STORAGE_KEY`、`DEFAULTS`、`readPrefs()` / `applyPrefs()` / `savePrefs()`。
- 一大段 `css` 字符串，全部按 `html[data-dcc-*]` 条件生效；设置页自身样式用 `.dcc-*` 前缀。
- 三个 DOM 注入函数，各带一个监听 `body` 的 `MutationObserver`（350–400ms 防抖）兜底宿主重渲染：
  - `installNewSessionRow()`：克隆宿主的「新会话」按钮成导航行，点击转发给原按钮。
  - `installNavToggle()`：导航下方插入展开/收起箭头，点击切换 `data-dcc-nav` 并写回偏好。
  - `installSettingsBackButton()`：设置面板左上角插入返回按钮，点击触发原关闭按钮。
- 设置页组件：`Section`（标题 + 说明 + 开关行）、`Switch`、`Row`、`SectionIcon`。

## 开发

```bash
node --check client.js
node --check index.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
```

修改 `client.js` 后需要重新安装插件并刷新页面，新代码才会被加载：

```text
plugin_manager remove_bundle  target=dsh-ui-alt
plugin_manager install_bundle target=<本仓库绝对路径>
```

## 依赖的宿主实现

下面这些宿主细节升级后可能失效，失效时表现为对应的那一条样式不再生效，不会报错：

- CSS module 类名后缀：`_sessionRow`、`_projectRow`、`_title`、`_dialog_`、`_menu_`、`_navCell`、`_navTitle`、`_close`、`_optionRow` 等。
- 设置面板 DOM：`_overlay` / `_panel` / `_navTitle` / `_navList` / `_navCell` / `_header` / `_close`。
- Windows 变量：`--dsh-windows-titlebar-height`、`--dsh-windows-content-radius`。
- 主题 token：`--dsw-alias-*`、`--dsw-radius-*`、`--dsw-corner-shape`。
- 第三方兼容：仅当安装了 `@michengai/dsh-archive-manager` 时，`dsham_starSlot` / `dsham_rowStar` 规则才命中，用于圆点与收藏星标的避让。

## 已知限制

- 克隆出来的新会话行没有原按钮的 Tooltip 与快捷键提示（点击行为已转发，功能正常）。
- 设置返回按钮依赖宿主的 `_navTitle` / `_close` 类名。
- 「统一新会话按钮」关闭时，折叠导航的首位是隐藏的克隆行，计数偏移一项；显示效果正常。
- 滚动时鼠标划过会话行会触发宿主的 HoverCard 预览，可能造成卡顿；这是宿主行为，插件侧没有干预。

## License

[MIT](./LICENSE)
