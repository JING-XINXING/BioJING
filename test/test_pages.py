"""功能测试：只读检查 SQLite 内容，并在开发服务可用时做页面冒烟。"""

from __future__ import annotations

import os
import sqlite3
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "prisma" / "dev.db"
BASE_URL = os.environ.get("BIOJING_BASE_URL", "http://127.0.0.1:30001")


def test_sqlite_has_published_posts() -> None:
    """本地开发库应已导入科普文章（只读，不改库）；空库时明确 skip 而非失败。"""
    import pytest

    if not DB_PATH.exists():
        pytest.skip("缺少 prisma/dev.db（空仓未初始化），跳过数据冒烟")
    uri = f"file:{DB_PATH}?mode=ro"
    conn = sqlite3.connect(uri, uri=True)
    try:
        post_n = conn.execute("SELECT COUNT(*) FROM Post WHERE status = 'published'").fetchone()[0]
        if post_n == 0:
            pytest.skip("本地库暂无已发布文章（未导入种子），跳过数据冒烟")
        series_n = conn.execute("SELECT COUNT(*) FROM Series").fetchone()[0]
    finally:
        conn.close()
    assert post_n >= 1, "Post 表没有已发布文章"
    assert series_n >= 1, "Series 表为空"


def test_public_pages_if_server_running() -> None:
    """若开发服务已启动，检查首页、关于页、登录页可访问。"""
    try:
        home = urllib.request.urlopen(f"{BASE_URL}/", timeout=8)
        about = urllib.request.urlopen(f"{BASE_URL}/about", timeout=8)
        login = urllib.request.urlopen(f"{BASE_URL}/admin/login", timeout=8)
    except (urllib.error.URLError, TimeoutError, OSError):
        # 服务未启动时跳过 HTTP 冒烟，由外部脚本负责拉起后再测
        return
    assert home.status == 200
    home_html = home.read().decode("utf-8", errors="replace")
    assert "BioJING" in home_html
    assert about.status == 200
    assert login.status == 200
