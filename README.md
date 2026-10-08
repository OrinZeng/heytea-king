# Heytea King · 杯盏纪年

一座由个人喜茶账单生成的沉浸式数据档案。网站包含消费总览、月度与年度趋势、下单习惯、门店足迹、聚合取餐号分析、消费日历和历年产品图鉴。

## 页面

- **杯盏纪年**：122 笔有效订单的聚合统计与足迹。
- **杯中万象**：从首页继续向下滚动自然进入；收录公开菜单索引中的在售与下架产品，以及账单中出现的独立版本，可按系列、年份、已饮状态和杯数筛选。

## 数据与隐私

原始 PDF、用户 ID、订单号、完整取餐码和精确时间仅进入 `data/private/`，该目录被 Git 忽略。公开订单使用内容派生 ID，不含可回溯到平台账户的字段。时间只生成星期 × 小时热力图，取餐码只生成位数、数字频率、回文和重复数字数量。

当前数据截止 **2026-10-03**：122 笔有效订单、实付 ¥4,731.67、225 杯饮品。杯数不含外送费、加料、杯型、周边和甜品。

## 图鉴口径与图片来源

“历年全部产品”指制作时由公开资料能够可靠考证的集合，不冒充喜茶内部 SKU 数据库。每个首创款、容量版本、限定款和联名款独立建档；账单中出现而公开索引缺失的条目仍会保留，并显示统一杯型剪影与“资料待补”。

菜单索引来自[咖啡奶茶喝什么的喜茶菜单](https://www.nckfhsm.com/brands/xi-cha/menu/available)，其单品图片链接指向 `go.cdn.heytea.com`。账单别名会优先匹配同一官方版本；历史产品与门店限定款再由品牌发布、新闻报道和菜单资料补充。已下载图片的原始 URL 保存在 `src/data/catalog.generated.json` 与 `src/data/product-sources.json`，可用 `python3 scripts/fetch_supplemental_images.py` 重建补录素材。所有品牌与产品素材权利归原权利人所有，本项目为个人非商业数据档案。

当前 259 个图鉴条目中有 240 个配有可核验图片，10 个有来源但视觉形式不适合直接作为展品图的条目改用统一品类插画；其余 9 个因缺少能够确认到具体版本的可靠图片，或本身是泛称与活动权益，继续使用“资料待补”剪影。

门店足迹使用 [DataV.GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector) 的中国省级 GeoJSON 边界数据，叠加本项目中已核验的门店经纬度；地图仅在浏览器本地渲染。

## 本地运行

```bash
pnpm install
pnpm dev
```

构建与类型检查：

```bash
pnpm typecheck
pnpm build
```

## 用新版 PDF 更新

首次准备 OCR 环境：

```bash
brew install poppler
python3 -m pip install --target data/private/python -r requirements-ocr.txt
```

随后运行：

```bash
pnpm import:pdf -- /absolute/path/to/喜茶.pdf
```

流程会渲染 PDF、运行本地中文 OCR、重建表格与商品、写出脱敏 JSON，并在 `data/private/diff-report.md` 生成新旧差异。提交前应检查 `data/private/import-review.md` 和页面统计。

下载新图片后运行 `python3 scripts/optimize_images.py`，会把图片统一缩放为不超过 640px 的 WebP 并更新路径引用。

更新公开图鉴：

```bash
python3 scripts/build_catalog.py
```

## 技术栈

Vite、React、TypeScript、Hash Router、Motion、ECharts。`vite.config.ts` 已配置 `/heytea-king/` 子路径，GitHub Actions 会执行类型检查、构建并发布 GitHub Pages。
