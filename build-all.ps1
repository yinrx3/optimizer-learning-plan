# Rebuild the static site.  Usage:  .\build-all.ps1
# pandoc is invoked from PowerShell (the sandbox blocks node from spawning
# child processes with piped stdio); node only assembles the HTML.

$ErrorActionPreference = 'Stop'
$R = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "repo root: $R"

Write-Host "`n[1/4] notes/*.md"
node (Join-Path $R '.survey-chunks\build-notes.js')

Write-Host "`n[2/4] section markers"
node (Join-Path $R '.survey-chunks\mark-plan-sections.js')

Write-Host "`n[3/4] pandoc fragments"
$tmp = Join-Path $R 'web\.tmp'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$common = @('-f', 'markdown+pipe_tables+tex_math_dollars+footnotes+task_lists',
            '-t', 'html5',
            '--lua-filter', (Join-Path $R 'math-to-span.lua'),
            '--wrap=none', '--syntax-highlighting=none')

& pandoc (Join-Path $R '学习与追踪清单.md') @common -o (Join-Path $tmp 'plan.body.html')
& pandoc (Join-Path $R '综述精读-优化方法演化.md') @common -s --toc --toc-depth=3 -o (Join-Path $tmp 'survey.toc.html')
& pandoc (Join-Path $R '综述精读-优化方法演化.md') @common -o (Join-Path $tmp 'survey.body.html')
Get-ChildItem (Join-Path $R 'notes') -Filter '*.md' | ForEach-Object {
  & pandoc $_.FullName @common -o (Join-Path $tmp ('note-' + $_.BaseName + '.body.html'))
}
Write-Host ("  fragments: " + (Get-ChildItem $tmp -File).Count)

Write-Host "`n[4/4] assemble"
node (Join-Path $R 'build-web.js')

Write-Host "`n=== verify ==="
node (Join-Path $R '.survey-chunks\verify-web.js')
Remove-Item (Join-Path $R 'web\.tmp') -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "`ndone -> web/index.html"
