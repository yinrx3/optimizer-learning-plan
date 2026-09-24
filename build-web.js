// build-web.js —— 组装网页：读取 pandoc 产出的 HTML 片段，套模板输出到 web/
// pandoc 由外部 PowerShell 调用（沙箱禁止 node 通过管道 spawn 子进程）
// 板块定义来自 build/sections.json（单一来源）
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/yinrx/Desktop/carefulreading';
const OUT = path.join(ROOT, 'web');
const ASSETS = path.join(OUT, 'assets');
const KATEX_DIR = path.join(OUT, 'katex');
const TMP = path.join(OUT, '.tmp');
const NOTES_OUT = path.join(OUT, 'notes');
const DSH_FE = 'C:/Users/yinrx/AppData/Roaming/npm/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets';

for (const d of [OUT, ASSETS, KATEX_DIR, path.join(KATEX_DIR, 'fonts'), TMP, NOTES_OUT]) fs.mkdirSync(d, { recursive: true });

const read = (f) => fs.readFileSync(path.join(TMP, f), 'utf8');
function tocOf(f) {
  const html = read(f);
  const m = html.match(/<nav id="TOC"[\s\S]*?<\/nav>/);
  return m ? m[0] : '';
}
const SECTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sections.json'), 'utf8'));
const rangeLabel = (s) => (s.from === 28 ? '28–28f、29–30' : s.from + '–' + s.to);

