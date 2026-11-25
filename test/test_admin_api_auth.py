"""v1.0.1 安全回归：管理 API 鉴权、令牌会话、评论待审核、上传白名单。

前置：服务已在 BIOJING_BASE_URL（默认 127.0.0.1:30001）运行，.env 已配置 ADMIN_PASSWORD。
测试自建数据（slug 带 selfcheck 前缀）并在结束时清理，不依赖库中既有文章。
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("BIOJING_BASE_URL", "http://127.0.0.1:30001")


def _password() -> str:
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.startswith("ADMIN_PASSWORD="):
            return line.split("=", 1)[1].strip().strip('"')
    raise AssertionError(".env 缺少 ADMIN_PASSWORD")


def _req(method: str, path: str, body: dict | None = None, cookie: str | None = None,
         raw: bytes | None = None, headers: dict | None = None) -> tuple[int, str, dict]:
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(BASE + path, data=data, method=method)
    if body is not None:
        req.add_header("Content-Type", "application/json")
    if cookie:
        req.add_header("Cookie", cookie)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read().decode(), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), dict(e.headers)


def _login_cookie() -> str:
    status, _, headers = _req("POST", "/api/admin/auth", {"password": _password()})
    assert status == 200, "正确口令应可登录"
    cookie = next((v for k, v in headers.items() if k.lower() == "set-cookie"), "")
    assert _password() not in cookie, "Cookie 不得包含口令原文（P0-2）"
    assert "biojing_token=" in cookie
    return cookie.split(";")[0]


def test_admin_apis_reject_unauthenticated() -> None:
    """无凭证调用任一管理 API 必须 401（P0-1）。"""
    cases = [
        ("GET", "/api/admin/posts", None),
        ("POST", "/api/admin/posts", {"title": "x", "slug": "x-unauth"}),
        ("POST", "/api/admin/series", {"name": "x", "slug": "x-unauth"}),
        ("POST", "/api/admin/backup", None),
        ("DELETE", "/api/admin/posts/some-id", None),
        ("PATCH", "/api/admin/comments/some-id", {"approved": True}),
        ("DELETE", "/api/admin/files/some-id", None),
    ]
    for method, path, body in cases:
        status, text, _ = _req(method, path, body)
        assert status == 401, f"{method} {path} 未授权应 401，实际 {status}: {text[:120]}"


def test_forged_cookie_rejected() -> None:
    status, _, _ = _req("GET", "/api/admin/posts", cookie="biojing_token=v1.9999999999.forged")
    assert status == 401


def test_admin_flow_and_comment_moderation_and_upload_whitelist() -> None:
    cookie = _login_cookie()
    slug = "selfcheck-v101-post"
    # 建已发布测试文
    status, text, _ = _req("POST", "/api/admin/posts",
                           {"title": "v1.0.1 自检文", "slug": slug, "content": "# 自检\n正文", "status": "published"}, cookie=cookie)
    assert status == 200, text[:200]
    post = json.loads(text)

    try:
        # 评论默认待审核：提交成功但前台不可见
        status, text, _ = _req("POST", "/api/comments",
                               {"postId": post["id"], "author": "自检", "content": "待审核自检评论XYZ"})
        assert status == 200, text[:200]
        comment = json.loads(text)
        assert comment["approved"] is False
        status, html, _ = _req("GET", f"/posts/{slug}")
        assert "待审核自检评论XYZ" not in html, "待审核评论不应在前台显示"

        # 后台放行后前台可见
        status, _, _ = _req("PATCH", f"/api/admin/comments/{comment['id']}", {"approved": True}, cookie=cookie)
        assert status == 200
        status, html, _ = _req("GET", f"/posts/{slug}")
        assert "待审核自检评论XYZ" in html, "放行后评论应在前台显示"

        # 超长评论被拒、伪造 postId 被拒
        status, _, _ = _req("POST", "/api/comments", {"postId": post["id"], "content": "x" * 1001})
        assert status == 400
        status, _, _ = _req("POST", "/api/comments", {"postId": "nonexistent", "content": "hi"})
        assert status == 404

        # 上传白名单：.html 被拒，.txt 放行
        boundary = "----selfcheckboundary"
        def _upload(name: str, content: bytes) -> int:
            raw = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{name}\"\r\n"
                   f"Content-Type: application/octet-stream\r\n\r\n").encode() + content + \
                  f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"fileType\"\r\n\r\nattachment\r\n--{boundary}--\r\n".encode()
            s, _, _ = _req("POST", "/api/admin/upload", raw=raw, cookie=cookie,
                           headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
            return s
        assert _upload("evil.html", b"<script>alert(1)</script>") == 400
        assert _upload("ok.txt", b"hello") == 200
    finally:
        _req("DELETE", f"/api/admin/posts/{post['id']}", cookie=cookie)
