const fs = require('fs');
const file = 'client.js';
let s = fs.readFileSync(file, 'utf8');

const MARK = `/* ===== DEPRECATED: 设置面板全屏（v0.2.2-rc5 起宿主已内置全屏，本功能即将移除）===== */`;

// ── 1) DEFAULTS 里的默认值
const oldDef = `      settingsFullscreen: false,`;
const newDef = `      /* DEPRECATED: 宿主 v0.2.2-rc5 起设置面板已内置全屏，此项将在下一版移除 */
      settingsFullscreen: false,`;
if (!s.includes(oldDef)) { console.log('DEFAULTS 未找到'); process.exit(1); }
s = s.replace(oldDef, newDef);
console.log('✓ DEFAULTS 已标注');

// ── 2) applyPrefs 里的属性写入
const oldAttr = `      root.dataset.dccFull = prefs.settingsFullscreen ? 'on' : 'off';`;
const newAttr = `      /* DEPRECATED: 对应 settingsFullscreen，随该开关一并移除 */
      root.dataset.dccFull = prefs.settingsFullscreen ? 'on' : 'off';`;
if (!s.includes(oldAttr)) { console.log('applyPrefs 未找到'); process.exit(1); }
s = s.replace(oldAttr, newAttr);
console.log('✓ applyPrefs 已标注');

// ── 3) CSS 段落开头加标记
const oldCssHead = `/* ---------- 设置面板：全屏（避开 Electron 标题栏）+ 标题左侧返回按钮 ---------- */`;
const newCssHead = `${MARK}
/* ---------- 设置面板：全屏（避开 Electron 标题栏）+ 标题左侧返回按钮 ----------
   DEPRECATED：以下到「设置导航项」之前的规则全部服务于 settingsFullscreen，
   随该开关一并移除。 */`;
if (!s.includes(oldCssHead)) { console.log('CSS 段头未找到'); process.exit(1); }
s = s.replace(oldCssHead, newCssHead);
console.log('✓ CSS 段头已标注');

// ── 4) JS 模块注释头加标记
const oldFn = `    /**
     * 设置面板左上角的自绘返回按钮`;
const newFn = `    /**
     * DEPRECATED: 随「设置面板全屏」开关一并移除。
     * 宿主 v0.2.2-rc5 起设置面板已内置全屏，不再需要自绘关闭按钮。
     *
     * 设置面板左上角的自绘返回按钮`;
if (!s.includes(oldFn)) { console.log('JS 模块注释未找到'); process.exit(1); }
s = s.replace(oldFn, newFn);
console.log('✓ JS 模块已标注');

// ── 5) 设置项
const oldRow = `            checked: prefs.settingsFullscreen,
            onChange: update('settingsFullscreen'),`;
const newRow = `            /* DEPRECATED: 宿主 v0.2.2-rc5 起内置全屏，此项将在下一版移除 */
            checked: prefs.settingsFullscreen,
            onChange: update('settingsFullscreen'),`;
if (!s.includes(oldRow)) { console.log('设置项未找到'); process.exit(1); }
s = s.replace(oldRow, newRow);
console.log('✓ 设置项已标注');

fs.writeFileSync(file, s);
console.log('完成');
