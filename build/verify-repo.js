// verify-repo.js —— 校验 git 仓库里的静态站
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || 'C:\\Users\\yinrx\\optimizer-learning-plan';
const pages = ['index.html', 'sections.html', 'learning-plan.html', 'survey.html', 'notes/index.html'];
const bad = [];
const D = String.fromCharCode(36);

console.log('=== 页面 ===');
for (const f of pages) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { bad.push('缺页面 ' + f); continue; }
  const x = fs.readFileSync(p, 'utf8');
  const size = fs.statSync(p).size;
  const nd = x.split(D).length - 1;
  const tables = (x.match(/<table/g) || []).length;
  console.log('  ' + f.padEnd(22) + (size + ' B').padStart(10) + '  table=' + String(tables).padStart(3) + '  裸' + D + '=' + nd);
  const dir = path.dirname(p);
  for (const m of x.matchAll(/href="(?!https?:|mailto:|#)([^"]+)"/g)) {
    const href = m[1].split('#')[0];
    if (!href) continue;
    const t = path.resolve(dir, href);
    if (!fs.existsSync(t)) bad.push(f + ' -> ' + m[1]);
  }
  if (nd) bad.push(f + ' 有裸 ' + D + ' ' + nd + ' 处');
}

console.log('');
console.log('=== notes/ ===');
const notesDir = path.join(ROOT, 'notes');
if (fs.existsSync(notesDir)) {
  const fs2 = fs.readdirSync(notesDir);
  const md = fs2.filter((f) => f.endsWith('.md')).length;
  const html = fs2.filter((f) => f.endsWith('.html')).length;
  console.log('  md ' + md + ' 个，html ' + html + ' 个');
  if (md !== 15) bad.push('notes md 数量应为 15，实为 ' + md);
  if (html !== 16) bad.push('notes html 数量应为 16，实为 ' + html);
} else bad.push('缺 notes/ 目录');

console.log('');
console.log('=== 顶层文件 ===');
for (const f of ['学习与追踪清单.md', '综述精读-优化方法演化.md', '学习计划索引.md', 'README.md', 'build-web.js', 'build-all.ps1', 'math-to-span.lua']) {
  const p = path.join(ROOT, f);
  console.log('  ' + (fs.existsSync(p) ? '✓' : '✗') + ' ' + f + (fs.existsSync(p) ? '  ' + fs.statSync(p).size + ' B' : ''));
  if (!fs.existsSync(p)) bad.push('缺 ' + f);
}

console.log('');
console.log(bad.length ? '❌ 问题 ' + bad.length + ' 处:\n  ' + bad.slice(0, 15).join('\n  ') : '✅ 全部通过');
