window.__ModuleLoader__.load({
  id: 'dsh-ui-alt',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const STORAGE_KEY = 'dsh-ui-alt:prefs:v1';
    /* 发版时与 package.json 的 version 一起改：设置页底部会显示这两个值 */
    const VERSION = '0.2.308';
    const UPDATED = '2026-11-14';
    const DEFAULTS = {
      radiusDensity: true,
      invertNewSession: true,
      dimSessions: true,
      enabled: true,
      hideLogo: false,
      winFont: false,
      softenDarkText: true,
      uiTransition: true,
      disableMenuBlur: true,
      sessionDot: false,
      settingsFullscreen: true,
      hideHoverCard: true,
      hideRowButtons: true,
      compactHeader: true,
      compactAlwaysShow: false,
      navCollapse: true,
      optimizeStatsLayout: true,
      showBalance: true,
      balanceThreshold: 3,
      balanceDecimals: 2,
      pointerNormalize: true,
      textSelectLimit: true,
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
      /* 总开关关掉时，把本插件写上去的所有属性全部摘掉：
         不受单独开关控制的那部分修复（标题栏去线、侧栏边距等）也一并失效。 */
      if (!prefs.enabled) {
        const keys = Object.keys(root.dataset).filter((key) => key.startsWith('dcc'));
        for (const key of keys) delete root.dataset[key];
        root.dataset.dccEnabled = 'off';
        return;
      }
      root.dataset.dccEnabled = 'on';
      root.dataset.dccRadius = prefs.radiusDensity ? 'on' : 'off';
      root.dataset.dccNew = prefs.invertNewSession ? 'on' : 'off';
      root.dataset.dccDim = prefs.dimSessions ? 'on' : 'off';
      root.dataset.dccLogo = prefs.hideLogo ? 'hidden' : 'shown';
      root.dataset.dccDot = prefs.sessionDot ? 'on' : 'off';
      root.dataset.dccFont = prefs.winFont ? 'on' : 'off';
      root.dataset.dccTextDim = prefs.softenDarkText ? 'on' : 'off';
      root.dataset.dccTransition = prefs.uiTransition ? 'on' : 'off';
      root.dataset.dccMenuBlur = prefs.disableMenuBlur ? 'on' : 'off';
      root.dataset.dccFull = prefs.settingsFullscreen ? 'on' : 'off';
      root.dataset.dccHover = prefs.hideHoverCard ? 'off' : 'on';
      root.dataset.dccRowButtons = prefs.hideRowButtons ? 'on' : 'off';
      root.dataset.dccCompactHeader = prefs.compactHeader ? 'on' : 'off';
    root.dataset.dccAlwaysShow = prefs.compactAlwaysShow ? 'on' : 'off';
      root.dataset.dccCollapse = prefs.navCollapse ? 'on' : 'off';
      root.dataset.dccStats = prefs.optimizeStatsLayout ? 'on' : 'off';
      root.dataset.dccBalance = prefs.showBalance ? 'on' : 'off';
      root.dataset.dccPointer = prefs.pointerNormalize ? 'on' : 'off';
      root.dataset.dccSelect = prefs.textSelectLimit ? 'on' : 'off';
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
.dcc-title { margin: 0; padding: 0 2px; font-size: 18px; line-height: 26px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dcc-intro { margin: 0; padding: 0 2px; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }
.dcc-meta { margin: 0; padding: 2px 2px 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.dcc-group { display: flex; flex-direction: column; padding: 6px 20px; border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-lg); background: var(--dsw-alias-bg-layer-1); }
/* 分组标题统一降为次要色：它是分区标签，不该和设置项标题抢注意力 */
.dcc-group-title { padding: 14px 2px 4px; font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
/* 依赖项未开启时置灰 */
.dcc-row-disabled {
  opacity: .45;
  pointer-events: none;
}
.dcc-row { display: flex; align-items: center; gap: 16px; padding: 14px 2px; border-top: 1px solid var(--dsw-alias-border-l1); }
.dcc-group-title + .dcc-row { border-top: none; }
/* 无组名的组（总开关那一块）没有标题，首行同样不该有分隔线 */
.dcc-group > .dcc-row:first-child { border-top: none; }
/* 启动遮罩：先盖住，等样式稳定后淡出。底色跟随深浅主题。
   这两个值不能依赖 --dsw-alias-bg-base：它在深色主题下仍是白的，
   所以这里直接按主题写死，和宿主两种模式的页面底色对齐。 */
.dcc-boot-cover {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  opacity: 1;
  transition: opacity .3s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
  pointer-events: none;
}
body[data-ds-dark-theme] .dcc-boot-cover {
  background-color: #151517;
}
.dcc-boot-fish {
  width: 64px;
  height: auto;
  opacity: .3;
}
.dcc-boot-cover-out { opacity: 0; }
/* 纯告知行：无右侧控件，用列表承载多条说明 */
.dcc-row-info {
  align-items: flex-start;
}
.dcc-row-info .dcc-row-text {
  flex: 1;
}
/* 底部信息行：左边版本信息（可换行），右边重置按钮 */
.dcc-meta-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 2px 2px 0;
}
.dcc-meta-row .dcc-meta {
  padding: 0;
  white-space: pre-line;
}
.dcc-reset {
  flex: none;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-sm, 8px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dcc-reset:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
/* 重置确认弹窗：结构与底色对齐宿主的 Dialog（root / mask / dialog / content / footer） */
.dcc-modal {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dcc-modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .5);
}
.dcc-modal-card {
  position: relative;
  width: 360px;
  max-width: calc(100vw - 48px);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-lg, 12px);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 16px 48px rgba(0, 0, 0, .35);
  animation: dcc-plain-in .13s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
.dcc-modal-content {
  padding: 18px 20px 4px;
}
.dcc-modal-title {
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.dcc-modal-body {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}
.dcc-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px 18px;
}
.dcc-modal-btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-sm, 8px);
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dcc-modal-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
/* 破坏性操作：常态无底色、文字红；悬停补一层淡红 */
.dcc-modal-primary {
  border-color: transparent;
  background: transparent;
  color: var(--dsw-alias-state-error-primary, #e5484d);
}
.dcc-modal-primary:hover {
  background: color-mix(in oklab, var(--dsw-alias-state-error-primary, #e5484d) 14%, transparent);
}
.dcc-action {
  flex: none;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dcc-action:hover { background: var(--dsw-alias-interactive-bg-hover); }
/* 总开关关闭时，下面所有分组置灰且不可操作（第一个组是总开关本身，跳过） */
html[data-dcc-enabled="off"] .dcc-page .dcc-group:not(.dcc-primary) {
  opacity: .4;
  pointer-events: none;
}
.dcc-row-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.dcc-row-title { font-size: 15px; line-height: 22px; color: var(--dsw-alias-label-primary); }
.dcc-row-desc {
  white-space: pre-line; font-size: 12px; line-height: 17px; color: var(--dsw-alias-label-secondary); }
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
/* 原版按钮被隐藏后，它外面那层容器仍然占着高度，形成一块空白。
   用克隆行时把整层一并收掉；侧栏收窄到只剩图标时再放出来。 */
html[data-dcc-new="on"] div[class*="_newSessionRow"] {
  display: none !important;
}
html[data-dcc-new="on"]:has([data-sidebar-collapsed="true"]) div[class*="_newSessionRow"] {
  display: block !important;
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
/* 悬停底色交给克隆时一同复制过来的 panelEntry 类，和别的导航行完全一致 */
html[data-dcc-new="on"] button[data-dcc-newrow] {
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
/* 左右内边距加到 12px 后，Logo 行整体右移了 4px，这里抵消回原位 */
/* 显示 logo 时，给导航区留出与上方接近的下边距（同样只在折叠开启时） */
html[data-dcc-collapse="on"][data-dcc-logo="shown"] nav[class*="_panelList"] {
  margin-top: 4px;
}
/* 新会话按钮换成小尺寸后，Logo 上方会显得空，向下挪 2px 找回平衡 */
html[data-dcc-collapse="on"][data-dcc-new="on"] [class*="_logoRow"] {
  margin-top: 2px !important;
}
/* Logo 上下留白：高度略放大，底下留一点空隙，别贴着导航。
   只在「导航折叠」开启时生效——关掉后侧栏回到整块滚动，
   这圈额外留白就成了多余的空白，交给宿主原本的排布。 */
html[data-dcc-collapse="on"][data-dcc-logo="shown"] [class*="_logoRow"] {
  /* 左右内边距加到 12px 后 Logo 会右移 4px，这里抵消回原位 */
  margin-left: -4px !important;
  height: 32px !important;
  margin-bottom: 6px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}


/* 克隆出来的新会话行在 nav 里，滚动时要固定；
   原按钮不在这里处理——它在 nav 外面本来就固定，加 sticky 和背景
   反而会让关闭开关后的外观和宿主原版不一样。 */
[data-dcc-newrow] {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-1));
}

/* 侧栏滚动下放：整块滚动容器不再滚动，改成纵向布局；
   Logo / 面板列表 / 工作区标题全部固定，只有工作区列表自己滚。
   宽屏才有 data-sidebar-scrollport，收成细轨时这些规则不生效。 */
/* 这套固定布局只在「导航折叠」开启时生效；关掉后侧栏回到宿主原本的整块滚动。 */
html[data-dcc-collapse="on"] [data-sidebar-scrollport] {
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}
html[data-dcc-collapse="on"] [data-sidebar-scrollport] > nav[class*="_panelList"] {
  flex: none;
}
html[data-dcc-collapse="on"] [data-sidebar-scrollport] > [class*="_regionArea"] {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* 宿主 scrollArea 的右侧列比左侧少 2px，再补 4px 免得文字贴边 */
  padding-right: 4px;
}
/* 工作区标题保持不动，列表区成为唯一的滚动容器。
   宿主给 listArea 写的是 overflow-y:hidden，这里放开。 */
html[data-dcc-collapse="on"] [data-sidebar-scrollport] [class*="_listArea"] {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  /* 底部留出与 footArea 等高的空白，滚到底时最后一项不会被底栏压住 */
  padding-bottom: 105px !important;
}

/* 导航折叠：收起时用 max-height 裁到前两项（新会话 + 插件），
   过渡曲线与工作区文件夹展开/收起一致。 */
html[data-dcc-nav] nav[class*="_panelList"] {
  overflow: hidden;
  transition: max-height .15s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
  /* 导航项之间放松一点，行与行不再挨得那么紧 */
  gap: 4px !important;
  margin-bottom: 4px !important;
}
html[data-dcc-nav="collapsed"] nav[class*="_panelList"] {
  max-height: var(--dcc-nav-collapsed-height, 70px);
}
html[data-dcc-nav="expanded"] nav[class*="_panelList"] {
  max-height: var(--dcc-nav-expanded-height, 1200px);
}
/* 整个侧栏的左右内边距：宿主根上用 --dsh-sidebar-inline-padding（默认 8px），
   调大它，导航、工作区、会话列表会一起内缩，不用逐类去改 padding。
   用 :has(nav) 限定成「包含面板列表的那个根」，避免误伤其他 _root。 */
html[data-dcc-collapse="on"] [class*="_root"]:has(nav[class*="_panelList"]) {
  --dsh-sidebar-inline-padding: 12px !important;
}
/* 右边缘再多留一点：宿主的 scrollArea 第三列是 inline-padding - 2px，
   扣掉滚动条后文字几乎贴边，这里给工作区区域补 4px。 */

/* 折叠箭头：整行可点，高亮只画在中间那一小块 */
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
  cursor: default;
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
  color: var(--dsw-alias-label-secondary);
}
.dcc-nav-toggle:hover::before {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dcc-nav-toggle svg {
  display: block;
  width: 14px;
  height: 14px;
  transition: transform .15s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
html[data-dcc-nav="collapsed"] .dcc-nav-toggle svg {
  transform: rotate(180deg);
}

/* 工作区与会话行之间再紧一点：行高是固定的 32px，没有独立的行间距，
   靠上下各 1px 的负外边距把相邻行拉近。分组之间也收一收。
   归到「减小圆角与间距」开关下，关掉就恢复宿主原始行距。 */
html[data-dcc-radius="on"] [class*="_sessionRow"],
html[data-dcc-radius="on"] [class*="_projectRow"] {
  margin-block: -1px !important;
}
html[data-dcc-radius="on"] [class*="_groupSection"] {
  margin-top: 2px !important;
}

/* 深色模式下正文不再用纯白：主文本压到 80%，次级文本同步压得更低，
   否则主文本一降，和次级文本反而贴在一起，层次就没了。 */
html[data-dcc-text-dim="on"] body[data-ds-dark-theme] {
  --dsw-alias-label-primary: rgba(255, 255, 255, .8) !important;
  --dsw-alias-label-secondary: rgba(255, 255, 255, .52) !important;
}

/* 关掉动画开关时，只掐掉「消失」这一段：宿主在 dismiss 阶段会做淡出，
   这里让它瞬间结束。菜单项的 hover 等其余过渡保持原样。 */
html[data-dcc-transition="off"] [data-menu-phase="dismiss"],
html[data-dcc-transition="off"] [data-menu-phase="dismiss"] * {
  transition: none !important;
  animation: none !important;
}

/* 禁用菜单的毛玻璃：宿主那层模糊聊胜于无，关掉之后弹层改用不透明底色，
   既省掉合成开销，也让动画期间不再需要额外的兜底背景。 */
html[data-dcc-menu-blur="on"] [data-menu-material],
html[data-dcc-menu-blur="on"] [data-menu-material] *,
html[data-dcc-menu-blur="on"] [role="dialog"],
html[data-dcc-menu-blur="on"] [role="listbox"],
html[data-dcc-menu-blur="on"] [role="menu"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
/* 模糊没了就得有实底，否则会透出后面的内容。
   上下文用量这类弹层不是 data-menu-material，用 role 兜住。 */
html[data-dcc-menu-blur="on"] [data-menu-material],
html[data-dcc-menu-blur="on"] [role="dialog"],
html[data-dcc-menu-blur="on"] [role="listbox"],
html[data-dcc-menu-blur="on"] [role="menu"] {
  background-color: var(--dsw-alias-bg-layer-1) !important;
}

/* 禁用模糊后弹层本身已是不透明底，动画就不该再去动 background-color——
   否则 keyframes 的 transparent 会盖掉实底，动画结束才回落，看起来就是闪一下。
   所以这套场景单独用一组不带背景色的关键帧。 */
@keyframes dcc-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes dcc-plain-in {
  from {
    opacity: 0;
    transform: scale(.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes dcc-plain-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(.96);
  }
}

/* 兜底色：动画期间顶替失效的毛玻璃。各弹层的实际背景不一样，
   统一一个 token 会对不齐，所以按「浅色/深色 × 是否带毛玻璃」分档微调。 */
body:not([data-ds-dark-theme]) {
  --dcc-menu-fallback: color-mix(in oklab, var(--dsw-alias-bg-layer-1) 88%, #000);
}
body[data-ds-dark-theme] [data-menu-material] {
  --dcc-menu-fallback: color-mix(in oklab, var(--dsw-alias-bg-layer-1) 88%, #000);
}
body[data-ds-dark-theme] :where([role="dialog"], [role="listbox"], [role="menu"]):not([data-menu-material]) {
  --dcc-menu-fallback: color-mix(in oklab, var(--dsw-alias-bg-layer-1) 82%, #fff);
}

/* 禁用悬停卡片时直接隐藏卡片本体。
   新版的卡片是预渲染的常驻节点，悬停时只改 left/top 不改结构，
   所以拦事件没有用；它带 --dsh-hover-preview-fade 这个专有变量，用它精确定位。 */
html[data-dcc-hover="off"] [class*="_card_"][style*="--dsh-hover-preview-fade"],
html[data-dcc-hover="off"] [class*="_card_"][data-closing] {
  display: none !important;
}

/* 菜单出现/消失：整体从点击处缩放。
   transform 会让同元素的 backdrop-filter 在动画期间失效，所以动画期间
   用一层近似底色的背景兜住，避免那 130ms 出现「透明」的观感。 */
html[data-dcc-transition="on"] [data-menu-material][data-menu-phase="enter"] {
  transform-origin: var(--dcc-menu-origin, 50% 50%);
  animation: dcc-menu-in .13s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
html[data-dcc-transition="on"] [data-menu-material][data-menu-phase="dismiss"] {
  transform-origin: var(--dcc-menu-origin, 50% 50%);
  animation: dcc-menu-out .12s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1)) forwards;
}
/* 子菜单、列表选择器这些没有 data-menu-phase 的弹出层，
   用 role 单独命中，套同一组入场动画。对话框单独处理：
   窗口从中心缩放，不跟随点击位置。 */
html[data-dcc-transition="on"] [role="menu"]:not([data-menu-phase]),
html[data-dcc-transition="on"] [role="listbox"]:not([data-menu-phase]) {
  transform-origin: var(--dcc-menu-origin, left center);
  animation: dcc-menu-in .13s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
html[data-dcc-transition="on"] [role="dialog"]:not([data-menu-phase]) {
  transform-origin: 50% 50%;
  animation: dcc-menu-in .13s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
/* animation 简写会把 name 重置回 dcc-menu-in，所以这条必须写在它之后 */
html[data-dcc-menu-blur="on"] [data-menu-material][data-menu-phase="enter"],
html[data-dcc-menu-blur="on"] [data-menu-material][data-menu-phase="dismiss"],
html[data-dcc-menu-blur="on"] [role="menu"]:not([data-menu-phase]),
html[data-dcc-menu-blur="on"] [role="listbox"]:not([data-menu-phase]),
html[data-dcc-menu-blur="on"] [role="dialog"]:not([data-menu-phase]) {
  animation-name: dcc-plain-in;
}
html[data-dcc-menu-blur="on"] [data-menu-material][data-menu-phase="dismiss"] {
  animation-name: dcc-plain-out;
}


@keyframes dcc-menu-in {
  from {
    opacity: 0;
    transform: scale(.94);
    background-color: var(--dcc-menu-fallback, var(--dsw-alias-bg-layer-1));
  }
  to {
    opacity: 1;
    transform: none;
    /* 保持兜底到最后一帧：动画没有 forwards，结束即自动回到元素自身样式，
       那时 transform 也消失、backdrop-filter 恢复，衔接无痕。 */
    background-color: var(--dcc-menu-fallback, var(--dsw-alias-bg-layer-1));
  }
}
@keyframes dcc-menu-out {
  from {
    opacity: 1;
    transform: none;
    background-color: var(--dcc-menu-fallback, var(--dsw-alias-bg-layer-1));
  }
  to {
    opacity: 0;
    transform: scale(.96);
    background-color: var(--dcc-menu-fallback, var(--dsw-alias-bg-layer-1));
  }
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
/* 兜底：不等脚本标记，按按钮身份直接隐藏。
   悬停行时「菜单」和「置顶」保留，其余立刻不可见——
   脚本晚一拍也不会先闪出一排按钮。 */
html[data-dcc-row-buttons="on"] [class*="_sessionRow"]:hover [class*="_rowActions"] button:not([data-context-menu-trigger]):not([aria-label*="置顶"]):not([aria-label*="pin" i]):not([aria-label*="取消置顶"]):not([aria-label*="unpin" i]) {
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
}
/* 会话标题栏底部：始终去掉硬分割线，改用内容顶部的 mask 渐隐。
   这一条不受「会话标题栏紧凑化」开关控制——用户关掉「轨迹」后标题栏本来就矮，
   没有标签行可压，但那根线依然不该出现。用 headerUtilities 而不是 tabs 定位，
   保证两种形态（有/无标签行）都能命中。 */
[class*="_header"]:has([class*="_headerUtilities"]) {
  border-bottom: none !important;
}
/* 顶部柔边只给「对话」用：轨迹视图整块都是界面，渐隐会吃掉它自己的表头。
   轨道上没有 data-view 之类的标记，只能借标签页的选中态判断——
   第一个 tab 就是「对话」，它 aria-selected 时才挂 mask。 */
html:has([data-conversation-tabs] [role="tab"]:first-child[aria-selected="true"]) [data-conversation-scroll] {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 20px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 20px);
}
/* 宿主自带的「更多」按钮始终隐藏：标签行已被本插件的分段控件取代，
   它的下拉菜单也不再需要（当前可见的视图都能直接点）。 */
html [class*="_viewsMoreAnchor"] {
  display: none !important;
}
/* 开关关掉时，自绘的分段控件不出现，标签行恢复原样 */
html[data-dcc-compact-header="off"] .dcc-segmented {
  display: none !important;
}
/* 视图控件：一个普通的下拉按钮（当前视图名 + 箭头），点整块展开菜单。 */
.dcc-segmented {
  box-sizing: border-box;
  display: inline-flex;
  align-items: stretch;
  height: 24px;
  flex: none;
  margin-right: 2px;
  opacity: 0;
  transition: opacity .2s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
/* 悬停整个标题栏区域时浮现；鼠标直接落在控件上也保持可见 */
[class*="_header"]:hover .dcc-segmented,
.dcc-segmented:hover,
.dcc-segmented:focus-within {
  opacity: 1;
}
/* 不在「对话」视图时，控件常驻显示当前视图名 */
/* 开关打开时，对话视图下也不再自动隐藏 */
html[data-dcc-always-show="on"] .dcc-segmented {
  opacity: 1;
}
.dcc-segmented[data-pinned="true"] {
  opacity: 1;
}
.dcc-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  /* 左边多给 2px：右侧有箭头撑着，等宽内边距会让左边缘显得更挤 */
  padding: 0 6px 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color .12s, color .12s;
}
.dcc-trigger:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dcc-trigger[data-open="true"] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dcc-trigger-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dcc-trigger-arrow {
  display: block;
  width: 12px;
  height: 12px;
  flex: none;
  transition: transform .15s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1));
}
.dcc-trigger[data-open="true"] .dcc-trigger-arrow {
  transform: rotate(180deg);
}

/* 溢出菜单：对齐宿主菜单的尺寸与层级（圆角 12、内距 6、项高 32、项圆角 8） */
.dcc-seg-menu {
  position: fixed;
  z-index: 2147483000;
  min-width: 140px;
  padding: 6px;
  border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow:
    0 0 0 1px var(--dsw-alias-border-l2),
    0 10px 32px rgba(0, 0, 0, .24);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dcc-seg-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 8px);
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 32px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}
.dcc-seg-menu-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dcc-seg-menu-check {
  flex: none;
  width: 14px;
  height: 14px;
  opacity: 0;
  color: var(--dsw-alias-state-business-primary);
}
.dcc-seg-menu-check::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8.5 6.2 11.7 13 4.9' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8.5 6.2 11.7 13 4.9' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  mask-size: contain;
}
.dcc-seg-menu-item[data-active="true"] .dcc-seg-menu-check {
  opacity: 1;
}
.dcc-seg-menu-item[data-active="true"] {
  color: var(--dsw-alias-state-business-primary);
  font-weight: 500;
}
.dcc-seg-menu-item:hover {
  background: var(--dsw-alias-interactive-bg-hover);
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

/* 余额：用伪元素 + CSS 变量渲染，不往 React 的 DOM 里插任何节点。
   旁边的速率/缓存是 React 自己渲染的，更新时只改文本；外挂节点会在
   React 重排子节点时被摘掉，于是每次刷新都闪一下——伪元素没有这个问题。
   注意统计项是「activity / usage 各占一个 anchor」，不是同组，
   所以挂在「后面没有其他统计项」的那个上，也就是整排的最后一个。 */
html[data-dcc-balance="on"] [data-composer-stat]:not(:has(~ [data-composer-stat]))::after {
  content: var(--dcc-balance-text, '');
  display: inline-flex;
  align-items: center;
  align-self: center;
  margin-left: 16px;
  padding-left: 23px;
  min-height: 16px;
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
  /* 钱包图标用 background 贴上去：伪元素里塞不进 SVG 元素，
     图标颜色只能写死（中灰），深浅主题下都能看 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%238a8a8a' stroke-width='1'%3E%3Crect x='1.5' y='4' width='13' height='9' rx='2.5'/%3E%3Cpath d='M1.5 7.2h13'/%3E%3Ccircle cx='11.6' cy='9.8' r='0.9' fill='%238a8a8a' stroke='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left center;
  background-size: 16px 16px;
}
/* 低于阈值时整段变红 */
html[data-dcc-balance="on"][data-dcc-balance-low="on"] [data-composer-stat]:not(:has(~ [data-composer-stat]))::after {
  color: var(--dsw-alias-state-error-primary);
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
/* 设置页的下拉选择框 */
.dcc-select {
  flex: none;
  padding: 4px 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm, 4px);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: default;
}
.dcc-select:focus {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}

/* ---------- 指针样式规范化 ---------- */
/* 桌面软件的惯例：只有可跳转的东西才给手形。Web UI 常把「可点击」和「可跳转」
   混为一谈，这里统一压回箭头，再单独放行链接和文本输入区。 */
/* 用 auto 而不是 default：auto 会按元素类型给浏览器默认光标，
   文本区仍是 I 型、输入框仍是文本光标；default 会把这些也压成箭头。 */
html[data-dcc-pointer="on"] *,
html[data-dcc-pointer="on"] *::before,
html[data-dcc-pointer="on"] *::after {
  cursor: auto !important;
}
/* 跳转性元素保留手形 */
html[data-dcc-pointer="on"] a[href],
html[data-dcc-pointer="on"] [role="link"],
html[data-dcc-pointer="on"] [data-href] {
  cursor: pointer !important;
}
/* 「本轮改动」卡片：表头和文件行都是跳转性的（在侧边栏打开预览），
   整张卡片放行手形——只写 button 会漏掉行内的 path / counts 等子元素 */
html[data-dcc-pointer="on"] [data-changed-files="true"],
html[data-dcc-pointer="on"] [data-changed-files="true"] * {
  cursor: pointer !important;
}
/* 左上角的品牌 Logo 是可点击的（跳转官网），保留手形 */
html[data-dcc-pointer="on"] [class*="_brand"],
html[data-dcc-pointer="on"] [class*="_brand"] *,
html[data-dcc-pointer="on"] [class*="_logoRow"],
html[data-dcc-pointer="on"] [class*="_logoRow"] *,
html[data-dcc-pointer="on"] [class*="_railMark"],
html[data-dcc-pointer="on"] [class*="_railMark"] * {
  cursor: pointer !important;
}
/* 输入区保留文本光标 */
html[data-dcc-pointer="on"] input,
html[data-dcc-pointer="on"] textarea,
html[data-dcc-pointer="on"] [contenteditable="true"] {
  cursor: text !important;
}
/* 拖拽手柄保留横向缩放光标：侧栏宽度（_handle）与聊天页边距（_widthHandle） */
html[data-dcc-pointer="on"] [class*="_handle"],
html[data-dcc-pointer="on"] [class*="_widthHandle"] {
  cursor: col-resize !important;
}
/* 禁用态保留「禁止」提示，比默认箭头更清楚 */
html[data-dcc-pointer="on"] :disabled,
html[data-dcc-pointer="on"] [aria-disabled="true"] {
  cursor: not-allowed !important;
}

/* ---------- 文字可选范围 ---------- */
/* 界面文字一律不可选中（桌面软件的惯例：标题、按钮、标签、菜单不该拖出蓝底），
   只有消息正文与输入区保留可选中。带 !important 是因为宿主自己给若干处写了
   user-select: text，类选择器的优先级高于 html body，不强化压不住。 */
html[data-dcc-select="on"] body,
html[data-dcc-select="on"] body * {
  user-select: none !important;
  -webkit-user-select: none !important;
}
/* 消息正文（含其后代）可选 */
html[data-dcc-select="on"] body [data-conversation-scroll],
html[data-dcc-select="on"] body [data-conversation-scroll] * {
  user-select: text !important;
  -webkit-user-select: text !important;
}
/* 但消息区里的界面元件不算正文：按钮、操作栏、时间、改动卡片一律压回不可选 */
html[data-dcc-select="on"] body [data-conversation-scroll] button,
html[data-dcc-select="on"] body [data-conversation-scroll] button *,
html[data-dcc-select="on"] body [data-conversation-scroll] [role="button"],
html[data-dcc-select="on"] body [data-conversation-scroll] [role="button"] *,
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_action"],
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_action"] *,
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_time"],
html[data-dcc-select="on"] body [data-conversation-scroll] time,
html[data-dcc-select="on"] body [data-conversation-scroll] [data-changed-files="true"],
html[data-dcc-select="on"] body [data-conversation-scroll] [data-changed-files="true"] *,
/* 进行中的状态提示（「深度求索中，用时 1 秒…」）也是界面元件，不是正文 */
html[data-dcc-select="on"] body [data-conversation-scroll] [role="status"],
html[data-dcc-select="on"] body [data-conversation-scroll] [role="status"] *,
html[data-dcc-select="on"] body [data-conversation-scroll] [aria-live],
html[data-dcc-select="on"] body [data-conversation-scroll] [aria-live] *,
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_running"],
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_running"] *,
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_status"],
html[data-dcc-select="on"] body [data-conversation-scroll] [class*="_status"] * {
  user-select: none !important;
  -webkit-user-select: none !important;
}
/* 输入框那一片再压回不可选，否则整行（速率、余额、百分比）会被一起拖蓝 */
html[data-dcc-select="on"] body [data-conversation-region="composer"],
html[data-dcc-select="on"] body [data-conversation-region="composer"] * {
  user-select: none !important;
  -webkit-user-select: none !important;
}
/* 「本轮改动」卡片与消息时间属于界面元件，不是正文，一并压成不可选 */
html[data-dcc-select="on"] body [data-changed-files="true"],
html[data-dcc-select="on"] body [data-changed-files="true"] *,
html[data-dcc-select="on"] body time {
  user-select: none !important;
  -webkit-user-select: none !important;
}
/* 输入框本身放在最后，覆盖上面那条 */
html[data-dcc-select="on"] body input,
html[data-dcc-select="on"] body textarea,
html[data-dcc-select="on"] body [contenteditable="true"] {
  user-select: text !important;
  -webkit-user-select: text !important;
}
/* 会话标题（面包屑那一段）可选中，方便复制标题；
   只放行标题区，右侧的按钮组仍是不可选 */
html[data-dcc-select="on"] body [class*="_titleRow"],
html[data-dcc-select="on"] body [class*="_titleCluster"],
html[data-dcc-select="on"] body [class*="_crumb"],
html[data-dcc-select="on"] body [class*="_crumb"] * {
  user-select: text !important;
  -webkit-user-select: text !important;
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
/* 浅色主题下选中会话的背景再强一点 */
body:not([data-ds-dark-theme]) [class*="_sessionRow"][class*="_selected"] {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .04) !important;
}

/* 导航行：悬停弱、选中强。
   宿主的激活标记不在行类名上，而是按钮的 aria-current="page"，
   所以悬停作用在 :hover、选中作用在 [aria-current="page"]，两者叠出来才有层次。 */
body[data-ds-dark-theme] nav[class*="_panelList"] [class*="_panelRow"]:hover {
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, .05) !important;
}
body[data-ds-dark-theme] nav[class*="_panelList"] [class*="_panelRow"][aria-current="page"] {
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, .16) !important;
}
body:not([data-ds-dark-theme]) nav[class*="_panelList"] [class*="_panelRow"]:hover {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .025) !important;
}
body:not([data-ds-dark-theme]) nav[class*="_panelList"] [class*="_panelRow"][aria-current="page"] {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, .07) !important;
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
/* 设置导航项：略矮一点，归「减小圆角与间距」管 */
html[data-dcc-radius="on"] [class*="_overlay"]:has([class*="_navTitle"]) [class*="_navCell"] {
  position: relative;
  height: 38px !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}
html[data-dcc-full="on"] .dcc-settings-back {
  position: absolute;
  left: 14px;
  top: 0;
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
/* hover 也带上同样的前缀：基础规则现在是 html[data-dcc-full="on"] .dcc-settings-back
   （0,2,1），比裸的 .dcc-settings-back:hover（0,2,0）高，不加前缀底色会被压回去。 */
html[data-dcc-full="on"] .dcc-settings-back:hover {
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
        /* 宿主的悬停底色画在 _panelEntry 上、行本身是透明的。
           克隆行是裸 button，少了这层包裹，悬停就会比别的导航行浅一档，
           所以把父级的 panelEntry 类一并复制过来。 */
        const entry = row.parentElement;
        const entryClasses = entry === null
          ? []
          : [...entry.classList].filter((name) => name.includes('_panelEntry'));
        clone.className = [...row.classList].join(' ')
          + ' dcc-newrow'
          + (entryClasses.length > 0 ? ' ' + entryClasses.join(' ') : '');
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
        /* 开关关掉时彻底还原：移除克隆行、去掉原按钮上的标记，
           让它回到宿主本来的样子，而不是仅靠 CSS 隐藏 */
        if (document.documentElement.dataset.dccEnabled !== 'on' || document.documentElement.dataset.dccNew !== 'on') {
          if (clone !== null) {
            clone.remove();
            clone = null;
          }
          if (orig.getAttribute('data-dcc-original') !== null) orig.removeAttribute('data-dcc-original');
          return false;
        }
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
      /* 设置页关掉开关时立刻跑一遍 ensure，把克隆行和标记拆掉 */
      const onPref = () => ensure();
      window.addEventListener('dcc-newsession-pref', onPref);

      return () => {
        observer.disconnect();
        window.removeEventListener('dcc-newsession-pref', onPref);
        if (timer !== null) clearTimeout(timer);
        if (rafId !== 0) window.cancelAnimationFrame(rafId);
        if (clone !== null) clone.remove();
        const orig = findOriginal();
        if (orig !== null) orig.removeAttribute('data-dcc-original');
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

      /**
       * 按钮垂直位置按「标题文字的实际矩形」算——容器带 padding 时，
       * 盒子中心和文字中心并不重合。
       * 入场动画会给面板挂 transform，rect 是缩放后的，所以再除以缩放比
       * 还原成布局坐标，动画前后算出来的值才一致。
       */
      const align = () => {
        if (btn === null || !btn.isConnected || btn.offsetParent === null) return;
        const title = document.querySelector('[class*="_navTitle"]');
        if (title === null) return;
        const range = document.createRange();
        range.selectNodeContents(title);
        const rects = range.getClientRects();
        if (rects.length === 0) return;
        const textRect = rects[0];
        const panel = btn.offsetParent;
        const panelRect = panel.getBoundingClientRect();
        const scale = panel.offsetHeight > 0 ? panelRect.height / panel.offsetHeight : 1;
        const centerY = (textRect.top + textRect.height / 2 - panelRect.top) / (scale > 0 ? scale : 1);
        btn.style.top = `${Math.round(centerY - btn.offsetHeight / 2)}px`;
      };

      const closePanel = (panel) => {
        const close = panel.querySelector('[class*="_header"] [class*="_close"]');
        if (close !== null) close.click();
      };

      const ensure = () => {
        /* 总开关关闭时自绘按钮也要撤掉，否则会留下一个没有样式的裸按钮 */
        if (document.documentElement.dataset.dccEnabled !== 'on') {
          if (btn !== null) btn.remove();
          btn = null;
          return;
        }
        const panel = findPanel();
        if (panel === null) {
          if (btn !== null) btn.remove();
          btn = null;
          return;
        }
        if (btn !== null && btn.isConnected && btn.parentElement === panel) {
          align();
          return;
        }
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
        align();
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
      /* 紧凑化开关切换后立刻重建分段控件 */
      const onPrefs = (event) => {
        if (event.detail && event.detail.key === 'compactHeader') ensure();
      };
      window.addEventListener('dcc-prefs-changed', onPrefs);

      return () => {
        window.removeEventListener('dcc-prefs-changed', onPrefs);
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
        /* 总开关关闭时，把之前打上的隐藏标记全部撤掉 */
        if (document.documentElement.dataset.dccEnabled !== 'on') {
          const marked = document.querySelectorAll('[data-dcc-hidden]');
          for (const el of marked) el.removeAttribute('data-dcc-hidden');
          return;
        }
        if (document.documentElement.dataset.dccRowButtons !== 'on') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const row = target.closest('[class*="_sessionRow"]');
        if (row === null || row === lastRow) return;
        lastRow = row;
        filterRow(row);
      };

      /* 开关切换后立刻撤掉/重建标记，不必等鼠标再划过去 */
      const onPrefs = (event) => {
        if (!event.detail || event.detail.key !== 'hideRowButtons') return;
        const marked = document.querySelectorAll('[data-dcc-hidden]');
        for (const el of marked) el.removeAttribute('data-dcc-hidden');
        lastRow = null;
      };
      window.addEventListener('dcc-prefs-changed', onPrefs);
      document.addEventListener('pointerover', onPointer, true);
      document.addEventListener('focusin', onPointer, true);
      return () => {
        window.removeEventListener('dcc-prefs-changed', onPrefs);
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
      /* 最近一次「进入行」的时间戳，供下面的定时器过滤使用 */
      let lastRowHoverAt = 0;

      const onOver = (event) => {
        if (document.documentElement.dataset.dccHover !== 'off') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const row = target.closest(ROW);
        if (row === null) return;
        /* 已经在行内移动，不是「进入」，放行给宿主 */
        const related = event.relatedTarget;
        if (related instanceof Node && row.contains(related)) return;
        lastRowHoverAt = Date.now();
        /* 用 stopImmediatePropagation 而不是 stopPropagation：
           宿主的悬停计时器只要收到「进入」就会挂上，同层的监听器也得一并掐断。 */
        event.stopImmediatePropagation();
      };

      /* 宿主是在「进入行」之后用 setTimeout 排一个延迟，到点才真的取数并渲染。
         事件层抢不过它的注册顺序，所以改从这里掐：只丢弃悬停进入后极短时间内
         注册、且延迟落在该区间里的那一个，其余定时器全部放行。 */
      const originalSetTimeout = window.setTimeout;
      const patchedSetTimeout = function (fn, delay, ...rest) {
        if (document.documentElement.dataset.dccHover === 'off'
          && typeof delay === 'number'
          && delay >= 300 && delay <= 2000
          && Date.now() - lastRowHoverAt < 400) {
          return 0;
        }
        return originalSetTimeout.call(this, fn, delay, ...rest);
      };
      window.setTimeout = patchedSetTimeout;
      const onMove = (event) => {
        if (document.documentElement.dataset.dccHover !== 'off') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest(ROW) === null) return;
        /* 行内移动也要刷新时间戳：宿主随时可能因为一次移动重新排上延迟调用，
           只在「进入」时记一次的话，停留久了时间戳过期，定时器就漏过去了。 */
        lastRowHoverAt = Date.now();
        event.stopImmediatePropagation();
      };

      /* 放在 window 捕获阶段：这是事件流最早的位置，先于 React 挂在 root 容器上的
         onPointerOverCapture，才能保证宿主那一层完全收不到「进入行」这件事。
         新版悬停卡片还会用 pointerenter / mouseenter 那条路径，一并截住。
         document 上再挂一层，覆盖宿主把监听挂在 document 的情况。 */
      window.addEventListener('pointerover', onOver, true);
      window.addEventListener('pointerenter', onOver, true);
      window.addEventListener('mouseenter', onOver, true);
      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('mousemove', onMove, true);
      document.addEventListener('pointerover', onOver, true);
      document.addEventListener('pointermove', onMove, true);
      return () => {
        /* 还原 setTimeout，避免插件卸载后仍影响全局定时器 */
        if (window.setTimeout === patchedSetTimeout) window.setTimeout = originalSetTimeout;
        window.removeEventListener('pointerover', onOver, true);
        window.removeEventListener('pointerenter', onOver, true);
        window.removeEventListener('mouseenter', onOver, true);
        window.removeEventListener('pointermove', onMove, true);
        window.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('pointerover', onOver, true);
        document.removeEventListener('pointermove', onMove, true);
      };
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
      /* 正在淡出的旧控件被临时挂到 body 上，卸载时要一起收走 */
      const ghosts = new Set();

      const findTabs = () => document.querySelector('[data-conversation-tabs]');
      const findHost = () => document.querySelector('[class*="_headerUtilities"]');
      /* 视图控件始终折叠：只显示「当前激活」+「⋯」，其余收进菜单。 */
      let segMenu = null;
      let segMenuGuard = null;
      let segMenuAnchor = null;
      const closeSegMenu = () => {
        if (segMenu !== null) {
          segMenu.remove();
          segMenu = null;
        }
        if (segMenuAnchor !== null) {
          segMenuAnchor.removeAttribute('data-open');
          /* 主动移除焦点：否则 :focus-within 会一直成立，鼠标移走后控件还留在那里 */
          if (typeof segMenuAnchor.blur === 'function') segMenuAnchor.blur();
          segMenuAnchor = null;
        }
        if (segMenuGuard !== null) {
          document.removeEventListener('pointerdown', segMenuGuard, true);
          segMenuGuard = null;
        }
      };

      const syncActive = () => {
        if (bar === null) return;
        const tabs = findTabs();
        if (tabs === null) return;
        const sources = Array.from(tabs.querySelectorAll('button[role="tab"]'));
        const activeIndex = sources.findIndex((el) => el.getAttribute('aria-selected') === 'true');
        /* 按钮上显示当前视图名 */
        const label = bar.querySelector('.dcc-trigger-label');
        if (label !== null && sources[activeIndex] !== undefined) {
          const text = (sources[activeIndex].textContent || '').trim();
          if (label.textContent !== text) label.textContent = text;
        }
        /* 第一个视图（对话）之外的页面，控件要常驻显示当前视图名。
           宿主切视图的中间态可能一个选中项都没有（activeIndex 为 -1），
           这时保持上一次的状态，不要误判成「回到对话」而闪一下隐藏。 */
        if (activeIndex >= 0) {
          bar.dataset.pinned = activeIndex > 0 ? 'true' : 'false';
        }
      };

      const build = (tabs, host) => {
        /* 旧控件先淡出再移除，新控件从透明淡入——这样重建时是渐变而不是硬切 */
        if (bar !== null) {
          const old = bar;
          const rect = old.getBoundingClientRect();
          /* 控件已经被宿主摘掉时 rect 全是 0，照着定位会把它摆到窗口左上角。
             这种情况直接丢掉，不做淡出。 */
          /* 控件平时是隐藏的（opacity:0），只有标题栏被悬停时才可见。
             不可见时做淡出没有意义，反而会凭空闪一下，所以直接丢掉。 */
          const visible = old.isConnected && rect.width > 0
            && window.getComputedStyle(old).opacity !== '0';
          if (!visible) {
            old.remove();
          } else {
            /* 把旧控件固定到原位置、脱离布局流再淡出——
               否则新旧两个都在标题栏里会互相挤动，看不出「淡出」这个动作。 */
            old.style.position = 'fixed';
            old.style.left = `${rect.left}px`;
            old.style.top = `${rect.top}px`;
            old.style.margin = '0';
            old.style.pointerEvents = 'none';
            old.style.zIndex = '1';
            document.body.appendChild(old);
            ghosts.add(old);
            window.requestAnimationFrame(() => {
              old.style.opacity = '0';
            });
            window.setTimeout(() => {
              old.remove();
              ghosts.delete(old);
            }, 300);
          }
          bar = null;
        }
        bar = document.createElement('div');
        bar.className = 'dcc-segmented';
        closeSegMenu();
        const sources = Array.from(tabs.querySelectorAll('button[role="tab"]'));
        const activeIndex = sources.findIndex((el) => el.getAttribute('aria-selected') === 'true');

        /* 把点击转发给宿主对应的标签按钮 */
        const forward = (index) => {
          const current = findTabs();
          if (current === null) return;
          const target = current.querySelectorAll('button[role="tab"]')[index];
          if (target !== undefined) target.click();
        };

        const makeSeg = (label, index) => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'dcc-seg';
          item.textContent = label;
          item.addEventListener('click', () => {
            const segs = bar.querySelectorAll('.dcc-seg');
            for (let i = 0; i < segs.length; i += 1) {
              segs[i].dataset.active = i === index ? 'true' : 'false';
            }
            forward(index);
          });
          return item;
        };

        /* 控件就是一个普通的下拉按钮：当前视图名 + 箭头，点整块展开菜单 */
        {
          const activeIdx = activeIndex >= 0 ? activeIndex : 0;
          const trigger = document.createElement('button');
          trigger.type = 'button';
          trigger.className = 'dcc-trigger';
          trigger.setAttribute('aria-haspopup', 'menu');
          const textNode = document.createElement('span');
          textNode.className = 'dcc-trigger-label';
          textNode.textContent = sources[activeIdx] === undefined
            ? ''
            : (sources[activeIdx].textContent || '').trim();
          trigger.appendChild(textNode);

          const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          arrow.setAttribute('class', 'dcc-trigger-arrow');
          arrow.setAttribute('viewBox', '0 0 16 16');
          arrow.setAttribute('aria-hidden', 'true');
          const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          arrowPath.setAttribute('d', 'M4 6.5 8 10.5 12 6.5');
          arrowPath.setAttribute('fill', 'none');
          arrowPath.setAttribute('stroke', 'currentColor');
          arrowPath.setAttribute('stroke-width', '1.6');
          arrowPath.setAttribute('stroke-linecap', 'round');
          arrowPath.setAttribute('stroke-linejoin', 'round');
          arrow.appendChild(arrowPath);
          trigger.appendChild(arrow);
          bar.appendChild(trigger);

          const more = trigger;
          more.addEventListener('click', (event) => {
            event.stopPropagation();
            if (segMenu !== null) { closeSegMenu(); return; }
            const rect = bar.getBoundingClientRect();
            const menu = document.createElement('div');
            menu.className = 'dcc-seg-menu';
            /* 先插进 DOM 再量宽度，右边缘对齐到按钮右侧 —— 菜单宽度由内容决定，
               不能用固定值估算，否则会对不齐。 */
            /* 用 right 对齐按钮右边缘，不需要先量宽度——
               量宽度要读一次布局，会强制重排，表现为点击后慢半拍。 */
            menu.style.right = (window.innerWidth - rect.right) + 'px';
            menu.style.top = rect.bottom + 6 + 'px';
            const live = findTabs();
            const list = live === null ? [] : Array.from(live.querySelectorAll('button[role="tab"]'));
            const act = list.findIndex((el) => el.getAttribute('aria-selected') === 'true');
            /* 列出全部视图，当前选中的那项做标记——和标准下拉菜单一致 */
            list.forEach((source, index) => {
              const entry = document.createElement('button');
              entry.type = 'button';
              entry.className = 'dcc-seg-menu-item';
              const label = document.createElement('span');
              label.className = 'dcc-seg-menu-label';
              label.textContent = (source.textContent || '').trim();
              const check = document.createElement('span');
              check.className = 'dcc-seg-menu-check';
              check.setAttribute('aria-hidden', 'true');
              entry.append(label, check);
              if (index === act) {
                entry.dataset.active = 'true';
                entry.setAttribute('aria-current', 'true');
              }
              entry.addEventListener('click', () => {
                closeSegMenu();
                if (index === act) return;
                forward(index);
              });
              menu.appendChild(entry);
            });
            document.body.appendChild(menu);
            menu.style.transformOrigin = 'top right';
            menu.style.animation = 'dcc-plain-in .13s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1))';
            segMenu = menu;
            segMenuAnchor = more;
            more.setAttribute('data-open', 'true');
            window.setTimeout(() => {
              const onDown = (ev) => {
                if (segMenu !== menu) return;
                if (menu.contains(ev.target) || more.contains(ev.target)) return;
                closeSegMenu();
              };
              document.addEventListener('pointerdown', onDown, true);
              segMenuGuard = onDown;
            }, 0);
          });
        }
        host.insertBefore(bar, host.firstChild);
        syncActive();
        /* 重建后如果这一页需要常驻显示（非对话视图），让它淡入而不是直接跳出来 */
        if (bar.dataset.pinned === 'true') {
          const fresh = bar;
          fresh.style.opacity = '0';
          window.requestAnimationFrame(() => {
            if (fresh.isConnected) fresh.style.opacity = '';
          });
        }
      };

      const ensure = () => {
        /* 开关关掉时把自绘控件撤掉，标签行由 CSS 恢复原样 */
        if (document.documentElement.dataset.dccEnabled !== 'on'
          || document.documentElement.dataset.dccCompactHeader !== 'on') {
          if (bar !== null) { bar.remove(); bar = null; }
          return;
        }
        const tabs = findTabs();
        const host = findHost();
        /* 切换工作区时 tabs 会短暂消失再回来。这时别急着删控件——
           等它回来时不一定还有新的 DOM 变化来触发重建，控件就永久丢了。
           只有 host 真的没了才清掉。 */
        if (host === null) {
          if (bar !== null) { bar.remove(); bar = null; }
          return;
        }
        if (tabs === null) return;
        const count = tabs.querySelectorAll('button[role="tab"]').length;
        /* 切换工作区那一瞬标签还没渲染完，数量会短暂变成 0。
           这时如果按「数量不一致」去重建，就会闪一下。等它稳定下来再说。 */
        if (count === 0) return;
        /* 控件还在 DOM 里、只是容器换了 → 直接搬过去，不要重建（重建会闪一下） */
        if (bar !== null && bar.isConnected && bar.parentElement !== host) {
          host.insertBefore(bar, host.firstChild);
        }
        /* 控件固定只有两项（激活项 + ⋯），不能拿它和标签总数比，
           否则每次都会判定「数量不一致」→ 反复重建 → 看起来一直在闪。 */
        if (bar === null || !bar.isConnected) build(tabs, host);
        else syncActive();
      };

      const schedule = () => {
        if (timer !== null) return;
        timer = window.setTimeout(() => {
          timer = null;
          ensure();
        }, 350);
      };

      ensure();
      /* 切视图时 aria-selected 一变就立刻同步，不走 350ms 防抖：
         否则非对话视图下要等半拍控件才常驻出来。 */
      const onSelect = () => {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        ensure();
      };
      observer = new MutationObserver((records) => {
        const selected = records.some((record) => record.type === 'attributes');
        if (selected) onSelect();
        else schedule();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-selected'],
      });

      return () => {
        observer.disconnect();
        if (timer !== null) clearTimeout(timer);
        closeSegMenu();
        if (bar !== null) bar.remove();
        for (const ghost of ghosts) ghost.remove();
        ghosts.clear();
      };
    }

    /**
     * 在输入框下方的状态行里显示账户余额，走宿主的账户接口
     * （ctx.remote.account.getBalance）。取不到就静默不显示，不影响其他功能。
     */
    function installBalancePill(ctx) {
      let refresh = null;
      let text = '';
      let low = false;
      /* 原始金额与币种单独留着：改小数位或阈值时要能重新格式化，
         只存格式化后的字符串就回不去了。 */
      let rawAmount = null;
      let symbol = '¥';

      const identity = () => ({
        version: VERSION,
        locale: navigator.language || 'zh-CN',
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      });

      /* 只写 CSS 变量和 html 上的标记位，不碰 React 的节点树。
         伪元素没有「被 React 摘掉再补回」这一步，所以刷新时不会闪。 */
      const sync = () => {
        if (text === '') return;
        const root = document.documentElement;
        /* 总开关关闭时不再写这两个值，否则会留下一个永远显示余额的伪元素 */
        if (root.dataset.dccEnabled !== 'on') {
          root.style.removeProperty('--dcc-balance-text');
          if (root.dataset.dccBalanceLow !== undefined) delete root.dataset.dccBalanceLow;
          return;
        }
        const next = JSON.stringify(`余额 ${text}`);
        if (root.style.getPropertyValue('--dcc-balance-text') !== next) {
          root.style.setProperty('--dcc-balance-text', next);
        }
        const flag = low ? 'on' : 'off';
        if (root.dataset.dccBalanceLow !== flag) root.dataset.dccBalanceLow = flag;
      };

      /* 只根据已拿到的余额重算显示与「是否低于阈值」。
         设置页改阈值或小数位时立即调用，否则要等下一分钟拉余额才生效。 */
      const recalc = () => {
        if (rawAmount === null) return;
        const prefs = readPrefs();
        const digits = Number(prefs.balanceDecimals);
        const decimals = Number.isFinite(digits) && digits >= 2 && digits <= 6 ? Math.round(digits) : 2;
        text = `${symbol}${rawAmount.toFixed(decimals)}`;
        const limit = Number(prefs.balanceThreshold);
        low = Number.isFinite(limit) && rawAmount < limit;
        sync();
      };

      const onThreshold = () => recalc();

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
          const amount = Number(wallet.balance);
          if (!Number.isFinite(amount)) return;
          rawAmount = amount;
          symbol = wallet.currency === 'CNY' ? '¥' : '$';
          recalc();
        } catch {
          /* 未登录或接口不可用：不显示余额 */
        }
      };

      window.addEventListener('dcc-balance-threshold', onThreshold);
      /* 开关切换后立刻按已拿到的数据重算，不必等下一次轮询 */
      const onPrefs = (event) => {
        if (event.detail && event.detail.key === 'showBalance') recalc();
      };
      window.addEventListener('dcc-prefs-changed', onPrefs);
      load();
      refresh = window.setInterval(load, 60000);

      return () => {
        window.removeEventListener('dcc-balance-threshold', onThreshold);
        window.removeEventListener('dcc-prefs-changed', onPrefs);
        if (refresh !== null) window.clearInterval(refresh);
        document.documentElement.style.removeProperty('--dcc-balance-text');
        delete document.documentElement.dataset.dccBalanceLow;
      };
    }



    /**
     * 导航折叠：在面板列表下方放一个自绘箭头，点击切换展开/收起。
     * 收起时只保留前两项——克隆出来的「新会话」和「插件」，
     * 其余面板项用 max-height 裁掉，过渡曲线与工作区文件夹一致。
     */
    function installNavToggle() {
      const findNav = () => document.querySelector('nav[class*="_panelList"]');
      let btn = null;
      let observer = null;
      let timer = null;

      const sync = () => {
        if (btn === null) return;
        /* 开关关掉时撤掉箭头并强制展开，导航回到宿主原样 */
        if (document.documentElement.dataset.dccEnabled !== 'on' || document.documentElement.dataset.dccCollapse !== 'on') {
          btn.remove();
          btn = null;
          document.documentElement.dataset.dccNav = 'expanded';
          return;
        }
        const nav = findNav();
        if (nav === null) return;
        const items = Array.from(nav.children);
        btn.style.display = items.length > 2 ? '' : 'none';
        if (items.length > 0) {
          const gap = parseFloat(window.getComputedStyle(nav).rowGap) || 0;
          /* 有克隆行时保留「新会话 + 插件」两项；
             用原版新会话时（nav 里没有克隆行）只保留「插件」一项。 */
          const keep = nav.querySelector('[data-dcc-newrow]') !== null ? 2 : 1;
          let collapsed = 0;
          let full = 0;
          for (let i = 0; i < items.length; i += 1) {
            const h = items[i].getBoundingClientRect().height;
            full += h;
            if (i < keep) collapsed += h;
          }
          full += gap * Math.max(0, items.length - 1);
          if (items.length > 1) collapsed += gap * keep;
          nav.style.setProperty('--dcc-nav-collapsed-height', `${Math.ceil(collapsed)}px`);
          nav.style.setProperty('--dcc-nav-expanded-height', `${Math.ceil(full)}px`);
        }
        const isCollapsed = document.documentElement.dataset.dccNav === 'collapsed';
        const label = isCollapsed ? (isZh() ? '展开导航' : 'Expand navigation') : (isZh() ? '收起导航' : 'Collapse navigation');
        btn.setAttribute('aria-label', label);
        btn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
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
          sync();
        });
        nav.parentElement.insertBefore(btn, nav.nextSibling);
        sync();
      };

      const ensure = () => {
        if (document.documentElement.dataset.dccCollapse !== 'on') {
          if (btn !== null) {
            btn.remove();
            btn = null;
          }
          document.documentElement.dataset.dccNav = 'expanded';
          return;
        }
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

      /* 默认收起，且不写任何持久化存储：每次加载都从收起态开始，
         用户当次会话里展开只影响当前页面。 */
      if (document.documentElement.dataset.dccNav === undefined) {
        document.documentElement.dataset.dccNav = 'collapsed';
      }
      ensure();
      observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });
      /* 新会话克隆行增删会改变「折叠时保留几项」，要立刻重算高度 */
      const onNewSessionPref = () => ensure();
      window.addEventListener('dcc-newsession-pref', onNewSessionPref);
      /* 导航折叠开关本身切换后也要立刻重算，否则箭头和布局要等 400ms 防抖 */
      const onNavPref = (event) => {
        if (event.detail && event.detail.key === 'navCollapse') {
          /* 重新打开导航折叠时，默认回到收起状态——
             否则会沿用上一次的展开状态，看起来像开关没生效。 */
          if (document.documentElement.dataset.dccCollapse === 'on') {
            document.documentElement.dataset.dccNav = 'collapsed';
          }
          window.setTimeout(() => ensure(), 0);
        }
      };
      window.addEventListener('dcc-prefs-changed', onNavPref);

      return () => {
        window.removeEventListener('dcc-newsession-pref', onNewSessionPref);
        window.removeEventListener('dcc-prefs-changed', onNavPref);
        observer.disconnect();
        if (timer !== null) clearTimeout(timer);
        if (btn !== null) btn.remove();
        delete document.documentElement.dataset.dccNav;
      };
    }

    /**
     * 菜单从点击处缩放展开。CSS 负责动画，这里只把「最后一次指针位置」
     * 换算成菜单内的相对坐标写进变量，让缩放的锚点落在点下去的地方。
     */
    function installMenuOrigin() {
      let lastX = 0;
      let lastY = 0;
      let observer = null;
      /* 每出现一个新菜单就递增编号，用来判断「谁是最后出现的」。
         不能用 DOM 顺序：子菜单是 portal 节点，先出现的可能排在后面。 */
      let seq = 0;

      const onDown = (event) => {
        lastX = event.clientX;
        lastY = event.clientY;
      };

      const mark = () => {
        const menus = document.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"]');
        for (let i = 0; i < menus.length; i += 1) {
          const menu = menus[i];
          if (menu.hasAttribute('data-dcc-menu-seq')) continue;
          seq += 1;
          menu.setAttribute('data-dcc-menu-seq', String(seq));
          if (document.documentElement.dataset.dccTransition !== 'on') continue;
          const rect = menu.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;
          const x = Math.min(1, Math.max(0, (lastX - rect.left) / rect.width));
          const y = Math.min(1, Math.max(0, (lastY - rect.top) / rect.height));
          menu.style.setProperty('--dcc-menu-origin', `${Math.round(x * 100)}% ${Math.round(y * 100)}%`);
        }
        /* 宿主切换可展开项时，旧子菜单要等关闭延迟才移除，期间会和新叠在一起。
           只留编号最大（最后出现）的那个可见，其余立即隐身；
           不碰宿主状态，它照常走自己的关闭流程。 */
        const subs = Array.from(document.querySelectorAll('[role="menu"]:not([data-menu-phase])'));
        if (subs.length < 2) {
          for (let i = 0; i < subs.length; i += 1) {
            subs[i].style.opacity = '';
            subs[i].style.pointerEvents = '';
          }
          return;
        }
        let newest = null;
        let newestSeq = -1;
        for (let i = 0; i < subs.length; i += 1) {
          const value = Number(subs[i].getAttribute('data-dcc-menu-seq') || 0);
          if (value > newestSeq) {
            newestSeq = value;
            newest = subs[i];
          }
        }
        for (let i = 0; i < subs.length; i += 1) {
          const sub = subs[i];
          const keep = sub === newest;
          sub.style.opacity = keep ? '' : '0';
          sub.style.pointerEvents = keep ? '' : 'none';
        }
      };

      window.addEventListener('pointerdown', onDown, true);
      observer = new MutationObserver(mark);
      observer.observe(document.body, { childList: true, subtree: true });
      mark();

      return () => {
        observer.disconnect();
        window.removeEventListener('pointerdown', onDown, true);
      };
    }

    /**
     * 对话框没有关闭阶段（open 为 false 时整个 portal 直接卸载），
     * 所以退场动画只能靠「卸载瞬间克隆一份快照、覆盖在原位播完再删」。
     * 原节点照常卸载，不干扰 React 状态。
     */
    function installDialogExit() {
      let observer = null;
      /* 节点被移除时再量尺寸已经晚了——脱离文档的元素 rect 全是 0。
         所以对话框一出现就把位置记下来，移除时直接取这份快照。 */
      const rects = new WeakMap();

      const remember = (root) => {
        if (root.hasAttribute('data-dcc-dialog-clone')) return;
        const dialog = root.matches('[role="dialog"]') ? root : root.querySelector('[role="dialog"]');
        if (dialog === null || rects.has(dialog)) return;
        const rect = dialog.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) rects.set(dialog, rect);
      };

      const playExit = (dialog) => {
        if (document.documentElement.dataset.dccTransition !== 'on') return;
        /* 快照自己也是 role="dialog"，不排除的话它的移除会再触发一轮快照，无限循环 */
        /* 标记打在克隆的遮罩层上，卡片只是它的子孙，所以用 closest 向上找 */
        if (dialog.closest('[data-dcc-dialog-clone]') !== null) return;
        if (!rects.has(dialog)) return;
        /* 卡片本身是 position: relative，靠父级（fixed + flex）居中。
           所以克隆父级整层、保持它的定位不动，只把动画加在卡片上——
           卡片一旦被单独提出来改成 fixed，就会脱离这层居中上下文。 */
        const overlay = dialog.parentElement;
        const source = overlay !== null && overlay !== document.body ? overlay : dialog;
        const clone = source.cloneNode(true);
        clone.removeAttribute('data-dcc-menu-seq');
        clone.setAttribute('data-dcc-dialog-clone', '');
        clone.style.zIndex = '2147483000';
        clone.style.pointerEvents = 'none';
        /* 禁用模糊时弹层是不透明底，得用不带背景色的那组关键帧，
           否则快照会从实底渐变到兜底色，看起来就是退场时变色。 */
        const exitAnim = document.documentElement.dataset.dccMenuBlur === 'on'
          ? 'dcc-plain-out'
          : 'dcc-menu-out';
        /* 整层统一淡出：这样压暗层和卡片一定同步，不依赖 mask 的类名是否命中 */
        clone.style.animation = 'dcc-fade-out .12s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1)) forwards';
        /* 卡片在这之上再加缩放 */
        const inner = clone.querySelector('[role="dialog"]');
        if (inner !== null) {
          inner.style.animation = `${exitAnim} .12s var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1)) forwards`;
        }
        document.body.appendChild(clone);
        window.setTimeout(() => clone.remove(), 220);
      };

      observer = new MutationObserver((records) => {
        for (let i = 0; i < records.length; i += 1) {
          const added = records[i].addedNodes;
          for (let j = 0; j < added.length; j += 1) {
            const node = added[j];
            if (node instanceof Element) remember(node);
          }
          const removed = records[i].removedNodes;
          for (let j = 0; j < removed.length; j += 1) {
            const node = removed[j];
            if (!(node instanceof Element)) continue;
            const dialog = node.matches('[role="dialog"]')
              ? node
              : node.querySelector('[role="dialog"]');
            if (dialog !== null) playExit(dialog);
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      return () => observer.disconnect();
    }

    /**
     * 启动遮罩：宿主的加载页退场、应用界面渲染出来之后，本插件注入的样式
     * 还要再落一次，中间能看到一次布局跳变。这里等界面真正出现（侧栏根节点
     * 就位且有尺寸）再多等一帧，然后盖 500ms 再淡出。
     */
    function installBootCover(prefs) {
      if (!prefs.enabled) return () => {};
      let cover = null;
      let themeObserver = null;
      let bootObserver = null;
      let rafId = 0;
      let fadeTimer = 0;
      let removeTimer = 0;
      let disposed = false;

      const ready = () => {
        const sidebar = document.querySelector('[class*="_root"]:has(nav[class*="_panelList"])');
        if (sidebar === null) return false;
        const rect = sidebar.getBoundingClientRect();
        return rect.width > 100 && rect.height > 100;
      };

      const wait = () => {
        if (disposed) return;
        if (!ready()) {
          rafId = window.requestAnimationFrame(wait);
          return;
        }
        makeCover();
      };

      const makeCover = () => {
        if (disposed || cover !== null) return;
        cover = document.createElement('div');
        cover.className = 'dcc-boot-cover';
        const applyTheme = () => {
          if (cover === null) return;
          const dark = document.body.hasAttribute('data-ds-dark-theme')
            || document.documentElement.hasAttribute('data-ds-dark-theme');
          cover.style.backgroundColor = dark ? '#151517' : '#ffffff';
        };
        applyTheme();
        themeObserver = new MutationObserver(applyTheme);
        themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['data-ds-dark-theme', 'class'],
        });
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-ds-dark-theme', 'class'],
        });
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 23.16 17.04');
        svg.setAttribute('class', 'dcc-boot-fish');
        svg.setAttribute('aria-hidden', 'true');
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shape.setAttribute('d', FISH_LOGO_PATH);
        /* 直接按主题写死填充色，不依赖 CSS 选择器：
           之前靠 body:not([...]) 反色，浅色下没生效就会变成白鱼压在白底上。 */
        const darkNow = document.body.hasAttribute('data-ds-dark-theme')
          || document.documentElement.hasAttribute('data-ds-dark-theme');
        shape.setAttribute('fill', darkNow ? '#ffffff' : '#000000');
        svg.appendChild(shape);
        cover.appendChild(svg);
        document.documentElement.appendChild(cover);
        fadeTimer = window.setTimeout(() => {
          if (cover === null) return;
          cover.classList.add('dcc-boot-cover-out');
          removeTimer = window.setTimeout(() => {
            if (themeObserver !== null) {
              themeObserver.disconnect();
              themeObserver = null;
            }
            if (cover !== null) cover.remove();
            cover = null;
          }, 320);
        }, 500);
      };

      /* 宿主的加载页是 [data-dsh-boot]。它一被移除就立刻盖遮罩——
         MutationObserver 的回调在同一轮微任务里跑，赶在浏览器绘制之前，
         所以中间不会露出没有样式的那一帧。 */
      const hasBoot = () => document.querySelector('[data-dsh-boot]') !== null;
      if (hasBoot()) {
        bootObserver = new MutationObserver(() => {
          if (hasBoot()) return;
          bootObserver.disconnect();
          bootObserver = null;
          makeCover();
        });
        bootObserver.observe(document.body, { childList: true, subtree: true });
      } else {
        /* 插件加载得比加载页还晚，那就等界面就绪 */
        wait();
      }

      wait();
      return () => {
        disposed = true;
        if (bootObserver !== null) bootObserver.disconnect();
        if (themeObserver !== null) themeObserver.disconnect();
        if (rafId !== 0) window.cancelAnimationFrame(rafId);
        window.clearTimeout(fadeTimer);
        window.clearTimeout(removeTimer);
        if (cover !== null) cover.remove();
      };
    }

    /* 侧栏 Logo 那条鲸鱼（与宿主同一份 path），遮罩中心会用到 */
    const FISH_LOGO_PATH = 'M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z';

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
      return h('div', { className: props.disabled ? 'dcc-row dcc-row-disabled' : 'dcc-row' },
        h('div', { className: 'dcc-row-text' },
          h('div', { className: 'dcc-row-title' }, props.title),
          props.desc ? h('div', { className: 'dcc-row-desc' }, props.desc) : null),
        h(Switch, {
          checked: props.checked,
          onChange: props.disabled ? () => {} : props.onChange,
          title: props.title,
        }));
    }

    /* 纯告知行：右侧没有任何控件，内容按纯文本渲染（换行由 pre-line 处理） */
    function InfoRow(props) {
      return h('div', { className: 'dcc-row dcc-row-info' },
        h('div', { className: 'dcc-row-text' },
          h('div', { className: 'dcc-row-title' }, props.title),
          h('div', { className: 'dcc-row-desc' }, props.desc)));
    }

    /* 右侧是按钮而不是开关的行：用于「重载前端界面」这类一次性操作 */
    function ActionRow(props) {
      return h('div', { className: 'dcc-row' },
        h('div', { className: 'dcc-row-text' },
          h('div', { className: 'dcc-row-title' }, props.title),
          props.desc ? h('div', { className: 'dcc-row-desc' }, props.desc) : null),
        h('button', {
          type: 'button',
          className: 'dcc-action',
          onClick: props.onClick,
        }, props.label));
    }

    function Section() {
      const [prefs, setPrefs] = React.useState(readPrefs);
      const [confirmReset, setConfirmReset] = React.useState(false);
      const zh = isZh();
      /* 重置全部设置：写回默认值后重载，避免残留的 DOM 与属性状态 */
      const resetPrefs = () => {
        const next = { ...DEFAULTS };
        savePrefs(next);
        if (typeof window !== 'undefined') window.location.reload();
      };
      const update = (key) => (value) => {
        setPrefs((current) => {
          const next = { ...current, [key]: value };
          savePrefs(next);
          return next;
        });
        /* 阈值或小数位变了要立刻重算显示，通知余额模块重算一次 */
        if ((key === 'balanceThreshold' || key === 'balanceDecimals') && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('dcc-balance-threshold'));
        }
        /* 「统一新会话按钮样式」切换后要立刻重建克隆行。
           延后一拍再发：属性由 applyPrefs 在下一次渲染里写入，
           事件如果先到，ensure 读到的还是旧值，看起来就像没反应。 */
        if (key === 'invertNewSession' && typeof window !== 'undefined') {
          window.setTimeout(() => {
            window.dispatchEvent(new Event('dcc-newsession-pref'));
          }, 0);
        }
        /* 其余需要重建 DOM 的开关统一走这个事件，各模块只处理自己关心的 key。
           同样延后一拍，等 applyPrefs 把属性写进 html。 */
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent('dcc-prefs-changed', { detail: { key } }));
          }, 0);
        }
        /* 总开关切换会整体改变已注入的 DOM 与样式，重载一次前端最干净。
           偏好此时已经写进存储，重载后会按新状态重建。 */
        if (key === 'enabled' && typeof window !== 'undefined') {
          window.setTimeout(() => window.location.reload(), 60);
        }
      };
      return h('div', { className: 'dcc-page' },
        h('div', { className: 'dcc-title' }, zh ? 'UI 改进' : 'UI improvements'),
        h('p', { className: 'dcc-intro' },
          zh ? '在保持原版 UI 大体布局不变的情况下，进行减小圆角、紧凑化、整洁化、高效化改进，使 UI 视觉更加冷静、专业、高效。同时添加余额显示。大部分改动可在设置中单独开关。' : 'Keeps the overall layout of the stock UI while tightening its radii, spacing and tidiness for a calmer, more professional and more efficient look. Also adds an account balance display. Most changes can be switched on or off individually in Settings.'),
        /* 无组名的操作区：总开关 + 重载前端界面 */
        h('div', { className: 'dcc-group dcc-primary' },
          h(Row, {
            title: zh ? '总开关' : 'Master switch',
            desc: zh ? '关闭后将禁用全部修改，包括始终启用的部分界面修复功能。\n打开和关闭会重载前端界面，不影响正在运行的任务。' : 'Turning it off disables every change, including the always-on UI fixes.\nToggling it reloads the UI; running tasks are not affected.',
            checked: prefs.enabled,
            onChange: update('enabled'),
          }),
          h(ActionRow, {
            title: zh ? '重载前端界面' : 'Reload the UI',
            desc: zh ? '调整本插件的设置后建议执行一次。使用了其他修改前端界面类的插件，也可以在此处重载。\n不会影响正在运行的任务。' : 'Recommended after changing this plugin settings. Also reloads other UI-modifying plugins.\nRunning tasks are not affected.',
            label: zh ? '重载' : 'Reload',
            onClick: () => { window.location.reload(); },
          })),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '外观' : 'Appearance'),
          h(Row, {
            title: zh ? '减小圆角与间距' : 'Smaller radii and spacing',
            desc: zh ? '缩小全局圆角、缩小侧栏部分字号、收紧间距，使界面更高效。' : 'Smaller global radii, smaller sidebar type and tighter spacing, for a more efficient interface.',
            checked: prefs.radiusDensity,
            onChange: update('radiusDensity'),
          }),
          h(Row, {
            title: zh ? '降低深色模式文字亮度' : 'Soften dark-mode text',
            desc: zh ? '略微降低深色模式文字亮度，避免纯白文字过于刺眼。' : 'Slightly dims text in dark mode so pure white is less harsh.',
            checked: prefs.softenDarkText,
            onChange: update('softenDarkText'),
          }),
          h(Row, {
            title: zh ? '为菜单和窗口添加动画' : 'Animate menus and dialogs',
            desc: zh ? '为菜单添加更流畅的出现和消失动画。部分菜单由于底层限制无法添加消失动画。' : 'Smoother open and close animations for menus. Some menus cannot animate their close due to platform limits.',
            checked: prefs.uiTransition,
            onChange: update('uiTransition'),
          }),
          h(Row, {
            title: zh ? '禁用菜单模糊效果' : 'Disable menu blur',
            desc: zh ? '禁用原版菜单聊胜于无的模糊效果，增加流畅度和整体感。' : 'Drops the stock menu blur for smoother rendering and a more unified look.',
            checked: prefs.disableMenuBlur,
            onChange: update('disableMenuBlur'),
          }),
          h(Row, {
            title: zh ? '设置面板全屏' : 'Full-screen settings panel',
            desc: zh ? '使用非窗口化的设置页面。' : 'Use a non-windowed settings page.',
            checked: prefs.settingsFullscreen,
            onChange: update('settingsFullscreen'),
          }),
          h(Row, {
            title: zh ? 'Windows 默认使用微软雅黑字体' : 'Use Microsoft YaHei by default on Windows',
            desc: zh ? '将 Windows 端默认字体改为微软雅黑。微软雅黑带有 hinting，使文字在显示设置低于 200% 缩放比例下，更加锐利清晰。\n若手动设置了字体，或使用 macOS 端，则不受影响。' : 'Use Microsoft YaHei as the default Windows font. It carries hinting, which keeps text sharp below 200% display scaling.\nHas no effect if you set a font manually, or on macOS.',
            checked: prefs.winFont,
            onChange: update('winFont'),
          }),
),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '导航和工作区' : 'Navigation and workspace'),
          h(Row, {
            title: zh ? '隐藏左上角 Logo' : 'Hide the top-left logo',
            desc: zh ? '隐藏侧栏顶部的 Logo。' : 'Hide the logo at the top of the sidebar.',
            checked: prefs.hideLogo,
            onChange: update('hideLogo'),
          }),
          h(Row, {
            title: zh ? '统一新会话按钮样式' : 'Unified new-session button',
            desc: zh ? '将新会话按钮样式改为与导航按钮一致的样式。' : 'Style the new-session button the same as the navigation buttons.',
            checked: prefs.invertNewSession,
            onChange: update('invertNewSession'),
          }),
          h(Row, {
            title: zh ? '导航折叠' : 'Collapsible navigation',
            desc: zh ? '在导航下方显示折叠箭头，可展开和收起。' : 'Show a collapse arrow under the navigation to expand and collapse it.',
            checked: prefs.navCollapse,
            onChange: update('navCollapse'),
          }),
          h(Row, {
            title: zh ? '弱化工作区名称' : 'Dim workspace names',
            desc: zh ? '工作区名称弱化，使工作区和会话更易区分。' : 'Dim workspace names so workspaces and sessions are easier to tell apart.',
            checked: prefs.dimSessions,
            onChange: update('dimSessions'),
          }),
          h(Row, {
            title: zh ? '移除工作区与会话悬停详情卡片' : 'Remove workspace and session hover cards',
            desc: zh ? '悬停在侧栏工作区、会话上时，不再显示详情卡片。使滚动更流畅。' : 'Hovering a workspace or session no longer shows a details card, which keeps scrolling smooth.',
            checked: prefs.hideHoverCard,
            onChange: update('hideHoverCard'),
          }),
          h(Row, {
            title: zh ? '隐藏会话悬停多余按钮' : 'Hide extra session-row buttons',
            desc: zh ? '隐藏会话悬停时除了菜单和置顶之外的其他按钮，避免拥挤遮盖过多标题。\n正常情况下这些按钮都已经在右键菜单中包含。若其他插件添加的按钮未在右键菜单包含，可以关闭此功能。' : 'Hide every button on a hovered session row except the "…" menu and pin, so they stop crowding the title.\nThese actions are normally in the right-click menu too; turn this off if a plugin adds a button that is not.',
            checked: prefs.hideRowButtons,
            onChange: update('hideRowButtons'),
          }),
          h(Row, {
            title: zh ? '会话前圆点' : 'Session leading dot',
            desc: zh ? '在侧栏工作区会话前显示一个圆点标记。' : 'Show a dot marker before each session in the sidebar.',
            checked: prefs.sessionDot,
            onChange: update('sessionDot'),
          }),
),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '会话标题栏' : 'Session header'),
          h(Row, {
            title: zh ? '会话标题栏紧凑化' : 'Compact session header',
            desc: zh ? '将视图切换按钮移到右上工具按钮处。使会话内容可视范围更大。\n此按钮在对话模式下默认隐藏，鼠标位于标题栏区域时才会显示。' : 'Move the view switcher button to the toolbar buttons in the top-right, giving the conversation more room.\nIn the conversation view it is hidden by default and only appears when the pointer is over the header.',
            checked: prefs.compactHeader,
            onChange: update('compactHeader'),
          }),
          h(Row, {
            title: zh ? '紧凑标题栏始终显示视图切换控件' : 'Always show view switcher',
            desc: zh ? '在对话视图下不自动隐藏视图切换控件。' : 'Keep the view switcher visible in the conversation view instead of hiding it until hover.',
            checked: prefs.compactAlwaysShow,
            disabled: !prefs.compactHeader,
            onChange: update('compactAlwaysShow'),
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
            })),
          h('div', { className: 'dcc-row' },
            h('div', { className: 'dcc-row-text' },
              h('div', { className: 'dcc-row-title' }, zh ? '余额小数位数' : 'Balance decimal places'),
              h('div', { className: 'dcc-row-desc' }, zh ? '余额显示的小数位数。' : 'How many decimal places the balance shows.')),
            h('select', {
              className: 'dcc-select',
              value: String(prefs.balanceDecimals),
              'aria-label': zh ? '余额小数位数' : 'Balance decimal places',
              onChange: (event) => update('balanceDecimals')(Number(event.target.value)),
            }, [2, 3, 4, 5, 6].map((n) => h('option', { key: n, value: String(n) }, `${n} 位`))))),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '规范化' : 'Normalization'),
          h(Row, {
            title: zh ? '指针样式规范化' : 'Normalize pointer styles',
            desc: zh ? '遵循桌面软件的指针样式规范，仅链接等跳转性元素会更改指针样式为「手形」。' : 'Follows desktop conventions: only links and other navigational elements show a hand cursor.',
            checked: prefs.pointerNormalize,
            onChange: update('pointerNormalize'),
          }),
          h(Row, {
            title: zh ? '文本可选中限制' : 'Restrict text selection',
            desc: zh ? '遵循桌面软件的规范，使 UI 界面元素的文本不可被选中。' : 'Follows desktop conventions: text in interface elements cannot be selected.',
            checked: prefs.textSelectLimit,
            onChange: update('textSelectLimit'),
          })),
        h('div', { className: 'dcc-group' },
          h('div', { className: 'dcc-group-title' }, zh ? '基础改进' : 'Base fixes'),
          h(InfoRow, {
            title: zh ? '基础细节改进和修复' : 'Base detail fixes and improvements',
            desc: zh
              ? [
                '这些基础修复和改进影响很小，会始终启用，除非关闭总开关。',
                '- 左侧导航栏部分布局细节优化。',
                '- 工作区文件夹悬停时保留图标。',
                '- 已归档会话显示删除线。',
                '- 会话标题栏与正文间去除分割线，柔化过渡。',
                '- 选择题弹窗细节优化。',
                '- 避免界面加载时跳变添加的过渡遮罩。',
                '- 修复二级右键菜单消失延迟。',
              ].join('\n')
              : [
                'These small fixes and improvements are always on unless the master switch is off.',
                '- Layout details refined in the left navigation.',
                '- Workspace folder icons stay visible on hover.',
                '- Archived sessions show a strikethrough.',
                '- No divider between the session header and the body; softened transition.',
                '- Multiple-choice dialog details refined.',
                '- A transition cover added to avoid layout jumps on startup.',
                '- Fixed the delay when closing a second-level context menu.',
              ].join('\n'),
          })),
        h('div', { className: 'dcc-meta-row' },
          h('p', { className: 'dcc-meta' },
            /* 中文之间用一个全角空格（\u3000）分隔，比两个半角空格更稳 */
            zh
              ? `版本：${VERSION}\u3000更新日期：${UPDATED}\n此版本基于 DSH v0.2.2-rc.3 测试`
              : `Version: ${VERSION}  Updated: ${UPDATED}\nTested on DSH v0.2.2-rc.3`),
          h('button', {
            type: 'button',
            className: 'dcc-reset',
            onClick: () => setConfirmReset(true),
          }, zh ? '重置设置' : 'Reset')),
        confirmReset ? h('div', { className: 'dcc-modal', role: 'presentation' },
          h('div', {
            className: 'dcc-modal-mask',
            'aria-hidden': 'true',
            onClick: () => setConfirmReset(false),
          }),
          h('div', { className: 'dcc-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': zh ? '重置 UI 改进选项' : 'Reset UI improvements' },
            h('div', { className: 'dcc-modal-content' },
              h('div', { className: 'dcc-modal-title' }, zh ? '重置 UI 改进选项' : 'Reset UI improvements'),
              h('div', { className: 'dcc-modal-body' }, zh ? '将会重置本插件的所有设置项到默认状态。' : 'Every option in this plugin will be reset to its default.')),
            h('div', { className: 'dcc-modal-actions' },
              h('button', { type: 'button', className: 'dcc-modal-btn', onClick: () => setConfirmReset(false) }, zh ? '取消' : 'Cancel'),
              h('button', { type: 'button', className: 'dcc-modal-btn dcc-modal-primary', onClick: () => { resetPrefs(); } }, zh ? '重置' : 'Reset'))))
          : null);
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
          const removeSettingsBack = installSettingsBackButton();
          const removeRowActionFilter = installRowActionFilter();
          const removeHoverCardBlocker = installHoverCardBlocker();
          const removeViewSwitcher = installViewSwitcher();
          const removeBalance = installBalancePill(ctx);
          const removeBootCover = installBootCover(readPrefs());
          const removePluginPin = installNavToggle();
          const removeMenuOrigin = installMenuOrigin();
          const removeDialogExit = installDialogExit();
          return () => {
            removeCss();
            removeNewSessionRow();
            removeSettingsBack();
            removeRowActionFilter();
            removeHoverCardBlocker();
            removeViewSwitcher();
            removeBalance();
            removeBootCover();
            removePluginPin();
            removeMenuOrigin();
            removeDialogExit();
            const root = document.documentElement;
            delete root.dataset.dccRadius;
            delete root.dataset.dccNew;
            delete root.dataset.dccDim;
            delete root.dataset.dccEnabled;
            delete root.dataset.dccLogo;
            delete root.dataset.dccDot;
            delete root.dataset.dccFont;
            delete root.dataset.dccTextDim;
            delete root.dataset.dccTransition;
            delete root.dataset.dccMenuBlur;
            delete root.dataset.dccFull;
            delete root.dataset.dccHover;
            delete root.dataset.dccRowButtons;
            delete root.dataset.dccCompactHeader;
            delete root.dataset.dccCollapse;
            delete root.dataset.dccStats;
            delete root.dataset.dccBalance;
            delete root.dataset.dccPointer;
            delete root.dataset.dccSelect;
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
