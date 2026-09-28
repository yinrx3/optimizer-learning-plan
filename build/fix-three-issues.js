// fix-three-issues.js —— 修三处：
// ① 14-17 第8题：题面仍依赖"谱范数"（材料 47）
// ② 47-52：混入了检查点 19 的"三条主线"列表项（第 24/25 题）
//    并结构化修掉：凡没有"自测区块"的检查点，其编号行一律不当题目
const fs = require('fs');
const R = 'C:\\Users\\yinrx\\Desktop\\carefulreading';

// ---------- ① 改题面（在总表 md 里） ----------
{
  const p = R + '\\学习与追踪清单.md';
  let t = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  const olds = [
    '8. **延伸**：如果不用逐元素缩放，而是对整个梯度向量做一次归一化，会得到什么？（提示：这就是第 49 行 sign-SGD 与谱范数的区别）',
    '8. **延伸**：如果不用逐元素缩放，而是**对整个梯度向量只做一次归一化**，会得到什么？它和逐元素缩放的本质差别在哪？',
  ];
  const neu = '8. **延伸**：AdaGrad/RMSProp 是**逐坐标**缩放；如果改成**对整个梯度向量只做一次归一化**（用它的整体长度去缩放全部坐标），会发生什么？它和逐坐标缩放的本质差别在哪？';
  let hit = 0;
  for (const o of olds) if (t.includes(o)) { t = t.replace(o, neu); hit++; }
  fs.writeFileSync(p, t, 'utf8');
  console.log('① 14-17 第8题题面改写: ' + (hit ? '成功（匹配 ' + hit + ' 种旧版）' : '⚠️ 未匹配'));
}

// ---------- ② rebuild-notes-v2.js：无自测区块的检查点不进笔记 ----------
{
  const p = R + '\\build\\rebuild-notes-v2.js';
  let t = fs.readFileSync(p, 'utf8');
  // 记录哪些检查点真的出现过自测头
  const from = "  if (HEAD.test(line)) { cur.inQuiz = true; continue; }";
  const to = "  if (HEAD.test(line)) { cur.inQuiz = true; cur.hasQuiz = true; continue; }";
  if (t.includes(from)) { t = t.replace(from, to); console.log('②a 已标记 hasQuiz'); }
  else if (t.includes('cur.hasQuiz')) console.log('②a 已标记过');
  else console.log('⚠️ 未找到 HEAD 处理行');

  const from2 = "for (const c of cps) for (const q of c.qs) allQ.set(c.no + '.' + q.n, { cp: c, q });";
  const to2 = [
    "// 没有自测区块的检查点（如检查点 19 只有终测表与三条主线）不取题——",
    "// 其编号行是列表项／主题索引，不是自测题；这类内容归入 notes/99-终测.md",
    "for (const c of cps) { if (!c.hasQuiz) continue; for (const q of c.qs) allQ.set(c.no + '.' + q.n, { cp: c, q }); }",
  ].join('\n');
  if (t.includes(from2)) { t = t.replace(from2, to2); console.log('②b 已加 hasQuiz 过滤'); }
  else if (t.includes('c.hasQuiz')) console.log('②b 已过滤过');
  else console.log('⚠️ 未找到 allQ 构建行');
  fs.writeFileSync(p, t, 'utf8');
}

// ---------- ③ 清掉归属表里指向已删题目的条目 ----------
{
  const p = R + '\\build\\rebuild-notes-v2.js';
  let t = fs.readFileSync(p, 'utf8');
  // 检查点 19/20 的条目里，19.1-19.3 已不存在；20.x 保留
  const before = (t.match(/'19\.\d+':/g) || []).length;
  t = t.replace(/^\s*'19\.\d+':[^\n]*\n/gm, '');
  const after = (t.match(/'19\.\d+':/g) || []).length;
  fs.writeFileSync(p, t, 'utf8');
  console.log('③ 清理检查点 19 的归属条目: ' + before + ' -> ' + after);
}
