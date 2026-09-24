// check-tables.js —— 检查学习计划页的表格是否完整渲染
const fs = require('fs');
const P = process.argv[2] || 'C:\\Users\\yinrx\\Desktop\\carefulreading\\web\\learning-plan.html';
const x = fs.readFileSync(P, 'utf8');
const n = (re) => (x.match(re) || []).length;

console.log('文件: ' + P);
console.log('  大小        : ' + fs.statSync(P).size + ' B');
console.log('  <table>     : ' + n(/<table/g));
console.log('  <tbody>     : ' + n(/<tbody/g));
console.log('  <tr>        : ' + n(/<tr>/g));
console.log('  <td>        : ' + n(/<td[ >]/g));
console.log('  line-block  : ' + n(/class="line-block"/g) + '   <-- 必须为 0');
console.log('  sec-row     : ' + n(/class="sec-row"/g) + '   <-- 应为 15');
console.log('  sec-anchor  : ' + n(/class="sec-anchor"/g) + '   <-- 应为 16（含附录）');
console.log('');

// tbody 是否为空的检测：<tbody> 后紧跟 </tbody>
const emptyTb = n(/<tbody>\s*<\/tbody>/g);
console.log('  空 tbody    : ' + emptyTb + '   <-- 必须为 0');
console.log('');

// 材料行是否完整（应为 99 + 28b..28f 共 105 行带编号的强标记；这里只数 <strong>数字</strong>）
const numStrong = n(/<strong>\d+[a-f]?<\/strong>/g);
console.log('  编号强标记  : ' + numStrong + '   <-- 不应为 0（曾因整行替换被吞掉）');
console.log('');

// 首个数据行是否真的在 <td> 里
const i = x.indexOf('<strong>1</strong>');
if (i >= 0) {
  const seg = x.slice(Math.max(0, i - 80), i);
  console.log('首个材料行的容器: ' + JSON.stringify(x.slice(Math.max(0, i - 60), i + 30)));
  console.log('  在 <td> 内: ' + (seg.includes('<td') ? '是 ✔' : '否 ❌'));
} else {
  console.log('未找到材料行 "1" ❌');
}
console.log('');
console.log('=== 结论 ===');
const okAll = n(/class="line-block"/g) === 0 && emptyTb === 0 && n(/class="sec-row"/g) === 15;
console.log(okAll ? '✅ 表格渲染正常' : '❌ 表格仍有问题');
