// rebuild-notes-v2.js —— 按"题目所需的材料在哪一块"重新编排 notes
//
// 旧做法：题目跟着【检查点在 md 里的物理位置】走 —— 于是材料 1–9 的笔记里
// 混进了需要 Adam（材料 18）与零阶（材料 91）的题。
// 新做法：每道题按它依赖的材料归属到对应板块，题号在板块内重排。
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const NOTES = path.join(ROOT, 'notes');
const BACKUP = path.join(ROOT, 'build', '_notes_backup');

// 板块定义（从 sections.json 读，保证与网页一致）
const SECTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sections.json'), 'utf8'));

// ---------- 每道题的归属表 ----------
// 键 = "检查点号.题号"（当前编号），值 = 目标板块的 f
const ASSIGN = {
  // 检查点 1（物理位置：1-9）
  '1.1': '1-9.md', '1.2': '1-9.md', '1.3': '1-9.md', '1.4': '1-9.md', '1.5': '1-9.md',
  '1.6': '1-9.md', '1.7': '1-9.md',
  '1.8': '1-9.md',   // 鞍点：综述 §2.2，在 28b 读到；但属"基础性质"，放 1-9 并注明来源
  '1.9': '1-9.md',   // 噪声双重性
  '1.10': '18-27.md', '1.11': '18-27.md',   // Adam 显存算术 / 显存取舍
  '1.12': '91-94.md',                       // ZO 与显存墙

  // 检查点 2（10-13）——已在正确位置
  '2.1': '10-13.md', '2.2': '10-13.md', '2.3': '10-13.md', '2.4': '10-13.md',
  '2.5': '10-13.md', '2.6': '10-13.md', '2.7': '10-13.md',

  // 检查点 3（物理位置：14-17）
// 注意 3.7/3.8 的题面已改写，去掉对尚未学到的'谱范数'的依赖
  '3.1': '14-17.md', '3.2': '14-17.md', '3.3': '14-17.md', '3.4': '14-17.md',
  '3.5': '14-17.md', '3.6': '14-17.md',
  '3.7': '18-27.md',   // Adam 的 ε
  '3.8': '47-52.md',   // 整向量归一化 = sign/谱范数
  '3.9': '14-17.md', '3.10': '14-17.md', '3.11': '14-17.md',
  '3.12': '87-90.md',  // 层内异质性与 LayerClip
  '3.13': '18-27.md',  // Adam vs RMSProp+动量
  '3.14': '18-27.md',  // 对角 Fisher 再推一次 Adam

  // 检查点 4（物理位置：18-27）——Adam 主题，此处就是归属地
  '4.1': '18-27.md', '4.2': '18-27.md', '4.3': '18-27.md', '4.4': '18-27.md',
  '4.5': '18-27.md', '4.6': '18-27.md', '4.7': '18-27.md', '4.8': '18-27.md',
  '4.9': '18-27.md', '4.10': '18-27.md',

  // 检查点 5（AdamW）
  '5.1': '18-27.md', '5.2': '18-27.md', '5.3': '18-27.md', '5.4': '18-27.md',
  '5.5': '18-27.md', '5.6': '18-27.md', '5.7': '18-27.md', '5.8': '18-27.md',
  '5.9': '28-30.md',   // 分布式场景变换 T（综述 §3.1）

  // 检查点 6（矛盾/RMSprop）
  '6.1': '18-27.md', '6.2': '18-27.md', '6.3': '18-27.md', '6.4': '18-27.md',
  '6.5': '18-27.md', '6.6': '18-27.md', '6.7': '18-27.md',
  '6.8': '59-65.md', '6.9': '59-65.md',   // RMSprop 100→300 回退、复杂预条件收益递减

  // 检查点 7（ODE 方法，物理位置：28-30）
  '7.1': '28-30.md', '7.2': '28-30.md', '7.3': '28-30.md', '7.4': '28-30.md',
  '7.5': '28-30.md', '7.6': '28-30.md', '7.7': '18-27.md',
  '7.8': '59-65.md',   // 谱 Wasserstein（材料 69）
  '7.9': '28-30.md', '7.10': '28-30.md', '7.11': '28-30.md',

  // 检查点 8（增长条件，物理位置：28-30）
  '8.1': '28-30.md', '8.2': '28-30.md', '8.3': '28-30.md', '8.4': '28-30.md',
  '8.5': '28-30.md', '8.6': '28-30.md', '8.7': '28-30.md',
  '8.8': '28-30.md',
  '8.9': '38-46.md',   // 与检查点 6 对照 → 但需"邻域"，留在 28-30
  '8.10': '38-46.md',  // 邻域 vs 有效学习率（材料 42）
  '8.11': '10-13.md', '8.12': '10-13.md', '8.13': '31-37.md',  // 频域动量 / 调度

  // 检查点 9（调度）
  '9.1': '31-37.md', '9.2': '31-37.md', '9.3': '31-37.md', '9.4': '31-37.md',
  '9.5': '31-37.md', '9.6': '31-37.md', '9.7': '31-37.md', '9.8': '31-37.md',
  '9.9': '31-37.md', '9.10': '31-37.md',

  // 检查点 10（有效学习率）
  '10.1': '38-46.md', '10.2': '38-46.md', '10.3': '38-46.md', '10.4': '38-46.md',
  '10.5': '59-65.md', '10.6': '38-46.md', '10.7': '38-46.md', '10.8': '38-46.md',
  '10.9': '38-46.md',
  '10.10': '18-27.md', '10.11': '18-27.md', '10.12': '18-27.md', '10.13': '18-27.md',

  // 检查点 11（范数视角）
  '11.1': '47-52.md', '11.2': '47-52.md', '11.3': '47-52.md', '11.4': '47-52.md',
  '11.5': '47-52.md', '11.6': '47-52.md', '11.7': '47-52.md', '11.8': '47-52.md',
  '11.9': '47-52.md', '11.10': '47-52.md', '11.11': '47-52.md', '11.12': '47-52.md',
  '11.13': '59-65.md',

  // 检查点 12（数值线代 / Muon 实现）
  '12.1': '53-58.md', '12.2': '53-58.md', '12.3': '53-58.md', '12.4': '53-58.md',
  '12.5': '53-58.md', '12.6': '53-58.md', '12.7': '53-58.md', '12.8': '53-58.md',
  '12.9': '66-70.md', '12.10': '53-58.md', '12.11': '53-58.md', '12.12': '53-58.md',
  '12.13': '53-58.md', '12.14': '53-58.md',

  // 检查点 13（Hyperball 之争）
  '13.1': '59-65.md', '13.2': '59-65.md', '13.3': '59-65.md', '13.4': '59-65.md',
  '13.5': '59-65.md', '13.6': '59-65.md', '13.7': '59-65.md', '13.8': '66-70.md',
  '13.9': '28-30.md',   // 综述 Tab.8 算力成本

  // 检查点 14（苏炜杰套路）
  '14.1': '66-70.md', '14.2': '66-70.md', '14.3': '66-70.md', '14.4': '66-70.md',
  '14.5': '66-70.md', '14.6': '66-70.md', '14.7': '66-70.md', '14.8': '66-70.md',
  '14.9': '66-70.md', '14.10': '91-94.md',

  // 检查点 15（导师论文）
  '15.1': '66-70.md', '15.2': '66-70.md', '15.3': '66-70.md', '15.4': '66-70.md',
  '15.5': '66-70.md', '15.6': '66-70.md', '15.7': '66-70.md', '15.8': '66-70.md',
  '15.9': '66-70.md',

  // 检查点 16（scaling law）
  '16.1': '71-78.md', '16.2': '71-78.md', '16.3': '71-78.md', '16.4': '71-78.md',
  '16.5': '71-78.md', '16.6': '71-78.md', '16.7': '71-78.md', '16.8': '71-78.md',
  '16.9': '71-78.md', '16.10': '71-78.md', '16.11': '71-78.md',
  '16.12': '28-30.md', '16.13': '28-30.md', '16.14': '28-30.md',

  // 检查点 17（clipping/RL + 泛化补充）
  '17.1': '79-86.md', '17.2': '79-86.md', '17.3': '79-86.md', '17.4': '79-86.md',
  '17.5': '79-86.md', '17.6': '79-86.md', '17.7': '79-86.md', '17.8': '79-86.md',
  '17.9': '79-86.md', '17.10': '79-86.md', '17.11': '79-86.md', '17.12': '79-86.md',
  '17.13': '79-86.md',
  '17.14': '59-65.md', '17.15': '59-65.md', '17.16': '59-65.md', '17.17': '59-65.md',
  '17.18': '59-65.md', '17.19': '59-65.md', '17.20': '59-65.md', '17.21': '59-65.md',
  '17.22': '59-65.md', '17.23': '59-65.md',
  // MaxRL 组（24-28）跟 RL 走
  '17.24': '79-86.md', '17.25': '79-86.md', '17.26': '79-86.md', '17.27': '79-86.md',
  '17.28': '79-86.md',

  // 检查点 18（训练不稳定）
  '18.1': '87-90.md', '18.2': '87-90.md', '18.3': '87-90.md', '18.4': '87-90.md',
  '18.5': '87-90.md', '18.6': '87-90.md', '18.7': '87-90.md', '18.8': '87-90.md',
  '18.9': '87-90.md', '18.10': '87-90.md', '18.11': '87-90.md', '18.12': '87-90.md',
  '18.13': '87-90.md', '18.14': '87-90.md',

  // 检查点 19 只有一张终测表与"三条主线"，没有编号自测题
  // （旧版把"1. 范数→几何→优化器"这类散列项误当成题目，已移除）

  // 检查点 20（三个正交的设计轴）
  '20.1': '47-52.md', '20.2': '47-52.md', '20.3': '47-52.md', '20.4': '47-52.md',
  '20.5': '47-52.md', '20.6': '47-52.md', '20.7': '47-52.md', '20.8': '47-52.md',
  '20.9': '47-52.md', '20.10': '47-52.md', '20.11': '47-52.md', '20.12': '47-52.md',
  '20.13': '47-52.md',
};

