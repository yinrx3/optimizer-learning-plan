# build/ —— 构建与校验脚本

网页由 PowerShell + pandoc + node 三步生成。在仓库根目录执行 `.\build-all.ps1` 即可。

## 为什么分两步（两个踩过的坑）

**1. pandoc 必须由 PowerShell 调用。**
沙箱禁止 node 通过管道 spawn 子进程（`spawnSync pandoc EPERM`），所以 node 不能自己跑 pandoc。分工是：PowerShell 调 pandoc 生成 HTML 片段到 `web/.tmp/`，node 只负责读片段、套模板、写最终页面。

**2. PowerShell 5.1 会把 UTF-8 的 `.ps1` 当 ANSI 读。**
脚本里写中文文件名会变成乱码（`学习与追踪清单.md` → `学习与追踪清�?md`），pandoc 随即失败。所以 **`build-all.ps1` 里不出现任何中文**，文件名统一从 `paths.json` 读取（由 `write-paths.js` 以 UTF-8 写出）。

`build-all.ps1` 的每一步都检查退出码，片段数量不足或缺关键片段会直接报错中止——否则会拿旧片段或缺失片段装出一个"看起来成功"的页面。

## 板块标记的硬约束

15 个板块的锚点靠 md 里的 `<!--SEC:N-->` 标记定位，**标记必须写在表格单元格内部**：

```markdown
| <!--SEC:1-->**1** | 课程主页目录 | ... |
```

三种写法会**打断 pandoc 的 pipe table 解析**（`<tbody>` 变空、数据行退化成 `<div class="line-block">` 纯文本）：

- 独立成行放在 `## 标题` 与表头之间
- 独立成行放在表头分隔行与第一条数据行之间
- 单独占满一行（`| <!--SEC:1--> | | | |`）

`check-tables.js` 会在每次构建后校验这一点：`line-block` 与空 `tbody` 必须为 0，材料行数必须守恒（99 行）。展开标记时只替换"含标记的那一格"，并在该行**之前**另插一行标题——**不能整行替换**，否则会吞掉该板块的第一条材料。

## 脚本清单

| 脚本 | 作用 | 谁调用 |
|---|---|---|
| `write-paths.js` | 写出 `paths.json`（含中文文件名，UTF-8） | `build-all.ps1` |
| `build-notes.js` | 生成 `notes/*.md`（材料清单 + 该范围自测题） | `build-all.ps1` |
| `mark-plan-sections.js` | 在总表行首格插入板块标记（幂等） | `build-all.ps1` |
| `make-index-md.js` | 生成 `学习计划索引.md` 与 `sections.json` | 手动 |
| `sections.json` | **15 个板块定义的单一来源**（`build-web.js` 读它） | — |
| `check-tables.js` | 校验表格是否被标记打断 | `build-all.ps1` |
| `verify-web.js` | 校验页面完整性、板块锚点、站内断链 | `build-all.ps1` |
| `verify-plan.js` | 校验清单表格结构、检查点与题目编号 | 手动 |
| `verify-repo.js` | 推送前校验仓库内页面与链接 | 手动 |
| `dump-questions.js` | 列出各检查点题目（核对归属用） | 手动 |
| `scan-broken-tex.js` | 扫描 LaTeX 命令损坏（曾抓到 `\Rightarrow` 丢反斜杠） | 手动 |

## 依赖

- [Pandoc](https://pandoc.org/)（用 `markdown+pipe_tables+tex_math_dollars` 读，`math-to-span.lua` 把公式原样交给浏览器端 KaTeX）
- Node.js

## 已知限制

- KaTeX 的 CSS 与字体已本地化（`katex/`），但 **JS 走 CDN**。断网时公式显示为 LaTeX 源码，不影响阅读。
- 构建脚本按 Windows 路径写（`\` 分隔）。换平台需调整 `build-all.ps1` 与各脚本里的 `ROOT`。