const CSS = `
:root{
  --bg:#fbfaf8; --fg:#1f2328; --muted:#5b6472; --line:#e3e0da;
  --accent:#8a5a2b; --accent-soft:#f3ece3; --code-bg:#f4f2ee;
  --ok:#2f7a4d; --warn:#a8562a;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--fg);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  font-size:16px; line-height:1.75; letter-spacing:.01em;
}
a{color:var(--accent); text-decoration:none; border-bottom:1px solid rgba(138,90,43,.25)}
a:hover{border-bottom-color:var(--accent)}
.wrap{display:flex; align-items:flex-start; max-width:1440px; margin:0 auto}
nav.toc{
  position:sticky; top:0; flex:0 0 320px; height:100vh; overflow-y:auto;
  padding:28px 20px 40px; border-right:1px solid var(--line);
  font-size:13.5px; line-height:1.6; background:#f7f5f1;
}
nav.toc h2{font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin:0 0 14px; font-weight:600}
nav.toc ul{list-style:none; margin:0; padding-left:0}
nav.toc > ul > li{margin:2px 0}
nav.toc ul ul{padding-left:13px; margin:2px 0 6px}
nav.toc a{display:block; padding:3px 8px; border-radius:6px; border-bottom:none; color:#39404a}
nav.toc a:hover{background:var(--accent-soft); color:var(--accent)}
nav.toc > ul > li > a{font-weight:600; color:#1f2328}
nav.toc .backlink{display:block; margin-bottom:16px; font-size:13px; color:var(--accent)}
.toc-lead{font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin:22px 0 10px; font-weight:600}
.toc-lead:first-child{margin-top:0}
nav.toc ul.sectoc{list-style:none; margin:0; padding:0}
nav.toc ul.sectoc li{margin:0 0 10px; padding:8px 10px; border-radius:8px; background:#fff; border:1px solid var(--line)}
nav.toc ul.sectoc li:hover{border-color:var(--accent); background:var(--accent-soft)}
nav.toc ul.sectoc a.p{font-weight:600; color:#1f2328; padding:0; display:inline}
nav.toc ul.sectoc a.p:hover{background:none; color:var(--accent)}
nav.toc ul.sectoc b{color:var(--accent); font-weight:700; margin-right:4px}
nav.toc .rng{display:block; font-size:11.5px; color:var(--muted); margin-top:3px}
nav.toc a.notes{display:inline-block; margin-top:5px; margin-right:5px; font-size:11.5px; padding:1px 8px; border-radius:20px;
  background:var(--accent-soft); color:var(--accent); border:1px solid rgba(138,90,43,.2)}
nav.toc ul.toc-app{list-style:none; margin:0; padding:0}
tr.sec-row td{background:var(--accent-soft); border-color:var(--line)}
td.hide{display:none}
tr.sec-row td h3.sec-anchor{margin:0; padding:0; background:none; border:none; font-size:17px}
h3.sec-anchor{margin-top:66px; padding:12px 18px; border-radius:10px; background:var(--accent-soft);
  border-left:4px solid var(--accent); color:var(--accent); font-size:18px; scroll-margin-top:20px}
h3.sec-anchor .rng{font-size:13px; color:var(--muted); font-weight:400; margin-left:10px}
main{flex:1 1 auto; min-width:0; padding:44px 56px 90px; max-width:1040px}
h1{font-size:30px; line-height:1.35; margin:0 0 6px; letter-spacing:-.01em}
h2{font-size:22px; margin:56px 0 16px; padding-bottom:8px; border-bottom:2px solid var(--line); letter-spacing:-.005em}
h3{font-size:17.5px; margin:36px 0 12px}
h4{font-size:15.5px; margin:24px 0 10px; color:#39404a}
p{margin:12px 0}
ul,ol{padding-left:26px; margin:12px 0}
li{margin:5px 0}
li > ul, li > ol{margin:5px 0}
strong{font-weight:650}
hr{border:0; border-top:1px solid var(--line); margin:44px 0}
blockquote{
  margin:18px 0; padding:14px 20px; border-left:3px solid var(--accent);
  background:linear-gradient(90deg,var(--accent-soft),rgba(243,236,227,.2));
  border-radius:0 8px 8px 0; color:#2b3138;
}
blockquote p{margin:7px 0}
blockquote strong{color:var(--accent)}
table{border-collapse:collapse; margin:18px 0; font-size:14.2px; display:block; overflow-x:auto; max-width:100%}
thead th{background:#f0ece5; font-weight:650; text-align:left}
th,td{border:1px solid var(--line); padding:8px 11px; vertical-align:top; line-height:1.62}
tbody tr:nth-child(even){background:#faf8f5}
tbody tr:hover{background:var(--accent-soft)}
code{background:var(--code-bg); padding:1.5px 6px; border-radius:4px; font-size:.9em;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace}
pre{background:var(--code-bg); padding:16px 18px; border-radius:8px; overflow-x:auto; border:1px solid var(--line)}
pre code{background:none; padding:0; font-size:13.5px; line-height:1.6}
ul.task-list{list-style:none; padding-left:4px}
ul.task-list li{display:flex; gap:9px; align-items:flex-start}
input[type=checkbox]{margin-top:5px; flex:0 0 auto; accent-color:var(--accent)}
.katex{font-size:1.02em}
td .katex{font-size:.97em}
.katex-display{overflow-x:auto; overflow-y:hidden; padding:2px 0}
.masthead{border-bottom:1px solid var(--line); padding-bottom:18px; margin-bottom:8px}
.masthead .sub{color:var(--muted); font-size:14.5px; margin-top:6px}
.masthead .meta{color:var(--muted); font-size:13px; margin-top:10px}
footer.end{margin-top:70px; padding-top:20px; border-top:1px solid var(--line); color:var(--muted); font-size:13.5px}
.cards{display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:18px; margin:30px 0}
.card{display:block; padding:22px 24px; border:1px solid var(--line); border-radius:12px;
  background:#fff; border-bottom:1px solid var(--line); transition:.15s}
.card:hover{border-color:var(--accent); box-shadow:0 4px 18px rgba(138,90,43,.10); transform:translateY(-1px)}
.card h3{margin:0 0 8px; font-size:17px; color:var(--accent)}
.card p{margin:0; color:var(--muted); font-size:14px}
.card .n{font-size:12.5px; color:var(--muted); margin-top:12px}
.secgrid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; margin:24px 0}
.secgrid a{display:block; padding:16px 18px; border:1px solid var(--line); border-radius:10px; background:#fff; border-bottom:1px solid var(--line)}
.secgrid a:hover{border-color:var(--accent); box-shadow:0 3px 14px rgba(138,90,43,.09)}
.secgrid .sn{font-size:11.5px; letter-spacing:.12em; color:var(--accent); font-weight:700}
.secgrid .st{font-size:15px; font-weight:600; color:#1f2328; margin:4px 0 6px}
.secgrid .sd{font-size:13px; color:var(--muted); line-height:1.6}
@media (max-width:900px){
  .wrap{flex-direction:column}
  nav.toc{position:static; height:auto; flex:none; width:100%; border-right:none; border-bottom:1px solid var(--line)}
  main{padding:28px 20px 60px}
  table{font-size:13.4px}
}
@media print{
  nav.toc{display:none} main{max-width:none; padding:0}
  body{background:#fff; font-size:11pt}
  h2{page-break-after:avoid} table,blockquote{page-break-inside:avoid}
}
`;
fs.writeFileSync(path.join(ASSETS, 'style.css'), CSS, 'utf8');

