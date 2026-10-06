#!/usr/bin/env python3
"""Build the public product atlas from a cited public index and HEYTEA CDN images."""
from __future__ import annotations

import html
import json
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src" / "data" / "catalog.generated.json"
IMAGE_DIR = ROOT / "public" / "assets" / "catalog"
BASE = "https://www.nckfhsm.com"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 HeyteaKingCatalog/1.0"


def get_bytes(url: str, attempts: int = 3) -> bytes:
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("unreachable")


def get_text(url: str) -> str:
    return get_bytes(url).decode("utf-8", errors="replace")


def product_items(index_html: str, availability: str) -> list[dict]:
    scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', index_html, re.S)
    for raw in scripts:
        try:
            data = json.loads(html.unescape(raw))
        except json.JSONDecodeError:
            continue
        if data.get("@type") == "ItemList" and "#products" in data.get("@id", ""):
            return [{
                "name": row["item"]["name"].replace("(", "（").replace(")", "）"),
                "sourcePage": row["item"]["url"],
                "availability": availability,
            } for row in data.get("itemListElement", [])]
    return []


def enrich(item: dict) -> dict:
    page = get_text(item["sourcePage"])
    image_match = re.search(r'https://go\.cdn\.heytea\.com/[^"\'<>\\ ]+?\.(?:jpg|jpeg|png|webp)', page, re.I)
    intro_year = re.search(r"(20\d{2})年(?:首创|推出|上线|回归)", page)
    slug = item["sourcePage"].rstrip("/").split("/")[-1]
    image_source = html.unescape(image_match.group()) if image_match else None
    image = None
    if image_source:
        suffix = "." + image_source.split("?")[0].split(".")[-1].lower()
        destination = IMAGE_DIR / f"{slug}{suffix}"
        if not destination.exists():
            destination.write_bytes(get_bytes(image_source))
        image = f"assets/catalog/{destination.name}"
    name = item["name"]
    if re.search(r"蛋糕|蝴蝶酥|布蕾|挞|酥|糯米饭|喜拉朵|冰淇淋", name):
        series = "甜品与冰品"
    elif re.search(r"联名|限定|套餐|礼盒", name):
        series = "限定与联名"
    elif re.search(r"抹|茉|茶王|乌龙|碎银子|柠茶|绿妍|轻乳茶", name):
        series = "纯茶与轻乳茶"
    elif re.search(r"牛乳|波波|港奶|豆浆|奶茶", name):
        series = "真奶茶"
    else:
        series = "果茶与茶特调"
    return {
        **item,
        "id": f"catalog-{slug}",
        "slug": slug,
        "series": series,
        "year": int(intro_year.group(1)) if intro_year else 0,
        "image": image,
        "imageSource": image_source,
    }


def main() -> int:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    items: list[dict] = []
    for page in range(1, 12):
        url = f"{BASE}/brands/xi-cha/menu/available?page={page}"
        rows = product_items(get_text(url), "在售")
        items.extend(rows)
        print(f"在售第 {page} 页：{len(rows)} 项", flush=True)
    offline = product_items(get_text(f"{BASE}/brands/xi-cha/menu/offline?page=1"), "下架")
    items.extend(offline)
    print(f"下架：{len(offline)} 项", flush=True)

    unique = {item["sourcePage"]: item for item in items}
    enriched: list[dict] = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(enrich, item): item for item in unique.values()}
        for index, future in enumerate(as_completed(futures), 1):
            item = futures[future]
            try:
                enriched.append(future.result())
            except Exception as error:
                enriched.append({**item, "id": f"catalog-{item['sourcePage'].split('/')[-1]}", "slug": item["sourcePage"].split("/")[-1], "series": "待分类", "year": 0, "image": None, "imageSource": None, "error": str(error)})
            if index % 20 == 0 or index == len(unique):
                print(f"已处理 {index}/{len(unique)}", flush=True)
    enriched.sort(key=lambda item: (item["availability"] != "在售", item["series"], item["name"]))
    OUTPUT.write_text(json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"写入 {len(enriched)} 项；图片 {sum(bool(item.get('image')) for item in enriched)} 张", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
