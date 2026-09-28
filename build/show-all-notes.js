// show-all-notes.js —— 完整列出每个 notes 文件的题目
const fs = require('fs');
const path = require('path');
const NOTES = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\notes';
const files = fs.readdirSync(NOTES).filter((f) => f.endsWith('.md')).sort((a, b) => parseInt(a) - parseInt(b));
for (const f of files) {
  const t = fs.readFileSync(path.join(NOTES, f), 'utf8');
  const sec = t.split('## 自测')[1] || '';
  const re = new RegExp('^(\\d+)\\.\\s+(.*)$', 'gm');
  const qs = [];
  let m;
  while ((m = re.exec(sec)) !== null) qs.push(m[1] + '. ' + m[2]);
  console.log('■ ' + f + '（' + qs.length + ' 题）');
  qs.forEach((q) => console.log('   ' + q.slice(0, 92)));
  console.log('');
}
