import type { Order, Product, StoreLocation } from "../types";
import generatedOrders from "./orders.generated.json";
import generatedCatalog from "./catalog.generated.json";
import productSources from "./product-sources.json";

const fallbackOrders: Order[] = [
  ["2026-10-03", "吉安莱斯百货店", "吉安", "APP", 23, "椰山龙眼冰", 1],
  ["2026-10-01", "GATE M 西岸凤巢店", "上海", "APP", 15, "满杯红柚（首创）", 1],
  ["2026-09-29", "上海五角场万达gelato lab+店", "上海", "APP", 16.72, "芝芝多肉葡萄（首创）", 1],
  ["2026-09-25", "上海五角场万达gelato lab+店", "上海", "APP", 37.6, "中秋限定贺卡", 1],
  ["2026-09-24", "上海五角场万达gelato lab+店", "上海", "APP", 33, "超多肉椰椰芒芒", 2],
  ["2026-09-21", "上海五角场万达gelato lab+店", "上海", "APP", 20.15, "超多肉椰椰芒芒", 1],
  ["2026-09-17", "上海五角场万达gelato lab+店", "上海", "APP", 0, "超多肉椰椰芒芒", 1],
  ["2026-09-15", "上海五角场万达gelato lab+店", "上海", "APP", 27, "超多肉椰椰芒芒", 2],
  ["2026-09-11", "上海五角场万达gelato lab+店", "上海", "APP", 35.02, "茉莉绿妍蝴蝶酥（盒装）", 1],
  ["2026-09-09", "上海百联曲阳购物中心店", "上海", "APP", 16.54, "芒芒甘露（首创）", 1],
  ["2026-09-06", "上海五角场万达gelato lab+店", "上海", "POS", 0, "杨桃三重甘", 1],
  ["2026-09-03", "喜茶lab（上海丰盛里店）", "上海", "APP", 13, "椰椰芒芒", 1],
  ["2026-08-30", "上海五角场万达gelato lab+店", "上海", "POS", 30.21, "芒椰糯米饭喜拉朵", 1],
  ["2026-08-25", "吉安莱斯百货店", "吉安", "APP", 20.94, "爆多加倍葡萄果肉", 1],
  ["2026-08-22", "吉安莱斯百货店", "吉安", "APP", 10.12, "鸭喜香轻柠茶（超大杯）", 1],
  ["2026-08-12", "喜茶lab（上海丰盛里店）", "上海", "APP", 77.38, "岩兰·崇明米酿（本店限定）", 1],
  ["2026-08-11", "上海国金中心冰淇淋实验室", "上海", "APP", 51.52, "芒椰糯米饭手炒冰", 1],
  ["2026-08-04", "深圳机场国内出发厅店", "深圳", "微信小程序", 16, "多肉葡萄（首创）", 1],
  ["2026-08-01", "广州沙面DP店", "广州", "POS", 34.96, "苦抹小牛乳冰淇淋", 2],
  ["2026-07-31", "佛山佛罗伦萨小镇店", "佛山", "APP", 23, "苦巧·咸酪碎银子", 2],
  ["2026-07-24", "佛山佛罗伦萨小镇店", "佛山", "微信小程序", 23, "金韵苹果人参果", 1],
  ["2026-07-18", "佛山佛罗伦萨小镇店", "佛山", "APP", 18, "多肉葡萄（首创）", 2],
  ["2026-07-13", "佛山佛罗伦萨小镇店", "佛山", "APP", 22, "青芒酸", 2],
  ["2026-07-06", "佛山佛罗伦萨小镇店", "佛山", "微信小程序", 22, "微醺黄皮桃", 2],
  ["2026-06-27", "吉安莱斯百货店", "吉安", "APP", 19, "轻芝多肉葡萄（首创）", 1],
  ["2026-06-21", "喜茶lab（上海丰盛里店）", "上海", "APP", 26, "岩兰·崇明米酿（本店限定）", 2],
  ["2026-06-18", "喜茶lab（上海丰盛里店）", "上海", "APP", 43, "端午游龙·单杯套餐", 1],
  ["2026-06-11", "广州沙面DP店", "广州", "微信小程序", 21, "老广鲜腐竹豆浆", 1],
  ["2026-06-05", "吉安莱斯百货店", "吉安", "APP", 18.39, "杨桃三重甘", 1],
  ["2026-05-30", "吉安城南天地店", "吉安", "APP", 16, "奇兰苹果香（首创）", 1],
  ["2026-05-23", "吉安莱斯百货店", "吉安", "APP", 11, "椰椰芒芒", 1],
  ["2026-02-24", "吉安人民广场天地店", "吉安", "微信小程序", 16.5, "烤黑糖波波牛乳茶", 1],
  ["2026-01-01", "南昌万象汇店（关闭）", "南昌", "微信小程序", 16.5, "烤黑糖波波牛乳茶", 1],
  ["2025-12-28", "吉安人民广场天地店", "吉安", "微信小程序", 42, "芝芝多肉葡萄（首创）", 2],
  ["2025-12-21", "吉安人民广场天地店", "吉安", "微信小程序", 17, "清爽芭乐提（红芭乐）", 1],
  ["2025-11-29", "吉安人民广场天地店", "吉安", "微信小程序", 13.2, "小奶茉（超大杯）", 1],
  ["2025-11-08", "吉安人民广场天地店", "吉安", "微信小程序", 13, "椰椰芒芒", 1],
  ["2025-09-30", "吉安人民广场天地店", "吉安", "微信小程序", 16, "多肉葡萄（首创）", 1],
  ["2025-08-10", "南昌中山路天地店", "南昌", "微信小程序", 40, "超多肉芒芒甘露", 2]
].map(([date, store, city, channel, amount, name, quantity], index) => ({
  id: `order-${String(index + 1).padStart(3, "0")}`,
  date: String(date),
  store: String(store),
  city: String(city),
  channel: String(channel),
  amount: Number(amount),
  orderType: "堂食",
  items: [{
    rawName: String(name),
    productId: `p-${String(name).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "").toLowerCase()}`,
    quantity: Number(quantity),
    kind: String(name).includes("贺卡") || String(name).includes("蝴蝶酥") ? "merch" : "drink",
  }],
})) as Order[];

