// tweak-home.js —— 修首页过时计数与 notes 文案
const fs = require('fs');
const p = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\build-web.js';
let t = fs.readFileSync(p, 'utf8');
const reps = [
  ['235 道自测题', '234 道自测题'],
  ['按同样 15 个板块组织的空白笔记，每篇只放该范围的材料清单与自测题。',
   '按同样 15 个板块组织的笔记，每篇只放该范围的材料清单与自测题（题目已按前置材料归位）。'],
  ['<div class="n">15 篇 ｜ 与计划板块一一对应</div>',
   '<div class="n">15 篇 + 综述阅读路线 + 终测 ｜ 与计划板块一一对应</div>'],
];
let n = 0;
for (const [a, b] of reps) {
  if (t.includes(a)) { t = t.split(a).join(b); n++; }
  else console.log('未匹配: ' + a.slice(0, 44));
}
fs.writeFileSync(p, t, 'utf8');
console.log('已替换 ' + n + '/' + reps.length + ' 处');
