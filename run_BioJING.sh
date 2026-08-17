#!/usr/bin/env bash
# 在项目根目录启动开发服务（端口 30001），不删除已有数据库
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "缺少 .env，请先复制 .env.example 并设置 ADMIN_PASSWORD"
  exit 1
fi

npm run dev
