#!/usr/bin/env bash
# BioJING Cloud Agent 安装脚本（幂等）：依赖安装 + Prisma Client 生成 + 本地空库初始化。
# 仅处理被 .gitignore 忽略的本地文件（.env、prisma/dev.db），绝不修改已提交数据；
# 若 dev.db 已存在则跳过 db push，任何结构变更须先按 docs 升级计划做备份再迁移。
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. 按锁文件安装依赖（可重复执行）
npm ci

# 2. 生成 Prisma Client
npx prisma generate

# 3. 本地开发环境变量：仅当 .env 不存在时由示例生成，密码为本地开发占位值，禁止用于生产
if [ ! -f .env ]; then
  cp .env.example .env
  # 覆盖为明确标注的本地开发口令（脱敏测试禁止真实/默认生产口令进入仓库；.env 不入库）
  sed -i 's|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD="local-dev-only-change-in-production"|' .env
  echo "[install] 已生成本地开发 .env（ADMIN_PASSWORD 为本地占位，勿用于生产）"
fi

# 4. 本地空库：仅当数据库文件不存在时才建表，避免覆盖已有开发数据
if [ ! -f prisma/dev.db ]; then
  npx prisma db push --skip-generate
  echo "[install] 已初始化本地空库 prisma/dev.db（空库，无种子数据）"
else
  echo "[install] prisma/dev.db 已存在，跳过建表（如需变更结构：先备份，再 prisma migrate dev）"
fi

echo "[install] 完成：node $(node -v)，npm $(npm -v)"
