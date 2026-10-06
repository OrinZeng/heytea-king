#!/usr/bin/env python3
from __future__ import annotations

import csv
import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OCR_DIR = ROOT / "data" / "private" / "ocr"
RAPID_OCR_DIR = ROOT / "data" / "private" / "rapid-ocr"
OUTPUT = ROOT / "src" / "data" / "orders.generated.json"
REVIEW = ROOT / "data" / "private" / "import-review.md"
AGGREGATES = ROOT / "src" / "data" / "aggregates.generated.json"

DATE_RE = re.compile(r"20\d{2}-\d{2}-\d{2}")
QTY_RE = re.compile(r"(.+?)[：:](\d+)(?:[，,。;；]|$)")


def read_words(path: Path) -> list[dict]:
    if path.suffix == ".json":
        return json.loads(path.read_text(encoding="utf-8"))
    with path.open(encoding="utf-8") as handle:
        rows = []
        for row in csv.DictReader(handle, delimiter="\t"):
            if row.get("level") != "5" or not row.get("text", "").strip():
                continue
            rows.append({
                "text": row["text"].strip(),
                "left": int(row["left"]),
                "top": int(row["top"]),
                "width": int(row["width"]),
                "height": int(row["height"]),
                "conf": float(row["conf"]),
            })
        return rows


def join_column(words: list[dict], left: int, right: int) -> str:
    selected = [word for word in words if left <= word["left"] < right]
    selected.sort(key=lambda word: (round(word["top"] / 18), word["left"]))
    text = "".join(word["text"] for word in selected)
    return re.sub(r"\s+", "", text).strip("|‘’'\" ")


def normalize_items(text: str) -> list[dict]:
    cleaned = (text.replace("(首创)", "（首创）")
                   .replace("(超大杯)", "（超大杯）")
                   .replace("(本店限定)", "（本店限定）")
                   .replace("：", ":")
                   .replace("；", "，"))
    matches = QTY_RE.findall(cleaned + "，")
    items = []
    replacements = {
        "芝芝多肉葡萄（首创)": "芝芝多肉葡萄（首创）",
        "多肉葡萄（首创)": "多肉葡萄（首创）",
        "芒芒甘露（首创)": "芒芒甘露（首创）",
        "奇兰芭乐莲雾（首创)": "奇兰芭乐莲雾（首创）",
        "轻芝多肉葡萄（首创)": "轻芝多肉葡萄（首创）",
        "岩兰·崇明米酿（本店限定)": "岩兰·崇明米酿（本店限定）",
        "超大杯（650ml)": "超大杯（650ml）",
        "超大杯(650ml)": "超大杯（650ml）",
        "清爽芭乐提(红芭乐)": "清爽芭乐提（红芭乐）",
        "清爽芭乐提(白芭乐)": "清爽芭乐提（白芭乐）",
        "需要餐具（应环保要求收费)": "需要餐具（应环保要求收费）",
    }
    for name, quantity in matches:
        name = name.strip("，,。;；| ")
        name = replacements.get(name, name)
        if not name:
            continue
        if "外送费" in name:
            kind = "fee"
        elif any(keyword in name for keyword in ["需要餐具", "杯套", "冰箱贴", "手提袋", "贺卡", "玩偶", "徽章", "刮刮卡", "帆布袋"]):
            kind = "merch"
        elif any(keyword in name for keyword in ["蛋糕", "蝴蝶酥", "糯米饭", "冰淇淋", "喜拉朵", "布蕾"]):
            kind = "dessert"
        elif any(keyword in name for keyword in ["超大杯", "加倍葡萄果肉", "加倍芒果果肉", "真0卡糖", "弹弹冻", "果粒", "西米", "慢熬黑糖波波", "L-阿拉伯糖", "超多肉版", "0脂脆波波", "芝芝云顶"]):
            kind = "merch"
        else:
            kind = "drink"
        product_id = None if kind == "fee" else "p-" + hashlib.sha1(name.encode("utf-8")).hexdigest()[:10]
        items.append({"rawName": name, "productId": product_id, "quantity": int(quantity), "kind": kind})
    if not items and cleaned:
        items.append({"rawName": cleaned.strip("，,"), "productId": "p-" + hashlib.sha1(cleaned.encode("utf-8")).hexdigest()[:10], "quantity": 1, "kind": "drink"})
    return items


def infer_city(store: str) -> str:
    aliases = {
        "上海": "上海", "广州": "广州", "佛山": "佛山", "吉安": "吉安", "杭州": "杭州",
        "长沙": "长沙", "深圳": "深圳", "南昌": "南昌", "廊坊": "廊坊", "桂林": "桂林",
        "成都": "成都", "苏州": "苏州", "赣州": "赣州", "台州": "台州",
        "GATE M": "上海",
    }
    for token, city in aliases.items():
        if token in store:
            return city
    return "待核验"


def normalize_store(store: str) -> str:
    replacements = {
        "GATEM西岸凤巢店": "GATE M 西岸凤巢店",
        "上海五角场万达gelatolab+店": "上海五角场万达 gelato lab+店",
        "上海五角场万达gelaPOStolab+店": "上海五角场万达 gelato lab+店",
        "喜茶lab(上海丰盛里店)": "喜茶 lab（上海丰盛里店）",
        "喜茶1ab（广州天环广场店)": "喜茶 lab（广州天环广场店）",
        "喜茶lab（广州天环广场店)": "喜茶 lab（广州天环广场店）",
        "南昌万象汇店(关闭)": "南昌万象汇店（关闭）",
    }
    return replacements.get(store, store)


