#!/usr/bin/env node
// browser-clone.mjs — 浏览器渲染克隆引擎
// 用法: node browser-clone.mjs <url> <output_dir> [--concurrency 5] [--timeout 30000] [--keep-scripts]

import scrape from 'website-scraper';
import PuppeteerPlugin from 'website-scraper-puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// ─── 参数解析 ───

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('用法: node browser-clone.mjs <url> <output_dir> [--concurrency 5] [--timeout 30000] [--keep-scripts]');
  process.exit(1);
}

const url = args[0];
const outputDir = path.resolve(args[1]);

function getFlag(name, defaultVal) {
  const idx = args.indexOf(name);
  if (idx === -1) return defaultVal;
  return args[idx + 1];
}

const concurrency = parseInt(getFlag('--concurrency', '5'), 10);
const timeout = parseInt(getFlag('--timeout', '30000'), 10);
const keepScripts = args.includes('--keep-scripts');

// ─── 常量 ───

const ALLOWED_CDN_HOSTS = [
  'fonts.googleapis.com', 'fonts.gstatic.com',
  'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com',
  'images.unsplash.com', 'cdn.sanity.io',
];

const BLOCKED_HOSTS = [
  'www.google-analytics.com', 'www.googletagmanager.com',
  'analytics.google.com', 'connect.facebook.net',
  'static.hotjar.com', 'snap.licdn.com',
  'cdn.segment.com', 'plausible.io',
  'va.vercel-scripts.com', 'vitals.vercel-insights.com',
];

const tmpDir = outputDir + '__scraping_tmp';

// ─── PostRenderPlugin ───

class PostRenderPlugin {
  apply(registerAction) {
    // 拦截追踪域名请求
    registerAction('beforeRequest', async ({ resource, requestOptions }) => {
      try {
        const resourceUrl = new URL(resource.getUrl());
        if (BLOCKED_HOSTS.includes(resourceUrl.hostname)) {
          return null; // 跳过追踪资源
        }
      } catch {
        // URL 解析失败则放行
      }
      return requestOptions;
    });

    // 处理 HTML 响应
    registerAction('afterResponse', async ({ response }) => {
      const contentType = response.headers?.['content-type'] || '';
      if (!contentType.includes('text/html')) {
        return response;
      }

      let body = response.body.toString();

      // 移除 <script> 标签（克隆的 JS 无法独立运行）
      if (!keepScripts) {
        body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      }

      // 修复 React Suspense 边界（Next.js RSC streaming）
      // 移除 Suspense fallback（loading spinner）
      body = body.replace(/<!--\$\?--><template id="B:\d+"><\/template>[\s\S]*?<!--\/\$-->/g, '');
      // 解除 hidden 内容（Suspense 完成态内容）
      body = body.replace(/<div hidden="" id="(S:\d+)"/g, '<div id="$1"');
      // 移除空的 hidden 容器
      body = body.replace(/<div hidden=""><!--\$--><!--\/\$--><\/div>/g, '');

      // 注入样式修复：强制 opacity:1 和 transform:none 修复动画冻结
      const fixStyle = `<style data-webclone-fix>
  *[style*="opacity: 0"], *[style*="opacity:0"] {
    opacity: 1 !important;
  }
  *[style*="transform:"] {
    transform: none !important;
  }
  .motion-reduce * {
    animation: none !important;
    transition: none !important;
  }
</style>`;

      // 在 </head> 前注入，如果没有 </head> 则在开头
      if (body.includes('</head>')) {
        body = body.replace('</head>', fixStyle + '\n</head>');
      } else {
        body = fixStyle + '\n' + body;
      }

      return { ...response, body };
    });
  }
}

// ─── URL 过滤函数 ───

function urlFilter(resourceUrl) {
  try {
    const parsed = new URL(resourceUrl);
    const targetHost = new URL(url).hostname;

    // 同域资源：允许
    if (parsed.hostname === targetHost) return true;

    // 允许的 CDN
    if (ALLOWED_CDN_HOSTS.some(h => parsed.hostname.endsWith(h))) return true;

    // 阻止追踪域名
    if (BLOCKED_HOSTS.includes(parsed.hostname)) return false;

    // 其他外部资源：允许常见静态资源类型
    const ext = parsed.pathname.split('.').pop()?.toLowerCase();
    const allowedExts = ['css', 'js', 'woff', 'woff2', 'ttf', 'eot', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico'];
    if (allowedExts.includes(ext)) return true;

    return false;
  } catch {
    return false;
  }
}

// ─── Puppeteer 配置 ───

function buildPuppeteerConfig() {
  const config = {
    launchOptions: {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
    scrollToBottom: { timeout: 5000, viewportN: 3 },
    blockNavigation: true,
  };

  // 如果环境变量指定了 Chrome 路径
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    config.launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return config;
}

// ─── 主流程 ───

const startTime = Date.now();
const report = {
  url,
  outputDir,
  success: false,
  resources: { downloaded: [], failed: [] },
  duration: 0,
  error: null,
};

try {
  // 清理可能残留的临时目录
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }

  console.error(`[browser-clone] 开始克隆: ${url}`);
  console.error(`[browser-clone] 输出目录: ${outputDir}`);
  console.error(`[browser-clone] 并发: ${concurrency}, 超时: ${timeout}ms`);

  const result = await scrape({
    urls: [url],
    directory: tmpDir,
    filenameGenerator: 'byType',
    urlFilter,
    request: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
    sources: [
      { selector: 'img', attr: 'src' },
      { selector: 'img', attr: 'srcset' },
      { selector: 'link[rel="stylesheet"]', attr: 'href' },
      { selector: 'link[rel="icon"]', attr: 'href' },
      { selector: 'link[rel="preload"]', attr: 'href' },
      { selector: 'source', attr: 'src' },
      { selector: 'source', attr: 'srcset' },
      { selector: 'video', attr: 'src' },
      { selector: 'video', attr: 'poster' },
      { selector: 'style', attr: 'text' },
    ],
    subdirectories: [
      { directory: 'imgs', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif', '.ico', '.bmp'] },
      { directory: 'css', extensions: ['.css'] },
      { directory: 'js', extensions: ['.js', '.mjs'] },
      { directory: 'fonts', extensions: ['.woff', '.woff2', '.ttf', '.eot', '.otf'] },
      { directory: 'media', extensions: ['.mp4', '.webm', '.ogg', '.mp3', '.wav'] },
    ],
    plugins: [
      new PuppeteerPlugin(buildPuppeteerConfig()),
      new PostRenderPlugin(),
    ],
    requestConcurrency: concurrency,
  });

  // 收集已下载资源
  for (const resource of result) {
    const children = resource.getChildren ? resource.getChildren() : [];
    for (const child of children) {
      report.resources.downloaded.push({
        url: child.getUrl(),
        filename: child.getFilename(),
      });
    }
  }

  // 成功：将临时目录重命名为最终目录
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.renameSync(tmpDir, outputDir);

  report.success = true;
  console.error(`[browser-clone] 克隆完成，下载 ${report.resources.downloaded.length} 个资源`);

} catch (err) {
  report.success = false;
  report.error = err.message;
  console.error(`[browser-clone] 错误: ${err.message}`);

  // 清理临时目录
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
} finally {
  report.duration = Date.now() - startTime;
}

// 输出 JSON 报告到 stdout
console.log(JSON.stringify(report, null, 2));

process.exit(report.success ? 0 : 1);
