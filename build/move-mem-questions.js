// move-mem-questions.js —— 把"Adam 显存算术"两题从检查点 1 搬到检查点 4
// 理由：材料 1–9 里没有 Adam，检查点 1 处问"Adam 状态占多少 GB"是超前的。
// 检查点 4（Adam 的真正来历）里已经讲了 m_t/v_t 的双 EMA，把显存算术放那里最自然。
const fs = require('fs');
const P = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md';
let t = fs.readFileSync(P, 'utf8').replace(/^\uFEFF/, '');

// ---------- 1) 从检查点 1 删掉这两题（原 10、11）----------
const q10 = '10. 一个 7B 模型，FP32 训练下参数、Adam 状态各占多少 GB？换成 bf16 混合精度后各占多少？';
const q11 = '11. **面试题**：如果显存是硬约束，你会先砍激活值还是先砍优化器状态？各自的代价是什么？';
let removed = 0;
for (const q of [q10, q11]) {
  if (t.includes(q + '\n')) { t = t.replace(q + '\n', ''); removed++; }
  else if (t.includes(q)) { t = t.replace(q, ''); removed++; }
}
console.log('从检查点 1 删除: ' + removed + '/2 题');

// 原第 12 题（ZO 与显存墙）保留在检查点 1？——它也提到显存墙但不需要 Adam，
// 改为不编号的"延伸提示"，因为它依赖材料 91（零阶）。
const q12 = '12. 综述把 **ZO 方法的复兴**归因于显存墙。ZO 的代价是什么？为什么这个代价在大模型时代变得**可以接受**？';
const q12new = '> **延伸（留到材料 91 零阶优化再答）**：综述把 ZO 方法的复兴归因于显存墙——ZO 的代价是什么？为什么这个代价在大模型时代变得可以接受？';
if (t.includes(q12)) { t = t.replace(q12, q12new); console.log('检查点 1 第12题 -> 改为延伸提示（不编号）'); }
else console.log('⚠️ 未找到第 12 题');

// ---------- 2) 在检查点 4 的进阶自测末尾加入这两题 ----------
// 检查点 4 现有题目 1..6（基础 1-3，进阶 4-6；7-10 是我之前加的综述题）
// 为保持编号连续，插到"自测（进阶）"最后一道之后，随后统一重排
const anchor = '6. 如果把 $\\beta_2$ 设成 $0.9$（与 $\\beta_1$ 相同），训练会有什么变化？';
const i = t.indexOf(anchor);
if (i < 0) throw new Error('未找到检查点 4 的锚点题');
const eol = t.indexOf('\n', i);
const add = [
  '',
  '> **显存算术（与本节 $m_t$、$v_t$ 直接相关）**',
  '',
  '7. 一个 7B 模型，FP32 训练下参数本身、Adam 状态（$m_t$ 与 $v_t$）各占多少 GB？换成 bf16 混合精度后各占多少？',
  '8. **面试题**：如果显存是硬约束，你会先砍激活值还是先砍优化器状态？各自的代价是什么？',
].join('\n');
t = t.slice(0, eol + 1) + add + t.slice(eol + 1);
console.log('已加入检查点 4（进阶自测之后）');

fs.writeFileSync(P, t, 'utf8');
console.log('新行数 ' + t.split('\n').length);
