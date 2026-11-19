const fs = require('fs');
const s = fs.readFileSync('client.js', 'utf8');
const css = s.match(/const css = `([\s\S]*?)`;/)[1];

// 我们的属性前缀
const mine = /^data-(dcc-|dsh-boot|conversation-tabs|conversation-scroll|conversation-region|sidebar-|context-menu-trigger|favorited|signed-out|collapsed|active|href|changed-files|menu-phase|menu-material|closing|pinned|open|platform|windows-titlebar|ds-dark-theme)/;

const hosts = new Map();
for (const m of css.matchAll(/\[(data-[a-z-]+)/g)) {
  const attr = m[1];
  if (mine.test(attr)) continue;
  hosts.set(attr, (hosts.get(attr) || 0) + 1);
}

console.log('=== 待验证的宿主属性 (' + hosts.size + ') ===');
console.log([...hosts.keys()].join(' '));
console.log('');

// JS 里的选择器
const js = s.match(/const js[\s\S]*/)[0];
const jsAttrs = new Set();
for (const m of s.matchAll(/querySelector(?:All)?\('([^']+)'\)/g)) {
  for (const a of m[1].matchAll(/\[(data-[a-z-]+)/g)) {
    if (!/^data-dcc-/.test(a[1])) jsAttrs.add(a[1]);
  }
}
console.log('=== JS 里用到的宿主属性 (' + jsAttrs.size + ') ===');
console.log([...jsAttrs].join(' '));
