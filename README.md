# dsh-ui-alt

基于原版 UI 进行紧凑化、减小圆角、秩序化、整洁化改进，让界面更专业、冷静、易读。同时把「新会话」「导航折叠」这些常用控件收进更顺手的位置。

插件由 CSS 覆盖加少量 DOM 注入组成，所有改动都可以在 设置 →「UI 改进」里逐项开关；关掉开关即恢复原版外观。

## 功能

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| Windows 默认字体微软雅黑 | 开 | 设置里未指定正文字体时，Windows 用微软雅黑；已指定则用户的字体优先，macOS 不受影响 |
| 紧凑圆角与密度 | 开 | 缩小全局圆角阶梯、收紧间距、减弱阴影，发送按钮与输入框的「+」都由圆形改为小圆角方形 |
| 统一新会话按钮 | 开 | 「新会话」变成导航行的一员，只保留半透明高亮；折叠窄栏时仍用原按钮 |
| 折叠侧栏导航 | 开 | 只显示前两项导航，点列表下方的箭头展开/收起，状态会记住 |
| 弱化工作区名称 | 开 | 工作区名称用更弱的文字色，「展开其余 N 个会话」进一步淡化 |
| 隐藏左上角 Logo | 关 | 隐藏侧栏顶部的品牌标记，下方内容自动补位 |
| 工作区标题与会话小一号 | 开 | 标题 13px、会话行 30px、项目行 32px，左下账户区一并压矮 |
| 会话前圆点 | 开 | 会话行前显示一个淡化的 4px 小圆点；与收藏星标同位置时自动让位 |
| 设置面板全屏 | 开 | 设置面板铺满窗口、隐藏右上角关闭按钮，改用左上角返回箭头；关闭后恢复为居中对话框 |
| 移除工作区与会话悬停提示 | 开 | 打开后工作区行、会话行都不再弹出悬停提示卡片，侧栏滚动更顺 |

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
| `data-dcc-ws` | `on` / `off` |
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
