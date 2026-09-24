// make-index-md.js —— 生成「学习计划索引」md（按板块分目录），并顺带产出分节锚点表
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const OUTMD = path.join(ROOT, '学习计划索引.md');
const OUTJSON = path.join(ROOT, 'build', 'sections.json');

const S = [
  { f: '1-9.md',   name: '基础：优化问题与 SGD 的定位',               from: 1,  to: 9,  cps: [1] },
  { f: '10-13.md', name: '动量',                                     from: 10, to: 13, cps: [2] },
  { f: '14-17.md', name: '自适应步长：AdaGrad / sign-SGD / RMSProp', from: 14, to: 17, cps: [3] },
  { f: '18-27.md', name: 'Adam、AdamW 与收敛性之争',                 from: 18, to: 27, cps: [4, 5, 6] },
  { f: '28-30.md', name: '三篇待处理的论文（综述 / Adam 动力学 / 加速 SGD）', from: 28, to: 30, cps: [7, 8] },
  { f: '31-37.md', name: '学习率调度与 warmup',                       from: 31, to: 37, cps: [9] },
  { f: '38-46.md', name: 'μP、超参迁移与有效学习率',                  from: 38, to: 46, cps: [10] },
  { f: '47-52.md', name: '优化器设计 = 不同范数下的最速下降',          from: 47, to: 52, cps: [11] },
  { f: '53-58.md', name: 'Shampoo、K-FAC 与 Muon 的实现',            from: 53, to: 58, cps: [12] },
  { f: '59-65.md', name: '正交化的理论、Hyperball 与争论',            from: 59, to: 65, cps: [13] },
  { f: '66-70.md', name: '苏炜杰的两篇与导师论文',                    from: 66, to: 70, cps: [14, 15] },
  { f: '71-78.md', name: 'Scaling Law',                              from: 71, to: 78, cps: [16] },
  { f: '79-86.md', name: '强化学习：从 GAE 到 DAPO / MaxRL',          from: 79, to: 86, cps: [17] },
  { f: '87-90.md', name: '训练不稳定性与 RL 目标设计',                from: 87, to: 90, cps: [18] },
  { f: '91-94.md', name: '零阶优化与函数空间的牛顿法',                from: 91, to: 94, cps: [19, 20] },
];

fs.writeFileSync(OUTJSON, JSON.stringify(S, null, 2), 'utf8');

const J = (a) => a.join('\n');
const out = [];
out.push('# 学习计划索引（按板块）');
out.push('');
out.push('> 总表 99 条材料按阅读依赖切成 **15 个板块**。每个板块有：一份笔记文件（`notes/` 下）、若干自测检查点、以及一张「该读综述哪几节」的对照。');
out.push('> 完整材料表、检查点正文与讲解见 [`学习与追踪清单.md`](学习与追踪清单.md)。');
out.push('');
out.push('## 板块总览');
out.push('');
out.push('| 板块 | 范围 | 主题 | 材料 | 检查点 | 题目 | 笔记 |');
out.push('|:-:|:-:|---|:-:|:-:|:-:|:-:|');
S.forEach((s, i) => {
  const no = i + 1;
  const notes = fs.existsSync(path.join(ROOT, 'notes', s.f)) ? '[`' + s.f + '`](notes/' + s.f + ')' : '—';
  out.push('| **' + no + '** | ' + s.from + '–' + s.to + ' | ' + s.name + ' | ' + (s.to - s.from + 1) + ' 条 | ' + s.cps.join('、') + ' | — | ' + notes + ' |');
});
out.push('');
out.push('---');
out.push('');
out.push('## 各板块速览');
out.push('');
S.forEach((s, i) => {
  out.push('### 板块 ' + (i + 1) + '｜' + s.name);
  out.push('');
  out.push('材料 **' + s.from + '–' + s.to + '**　｜　检查点 **' + s.cps.join('、') + '**　｜　笔记 `notes/' + s.f + '`');
  out.push('');
});
fs.writeFileSync(OUTMD, J(out), 'utf8');
console.log('已生成 学习计划索引.md（' + out.length + ' 行）');
console.log('板块定义已存 build/sections.json');
