#!/usr/bin/env python3
"""Resize product images to web-sized WebP and rewrite path references.

Idempotent: already-converted files are skipped. Run after fetching new images:
    python3 scripts/optimize_images.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
MAX_SIDE = 640
QUALITY = 78


def convert(source: Path) -> Path:
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        image.save(target, "WEBP", quality=QUALITY, method=6)
    source.unlink()
    return target


def main() -> int:
    converted = 0
    for folder in ("catalog", "products"):
        for source in sorted((ASSETS / folder).glob("*.jpg")):
            convert(source)
            converted += 1
    logo = ASSETS / "heytea-logo.png"
    if logo.exists():
        with Image.open(logo) as image:
            for size, name in ((640, "heytea-logo.webp"), (96, "heytea-logo-small.webp")):
                copy = image.copy()
                copy.thumbnail((size, size), Image.LANCZOS)
                copy.save(ASSETS / name, "WEBP", quality=85, method=6)
        logo.unlink()

    catalog = ROOT / "src" / "data" / "catalog.generated.json"
    text = catalog.read_text(encoding="utf-8")
    catalog.write_text(re.sub(r'("image": "assets/catalog/[^"]+)\.jpg"', r'\1.webp"', text), encoding="utf-8")

    site = ROOT / "src" / "data" / "siteData.ts"
    text = site.read_text(encoding="utf-8")
    site.write_text(re.sub(r'("[a-z0-9-]+)\.jpg"', r'\1.webp"', text), encoding="utf-8")
    print(f"converted {converted} images")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
