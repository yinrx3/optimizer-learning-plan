// dump-questions.js —— 列出每个检查点的自测题，检查编号与归属
const fs = require('fs');
const P = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md';
const lines = fs.readFileSync(P, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]\s*(.+?)\s*$/;
const Q = /^(\d+)\.\s+(.*)$/;

let cur = null;
let n = 0;
const bad = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(CP);
  if (m) {
    if (cur) console.log('   └ 共 ' + n + ' 题\n');
    cur = '检查点 ' + m[1] + '｜' + m[2];
    n = 0;
    console.log('■ ' + cur + '（L' + (i + 1) + '）');
    continue;
  }
  if (!cur) continue;
  const q = lines[i].match(Q);
  if (q) {
    n++;
    if (+q[1] !== n) bad.push('L' + (i + 1) + ' 题号 ' + q[1] + ' 应为 ' + n);
    // 只打印题号 + 前 58 字
    console.log('   ' + String(q[1]).padStart(2) + '. ' + q[2].replace(/\*\*/g, '').slice(0, 58));
  }
}
if (cur) console.log('   └ 共 ' + n + ' 题');
console.log('');
console.log(bad.length ? '❌ 编号错误:\n  ' + bad.join('\n  ') : '✅ 所有检查点题号连续');
