// check-site.js —— 学习材料页的落地检查（首页卡片 + 新页面内容）
const fs = require('fs');
const R = 'C:\\Users\\yinrx\\Desktop\\carefulreading\\web';

const idx = fs.readFileSync(R + '\\index.html', 'utf8');
console.log('=== 首页 index.html ===');
console.log('  标题: ' + ((idx.match(/<title>([^<]*)/) || [, ''])[1]));
console.log('  h1: ' + ((idx.match(/<h1>([^<]*)/) || [, ''])[1]));
console.log('  副标题: ' + ((idx.match(/<div class="sub">([^<]*)/) || [, ''])[1]));
console.log('  卡片数: ' + (idx.match(/class="card"/g) || []).length);
console.log('  含 learning-materials.html: ' + idx.includes('learning-materials.html'));
console.log('  含「235 道」(应为 false): ' + idx.includes('235 道'));

const p = R + '\\learning-materials.html';
if (!fs.existsSync(p)) { console.log('\n❌ learning-materials.html 不存在'); process.exit(1); }
const lm = fs.readFileSync(p, 'utf8');
const has = (s) => lm.includes(s);
const n = (re) => (lm.match(re) || []).length;

console.log('\n=== learning-materials.html ===');
console.log('  大小: ' + Buffer.byteLength(lm) + ' B');
console.log('  表格: ' + n(/<table/g) + '   空 tbody: ' + n(/<tbody>\s*<\/tbody>/g) + '（应为 0）');
console.log('  line-block 退化: ' + n(/class="line-block"/g) + '（应为 0）');
console.log('  外链: ' + n(/href="https?:/g));
console.log('  数学 span: ' + n(/<span class="math/g));
console.log('  裸 $: ' + n(/\$/g) + '（应为 0）');
console.log('  占位符残留: ' + (n(/<!--SECTION-/g) || '（无）'));

console.log('\n  —— 七个板块是否都有内容 ——');
const secs = [
  ['一 依赖关系图', '依赖关系图'],
  ['二 CS285', 'CS285：深度强化学习'],
  ['三 机器学习', '机器学习基础'],
  ['四 深度学习', '深度学习'],
  ['五 大语言模型', '大语言模型'],
  ['六 强化学习基础与理论', '强化学习基础与理论'],
  ['七 与其他页面关系', '与本仓库其他页面的关系'],
];
for (const [label, needle] of secs) console.log('    ' + (has(needle) ? '✔' : '❌') + ' ' + label);

console.log('\n  —— 关键外部资源抽样 ——');
const keys = [
  ['CS285 课程主页', 'rail.eecs.berkeley.edu/deeprlcourse'],
  ['CS285 starter code', 'berkeleydeeprlcourse/homework'],
  ['CS189（ML 主线）', 'eecs189.org'],
  ['CS229', 'cs229.stanford.edu'],
  ['CS231n（DL 主线）', 'cs231n.stanford.edu'],
  ['CS224n', 'web.stanford.edu/class/cs224n'],
  ['CS336（LLM 主线）', 'cs336.stanford.edu'],
  ['Sutton & Barto 官网', 'incompleteideas.net'],
  ['RL: Theory and Algorithms', 'rltheorybook.github.io'],
  ['Spinning Up', 'spinningup.openai.com'],
];
for (const [label, needle] of keys) console.log('    ' + (has(needle) ? '✔' : '❌') + ' ' + label);

console.log('\n  —— 目录（侧栏）——');
const toc = (lm.match(/<nav class="toc">[\s\S]*?<\/nav>/) || [''])[0];
console.log('    目录条目: ' + (toc.match(/<a href="#/g) || []).length);
console.log('    返回首页链接: ' + (toc.includes('index.html') ? '有' : '❌ 无'));
