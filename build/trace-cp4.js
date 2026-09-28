// trace-cp4.js —— 跟踪检查点 4 的取题过程
const fs = require('fs');
const plan = fs.readFileSync('C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md', 'utf8').replace(/^\uFEFF/, '');
const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]/;
const BOLD = /^\*\*/;
let cur = null, ln = 0, inQuiz = false, qs = [];
for (const line of plan.split(/\r?\n/)) {
  ln++;
  const c = line.match(CP);
  if (c) {
    if (cur === 4) break;
    cur = +c[1]; inQuiz = false; qs = [];
    continue;
  }
  if (cur !== 4) continue;
  if (/^##\s/.test(line)) { if (inQuiz) console.log('L' + ln + ' ## -> 退出'); inQuiz = false; continue; }
  if (BOLD.test(line)) {
    if (/自测|面试|必须能回答的一问/.test(line)) { inQuiz = true; console.log('L' + ln + ' 进入取题: ' + line.slice(0, 50)); }
    else if (qs.length > 0) { inQuiz = false; console.log('L' + ln + ' 退出取题: ' + line.slice(0, 50)); }
    else console.log('L' + ln + ' 保持状态（尚无题）: ' + line.slice(0, 50));
    continue;
  }
  const m = line.match(/^(\d+)\.\s+(.*)$/);
  if (m && inQuiz) { qs.push(+m[1]); console.log('L' + ln + ' 收题 ' + m[1] + ': ' + m[2].slice(0, 56)); }
}
console.log('');
console.log('检查点 4 最终取到: ' + qs.join(',') + '（共 ' + qs.length + '）');
