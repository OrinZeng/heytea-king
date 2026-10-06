#!/usr/bin/env python3
"""Render a HEYTEA statement, OCR it locally, and produce a sanitized diff report."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / "data" / "private"
PUBLIC_ORDERS = ROOT / "src" / "data" / "orders.generated.json"


def summary(rows: list[dict]) -> tuple[int, float, int]:
    return (
        len(rows),
        round(sum(row["amount"] for row in rows), 2),
        sum(item["quantity"] for row in rows for item in row["items"] if item["kind"] == "drink"),
    )


def main() -> int:
    source = Path(sys.argv[1] if len(sys.argv) > 1 else "/Users/orinzeng/Desktop/喜茶.pdf").expanduser().resolve()
    if not source.exists() or source.suffix.lower() != ".pdf":
        print(f"PDF not found: {source}", file=sys.stderr)
        return 2
    pdftoppm = shutil.which("pdftoppm")
    if not pdftoppm:
        print("pdftoppm is required (brew install poppler)", file=sys.stderr)
        return 2
    old_rows = json.loads(PUBLIC_ORDERS.read_text(encoding="utf-8")) if PUBLIC_ORDERS.exists() else []
    pages = PRIVATE / "pages"
    pages.mkdir(parents=True, exist_ok=True)
    for stale in pages.glob("page-*.png"):
        stale.unlink()
    subprocess.run([pdftoppm, "-png", "-r", "220", str(source), str(pages / "page")], check=True)
    for index, page in enumerate(sorted(pages.glob("page-*.png")), 1):
        expected = pages / f"page-{index}.png"
        if page != expected:
            page.rename(expected)
    env = os.environ.copy()
    env["PYTHONPATH"] = str(PRIVATE / "python")
    subprocess.run([sys.executable, str(ROOT / "scripts" / "rapid_ocr.py")], check=True, env=env)
    subprocess.run([sys.executable, str(ROOT / "scripts" / "import_orders.py")], check=True)
    new_rows = json.loads(PUBLIC_ORDERS.read_text(encoding="utf-8"))
    old_ids = {row["id"] for row in old_rows}
    new_ids = {row["id"] for row in new_rows}
    old_summary = summary(old_rows)
    new_summary = summary(new_rows)
    report = PRIVATE / "diff-report.md"
    report.write_text(
        "# 账单更新差异\n\n"
        f"- 旧数据：{old_summary[0]} 单 / ¥{old_summary[1]:.2f} / {old_summary[2]} 杯\n"
        f"- 新数据：{new_summary[0]} 单 / ¥{new_summary[1]:.2f} / {new_summary[2]} 杯\n"
        f"- 新增订单：{len(new_ids - old_ids)}\n"
        f"- 移除订单：{len(old_ids - new_ids)}\n",
        encoding="utf-8",
    )
    print(f"Diff report: {report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
