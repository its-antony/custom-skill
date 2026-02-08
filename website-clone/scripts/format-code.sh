#!/bin/bash
# format-code.sh — 使用 prettier 格式化克隆的代码文件
# 用法: ./format-code.sh <cloned_dir>

DIR="$1"
if [ -z "$DIR" ] || [ ! -d "$DIR" ]; then
  echo "Usage: $0 <cloned_directory>" >&2
  exit 1
fi

# 检查 prettier 是否可用
if ! command -v npx &> /dev/null; then
  echo "Error: npx not found. Please install Node.js." >&2
  exit 1
fi

FORMATTED=0
FAILED=0

# 格式化 HTML
while IFS= read -r f; do
  if npx --yes prettier --write --parser html "$f" 2>/dev/null; then
    FORMATTED=$((FORMATTED + 1))
    echo "  ✅ $(basename "$f")"
  else
    FAILED=$((FAILED + 1))
    echo "  ❌ $(basename "$f") (prettier failed)"
  fi
done < <(find "$DIR" -maxdepth 2 -name "*.html" -type f)

# 格式化 CSS
while IFS= read -r f; do
  # 跳过 fonts.css（我们自己生成的）
  [[ "$(basename "$f")" == "fonts.css" ]] && continue
  if npx --yes prettier --write --parser css "$f" 2>/dev/null; then
    FORMATTED=$((FORMATTED + 1))
    echo "  ✅ $(basename "$f")"
  else
    FAILED=$((FAILED + 1))
    echo "  ❌ $(basename "$f") (prettier failed)"
  fi
done < <(find "$DIR" -maxdepth 2 -name "*.css" -type f)

# 格式化 JS
while IFS= read -r f; do
  if npx --yes prettier --write --parser babel "$f" 2>/dev/null; then
    FORMATTED=$((FORMATTED + 1))
    echo "  ✅ $(basename "$f")"
  else
    FAILED=$((FAILED + 1))
    echo "  ❌ $(basename "$f") (prettier failed)"
  fi
done < <(find "$DIR" -maxdepth 2 -name "*.js" -type f)

echo ""
echo "=== Format Report ==="
echo "Formatted: $FORMATTED"
echo "Failed: $FAILED"
