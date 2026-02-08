#!/usr/bin/env python3
"""generate-placeholder.py — 为缺失的头像图片生成 SVG 占位符

用法: python3 generate-placeholder.py <output_dir> <name1> <name2> ...
例:   python3 generate-placeholder.py ./imgs karpathy hey_zilla bangnokia
"""

import sys
import os
import hashlib

# 柔和的颜色调色板
COLORS = [
    ("#FF6B6B", "#FFF"),  # 红
    ("#4ECDC4", "#FFF"),  # 青
    ("#45B7D1", "#FFF"),  # 蓝
    ("#96CEB4", "#FFF"),  # 绿
    ("#FFEAA7", "#333"),  # 黄
    ("#DDA0DD", "#FFF"),  # 紫
    ("#FF8C42", "#FFF"),  # 橙
    ("#98D8C8", "#333"),  # 薄荷
    ("#F7DC6F", "#333"),  # 金
    ("#BB8FCE", "#FFF"),  # 淡紫
]

SVG_TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" rx="200" fill="{bg}"/>
  <text x="200" y="200" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="160" font-weight="600" fill="{fg}">{initials}</text>
</svg>'''


def get_initials(name: str) -> str:
    """从用户名提取 1-2 个首字母"""
    # 去掉常见前缀后缀
    clean = name.replace("_", " ").replace("-", " ").replace(".", " ").strip()
    parts = clean.split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    elif len(clean) >= 2:
        return clean[:2].upper()
    elif len(clean) == 1:
        return clean.upper()
    return "?"


def get_color(name: str) -> tuple:
    """根据名字确定性地选择颜色"""
    h = int(hashlib.md5(name.encode()).hexdigest()[:8], 16)
    return COLORS[h % len(COLORS)]


def generate_svg(name: str) -> str:
    initials = get_initials(name)
    bg, fg = get_color(name)
    return SVG_TEMPLATE.format(bg=bg, fg=fg, initials=initials)


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate-placeholder.py <output_dir> <name1> [name2] ...", file=sys.stderr)
        sys.exit(1)

    output_dir = sys.argv[1]
    names = sys.argv[2:]

    os.makedirs(output_dir, exist_ok=True)

    generated = 0
    for name in names:
        svg = generate_svg(name)
        filepath = os.path.join(output_dir, name)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg)
        generated += 1

    print(f"Generated {generated} SVG placeholders in {output_dir}")


if __name__ == "__main__":
    main()
