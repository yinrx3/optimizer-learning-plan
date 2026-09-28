// audit-premature.js —— 全面复查：每道题的关键概念，是否要到更后面的材料才学到
const fs = require('fs');
const path = require('path');
const NOTES = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\notes';

// 概念 -> 首次出现在哪一行材料（按总表行号）
const CONCEPT = [
  { re: /AdamW|解耦权重衰减|decoupled/i, at: 20, name: 'AdamW' },
  { re: /Adam(?!W)/, at: 18, name: 'Adam' },
  { re: /RMSProp|RMSprop/, at: 16, name: 'RMSProp' },
  { re: /AdaGrad/, at: 14, name: 'AdaGrad' },
  { re: /动量|Nesterov/, at: 10, name: '动量' },
  { re: /warmup|调度形状|WSD/, at: 31, name: '调度' },
  { re: /有效学习率|ELR|AUS/, at: 42, name: '有效学习率' },
  { re: /权重范数/, at: 42, name: '权重范数' },
  { re: /μP|超参迁移/, at: 38, name: 'μP' },
  { re: /谱范数|对偶范数|最速下降/, at: 47, name: '范数视角' },
  { re: /Shampoo|Kronecker|K-FAC/, at: 50, name: 'Shampoo' },
  { re: /Muon|正交化|Newton.?Schulz|msgn/i, at: 49, name: 'Muon' },
  { re: /Hyperball/, at: 63, name: 'Hyperball' },
  { re: /平坦度|泛化界|信息论界/, at: 65, name: '平坦度/泛化界' },
  { re: /Kaplan|Chinchilla|幂律|scaling law/i, at: 71, name: 'Scaling Law' },
  { re: /clipping|PPO|TRPO|GAE|GRPO|MaxRL|优势函数/i, at: 79, name: 'RL' },
  { re: /零阶|ZO 方法|有限差分/, at: 91, name: '零阶' },
  { re: /层间|层内|异质|LayerClip|GradLoc/, at: 87, name: '训练不稳定' },
  { re: /双时间尺度|KKT|变分不等式/, at: 66, name: '双层优化' },
  { re: /Newton Matching|Fisher.?Rao|信息几何/i, at: 94, name: '信息几何' },
];

const files = fs.readdirSync(NOTES).filter((f) => /^\d+-\d+\.md$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
let total = 0;
console.log('文件'.padEnd(12) + '题数  超前题目');
console.log('-'.repeat(70));
for (const f of files) {
  const hi = parseInt(f.split('-')[1], 10);
  const txt = fs.readFileSync(path.join(NOTES, f), 'utf8');
  const sec = txt.split('## 自测')[1] || '';
  const bad = [];
  const re = new RegExp('^(\\d+)\\.\\s+(.*)$', 'gm');
  let m;
  while ((m = re.exec(sec)) !== null) {
    for (const c of CONCEPT) {
      if (c.re.test(m[2]) && c.at > hi) { bad.push('第' + m[1] + '题 提到' + c.name + '(材料' + c.at + ')'); break; }
    }
  }
  total += bad.length;
  const n = (sec.match(/^\d+\.\s/gm) || []).length;
  console.log(f.padEnd(12) + String(n).padStart(3) + '   ' + (bad.length ? '⚠️ ' + bad.length + ' 道' : '✅'));
  bad.forEach((b) => console.log(' '.repeat(17) + b));
}
console.log('-'.repeat(70));
console.log('超前题目共 ' + total + ' 道');