// ---------- 读题 ----------
// ⚠️ 关键：检查点内并非所有 "N. " 行都是题目——检查点 19 的"三条主线 / 三个设计轴"
// 也是编号列表，检查点 8 的"1) 2)"是行内枚举。所以只从**自测区块**取题：
//   · 遇到 "**自测…**" 或 "**面试级问题…**" → 进入取题状态
//   · 再遇到另一个 "**…**" 分组标签 → 退出取题状态
//   · 从未遇到自测头（如检查点 19 = 纯终测表）→ 该检查点不取题
const plan = fs.readFileSync(path.join(ROOT, '学习与追踪清单.md'), 'utf8').replace(/^\uFEFF/, '');
const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]\s*(.+?)\s*$/;
const Q = /^(\d+)\.\s+(.*)$/;
const HEAD = /^\*\*(自测|面试级问题|进阶自测|必须能回答的一问|关于 MaxRL 的追加自测)[^*]*\*\*\s*$/;
const OTHER_BOLD = /^\*\*[^*]+\*\*\s*$/;
const cps = [];
let cur = null;
for (const line of plan.split(/\r?\n/)) {
  const c = line.match(CP);
  if (c) { cur = { no: +c[1], title: c[2], qs: [], inQuiz: false }; cps.push(cur); continue; }
  if (!cur) continue;
  if (HEAD.test(line)) { cur.inQuiz = true; continue; }
  if (cur.inQuiz && OTHER_BOLD.test(line)) { cur.inQuiz = false; continue; }
  if (!cur.inQuiz) continue;
  const q = line.match(Q);
  if (q) cur.qs.push({ n: +q[1], t: q[2] });
}
const allQ = new Map();
for (const c of cps) for (const q of c.qs) allQ.set(c.no + '.' + q.n, { cp: c, q });
console.log('从自测区块取题: ' + allQ.size + ' 道');
for (const c of cps) if (!c.qs.length) console.log('  （检查点 ' + c.no + ' 无编号自测题，故不进笔记）');