def parse_page(page_path: Path) -> tuple[list[dict], list[str]]:
    words = read_words(page_path)
    date_words = [word for word in words if DATE_RE.fullmatch(word["text"])]
    date_words.sort(key=lambda word: word["top"])
    parsed, warnings = [], []

    for index, date_word in enumerate(date_words):
        start = date_word["top"] - 10
        end = date_words[index + 1]["top"] - 10 if index + 1 < len(date_words) else date_word["top"] + 90
        row_words = [word for word in words if start <= word["top"] < end]
        store = normalize_store(join_column(row_words, 355, 580))
        channel = join_column(row_words, 580, 700)
        items_text = join_column(row_words, 1015, 2078)
        amount_text = join_column(row_words, 2078, 2248)
        order_type = join_column(row_words, 2248, 2368) or "堂食"
        refund = join_column(row_words, 2368, 2575)
        time_match = re.search(r"([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?", join_column(row_words, 180, 350))
        pickup_match = re.search(r"\b\d{3,5}\b", join_column(row_words, 690, 800))
        amount_match = re.search(r"\d+(?:\.\d{1,2})?", amount_text.replace("O", "0"))
        amount = float(amount_match.group()) if amount_match else 0.0
        items = normalize_items(items_text)
        fingerprint = f"{date_word['text']}|{store}|{items_text}|{amount:.2f}"
        order_id = "order-" + hashlib.sha1(fingerprint.encode("utf-8")).hexdigest()[:10]
        if not store or not items_text or not amount_match:
            warnings.append(f"{page_path.stem} {date_word['text']}: store={store!r}, items={items_text!r}, amount={amount_text!r}")
        parsed.append({
            "id": order_id,
            "date": date_word["text"],
            "store": store or "待核验门店",
            "city": infer_city(store),
            "channel": channel or "待核验",
            "amount": amount,
            "orderType": order_type,
            "items": items,
            "_refund": refund,
            "_page": page_path.stem,
            "_rawItems": items_text,
            "_time": time_match.group() if time_match else "",
            "_pickup": pickup_match.group() if pickup_match else "",
        })
    return parsed, warnings


def main() -> int:
    source_dir = RAPID_OCR_DIR if list(RAPID_OCR_DIR.glob("page-*.json")) else OCR_DIR
    pattern = "page-*.json" if source_dir == RAPID_OCR_DIR else "page-*.tsv"
    if not source_dir.exists():
        print(f"Missing OCR directory: {source_dir}", file=sys.stderr)
        return 2
    all_orders, warnings = [], []
    for page in sorted(source_dir.glob(pattern), key=lambda path: int(re.search(r"(\d+)", path.stem).group())):
        parsed, page_warnings = parse_page(page)
        all_orders.extend(parsed)
        warnings.extend(page_warnings)
    all_orders.sort(key=lambda order: order["date"], reverse=True)

    public_orders = []
    private_aggregate_rows = []
    for order in all_orders:
        refund = order.pop("_refund", "")
        if "退款" in refund and "未退款" not in refund:
            continue
        private_aggregate_rows.append({"date": order["date"], "time": order.pop("_time"), "pickup": order.pop("_pickup")})
        order.pop("_page", None)
        order.pop("_rawItems", None)
        public_orders.append(order)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(public_orders, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    hour_grid = [[0 for _ in range(15)] for _ in range(7)]
    digit_counts = Counter()
    pickup_lengths = Counter()
    palindrome_count = 0
    repeated_count = 0
    for row in private_aggregate_rows:
        if row["time"]:
            hour = int(row["time"][:2])
            if 8 <= hour <= 22:
                weekday = datetime.strptime(row["date"], "%Y-%m-%d").weekday()
                hour_grid[weekday][hour - 8] += 1
        pickup = row["pickup"]
        if pickup:
            digit_counts.update(pickup)
            pickup_lengths[len(pickup)] += 1
            palindrome_count += int(len(pickup) >= 3 and pickup == pickup[::-1])
            repeated_count += int(any(pickup.count(digit) >= 3 for digit in set(pickup)))
    aggregate_payload = {
        "hourGrid": hour_grid,
        "pickup": {
            "sampleSize": sum(pickup_lengths.values()),
            "lengths": dict(sorted(pickup_lengths.items())),
            "digits": [digit_counts[str(digit)] for digit in range(10)],
            "palindromes": palindrome_count,
            "repeated": repeated_count,
        },
    }
    AGGREGATES.write_text(json.dumps(aggregate_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cities = Counter(order["city"] for order in public_orders)
    total = sum(order["amount"] for order in public_orders)
    cups = sum(item["quantity"] for order in public_orders for item in order["items"] if item["kind"] == "drink")
    REVIEW.parent.mkdir(parents=True, exist_ok=True)
    REVIEW.write_text(
        "# 喜茶账单导入复核\n\n"
        f"- 识别订单：{len(public_orders)}\n"
        f"- 识别实付：¥{total:.2f}\n"
        f"- 饮品杯数：{cups}\n"
        f"- 城市：{dict(cities)}\n"
        f"- 待复核告警：{len(warnings)}\n\n"
        "## 待复核\n\n" + ("\n".join(f"- {warning}" for warning in warnings) if warnings else "无") + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(public_orders)} orders, ¥{total:.2f}, {cups} drinks")
    print(f"Review: {REVIEW}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
