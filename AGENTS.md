# BioJING — Agent 工作指南

生信硬核科普站（52 篇系列博文）：Next.js 14 + React 18 + TypeScript + Tailwind 3 + Prisma 5 + SQLite（本地）。详细分工规则见 `.cursor/rules/`，版本升级计划见 `docs/`。

## 快速开始

```bash
bash scripts/cloud-agent-install.sh   # 幂等：npm ci + prisma generate + 本地 .env/空库初始化
npm run dev                            # http://127.0.0.1:30001（管理后台 /admin/login，口令见本地 .env）
```

Cloud Agent 环境：`.cursor/environment.json`（install=`scripts/cloud-agent-install.sh`，start=`.cursor/start.sh`，端口 30001）。

## 常用命令

| 用途 | 命令 |
| --- | --- |
| 类型检查 / 构建 | `npm run typecheck` / `npm run build` |
| 脱敏与忽略规则测试 | `python3 -m pytest test/test_desensitization.py test/test_gitignore_secrets.py -q` |
| 全量冒烟（需已启动服务且有 dev.db） | `python3 -m pytest test/ -q` |
| 数据库备份（任何 DB 变更前必做） | `npm run backup` |
| 导入 52 篇博文 | `BIOJING_BLOG_DIR=<Markdown根目录> npx tsx prisma/seed.ts` |

## 红线

1. 改数据库前先备份并确认落盘，再迁移；禁止对有数据的库直接 `db push`。
2. 秘密只走 `.env`/环境变量，禁止硬编码与提交真实 `.env`。
3. `/api/admin/*` 当前未被中间件保护（已知高危，见升级计划 P0），改认证须补未授权回归测试。
4. 测试放 `test/`、文档放 `docs/`；新功能须附测试方案；页面改动须做桌面+手机双端验收。