// 归属检查
const missing = [];
for (const k of allQ.keys()) if (!ASSIGN[k]) missing.push(k);
const extra = Object.keys(ASSIGN).filter((k) => !allQ.has(k));
console.log('题目总数 ' + allQ.size + '，已归属 ' + Object.keys(ASSIGN).length);
if (missing.length) console.log('⚠️ 未归属: ' + missing.join(', '));
if (extra.length) console.log('⚠️ 归属表多余: ' + extra.join(', '));

// ---------- 读材料 ----------
const ROW = /^\|\s*(?:<!--SEC:\d+-->)?\s*\*\*(\d+[a-z]?)\*\*\s*\|([^|]*)\|/;
const rows = [];
for (const line of plan.split(/\r?\n/)) {
  const m = line.match(ROW);
  if (m) {
    const parts = line.split('|');
    rows.push({ no: m[1], title: (parts[2] || '').split('**').join('').split('`').join('').trim() });
  }
}

// ---------- 生成 ----------
if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });
for (const f of fs.readdirSync(NOTES)) {
  if (f.endsWith('.md')) fs.copyFileSync(path.join(NOTES, f), path.join(BACKUP, f));
}
console.log('原 notes 已备份到 build/_notes_backup/');

// 综述的阅读任务（28 与 28g–28k）单独成篇：它们分散在 46/52/65/94 之后，
// 若按行号归入各块，会把"综述怎么读"这件事切碎成五处。
const SURVEY_ROWS = new Set(['28', '28b', '28c', '28d', '28e', '28f']);
const ROW_RE = /^\|\s*(?:<!--SEC:\d+-->)?\s*\*\*(\d+[a-z]?)\*\*\s*\|/;

