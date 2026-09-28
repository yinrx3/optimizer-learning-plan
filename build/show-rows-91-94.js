// show-rows-91-94.js
const fs = require('fs');
const plan = fs.readFileSync('C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md', 'utf8').replace(/^\uFEFF/, '');
const BT = String.fromCharCode(96);
for (const line of plan.split(/\r?\n/)) {
  const m = line.match(/^\|\s*(?:<!--SEC:\d+-->)?\s*\*\*(9[1-4])\*\*\s*\|/);
  if (!m) continue;
  const cells = line.trim().replace(/^\||\|$/g, '').split('|');
  const clean = (s) => (s || '').split('**').join('').split(BT).join('').trim();
  console.log('行 ' + m[1]);
  console.log('  材料: ' + clean(cells[1]));
  console.log('  在哪: ' + clean(cells[2]));
  console.log('  学什么: ' + clean(cells[3]).slice(0, 320));
  console.log('');
}
