window.__ModuleLoader__.load({
  id: 'dsh-ui-alt',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const STORAGE_KEY = 'dsh-ui-alt:prefs:v1';
    /* 发版时与 package.json 的 version 一起改：设置页底部会显示这两个值 */
    const VERSION = '0.2.10';
    const UPDATED = '2026-11-09';
    const DEFAULTS = {
      radiusDensity: true,
      invertNewSession: true,
      collapseNav: true,
      dimSessions: true,
      hideLogo: false,
      workspaceSmall: true,
      winFont: true,
      sessionDot: true,
      settingsFullscreen: true,
      hideHoverCard: true,
    };

    const isZh = () => {
      const lang = (document.documentElement.getAttribute('lang') || navigator.language || '').toLowerCase();
      return lang.startsWith('zh');
    };

    function readPrefs() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw === null ? { ...DEFAULTS } : { ...DEFAULTS, ...JSON.parse(raw) };
      } catch {
        return { ...DEFAULTS };
      }
    }

    function applyPrefs(prefs) {
      const root = document.documentElement;
      root.dataset.dccRadius = prefs.radiusDensity ? 'on' : 'off';
      root.dataset.dccNew = prefs.invertNewSession ? 'on' : 'off';
      root.dataset.dccNav = prefs.collapseNav ? 'collapsed' : 'expanded';
      root.dataset.dccDim = prefs.dimSessions ? 'on' : 'off';
      root.dataset.dccLogo = prefs.hideLogo ? 'hidden' : 'shown';
      root.dataset.dccWs = prefs.workspaceSmall ? 'on' : 'off';
      root.dataset.dccDot = prefs.sessionDot ? 'on' : 'off';
      root.dataset.dccFont = prefs.winFont ? 'on' : 'off';
      root.dataset.dccFull = prefs.settingsFullscreen ? 'on' : 'off';
      root.dataset.dccHover = prefs.hideHoverCard ? 'off' : 'on';
    }

    function savePrefs(prefs) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        /* 存储不可用时只影响下次启动的持久化 */
      }
      applyPrefs(prefs);
    }

    const css = `
/* ============================================================
   dsh-ui-alt
   圆角收紧 + 紧凑 + 冷静，以及侧栏/新会话等针对性调整。
   所有效果由 html[data-dcc-*] 开关控制，设置页可逐项切换。
   ============================================================ */

/* ---------- Windows 默认正文字体 ---------- */
/* 只对 Windows 生效：宿主把 platform 写在 <html data-platform>，macOS 是 darwin。
   宿主把用户设置的字体写在这里同一个变量上，但写在 body 的内联样式里，
   内联优先级更高，所以下面故意不加 !important：
     - 设置里没填字体 → 本规则生效，Windows 用微软雅黑；
     - 设置里填了字体 → body 内联值赢，用户的字体原样生效。 */
html[data-dcc-font="on"][data-platform="win32"] body,
html[data-dcc-font="on"][data-platform="windows"] body,
html[data-dcc-font="on"][data-windows-titlebar] body {
  --dsh-font-family-text: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Noto Sans SC", system-ui, sans-serif;
}

/* ---------- 设置页（始终可用） ---------- */
.dcc-page { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 760px; }
.dcc-title { margin: 0; padding: 0 2px; font-size: 16px; line-height: 24px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dcc-intro { margin: 0; padding: 0 2px; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }
.dcc-meta { margin: 0; padding: 2px 2px 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.dcc-group { display: flex; flex-direction: column; padding: 6px 20px; border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-lg); background: var(--dsw-alias-bg-layer-1); }
.dcc-group-title { padding: 14px 2px 4px; font-size: 13px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dcc-row { display: flex; align-items: center; gap: 16px; padding: 14px 2px; border-top: 1px solid var(--dsw-alias-border-l1); }
.dcc-group-title + .dcc-row { border-top: none; }
.dcc-row-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.dcc-row-title { font-size: 14px; line-height: 20px; color: var(--dsw-alias-label-primary); }
.dcc-row-desc { font-size: 12px; line-height: 17px; color: var(--dsw-alias-label-secondary); }
.dcc-switch { position: relative; display: inline-flex; width: 36px; height: 20px; flex: none; cursor: pointer; }
.dcc-input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
.dcc-track { position: absolute; inset: 0; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); transition: background .15s, border-color .15s; }
.dcc-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--dsw-alias-label-secondary); transition: transform .15s, background .15s; }
.dcc-input:checked + .dcc-track { border-color: transparent; background: var(--dsw-alias-label-primary); }
.dcc-input:checked + .dcc-track .dcc-thumb { transform: translateX(16px); background: var(--dsw-alias-label-primary-foreground); }
.dcc-input:focus-visible + .dcc-track { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }

/* ---------- 圆角与密度 ---------- */
html[data-dcc-radius="on"] {
  --dsw-radius-xs: 2px !important;
  --dsw-radius-sm: 4px !important;
  --dsw-radius-md: 6px !important;
  --dsw-radius-lg: 8px !important;
  --dsw-radius-xl: 10px !important;
  --dsw-radius-panel: 12px !important;
  --dsw-corner-shape: round !important;
}
html[data-dcc-radius="on"] [class$="_dialog"],
html[data-dcc-radius="on"] [class$="_menu"],
html[data-dcc-radius="on"] [class$="_card"],
html[data-dcc-radius="on"] [class$="_panel"],
html[data-dcc-radius="on"] [class$="_popover"],
html[data-dcc-radius="on"] [class$="_modal"],
/* 内置组件的 CSS module 类名是 _dialog_hash_n 这种三段式，上面按后缀匹配不到 */
html[data-dcc-radius="on"] [class*="_dialog_"],
html[data-dcc-radius="on"] [class*="_menu_"],
html[data-dcc-radius="on"] [class*="_modal_"],
html[data-dcc-radius="on"] [class*="_popover_"] {
  border-radius: var(--dsw-radius-lg) !important;
}
html[data-dcc-radius="on"][data-windows-titlebar] [class*="_frame"] {
  --dsh-windows-content-radius: 6px !important;
}
/* 选择题：选中项的序号用高亮反色（和勾选框一致） */
html [class*="_optionRow"][class*="_optionSelected"] [class*="_number"] {
  background-color: var(--dsw-alias-label-primary) !important;
  color: var(--dsw-alias-label-primary-foreground) !important;
  font-weight: 600 !important;
}
/* 悬停选项时序号数字更明显，但序号底色不变（选中项由上面的反色规则接管） */
html [class*="_optionRow"]:not([class*="_optionSelected"]):hover [class*="_number"] {
  color: var(--dsw-alias-label-primary) !important;
}

/* 发送按钮：圆形改为小圆角方形（与其它按钮一致），整体略小一点、留白更紧 */
html[data-dcc-radius="on"] [class*="_trailing"] > [class*="_primary"] {
  border-radius: var(--dsw-radius-md) !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
}
html[data-dcc-radius="on"] [class*="_trailing"] > [class*="_primary"] svg {
  width: 16px !important;
  height: 16px !important;
}
/* 输入框左下角的「+」：宿主是 999px 圆形，同样收成小圆角方形 */
html[data-dcc-radius="on"] button[class*="_add"] {
  border-radius: var(--dsw-radius-md) !important;
}

/* 主内容区左上角的大圆角（Windows 标题栏） */
html[data-dcc-radius="on"][data-windows-titlebar] [class*="_centerCol"] {
  border-radius: 6px 0 0 0 !important;
}
html[data-dcc-radius="on"] [class*="_composerStack"] { --dsh-composer-stack-gap: 4px !important; }
html[data-dcc-radius="on"] [class*="_panelRow"] { --dsh-sidebar-row-padding: 10px !important; }
html[data-dcc-radius="on"] body {
  --dsh-scrollbar-width: 4px !important;
  --dsw-shadow-lv1: 0 1px 2px rgba(0, 0, 0, .04) !important;
  --dsw-shadow-lv2: 0 2px 6px rgba(0, 0, 0, .05) !important;
  --dsw-shadow-lv3: 0 8px 24px rgba(0, 0, 0, .10) !important;
}
html[data-dcc-radius="on"] body,
html[data-dcc-radius="on"] body * {
  --dsw-elevation-panel: var(--dsw-elevation-stroke), 0 2px 6px rgba(0, 0, 0, .04) !important;
}

/* ---------- 新会话按钮：作为导航行的一员，仅颜色不同 ---------- */
/* 原按钮在展开态隐藏（折叠窄栏时仍用它），由克隆行替代 */
html[data-dcc-new="on"] button[data-dcc-original] {
  display: none !important;
}
html[data-dcc-new="on"]:has([data-sidebar-collapsed="true"]) button[data-dcc-original] {
  display: flex !important;
}
html[data-dcc-new="on"]:has([data-sidebar-collapsed="true"]) button[data-dcc-newrow] {
  display: none !important;
}
html[data-dcc-new="off"] button[data-dcc-newrow] {
  display: none !important;
}
/* 克隆行直接使用 panelRow 的类，宽度/内边距/行高/焦点环全部来自宿主；
   常规底色比其它按钮的 hover 色再弱一档，悬停时恢复成 hover 色 */
html[data-dcc-new="on"] button[data-dcc-newrow] {
  background-color: color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 88%, transparent) !important;
  color: var(--dsw-alias-label-primary) !important;
}
html[data-dcc-new="on"] button[data-dcc-newrow]:hover {
  background-color: var(--dsw-alias-interactive-bg-hover) !important;
  box-shadow: inset 0 0 0 999px rgba(127, 127, 127, .1) !important;
}
.dcc-newrow-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: calc(var(--dsh-sidebar-label-gap) + 2px);
  flex: 1;
  min-width: 0;
}
.dcc-newrow-content svg {
  width: 16px;
  height: 16px;
  flex: none;
  color: inherit;
}
.dcc-newrow-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: inherit;
  color: inherit;
}
/* 显示 logo 时，给导航区留出与上方接近的下边距 */
html[data-dcc-logo="shown"] nav[class*="_panelList"] {
  margin-top: 6px;
}

/* 导航行之间的间距统一收紧 */
html[data-dcc-nav] nav[class*="_panelList"] {
  gap: 2px !important;
  margin-bottom: 2px !important;
}
/* 清掉导航子项（包括「更多」等控件）自带的上下外边距 */
html[data-dcc-nav] nav[class*="_panelList"] > * + * {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
/* 折叠箭头自己就有上下内边距，紧随其后的分组标题不再额外留白 */
html[data-dcc-nav] [class*="_sectionHeader"] {
  margin-top: 0 !important;
}

/* ---------- 侧栏导航：默认只留前两项；悬停时工作区平移、其余按钮只做渐显 ---------- */
/* 导航行左右内边距与图标/文字间距稍微放宽（折叠窄栏由宿主规则覆盖） */
html[data-dcc-nav]:not(:has([data-sidebar-collapsed="true"])) nav[class*="_panelList"] [class*="_panelRow"] {
  padding-left: calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset) + 3px);
  padding-right: calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset) + 3px);
  gap: calc(var(--dsh-sidebar-label-gap) + 2px);
}
/* 收起态：只保留前两项。用 max-height 过渡让列表能平滑展开/收起；
   折叠高度与展开高度都由脚本按实测行高写进 CSS 变量，过渡速度才是均匀的。 */
html[data-dcc-nav] nav[class*="_panelList"] {
  overflow: hidden;
  transition: max-height .15s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
html[data-dcc-nav="collapsed"] nav[class*="_panelList"] {
  max-height: var(--dcc-nav-collapsed-height, 70px);
}
html[data-dcc-nav="expanded"] nav[class*="_panelList"] {
  max-height: var(--dcc-nav-expanded-height, 1200px);
}

/* 导航底部的展开/收起箭头 */
/* 整行都能点（点击区不变），但高亮只画在图标那一小块上：背景交给中心伪元素，
   按钮本身保持透明，所以整行悬停时也只有中间那个矩形亮起来。 */
.dcc-nav-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 8px);
  margin: 0 4px;
  padding: 2px 0;
  border: 0;
  border-radius: var(--dsw-radius-md, 6px);
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  transition: color .15s;
}
.dcc-nav-toggle::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 26px;
  height: 20px;
  margin: -10px 0 0 -13px;
  border-radius: var(--dsw-radius-md, 6px);
  background: transparent;
  transition: background-color .15s;
  pointer-events: none;
}
.dcc-nav-toggle:hover {
  background: transparent;
  color: var(--dsw-alias-label-secondary);
}
.dcc-nav-toggle:hover::before {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dcc-nav-toggle svg {
  display: block;
  width: 14px;
  height: 14px;
  /* 与宿主工作区折叠箭头同一套曲线：.15s + var(--ds-ease-in-out) */
  transition: transform .15s var(--ds-ease-in-out);
}
html[data-dcc-nav="collapsed"] .dcc-nav-toggle svg {
  transform: rotate(180deg);
}

/* ---------- 工作区名称更明显，「展开其余」更淡 ---------- */
html[data-dcc-dim="on"] [class*="_projectRow"] [class*="_title"] {
  color: var(--dsw-alias-label-primary) !important;
  opacity: .7 !important;
}
html[data-dcc-dim="on"] [class*="_projectRow"]:hover [class*="_title"] {
  opacity: 1 !important;
}
/* 会话行前面的弱化小圆点（状态点为空/不可见时露出） */
html[data-dcc-dot="on"] [class*="_sessionRow"] {
  position: relative;
}
html[data-dcc-dot="on"] [class*="_sessionRow"]::before {
  content: "";
  position: absolute;
  left: calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset) + var(--dsh-workspace-indent, 0px) + 8px - 2px);
  top: 50%;
  width: 4px;
  height: 4px;
  margin-top: -2px;
  border-radius: 50%;
  background: var(--dsw-alias-label-tertiary);
  opacity: .35;
  pointer-events: none;
}
/* 与 archive-manager 的收藏星标共存：星标占用的正是同一个 16px 前导位置。
   星标在行悬停时总会出现（未收藏是空心、可点），已收藏则常驻，
   两种情况下都不再画自身的小圆点，避免与星标叠在一起。 */
html[data-dcc-dot="on"] [class*="_sessionRow"]:hover:has(.dsham_starSlot)::before,
html[data-dcc-dot="on"] [class*="_sessionRow"]:has(.dsham_starSlot[data-favorited="true"])::before {
  display: none;
}
/* 未收藏时的空心星（悬停才出现）：压到与会话标题同色，不再用偏亮的 label-primary。
   已收藏的实心金星保持 archive-manager 原色，不做处理。 */
html [class*="_sessionRow"] .dsham_starSlot:not([data-favorited="true"]) .dsham_rowStar {
  color: var(--dsw-alias-label-secondary) !important;
}
/* 「展开其余 N 个会话 / 收起」比工作区标题更淡 */
html[data-dcc-dim="on"] [class*="_sessionOverflowButton"] {
  color: var(--dsw-alias-label-tertiary) !important;
  opacity: .6 !important;
}
html[data-dcc-dim="on"] [class*="_sessionOverflowButton"]:hover {
  opacity: .9 !important;
}

/* ---------- 工作区行：悬停时不换成展开箭头，保持文件夹图标 ---------- */
/* 宿主默认：hover 时 .chevron 显示、.folder 隐藏（Rows.module.css）。这里反着压回去。 */
html [class*="_projectRow"]:hover [class*="_folder"] {
  display: inline-flex !important;
}
html [class*="_projectRow"]:hover [class*="_chevron"] {
  display: none !important;
}

/* ---------- 工作区：标题与会话都小一号，并同步收一点行高 ---------- */
/* 「工作区」分组标题：更小、更弱，并与下方项目行左对齐 */
html[data-dcc-ws="on"] [class*="_sectionHeader"] {
  height: 30px !important;
  margin-bottom: 2px !important;
}
html[data-dcc-ws="on"] [class*="_sectionHeader"] [class*="_sectionLabel"]:not([class*="_sectionLabelHidden"]) {
  font-size: 13px;
  left: -2px;
  opacity: .72;
  color: var(--dsw-alias-label-tertiary);
}
html[data-dcc-ws="on"] [class*="_projectRow"] [class*="_title"],
html[data-dcc-ws="on"] [class*="_sessionRow"] [class*="_title"] {
  font-size: 13px !important;
  line-height: 18px !important;
}
html[data-dcc-ws="on"] [class*="_projectRow"] {
  height: 32px !important;
}
html[data-dcc-ws="on"] [class*="_sessionRow"] {
  height: 30px !important;
}
/* 左下角账户区：整体压矮一点 */
html[data-dcc-ws="on"] [class*="_trigger"][data-signed-out="false"]:not([data-collapsed="true"]) {
  height: 38px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  gap: 6px !important;
  font-size: 13px !important;
}
html[data-dcc-ws="on"] [class*="_trigger"][data-signed-out="false"] [class*="_avatar"] {
  width: 22px !important;
  height: 22px !important;
}

/* ---------- 工作区 / 会话行的悬停提示卡片 ---------- */
/* 宿主把卡片挂在 body 下（_card / _preview / _bridge 三段），fixed + z-index:100。
   打开「移除悬停提示」后直接不渲染，滑动侧栏时不再闪出卡片，也不会因定位计算掉帧。 */
html[data-dcc-hover="off"] [class*="_card_bgejw"],
html[data-dcc-hover="off"] [class*="_preview_bgejw"],
html[data-dcc-hover="off"] [class*="_bridge_bgejw"] {
  display: none !important;
}

/* ---------- 已归档会话：标题画删除线 ---------- */
html [class*="_sessionRow"][class*="_archived"] [class*="_title"] {
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

/* ---------- 主题差异微调 ---------- */
/* 深色主题背景更亮，展开文字需要再弱一档（工作区名称保持明显） */
html[data-dcc-dim="on"] body[data-ds-dark-theme] [class*="_sessionOverflowButton"] {
  color: var(--dsw-alias-label-tertiary) !important;
  opacity: .5 !important;
}
html[data-dcc-dot="on"] body[data-ds-dark-theme] [class*="_sessionRow"]::before {
  opacity: .28;
}
/* 浅色主题下导航 hover 与新会话常规底色略微加强 */
body:not([data-ds-dark-theme]) nav[class*="_panelList"] [class*="_panelRow"]:hover {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .035) !important;
}
html[data-dcc-new="on"] body:not([data-ds-dark-theme]) button[data-dcc-newrow] {
  background-color: color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 82%, rgba(0, 0, 0, .05)) !important;
}
/* 浅色主题下选中会话的背景再强一点 */
body:not([data-ds-dark-theme]) [class*="_sessionRow"][class*="_selected"] {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .04) !important;
}

/* 导航行的悬停 / 选中：比新会话默认底更明显 */
html[data-dcc-new="on"] nav[class*="_panelList"] [class*="_panelRow"]:hover:not([data-dcc-newrow]),
html[data-dcc-new="on"] nav[class*="_panelList"] [class*="_panelRow"][class*="_panelActive"]:not([data-dcc-newrow]) {
  background-color: var(--dsw-alias-interactive-bg-hover) !important;
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .07) !important;
}
html[data-dcc-new="on"] body[data-ds-dark-theme] nav[class*="_panelList"] [class*="_panelRow"]:hover:not([data-dcc-newrow]),
html[data-dcc-new="on"] body[data-ds-dark-theme] nav[class*="_panelList"] [class*="_panelRow"][class*="_panelActive"]:not([data-dcc-newrow]) {
  background-color: var(--dsw-alias-interactive-bg-hover) !important;
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, .1) !important;
}

/* ---------- 设置面板：全屏（避开 Electron 标题栏）+ 标题左侧返回按钮 ---------- */
html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"]) {
  top: var(--dsh-windows-titlebar-height, 0px) !important;
  align-items: stretch !important;
  justify-content: stretch !important;
}
html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"]) > [class*="_panel"] {
  width: 100% !important;
  max-width: none !important;
  height: 100% !important;
  max-height: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
/* 只在窗口足够宽时锁定两列布局，窄窗口沿用宿主自己的单列布局 */
@media (min-width: 720px) {
  html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"]) > [class*="_panel"] {
    grid-template-columns: 220px minmax(0, 1fr) !important;
  }
}
/* 全屏时不需要遮罩，去掉它会露出标题栏下方的一条描边 */
html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"]) [class*="_mask"] {
  display: none !important;
}
html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"]) [class*="_close"] {
  display: none !important;
}
html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"]) [class*="_navTitle"] {
  padding-left: 52px !important;
  /* 手型由脚本按文字实际矩形设置，见 installSettingsBackButton */
}
/* 设置导航项：略矮一点（与全屏与否无关，始终生效） */
html [class*="_overlay"]:has([class*="_navTitle"]) [class*="_navCell"] {
  position: relative;
  height: 38px !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}
.dcc-settings-back {
  position: absolute;
  top: 20px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: transparent;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  transition: background-color .15s;
}
.dcc-settings-back:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
/* 悬停「设置」标题时，左侧箭头一起高亮。
   标题盒子撑满整行，:hover 会连空白一起算，所以这里认脚本按文字矩形写的属性。 */
html[data-dcc-full="on"] [class*="_overlay"]:has([class*="_navTitle"][data-dcc-hot="on"]) .dcc-settings-back {
  background: var(--dsw-alias-interactive-bg-hover);
}
/* 非全屏时用宿主自己的关闭按钮，自绘的返回箭头不出现 */
html[data-dcc-full="off"] .dcc-settings-back {
  display: none !important;
}

/* ---------- 左上角品牌区 ---------- */
html[data-dcc-logo="hidden"] [class*="_brand"]:not([class*="_brandMark"]):not([class*="_brandName"]):not([class*="_brandIdentity"]),
html[data-dcc-logo="hidden"] [class*="_railMark"] {
  display: none !important;
}
/* 隐藏 logo 后整行收平，让下方内容补位 */
html[data-dcc-logo="hidden"] [class*="_logoRow"] {
  height: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
`;

    /**
     * 把「新会话」作为导航行的一员：在 nav 首位插入一个使用 panelRow 类名的
     * 克隆按钮（宽度/内边距/行高/焦点环全部由宿主样式决定），原按钮在展开态
     * 隐藏、折叠窄栏时仍然使用。返回清理函数。
     */
    function installNewSessionRow() {
      const findNav = () => document.querySelector('nav[class*="_panelList"]');
      const findOriginal = () => document.querySelector('button[class*="_newSession"]');
      let clone = null;
      let observer = null;
      let timer = null;
      let rafId = 0;

      const build = (nav, orig) => {
        const row = nav.querySelector('button[class*="_panelRow"]');
        if (row === null) return false;
        if (clone !== null) clone.remove();
        clone = document.createElement('button');
        clone.type = 'button';
        clone.setAttribute('data-dcc-newrow', '');
        clone.className = [...row.classList].filter((name) => !name.includes('_panelActive')).join(' ') + ' dcc-newrow';
        const aria = orig.getAttribute('aria-label');
        if (aria !== null) clone.setAttribute('aria-label', aria);
        const content = document.createElement('span');
        content.className = 'dcc-newrow-content';
        const icon = orig.querySelector('svg');
        if (icon !== null) content.appendChild(icon.cloneNode(true));
        const label = document.createElement('span');
        label.className = 'dcc-newrow-label';
        const text = orig.querySelector('[class*="_newSessionLabel"]');
        label.textContent = text !== null && text.textContent !== '' ? text.textContent : (isZh() ? '新会话' : 'New session');
        content.appendChild(label);
        clone.appendChild(content);
        clone.addEventListener('click', (event) => {
          event.preventDefault();
          const current = findOriginal();
          if (current !== null) current.click();
        });
        nav.insertBefore(clone, nav.firstElementChild);
        return true;
      };

      const ensure = () => {
        const nav = findNav();
        const orig = findOriginal();
        if (nav === null || orig === null) return false;
        if (orig.getAttribute('data-dcc-original') === null) orig.setAttribute('data-dcc-original', '');
        if (clone === null || !clone.isConnected) return build(nav, orig);
        if (!nav.contains(clone)) nav.insertBefore(clone, nav.firstElementChild);
        /* 宿主文字（语言切换等）变化时，克隆行跟着更新 */
        const label = clone.querySelector('.dcc-newrow-label');
        const text = orig.querySelector('[class*="_newSessionLabel"]');
        if (label !== null && text !== null && text.textContent !== '' && label.textContent !== text.textContent) {
          label.textContent = text.textContent;
        }
        const aria = orig.getAttribute('aria-label');
        if (aria !== null && clone.getAttribute('aria-label') !== aria) clone.setAttribute('aria-label', aria);
        return true;
      };

      const schedule = () => {
        if (timer !== null) return;
        timer = window.setTimeout(() => {
          timer = null;
          ensure();
        }, 400);
      };

      const start = () => {
        if (ensure()) return;
        let tries = 0;
        const tick = () => {
          rafId = 0;
          if (ensure() || tries++ > 60) return;
          rafId = window.requestAnimationFrame(tick);
        };
        rafId = window.requestAnimationFrame(tick);
      };

      start();
      observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        if (timer !== null) clearTimeout(timer);
        if (rafId !== 0) window.cancelAnimationFrame(rafId);
        if (clone !== null) clone.remove();
        const orig = findOriginal();
        if (orig !== null) orig.removeAttribute('data-dcc-original');
      };
    }

    /**
     * 导航底部的展开/收起箭头。
     * 点击切换 html[data-dcc-nav]，并写回偏好，让下一次启动保持同样的折叠状态。
     * 导航项超过两项时箭头可见。
     */
    function installNavToggle() {
      const findNav = () => document.querySelector('nav[class*="_panelList"]');
      let btn = null;
      let observer = null;
      let timer = null;

      const sync = () => {
        if (btn === null) return;
        const nav = findNav();
        const count = nav === null ? 0 : nav.children.length;
        btn.style.display = count > 2 ? '' : 'none';
        /* 折叠高度 = 前两项实测高度 + 一项行距；展开高度 = 全部实测高度。
           写进变量后，max-height 的过渡是匀速的，不会「弹一下再停」。 */
        if (nav !== null) {
          const items = Array.from(nav.children);
          const gap = parseFloat(window.getComputedStyle(nav).rowGap) || 0;
          let collapsedHeight = 0;
          let full = 0;
          for (let i = 0; i < items.length; i += 1) {
            const h = items[i].getBoundingClientRect().height;
            full += h;
            if (i < 2) collapsedHeight += h;
          }
          full += Math.max(0, items.length - 1) * gap;
          if (items.length > 1) collapsedHeight += gap;
          nav.style.setProperty('--dcc-nav-collapsed-height', `${Math.ceil(collapsedHeight)}px`);
          nav.style.setProperty('--dcc-nav-expanded-height', `${Math.ceil(full)}px`);
        }
        const collapsed = document.documentElement.dataset.dccNav === 'collapsed';
        const label = collapsed ? (isZh() ? '展开导航' : 'Expand navigation') : (isZh() ? '收起导航' : 'Collapse navigation');
        btn.setAttribute('aria-label', label);
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        btn.title = label;
      };

      const build = (nav) => {
        if (btn !== null) btn.remove();
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dcc-nav-toggle';
        btn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true">'
          + '<path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6"'
          + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.addEventListener('click', () => {
          const root = document.documentElement;
          const next = root.dataset.dccNav === 'collapsed' ? 'expanded' : 'collapsed';
          root.dataset.dccNav = next;
          const nextPrefs = readPrefs();
          nextPrefs.collapseNav = next === 'collapsed';
          savePrefs(nextPrefs);
          sync();
        });
        nav.parentElement.insertBefore(btn, nav.nextSibling);
        sync();
      };

      const ensure = () => {
        const nav = findNav();
        if (nav === null || nav.parentElement === null) return;
        if (btn !== null && btn.isConnected && btn.previousElementSibling === nav) {
          sync();
          return;
        }
        build(nav);
      };

      const schedule = () => {
        if (timer !== null) return;
        timer = window.setTimeout(() => {
          timer = null;
          ensure();
        }, 400);
      };

      ensure();
      observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        if (timer !== null) clearTimeout(timer);
        if (btn !== null) btn.remove();
      };
    }

    /**
     * 设置面板左上角的返回按钮：点击触发原关闭按钮，保留原关闭逻辑。
     * 面板挂载时走 requestAnimationFrame 在下一帧补上，不让按钮比面板慢一拍；
     * 其它 DOM 变动仍用 350ms 兜底，避免流式输出时每帧都做全局查询。
     */
    function installSettingsBackButton() {
      let btn = null;
      let observer = null;
      let timer = null;
      let rafId = 0;

      const findPanel = () => {
        const title = document.querySelector('[class*="_navTitle"]');
        return title === null ? null : title.parentElement;
      };

      const closePanel = (panel) => {
        const close = panel.querySelector('[class*="_header"] [class*="_close"]');
        if (close !== null) close.click();
      };

      const ensure = () => {
        const panel = findPanel();
        if (panel === null) {
          if (btn !== null) btn.remove();
          btn = null;
          return;
        }
        if (btn !== null && btn.isConnected && btn.parentElement === panel) return;
        if (btn !== null) btn.remove();
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dcc-settings-back';
        btn.setAttribute('aria-label', isZh() ? '返回' : 'Back');
        btn.title = isZh() ? '返回' : 'Back';
        btn.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">'
          + '<path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6"'
          + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.addEventListener('click', () => closePanel(panel));
        panel.appendChild(btn);
      };

      const insertSoon = () => {
        if (rafId !== 0) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          ensure();
          /* 万一这一帧面板还没挂完，退回原来的兜底节奏 */
          if (btn === null && timer === null) {
            timer = window.setTimeout(() => {
              timer = null;
              ensure();
            }, 350);
          }
        });
      };

      const schedule = (records) => {
        /* 面板是「新增了包含 _navTitle 的节点」，这类变动要求下一帧就有按钮 */
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1) continue;
            if (node.matches('[class*="_navTitle"]') || node.querySelector('[class*="_navTitle"]') !== null) {
              insertSoon();
              return;
            }
          }
        }
        if (timer !== null) return;
        timer = window.setTimeout(() => {
          timer = null;
          ensure();
        }, 350);
      };

      /* 标题元素被撑满整行，空白处也在它盒子里；只有落在文字实际矩形上才算点击。
         左侧再放宽一点，把标题与返回箭头之间那段 padding 空隙也算进来。 */
      const LABEL_LEFT_SLACK = 14;
      const hitsLabel = (title, event) => {
        const range = document.createRange();
        range.selectNodeContents(title);
        const rects = range.getClientRects();
        for (let i = 0; i < rects.length; i += 1) {
          const rect = rects[i];
          if (event.clientX >= rect.left - LABEL_LEFT_SLACK && event.clientX <= rect.right
            && event.clientY >= rect.top && event.clientY <= rect.bottom) return true;
        }
        return false;
      };

      /* 点面板标题（「设置」这几个字）也能返回；用委托，面板重渲染不会丢监听 */
      const onClick = (event) => {
        if (document.documentElement.dataset.dccFull !== 'on') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const title = target.closest('[class*="_navTitle"]');
        if (title === null || title.parentElement === null) return;
        if (!hitsLabel(title, event)) return;
        closePanel(title.parentElement);
      };

      /* 手型和高亮都只跟着文字走：整行都是标题的盒子，空白不该有可点反馈 */
      let cursorTitle = null;
      const clearHot = () => {
        if (cursorTitle === null) return;
        cursorTitle.style.cursor = '';
        cursorTitle.dataset.dccHot = 'off';
        cursorTitle = null;
      };
      const onMove = (event) => {
        if (document.documentElement.dataset.dccFull !== 'on') {
          clearHot();
          return;
        }
        const target = event.target;
        const title = target instanceof Element ? target.closest('[class*="_navTitle"]') : null;
        if (title === null) {
          clearHot();
          return;
        }
        const hot = hitsLabel(title, event);
        const want = hot ? 'pointer' : '';
        if (title.style.cursor !== want) title.style.cursor = want;
        const wantHot = hot ? 'on' : 'off';
        if (title.dataset.dccHot !== wantHot) title.dataset.dccHot = wantHot;
        cursorTitle = title;
      };

      ensure();
      observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });
      document.addEventListener('click', onClick, true);
      document.addEventListener('mousemove', onMove, true);

      return () => {
        observer.disconnect();
        if (timer !== null) clearTimeout(timer);
        if (rafId !== 0) window.cancelAnimationFrame(rafId);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('mousemove', onMove, true);
        if (cursorTitle !== null) clearHot();
        if (btn !== null) btn.remove();
      };
    }

    function Switch(props) {
      return h('label', { className: 'dcc-switch' },
        h('input', {
          type: 'checkbox',
          className: 'dcc-input',
          checked: props.checked,
          onChange: (event) => props.onChange(event.target.checked),
          'aria-label': props.title,
        }),
        h('span', { className: 'dcc-track', 'aria-hidden': true },
          h('span', { className: 'dcc-thumb' })));
    }

    function Row(props) {
      return h('div', { className: 'dcc-row' },
        h('div', { className: 'dcc-row-text' },
          h('div', { className: 'dcc-row-title' }, props.title),
          props.desc ? h('div', { className: 'dcc-row-desc' }, props.desc) : null),
        h(Switch, { checked: props.checked, onChange: props.onChange, title: props.title }));
    }

    function Section() {
      const [prefs, setPrefs] = React.useState(readPrefs);
      const zh = isZh();
      const update = (key) => (value) => {
        setPrefs((current) => {
          const next = { ...current, [key]: value };
          savePrefs(next);
          return next;
        });
      };
      return h('div', { className: 'dcc-page' },
        h('div', { className: 'dcc-title' }, zh ? 'UI 改进' : 'UI improvements'),
        h('p', { className: 'dcc-intro' },
          zh ? '基于原版 UI 进行紧凑化、减小圆角、秩序化、整洁化改进。使 UI 更加专业、冷静、易读。每一项改动都可在下方单独开关。' : 'Tighter, smaller-radius, more orderly styling over the stock UI for a calmer, more professional and easier-to-read look. Every change can be switched on or off individually below.'),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '外观' : 'Appearance'),
          h(Row, {
            title: zh ? '紧凑圆角与密度' : 'Compact radius and density',
            desc: zh ? '缩小全局圆角、收紧间距并降低阴影。' : 'Shrink the global radius scale, tighten spacing and soften shadows.',
            checked: prefs.radiusDensity,
            onChange: update('radiusDensity'),
          }),
          h(Row, {
            title: zh ? 'Windows 默认字体微软雅黑' : 'Microsoft YaHei on Windows',
            desc: zh ? '仅当设置里没填正文字体时生效；填了字体则以你的设置为准。macOS 不受影响。' : 'Applies only when no body font is set in Settings; your own font still wins. macOS is unaffected.',
            checked: prefs.winFont,
            onChange: update('winFont'),
          })),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '布局' : 'Layout'),
          h(Row, {
            title: zh ? '隐藏左上角 Logo' : 'Hide corner logo',
            desc: zh ? '隐藏侧栏顶部的品牌标记。' : 'Hide the brand mark at the top of the sidebar.',
            checked: prefs.hideLogo,
            onChange: update('hideLogo'),
          }),
          h(Row, {
            title: zh ? '统一新会话按钮' : 'Unified new-session button',
            desc: zh ? '把新会话做成与导航行一致、只保留半透明高亮的按钮。' : 'Make the new-session row match the nav rows, with only a translucent highlight.',
            checked: prefs.invertNewSession,
            onChange: update('invertNewSession'),
          }),
          h(Row, {
            title: zh ? '折叠侧栏导航' : 'Collapse sidebar navigation',
            desc: zh ? '只显示前两个导航项，用导航下方的箭头展开或收起。' : 'Show the first two nav items; use the arrow below the list to expand or collapse.',
            checked: prefs.collapseNav,
            onChange: update('collapseNav'),
          }),
          h(Row, {
            title: zh ? '弱化工作区名称' : 'Dim workspace names',
            desc: zh ? '工作区名称用更弱的文字色，会话标题保持正常。' : 'Workspace names use a weaker text color; session titles stay normal.',
            checked: prefs.dimSessions,
            onChange: update('dimSessions'),
          }),
          h(Row, {
            title: zh ? '工作区标题与会话小一号' : 'Smaller workspace and sessions',
            desc: zh ? '侧栏工作区名称与会话标题使用更小的字号。' : 'Use a smaller font size for sidebar workspace names and session titles.',
            checked: prefs.workspaceSmall,
            onChange: update('workspaceSmall'),
          }),
          h(Row, {
            title: zh ? '会话前圆点' : 'Session leading dot',
            desc: zh ? '在会话行前显示一个淡化的小圆点。' : 'Show a faint dot before each session row.',
            checked: prefs.sessionDot,
            onChange: update('sessionDot'),
          }),
          h(Row, {
            title: zh ? '移除工作区与会话悬停提示' : 'Remove workspace and session hover hints',
            desc: zh ? '打开后鼠标划过工作区行、会话行都不再弹出悬停提示卡片，侧栏滚动也更顺。' : 'On by default: hovering a workspace or session row no longer pops up a hint card, which also keeps sidebar scrolling smooth.',
            checked: prefs.hideHoverCard,
            onChange: update('hideHoverCard'),
          }),
          h(Row, {
            title: zh ? '设置面板全屏' : 'Full-screen settings panel',
            desc: zh ? '设置面板铺满窗口，隐藏右上角关闭按钮，改用左上角返回箭头；关闭后恢复为居中对话框。' : 'Fill the window with the settings panel, replace its close button with a back arrow at the top left; off restores the centered dialog.',
            checked: prefs.settingsFullscreen,
            onChange: update('settingsFullscreen'),
          })),
        h('p', { className: 'dcc-meta' },
          zh ? `版本：${VERSION}  ${UPDATED}` : `Version: ${VERSION}  ${UPDATED}`));
    }

    function SectionIcon(props) {
      const size = props !== null && typeof props === 'object' && typeof props.size === 'number' ? props.size : 16;
      return h('svg', {
        width: size, height: size, viewBox: '0 0 64 64', fill: 'none', 'aria-hidden': true,
      },
      h('rect', { x: 6, y: 6, width: 52, height: 52, rx: 15, stroke: 'currentColor', strokeWidth: 4, strokeDasharray: '8 6' }),
      h('rect', { x: 16, y: 16, width: 32, height: 32, rx: 5, fill: 'currentColor' }));
    }

    return {
      name: 'dsh-ui-alt',
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          applyPrefs(readPrefs());
          let removeCss;
          if (typeof styles !== 'undefined' && styles !== null && typeof styles.insert === 'function') {
            removeCss = styles.insert(css);
          } else {
            const tag = document.createElement('style');
            tag.setAttribute('data-dsh-ui-alt', '');
            tag.textContent = css;
            document.head.appendChild(tag);
            removeCss = () => tag.remove();
          }
          const removeNewSessionRow = installNewSessionRow();
          const removeNavToggle = installNavToggle();
          const removeSettingsBack = installSettingsBackButton();
          return () => {
            removeCss();
            removeNewSessionRow();
            removeNavToggle();
            removeSettingsBack();
            const root = document.documentElement;
            delete root.dataset.dccRadius;
            delete root.dataset.dccNew;
            delete root.dataset.dccNav;
            delete root.dataset.dccDim;
            delete root.dataset.dccLogo;
            delete root.dataset.dccWs;
            delete root.dataset.dccDot;
            delete root.dataset.dccFont;
            delete root.dataset.dccFull;
            delete root.dataset.dccHover;
          };
        }, 'dsh-ui-alt: styles and preference attributes');

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'ui-alt',
          order: 90,
          label: () => (isZh() ? 'UI 改进' : 'UI improvements'),
        }, Section));

        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon',
          id: 'ui-alt',
          order: 90,
          label: () => 'UI improvements',
        }, SectionIcon));
      },
    };
  },
});
