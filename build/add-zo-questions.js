// add-zo-questions.js —— 给检查点 19（材料 91–94）补自测区块
//
// 背景：检查点 1 里那道「ZO 与显存墙」依赖材料 91，我上一轮把它降级成了提示，
// 等于删掉了内容（用户指出这是粗暴处理）。正确做法是搬到该放的位置。
// 这里在检查点 19 补一个自测区块：材料 91–94（零阶优化 / MeZO / Newton Matching）
// 此前完全没有自测题。
const fs = require('fs');
const P = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md';
let t = fs.readFileSync(P, 'utf8').replace(/^\uFEFF/, '');

// 1) 删掉检查点 1 里那条降级的提示（内容搬去检查点 19）
const demoted = '> **延伸（留到材料 91 零阶优化再答）**：综述把 ZO 方法的复兴归因于显存墙——ZO 的代价是什么？为什么这个代价在大模型时代变得可以接受？';
if (t.includes(demoted + '\n')) { t = t.replace(demoted + '\n', ''); console.log('已移除检查点 1 的降级提示'); }
else if (t.includes(demoted)) { t = t.replace(demoted, ''); console.log('已移除检查点 1 的降级提示'); }
else console.log('⚠️ 未找到降级提示');

// 2) 在检查点 19 的「核心验收标准」之前插入自测区块
const anchor = '**核心验收标准**';
const i = t.indexOf(anchor);
if (i < 0) throw new Error('未找到「核心验收标准」锚点');
const block = [
  '**自测（材料 91–94：零阶优化与函数空间的牛顿法）**',
  '',
  '1. 写出零阶梯度估计式。$q$ 与 $\\mu$ 分别控制什么？$q=1$ 时每一步需要几次前向评估？',
  '2. MeZO 凭什么做到"优化器显存≈推理显存"？**原地（in-place）扰动**与**同步随机种子**各自解决什么问题？',
  '3. ZO 的梯度估计方差大致随什么增长？这带来什么后果——为什么"省显存"是有代价的？',
  '4. 综述把 ZO 方法的复兴归因于**显存墙**。ZO 的代价是什么？为什么这个代价在大模型时代变得**可以接受**？',
  '5. **对照题**：低秩类 ZO 方法（LOZO、TeZO）与稀疏类（Sparse-MeZO、LeZO）分别在哪个维度上做限制？各自丢掉什么信息？',
  '6. Newton Matching 把什么当作几何量？它证明的"牛顿方向 = 负 Fisher–Rao 梯度"依赖哪个恒等式？',
  '7. **延伸**：Newton Matching 与 Newton–Muon 都叫"牛顿"，但一个在参数空间、一个在函数空间——它们的共同点与分歧点各是什么？',
  '',
].join('\n');
t = t.slice(0, i) + block + t.slice(i);
console.log('已在检查点 19 插入 7 道自测题');

fs.writeFileSync(P, t, 'utf8');
console.log('新行数 ' + t.split('\n').length);
