// show-premature.js —— 打印被标记的题面，判断真伪
const fs = require('fs');
const path = require('path');
const NOTES = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\notes';
const want = {
  '14-17.md': [8, 9],
  '18-27.md': [13],
  '47-52.md': [9, 24, 25],
};
for (const [f, nums] of Object.entries(want)) {
  const txt = fs.readFileSync(path.join(NOTES, f), 'utf8');
  const sec = txt.split('## 自测')[1] || '';
  console.log('=== ' + f + ' ===');
  const re = new RegExp('^(\\d+)\\.\\s+(.*)$', 'gm');
  let m;
  while ((m = re.exec(sec)) !== null) {
    if (nums.includes(+m[1])) console.log('  ' + m[1] + '. ' + m[2]);
  }
  console.log('');
}
