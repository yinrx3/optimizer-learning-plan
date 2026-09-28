// dump-questions.js —— 列出每个检查点的自测题（解析规则与 rebuild-notes-v2.js 一致）
const fs = require('fs');
const P = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md';
const lines = fs.readFileSync(P, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);

const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]\s*(.+?)\s*$/;
const Q = /^(\d+)\.\s+(.*)$/;
const BOLD = /^\*\*/;
const QUIZ_HEAD = /自测|面试|必须能回答的一问/;
const TAIL_HEAD = /核心验收标准|三条贯穿全表的主线|如果只能记住一句话|最后：动手清单自检/;

let cur = null;
let inQ = false;
let n = 0;
const bad = [];
console.log('规则：自测类小标题进入取题；收尾标签或 ## 退出；其它粗体小标题不改变状态\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const c = line.match(CP);
  if (c) {
    if (cur) console.log('   └ 共 ' + n + ' 题\n');
    cur = '检查点 ' + c[1] + '｜' + c[2];
    n = 0; inQ = false;
    console.log('■ ' + cur + '（L' + (i + 1) + '）');
    continue;
  }
  if (!cur) continue;
  if (/^##\s/.test(line)) { inQ = false; continue; }
  if (BOLD.test(line)) {
    if (QUIZ_HEAD.test(line)) inQ = true;
    else if (TAIL_HEAD.test(line)) inQ = false;
    continue;
  }
  if (!inQ) continue;
  const q = line.match(Q);
  if (!q) continue;
  n++;
  if (+q[1] !== n) bad.push('L' + (i + 1) + ' 题号 ' + q[1] + ' 应为 ' + n);
  console.log('   ' + String(q[1]).padStart(2) + '. ' + q[2].split('**').join('').slice(0, 56));
}
if (cur) console.log('   └ 共 ' + n + ' 题');
console.log('');
console.log(bad.length ? '❌ 编号错误:\n  ' + bad.join('\n  ') : '✅ 所有检查点题号连续');
