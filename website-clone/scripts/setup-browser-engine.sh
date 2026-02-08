#!/bin/bash
# setup-browser-engine.sh — 安装浏览器克隆引擎依赖
# 用法: bash setup-browser-engine.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[setup] 安装 npm 依赖..."
cd "$SCRIPT_DIR"
npm install --production

echo "[setup] 安装 Chromium..."
if npx puppeteer browsers install chrome 2>/dev/null; then
  echo "[setup] Chromium 安装成功"
else
  echo "[setup] Puppeteer Chromium 安装失败，检测系统 Chrome..."
  # macOS 系统 Chrome 路径
  CHROME_PATHS=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  )
  FOUND_CHROME=""
  for p in "${CHROME_PATHS[@]}"; do
    if [ -x "$p" ]; then
      FOUND_CHROME="$p"
      break
    fi
  done

  if [ -n "$FOUND_CHROME" ]; then
    echo "[setup] 找到系统 Chrome: $FOUND_CHROME"
    echo "[setup] 设置 PUPPETEER_EXECUTABLE_PATH 环境变量即可使用"
    echo "export PUPPETEER_EXECUTABLE_PATH=\"$FOUND_CHROME\""
  else
    echo "[setup] 错误: 未找到 Chrome/Chromium" >&2
    echo "[setup] 请安装 Google Chrome 或运行: npx puppeteer browsers install chrome" >&2
    exit 1
  fi
fi

echo "[setup] 验证安装..."
node -e "import('website-scraper').then(() => console.log('[setup] website-scraper OK'))"
node -e "import('website-scraper-puppeteer').then(() => console.log('[setup] website-scraper-puppeteer OK'))"

echo "[setup] 浏览器克隆引擎安装完成"
