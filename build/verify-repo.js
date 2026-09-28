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
  const md = fs2.filter((f) => f.endsWith('.md'));
  const html = fs2.filter((f) => f.endsWith('.html'));
  console.log('  md ' + md.length + ' 个，html ' + html.length + ' 个（应为 md 数 + 1 个合订页）');
  // 内容一致性：仓库里的 notes md 必须与工作区逐字节一致
  // （曾出现"推送成功但线上仍是旧版"的情况，靠这个校验定位）
  const srcDir = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\notes';
  if (fs.existsSync(srcDir)) {
    let diff = 0;
    for (const f of md) {
      const a = path.join(notesDir, f);
      const b = path.join(srcDir, f);
      if (!fs.existsSync(b)) { bad.push('工作区缺 ' + f); continue; }
      if (fs.readFileSync(a, 'utf8') !== fs.readFileSync(b, 'utf8')) { diff++; bad.push('内容不一致: ' + f); }
    }
    console.log('  与工作区逐字节一致: ' + (md.length - diff) + '/' + md.length);
  }
  if (html.length !== md.length + 1) bad.push('notes html 数量应为 md 数 + 1（合订页），实为 ' + html.length);
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
