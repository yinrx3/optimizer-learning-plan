// sync-repo.js —— 把工作区内容同步到发布仓库（仓库为扁平布局）
const fs = require('fs');
const path = require('path');
const SRC = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const DST = 'C:\\Users\\yinrx\\optimizer-learning-plan';

// 发布仓库是【扁平布局】：网页放在仓库根目录，不是 web/ 子目录
function copyFile(rel, destRel) {
  const s = path.join(SRC, rel);
  const d = path.join(DST, destRel || rel);
  if (!fs.existsSync(s)) { console.log('  跳过（源不存在）: ' + rel); return false; }
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.copyFileSync(s, d);
  console.log('  ' + (destRel || rel) + '  (' + fs.statSync(d).size + ' B)');
  return true;
}

function copyDir(rel, destRel) {
  const s = path.join(SRC, rel);
  const d = path.join(DST, destRel || rel);
  let n = 0;
  const walk = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
      const f = path.join(from, e.name);
      const t = path.join(to, e.name);
      if (e.isDirectory()) walk(f, t);
      else { fs.copyFileSync(f, t); n++; }
    }
  };
  walk(s, d);
  console.log('  ' + (destRel || rel) + '/  (' + n + " 个文件)");
}

console.log('=== 网页（web/* -> 仓库根目录）===');
for (const f of ['index.html', 'sections.html', 'learning-plan.html', 'learning-materials.html', 'survey.html']) copyFile('web/' + f, f);
for (const d of ['notes', 'assets', 'katex']) copyDir('web/' + d, d);

console.log('\n=== Markdown 源 ===');
for (const f of ['学习与追踪清单.md', '学习材料.md', '学习计划索引.md', '综述精读-优化方法演化.md', 'README.md']) copyFile(f);

console.log('\n=== 构建脚本 ===');
for (const f of ['build-web.js', 'build-all.ps1', 'math-to-span.lua']) copyFile(f);
for (const f of fs.readdirSync(path.join(SRC, 'build'))) {
  if (!f.endsWith('.js') && !f.endsWith('.json') && !f.endsWith('.md')) continue;
  copyFile('build/' + f);
}
console.log('\n同步完成 -> ' + DST);
