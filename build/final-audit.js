// final-audit.js —— 确认：① 232 道题全部落进 notes ② 没有超前题目 ③ 综述阅读路线正确
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';
const NOTES = path.join(ROOT, 'notes');
const plan = fs.readFileSync(path.join(ROOT, '学习与追踪清单.md'), 'utf8').replace(/^\uFEFF/, '');

// 1) md 里的题（排除检查点 19 的"三条主线"散列项：它们不是题）
const CP = /^###\s*⛳\s*检查点\s*(\d+)[｜|]/;
const HEAD = /^\*\*(自测|面试级问题|进阶自测|必须能回答的一问|关于 MaxRL 的追加自测)[^*]*\*\*\s*$/;
const OTHER_BOLD = /^\*\*[^*]+\*\*\s*$/;
const Q = /^\d+\.\s+\S/;
const inPlan = [];
let cur = null;
let inQ = false;
for (const line of plan.split(/\r?\n/)) {
  const c = line.match(CP);
  if (c) { cur = +c[1]; inQ = false; continue; }
  if (HEAD.test(line)) { inQ = true; continue; }
  if (inQ && OTHER_BOLD.test(line)) { inQ = false; continue; }
  if (inQ && Q.test(line)) inPlan.push(line.replace(/^\d+\.\s/, '').trim());
}
// 2) notes 里的题
const inNotes = [];
for (const f of fs.readdirSync(NOTES).filter((x) => x.endsWith('.md'))) {
  const txt = fs.readFileSync(path.join(NOTES, f), 'utf8');
  const sec = txt.split('## 自测')[1] || '';
  for (const m of sec.matchAll(/^\d+\.\s+(.*)$/gm)) inNotes.push(m[1].trim());
}
console.log('清单内题目: ' + inPlan.length);
console.log('notes 内题目: ' + inNotes.length);
const missing = inPlan.filter((q) => !inNotes.includes(q));
const extra = inNotes.filter((q) => !inPlan.includes(q));
console.log(missing.length ? '❌ 丢失 ' + missing.length + ' 道:\n  ' + missing.slice(0, 5).join('\n  ') : '✅ 无题目丢失');
console.log(extra.length ? '⚠️ 多出 ' + extra.length + ' 道' : '✅ 无多余题目');

// 3) 超前题目：题目关键词指向的材料，是否在本文件范围内
const TOPIC = [
  { k: /AdamW|解耦权重衰减|decoupled/i, at: 20, n: 'AdamW' },
  { k: /Adam/, at: 18, n: 'Adam' },
  { k: /RMSProp|RMSprop/, at: 16, n: 'RMSProp' },
  { k: /AdaGrad/, at: 14, n: 'AdaGrad' },
  { k: /μP|超参迁移/, at: 38, n: 'μP' },
  { k: /普范数|谱范数|对偶|最速下降|范数视角/, at: 47, n: '范数视角' },
  { k: /Shampoo|Kronecker|K-FAC/, at: 50, n: 'Shampoo' },
  { k: /Muon|正交化|Newton.?Schulz/i, at: 49, n: 'Muon' },
  { k: /Hyperball/, at: 63, n: 'Hyperball' },
  { k: /scaling|幂律|Kaplan|Chinchilla/i, at: 71, n: 'Scaling Law' },
  { k: /clipping|PPO|TRPO|GAE|GRPO|MaxRL/i, at: 79, n: 'RL' },
  { k: /零阶|ZO|有限差分/, at: 91, n: '零阶' },
  { k: /层间|层内|异质|LayerClip/, at: 87, n: '训练不稳定' },
];
console.log('');
console.log('超前题目检查：');
let flagged = 0;
for (const f of fs.readdirSync(NOTES).filter((x) => x.endsWith('.md')).sort()) {
  const hi = /^\d/.test(f) ? parseInt(f.split('-')[1], 10) : 999;
  const txt = fs.readFileSync(path.join(NOTES, f), 'utf8');
  const sec = txt.split('## 自测')[1] || '';
  const bad = [];
  for (const m of sec.matchAll(/^(\d+)\.\s+(.*)$/gm)) {
    for (const T of TOPIC) {
      if (T.k.test(m[2]) && T.at > hi) { bad.push('第' + m[1] + '题需材料' + T.at + '(' + T.n + ')'); break; }
    }
  }
  flagged += bad.length;
  if (bad.length) console.log('  ⚠️ ' + f + ': ' + bad.join('; '));
}
console.log(flagged ? '  共 ' + flagged + ' 道待查（可能是误报）' : '  ✅ 无超前题目');

// 4) 综述阅读路线
const sp = path.join(NOTES, '28-综述阅读路线.md');
if (fs.existsSync(sp)) {
  const t = fs.readFileSync(sp, 'utf8');
  const has = ['28', '28b', '28c', '28d', '28e', '28f'].filter((x) => t.includes('**' + x + '**'));
  console.log('');
  console.log('综述阅读路线: 含 ' + has.length + '/6 个任务（' + has.join(',') + '）');
}
