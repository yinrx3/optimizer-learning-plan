// make-index-md.js —— 生成「学习计划索引」md（按板块分目录），并顺带产出分节锚点表
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const OUTMD = path.join(ROOT, '学习计划索引.md');
const OUTJSON = path.join(ROOT, 'build', 'sections.json');

// 板块定义。⚠️ 这是单一来源：本脚本把它写成 build/sections.json，
// build-web.js 再读 sections.json。所以 note 字段必须写在这里，否则会被覆盖掉。
const S = [
  { f: '1-9.md',   name: '基础：优化问题与 SGD 的定位',               from: 1,  to: 9,  cps: [1],        note: '优化问题的设定、记号、与深度学习的三处/四处破坏；SGD 与随机梯度' },
  { f: '10-13.md', name: '动量',                                     from: 10, to: 13, cps: [2],        note: '动量的本质（方差缩减 vs 加速）、Nesterov、频域视角' },
  { f: '14-17.md', name: '自适应步长：AdaGrad / sign-SGD / RMSProp', from: 14, to: 17, cps: [3],        note: '分母改造史：累加 → EMA；sign 更新与逐元素缩放' },
  { f: '18-27.md', name: 'Adam、AdamW 与收敛性之争',                 from: 18, to: 27, cps: [4, 5, 6],  note: 'Adam 的双 EMA 来历、偏差修正、解耦权重衰减、非收敛反例' },
  { f: '28-30.md', name: '三篇待处理的论文（综述 / Adam 动力学 / 加速 SGD）', from: 28, to: 30, cps: [7, 8], note: '综述的三遍读法；ODE 逼近法；增长条件下的加速方法' },
  { f: '31-37.md', name: '学习率调度与 warmup',                       from: 31, to: 37, cps: [9],        note: '调度形状的来源：偏差-方差权衡、river-valley、线性缩放规则' },
  { f: '38-46.md', name: 'μP、超参迁移与有效学习率',                  from: 38, to: 46, cps: [10],       note: '超参随宽度迁移；有效学习率 ELR / AUS；权重范数的隐式衰减' },
  { f: '47-52.md', name: '优化器设计 = 不同范数下的最速下降',          from: 47, to: 52, cps: [11],       note: 'ℓ₂→SGD、ℓ∞→sign-SGD、谱范数→Muon；对偶范数；二阶近似两条路' },
  { f: '53-58.md', name: 'Shampoo、K-FAC 与 Muon 的实现',            from: 53, to: 58, cps: [12],       note: 'Kronecker 分解、矩阵符号函数、Newton–Schulz 与 Polar Express' },
  { f: '59-65.md', name: '正交化的理论、Hyperball 与争论',            from: 59, to: 65, cps: [13],       note: '正交化为何有效；Hyperball 的约束轴；Free Lunch 之争；平坦度与泛化界（65b）' },
  { f: '66-70.md', name: '苏炜杰的两篇与导师论文',                    from: 66, to: 70, cps: [14, 15],   note: '代理模型路线；Newton–Muon；谱 Wasserstein；双层优化双时间尺度' },
  { f: '71-78.md', name: 'Scaling Law',                              from: 71, to: 78, cps: [16],       note: '幂律、瓶颈语言、Max-Bottleneck、T^{-0.32} 开放问题' },
  { f: '79-86.md', name: '强化学习：从 GAE 到 DAPO / MaxRL',          from: 79, to: 86, cps: [17],       note: '优势估计的偏差-方差；KL 约束与裁剪；改目标的三种位置' },
  { f: '87-90.md', name: '训练不稳定性与 RL 目标设计',                from: 87, to: 90, cps: [18],       note: 'Gradient Spike 定位；层间梯度异质性；目标函数的数学性质' },
  { f: '91-94.md', name: '零阶优化与函数空间的牛顿法',                from: 91, to: 94, cps: [19, 20],   note: '有限差分估计；MeZO 的显存论证；Fisher–Rao 度量与牛顿方向' },
];

fs.writeFileSync(OUTJSON, JSON.stringify(S, null, 2), 'utf8');

const J = (a) => a.join('\n');
const out = [];
out.push('# 学习计划索引（按板块）');
out.push('');
out.push('> 总表 100 条材料按阅读依赖切成 **15 个板块**。每个板块有：一份笔记文件（`notes/` 下）、若干自测检查点、以及一张「该读综述哪几节」的对照。');
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
