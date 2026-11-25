# BioJING - 生信硬核科普网站

## 项目简介
BioJING 是一个专注于生物信息学深度科普与资源分享的网站，包含 52 篇系统化的生信硬核科普文章。

## 技术栈
- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **数据库**: Prisma ORM + SQLite（可切换 PostgreSQL）
- **渲染**: React-Markdown + Mermaid 图表 + 代码高亮
- **认证**: 简单的密码认证（管理后台）

## 功能列表

### 公开展示
- 首页：精选博文 + 系列专题 + 服务 CTA
- 博文列表：分页浏览、按系列/标签筛选
- 博文详情：Markdown 渲染（代码高亮、表格、Mermaid 图表）
- 系列专题：按组学领域分类展示
- 全文搜索
- 评论系统
- 资源下载（图片、数据、软件等）
- 关于页面（介绍 + 服务定价）

### 管理后台 (密码保护)
- 概览仪表盘：文章数、浏览、评论、文件统计
- 文章管理：富文本编辑器（Markdown + 预览）、发布/草稿/归档
- 系列管理：创建/编辑系列
- 文件管理：上传图片/视频/软件/数据，关联到文章
- 评论管理：审核评论
- 数据统计：浏览量排行、趋势图表
- 备份管理：数据库备份、完整备份、备份记录
- 站点设置：站点名称、描述、联系方式、SEO

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（务必修改 ADMIN_PASSWORD）
cp .env.example .env

# 3. 初始化数据库
npx prisma db push
npx prisma generate

# 4. 可选：导入博文（需设置 BIOJING_BLOG_DIR 指向 Markdown 根目录）
BIOJING_BLOG_DIR=/path/to/blog npx tsx prisma/seed.ts

# 5. 启动开发服务器（端口 30001）
npm run dev
```

打开 http://localhost:30001 查看网站。
管理后台：http://localhost:30001/admin/login（密码来自 `.env` 中的 `ADMIN_PASSWORD`，请先复制 `.env.example`）。

## 项目结构

```
BioJING/
├── prisma/
│   ├── schema.prisma    # 数据库模型
│   └── seed.ts          # 数据导入脚本
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 根布局
│   │   ├── globals.css      # 全局样式
│   │   ├── page.tsx         # 首页
│   │   ├── posts/           # 博文路由
│   │   ├── series/          # 系列专题路由
│   │   ├── search/          # 搜索页
│   │   ├── about/           # 关于页
│   │   ├── admin/           # 管理后台
│   │   └── api/             # API 路由
│   ├── components/          # 共享组件
│   ├── lib/                 # 工具库
│   └── middleware.ts        # 认证中间件
├── scripts/
│   ├── backup.ts            # 备份脚本（JSON+SHA-256，full 含 uploads 打包）
│   └── restore.ts           # 恢复脚本（恢复前自动再备份当前库）
├── uploads/                 # 上传文件存储（本地目录，不入库）
├── backups/                 # 备份文件存储（本地目录，不入库）
└── package.json
```

## 周期性备份

```bash
# 手动备份数据库
npx tsx scripts/backup.ts db

# 手动完整备份
npx tsx scripts/backup.ts full

# 配置 cron 定时任务（每天凌晨 2 点）
# 0 2 * * * cd /path/to/BioJING && npx tsx scripts/backup.ts db

# 从备份恢复（会先自动备份当前库到 backups/pre-restore-*.json）
npx tsx scripts/restore.ts backups/<备份文件>.json --yes
```

> 数据库变更红线：改 schema 前先跑一次完整备份并确认 `backups/` 落盘，再用
> `npx prisma migrate dev` 生成迁移；不要对已有数据的库直接 `db push`。

## License

MIT
