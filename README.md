# dsh-ui-alt

在保持原版 UI 大体布局不变的情况下，进行减小圆角、紧凑化、整洁化、高效化改进，使 UI 视觉更加冷静、专业、高效。同时添加余额显示。大部分改动可在设置中单独开关。

插件由 CSS 覆盖加少量 DOM 注入组成，大部分改动都可以在 设置 →「UI 改进」里逐项开关；关掉开关即恢复原版外观。

## 功能

**总开关**

| 操作 | 说明 |
| --- | --- |
| 总开关 | 关闭后将禁用全部修改，包括始终启用的部分界面修复功能；打开和关闭会重载前端界面，不影响正在运行的任务 |
| 重载前端界面 | 调整本插件设置后建议执行一次。使用了其他修改前端界面类的插件也可以在此处重载。只影响前端，不影响正在运行的任务 |

**外观**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| Windows 默认微软雅黑字体 | 关 | 将 Windows 端默认字体改为微软雅黑。微软雅黑带有 hinting，使文字在显示设置低于 200% 缩放比例下，更加锐利清晰。若手动设置了字体，或使用 macOS 端，则不受影响 |
| 降低深色模式文字亮度 | 开 | 略微降低深色模式文字亮度，避免纯白文字过于刺眼 |
| 为菜单和窗口添加动画 | 开 | 为菜单添加更流畅的出现和消失动画。部分菜单由于底层限制无法添加消失动画 |
| 禁用菜单模糊效果 | 开 | 禁用原版菜单聊胜于无的模糊效果，增加流畅度和整体感 |
| 设置面板全屏 | 开 | 使用非窗口化的设置页面 |

**导航和工作区**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| 隐藏左上角 Logo | 关 | 隐藏侧栏顶部的 Logo |
| 统一新会话按钮样式 | 开 | 新会话按钮样式改为与导航按钮一致 |
| 导航折叠 | 开 | 导航下方显示折叠箭头，可展开和收起 |
| 弱化工作区名称 | 开 | 工作区名称弱化，使工作区和会话更易区分 |
| 会话前圆点 | 关 | 会话前显示一个圆点 |
| 移除工作区与会话悬停提示 | 开 | 悬停在侧栏工作区、会话上时不再显示详情卡片。实现上会丢弃宿主为卡片排的延迟调用，避免悬停后仍在后台取数导致滚动卡顿 |
| 隐藏会话悬停多余按钮 | 开 | 悬停会话行时只保留菜单和置顶，其余按钮（含插件添加的）隐藏；若有插件按钮未在右键菜单中，可关闭 |

**会话标题栏**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| 减小圆角与间距 | 开 | 缩小全局圆角、缩小侧栏部分字号、收紧间距，使界面更高效 |
| 会话标题栏紧凑化 | 开 | 紧凑化会话标题栏，将视图切换标签移到工具按钮处，使会话内容可视范围更大 |

**性能与用量信息**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| 优化布局 | 开 | 优化输入框下方性能与用量布局，将数据分布在左右两侧平衡视觉重心 |
| 显示余额 | 开 | 在输入框下方性能与用量中显示账户余额 |
| 余额警告阈值 | 3 | 余额低于此值将变为红色，最小为 0 |
| 余额小数位数 | 2 | 余额显示的小数位数 |

**规范化**

| 开关 | 默认 | 效果 |
| --- | --- | --- |
| 指针样式规范化 | 开 | 遵循桌面软件的指针样式规范，仅链接等跳转性元素会更改指针样式为「手形」 |
| 文本可选中限制 | 开 | 遵循桌面软件的规范，使 UI 界面元素的文本不可被选中；消息正文、会话标题与输入框仍可选中 |

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
| `data-dcc-enabled` | `on` / `off` |
| `data-dcc-radius` | `on` / `off` |
| `data-dcc-new` | `on` / `off` |
| `data-dcc-collapse` | `on` / `off` |
| `data-dcc-nav` | `collapsed` / `expanded` |
| `data-dcc-dim` | `on` / `off` |
| `data-dcc-logo` | `hidden` / `shown` |
| `data-dcc-dot` | `on` / `off` |
| `data-dcc-font` | `on` / `off` |
| `data-dcc-text-dim` | `on` / `off` |
| `data-dcc-transition` | `on` / `off` |
| `data-dcc-menu-blur` | `on` / `off` |
| `data-dcc-full` | `on` / `off` |
| `data-dcc-hover` | `on` / `off` |
| `data-dcc-row-buttons` | `on` / `off` |
| `data-dcc-compact-header` | `on` / `off` |
| `data-dcc-stats` | `on` / `off` |
| `data-dcc-balance` | `on` / `off` |
| `data-dcc-pointer` | `on` / `off` |
| `data-dcc-select` | `on` / `off` |

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

- 克隆出来的新会话行没有原按钮的 Tooltip 与快捷键提示（点击行为已转发）。
- 设置返回按钮依赖宿主的 `_navTitle` / `_close` 类名。
- 侧栏悬停卡片是预渲染的常驻节点，悬停后宿主会排一个延迟调用去取数。插件在事件层抢不到它的注册顺序，改为在悬停进入后的极短窗口内丢弃该延迟调用；其余定时器全部放行。
- 余额取自宿主账户接口，未登录或接口不可用时该项不显示；余额每分钟刷新一次。
- 余额警告阈值只接受非负数值，负数或非法输入会被归零。
- 余额用伪元素渲染（这样余额刷新时不会闪），因此图标只能用 `background-image` 贴上去、颜色写死为中灰；低于阈值时也是整段变红，做不到只染数字。
- 「指针样式规范化」会把拖拽、缩放手柄的 `grab` / `resize` 光标一并压成箭头（拖拽功能本身不受影响）。
- 「文本可选中限制」依赖宿主的 `_action` / `_time` 等类名片段来排除操作栏；宿主若改名，可能需要补充排除项。

## License

[MIT](./LICENSE)
