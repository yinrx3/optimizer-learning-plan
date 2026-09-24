# Rebuild the static site.  Usage (from repo root):  .\build-all.ps1
#
# 设计约束（两个，都是踩过的坑）：
#  1) 沙箱禁止 node 通过管道 spawn 子进程，所以 pandoc 必须由 PowerShell 调用，
#     node 只负责读片段与组装 HTML。
#  2) PowerShell 5.1 会把 UTF-8 的 .ps1 当 ANSI 读，脚本里的中文文件名会变乱码。
#     因此脚本内不写任何中文，路径来自 build/paths.json（由 node 以 UTF-8 写出）。
#
# 每一步都检查退出码——pandoc 失败时绝不能继续，否则会拿旧片段或缺失片段
# 装出一个"看起来成功"的页面。

$ErrorActionPreference = 'Stop'
$R = Split-Path -Parent $MyInvocation.MyCommand.Path

# 控制台用 UTF-8，避免中文输出乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Invoke-Step {
    param([string]$Label, [scriptblock]$Block)
    Write-Host ("  - " + $Label)
    & $Block
    if ($LASTEXITCODE -ne 0) {
        throw ("step failed (" + $LASTEXITCODE + "): " + $Label)
    }
}

Write-Host "repo root: $R"

# ---------- 0) 路径清单 ----------
Invoke-Step "write paths.json" { node (Join-Path $R 'build\write-paths.js') }
$P = Get-Content (Join-Path $R 'build\paths.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$PLAN = Join-Path $R $P.plan
$SURVEY = Join-Path $R $P.survey
$TMP = Join-Path $R ($P.tmp -replace '/', '\')
$LUA = Join-Path $R $P.luaFilter

foreach ($f in @($PLAN, $SURVEY, $LUA)) {
    if (-not (Test-Path $f)) { throw "missing input: $f" }
}

# ---------- 1) notes/*.md ----------
Write-Host "`n[1/5] notes"
Invoke-Step "build-notes.js" { node (Join-Path $R 'build\build-notes.js') }

# ---------- 2) 板块标记 ----------
Write-Host "`n[2/5] section markers"
Invoke-Step "mark-plan-sections.js" { node (Join-Path $R 'build\mark-plan-sections.js') }

# ---------- 3) pandoc 片段 ----------
Write-Host "`n[3/5] pandoc fragments"
New-Item -ItemType Directory -Force -Path $TMP | Out-Null
Get-ChildItem $TMP -File -ErrorAction SilentlyContinue | Remove-Item -Force

$common = @('-f', 'markdown+pipe_tables+tex_math_dollars+footnotes+task_lists',
            '-t', 'html5', '--lua-filter', $LUA,
            '--wrap=none', '--syntax-highlighting=none')

Invoke-Step "plan body" { & pandoc $PLAN @common -o (Join-Path $TMP 'plan.body.html') }
Invoke-Step "survey toc" { & pandoc $SURVEY @common -s --toc --toc-depth=3 -o (Join-Path $TMP 'survey.toc.html') }
Invoke-Step "survey body" { & pandoc $SURVEY @common -o (Join-Path $TMP 'survey.body.html') }

$notesDir = Join-Path $R 'notes'
Get-ChildItem $notesDir -Filter '*.md' | ForEach-Object {
    $out = Join-Path $TMP ('note-' + $_.BaseName + '.body.html')
    Invoke-Step ("note " + $_.BaseName) { & pandoc $_.FullName @common -o $out }
}

$fragCount = (Get-ChildItem $TMP -File).Count
Write-Host ("  fragments: " + $fragCount)
if ($fragCount -lt 18) { throw "too few fragments ($fragCount) - pandoc likely failed" }

foreach ($need in @('plan.body.html', 'survey.body.html', 'survey.toc.html')) {
    $p = Join-Path $TMP $need
    if (-not (Test-Path $p)) { throw "missing fragment: $need" }
    if ((Get-Item $p).Length -lt 1000) { throw "fragment too small: $need" }
}

# ---------- 4) 组装 ----------
Write-Host "`n[4/5] assemble"
Invoke-Step "build-web.js" { node (Join-Path $R 'build-web.js') }

$lp = Join-Path $R 'web\learning-plan.html'
if (-not (Test-Path $lp)) { throw "learning-plan.html was not generated" }

# ---------- 5) 校验 ----------
Write-Host "`n[5/5] verify"
Invoke-Step "check-tables" { node (Join-Path $R 'build\check-tables.js') $lp }
Invoke-Step "verify-web" { node (Join-Path $R 'build\verify-web.js') }

Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "`ndone -> web/index.html"
