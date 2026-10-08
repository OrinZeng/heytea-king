import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CupSoda,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { orders, products, stores } from "./data/siteData";
import aggregateData from "./data/aggregates.generated.json";
import type { Product } from "./types";
import { LazyChart } from "./lib/LazyChart";

const ink = "#141414";
const gold = "#bd8a59";
const muted = "#aaa7a1";

const currency = (value: number) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(value);
const unique = <T,>(values: T[]) => [...new Set(values)];

function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const [heroHidden, setHeroHidden] = useState(true);
  const location = useLocation();
  useEffect(() => {
    const update = () => setHeroHidden(location.pathname === "/" && window.scrollY < window.innerHeight * 0.7);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [location.pathname]);
  return (
    <header className={`site-header ${heroHidden ? "header-hidden" : ""}`}>
      <Link className="brand-lockup" to="/" aria-label="Heytea King 首页">
        <img src={`${import.meta.env.BASE_URL}assets/heytea-logo-small.webp`} alt="" width={42} height={42} />
        <span><strong>Heytea King</strong><small>杯盏纪年</small></span>
      </Link>
      <span className="header-sequence">杯盏纪年 · 杯中万象</span>
    </header>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 34 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ChapterTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className={`chapter-title ${note ? "" : "chapter-title-compact"}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {note && <p>{note}</p>}
    </div>
  );
}

function HomePage() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const scale = useTransform(scrollYProgress, [0, 0.12], [1, 0.58]);
  const opacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.08]);

  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
  const cupCount = orders.reduce((sum, order) => sum + order.items.filter((item) => item.kind === "drink").reduce((n, item) => n + item.quantity, 0), 0);
  const cities = unique(orders.map((order) => order.city));
  const storeNames = unique(orders.map((order) => order.store));
  const tried = products.filter((product) => product.cupCount > 0).length;

  const monthly = useMemo(() => {
    const bucket = new Map<string, { amount: number; orders: number }>();
    orders.forEach((order) => {
      const key = order.date.slice(0, 7);
      const current = bucket.get(key) ?? { amount: 0, orders: 0 };
      current.amount += order.amount;
      current.orders += 1;
      bucket.set(key, current);
    });
    return [...bucket.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const monthlyOption = {
    animationDuration: 1000,
    tooltip: { trigger: "axis" },
    grid: { left: 44, right: 38, top: 48, bottom: 36 },
    xAxis: { type: "category", data: monthly.map(([month]) => month.slice(2)), axisLine: { lineStyle: { color: "#d9d9d6" } }, axisTick: { show: false }, axisLabel: { color: "#8b8984" } },
    yAxis: [
      { type: "value", splitLine: { lineStyle: { color: "#efefed" } }, axisLabel: { color: "#9b9994", formatter: "¥{value}" } },
      { type: "value", minInterval: 1, splitLine: { show: false }, axisLabel: { color: "#b6814e", formatter: "{value} 单" } },
    ],
    series: [
      { type: "bar", name: "实付金额", data: monthly.map(([, value]) => value.amount.toFixed(2)), tooltip: { valueFormatter: (value: number) => currency(value) }, itemStyle: { color: ink, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 28 },
      { type: "line", name: "订单数", yAxisIndex: 1, data: monthly.map(([, value]) => value.orders), tooltip: { valueFormatter: (value: number) => `${value} 单` }, lineStyle: { color: gold, width: 2 }, itemStyle: { color: gold }, symbolSize: 7 },
    ],
  };

  return (
    <main>
      <section className="hero" aria-label="喜茶品牌封面">
        <motion.img
          style={reduced ? undefined : { scale, opacity }}
          src={`${import.meta.env.BASE_URL}assets/heytea-logo.webp`}
          alt="HEYTEA 喜茶"
          fetchPriority="high"
          decoding="async"
        />
      </section>

      <section className="intro-section page-width">
        <Reveal>
          <p className="kicker">HEYTEA · PERSONAL ARCHIVE</p>
          <h1>Heytea King</h1>
          <p className="display-subtitle">杯盏纪年</p>
          <div className="hairline" />
          <p className="lede">从 2025 年夏天到今天，每一杯都有日期，也有抵达过的地方。</p>
        </Reveal>
      </section>

      <section className="chapter page-width" id="between">
        <Reveal><ChapterTitle eyebrow="CHAPTER 01" title="一杯之间" /></Reveal>
        <div className="metrics-grid">
          <Metric dark label="累计实付" value={currency(totalAmount)} icon={<CircleDollarSign />} />
          <Metric label="有效订单" value={`${orders.length} 单`} icon={<CalendarDays />} />
          <Metric label="共饮" value={`${cupCount} 杯`} icon={<CupSoda />} />
          <Metric label="到访门店" value={`${storeNames.length} 家`} note={`足迹遍及 ${cities.length} 座城市`} icon={<Store />} />
          <Metric label="图鉴点亮" value={`${tried} / ${products.length}`} note={`${Math.round((tried / products.length) * 100)}% 已饮`} icon={<Sparkles />} />
          <Metric label="平均客单" value={currency(totalAmount / orders.length)} icon={<SlidersHorizontal />} />
        </div>
        <Reveal className="insight-grid">
          <Insight title="常念的一杯" value={[...products].sort((a, b) => b.cupCount - a.cupCount)[0]?.name ?? "尚未统计"} note={`${[...products].sort((a, b) => b.cupCount - a.cupCount)[0]?.cupCount ?? 0} 杯`} />
          <Insight title="最近的月份" value={monthly.at(-1)?.[0] ?? "-"} note={`${monthly.at(-1)?.[1].orders ?? 0} 单 · ${currency(monthly.at(-1)?.[1].amount ?? 0)}`} />
          <Insight title="最常抵达" value={topBy(orders.map((order) => order.store))} note={topBy(orders.map((order) => order.city))} />
        </Reveal>
      </section>

      <section className="chapter page-width">
        <Reveal><ChapterTitle eyebrow="CHAPTER 02" title="时光入盏" /></Reveal>
        <Reveal className="panel chart-panel">
          <div className="panel-heading"><div><h3>月度消费趋势</h3><p>柱形为实付金额，金色折线映照订单频次。</p></div><span>{monthly.length} 个月</span></div>
          <LazyChart option={monthlyOption} style={{ height: 390 }} />
        </Reveal>
        <YearCompare />
      </section>

      <section className="chapter page-width">
        <Reveal><ChapterTitle eyebrow="CHAPTER 03" title="饮茶时刻" /></Reveal>
        <Reveal className="panel"><Heatmap /></Reveal>
        <div className="split-grid">
          <Reveal className="panel"><ChannelChart /></Reveal>
          <Reveal className="panel"><PriceBands /></Reveal>
        </div>
      </section>

      <section className="chapter page-width">
        <Reveal><ChapterTitle eyebrow="CHAPTER 04" title="杯行何处" /></Reveal>
        <Reveal className="panel map-panel"><StoreMap /></Reveal>
        <div className="split-grid">
          <Reveal className="panel"><CityRanks /></Reveal>
          <Reveal className="panel"><StoreRanks /></Reveal>
        </div>
      </section>

      <section className="chapter page-width">
        <Reveal><ChapterTitle eyebrow="CHAPTER 05" title="数字有意" /></Reveal>
        <div className="number-story-grid">
          <Reveal className="panel number-card"><span>最常出现</span><strong>{aggregateData.pickup.digits.indexOf(Math.max(...aggregateData.pickup.digits))}</strong></Reveal>
          <Reveal className="panel number-card"><span>回文号码</span><strong>{aggregateData.pickup.palindromes}</strong></Reveal>
          <Reveal className="panel number-card"><span>重复数字</span><strong>{aggregateData.pickup.repeated}</strong></Reveal>
        </div>
        <Reveal className="panel digit-bars">
          <h3>号码里的十个数</h3>
          <div>{aggregateData.pickup.digits.map((value, digit) => <span key={digit} style={{ "--height": `${Math.max(18, value * 1.45)}px` } as React.CSSProperties}><i>{value}</i><b>{digit}</b></span>)}</div>
        </Reveal>
      </section>

      <section className="chapter page-width">
        <Reveal><ChapterTitle eyebrow="CHAPTER 06" title="杯盏日历" /></Reveal>
        <Reveal className="panel"><CalendarHeatmap /></Reveal>
      </section>

      <section className="atlas-transition" aria-label="继续向下进入杯中万象">
        <div><p>THE COMPLETE COLLECTION</p><h2>杯中万象</h2><span>继续向下</span></div>
        <i aria-hidden="true" />
      </section>
      <AtlasSection />
    </main>
  );
}

function Metric({ label, value, note, icon, dark = false }: { label: string; value: string; note?: string; icon: React.ReactNode; dark?: boolean }) {
  return <Reveal className={`metric ${dark ? "metric-dark" : ""}`}><span className="metric-icon">{icon}</span><p>{label}</p><strong>{value}</strong>{note && <small>{note}</small>}</Reveal>;
}

function Insight({ title, value, note }: { title: string; value: string; note: string }) {
  return <article><span>{title}</span><strong>{value}</strong><p>{note}</p></article>;
}

function topBy(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => ({ ...acc, [value]: (acc[value] ?? 0) + 1 }), {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
}

function YearCompare() {
  const years = unique(orders.map((order) => order.date.slice(0, 4))).sort();
  const data = years.map((year) => ({
    year,
    amount: orders.filter((order) => order.date.startsWith(year)).reduce((sum, order) => sum + order.amount, 0),
    orders: orders.filter((order) => order.date.startsWith(year)).length,
  }));
  return <Reveal className="compare-grid">{data.map((item) => <article className="panel" key={item.year}><span>{item.year}</span><strong>{currency(item.amount)}</strong><p>{item.orders} 单 · 平均 {currency(item.amount / item.orders)}</p><div style={{ width: `${Math.min(100, item.amount / Math.max(...data.map((d) => d.amount)) * 100)}%` }} /></article>)}</Reveal>;
}

function Heatmap() {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const values = days.flatMap((_, day) => aggregateData.hourGrid[day].map((value, hour) => [hour, day, value]));
  const maxValue = Math.max(1, ...aggregateData.hourGrid.flat());
  const option = {
    tooltip: { position: "top" },
    grid: { left: 62, right: 18, top: 50, bottom: 32 },
    xAxis: { type: "category", data: Array.from({ length: 15 }, (_, i) => i + 8), splitArea: { show: true }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: "category", data: days, splitArea: { show: true }, axisLine: { show: false }, axisTick: { show: false } },
    visualMap: { min: 0, max: maxValue, show: false, inRange: { color: ["#f1f1ef", "#c7c7c2", "#797974", ink] } },
    series: [{ type: "heatmap", data: values, label: { show: true, color: "#666" }, itemStyle: { borderRadius: 7, borderColor: "#fff", borderWidth: 4 } }],
  };
  return <><div className="panel-heading"><div><h3>星期 × 时段分布</h3><p>颜色越深，越常在这个时刻下单。</p></div><span>08—22</span></div><LazyChart option={option} style={{ height: 350 }} /></>;
}

function ChannelChart() {
  const channels = unique(orders.map((order) => order.channel)).map((name) => ({ name, value: orders.filter((order) => order.channel === name).length }));
  const option = { tooltip: { trigger: "item" }, color: [ink, gold, "#c7c5c0", "#ecebe8"], series: [{ type: "pie", radius: ["55%", "76%"], center: ["45%", "52%"], data: channels, label: { formatter: "{b}\n{d}%", color: "#555" }, itemStyle: { borderColor: "#fff", borderWidth: 4 } }] };
  return <><h3>下单渠道</h3><p className="panel-note">按有效订单统计</p><LazyChart option={option} style={{ height: 310 }} /></>;
}

function PriceBands() {
  const bands = [["0 元", 0, 0.01], ["0–15", 0.01, 15], ["15–20", 15, 20], ["20–30", 20, 30], ["30–50", 30, 50], ["50+", 50, Infinity]] as const;
  const data = bands.map(([name, min, max]) => ({ name, value: orders.filter((order) => order.amount >= min && order.amount < max).length }));
  const option = { grid: { left: 36, right: 20, top: 32, bottom: 42 }, xAxis: { type: "category", data: data.map((d) => d.name), axisLine: { lineStyle: { color: "#ddd" } }, axisTick: { show: false } }, yAxis: { type: "value", splitLine: { lineStyle: { color: "#eee" } } }, series: [{ type: "bar", data: data.map((d) => d.value), itemStyle: { color: ink, borderRadius: [5, 5, 0, 0] }, label: { show: true, position: "top" } }] };
  return <><h3>订单价格带</h3><p className="panel-note">一杯与一单之间的日常尺度</p><LazyChart option={option} style={{ height: 310 }} /></>;
}

function StoreMap() {
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      import("./lib/charts"),
      fetch(`${import.meta.env.BASE_URL}assets/china-provinces.geojson`).then((response) => response.json()),
    ])
      .then(([charts, geoJson]) => {
        charts.registerMap("heytea-china", geoJson);
        if (active) setMapReady(true);
      })
      .catch(() => { if (active) setMapFailed(true); });
    return () => { active = false; };
  }, []);

  const mapOption = {
    animationDuration: 900,
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(20,20,20,.94)",
      borderWidth: 0,
      textStyle: { color: "#fff", fontSize: 12 },
      formatter: (params: { data?: { name: string; city: string; value: number[] } }) => params.data
        ? `${params.data.name}<br/>${params.data.city} · ${params.data.value[2]} 次`
        : "",
    },
    geo: {
      map: "heytea-china",
      roam: true,
      zoom: 1.18,
      center: [107.5, 32.5],
      itemStyle: { areaColor: "#f3f2ef", borderColor: "#d2d0ca", borderWidth: 0.8 },
      emphasis: { itemStyle: { areaColor: "#e8e4dc" }, label: { show: false } },
      select: { disabled: true },
      label: { show: false },
    },
    series: [{
      type: "effectScatter",
      coordinateSystem: "geo",
      showEffectOn: "emphasis",
      rippleEffect: { scale: 2.7, brushType: "stroke" },
      symbolSize: (value: number[]) => Math.min(34, 9 + value[2] * 0.65),
      itemStyle: { color: gold, shadowColor: "rgba(20,20,20,.24)", shadowBlur: 8 },
      emphasis: { scale: 1.35, label: { show: true, formatter: "{b}", position: "right", color: ink, fontWeight: 600 } },
      data: stores.map((store) => ({ name: store.name, city: store.city, value: [store.longitude, store.latitude, store.visits] })),
    }],
  };

  return <><div className="panel-heading"><div><h3>门店足迹</h3><p>拖动与缩放地图，悬停查看具体门店。</p></div><span>{stores.length} 家</span></div><div className="store-map">{mapReady ? <LazyChart option={mapOption} style={{ height: "100%" }} /> : <span>{mapFailed ? "地图载入失败，请稍后刷新重试" : "地图载入中"}</span>}</div></>;
}

function CityRanks() {
  const data = unique(orders.map((o) => o.city)).map((city) => [city, orders.filter((o) => o.city === city).length] as const).sort((a, b) => b[1] - a[1]);
  return <RankList title="城市分布" items={data} />;
}

function StoreRanks() {
  const data = unique(orders.map((o) => o.store)).map((store) => [store, orders.filter((o) => o.store === store).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 7);
  return <RankList title="常去门店" items={data} />;
}

function RankList({ title, items }: { title: string; items: ReadonlyArray<readonly [string, number]> }) {
  const max = Math.max(...items.map((item) => item[1]));
  return <><h3>{title}</h3><div className="rank-list">{items.map(([label, value], index) => <div key={label}><b>{String(index + 1).padStart(2, "0")}</b><span>{label}</span><i><em style={{ width: `${(value / max) * 100}%` }} /></i><strong>{value}</strong></div>)}</div></>;
}

function CalendarHeatmap() {
  const dates = new Set(orders.map((order) => order.date));
  const start = new Date("2025-08-01T00:00:00");
  const cells = Array.from({ length: 62 }, (_, week) => Array.from({ length: 7 }, (_, day) => {
    const date = new Date(start); date.setDate(date.getDate() + week * 7 + day);
    const iso = date.toISOString().slice(0, 10);
    const count = orders.filter((order) => order.date === iso).length;
    return { iso, active: dates.has(iso), count };
  }));
  return <><div className="panel-heading"><div><h3>按周展开的打卡记录</h3><p>从第一笔账单开始，到数据截止日。</p></div><span>{dates.size} 个消费日</span></div><div className="calendar-scroll"><div className="calendar-grid">{cells.flat().map((cell) => <span key={cell.iso} className={cell.active ? `active level-${Math.min(3, cell.count)}` : ""} title={`${cell.iso}${cell.active ? ` · ${cell.count} 单` : ""}`} />)}</div></div></>;
}

function AtlasSection() {
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("全部系列");
  const [year, setYear] = useState("全部年份");
  const [status, setStatus] = useState("全部状态");
  const [sort, setSort] = useState("series");
  const [selected, setSelected] = useState<Product | null>(null);
  const seriesOptions = ["全部系列", ...unique(products.map((product) => product.series))];
  const yearOptions = ["全部年份", ...unique(products.map((product) => String(product.year))).sort().reverse()];
  const filtered = products.filter((product) => {
    const queryMatch = product.name.toLowerCase().includes(query.toLowerCase());
    const seriesMatch = series === "全部系列" || product.series === series;
    const yearMatch = year === "全部年份" || String(product.year) === year;
    const statusMatch = status === "全部状态" || (status === "已饮" ? product.cupCount > 0 : product.cupCount === 0);
    return queryMatch && seriesMatch && yearMatch && statusMatch;
  }).sort((a, b) => sort === "cups" ? b.cupCount - a.cupCount : sort === "year" ? b.year - a.year : a.series.localeCompare(b.series, "zh-CN"));

  return <section className="atlas-section page-width" id="atlas">
    <PageMasthead eyebrow="THE COMPLETE COLLECTION" title="杯中万象" subtitle="喜茶历年产品图鉴" />
    <div className="atlas-summary"><span><b>{products.filter((p) => p.cupCount > 0).length}</b> 已饮</span><span><b>{products.filter((p) => p.cupCount === 0).length}</b> 未饮</span><span><b>{products.length}</b> 图鉴条目</span></div>
    <div className="filters sticky-filters">
      <label className="search-field"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索产品、版本或系列" aria-label="搜索产品" /></label>
      <select value={series} onChange={(event) => setSeries(event.target.value)} aria-label="筛选系列">{seriesOptions.map((item) => <option key={item}>{item}</option>)}</select>
      <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="筛选年份">{yearOptions.map((item) => <option value={item} key={item}>{item === "0" ? "年份待考" : item}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="筛选饮用状态"><option>全部状态</option><option>已饮</option><option>未饮</option></select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="排序"><option value="series">按系列</option><option value="year">按年份</option><option value="cups">按杯数</option></select>
    </div>
    <p className="result-count">显示 {filtered.length} / {products.length} 项</p>
    {sort === "series" ? <div className="catalog-groups">{unique(filtered.map((product) => product.series)).map((group) => <section key={group}><header><h2>{group}</h2><span>{filtered.filter((product) => product.series === group).length} 项</span></header><div className="product-grid">{filtered.filter((product) => product.series === group).map((product, index) => <ProductCard product={product} index={index} key={product.id} onSelect={() => setSelected(product)} />)}</div></section>)}</div> : <div className="product-grid">{filtered.map((product, index) => <ProductCard product={product} index={index} key={product.id} onSelect={() => setSelected(product)} />)}</div>}
    <AnimatePresence>{selected && <ProductDrawer product={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
  </section>;
}

function ProductCard({ product, index, onSelect }: { product: Product; index: number; onSelect: () => void }) {
  const tried = product.cupCount > 0;
  return <motion.button className={`product-card ${tried ? "tried" : "untried"}`} onClick={onSelect} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.4) }}>
    <div className="product-art" style={{ "--drink": product.color } as React.CSSProperties}>
      {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" width={480} height={480} /> : <ProductIllustration product={product} />}
      <span>{tried ? `${product.cupCount} 杯` : "未饮"}</span>
    </div>
    <div className="product-copy"><small>{product.series} · {product.year || "年份待考"}</small><h3>{product.name}</h3><p>{product.version}</p></div>
  </motion.button>;
}

function ProductDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const matching = orders.filter((order) => order.items.some((item) => item.rawName === product.name));
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);
  return <motion.div className="drawer-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={product.name} onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }}>
      <button className="drawer-close" onClick={onClose} aria-label="关闭"><X /></button>
      <div className="drawer-hero" style={{ "--drink": product.color } as React.CSSProperties}>{product.image ? <img src={product.image} alt={product.name} /> : <ProductIllustration product={product} />}<span>{product.series}</span></div>
      <p className="kicker">{product.year || "年份待考"} · {product.version}{product.availability ? ` · ${product.availability}` : ""}</p><h2>{product.name}</h2>
      <div className="drawer-stats"><article><span>喝过</span><strong>{product.cupCount}</strong><small>杯</small></article><article><span>涉及</span><strong>{product.orderCount}</strong><small>单</small></article><article><span>到访</span><strong>{product.stores.length}</strong><small>店</small></article></div>
      <div className="detail-pairs"><div><span>首次购买</span><b>{product.firstPurchased ?? "尚未喝过"}</b></div><div><span>最近一次</span><b>{product.lastPurchased ?? "—"}</b></div><div><span>覆盖城市</span><b>{product.cities.join("、") || "—"}</b></div><div><span>图片状态</span><b>{product.imageStatus === "official" ? "官方资料" : product.imageStatus === "verified" ? "公开资料" : product.imageStatus === "illustrated" ? "统一插画" : "资料待补"}</b></div></div>
      {product.source && <a className="source-link" href={product.source} target="_blank" rel="noreferrer">查看图片原始来源 <ChevronRight /></a>}
      <h3 className="drawer-section-title">购买履历</h3>
      <div className="purchase-history">{matching.length ? matching.map((order) => <div key={order.id}><time>{order.date}</time><span>{order.store}</span><b>{currency(order.amount)}</b></div>) : <p>这杯尚未出现在订单里。</p>}</div>
    </motion.aside>
  </motion.div>;
}

function ProductIllustration({ product }: { product: Product }) {
  const name = product.name.toLowerCase();
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (/gelato|喜拉朵|冰淇淋/.test(name)) return <svg className="product-silhouette gelato-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M35 52h50l-6 47H41z" fill="currentColor" fillOpacity=".08" />
    <path d="M39 51c-7-6-2-17 7-17-1-10 13-16 20-8 9-7 23 1 20 12 9 3 9 14-1 16" />
    <path d="M35 52h50l-6 47H41zM47 71c9 5 17 5 26 0" />
  </svg>;
  if (/蛋糕|巴斯克|熔岩/.test(name)) return <svg className="product-silhouette cake-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M26 85 52 35l43 24-17 38z" fill="currentColor" fillOpacity=".08" />
    <path d="M26 85 52 35l43 24-17 38zM34 70l51 14M52 35l-1 17M51 52c14-4 28 3 37 13" />
    <path d="M50 33c2-8 10-11 14-4" />
  </svg>;
  if (/蛋挞|布蕾挞|麻薯蛋挞|芋泥挞|可颂挞/.test(name)) return <svg className="product-silhouette tart-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <ellipse cx="60" cy="45" rx="34" ry="14" fill="currentColor" fillOpacity=".08" />
    <path d="M26 45h68L84 91H36zM26 45c0-8 15-14 34-14s34 6 34 14-15 14-34 14-34-6-34-14zM42 47c8-5 28-5 36 0" />
  </svg>;
  if (/布蕾/.test(name)) return <svg className="product-silhouette pudding-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M35 38h50l7 49c1 9-7 16-16 16H44c-9 0-17-7-16-16z" fill="currentColor" fillOpacity=".08" />
    <path d="M35 38h50l7 49c1 9-7 16-16 16H44c-9 0-17-7-16-16zM35 38c0-7 11-12 25-12s25 5 25 12-11 12-25 12-25-5-25-12zM39 72c13 5 29 5 42 0" />
  </svg>;
  if (/蝴蝶酥|茶酥|一茶一酥|可颂|西多士/.test(name)) return <svg className="product-silhouette pastry-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M24 72c8-30 25-42 36-22 11-20 28-8 36 22-11 19-25 22-36 8-11 14-25 11-36-8z" fill="currentColor" fillOpacity=".08" />
    <path d="M24 72c8-30 25-42 36-22 11-20 28-8 36 22-11 19-25 22-36 8-11 14-25 11-36-8zM39 58c6 11 8 19 6 29M81 58c-6 11-8 19-6 29M60 50v30" />
  </svg>;
  if (/手炒冰|吃冰|波波冰|抹茶冰|乌龙冰/.test(name)) return <svg className="product-silhouette ice-bowl-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M23 55h74c-3 25-17 40-37 40S26 80 23 55z" fill="currentColor" fillOpacity=".08" />
    <path d="M23 55h74c-3 25-17 40-37 40S26 80 23 55zM34 51c4-18 18-25 28-13 8-12 24-4 24 13M44 95h32" />
    <circle cx="49" cy="51" r="3" fill="currentColor" fillOpacity=".35" /><circle cx="69" cy="45" r="3" fill="currentColor" fillOpacity=".35" />
  </svg>;
  if (/糯米饭/.test(name)) return <svg className="product-silhouette rice-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M25 56h70c-2 27-17 41-35 41S27 83 25 56z" fill="currentColor" fillOpacity=".08" />
    <path d="M25 56h70c-2 27-17 41-35 41S27 83 25 56zM35 55c3-18 14-25 25-13 10-12 24-5 26 13" />
    <path d="m42 45 6-12M78 45l-6-12" />
  </svg>;
  if (/瓶|康普茶|植物茶/.test(name)) return <svg className="product-silhouette bottle-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M47 23h26v18c0 6 9 10 9 20v36H38V61c0-10 9-14 9-20z" fill="currentColor" fillOpacity=".08" />
    <path d="M47 23h26v18c0 6 9 10 9 20v36H38V61c0-10 9-14 9-20zM47 33h26M43 68h34" />
  </svg>;
  if (/咖啡/.test(name)) return <svg className="product-silhouette coffee-shape" viewBox="0 0 120 120" aria-hidden="true" {...common}>
    <path d="M27 46h58v40c0 8-7 14-15 14H42c-8 0-15-6-15-14z" fill="currentColor" fillOpacity=".08" />
    <path d="M27 46h58v40c0 8-7 14-15 14H42c-8 0-15-6-15-14zM85 57h7c14 0 14 24 0 24h-7M43 32c-5 6 5 8 0 14M61 28c-5 7 5 10 0 17" />
  </svg>;
  return <CupSoda className="product-silhouette drink-shape" aria-hidden="true" />;
}

function PageMasthead({ eyebrow, title, subtitle, note }: { eyebrow: string; title: string; subtitle: string; note?: string }) {
  return <header className="page-masthead"><p className="kicker">{eyebrow}</p><h1>{title}</h1><span>{subtitle}</span><div className="hairline" />{note && <p>{note}</p>}</header>;
}

function SiteFooter() {
  return <footer><img src={`${import.meta.env.BASE_URL}assets/heytea-logo-small.webp`} alt="" width={42} height={42} /><div><strong>Heytea King</strong><span>杯盏纪年 · 数据截至 {orders[0]?.date.replaceAll("-", ".")}</span></div><p>个人非商业数据档案。品牌与产品素材权利归原权利人所有。</p></footer>;
}

export default App;
