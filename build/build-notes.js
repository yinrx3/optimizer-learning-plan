// build-notes.js —— 生成 notes/ 下的分表笔记文件（只含材料清单 + 对应题目）
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const PLAN = path.join(ROOT, '学习与追踪清单.md');
const OUT = path.join(ROOT, 'notes');
fs.mkdirSync(OUT, { recursive: true });

const lines = fs.readFileSync(PLAN, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);

// ---------- 1) 解析总表行 ----------
const rows = [];  // {no, title, where, line}
const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]\s*(.+?)\s*$/;
const ROW = /^\|\s*\*\*(\d+[a-f]?)\*\*\s*\|/;
const Q = /^(\d+)\.\s+(.*)$/;

const clean = (s) => s.split('**').join('').split(String.fromCharCode(96)).join('').trim();

const checkpoints = [];  // {no, title, line, qs:[]}
let cur = null;
lines.forEach((l, i) => {
  const c = l.match(CP);
  if (c) {
    cur = { no: +c[1], title: c[2], line: i + 1, qs: [] };
    checkpoints.push(cur);
    return;
  }
  if (cur) {
    const q = l.match(Q);
    if (q) cur.qs.push({ n: +q[1], text: q[2] });
  }
  const r = l.match(ROW);
  if (r) {
    // 完整标题：去掉首列后，取第 2 个单元格（由第一个 | 到第二个 | 之间）
    let title = '';
    const parts = l.split('|');
    if (parts.length >= 3) title = clean(parts[2]);
    rows.push({ no: r[1], title: title, line: i + 1 });
  }
});

console.log('解析：材料行 ' + rows.length + '，检查点 ' + checkpoints.length + '（题目 ' + checkpoints.reduce((a, c) => a + c.qs.length, 0) + '）');

// ---------- 2) 分表定义 ----------
const SECTIONS = [
  { f: '1-9.md',   name: '基础：优化问题与 SGD 的定位',               from: 1,  to: 9,  cps: [1] },
  { f: '10-13.md', name: '动量',                                     from: 10, to: 13, cps: [2] },
  { f: '14-17.md', name: '自适应步长：AdaGrad / sign-SGD / RMSProp', from: 14, to: 17, cps: [3] },
  { f: '18-27.md', name: 'Adam、AdamW 与收敛性之争',                 from: 18, to: 27, cps: [4, 5, 6] },
  { f: '28-30.md', name: '三篇待处理的论文（综述 / Adam 动力学 / 加速 SGD）', from: 28, to: 30, cps: [7, 8] },
  { f: '31-37.md', name: '学习率调度与 warmup',                       from: 31, to: 37, cps: [9] },
  { f: '38-46.md', name: 'μP、超参迁移与有效学习率',                  from: 38, to: 46, cps: [10] },
  { f: '47-52.md', name: '优化器设计 = 不同范数下的最速下降',          from: 47, to: 52, cps: [11] },
  { f: '53-58.md', name: 'Shampoo、K-FAC 与 Muon 的实现',            from: 53, to: 58, cps: [12] },
  { f: '59-65.md', name: '正交化的理论、Hyperball 与争论',            from: 59, to: 65, cps: [13] },
  { f: '66-70.md', name: '苏炜杰的两篇与导师论文',                    from: 66, to: 70, cps: [14, 15] },
  { f: '71-78.md', name: 'Scaling Law',                              from: 71, to: 78, cps: [16] },
  { f: '79-86.md', name: '强化学习：从 GAE 到 DAPO / MaxRL',          from: 79, to: 86, cps: [17] },
  { f: '87-90.md', name: '训练不稳定性与 RL 目标设计',                from: 87, to: 90, cps: [18] },
  { f: '91-94.md', name: '零阶优化与函数空间的牛顿法',                from: 91, to: 94, cps: [19, 20] },
];

// ---------- 3) 生成 ----------
const J = (a) => a.join('\n');
const created = [];
for (const s of SECTIONS) {
  const sel = rows.filter((r) => {
    const base = parseInt(r.no, 10);
    return base >= s.from && base <= s.to;
  });
  const cps = s.cps.map((n) => checkpoints.find((c) => c.no === n)).filter(Boolean);

  const out = [];
  out.push('# ' + s.f.replace('.md', '') + '｜' + s.name);
  out.push('');
  out.push('> 材料 ' + s.from + '–' + s.to + '　｜　对应检查点 ' + s.cps.join('、'));
  out.push('');
  out.push('## 材料');
  out.push('');
  out.push('| # | 材料 | 在哪 |');
  out.push('|:-:|------|------|');
  for (const r of sel) out.push('| **' + r.no + '** | ' + r.title + ' | 总表第 ' + r.no + ' 行 |');
  out.push('');
  for (const c of cps) {
    out.push('## ⛳ 检查点 ' + c.no + '｜' + c.title);
    out.push('');
    if (!c.qs.length) { out.push('（本题组无编号题）'); out.push(''); continue; }
    for (const q of c.qs) out.push(q.n + '. ' + q.text);
    out.push('');
  }
  const file = path.join(OUT, s.f);
  fs.writeFileSync(file, J(out), 'utf8');
  created.push({ f: s.f, rows: sel.length, qs: cps.reduce((a, c) => a + c.qs.length, 0), bytes: fs.statSync(file).size });
}
console.log('');
created.forEach((c) => console.log('  ' + c.f.padEnd(12) + ' 材料 ' + String(c.rows).padStart(2) + ' 条  题目 ' + String(c.qs).padStart(3) + ' 道  ' + c.bytes + ' B'));
console.log('');
console.log('合计：材料 ' + created.reduce((a, c) => a + c.rows, 0) + ' 条，题目 ' + created.reduce((a, c) => a + c.qs, 0) + ' 道');
