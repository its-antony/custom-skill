#!/bin/bash
# retry-download.sh — 带限流的批量重试下载
# 用法: ./retry-download.sh <url_list_file> <output_dir> [delay_ms] [max_retries]
#
# url_list_file 格式（每行）: <local_path> <remote_url>
# 例: imgs/karpathy https://unavatar.io/x/karpathy

URL_LIST="$1"
OUTPUT_DIR="$2"
DELAY_MS="${3:-500}"     # 默认 500ms 间隔
MAX_RETRIES="${4:-3}"    # 默认最多 3 次

if [ -z "$URL_LIST" ] || [ -z "$OUTPUT_DIR" ]; then
  echo "Usage: $0 <url_list_file> <output_dir> [delay_ms] [max_retries]" >&2
  exit 1
fi

DELAY_SEC=$(echo "scale=3; $DELAY_MS / 1000" | bc)
TOTAL=$(wc -l < "$URL_LIST" | tr -d ' ')
SUCCESS=0
FAILED=0
FAILED_LIST=""

USER_AGENTS=(
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
)

echo "Retrying $TOTAL files (delay: ${DELAY_MS}ms, max retries: $MAX_RETRIES)"

COUNT=0
while IFS=' ' read -r LOCAL_PATH REMOTE_URL; do
  [ -z "$LOCAL_PATH" ] && continue
  [ -z "$REMOTE_URL" ] && continue

  COUNT=$((COUNT + 1))
  FULL_PATH="$OUTPUT_DIR/$LOCAL_PATH"

  # 确保目录存在
  mkdir -p "$(dirname "$FULL_PATH")"

  DOWNLOADED=false
  for RETRY in $(seq 1 "$MAX_RETRIES"); do
    # 轮换 User-Agent
    UA_INDEX=$(( (COUNT + RETRY) % ${#USER_AGENTS[@]} ))
    UA="${USER_AGENTS[$UA_INDEX]}"

    curl -sL --max-time 10 -A "$UA" -o "$FULL_PATH" "$REMOTE_URL" 2>/dev/null

    # 验证下载结果
    if [ -f "$FULL_PATH" ]; then
      FILESIZE=$(wc -c < "$FULL_PATH" | tr -d ' ')
      FILETYPE=$(file -b "$FULL_PATH" 2>/dev/null)

      # 检查是否为有效文件（非错误页面，非空）
      if [ "$FILESIZE" -gt 100 ] && ! echo "$FILETYPE" | grep -qi "ASCII text"; then
        DOWNLOADED=true
        break
      elif [ "$FILESIZE" -gt 100 ] && ! head -c 100 "$FULL_PATH" | grep -qiE 'error|1015|forbidden'; then
        DOWNLOADED=true
        break
      fi
    fi

    # 等待后重试
    sleep "$DELAY_SEC"
  done

  if $DOWNLOADED; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAILED=$((FAILED + 1))
    FAILED_LIST="$FAILED_LIST$LOCAL_PATH\n"
    rm -f "$FULL_PATH"  # 清理无效文件
  fi

  # 限流
  sleep "$DELAY_SEC"

  # 进度
  if [ $((COUNT % 10)) -eq 0 ]; then
    echo "  Progress: $COUNT/$TOTAL (success: $SUCCESS, failed: $FAILED)"
  fi
done < "$URL_LIST"

echo ""
echo "=== Retry Download Report ==="
echo "Total: $TOTAL"
echo "Success: $SUCCESS"
echo "Failed: $FAILED"

if [ -n "$FAILED_LIST" ]; then
  echo ""
  echo "=== Still Failed ==="
  echo -e "$FAILED_LIST"
fi
