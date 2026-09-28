// trace-parse.js —— 跟踪解析器对检查点 19/20 的取题结果
const fs = require('fs');
const plan = fs.readFileSync('C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md', 'utf8').replace(/^\uFEFF/, '');
const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]\s*(.+?)\s*$/;
const Q = /^(\d+)\.\s+(.*)$/;
const HEAD = /^\*\*(自测|面试级问题|进阶自测|必须能回答的一问|关于 MaxRL 的追加自测)[^*]*\*\*\s*$/;
const OTHER_BOLD = /^\*\*[^*]+\*\*\s*$/;
const cps = [];
let cur = null;
let ln = 0;
for (const line of plan.split(/\r?\n/)) {
  ln++;
  const c = line.match(CP);
  if (c) { cur = { no: +c[1], title: c[2], qs: [], inQuiz: false, hasQuiz: false }; cps.push(cur); continue; }
  if (!cur) continue;
  if (HEAD.test(line)) { cur.inQuiz = true; cur.hasQuiz = true; if (cur.no >= 19) console.log('L' + ln + ' HEAD -> cp' + cur.no); continue; }
  if (cur.inQuiz && OTHER_BOLD.test(line)) { cur.inQuiz = false; if (cur.no >= 19) console.log('L' + ln + ' OTHER_BOLD -> cp' + cur.no + ' 退出取题: ' + line.slice(0, 40)); continue; }
  if (!cur.inQuiz) continue;
  const q = line.match(Q);
  if (q) { cur.qs.push({ n: +q[1], t: q[2] }); if (cur.no >= 19) console.log('L' + ln + ' Q' + q[1] + ' -> cp' + cur.no + ': ' + q[2].slice(0, 60)); }
}
console.log('');
for (const c of cps.filter((x) => x.no >= 19)) {
  console.log('检查点 ' + c.no + ': hasQuiz=' + c.hasQuiz + ' 取到 ' + c.qs.length + ' 道');
  c.qs.forEach((q) => console.log('   ' + q.n + '. ' + q.t.slice(0, 70)));
}
