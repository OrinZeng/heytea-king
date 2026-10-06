#!/usr/bin/env python3
"""Run high-accuracy local Chinese OCR and persist only private intermediates."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE_PYTHON = ROOT / "data" / "private" / "python"
sys.path.insert(0, str(PRIVATE_PYTHON))

from rapidocr_onnxruntime import RapidOCR  # type: ignore  # noqa: E402


def main() -> int:
    pages = ROOT / "data" / "private" / "pages"
    output = ROOT / "data" / "private" / "rapid-ocr"
    output.mkdir(parents=True, exist_ok=True)
    engine = RapidOCR()
    for path in sorted(pages.glob("page-*.png"), key=lambda item: int(item.stem.split("-")[-1])):
        result, _ = engine(str(path))
        records = []
        for box, text, score in result or []:
            records.append({
                "text": text.strip(),
                "left": round(min(point[0] for point in box)),
                "top": round(min(point[1] for point in box)),
                "right": round(max(point[0] for point in box)),
                "bottom": round(max(point[1] for point in box)),
                "conf": round(float(score) * 100, 2),
            })
        destination = output / f"{path.stem}.json"
        destination.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{path.name}: {len(records)} text regions", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
