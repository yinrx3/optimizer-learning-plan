// locate3.js —— 追踪 3 道被删题目的下落
const fs = require('fs');
const path = require('path');
const NOTES = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\notes';
const targets = [
  ['① Adam 显存算术（检查点1 第10题）', /7B 模型[\s\S]{0,40}显存|显存是硬约束/],
  ['② ZO 与显存墙（检查点1 第12题）', /ZO 方法的复兴|零阶[\s\S]{0,20}显存墙/],
  ['③ 显存是硬约束：砍激活还是砍状态（检查点1 第11题）', /先砍激活值还是先砍优化器状态/],
];
console.log('=== 这三道题现在在哪个 notes 文件里 ===');
for (const [name, re] of targets) {
  const hits = [];
  for (const f of fs.readdirSync(NOTES).filter((x) => x.endsWith('.md'))) {
    const t = fs.readFileSync(path.join(NOTES, f), 'utf8');
    if (re.test(t)) hits.push(f);
  }
  console.log('  ' + name);
  console.log('     -> ' + (hits.length ? hits.join(', ') : '❌ 不在任何 notes 里'));
}
console.log('');
console.log('=== 总表里是否还有 ZO 与显存墙这条 ===');
const plan = fs.readFileSync('C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md', 'utf8');
const i = plan.indexOf('延伸（留到材料 91 零阶优化再答）');
console.log(i >= 0 ? '  有（但已降级为不编号的提示）：\n    ' + plan.slice(i, i + 130).replace(/\n/g, ' ') : '  ❌ 没了');
