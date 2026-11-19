const fs = require('fs');
const file = 'client.js';
let s = fs.readFileSync(file, 'utf8');

const step = (fn, label) => {
  const before = s;
  s = fn(s);
  console.log(s === before ? '✗ ' + label : '✓ ' + label);
};

// ── 1) DEFAULTS
step((t) => t.replace(`      /* DEPRECATED: 宿主 v0.2.2-rc5 起设置面板已内置全屏，此项将在下一版移除 */
      settingsFullscreen: false,
`, ''), 'DEFAULTS');

// ── 2) applyPrefs
step((t) => t.replace(`      /* DEPRECATED: 对应 settingsFullscreen，随该开关一并移除 */
      root.dataset.dccFull = prefs.settingsFullscreen ? 'on' : 'off';
`, ''), 'applyPrefs 属性');

// ── 3) applyPrefs 的清理分支
step((t) => t.replace(`            delete root.dataset.dccFull;
`, ''), 'applyPrefs 清理分支');

// ── 4) CSS：DEPRECATED 段到 navCell 之前
const cssStart = `/* ===== DEPRECATED: 设置面板全屏 =====`;
const cssEnd = `/* 设置导航项：略矮一点，归「减小圆角与间距」管 */`;
step((t) => {
  const a = t.indexOf(cssStart);
  const b = t.indexOf(cssEnd);
  if (a === -1 || b === -1 || b < a) return t;
  return t.slice(0, a) + t.slice(b);
}, 'CSS 全屏段');

// ── 5) CSS：dcc-settings-back 段
const backStart = `html[data-dcc-full="on"] .dcc-settings-back {`;
const backEnd = `\n/* ---------- 左上角品牌区 ---------- */`;
step((t) => {
  const a = t.indexOf(backStart);
  const b = t.indexOf(backEnd);
  if (a === -1 || b === -1 || b < a) return t;
  return t.slice(0, a) + t.slice(b + 1);
}, 'CSS 自绘返回按钮');

// ── 6) JS 模块（注释 + 函数体）
step((t) => {
  const marker = `    /**
     * DEPRECATED: 随「设置面板全屏」开关一并移除。`;
  const a = t.indexOf(marker);
  if (a === -1) return t;
  // 从 a 开始找函数结束：第一个行首为 4 空格 + } 的行
  const rest = t.slice(a);
  const lines = rest.split('\n');
  let depth = 0;
  let endLine = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
    if (depth === 0 && line === '    }' && i > 5) { endLine = i; break; }
  }
  if (endLine === -1) return t;
  const after = lines.slice(endLine + 1).join('\n');
  return t.slice(0, a) + after;
}, 'JS installSettingsBackButton 模块');

// ── 7) 设置项
step((t) => {
  const marker = `            /* DEPRECATED: 宿主 v0.2.2-rc5 起内置全屏，此项将在下一版移除 */
`;
  return t.replace(marker, '');
}, '设置项注释');

step((t) => `x`, '占位');

fs.writeFileSync(file, s);
console.log('完成');
