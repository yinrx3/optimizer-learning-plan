// verify-plan.js —— 校验整合后的学习计划（CRLF 安全）
const fs = require('fs');
const P = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md';
const raw = fs.readFileSync(P, 'utf8').replace(/^\uFEFF/, '');
const lines = raw.split(/\r?\n/);
const issues = [];

// 1) 表格结构
let tables = 0, tableErr = 0;
let i = 0;
while (i < lines.length) {
  if (lines[i].trimStart().startsWith('|')) {
    const start = i; const rows = [];
    while (i < lines.length && lines[i].trimStart().startsWith('|')) { rows.push(lines[i]); i++; }
    tables++;
    const c0 = rows[0].trim().replace(/^\||\|$/g, '').split('|').length;
    const isSep = rows.length >= 2 && /^\s*\|[\s\-:|]+\|\s*$/.test(rows[1]);
    if (!isSep) { tableErr++; issues.push('表@L' + (start + 1) + ' 缺表头分隔行（' + rows.length + ' 行）'); }
    for (let r = 0; r < rows.length; r++) {
      if (r === 1 && isSep) continue;
      const c = rows[r].trim().replace(/^\||\|$/g, '').split('|').length;
      if (c !== c0) { tableErr++; issues.push('表@L' + (start + 1 + r) + ' 列数 ' + c + ' != ' + c0); }
    }
  } else i++;
}

// 2) 定界符
let oddDollar = 0, oddTick = 0, pipeInCell = 0, dblDollar = 0;
lines.forEach((l, n) => {
  const d = (l.match(/(?<!\\)\$/g) || []).length;
  if (d % 2 !== 0) { oddDollar++; issues.push('L' + (n + 1) + ' 奇数$: ' + l.trim().slice(0, 80)); }
  const tk = (l.match(/`/g) || []).length;
  if (tk % 2 !== 0) { oddTick++; issues.push('L' + (n + 1) + ' 奇数反引号: ' + l.trim().slice(0, 80)); }
  if (l.trimStart().startsWith('|') && /\\\|/.test(l)) { pipeInCell++; issues.push('L' + (n + 1) + ' 表格内 \\|'); }
  if (/\$\$/.test(l)) { dblDollar++; issues.push('L' + (n + 1) + ' 出现 $$'); }
});

// 3) 检查点编号
const cps = [];
lines.forEach((l, n) => {
  const m = l.match(/^###\s*⛳\s*检查点\s*(\d+)[｜|](.+?)\s*$/);
  if (m) cps.push({ no: +m[1], txt: m[2], line: n + 1 });
});
const nums = cps.map(c => c.no);
const seq = nums.length > 0 && nums.every((v, k) => v === k + 1);

// 4) 内部行号引用
const refs = [];
lines.forEach((l, n) => {
  for (const m of l.matchAll(/第\s*(\d+)(?:[-–](\d+))?\s*行/g)) refs.push({ line: n + 1, a: +m[1], b: m[2] ? +m[2] : +m[1] });
});
const badRefs = refs.filter(r => r.a > 94 || r.b > 94);

// 5) 检查点交叉引用（"检查点 N"）
const xrefs = new Set();
lines.forEach(l => { for (const m of l.matchAll(/检查点\s*(\d+)/g)) xrefs.add(+m[1]); });
const badX = [...xrefs].filter(x => x < 1 || x > cps.length);

// 6) 综述区块统计
const surveyMarks = (raw.match(/综述/g) || []).length;

console.log('=== 规模 ===');
console.log('总行数 ' + lines.length + ' | 字符数 ' + raw.length);
console.log('表格 ' + tables + ' 个，结构错误 ' + tableErr);
console.log('检查点 ' + cps.length + ' 个 | 编号连续: ' + (seq ? '是' : '否 -> ' + nums.join(',')));
console.log('');
console.log('=== 定界符 ===');
console.log('奇数$行 ' + oddDollar + ' | 奇数反引号行 ' + oddTick + ' | 表格内\\| ' + pipeInCell + ' | $$ ' + dblDollar);
console.log('');
console.log('=== 内部引用体检 ===');
console.log('引用总表行号 ' + refs.length + ' 处 | 越界(>94) ' + badRefs.length);
if (badRefs.length) badRefs.slice(0, 10).forEach(r => console.log('   L' + r.line + ' -> 第 ' + r.a + '-' + r.b + ' 行'));
console.log('检查点交叉引用 ' + xrefs.size + ' 个 | 越界 ' + badX.length + (badX.length ? ' -> ' + badX.join(',') : ''));
console.log('');
console.log('=== 检查点清单 ===');
cps.forEach(c => console.log('  L' + c.line + '  ' + c.no + '. ' + c.txt));
console.log('');
console.log('提到「综述」共 ' + surveyMarks + ' 处');
console.log('');
console.log('=== 问题明细 (前 25) ===');
issues.slice(0, 25).forEach(x => console.log('  ' + x));
console.log('问题总数 ' + issues.length);