export const orders: Order[] = (generatedOrders.length ? generatedOrders : fallbackOrders) as Order[];

const productSeeds: Array<[string, string, number, string]> = [
  ["椰椰芒芒", "果茶", 2025, "#e7b23b"], ["多肉葡萄（首创）", "果茶", 2025, "#73508f"],
  ["杨桃三重甘", "果茶", 2026, "#c8d45d"], ["烤黑糖波波牛乳茶", "真奶茶", 2025, "#8f7657"],
  ["满杯红柚（首创）", "果茶", 2026, "#e68586"], ["超多肉椰椰芒芒", "果茶", 2026, "#eba63d"],
  ["芝芝多肉葡萄（首创）", "果茶", 2025, "#8a62a5"], ["芒芒甘露（首创）", "果茶", 2026, "#f1b742"],
  ["小奶茉（超大杯）", "轻乳茶", 2025, "#c6b696"], ["清爽芭乐提（红芭乐）", "果茶", 2025, "#e68498"],
  ["奇兰苹果杏（首创）", "纯茶", 2026, "#ddc65a"], ["岩兰·崇明米酿（本店限定）", "茶特调", 2026, "#d7c5a4"],
  ["芒椰糯米饭喜拉朵", "冰淇淋", 2026, "#eee1b6"], ["金韵苹果人参果", "果茶", 2026, "#e2bd4f"],
  ["轻芝多肉葡萄（首创）", "果茶", 2026, "#9c72ad"], ["微醺黄皮桃", "果茶", 2026, "#dca868"],
  ["青芒酸", "果茶", 2026, "#a9c951"], ["老广鲜腐竹豆浆", "真奶茶", 2026, "#d5c6a8"],
  ["鸭喜香轻柠茶（超大杯）", "纯茶", 2026, "#c3a95b"], ["椰山龙眼冰", "果茶", 2026, "#d9b37a"],
  ["羽衣甘蓝纤体瓶", "果蔬茶", 2024, "#7a9d54"], ["双榨杨桃油柑", "果蔬茶", 2024, "#b7cc56"],
  ["超级植物茶", "果蔬茶", 2024, "#789565"], ["芝芝绿妍茶后", "纯茶", 2023, "#bacb76"],
  ["多肉青提", "果茶", 2022, "#a9c870"], ["芝芝莓莓", "果茶", 2021, "#ba5e83"],
  ["豆豆波波茶", "真奶茶", 2020, "#a98562"], ["满杯百香果", "果茶", 2019, "#e6aa42"],
  ["芝芝芒芒", "果茶", 2018, "#f0c64d"], ["芝芝金凤茶王", "纯茶", 2018, "#c7a66a"],
  ["满杯橙橙", "果茶", 2017, "#ed9b38"], ["芝芝绿妍", "纯茶", 2017, "#9cad69"],
  ["四季春", "纯茶", 2016, "#a69c65"], ["金凤茶王", "纯茶", 2016, "#b59a6f"],
  ["静冈抹茶", "茶特调", 2016, "#7fa15b"], ["奥利奥波波茶", "真奶茶", 2019, "#78695d"],
  ["芋泥波波牛乳", "真奶茶", 2019, "#99809d"], ["喜茶咖啡", "咖啡", 2020, "#735b49"],
  ["厚烧布蕾", "甜品", 2021, "#deb26f"], ["冰山熔岩", "甜品", 2021, "#6b4b3b"]
];

