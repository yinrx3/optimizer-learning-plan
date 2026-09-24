// verify-web.js
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const WEB = path.join(ROOT, 'web');
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sections.json'), 'utf8'));

const read = (p) => fs.readFileSync(p, 'utf8');
const count = (s, re) => (s.match(re) || []).length;
const D = String.fromCharCode(36);

console.log('=== 顶层页面 ===');
for (const f of ['index.html', 'sections.html', 'learning-plan.html', 'survey.html']) {
  const p = path.join(WEB, f);
  if (!fs.existsSync(p)) { console.log('  ❌ 缺 ' + f); continue; }
  const x = read(p);
  console.log('  ' + f.padEnd(20) + (fs.statSync(p).size + ' B').padStart(11)
    + '  table=' + String(count(x, /<table/g)).padStart(3)
    + '  math=' + String(count(x, /<span class="math/g)).padStart(4)
    + '  裸$=' + count(x, new RegExp('\\' + D, 'g')));
}

console.log('');
console.log('=== 板块锚点（learning-plan.html）===');
const lp = read(path.join(WEB, 'learning-plan.html'));
let okAnchor = 0;
S.forEach((s, i) => {
  const has = lp.includes('id="sec-' + s.from + '"');
  if (has) okAnchor++; else console.log('  ❌ 缺锚点 sec-' + s.from + '（板块 ' + (i + 1) + '）');
});
console.log('  锚点 ' + okAnchor + '/' + S.length);
console.log('  板块导航条目 ' + count(lp, /class="p" href="#sec-/g));
console.log('  附录锚点 ' + (lp.includes('id="sec-appendix"') ? '有' : '❌ 缺'));

console.log('');
console.log('=== 笔记页 ===');
let okNotes = 0;
for (const s of S) {
  const key = s.f.replace('.md', '');
  const p = path.join(WEB, 'notes', key + '.html');
  if (!fs.existsSync(p)) { console.log('  ❌ 缺 notes/' + key + '.html'); continue; }
  const x = read(p);
  const q = count(x, /<li>/g);
  const rows = count(x, /<tr>/g);
  okNotes++;
  console.log('  notes/' + key.padEnd(10) + (fs.statSync(p).size + ' B').padStart(9) + '  表格行=' + String(rows).padStart(3) + '  li=' + String(q).padStart(3));
}
console.log('  笔记页 ' + okNotes + '/' + S.length);
const ni = path.join(WEB, 'notes', 'index.html');
console.log('  合订页 ' + (fs.existsSync(ni) ? (fs.statSync(ni).size + ' B') : '❌ 缺'));

console.log('');
console.log('=== 链接可达性（站内） ===');
const pages = ['index.html', 'sections.html', 'learning-plan.html', 'survey.html', 'notes/index.html'];
const bad = [];
for (const f of pages) {
  const dir = path.dirname(path.join(WEB, f));
  const x = read(path.join(WEB, f));
  for (const m of x.matchAll(/href="(?!https?:|mailto:|#)([^"]+)"/g)) {
    const href = m[1].split('#')[0];
    if (!href) continue;
    const t = path.resolve(dir, href);
    if (!fs.existsSync(t)) bad.push(f + ' -> ' + m[1]);
  }
}
console.log(bad.length ? '  ❌ 断链 ' + bad.length + ' 处:\n    ' + bad.slice(0, 14).join('\n    ') : '  ✅ 无断链');
