import { defineConfig } from "vitepress";
import * as fs from "fs";
import * as path from "path";
const courseBaseDir = path.resolve(import.meta.dirname, "..");

function processTermLower(term: string, _field?: string) {
  return term.toLowerCase();
}

// 原有目录读取函数不变
function getCourses() {
  return fs.readdirSync(courseBaseDir).filter((name) => {
    const p = path.join(courseBaseDir, name);
    try {
      return (
        fs.statSync(p).isDirectory() &&
        !name.startsWith(".") &&
        name !== "docs" &&
        name !== "node_modules"
      );
    } catch {
      return false;
    }
  });
}

function getChapters(courseName: string) {
  const coursePath = path.join(courseBaseDir, courseName);
  if (!fs.existsSync(coursePath)) return [];

  return fs
    .readdirSync(coursePath)
    .filter((name) => {
      const stat = fs.statSync(path.join(coursePath, name));
      return stat.isDirectory() && !name.startsWith(".");
    })
    .sort();
}

export default defineConfig({
  title: "我的学习文档",
  description: "前端转 AI Agent 课程笔记",
  base: "/ai-docs/",
  lang: "zh-CN",
  srcDir: ".",
  ignoreDeadLinks: true,

  /**
   * 微信/语雀等外链图常按 Referer 防盗链：直接打开 URL 正常，在站点里 ![](url) 会裂图。
   * 给所有 http(s) 外链图片加 referrerpolicy="no-referrer"，请求不带 Referer，一般可显示。
   * 若仍失败：链接带时效 token、需 Cookie、或必须特定 UA 时，只能下载到本地 public/ 或 assets/。
   */
  markdown: {
    config(md) {
      const imageRule = md.renderer.rules.image;
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const src = token.attrGet("src");
        if (src && /^https?:\/\//i.test(src)) {
          token.attrSet("referrerpolicy", "no-referrer");
        }
        return imageRule
          ? imageRule(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    },
  },

  themeConfig: {
    logo: "📚",
    siteTitle: "我的学习文档",
    nav: [
      { text: "首页", link: "/" },
      ...getCourses().map((course) => ({ text: course, link: `/${course}/` })),
    ],
    sidebar: {
      "/": getCourses().map((course) => ({
        text: course,
        collapsed: false,
        items: getChapters(course).map((chapter) => ({
          text: chapter,
          link: `/${course}/${chapter}/`,
        })),
      })),
    },
    // 修复核心：新版 VitePress 本地搜索配置（平铺属性，无 searchOptions）
    search: {
      provider: "local",
      // https://lucaong.github.io/minisearch/index.html
    },
    // 右上角github链接
    socialLinks: [
      { icon: "github", link: "https://github.com/Broly789/ai-docs" },
    ],

    // 页脚
    footer: {
      copyright: "Copyright © 2026 Broly",
    },
  },

  /**
   * VitePress 配置里没有顶层 `plugins` 字段（类型里也没有），扩展能力一律走 Vite：
   * 自定义插件放在 `vite.plugins`，会参与打包 / dev（与文档一致）。
   */
  vite: {
    plugins: [
      {
        name: "resolve-symlink",
        async load(id) {
          if (id.endsWith(".md")) {
            try {
              const realPath = fs.realpathSync(id);
              const content = fs.readFileSync(realPath, "utf-8");
              return content;
            } catch {
              return null;
            }
          }
        },
      },
      // 其他：import vitePluginExample from 'vite-plugin-example'
      // vitePluginExample(),
    ],
  },
});
