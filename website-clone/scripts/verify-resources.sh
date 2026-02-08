#!/bin/bash
# verify-resources.sh — 验证克隆资源的完整性
# 输出: JSON 格式的验证报告
# 用法: ./verify-resources.sh <cloned_dir>

DIR="$1"
if [ -z "$DIR" ] || [ ! -d "$DIR" ]; then
  echo "Usage: $0 <cloned_directory>" >&2
  exit 1
fi

TOTAL=0
VALID=0
BROKEN=0
MISSING=0
BROKEN_FILES=""

# 检查所有非 HTML 文件
while IFS= read -r filepath; do
  TOTAL=$((TOTAL + 1))

  if [ ! -f "$filepath" ]; then
    MISSING=$((MISSING + 1))
    continue
  fi

  FILESIZE=$(wc -c < "$filepath" | tr -d ' ')

  # 0 字节文件
  if [ "$FILESIZE" -eq 0 ]; then
    BROKEN=$((BROKEN + 1))
    BROKEN_FILES="$BROKEN_FILES$filepath (empty)\n"
    continue
  fi

  # 检查文件是否是错误页面（ASCII text 但应该是图片/字体）
  FILETYPE=$(file -b "$filepath")
  EXTENSION="${filepath##*.}"

  case "$EXTENSION" in
    jpg|jpeg|png|gif|webp|svg|ico|avif)
      if echo "$FILETYPE" | grep -qiE 'image|SVG'; then
        VALID=$((VALID + 1))
      else
        BROKEN=$((BROKEN + 1))
        BROKEN_FILES="$BROKEN_FILES$filepath ($FILETYPE)\n"
      fi
      ;;
    woff|woff2|ttf|otf|eot)
      if echo "$FILETYPE" | grep -qiE 'font|Web Open Font|TrueType|OpenType|data'; then
        VALID=$((VALID + 1))
      else
        BROKEN=$((BROKEN + 1))
        BROKEN_FILES="$BROKEN_FILES$filepath ($FILETYPE)\n"
      fi
      ;;
    *)
      # 对于没有扩展名的文件（如头像），检查是否是有效的图片
      if echo "$FILETYPE" | grep -qiE 'image|JPEG|PNG|GIF|WebP|SVG'; then
        VALID=$((VALID + 1))
      elif echo "$FILETYPE" | grep -qiE 'HTML|CSS|JavaScript|JSON|text'; then
        # 文本文件大于 50 字节认为有效
        if [ "$FILESIZE" -gt 50 ]; then
          VALID=$((VALID + 1))
        else
          BROKEN=$((BROKEN + 1))
          BROKEN_FILES="$BROKEN_FILES$filepath (too small: ${FILESIZE}B)\n"
        fi
      elif echo "$FILETYPE" | grep -qi 'ASCII text'; then
        # ASCII text 但没有扩展名 → 可能是错误页面
        CONTENT_HEAD=$(head -c 100 "$filepath")
        if echo "$CONTENT_HEAD" | grep -qiE 'error|not found|forbidden|403|404|1015'; then
          BROKEN=$((BROKEN + 1))
          BROKEN_FILES="$BROKEN_FILES$filepath (error page)\n"
        else
          VALID=$((VALID + 1))
        fi
      else
        VALID=$((VALID + 1))
      fi
      ;;
  esac
done < <(find "$DIR" -type f -not -name "*.html" -not -name ".DS_Store" -not -path "*/.webclone-backup/*")

# 输出报告
echo "=== Resource Verification Report ==="
echo "Total files: $TOTAL"
echo "Valid: $VALID"
echo "Broken: $BROKEN"
echo "Missing: $MISSING"
echo "Integrity: $((VALID * 100 / (TOTAL > 0 ? TOTAL : 1)))%"

if [ -n "$BROKEN_FILES" ]; then
  echo ""
  echo "=== Broken Files ==="
  echo -e "$BROKEN_FILES"
fi