const KATEX_JS = `  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="./assets/render-math.js"></script>
  <script>window.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('nav.toc a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var t=document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
        if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+t.id);}
      });
    });
  });</script>`;

function page({ title, toc, body, masthead, tocRaw, back, up }) {
  const P = up ? '../' : './';   // 站内资源前缀（notes/ 子目录用 ../）
  const inner = tocRaw
    ? toc
    : `<a class="backlink" href="${back || './index.html'}">← 返回首页</a><h2>目录</h2>${toc || ''}`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="${P}katex/katex.min.css">
<link rel="stylesheet" href="${P}assets/style.css">
</head>
<body>
<div class="wrap">
${toc ? `<nav class="toc">${inner}</nav>` : ''}
<main>
${masthead || ''}
${body}
</main>
</div>
${KATEX_JS.replace(/\.\/assets\//g, P + 'assets/')}
</body>
</html>`;
}

// ---------- 板块导航（学习计划页用） ----------
const secToc = '<div class="toc-lead">按板块分目录（15 个）</div><ul class="sectoc">'
  + SECTIONS.map((s, i) =>
    '<li><a class="p" href="#sec-' + s.from + '"><b>板块 ' + (i + 1) + '</b>' + s.name + '</a>'
    + '<span class="rng">材料 ' + rangeLabel(s) + '　检查点 ' + s.cps.join('、') + '</span>'
    + '<a class="notes" href="./notes/index.html#' + s.f.replace('.md', '') + '">笔记</a>'
    + '<a class="notes" href="./notes/' + s.f.replace('.md', '.html') + '">单页</a></li>'
  ).join('') + '</ul>'
  + '<div class="toc-lead">附录与速查</div><ul class="toc-app">'
  + '<li><a href="#sec-appendix">兴趣支线 · 材料位置 · 数学工具 · 主干线索 · 跟踪对象</a></li>'
  + '<li><a href="./index.html">← 返回首页</a></li></ul>';

// 正文里为每个板块插入锚点标题行
// 标记由 build/mark-plan-sections.js 写在【表格单元格内部】：<td><!--SEC:N--><strong>N</strong></td>
// 这里把它展开成一行标题：标题放该行第一格并跨列，其余格加 class="hide" 由 CSS 隐藏。
// 必须作为表格的一行——插到 <table> 外面或表头与数据行之间会切断表格。
function injectAnchors(html) {
  const countRows = (h) => (h.match(/<strong>\d+[a-f]?<\/strong>/g) || []).length;
  const before = countRows(html);
  let out = html;
  let ok = 0;
  for (let i = 0; i < SECTIONS.length; i++) {
    const s = SECTIONS[i];
    const mark = '<!--SEC:' + s.from + '-->';
    if (!out.includes(mark)) { console.log('  [warn] missing section mark: ' + s.from); continue; }
    const heading = '<h3 class="sec-anchor" id="sec-' + s.from + '">板块 ' + (i + 1) + '｜' + s.name
      + ' <span class="rng">材料 ' + rangeLabel(s) + '　检查点 ' + s.cps.join('、') + '</span></h3>';
    const cols = SECTIONS.cols || 4;
    const empties = new Array(cols - 1).fill('<td class="hide"></td>').join('');

    // 只匹配"首格内含标记"的表格行。<td[^>]*> 与 [\s\S]*? 都有界，
    // 不会像 <tr>[\s\S]*?</tr> 那样跨行回溯、也不会整行替换掉材料行。
    const re = new RegExp('<tr([^>]*)>\\s*<td([^>]*)>' + mark + '([\\s\\S]*?)</tr>');
    if (!re.test(out)) { console.log('  [warn] mark not in first cell: ' + s.from); continue; }
    out = out.replace(re, function (rowHtml, trAttrs, tdAttrs, rest) {
      const titleRow = '<tr class="sec-row"><td colspan="' + cols + '">' + heading + '</td>' + empties + '</tr>';
      const keepRow = '<tr' + trAttrs + '><td' + tdAttrs + '>' + rest;
      return titleRow + keepRow;
    });
    ok++;
  }
  const apx = '<!--SEC-APPENDIX-->';
  const apTag = '<h3 class="sec-anchor" id="sec-appendix">附录与速查</h3>';
  if (out.includes(apx)) out = out.split(apx).join(apTag);
  else console.log('  [warn] missing appendix mark');
  out = out.replace(/<!--SEC[^>]*-->/g, '');

  // 硬校验：材料行一个都不能少（曾因整行替换吞掉第一个材料行）
  const after = countRows(out);
  if (after !== before) throw new Error('material rows changed: ' + before + ' -> ' + after);
  console.log('  板块锚点插入 ' + ok + '/' + SECTIONS.length + '（材料行 ' + after + ' 行守恒）');
  return out;
}
fs.writeFileSync(path.join(OUT, 'learning-plan.html'), page({
  title: '优化器理论学习计划 — 殷润轩',
  toc: secToc,
  tocRaw: true,
  masthead: `<div class="masthead">
    <h1>优化器理论学习计划</h1>
    <div class="sub">从零开始 · 优化器理论 / Scaling Law / 深度学习理论</div>
    <div class="meta">殷润轩 ｜ 中山大学数学学院（珠海）→ 香港中文大学 SEEM ｜ 99 条材料 / 15 个板块 / 20 个检查点 / 225 道自测题</div>
  </div>`,
  body: injectAnchors(read('plan.body.html')),
}));

// ---------- 综述精读页 ----------
fs.writeFileSync(path.join(OUT, 'survey.html'), page({
  title: '优化方法综述精读 — 殷润轩',
  toc: tocOf('survey.toc.html'),
  masthead: `<div class="masthead">
    <h1>优化方法综述精读</h1>
    <div class="sub">arXiv:2604.12968v1《Evolution of Optimization Methods: Algorithms, Scenarios, and Evaluations》逐节讲解</div>
    <div class="meta">殷润轩 ｜ 中山大学数学学院（珠海）→ 香港中文大学 SEEM ｜ 原文 72 页 / 正文 P1–P58 全覆盖</div>
  </div>`,
  body: read('survey.body.html'),
}));

// ---------- 板块索引页（按板块分目录） ----------
{
  const body = SECTIONS.map((s, i) => {
    const nm = s.to - s.from + 1;
    return `<div class="card" style="margin:14px 0">
      <h3 style="margin-bottom:6px">板块 ${i + 1}｜${s.name}</h3>
      <p style="color:var(--fg); font-size:14.5px">${s.note}</p>
      <div class="n">材料 <b>${rangeLabel(s)}</b>（${nm} 条）　｜　检查点 <b>${s.cps.join('、')}</b>　｜　
      <a href="./notes/${s.f.replace('.md', '.html')}">笔记 ${s.f}</a>　｜　
      <a href="./learning-plan.html#sec-${s.from}">跳到计划</a></div>
    </div>`;
  }).join('');
  fs.writeFileSync(path.join(OUT, 'sections.html'), page({
    title: '学习计划索引（按板块） — 殷润轩',
    toc: `<div class="toc-lead">15 个板块</div><ul class="toc-app">`
      + SECTIONS.map((s, i) => `<li><a href="#s${i + 1}">板块 ${i + 1}｜${s.name}</a></li>`).join('')
      + `</ul><div class="toc-lead">其他</div><ul class="toc-app">
      <li><a href="./learning-plan.html">完整学习计划</a></li>
      <li><a href="./notes/index.html">笔记</a></li>
      <li><a href="./index.html">← 返回首页</a></li></ul>`,
    tocRaw: true,
    masthead: `<div class="masthead">
      <h1>学习计划索引</h1>
      <div class="sub">99 条材料按阅读依赖切成 15 个板块</div>
      <div class="meta">每个板块：材料清单 + 自测检查点 + 对应笔记 + 该读综述哪几节</div>
    </div>`,
    body: `<h2 id="s0">板块总览</h2><div class="secgrid">` + SECTIONS.map((s, i) =>
      `<a href="#s${i + 1}"><div class="sn">板块 ${i + 1}</div><div class="st">${s.name}</div>
       <div class="sd">材料 ${rangeLabel(s)}　检查点 ${s.cps.join('、')}</div></a>`).join('') + `</div>`
      + `<h2 id="s1">各板块</h2>`
      + SECTIONS.map((s, i) => `<div id="s${i + 1}" style="scroll-margin-top:20px"></div>`).join('')
      + body,
  }));
}

// ---------- 笔记页（15 个单页 + 1 个合订页） ----------
{
  // 单页
  for (const s of SECTIONS) {
    const key = s.f.replace('.md', '');
    const f = 'note-' + key + '.body.html';
    if (!fs.existsSync(path.join(TMP, f))) { console.log('  ⚠ 缺片段: ' + f); continue; }
    fs.writeFileSync(path.join(NOTES_OUT, key + '.html'), page({
      title: '笔记 ' + key + ' — 殷润轩',
      toc: `<a class="backlink" href="../index.html">← 返回首页</a>
        <div class="toc-lead">本板块</div><ul class="toc-app">
        <li><a href="../learning-plan.html#sec-${s.from}">学习计划中的对应位置</a></li>
        <li><a href="./index.html">全部笔记</a></li></ul>
        <div class="toc-lead">其他板块</div><ul class="toc-app">` +
        SECTIONS.map((x) => `<li><a href="./${x.f.replace('.md', '.html')}">${x.f.replace('.md', '')}</a></li>`).join('') + '</ul>',
      tocRaw: true,
      back: '../index.html',
      up: true,
      masthead: `<div class="masthead"><h1>笔记 ${key}</h1>
        <div class="sub">${s.name}</div>
        <div class="meta">材料 ${rangeLabel(s)}　｜　检查点 ${s.cps.join('、')}　｜　
        <a href="https://github.com/yinrx3/optimizer-learning-plan/blob/main/notes/${s.f}" target="_blank" rel="noopener">${s.f} 源文件</a></div></div>`,
      body: read(f),
    }));
  }
  // 合订页
  const idx = '<div class="toc-lead">15 个板块</div><ul class="toc-app">'
    + SECTIONS.map((s, i) => `<li><a href="#${s.f.replace('.md', '')}">板块 ${i + 1}｜${s.name}</a></li>`).join('')
    + '</ul><div class="toc-lead">其他</div><ul class="toc-app"><li><a href="../index.html">← 返回首页</a></li></ul>';
  const merged = SECTIONS.map((s) => {
    const f = 'note-' + s.f.replace('.md', '') + '.body.html';
    if (!fs.existsSync(path.join(TMP, f))) return '';
    return `<div id="${s.f.replace('.md', '')}" style="scroll-margin-top:20px"></div>` + read(f);
  }).join('\n\n<hr>\n\n');
  fs.writeFileSync(path.join(NOTES_OUT, 'index.html'), page({
    title: '笔记（按板块） — 殷润轩',
    toc: idx,
    tocRaw: true,
    back: '../index.html',
    up: true,
    masthead: `<div class="masthead"><h1>笔记</h1>
      <div class="sub">按学习计划的 15 个板块组织，每篇只放该范围的材料与自测题</div>
      <div class="meta">写笔记时直接在本页对应位置记录，或打开各板块的单页</div></div>`,
    body: merged,
  }));
  console.log('  笔记页生成: 15 单页 + index.html');
}

// ---------- 个人背景页：不生成（公开仓库不含个人履历） ----------
// 本地自用版可临时取消下面注释
// fs.writeFileSync(path.join(OUT, 'background.html'), page({
//   title: '个人背景 — 殷润轩',
//   toc: tocOf('info.toc.html'),
//   masthead: `<div class="masthead">
//     <h1>个人背景与学业信息</h1>
//     <div class="sub">教育经历 · 课程成绩 · 科研 · 荣誉 · 学术服务</div>
//     <div class="meta">殷润轩 ｜ 中山大学数学学院（珠海）</div>
//   </div>`,
//   body: read('info.body.html'),
// }));

// ---------- 落地页 ----------
fs.writeFileSync(path.join(OUT, 'index.html'), `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>殷润轩 — 学习材料</title>
<link rel="stylesheet" href="./katex/katex.min.css">
<link rel="stylesheet" href="./assets/style.css">
</head>
<body>
<div class="wrap"><main style="margin:0 auto">
<div class="masthead">
  <h1>学习材料</h1>
  <div class="sub">优化器理论 · Scaling Law · 深度学习理论</div>
  <div class="meta">殷润轩 ｜ 中山大学数学学院（珠海） ｜ 2026 年 9 月</div>
</div>
<div class="cards">
  <a class="card" href="./sections.html">
    <h3>按板块浏览（15 个）→</h3>
    <p>把 99 条材料按阅读依赖切成 15 个板块，每个板块给出主题、材料范围、对应检查点与笔记入口。</p>
    <div class="n">99 条材料 ｜ 20 个检查点 ｜ 225 道自测题</div>
  </a>
  <a class="card" href="./learning-plan.html">
    <h3>进入学习计划 →</h3>
    <p>按阅读顺序编排的材料总表：从 SGD 到 Muon / Hyperball，含每条的来源、要点、对应综述章节与自测检查点。</p>
    <div class="n">左侧目录已按板块分组</div>
  </a>
  <a class="card" href="./notes/index.html">
    <h3>笔记 →</h3>
    <p>按同样 15 个板块组织的空白笔记，每篇只放该范围的材料清单与自测题。</p>
    <div class="n">15 篇 ｜ 与计划板块一一对应</div>
  </a>
  <a class="card" href="./survey.html">
    <h3>优化方法综述精读 →</h3>
    <p>一篇 72 页优化方法综述的逐节讲解：统一四算子框架、四大范式、23 个优化器的基准，以及每节自承的 open problem。</p>
    <div class="n">Sec 1–6 全覆盖 ｜ 42 张表</div>
  </a>
  <a class="card" href="https://github.com/yinrx3/optimizer-learning-plan">
    <h3>GitHub 仓库 →</h3>
    <p>Markdown 源文件、notes/ 笔记与静态网页构建脚本。</p>
    <div class="n">可 clone 与批注</div>
  </a>
</div>
<h2 style="margin-top:48px">这是什么</h2>
<p><strong>学习计划</strong>是一份按依赖关系排序的阅读路线，主线是一门研究生课程
（<a href="https://optimai-lab.github.io/LLM-OPT/">Optimization for Machine Learning and LLMs</a>），
辅以论文、开源代码与工业界研究博客。每条材料都标注「在哪、学什么、对应综述哪几节」，并在关键节点插入自测检查点。</p>
<p><strong>覆盖范围</strong>：优化器谱系（SGD → 动量 → AdaGrad → RMSProp → Adam → AdamW）、
学习率调度与有效学习率、μP 与超参迁移、矩阵优化器与几何（Muon / Shampoo / Hyperball / Newton–Muon）、
Scaling Law 理论、强化学习（PPO / GRPO 到 MaxRL），以及一条深度学习理论支线。</p>
<footer class="end">页面可直接用浏览器打开，无需服务器。内容与本仓库的 Markdown 源文件同步。</footer>
</main></div>
</body>
</html>
`, 'utf8');

// ---------- KaTeX CSS + 字体（离线本地化） ----------
const vendorCss = fs.readFileSync(path.join(DSH_FE, 'vendor-BNsW4eBh.css'), 'utf8');
let kCss = '';
const ruleRe = /@font-face\{[^}]*\}|\.katex[^{]*\{[^}]*\}/g;
let m;
while ((m = ruleRe.exec(vendorCss)) !== null) kCss += m[0] + '\n';
kCss = kCss.replace(/url\(\.?\/?fonts\/([A-Za-z0-9_]+(?:-[A-Za-z]+)*?)-[A-Za-z0-9_-]{8}\.(woff2|woff|ttf)\)/g,
  (s, base, ext) => (ext === 'woff2' ? `url(fonts/${base}.woff2)` : ''));
kCss = kCss.replace(/,?\s*url\(\)[^,;}]*/g, '');
kCss = kCss.replace(/src:([^;}]*),\s*([;}])/g, 'src:$1$2');
kCss = kCss.replace(/,\s*,/g, ',');
fs.writeFileSync(path.join(KATEX_DIR, 'katex.min.css'), kCss, 'utf8');
console.log('katex.min.css:', kCss.length, 'bytes, @font-face x', (kCss.match(/@font-face/g) || []).length);

