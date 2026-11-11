window.__ModuleLoader__.load({
  id: 'dsh-ui-alt',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const STORAGE_KEY = 'dsh-ui-alt:prefs:v1';
    /* 发版时与 package.json 的 version 一起改：设置页底部会显示这两个值 */
    const VERSION = '0.2.55';
    const UPDATED = '2026-11-11';
    const DEFAULTS = {
      radiusDensity: true,
      invertNewSession: true,
      collapseNav: true,
      dimSessions: true,
      hideLogo: false,
      winFont: false,
      sessionDot: true,
      settingsFullscreen: true,
      hideHoverCard: true,
      hideRowButtons: true,
      compactHeader: true,
      optimizeStatsLayout: true,
      showBalance: true,
      balanceThreshold: 3,
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
      root.dataset.dccDot = prefs.sessionDot ? 'on' : 'off';
      root.dataset.dccFont = prefs.winFont ? 'on' : 'off';
      root.dataset.dccFull = prefs.settingsFullscreen ? 'on' : 'off';
      root.dataset.dccHover = prefs.hideHoverCard ? 'off' : 'on';
      root.dataset.dccRowButtons = prefs.hideRowButtons ? 'on' : 'off';
      root.dataset.dccCompactHeader = prefs.compactHeader ? 'on' : 'off';
      root.dataset.dccStats = prefs.optimizeStatsLayout ? 'on' : 'off';
      root.dataset.dccBalance = prefs.showBalance ? 'on' : 'off';
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
/* 宿主全站默认 corner-shape: superellipse(1.5)，999px 会被渲染成圆角矩形而不是胶囊。
   开关和滑块自己声明 round，形状不随「紧凑圆角与密度」开关变化。 */
.dcc-track { position: absolute; inset: 0; border-radius: 999px; corner-shape: round; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); transition: background .15s, border-color .15s; }
.dcc-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; corner-shape: round; background: var(--dsw-alias-label-secondary); transition: transform .15s, background .15s; }
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
/* 输入框左下角的「+」：宿主是 999px 圆形，同样收成小圆角方形；
   底色也去掉，只在悬停时给出来（宿主的原始底色就是这一档）。 */
html[data-dcc-radius="on"] button[class*="_add"] {
  border-radius: var(--dsw-radius-md) !important;
  background: transparent !important;
}
html[data-dcc-radius="on"] button[class*="_add"]:hover {
  background: var(--dsw-specific-selector) !important;
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
/* 宿主只在 _preview / _media 这两个浮层上单独定义了这个变量，压住它们本身即可。
   早先用 body * 给每个元素都写一遍，会把这套声明的失效范围放大到全文档，
   悬停/滚动时样式重算明显变慢，已收窄。 */
html[data-dcc-radius="on"] body,
html[data-dcc-radius="on"] [class*="_preview_"],
html[data-dcc-radius="on"] [class*="_media_"] {
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
   默认和其它导航行一样是透明底，悬停时统一由下面的导航行规则上色 */
html[data-dcc-new="on"] button[data-dcc-newrow] {
  background-color: transparent !important;
  color: var(--dsw-alias-label-primary) !important;
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

/* ---------- 工作区：标题与会话都小一号，并同步收一点行高 ----------
   归在「紧凑圆角与密度」开关下：密度本来就是一整套，字号不再单独开一项。 */
/* 「工作区」分组标题：更小、更弱，并与下方项目行左对齐 */
html[data-dcc-radius="on"] [class*="_sectionHeader"] {
  height: 30px !important;
  margin-bottom: 2px !important;
}
html[data-dcc-radius="on"] [class*="_sectionHeader"] [class*="_sectionLabel"]:not([class*="_sectionLabelHidden"]) {
  font-size: 13px;
  left: -2px;
  opacity: .72;
  color: var(--dsw-alias-label-tertiary);
}
html[data-dcc-radius="on"] [class*="_projectRow"] [class*="_title"],
html[data-dcc-radius="on"] [class*="_sessionRow"] [class*="_title"] {
  font-size: 13px !important;
  line-height: 18px !important;
}
html[data-dcc-radius="on"] [class*="_projectRow"] {
  height: 32px !important;
}
html[data-dcc-radius="on"] [class*="_sessionRow"] {
  height: 30px !important;
}
/* 左下角账户区：整体压矮一点 */
html[data-dcc-radius="on"] [class*="_trigger"][data-signed-out="false"]:not([data-collapsed="true"]) {
  height: 38px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  gap: 6px !important;
  font-size: 13px !important;
}
html[data-dcc-radius="on"] [class*="_trigger"][data-signed-out="false"] [class*="_avatar"] {
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

/* ---------- 会话行悬停按钮 ---------- */
/* 悬停时行尾会冒出一排按钮：「…」菜单在 rowActions 里，其余（宿主归档、以及各插件
   塞进 rowQuickActions 的按钮）紧跟在后面。DOM 上它们只有同一个 iconButton 类，
   分不出谁是谁，所以保留哪几个由脚本按 data-context-menu-trigger / aria-label 判定，
   再打上 data-dcc-hidden，这里只负责隐藏。 */
html[data-dcc-row-buttons="on"] [class*="_sessionRow"] [class*="_rowActions"] button[data-dcc-hidden] {
  display: none !important;
}

/* ---------- 会话标题栏紧凑化：标签行并入顶部工具区 ---------- */
/* 注意不能 display:none：宿主按标签行的 clientWidth 计算「能显示几个视图」，
   宽度变 0 会只剩一个「对话」。所以这里只把高度压到 0（不占布局），
   宽度和可见性照旧，量出来的数量才是对的。 */
html[data-dcc-compact-header="on"] div:has(> [data-conversation-tabs]) {
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border: 0 !important;
  overflow: hidden !important;
  visibility: hidden;
  pointer-events: none !important;
}
/* 标签行虽然高度归零，但它还在 DOM 里，宿主的 :has(._tabs) 依然成立，
   标题栏会死守 min-height:76px。这里直接按「没有标签行」的形态压平。 */
html[data-dcc-compact-header="on"] [class*="_header"]:has([data-conversation-tabs]) {
  min-height: 0 !important;
  padding-bottom: 10px !important;
  border-bottom: none !important;
}
/* 去掉硬分界线后，改用 mask 让内容顶部渐隐——滚动时文字淡入而不是被一条线切断。 */
html[data-dcc-compact-header="on"] [data-conversation-scroll] {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 20px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 20px);
}
html[data-dcc-compact-header="on"] [class*="_viewsMore"] {
  display: none !important;
}
/* 开关关掉时，自绘的分段控件不出现，标签行恢复原样 */
html[data-dcc-compact-header="off"] .dcc-segmented {
  display: none !important;
}
/* 分组按钮：与顶部官方按钮对齐——box-sizing 让 height 含边框，
   圆角用 sm(8px) 而不是 md(12px)，描边用更浅的 l1。 */
.dcc-segmented {
  box-sizing: border-box;
  display: inline-flex;
  align-items: stretch;
  height: 24px;
  padding: 0;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1);
  overflow: hidden;
}
.dcc-seg {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 0 8px;
  cursor: pointer;
  transition: background-color .12s, color .12s;
}
.dcc-seg + .dcc-seg {
  border-left: 0.5px solid var(--dsw-alias-border-l4);
}
.dcc-seg:hover:not([data-active="true"]) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dcc-seg[data-active="true"] {
  background: transparent;
  color: var(--dsw-alias-state-business-primary);
  font-weight: 500;
}

/* ---------- 输入框下方状态行：速率/缓存靠左，上下文环推到最右 ---------- */
/* 宿主的 _dock 只有 280px 宽且居中，里面是两个子项：左边的胶囊组和包着环的
   A6Bq1a_root。这里不撑满容器，而是套用聊天内容区的宽度变量并居中——
   这样它会跟着「页面边距」一起走，不会顶到内容区外面。 */
html[data-dcc-stats="on"] [class*="_dock"]:has(button[aria-haspopup="dialog"]) {
  box-sizing: border-box !important;
  width: calc(var(--dsh-chat-content-width, 100%) + 24px) !important;
  max-width: calc(var(--dsh-chat-content-width, 100%) + 24px) !important;
  margin-inline: auto !important;
  justify-content: flex-start !important;
}
/* 速率/缓存/余额成组留在左边，包着环的那个 root 吃掉剩余空间，被顶到最右 */
html[data-dcc-stats="on"] [class*="_dock"] > [class*="_root"]:has(button[aria-haspopup="dialog"]) {
  margin-left: auto !important;
}

/* 余额 pill：图标 + 文字 */
.dcc-balance {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
}
.dcc-balance svg {
  flex: none;
}
/* 「显示余额」关掉时整个 pill 不出现 */
html[data-dcc-balance="off"] .dcc-balance {
  display: none !important;
}
/* 余额低于阈值时，只有金额数字变红 */
.dcc-balance-low {
  color: var(--dsw-alias-state-error-primary) !important;
}
/* 设置页的数值输入框 */
.dcc-number {
  width: 72px;
  flex: none;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm, 4px);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  text-align: right;
}
.dcc-number:focus {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
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
/* 浅色主题下选中会话的背景再强一点 */
body:not([data-ds-dark-theme]) [class*="_sessionRow"][class*="_selected"] {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .04) !important;
}

/* 导航行的悬停 / 选中：新会话行已经是普通导航行的一员，不再单独排除 */
html[data-dcc-new="on"] nav[class*="_panelList"] [class*="_panelRow"]:hover,
html[data-dcc-new="on"] nav[class*="_panelList"] [class*="_panelRow"][class*="_panelActive"] {
  background-color: var(--dsw-alias-interactive-bg-hover) !important;
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .07) !important;
}
html[data-dcc-new="on"] body[data-ds-dark-theme] nav[class*="_panelList"] [class*="_panelRow"]:hover,
html[data-dcc-new="on"] body[data-ds-dark-theme] nav[class*="_panelList"] [class*="_panelRow"][class*="_panelActive"] {
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
  height: 24px;
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

    /**
     * 会话行悬停时只留「…」菜单和置顶按钮，其余（宿主的归档、各插件加的）隐藏。
     * 按钮上只有共用的 iconButton 类，所以按 data-context-menu-trigger 和 aria-label
     * 认人：菜单按钮带前者，置顶按钮的 aria-label 里是「置顶会话 / 取消置顶 / pin」。
     */
    function installRowActionFilter() {
      let lastRow = null;

      const isPinButton = (btn) => /置顶|pin/i.test(btn.getAttribute('aria-label') || '');

      const filterRow = (row) => {
        if (row === null) return;
        const actions = row.querySelector('[class*="_rowActions"]');
        if (actions === null) return;
        const buttons = Array.from(actions.querySelectorAll('button'));
        /* 认不出置顶按钮（例如界面是其它语言，或这一行本来就没有置顶）时整行不动：
           宁可不生效，也不要把用户需要的按钮误藏掉。 */
        if (!buttons.some(isPinButton)) return;
        for (const btn of buttons) {
          const keep = btn.hasAttribute('data-context-menu-trigger') || isPinButton(btn);
          if (keep) {
            if (btn.hasAttribute('data-dcc-hidden')) btn.removeAttribute('data-dcc-hidden');
          } else if (!btn.hasAttribute('data-dcc-hidden')) {
            btn.setAttribute('data-dcc-hidden', '');
          }
        }
      };

      /* 只在这里处理：指针进入哪一行就标记哪一行。
         早先还挂了一个 MutationObserver 定期全量扫描，滚动时虚拟列表频繁改 DOM，
         每 400ms 扫一遍所有会话行，反而成了新的卡顿源，已移除。 */
      const onPointer = (event) => {
        if (document.documentElement.dataset.dccRowButtons !== 'on') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const row = target.closest('[class*="_sessionRow"]');
        if (row === null || row === lastRow) return;
        lastRow = row;
        filterRow(row);
      };

      document.addEventListener('pointerover', onPointer, true);
      document.addEventListener('focusin', onPointer, true);
      return () => {
        document.removeEventListener('pointerover', onPointer, true);
        document.removeEventListener('focusin', onPointer, true);
        const marked = document.querySelectorAll('[data-dcc-hidden]');
        for (const el of marked) el.removeAttribute('data-dcc-hidden');
      };
    }

    /**
     * 「移除工作区与会话悬停提示」不能只把卡片藏起来：
     * 宿主仍在监听「进入行」这件事，800ms 后照样渲染卡片内容、做 fixed 定位，
     * 卡顿正是从这里来的。这里在捕获阶段截住「从行外进入行」的那一次 pointerover，
     * React 收不到事件，卡片根本不会打开。
     * 行内元素之间的移动照常放行，所以按钮的 Tooltip 不受影响。
     */
    function installHoverCardBlocker() {
      const ROW = '[class*="_sessionRow"], [class*="_projectRow"], [class*="_searchResultRow"]';

      const onOver = (event) => {
        if (document.documentElement.dataset.dccHover !== 'off') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const row = target.closest(ROW);
        if (row === null) return;
        /* 已经在行内移动，不是「进入」，放行给宿主 */
        const related = event.relatedTarget;
        if (related instanceof Node && row.contains(related)) return;
        event.stopPropagation();
      };

      /* 放在 window 捕获阶段：这是事件流最早的位置，先于 React 挂在 root 容器上的
         onPointerOverCapture，才能保证宿主那一层完全收不到「进入行」这件事。 */
      window.addEventListener('pointerover', onOver, true);
      return () => window.removeEventListener('pointerover', onOver, true);
    }

    /**
     * 会话视图切换（对话 / 轨迹）从标签行搬到顶部工具区，做成一个分段控件。
     * 原标签行只是被 CSS 隐藏，按钮仍在 DOM 里——点击自绘按钮时转发给它，
     * 选中态则跟着原按钮的 aria-selected 走，所以和宿主的真实状态永远一致。
     */
    function installViewSwitcher() {
      let bar = null;
      let observer = null;
      let timer = null;

      const findTabs = () => document.querySelector('[data-conversation-tabs]');
      const findHost = () => document.querySelector('[class*="_headerUtilities"]');

      const syncActive = () => {
        if (bar === null) return;
        const tabs = findTabs();
        if (tabs === null) return;
        const sources = Array.from(tabs.querySelectorAll('button[role="tab"]'));
        const items = Array.from(bar.querySelectorAll('.dcc-seg'));
        for (let i = 0; i < items.length; i += 1) {
          const on = sources[i] !== undefined && sources[i].getAttribute('aria-selected') === 'true';
          if (on) items[i].setAttribute('data-active', 'true');
          else items[i].removeAttribute('data-active');
        }
      };

      const build = (tabs, host) => {
        if (bar !== null) bar.remove();
        bar = document.createElement('div');
        bar.className = 'dcc-segmented';
        const sources = Array.from(tabs.querySelectorAll('button[role="tab"]'));
        sources.forEach((source, index) => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'dcc-seg';
          item.textContent = (source.textContent || '').trim();
          item.addEventListener('click', () => {
            const current = findTabs();
            if (current === null) return;
            const target = current.querySelectorAll('button[role="tab"]')[index];
            if (target !== undefined) target.click();
          });
          bar.appendChild(item);
        });
        host.insertBefore(bar, host.firstChild);
        syncActive();
      };

      const ensure = () => {
        /* 开关关掉时把自绘控件撤掉，标签行由 CSS 恢复原样 */
        if (document.documentElement.dataset.dccCompactHeader !== 'on') {
          if (bar !== null) { bar.remove(); bar = null; }
          return;
        }
        const tabs = findTabs();
        const host = findHost();
        if (tabs === null || host === null) {
          if (bar !== null) { bar.remove(); bar = null; }
          return;
        }
        const count = tabs.querySelectorAll('button[role="tab"]').length;
        if (bar === null || !bar.isConnected || bar.parentElement !== host || bar.children.length !== count) {
          build(tabs, host);
          return;
        }
        syncActive();
      };

      const schedule = () => {
        if (timer !== null) return;
        timer = window.setTimeout(() => {
          timer = null;
          ensure();
        }, 350);
      };

      ensure();
      observer = new MutationObserver(schedule);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-selected'],
      });

      return () => {
        observer.disconnect();
        if (timer !== null) clearTimeout(timer);
        if (bar !== null) bar.remove();
      };
    }

    /**
     * 在输入框下方的状态行里显示账户余额，走宿主的账户接口
     * （ctx.remote.account.getBalance）。取不到就静默不显示，不影响其他功能。
     */
    function installBalancePill(ctx) {
      let pill = null;
      let observer = null;
      let refresh = null;
      let text = '';

      const identity = () => ({
        version: VERSION,
        locale: navigator.language || 'zh-CN',
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      });

      const sync = () => {
        if (text === '') return;
        const dock = document.querySelector('[class*="_dock"]');
        if (dock === null) {
          if (pill !== null) { pill.remove(); pill = null; }
          return;
        }
        if (pill === null || !pill.isConnected) {
          /* 插件可能被重复安装/重载，两个闭包各插一个就会看到两个余额。
             先找现成的复用，保证页面上永远只有一个。 */
          const existing = dock.querySelector('.dcc-balance');
          if (existing !== null) {
            pill = existing;
          } else {
            pill = document.createElement('span');
            pill.className = 'dcc-balance';
            /* 宿主没有钱包类图标，这里按同一套 outline 规格手绘一个：
               16px 视框、1 描边、无填充。 */
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '1');
            svg.setAttribute('aria-hidden', 'true');
            svg.innerHTML = '<rect x="1.5" y="4" width="13" height="9" rx="2.5"/>'
              + '<path d="M1.5 7.2h13"/>'
              + '<circle cx="11.6" cy="9.8" r="0.9" fill="currentColor" stroke="none"/>';
            pill.appendChild(svg);
            const label = document.createElement('span');
            label.className = 'dcc-balance-label';
            label.textContent = '余额 ';
            const amountEl = document.createElement('span');
            amountEl.className = 'dcc-balance-amount';
            label.appendChild(amountEl);
            pill.appendChild(label);
            const ringRoot = dock.querySelector('[class*="_root"]:has(button[aria-haspopup="dialog"])');
            dock.insertBefore(pill, ringRoot);
          }
        }
        const amountEl = pill.querySelector('.dcc-balance-amount');
        if (amountEl === null) return;
        if (amountEl.textContent !== text) amountEl.textContent = text;
        /* 低于阈值时只让金额数字变红，前面的「余额」两个字保持弱色 */
        const limit = Number(readPrefs().balanceThreshold);
        const value = Number(String(text).replace(/[^\d.-]/g, ''));
        const low = Number.isFinite(limit) && Number.isFinite(value) && value < limit;
        if (amountEl.classList.contains('dcc-balance-low') !== low) {
          amountEl.classList.toggle('dcc-balance-low', low);
        }
      };

      const load = async () => {
        try {
          /* 必须用 ctx.get('remote')：点号访问 ctx.remote.* 会被 trace，
             只有在 inject 了该服务的上下文里才可读，渲染回调里拿不到。 */
          const remote = typeof ctx.get === 'function' ? ctx.get('remote') : null;
          const account = remote !== null && typeof remote === 'object' ? remote.account : undefined;
          if (account === undefined || typeof account.getBalance !== 'function') return;
          const res = await account.getBalance(identity());
          if (!res || res.ok !== true) return;
          const value = res.value;
          if (!value || value.status !== 'ready') return;
          const wallets = Array.isArray(value.value) ? value.value : [];
          const wallet = wallets.find((w) => w.currency === 'CNY') || wallets[0];
          if (!wallet || typeof wallet.balance !== 'string') return;
          /* 余额字符串可能带很长的小数尾，保留到小数点后 4 位并去掉多余的零 */
          const amount = Number(wallet.balance);
          const shown = Number.isFinite(amount)
            ? String(Math.round(amount * 10000) / 10000)
            : wallet.balance;
          text = `${wallet.currency === 'CNY' ? '¥' : '$'}${shown}`;
          sync();
        } catch {
          /* 未登录或接口不可用：不显示余额 */
        }
      };

      const schedule = () => {
        sync();
      };

      load();
      refresh = window.setInterval(load, 60000);
      observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        if (refresh !== null) window.clearInterval(refresh);
        if (pill !== null) pill.remove();
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
          zh ? '在保持原版 UI 大风格不变的情况下，进行减小圆角、紧凑化、秩序化、整洁化改进。使 UI 视觉更加冷静、专业、高效。多数改动可在设置中单独开关。' : 'A tidying pass over the stock UI that keeps its overall look: smaller radii, tighter spacing and a more orderly layout, for a calmer, more professional and more efficient interface. Most changes can be switched on or off individually in Settings.'),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '外观' : 'Appearance'),
          h(Row, {
            title: zh ? '隐藏左上角 Logo' : 'Hide the top-left logo',
            desc: zh ? '隐藏侧栏顶部的 Logo。' : 'Hide the logo at the top of the sidebar.',
            checked: prefs.hideLogo,
            onChange: update('hideLogo'),
          }),
          h(Row, {
            title: zh ? 'Windows 默认微软雅黑字体' : 'Microsoft YaHei on Windows',
            desc: zh ? '将 Windows 端默认字体改为微软雅黑。微软雅黑带有 hinting，使文字在显示设置低于 200% 缩放比例下，更加锐利清晰。若手动设置了字体，或使用 macOS 端，则不受影响。' : 'Use Microsoft YaHei as the default Windows font. It carries hinting, which keeps text sharp below 200% display scaling. Has no effect if you set a font manually, or on macOS.',
            checked: prefs.winFont,
            onChange: update('winFont'),
          })),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '布局' : 'Layout'),
          h(Row, {
            title: zh ? '减小圆角与间距' : 'Smaller radii and spacing',
            desc: zh ? '缩小全局圆角、缩小侧栏部分字号、收紧间距，使界面更高效。' : 'Smaller global radii, smaller sidebar type and tighter spacing, for a more efficient interface.',
            checked: prefs.radiusDensity,
            onChange: update('radiusDensity'),
          }),
          h(Row, {
            title: zh ? '会话标题栏紧凑化' : 'Compact session header',
            desc: zh ? '紧凑化会话标题栏，使会话内容可视范围更大。' : 'Tighten the session header so more of the conversation is visible.',
            checked: prefs.compactHeader,
            onChange: update('compactHeader'),
          }),
          h(Row, {
            title: zh ? '统一新会话按钮样式' : 'Unified new-session button',
            desc: zh ? '将新会话按钮样式改为与导航按钮一致的样式。' : 'Style the new-session button the same as the navigation buttons.',
            checked: prefs.invertNewSession,
            onChange: update('invertNewSession'),
          }),
          h(Row, {
            title: zh ? '折叠侧栏导航功能' : 'Collapsible sidebar navigation',
            desc: zh ? '折叠侧栏导航功能，可点击箭头展开收起。' : 'Collapse the sidebar navigation; click the arrow to expand or collapse it.',
            checked: prefs.collapseNav,
            onChange: update('collapseNav'),
          }),
          h(Row, {
            title: zh ? '弱化工作区名称' : 'Dim workspace names',
            desc: zh ? '工作区名称弱化，使工作区和会话更易区分。' : 'Dim workspace names so workspaces and sessions are easier to tell apart.',
            checked: prefs.dimSessions,
            onChange: update('dimSessions'),
          }),
          h(Row, {
            title: zh ? '会话前圆点' : 'Session leading dot',
            desc: zh ? '会话前显示一个圆点。' : 'Show a dot before each session.',
            checked: prefs.sessionDot,
            onChange: update('sessionDot'),
          }),
          h(Row, {
            title: zh ? '移除工作区与会话悬停提示' : 'Remove workspace and session hover hints',
            desc: zh ? '悬停在侧栏工作区、会话上时，不再显示详情卡片。使滚动更流畅。' : 'Hovering a workspace or session no longer shows a details card, which keeps scrolling smooth.',
            checked: prefs.hideHoverCard,
            onChange: update('hideHoverCard'),
          }),
          h(Row, {
            title: zh ? '隐藏会话悬停多余按钮' : 'Hide extra session-row buttons',
            desc: zh ? '隐藏会话悬停时除了菜单和置顶之外的其他按钮，避免拥挤遮盖过多标题。正常情况下这些按钮都已经在右键菜单中包含。若其他插件添加的按钮未在右键菜单包含，可以关闭此功能。' : 'Hide every button on a hovered session row except the "…" menu and pin, so they stop crowding the title. These actions are normally in the right-click menu too; turn this off if a plugin adds a button that is not.',
            checked: prefs.hideRowButtons,
            onChange: update('hideRowButtons'),
          }),
          h(Row, {
            title: zh ? '设置面板全屏' : 'Full-screen settings panel',
            desc: zh ? '使用非窗口化的设置页面。' : 'Use a non-windowed settings page.',
            checked: prefs.settingsFullscreen,
            onChange: update('settingsFullscreen'),
          })),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '性能与用量信息' : 'Performance and usage'),
          h(Row, {
            title: zh ? '优化布局' : 'Optimize layout',
            desc: zh ? '优化输入框下方性能与用量布局，将数据分布在左右两侧平衡视觉重心。' : 'Improve the layout of the performance and usage row, spreading the data across both sides to balance the visual weight.',
            checked: prefs.optimizeStatsLayout,
            onChange: update('optimizeStatsLayout'),
          }),
          h(Row, {
            title: zh ? '显示余额' : 'Show balance',
            desc: zh ? '在输入框下方性能与用量中显示余额。' : 'Show the account balance in the performance and usage row.',
            checked: prefs.showBalance,
            onChange: update('showBalance'),
          }),
          h('div', { className: 'dcc-row' },
            h('div', { className: 'dcc-row-text' },
              h('div', { className: 'dcc-row-title' }, zh ? '余额警告阈值' : 'Low balance threshold'),
              h('div', { className: 'dcc-row-desc' }, zh ? '余额低于此值将变为红色。最小为 0。' : 'The balance turns red below this value. Minimum 0.')),
            h('input', {
              type: 'number',
              min: '0',
              step: '1',
              className: 'dcc-number',
              value: prefs.balanceThreshold,
              'aria-label': zh ? '余额警告阈值' : 'Low balance threshold',
              onChange: (event) => {
                /* min 属性只是浏览器提示，拦不住手输负数或非法值，这里兜底归 0 */
                const next = Number(event.target.value);
                update('balanceThreshold')(Number.isFinite(next) && next >= 0 ? next : 0);
              },
            }))),
        h('p', { className: 'dcc-meta' },
          /* 中文之间用一个全角空格（\u3000）分隔，比两个半角空格更稳 */
          zh ? `版本：${VERSION}\u3000更新日期：${UPDATED}` : `Version: ${VERSION}  Updated: ${UPDATED}`));
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
      /* remote.account 是独立服务 key，和不声明就等于没有；
         只在 inject 里写上，ctx.get('remote').account 才可用。 */
      inject: ['slots', 'remote', 'remote.account'],
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
          const removeRowActionFilter = installRowActionFilter();
          const removeHoverCardBlocker = installHoverCardBlocker();
          const removeViewSwitcher = installViewSwitcher();
          const removeBalance = installBalancePill(ctx);
          return () => {
            removeCss();
            removeNewSessionRow();
            removeNavToggle();
            removeSettingsBack();
            removeRowActionFilter();
            removeHoverCardBlocker();
            removeViewSwitcher();
            removeBalance();
            const root = document.documentElement;
            delete root.dataset.dccRadius;
            delete root.dataset.dccNew;
            delete root.dataset.dccNav;
            delete root.dataset.dccDim;
            delete root.dataset.dccLogo;
            delete root.dataset.dccDot;
            delete root.dataset.dccFont;
            delete root.dataset.dccFull;
            delete root.dataset.dccHover;
            delete root.dataset.dccRowButtons;
            delete root.dataset.dccCompactHeader;
            delete root.dataset.dccStats;
            delete root.dataset.dccBalance;
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
