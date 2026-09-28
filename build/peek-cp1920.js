// peek-cp1920.js
const fs = require('fs');
const L = fs.readFileSync('C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md', 'utf8')
  .replace(/^\uFEFF/, '').split(/\r?\n/);
const s = L.findIndex((l) => /^###\s*⛳\s*检查点 19[｜|]/.test(l));
const e = L.findIndex((l, i) => i > s && /^###\s*⛳\s*检查点 20[｜|]/.test(l));
const e2 = L.findIndex((l, i) => i > e && /^##\s/.test(l));
console.log('检查点 19: L' + (s + 1) + ' .. L' + e + '   检查点 20: L' + (e + 1) + ' .. L' + (e2 < 0 ? L.length : e2));
console.log('');
console.log('=== 检查点 19 里所有形如 "N. " 的行 ===');
for (let i = s; i < e; i++) if (/^\d+\.\s/.test(L[i])) console.log('  L' + (i + 1) + ': ' + L[i].slice(0, 80));
console.log('');
console.log('=== 检查点 20 里所有形如 "N. " 的行 ===');
for (let i = e; i < (e2 < 0 ? L.length : e2); i++) if (/^\d+\.\s/.test(L[i])) console.log('  L' + (i + 1) + ': ' + L[i].slice(0, 80));
console.log('');
console.log('=== 检查点 20 里的粗体标题行 ===');
for (let i = e; i < (e2 < 0 ? L.length : e2); i++) if (/^\*\*/.test(L[i])) console.log('  L' + (i + 1) + ': ' + L[i].slice(0, 70));
