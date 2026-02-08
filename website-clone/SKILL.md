---
name: website-clone
description: Clone a website by URL with AI-enhanced analysis, resource fixing, code restoration, and project scaffolding. Use when the user wants to clone/replicate/copy a website.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# WebClone — AI 增强的网站克隆引擎

输入一个 URL，输出一个可运行、可维护的干净前端项目。

## 输入

```
/website-clone <url> [options]
```

从 `$ARGUMENTS` 中解析 URL 和选项。如果没有提供 URL，询问用户。

支持的选项（从 $ARGUMENTS 中解析，全部可选）：
- `--fetch-only`：只抓取，不做 AI 处理
- `--skip-restore`：跳过代码还原（保持 minified）
- `--output <dir>`：指定输出目录（默认当前工作目录）
- `--engine playwright`：强制使用 Playwright 引擎

脚本目录: `~/.claude/skills/website-clone/scripts/`

---

## Phase 1: 智能抓取

### 1.1 检测站点类型

运行检测脚本：
```bash
bash ~/.claude/skills/website-clone/scripts/detect-site-type.sh "<url>"
```

输出 `static` 或 `spa`。如果用户指定了 `--engine playwright`，跳过检测。

向用户报告：
```
[Phase 1] 检测站点类型...
  → 结果: 静态站点 / SPA，使用 GoClone / Playwright 引擎
```

### 1.2 执行抓取

**GoClone 路径（静态站）**：
```bash
goclone "<url>"
```
GoClone 会在当前目录下自动创建以域名命名的文件夹。

**浏览器引擎路径（SPA / SSR 站点）**：
如果检测结果为 `spa` 或用户指定了 `--engine playwright`：
1. 检查浏览器引擎依赖是否已安装：
```bash
if [ ! -d ~/.claude/skills/website-clone/scripts/node_modules ]; then
  bash ~/.claude/skills/website-clone/scripts/setup-browser-engine.sh
fi
```
2. 运行浏览器克隆引擎：
```bash
node ~/.claude/skills/website-clone/scripts/browser-clone.mjs "<url>" "<output_dir>" --concurrency 5 --timeout 30000
```
3. 脚本输出 JSON 报告到 stdout，包含已下载和失败的资源列表
4. 输出目录结构与 GoClone 一致：`imgs/`、`css/`、`fonts/` 等
5. 自动移除 `<script>` 标签（克隆的 JS 无法独立运行）
6. 自动注入 `opacity:1 !important` 修复 Framer Motion 动画冻结

### 1.3 抓取后验证

立即运行资源验证：
```bash
bash ~/.claude/skills/website-clone/scripts/verify-resources.sh "<cloned_dir>"
```

向用户报告下载结果：
```
[Phase 1] 下载完成
  → HTML: X 文件
  → CSS: X 文件
  → JS: X 文件
  → Images: X 有效 / Y 缺失或损坏
  → Fonts: X 有效 / Y 需要本地化
```

如果用户指定了 `--fetch-only`，到此结束，向用户报告结果。

---

## Phase 2: AI 分析

### 2.1 资源完整性

验证脚本已在 Phase 1.3 中运行。现在 AI 对结果进行分类：

1. 读取 HTML 文件，提取所有 `src="..."` 和 `href="..."` 引用
2. 读取 CSS 文件，提取所有 `url(...)` 引用
3. 对比实际下载的文件列表，找出：
   - 已下载且有效的资源
   - 已下载但无效的资源（0 字节、错误页面等）
   - 引用存在但文件缺失的资源
   - 外部 CDN 资源（字体、JS 库等）

### 2.2 技术栈识别

通过特征检测识别使用的技术：

| 特征 | 技术 |
|------|------|
| `data-astro-cid-*` | Astro |
| `__next`, `_next/` | Next.js |
| `data-v-*`, `__vue` | Vue |
| `data-reactroot`, `_react` | React |
| `ng-app`, `ng-version` | Angular |
| Tailwind class patterns | Tailwind CSS |
| `jQuery`, `$(`  | jQuery |

同时检测 JS 状态：
- 单行文件 + 单字母变量 → minified（可用 prettier 还原）
- hex 变量名 + 编码字符串 → obfuscated（还原困难，标记警告）
- 多行 + 有意义变量名 → 源码（无需还原）

### 2.3 外部依赖清单

扫描并分类所有外部 URL 引用：

- **CDN 资源**（可本地化）：字体 CDN、JS 库 CDN、图片 CDN
- **追踪脚本**（可删除）：Google Analytics、Vercel Analytics、Hotjar、Mixpanel、Facebook Pixel
- **API 端点**（需要 mock）：fetch/XHR/axios 调用的 URL
- **外部链接**（保持原样）：正常的超链接

### 2.4 克隆质量评分

计算 0-100 分的质量评分：

```
资源完整率（权重 40%）= 有效资源数 / 总引用资源数 × 40
离线可运行（权重 30%）= 无外部依赖的关键资源比例 × 30
代码可读性（权重 15%）= minified ? 0 : 有意义变量名占比 × 15
工程化程度（权重 15%）= (有package.json ? 5 : 0) + (有gitignore ? 5 : 0) + (目录规范 ? 5 : 0)
```

### 2.5 生成修复方案

根据分析结果，自动推荐修复方案。向用户展示完整报告：

```
[Phase 2] 分析报告

📊 克隆质量评分: XX/100

🔧 技术栈: [识别结果]

📦 资源状态:
  ✅ XX 个有效
  ❌ XX 个缺失/损坏
  ⚠️ XX 个外部 CDN 依赖

🤖 推荐修复方案:
  1. ResourceFixer: [具体描述]
  2. Cleaner: [具体描述]
  3. CodeRestorer: [具体描述]
  4. Scaffolder: [具体描述]

[确认执行？]
```

