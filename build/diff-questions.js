// diff-questions.js —— 比对 ba1ba2c（上次推送）与当前版本的题目，找出被删/新增
const { execFileSync } = require('child_process');
const fs = require('fs');
const G = 'C:\\Users\\yinrx\\optimizer-learning-plan';
const CUR = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md';

// 用 PowerShell 取旧版本（node 无法 spawn git 之外的东西；git 自身可以）
function gitShow(rev, file) {
  return execFileSync('git', ['-C', G, 'show', rev + ':' + file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]\s*(.+?)\s*$/;
const Q = /^(\d+)\.\s+(.*)$/;
const HEAD = /^\*\*(自测|面试级问题|进阶自测|必须能回答的一问|关于 MaxRL 的追加自测)[^*]*\*\*\s*$/;
const OTHER_BOLD = /^\*\*[^*]+\*\*\s*$/;

function parse(text) {
  const out = [];
  let cp = null, inQ = false;
  for (const line of text.split(/\r?\n/)) {
    const c = line.match(CP);
    if (c) { cp = '检查点' + c[1]; inQ = false; continue; }
    if (/^##\s/.test(line)) { inQ = false; continue; }
    if (HEAD.test(line)) { inQ = true; continue; }
    if (inQ && OTHER_BOLD.test(line)) { inQ = false; continue; }
    if (!inQ) continue;
    const q = line.match(Q);
    if (q) out.push({ cp, n: +q[1], t: q[2].trim() });
  }
  return out;
}

let oldText;
try { oldText = gitShow('ba1ba2c', '学习与追踪清单.md'); }
catch (e) { console.log('取旧版本失败: ' + e.message); process.exit(1); }
const curText = fs.readFileSync(CUR, 'utf8');

const oldQ = parse(oldText);
const curQ = parse(curText);
console.log('ba1ba2c: ' + oldQ.length + ' 题    当前: ' + curQ.length + ' 题');
console.log('');

const curSet = new Set(curQ.map((q) => q.t));
const oldSet = new Set(oldQ.map((q) => q.t));

const removed = oldQ.filter((q) => !curSet.has(q.t));
const added = curQ.filter((q) => !oldSet.has(q.t));

console.log('=== 只在旧版存在（被删或改写过）: ' + removed.length + ' 条 ===');
removed.forEach((q) => console.log('  [' + q.cp + '] ' + q.t.slice(0, 120)));
console.log('');
console.log('=== 只在当前版本存在（新增或改写后）: ' + added.length + ' 条 ===');
added.forEach((q) => console.log('  [' + q.cp + '] ' + q.t.slice(0, 120)));