const palette = ["#c9a96e", "#a6b67e", "#d99b68", "#a9809a", "#92a9a3", "#c78575", "#8e826f"];
const inferSeries = (name: string) => {
  if (/抹|茉|茶王|乌龙|碎银子|柠茶/.test(name)) return "纯茶与轻乳茶";
  if (/牛乳|波波|港奶|豆浆/.test(name)) return "真奶茶";
  if (/冰|gelato|手炒/.test(name)) return "冰淇淋与冰品";
  if (/套餐|一茶/.test(name)) return "限定与联名";
  return "果茶";
};
const localProductImages: Record<string, string> = {
  "椰椰芒芒": "ye-ye-mang-mang.jpg",
  "多肉葡萄（首创）": "duo-rou-pu-tao.jpg",
  "杨桃三重甘": "yang-tao-san-chong-gan.jpg",
  "烤黑糖波波牛乳茶": "kao-hei-tang-bo-bo.jpg",
  "芒芒甘露（首创）": "mang-mang-gan-lu.jpg",
};

const catalogNames = new Set(generatedCatalog.map((product) => product.name));
const manualExtras = productSeeds.filter(([name]) => !catalogNames.has(name));
const knownNames = new Set([...catalogNames, ...manualExtras.map(([name]) => name)]);
const orderedExtras = [...new Set(orders.flatMap((order) => order.items.filter((item) => item.kind === "drink" && !knownNames.has(item.rawName)).map((item) => item.rawName)))];

function purchaseStats(name: string) {
  const matching = orders.filter((order) => order.items.some((item) => item.rawName === name));
  const cupCount = matching.reduce((sum, order) => sum + order.items.filter((item) => item.rawName === name).reduce((n, item) => n + item.quantity, 0), 0);
  return { matching, cupCount };
}

const researchedProducts: Product[] = generatedCatalog.map((entry, index) => {
  const { matching, cupCount } = purchaseStats(entry.name);
  return {
    id: entry.id,
    name: entry.name,
    version: entry.name.match(/[（(](.+?)[）)]/)?.[1] ?? (entry.availability === "下架" ? "历史版" : "当前版"),
    series: entry.series,
    year: entry.year || Number(matching.at(-1)?.date.slice(0, 4) ?? 0),
    cupCount,
    orderCount: matching.length,
    firstPurchased: matching.at(-1)?.date,
    lastPurchased: matching.at(0)?.date,
    stores: [...new Set(matching.map((order) => order.store))],
    cities: [...new Set(matching.map((order) => order.city))],
    image: entry.image ? `${import.meta.env.BASE_URL}${entry.image}` : undefined,
    imageStatus: entry.image ? "official" : "placeholder",
    source: entry.imageSource ?? entry.sourcePage,
    availability: entry.availability,
    color: palette[index % palette.length],
  };
});

const supplementalProducts: Product[] = [
  ...manualExtras,
  ...orderedExtras.map((name, index) => [name, inferSeries(name), Number([...orders].reverse().find((order) => order.items.some((item) => item.rawName === name))?.date.slice(0, 4) ?? 0), palette[index % palette.length]] as [string, string, number, string]),
].map(([name, series, year, color], index) => {
  const { matching, cupCount } = purchaseStats(name);
  const localImage = localProductImages[name];
  return {
    id: matching.flatMap((order) => order.items).find((item) => item.rawName === name)?.productId ?? `supplement-${index + 1}`,
    name,
    version: name.match(/[（(](.+?)[）)]/)?.[1] ?? (name.includes("限定") ? "限定版" : "经典版"),
    series,
    year,
    cupCount,
    orderCount: matching.length,
    firstPurchased: matching.at(-1)?.date,
    lastPurchased: matching.at(0)?.date,
    stores: [...new Set(matching.map((order) => order.store))],
    cities: [...new Set(matching.map((order) => order.city))],
    image: localImage ? `${import.meta.env.BASE_URL}assets/products/${localImage}` : undefined,
    imageStatus: localImage ? "official" : "placeholder",
    source: productSources[name as keyof typeof productSources],
    availability: "资料补录",
    color,
  };
});

export const products: Product[] = [...researchedProducts, ...supplementalProducts];

export const stores: StoreLocation[] = [
  ["上海五角场万达 gelato lab+店", "上海", 121.51, 31.30],
  ["喜茶 lab（上海丰盛里店）", "上海", 121.46, 31.23],
  ["吉安莱斯百货店", "吉安", 114.99, 27.12],
  ["吉安人民广场天虹店", "吉安", 114.98, 27.11],
  ["佛山佛罗伦萨小镇店", "佛山", 113.15, 23.02],
  ["广州沙面DP店", "广州", 113.24, 23.11],
  ["深圳机场国内出发厅店", "深圳", 113.81, 22.63],
  ["南昌中山路天虹店", "南昌", 115.89, 28.68]
].map(([name, city, longitude, latitude]) => ({ name: String(name), city: String(city), longitude: Number(longitude), latitude: Number(latitude), visits: orders.filter((order) => order.store === name).length }));

export const catalogResearchNote = `公开资料考证 ${generatedCatalog.length} 项；账单中出现但目录未收录的版本另行补档。`;
