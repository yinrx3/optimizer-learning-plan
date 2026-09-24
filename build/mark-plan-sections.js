// mark-plan-sections.js —— 在学习计划的 md 里插入板块标记
// 关键约束：标记必须放在【表格单元格内部】。放在表头与数据行之间会打断
// pandoc 的表格解析——tbody 变空、数据行退化成 <div class="line-block"> 纯文本。
// 构建时（build-web.js）再把单元格内的 <!--SEC:N--> 展开成一行跨越全表的板块标题。
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const PLAN = path.join(ROOT, '学习与追踪清单.md');
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sections.json'), 'utf8'));

let lines = fs.readFileSync(PLAN, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);

// 幂等：先清掉所有旧标记（独立成行的、以及单元格内的）
lines = lines
  .filter((l) => !/^<!--SEC/.test(l.trim()))
  .map((l) => l.replace(/<!--SEC:\d+-->/g, '').replace(/<!--SEC-APPENDIX-->/g, ''));

const ROW = /^(\|\s*)\*\*(\d+[a-f]?)\*\*(\s*\|)/;
const wanted = new Set(S.map((s) => String(s.from)));
let inserted = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(ROW);
  if (!m) continue;
  if (!wanted.has(m[2])) continue;
  lines[i] = lines[i].replace(ROW, '$1<!--SEC:' + m[2] + '-->**' + m[2] + '**$3');
  inserted++;
}
// 附录标记：插在"兴趣支线"标题之前（该处不是表格，独立成行安全）
const ap = lines.findIndex((l) => /^##\s*兴趣支线/.test(l));
if (ap >= 0) lines.splice(ap, 0, '<!--SEC-APPENDIX-->');

fs.writeFileSync(PLAN, lines.join('\n'), 'utf8');
console.log('插入板块标记 ' + inserted + ' 个（单元格内）+ 附录 ' + (ap >= 0 ? 1 : 0) + ' 个');
if (inserted !== S.length) console.log('⚠ 期望 ' + S.length + ' 个，实际 ' + inserted);
