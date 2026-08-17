"""脱敏检查：源码不得包含本机路径、默认管理员口令等敏感信息。"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# 扫描范围：源码与配置，排除依赖、构建产物、本地数据
SKIP_DIRS = {
    "node_modules",
    ".next",
    "backups",
    "uploads",
    ".git",
    "__pycache__",
    ".pytest_cache",
}
SCAN_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".sh", ".md", ".json", ".prisma", ".example"}
FORBIDDEN = (
    "/Users/xinxingjing",
    "biojing2024",
)


def _iter_source_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name == ".env":
            continue
        if path.suffix not in SCAN_SUFFIXES and path.name not in {".gitignore", "run_BioJING.sh"}:
            continue
        files.append(path)
    return files


def test_source_has_no_local_paths_or_default_password() -> None:
    hits: list[str] = []
    for path in _iter_source_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        for token in FORBIDDEN:
            if token in text:
                rel = path.relative_to(ROOT)
                hits.append(f"{rel}: 含有 {token}")
    assert hits == [], "发现未脱敏内容:\n" + "\n".join(hits)


def test_env_example_has_placeholder_password() -> None:
    text = (ROOT / ".env.example").read_text(encoding="utf-8")
    assert "ADMIN_PASSWORD=" in text
    assert "biojing2024" not in text
    assert "change-me-before-start" in text