**一次确认，不逐步询问。** 用户确认后依次执行全部修复。

---

## Phase 3: AI 处理管线

执行顺序严格遵循：**ResourceFixer → Cleaner → CodeRestorer → Scaffolder**

### 3.1 ResourceFixer（资源修复器）

#### 修复缺失/损坏的下载资源

1. 从验证报告中收集所有损坏文件的列表
2. 分析 HTML 找到每个损坏文件对应的原始 URL
3. 创建 URL 列表文件（格式：`<local_path> <remote_url>`）
4. 运行限流重试：
```bash
bash ~/.claude/skills/website-clone/scripts/retry-download.sh "<url_list>" "<cloned_dir>" 500 3
```

5. 对仍然失败的文件，生成 SVG 占位符：
```bash
python3 ~/.claude/skills/website-clone/scripts/generate-placeholder.py "<imgs_dir>" <name1> <name2> ...
```

#### 本地化外部字体

1. 分析 HTML 中的字体 CSS 链接（Google Fonts、FontShare 等）
2. curl 请求字体 CSS，提取 woff2 文件 URL
3. 下载字体文件到 `<cloned_dir>/fonts/` 目录
4. 创建本地 `fonts/fonts.css`，包含所有 @font-face 声明
5. 用 Python/sed 替换 HTML 中的字体引用为本地路径

#### 本地化外部 JS 库

1. 识别 HTML 中引用的 CDN JS（cdnjs、unpkg、jsdelivr 等）
2. curl 下载到 `<cloned_dir>/js/vendor/`
3. 替换 HTML 中的 CDN 链接为本地路径

### 3.2 Cleaner（智能清理器）

**执行前备份**：
```bash
cp -r "<cloned_dir>" "<cloned_dir>/../.webclone-backup"
```

**AI 分析并清理以下内容**（使用 Python 脚本精确替换，不要用 sed 处理大型 HTML）：

1. **追踪脚本**：移除以下模式
   - `<script>` 块中包含 Google Analytics（`gtag`, `ga(`, `GoogleAnalyticsObject`）
   - Vercel Analytics（`<vercel-analytics>`, `vercel-scripts.com`）
   - Hotjar（`hotjar.com`, `hj(`）
   - Facebook Pixel（`fbq(`）
   - 其他常见追踪脚本

2. **无用 meta 标签**：
   - 删除指向原站的 `<link rel="canonical">`
   - 清理 `og:url` 中指向原站的值

3. **保持原则**：
   - 不删除任何影响页面功能和样式的代码
   - 不删除结构性的 `<script>` 标签（只删追踪类）
   - 不修改任何交互逻辑

### 3.3 CodeRestorer（代码还原器）

如果用户指定了 `--skip-restore`，跳过此阶段。

#### Step 1: Prettier 格式化

```bash
bash ~/.claude/skills/website-clone/scripts/format-code.sh "<cloned_dir>"
```

#### Step 2: AI 语义还原（仅对 JS 文件）

读取格式化后的 JS 文件，AI 执行以下任务：

1. **变量名还原**：分析每个 minified 变量名的使用上下文，推断有意义的名字
   - 例: `u` → `packageManager`, `o` → `installMode`, `n` → `isBeta`
   - 只重命名高置信度的变量，不确定的保持原样

2. **添加段落注释**：在功能块之间添加简洁注释
   - 例: `// OS detection`, `// Toggle beta mode`, `// Copy to clipboard`

3. **不做结构性修改**：不拆分文件、不改变逻辑、不引入新依赖

使用 Edit 工具逐个替换变量名和添加注释。

### 3.4 Scaffolder（工程化输出器）

1. **目录规范化**（仅在需要时）：
   - 如果图片散落在根目录 → 移到 `assets/images/`
   - 如果字体已在 `fonts/` → 保持
   - 如果 CSS/JS 已在对应目录 → 保持

2. **生成 package.json**：
```json
{
  "name": "<domain-name>-clone",
  "version": "1.0.0",
  "description": "Cloned from <url> by WebClone",
  "scripts": {
    "dev": "npx serve . -l 3000",
    "preview": "open http://localhost:3000 && npx serve . -l 3000"
  },
  "private": true
}
```

3. **生成 .gitignore**：
```
node_modules/
.DS_Store
.webclone-backup/
```

---

## Phase 4: 输出与预览

### 4.1 计算修复后评分

重新运行验证脚本，对比修复前后的评分：

```
[Done] 克隆完成

📊 质量评分: XX → YY/100

📁 文件统计:
  → HTML: X 文件
  → CSS: X 文件（已格式化）
  → JS: X 文件（已还原变量名）
  → Images: X 有效 + Y 占位符
  → Fonts: X 文件（已本地化）

📂 输出目录: <path>
🌐 预览: cd <path> && npm run dev
```

### 4.2 预览

告诉用户启动预览的命令：
```
cd <cloned_dir> && npm run dev
```

不要自动启动服务器，让用户自己决定。

---

## 关键原则

1. **备份优先**：任何修改前都先备份到 `.webclone-backup/`
2. **保守修改**：宁可少改，不可破坏功能。所有交互和动画必须保持正常
3. **一次确认**：分析后打包推荐方案，用户一次确认即可，不逐步询问
4. **脚本优先**：确定性操作用脚本完成（快且可靠），AI 只做需要判断力的工作
5. **大文件处理**：HTML/CSS/JS 可能很大（>200KB），使用 Python 脚本做替换，不要用 sed 处理单行巨型文件
6. **合规提醒**：首次使用时提醒用户尊重网站的 robots.txt 和版权
