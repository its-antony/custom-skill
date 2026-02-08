#!/bin/bash
# detect-site-type.sh — 检测网站是静态站还是 SPA
# 输出: "static" 或 "spa"
# 用法: ./detect-site-type.sh <url>

URL="$1"
if [ -z "$URL" ]; then
  echo "Usage: $0 <url>" >&2
  exit 1
fi

# 获取页面 HTML（跟随重定向，5秒超时）
HTML=$(curl -sL --max-time 5 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "$URL" 2>/dev/null)

if [ -z "$HTML" ]; then
  echo "error: failed to fetch $URL" >&2
  echo "static"  # 降级到 GoClone
  exit 0
fi

# 计算纯文本内容长度（去掉 HTML 标签后）
TEXT_LENGTH=$(echo "$HTML" | sed 's/<[^>]*>//g' | tr -s '[:space:]' | wc -c | tr -d ' ')

# SPA 特征检测
SPA_SIGNALS=0

# 1. 页面文本内容极少（<500 字符去标签后）
if [ "$TEXT_LENGTH" -lt 500 ]; then
  SPA_SIGNALS=$((SPA_SIGNALS + 2))
fi

# 2. 有明显的 SPA 挂载点
if echo "$HTML" | grep -qE 'id="(root|app|__next|__nuxt)"'; then
  SPA_SIGNALS=$((SPA_SIGNALS + 2))
fi

# 3. 大型 JS bundle 引用
JS_COUNT=$(echo "$HTML" | grep -oE '<script[^>]+src="[^"]*"' | wc -l | tr -d ' ')
if [ "$JS_COUNT" -gt 5 ]; then
  SPA_SIGNALS=$((SPA_SIGNALS + 1))
fi

# 4. 包含 React/Vue/Angular 特征
if echo "$HTML" | grep -qE 'data-reactroot|__NEXT_DATA__|__NUXT__|ng-app|ng-version'; then
  SPA_SIGNALS=$((SPA_SIGNALS + 2))
fi

# 5. Next.js RSC / Turbopack 特征（SSR 但需要浏览器渲染）
if echo "$HTML" | grep -qE 'self\.__next_f|turbopack|_next/static'; then
  SPA_SIGNALS=$((SPA_SIGNALS + 3))
fi

# 6. Framer Motion 动画冻结风险（大量 opacity:0）
OPACITY_ZERO_COUNT=$(echo "$HTML" | grep -oE 'opacity:\s*0' | wc -l | tr -d ' ')
if [ "$OPACITY_ZERO_COUNT" -gt 5 ]; then
  SPA_SIGNALS=$((SPA_SIGNALS + 2))
fi

# 7. Nuxt.js 特征
if echo "$HTML" | grep -qE '__NUXT__|nuxt-link|_nuxt/'; then
  SPA_SIGNALS=$((SPA_SIGNALS + 3))
fi

# 判断：SPA_SIGNALS >= 3 认为是 SPA
if [ "$SPA_SIGNALS" -ge 3 ]; then
  echo "spa"
else
  echo "static"
fi
