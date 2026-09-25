# 优化器理论学习计划

一份按**依赖关系**排序的阅读路线，从零开始学优化器理论。主线是一门研究生课程，辅以论文、开源代码与工业界研究博客。

**在线浏览：** https://yinrx3.github.io/optimizer-learning-plan/

---

## 这份计划解决什么问题

学优化器最容易踩的坑是**顺序错**——直接读 Muon 或 Hyperball，会遇到一堆没学过的概念（有效学习率、谱范数、μP），每篇论文都在同时引入三四个新东西，读起来只会越来越糊。

这份计划的做法是：

1. **先补语境**（神经网络的梯度为什么和经典优化不一样）
2. **再走谱系**（SGD → 动量 → AdaGrad → RMSProp → Adam → AdamW，每一代补前一代的一个具体缺陷）
3. **然后才到几何**（矩阵参数、范数选择、Muon / Shampoo / Hyperball）
4. **标注了每一步的依赖**，说明哪些阶段不能颠倒

## 内容结构

| 部分 | 内容 |
|---|---|
| **总表** | 100 条材料，按阅读顺序排列。每条含「先看什么 / 材料在哪 / 学习什么 / **对应综述哪几节**」 |
| **15 个板块** | 总表按阅读依赖切成的板块。每个板块给出主题、材料范围、对应检查点与笔记入口 |
| **检查点** | 20 个自测关卡，插在关键节点。每个含 3–4 段核心洞察 + 若干自测题（含面试级问题），共 **225 道题** |
| **notes/** | 15 篇分板块笔记，每篇只放该范围的材料清单与自测题，其余留空供记录 |
| **教育/理论支线** | 深度学习理论（Grokking、表示学习、对称性、位置编码） |
| **本地材料索引** | 手头 PDF 对应总表第几行 |
| **前置自查** | 数学端与深度学习端分别列出自查项，并标注「什么时候用得到」 |
| **三条主干线索** | 范数→几何→优化器 / Fisher 信息→二阶方法 / 步子该迈多大 / 三个正交的设计轴 |

### 15 个板块

| # | 板块 | 材料 | 检查点 |
|:-:|---|:-:|:-:|
| 1 | 基础：优化问题与 SGD 的定位 | 1–9 | 1 |
| 2 | 动量 | 10–13 | 2 |
| 3 | 自适应步长：AdaGrad / sign-SGD / RMSProp | 14–17 | 3 |
| 4 | Adam、AdamW 与收敛性之争 | 18–27 | 4、5、6 |
| 5 | 三篇待处理的论文（综述 / Adam 动力学 / 加速 SGD） | 28–30 | 7、8 |
| 6 | 学习率调度与 warmup | 31–37 | 9 |
| 7 | μP、超参迁移与有效学习率 | 38–46 | 10 |
| 8 | 优化器设计 = 不同范数下的最速下降 | 47–52 | 11 |
| 9 | Shampoo、K-FAC 与 Muon 的实现 | 53–58 | 12 |
| 10 | 正交化的理论、Hyperball 与争论 | 59–65 | 13 |
| 11 | 苏炜杰的两篇与导师论文 | 66–70 | 14、15 |
| 12 | Scaling Law | 71–78 | 16 |
| 13 | 强化学习：从 GAE 到 DAPO / MaxRL | 79–86 | 17 |
| 14 | 训练不稳定性与 RL 目标设计 | 87–90 | 18 |
| 15 | 零阶优化与函数空间的牛顿法 | 91–94 | 19、20 |

### 覆盖范围

- **优化器谱系**：SGD、动量、Nesterov、AdaGrad、RMSProp、sign-SGD、Adam、AdamW
- **步长与调度**：学习率调度形状、有效学习率（ELR / AUS）、权重范数动力学、μP 与超参迁移
- **矩阵优化器与几何**：Shampoo、K-FAC、Muon、Newton–Muon、Hyperball、各向同性曲率模型、谱 Wasserstein 流
- **Scaling Law**：Kaplan、Chinchilla、多重幂律、Max-Bottleneck 原理
- **强化学习**：GAE、TRPO、PPO、GRPO、DAPO、R²VPO、TailRL、MaxRL
- **零阶优化**：有限差分估计、MeZO 与显存高效微调
- **深度学习理论**：Grokking、lazy training、隐式正则、G-CNN、几何深度学习、RoPE

---

## 主线课程

[**Optimization for Machine Learning and Large Language Models**](https://optimai-lab.github.io/LLM-OPT/)（OptimAI-Lab）

由 Mingyi Hong（University of Minnesota）、Athanasios Glentis、Jiaxiang Li（Meta）、**Hoi-To Wai（CUHK SEEM）** 编写。

课程第 4 章的组织方式很值得推荐：**优化器设计 = 在最速下降里选一个范数**——

| 范数选择 | 推出的算法 |
|---|---|
| $\ell_2$ | SGD |
| $\ell_\infty$ | sign-SGD |
| 谱范数（对偶是核范数） | Muon（正交化） |

另一条独立路径从 Fisher 信息出发，对角近似恰好给出 Adam，Kronecker 分解给出 Shampoo。两条路在 $\beta = 0$ 时汇合。

另有一份配套的 **72 页优化方法综述精读**（arXiv:2604.12968v1），逐节讲解 Sec 1–6，见站点上的「优化方法综述精读」页。

---

## 文件说明

| 文件 / 目录 | 内容 |
|---|---|
| `学习与追踪清单.md` | 主文件：总表 + 20 个检查点 + 附录 |
| `学习计划索引.md` | 按 15 个板块的索引 |
| `notes/` | 15 篇分板块笔记（Markdown，可直接批注） |
| `综述精读-优化方法演化.md` | 配套综述的逐节讲解 |
| `web/` | 构建产物（静态站，含 20 个页面） |
| `build-all.ps1` | 一键重建网页 |
| `build-web.js` | 组装 HTML 模板（node，不含 pandoc 调用） |
| `math-to-span.lua` | Pandoc 过滤器，把公式原样交给浏览器端 KaTeX |
| `build/` | 构建与校验脚本（`sections.json` 是 15 个板块定义的单一来源） |

## 本地构建

需要 [Pandoc](https://pandoc.org/) 与 Node.js。在仓库根目录执行：

```powershell
.\build-all.ps1
```

它会依次：生成 `notes/*.md` → 在总表插入板块标记 → 用 pandoc 生成 HTML 片段 → 用 node 组装 `web/` → 校验断链。

> **为什么分两步**：沙箱禁止 node 通过管道 spawn 子进程，所以 pandoc 必须由 PowerShell 调用，node 只负责读片段与套模板。

> **为什么要用 Lua 过滤器**：Pandoc 自带的 TeX 解析器会拒绝 `\lVert`、`\textstyle` 等写法。过滤器把公式原样输出成 `<span class="math">`，交给浏览器端的 KaTeX 渲染，完全绕开这个限制。

### 关于公式渲染

KaTeX 的 **CSS 与字体已本地化**（`katex/`），但 **JS 走 CDN**。断网时页面仍可读——公式会以等宽字体显示 LaTeX 源码，并在页脚给出提示。

---

## 说明

- 这是一份**学习计划**，不是研究成果。清单里的勾选框表示「已读」，未勾选表示待读。
- 标注 ⭐ 的是该阶段的关键材料；标「可选」的可以跳过。
- 引用外部材料时均给出链接，版权归原作者所有。

## License

内容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 提供。引用的论文、课程与博客版权归各自作者。
