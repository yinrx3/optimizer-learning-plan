// scan-broken-tex.js —— 在 $...$ 内查找"命令名缺反斜杠"的可疑片段
const fs = require('fs');
const files = [
  'C:\\Users\\yinrx\\Desktop\\carefulreading\\学习与追踪清单.md',
  'C:\\Users\\yinrx\\Desktop\\carefulreading\\综述精读-优化方法演化.md',
];
// 常见 LaTeX 命令名，若在 $...$ 内以裸词出现（前面不是反斜杠），视为损坏
const CMDS = ['Rightarrow', 'Leftarrow', 'times', 'cdot', 'frac', 'sqrt', 'nabla', 'theta', 'eta',
  'lambda', 'epsilon', 'gamma', 'sigma', 'alpha', 'beta', 'mu', 'phi', 'psi', 'Theta', 'Delta',
  'mathcal', 'mathbb', 'mathrm', 'text', 'tilde', 'hat', 'lVert', 'rVert', 'approx', 'sim',
  'infty', 'partial', 'sum', 'prod', 'quad', 'qquad', 'delta', 'rho', 'tau', 'ell', 'min', 'max'];

for (const P of files) {
  const lines = fs.readFileSync(P, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
  const hits = [];
  lines.forEach((l, i) => {
    // 逐个 $...$ 片段
    const re = /\$([^$]{1,200})\$/g;
    let m;
    while ((m = re.exec(l)) !== null) {
      const body = m[1];
      for (const c of CMDS) {
        // 命令名前没有反斜杠，且不是更长单词的一部分
        const rx = new RegExp('(?<![\\\\A-Za-z])' + c + '(?![A-Za-z])');
        if (rx.test(body)) hits.push({ line: i + 1, cmd: c, ctx: body.slice(0, 70) });
      }
      if (/[\t\x00-\x08\x0b\x0c\x0e-\x1f]/.test(body)) hits.push({ line: i + 1, cmd: '(控制字符)', ctx: JSON.stringify(body.slice(0, 70)) });
    }
    // 数学外也可能有控制字符（如 \Rightarrow 被吃成 tab 后不在 $ 内）
    if (/[\t\x00-\x08\x0b\x0c\x0e-\x1f]/.test(l)) hits.push({ line: i + 1, cmd: '(行内控制字符)', ctx: JSON.stringify(l.trim().slice(0, 90)) });
  });
  console.log('=== ' + P.split('\\').pop() + ' ===');
  if (!hits.length) console.log('  未发现可疑片段 ✔');
  else hits.forEach((h) => console.log('  L' + h.line + ' [' + h.cmd + '] ' + h.ctx));
  console.log('');
}