let fontCount = 0;
for (const f of fs.readdirSync(path.join(DSH_FE, 'fonts'))) {
  if (!f.startsWith('KaTeX_') || !f.endsWith('.woff2')) continue;
  const clean = f.replace(/-[A-Za-z0-9_-]{8}\.woff2$/, '.woff2');
  fs.copyFileSync(path.join(DSH_FE, 'fonts', f), path.join(KATEX_DIR, 'fonts', clean));
  fontCount++;
}
console.log('字体复制:', fontCount);

// ---------- 数学渲染（含断网降级） ----------
fs.writeFileSync(path.join(ASSETS, 'render-math.js'), `(function(){
  function fail(){
    document.querySelectorAll('span.math').forEach(function(el){
      el.style.fontFamily='ui-monospace,Consolas,monospace';
      el.style.color='#a8562a';
    });
    if (document.getElementById('katex-offline')) return;
    var n=document.createElement('div'); n.id='katex-offline';
    n.style.cssText='position:fixed;left:0;right:0;bottom:0;padding:9px 16px;background:#fdf3e7;border-top:1px solid #e6c9a8;color:#8a5a2b;font-size:13px;z-index:99';
    n.textContent='公式渲染需要联网加载 KaTeX；当前断网，下方显示的是 LaTeX 源码，不影响阅读。';
    document.body.appendChild(n);
  }
  if (typeof katex==='undefined'){ fail(); return; }
  var o={throwOnError:false,errorColor:'#a8562a',strict:false,trust:false};
  document.querySelectorAll('span.math').forEach(function(el){
    var d=el.classList.contains('display');
    try{ katex.render(el.textContent, el, Object.assign({},o,{displayMode:d})); }
    catch(e){ el.style.color='#a8562a'; }
  });
})();`, 'utf8');

// 注意：.tmp 由 build-all.ps1 管理与清理，这里不动它（否则外部校验脚本会读不到片段）
console.log('构建完成 →', OUT);
