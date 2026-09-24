// mark-plan-sections.js —— 在学习计划的 md 里插入板块标记
// 规则：每个板块的第一条材料行之前插 <!--SEC:N-->；"兴趣支线"标题之前插 <!--SEC-APPENDIX-->
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const PLAN = path.join(ROOT, '学习与追踪清单.md');
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sections.json'), 'utf8'));

let lines = fs.readFileSync(PLAN, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);

// 先清掉旧标记（幂等）
lines = lines.filter((l) => !/^<!--SEC/.test(l.trim()));

const ROW = /^\|\s*\*\*(\d+[a-f]?)\*\*\s*\|/;
const wanted = new Map(S.map((s) => [String(s.from), s]));
let inserted = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(ROW);
  if (!m) continue;
  if (wanted.has(m[1])) {
    // 标记必须插在"整个表格块之前"（表格块 = 连续的 | 行，含表头与分隔行），
    // 否则会切断表格（表头与数据行被注释分开）
    let at = i;
    while (at - 1 >= 0 && lines[at - 1].trimStart().startsWith('|')) at--;
    while (at - 1 >= 0 && lines[at - 1].trim() === '') at--;
    lines.splice(at, 0, '<!--SEC:' + m[1] + '-->');
    i++;
    inserted++;
  }
}
// 附录标记
const ap = lines.findIndex((l) => /^##\s*兴趣支线/.test(l));
if (ap >= 0) { lines.splice(ap, 0, '<!--SEC-APPENDIX-->'); inserted++; }

fs.writeFileSync(PLAN, lines.join('\n'), 'utf8');
console.log('插入标记 ' + inserted + ' 个（含附录）');
if (inserted !== S.length + 1) console.log('⚠ 期望 ' + (S.length + 1) + ' 个，实际 ' + inserted);
