@echo off
REM ============================================================
REM  把本地已完成的提交推送到 GitHub
REM  前提：你已经在这个地址手动新建了空仓库（不要勾 README）
REM        https://github.com/new?name=optimizer-learning-plan&visibility=public
REM  运行时会弹出浏览器让你登录 GitHub 授权（仅第一次）
REM ============================================================
cd /d "%~dp0"

echo.
echo [1/4] 切到 main 分支
git branch -M main

echo.
echo [2/4] 设置远端
git remote set-url origin https://github.com/yinrx3/optimizer-learning-plan.git 2>nul || git remote add origin https://github.com/yinrx3/optimizer-learning-plan.git

echo.
echo [3/4] 推送（会弹浏览器要求登录授权）
git push -u origin main
if errorlevel 1 (
  echo.
  echo   !! 推送失败。常见原因：
  echo      - 仓库还没建：请先打开下面的地址新建空仓库
  echo        https://github.com/new?name=optimizer-learning-plan^&visibility=public
  echo      - 登录被取消，或没有该仓库的写权限
  echo.
  pause
  exit /b 1
)

echo.
echo [4/4] 完成
echo.
echo   仓库地址 : https://github.com/yinrx3/optimizer-learning-plan
echo   开启 Pages: 仓库 Settings -^> Pages -^> Source 选 "Deploy from a branch"
echo               Branch 选 main / 目录选 / (root)  -^> Save
echo   网页地址 : https://yinrx3.github.io/optimizer-learning-plan/
echo.
pause