const stats = [];
for (const s of SECTIONS) {
  if (s.tech) continue;   // 两篇特殊笔记由下面的专用块生成，不走材料板块逻辑
  const lo = s.from, hi = s.to;
  // 材料：本块的行号范围，排除综述的阅读任务行（它们归到 28-综述阅读路线.md）
  const mate = rows.filter((r) => {
    if (SURVEY_ROWS.has(r.no)) return false;
    const b = parseInt(r.no, 10);
    return b >= lo && b <= hi;
  });
  const qlist = [];
  for (const [k, v] of allQ) {
    if (ASSIGN[k] === s.f) qlist.push({ cp: v.cp, t: v.q.t, key: k });
  }
  const out = [];
  out.push('# ' + s.f.replace('.md', '') + '｜' + s.name);
  out.push('');
  out.push('> 材料 ' + lo + '–' + hi + '　｜　本块题目 ' + qlist.length + ' 道');
  out.push('');
  out.push('## 材料');
  out.push('');
  out.push('| # | 材料 | 在哪 |');
  out.push('|:-:|------|------|');
  for (const r of mate) out.push('| **' + r.no + '** | ' + r.title + ' | 总表第 ' + r.no + ' 行 |');
  out.push('');
  out.push('## 自测');
  out.push('');
  let i = 1;
  let lastCp = null;
  for (const item of qlist) {
    if (item.cp.no !== lastCp) {
      if (lastCp !== null) out.push('');
      out.push('**检查点 ' + item.cp.no + '｜' + item.cp.title + '**');
      out.push('');
      lastCp = item.cp.no;
    }
    out.push(i + '. ' + item.t);
    i++;
  }
  out.push('');
  fs.writeFileSync(path.join(NOTES, s.f), out.join('\n'), 'utf8');
  stats.push({ f: s.f, mate: mate.length, q: qlist.length });
}

