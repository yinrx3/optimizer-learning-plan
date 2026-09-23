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
| **总表** | 94 条材料，按阅读顺序排列。每条含「先看什么 / 材料在哪 / 学习什么」 |
| **检查点** | 19 个自测关卡，插在关键节点。每个含 3–4 段核心洞察 + 6–10 道自测题（含面试级问题） |
| **教育/理论支线** | 深度学习理论（Grokking、表示学习、对称性、位置编码） |
| **本地材料索引** | 手头 PDF 对应总表第几行 |
| **前置自查** | 数学端与深度学习端分别列出自查项，并标注「什么时候用得到」 |
| **三条主干线索** | 范数→几何→优化器 / Fisher 信息→二阶方法 / 步子该迈多大 |

### 覆盖范围

- **优化器谱系**：SGD、动量、Nesterov、AdaGrad、RMSProp、sign-SGD、Adam、AdamW
- **步长与调度**：学习率调度形状、有效学习率（ELR / AUS）、权重范数动力学、μP 与超参迁移
- **矩阵优化器与几何**：Shampoo、K-FAC、Muon、Newton–Muon、Hyperball、各向同性曲率模型、谱 Wasserstein 流
- **Scaling Law**：Kaplan、Chinchilla、多重幂律、Max-Bottleneck 原理
- **强化学习**：GAE、TRPO、PPO、GRPO、DAPO、R²VPO、TailRL、MaxRL
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

---

## 本地构建

需要 [Pandoc](https://pandoc.org/) 与 Node.js。

```powershell
# 1) 用 pandoc 生成 HTML 片段（math-to-span.lua 负责让公式原样交给浏览器端 KaTeX）
pandoc 学习与追踪清单.md -f gfm+tex_math_dollars+pipe_tables -t html5 `
  --lua-filter math-to-span.lua --syntax-highlighting=none -o web/.tmp/plan.body.html
pandoc 学习与追踪清单.md -f gfm+tex_math_dollars+pipe_tables -t html5 `
  --lua-filter math-to-span.lua --syntax-highlighting=none -s --toc --toc-depth=2 -o web/.tmp/plan.toc.html

# 2) 组装成静态页
node build-web.js
```

产物在 `web/`，纯静态、无服务器依赖。

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
