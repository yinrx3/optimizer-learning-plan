// write-paths.js —— 输出构建所需的路径清单（UTF-8 写入 JSON）
// 目的：build-all.ps1 里不再出现中文文件名，避免 PowerShell 5.1 把 UTF-8 脚本当 ANSI 读而乱码
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\yinrx\\Desktop\\carefulreading';

const paths = {
  root: ROOT,
  plan: '学习与追踪清单.md',
  survey: '综述精读-优化方法演化.md',
  index: '学习计划索引.md',
  luaFilter: 'math-to-span.lua',
  tmp: 'web/.tmp',
};

fs.writeFileSync(path.join(ROOT, 'build', 'paths.json'),
  JSON.stringify(paths, null, 2), 'utf8');
console.log('paths.json 已写出；plan=' + paths.plan + ' survey=' + paths.survey);