// ---------- 检查点 19（终测）单独成篇 ----------
// 它是全表综合验收，不属于任何一个材料板块。含：终测表 + 核心验收标准 +
// 三条主线 + 三个设计轴 + 动手清单。
{
  const L = plan.split(/\r?\n/);
  const s = L.findIndex((l) => /^###\s*⛳\s*检查点 19[｜|]/.test(l));
  const e = L.findIndex((l, i) => i > s && /^###\s*⛳\s*检查点 20[｜|]/.test(l));
  if (s < 0 || e < 0) throw new Error('未找到检查点 19 范围');
  const body = L.slice(s + 1, e).join('\n').trim();
  const out = [];
  out.push('# 99-终测｜全表综合验收（检查点 19）');
  out.push('');
  out.push('> 这一篇不属于任何材料板块：它是**全部 15 个板块读完后的综合自检**。答不出来就回到对应板块的笔记。');
  out.push('');
  out.push(body);
  out.push('');
  fs.writeFileSync(path.join(NOTES, '99-终测.md'), out.join('\n'), 'utf8');
  console.log('已生成 99-终测.md（检查点 19：终测表 + 三条主线）');
}

// ---------- 综述阅读路线单独成篇 ----------
{
  const surveyRows = rows.filter((r) => SURVEY_ROWS.has(r.no));
  const out = [];
  out.push('# 28-综述阅读路线');
  out.push('');
  out.push('> 材料 28 与 28b–28f。**这一篇是"综述怎么读"，不是一次性任务**：阅读任务按前置知识由少到多排列，**每一条的前置材料写在总表那一行的行首**。');
  out.push('');
  out.push('## 阅读任务（按前置材料由少到多）');
  out.push('');
  out.push('| # | 任务 | 在哪 |');
  out.push('|:-:|------|------|');
  for (const r of surveyRows) out.push('| **' + r.no + '** | ' + r.title + ' | 总表第 ' + r.no + ' 行 |');
  out.push('');
  out.push('## 前置依赖速查');
  out.push('');
  out.push('| 任务 | 什么时候读 | 读什么 |');
  out.push('|:-:|------|------|');
  out.push('| **28b** | 随时（20 分钟） | 只扫目录 + 引言，**不要读正文** |');
  out.push('| **28c** | 材料 38–52 学完后 | Sec 1 + **Sec 3.1**（四算子框架），把 Adam 与 Muon 各填一遍 |');
  out.push('| **28d** | 材料 18–27 + 53–58 学完后 | **§3.2.2 → 3.2.3 → 3.3.1 → 3.3.2 → 3.3.3 → 3.3.4**（预条件的谱） |');
  out.push('| **28e** | 材料 53–65 学完后 | **§3.2.4 → 3.2.6 → 4.3.1**（稳定性与范数） |');
  out.push('| **28f** | 全部主线读过一遍后 | ① 只读每节末尾的 open problem（全文 90 处），找题目用；② 之后当字典查算法名与文献，**不要试图在综述里找推导** |');
  out.push('');
  fs.writeFileSync(path.join(NOTES, '28-综述阅读路线.md'), out.join('\n'), 'utf8');
  stats.push({ f: '28-综述阅读路线.md', mate: surveyRows.length, q: 0 });
}

console.log('');
console.log('文件'.padEnd(14) + '材料  题目');
console.log('-'.repeat(30));
let tm = 0, tq = 0;
for (const x of stats) {
  console.log(x.f.padEnd(14) + String(x.mate).padStart(4) + String(x.q).padStart(6));
  tm += x.mate; tq += x.q;
}
console.log('-'.repeat(30));
console.log('合计'.padEnd(14) + String(tm).padStart(4) + String(tq).padStart(6));
