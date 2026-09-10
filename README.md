# R1ck5 的小站

简洁、可扩展的 Astro 博客，发布地址：**https://chongfe.github.io/**。

独立的 **科研 / 博客 / 笔记 / 友链** 栏目。支持 Markdown、MDX 组件、数学公式、代码高亮、文章目录、搜索、深浅主题、RSS、站点地图、移动端和无 JavaScript 阅读。

## 开发

需要 Node.js 22.12+（推荐 Node.js 24）。

```sh
npm ci
npm run dev
```

```sh
npm run check    # 类型和模板检查
npm run build    # 输出 dist/
npm run preview  # http://127.0.0.1:4173
```

## 添加友链：只改一个文件

打开 `src/config/friends.ts`，往 `friends` 数组追加：

```ts
export const friends: Friend[] = [
  {
    name: '朋友的小站',
    url: 'https://example.com/',
    description: '一句话介绍',
    // avatar: '/images/friends/example.png', // 可选
  },
];
```

没有头像时自动显示名称首字；图片可放在 `public/images/friends/`。`bookmarks` 是单向收藏，与已确认友链分别维护。提交到 `main` 后自动发布。

## 发布博客

在 `src/content/blog/` 新建 `my-first-post.md`：

```md
---
title: 文章标题
description: 显示在卡片与搜索摘要中的说明。
date: 2026-09-10
category: 技术
tags: [Python, 实验]
draft: false
---

## 一个具体的问题

正文从这里开始。
```

网址自动成为 `/blog/my-first-post/`。支持子目录；文章会自动进入博客列表、首页最新文章、搜索、RSS 和 sitemap。`draft: true` 的内容不会生成页面、列表或订阅条目。修改后可加 `updated: 2026-09-11` 显示修订日期。

Markdown 支持表格、引用、图片、代码块；代码块标注语言即可高亮。`$...$` 为行内公式，`$$...$$` 为独立公式。需要交互图表或自定义组件时，可以改用 `.mdx` 并导入组件。

## 添加科研内容

在 `src/content/research/` 添加 Markdown 或 MDX。公共字段与博客一致，再增加 `kind`：

| `kind` | 科研页分组 |
| --- | --- |
| `direction` | 研究方向 |
| `paper` | 论文与阅读 |
| `project` | 项目与实验 |
| `note` | 研究笔记 |

```yaml
---
title: 项目标题
description: 项目的问题与目标。
date: 2026-09-10
category: 实验
kind: project
status: 进行中
order: 10
tags: [Energy-based Models]
links:
  - label: Code
    url: https://github.com/chongfe
draft: true
---
```

`links` 可以添加 Paper、Code、Dataset、Demo 等多个外部入口；`order` 越小越靠前。可选字段可以省略。填写正文并改为 `draft: false` 后发布，科研主页自动更新分类。

## 添加笔记与其他页面

- 笔记：添加 `src/content/docs/*.md`，用 `order` 调整顺序。
- 新页面：创建 `src/pages/projects.astro`，复用 `src/layouts/Base.astro`，再在 `src/config/site.ts` 的 `navigation` 中加导航项。
- 新内容类型：在 `src/content.config.ts` 注册集合，添加列表页与详情路由。
- 改主题：编辑 `src/styles/global.css` 顶部的 CSS 变量。
- 改站点名称、介绍、GitHub 地址：编辑 `src/config/site.ts`。

```astro
---
import Base from '../layouts/Base.astro';
import PageHead from '../components/PageHead.astro';
---
<Base title="项目">
  <div class="page-wrap">
    <PageHead en="PROJECTS" title="项目" description="一些持续探索的作品。" />
    <!-- 页面内容 -->
  </div>
</Base>
```

## 发布

`.github/workflows/deploy.yml` 在每次推送 `main` 时安装锁定依赖、检查、构建并部署到 GitHub Pages。仓库 Settings → Pages 的 Source 使用 **GitHub Actions**。

日常更新只需编辑内容并提交，也可以直接在 GitHub 网页编辑 Markdown 和友链配置。构建失败时不会替换上一次成功发布的站点。`dist/` 是构建结果，不直接编辑。

## 目录

```text
src/
  config/             # 站点导航、友链配置
  content/            # blog / docs / research 的 Markdown 与 MDX
  content.config.ts   # 内容字段验证
  components/         # 图标、文章卡片、友链卡片、页面标题
  layouts/            # 全站框架、文章框架
  lib/                # 内容排序、日期与路径工具
  pages/              # 页面路由、RSS、robots
  styles/             # 全站样式与响应式规则
public/               # 插画、图标、脚本等静态文件
.github/              # 发布工作流与友链申请模板
```

设计参考 [Yaossg’s Site](https://yaossg.com/site/) 的栏目组织；本站样式和 SVG 插画独立制作。无追踪器，无外部字体或运行时 CDN 依赖。
