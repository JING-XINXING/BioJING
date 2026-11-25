#!/usr/bin/env bash
# BioJING Cloud Agent 启动脚本（每 boot 执行，幂等）：在 tmux 会话中拉起开发服务器。
# 端口固定 30001（项目既定端口，避开 3000/8000 高频端口）；已运行则跳过。
set -euo pipefail
cd "$(dirname "$0")/.."

SESSION="biojing-dev"
PORT=30001

# 已有会话则视为已启动，直接返回
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "[start] tmux 会话 $SESSION 已存在，跳过启动"
  exit 0
fi

# 依赖未就绪（未走构建快照）时给出明确提示，不在此处做安装（安装属于 install 阶段）
if [ ! -d node_modules ]; then
  echo "[start] node_modules 不存在，请先运行 scripts/cloud-agent-install.sh" >&2
  exit 1
fi
if [ ! -f .env ]; then
  echo "[start] .env 不存在，请先运行 scripts/cloud-agent-install.sh" >&2
  exit 1
fi

tmux new-session -d -s "$SESSION" "npm run dev 2>&1 | tee /tmp/biojing-dev.log"

# 等待就绪（最多 60 秒），失败时输出日志尾部便于排查
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
    echo "[start] BioJING 开发服务已就绪：http://127.0.0.1:${PORT}/（tmux 会话 $SESSION，日志 /tmp/biojing-dev.log）"
    exit 0
  fi
  sleep 1
done

echo "[start] 服务 60 秒内未就绪，最近日志：" >&2
tail -n 50 /tmp/biojing-dev.log >&2 || true
exit 1
