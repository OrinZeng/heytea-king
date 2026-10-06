import { useEffect, useMemo, useState } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CupSoda,
  Download,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { catalogResearchNote, orders, products, stores } from "./data/siteData";
import aggregateData from "./data/aggregates.generated.json";
import type { Order, Product } from "./types";

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
        <Route path="/atlas" element={<AtlasPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
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
        <img src={`${import.meta.env.BASE_URL}assets/heytea-logo.png`} alt="" />
        <span><strong>Heytea King</strong><small>杯盏纪年</small></span>
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="打开导航"><Menu /></button>
      <nav className={open ? "nav-open" : ""} onClick={() => setOpen(false)}>
        <NavLink to="/">杯盏纪年</NavLink>
        <NavLink to="/atlas">杯中万象</NavLink>
        <NavLink to="/orders">一单一程</NavLink>
      </nav>
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
    tooltip: { trigger: "axis", valueFormatter: (value: number) => currency(value) },
    grid: { left: 44, right: 38, top: 48, bottom: 36 },
    xAxis: { type: "category", data: monthly.map(([month]) => month.slice(2)), axisLine: { lineStyle: { color: "#d9d9d6" } }, axisTick: { show: false }, axisLabel: { color: "#8b8984" } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#efefed" } }, axisLabel: { color: "#9b9994", formatter: "¥{value}" } },
    series: [
      { type: "bar", name: "实付金额", data: monthly.map(([, value]) => value.amount.toFixed(2)), itemStyle: { color: ink, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 28 },
      { type: "line", name: "订单数", yAxisIndex: 0, data: monthly.map(([, value]) => value.orders * 12), lineStyle: { color: gold, width: 2 }, itemStyle: { color: gold }, symbolSize: 7 },
    ],
  };

  return (
    <main>
      <section className="hero" aria-label="喜茶品牌封面">
        <motion.img
          style={reduced ? undefined : { scale, opacity }}
          src={`${import.meta.env.BASE_URL}assets/heytea-logo.png`}
          alt="HEYTEA 喜茶"
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
          <ReactECharts option={monthlyOption} style={{ height: 390 }} />
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

      <section className="atlas-invite">
        <div><p>THE COMPLETE COLLECTION</p><h2>杯中万象</h2><span>去看已经点亮的杯子，也看看下一杯可能是什么。</span></div>
        <Link to="/atlas">进入喜茶图鉴 <ChevronRight /></Link>
      </section>
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
  return <><div className="panel-heading"><div><h3>星期 × 时段分布</h3><p>颜色越深，越常在这个时刻下单。</p></div><span>08—22</span></div><ReactECharts option={option} style={{ height: 350 }} /></>;
}

function ChannelChart() {
  const channels = unique(orders.map((order) => order.channel)).map((name) => ({ name, value: orders.filter((order) => order.channel === name).length }));
  const option = { tooltip: { trigger: "item" }, color: [ink, gold, "#c7c5c0", "#ecebe8"], series: [{ type: "pie", radius: ["55%", "76%"], center: ["45%", "52%"], data: channels, label: { formatter: "{b}\n{d}%", color: "#555" }, itemStyle: { borderColor: "#fff", borderWidth: 4 } }] };
  return <><h3>下单渠道</h3><p className="panel-note">按有效订单统计</p><ReactECharts option={option} style={{ height: 310 }} /></>;
}

function PriceBands() {
  const bands = [["0 元", 0, 0.01], ["0–15", 0.01, 15], ["15–20", 15, 20], ["20–30", 20, 30], ["30–50", 30, 50], ["50+", 50, Infinity]] as const;
  const data = bands.map(([name, min, max]) => ({ name, value: orders.filter((order) => order.amount >= min && order.amount < max).length }));
  const option = { grid: { left: 36, right: 20, top: 32, bottom: 42 }, xAxis: { type: "category", data: data.map((d) => d.name), axisLine: { lineStyle: { color: "#ddd" } }, axisTick: { show: false } }, yAxis: { type: "value", splitLine: { lineStyle: { color: "#eee" } } }, series: [{ type: "bar", data: data.map((d) => d.value), itemStyle: { color: ink, borderRadius: [5, 5, 0, 0] }, label: { show: true, position: "top" } }] };
  return <><h3>订单价格带</h3><p className="panel-note">一杯与一单之间的日常尺度</p><ReactECharts option={option} style={{ height: 310 }} /></>;
}

function StoreMap() {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}assets/china-provinces.geojson`)
      .then((response) => response.json())
      .then((geoJson) => {
        echarts.registerMap("heytea-china", geoJson);
        if (active) setMapReady(true);
      });
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

  return <><div className="panel-heading"><div><h3>门店足迹</h3><p>拖动与缩放地图，悬停查看具体门店。</p></div><span>{stores.length} 家</span></div><div className="store-map">{mapReady ? <ReactECharts option={mapOption} style={{ height: "100%" }} /> : <span>地图载入中</span>}</div></>;
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

function AtlasPage() {
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

  return <main className="subpage page-width">
    <PageMasthead eyebrow="THE COMPLETE COLLECTION" title="杯中万象" subtitle="喜茶历年产品图鉴" note={catalogResearchNote} />
    <div className="atlas-summary"><span><b>{products.filter((p) => p.cupCount > 0).length}</b> 已饮</span><span><b>{products.filter((p) => p.cupCount === 0).length}</b> 未饮</span><span><b>{products.length}</b> 图鉴条目</span></div>
    <div className="filters sticky-filters">
      <label className="search-field"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索产品、版本或系列" /></label>
      <select value={series} onChange={(event) => setSeries(event.target.value)} aria-label="筛选系列">{seriesOptions.map((item) => <option key={item}>{item}</option>)}</select>
      <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="筛选年份">{yearOptions.map((item) => <option value={item} key={item}>{item === "0" ? "年份待考" : item}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="筛选饮用状态"><option>全部状态</option><option>已饮</option><option>未饮</option></select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="排序"><option value="series">按系列</option><option value="year">按年份</option><option value="cups">按杯数</option></select>
    </div>
    <p className="result-count">显示 {filtered.length} / {products.length} 项</p>
    {sort === "series" ? <div className="catalog-groups">{unique(filtered.map((product) => product.series)).map((group) => <section key={group}><header><h2>{group}</h2><span>{filtered.filter((product) => product.series === group).length} 项</span></header><div className="product-grid">{filtered.filter((product) => product.series === group).map((product, index) => <ProductCard product={product} index={index} key={product.id} onSelect={() => setSelected(product)} />)}</div></section>)}</div> : <div className="product-grid">{filtered.map((product, index) => <ProductCard product={product} index={index} key={product.id} onSelect={() => setSelected(product)} />)}</div>}
    <AnimatePresence>{selected && <ProductDrawer product={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
  </main>;
}

function ProductCard({ product, index, onSelect }: { product: Product; index: number; onSelect: () => void }) {
  const tried = product.cupCount > 0;
  return <motion.button className={`product-card ${tried ? "tried" : "untried"}`} onClick={onSelect} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.4) }}>
    <div className="product-art" style={{ "--drink": product.color } as React.CSSProperties}>
      {product.image ? <img src={product.image} alt={product.name} /> : <CupSoda aria-hidden="true" />}
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
      <div className="drawer-hero" style={{ "--drink": product.color } as React.CSSProperties}>{product.image ? <img src={product.image} alt={product.name} /> : <CupSoda />}<span>{product.series}</span></div>
      <p className="kicker">{product.year || "年份待考"} · {product.version}{product.availability ? ` · ${product.availability}` : ""}</p><h2>{product.name}</h2>
      <div className="drawer-stats"><article><span>喝过</span><strong>{product.cupCount}</strong><small>杯</small></article><article><span>涉及</span><strong>{product.orderCount}</strong><small>单</small></article><article><span>到访</span><strong>{product.stores.length}</strong><small>店</small></article></div>
      <div className="detail-pairs"><div><span>首次购买</span><b>{product.firstPurchased ?? "尚未喝过"}</b></div><div><span>最近一次</span><b>{product.lastPurchased ?? "—"}</b></div><div><span>覆盖城市</span><b>{product.cities.join("、") || "—"}</b></div><div><span>图片状态</span><b>{product.imageStatus === "official" ? "官方资料" : "资料待补"}</b></div></div>
      {product.source && <a className="source-link" href={product.source} target="_blank" rel="noreferrer">查看图片原始来源 <ChevronRight /></a>}
      <h3 className="drawer-section-title">购买履历</h3>
      <div className="purchase-history">{matching.length ? matching.map((order) => <div key={order.id}><time>{order.date}</time><span>{order.store}</span><b>{currency(order.amount)}</b></div>) : <p>这杯尚未出现在订单里。</p>}</div>
    </motion.aside>
  </motion.div>;
}

function OrdersPage() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("全部月份");
  const [channel, setChannel] = useState("全部渠道");
  const [status, setStatus] = useState("全部状态");
  const months = ["全部月份", ...unique(orders.map((order) => order.date.slice(0, 7))).sort().reverse()];
  const channels = ["全部渠道", ...unique(orders.map((order) => order.channel))];
  const filtered = orders.filter((order) => {
    const text = `${order.store} ${order.city} ${order.channel} ${order.items.map((item) => item.rawName).join(" ")}`.toLowerCase();
    const statusMatch = status === "全部状态" || (status === "有实付" ? order.amount > 0 : order.amount === 0);
    return text.includes(query.toLowerCase()) && (month === "全部月份" || order.date.startsWith(month)) && (channel === "全部渠道" || order.channel === channel) && statusMatch;
  });
  return <main className="subpage page-width">
    <PageMasthead eyebrow="EVERY ORDER, A PLACE" title="一单一程" subtitle="全部订单明细" note="日期与门店被保留，用户 ID、订单号、取餐码和精确时刻已经移除。" />
    <div className="order-rollup"><span><b>{filtered.length}</b> 单</span><span><b>{currency(filtered.reduce((sum, order) => sum + order.amount, 0))}</b> 实付</span><span><b>{unique(filtered.map((order) => order.store)).length}</b> 家门店</span></div>
    <div className="filters">
      <label className="search-field"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索门店、商品、城市或渠道" /></label>
      <select value={month} onChange={(event) => setMonth(event.target.value)}>{months.map((value) => <option key={value}>{value}</option>)}</select>
      <select value={channel} onChange={(event) => setChannel(event.target.value)}>{channels.map((value) => <option key={value}>{value}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="筛选订单状态"><option>全部状态</option><option>有实付</option><option>0 元记录</option></select>
      <button className="export-button" onClick={() => exportCsv(filtered)}><Download /> 导出脱敏 CSV</button>
    </div>
    <div className="order-table-wrap"><table><thead><tr><th>日期</th><th>门店</th><th>城市</th><th>渠道</th><th>商品</th><th>实付</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td><time>{order.date}</time></td><td><strong>{order.store}</strong></td><td>{order.city}</td><td><span className="channel-tag">{order.channel}</span></td><td>{order.items.map((item) => <span className="order-item" key={item.rawName}>{item.rawName}<b>×{item.quantity}</b></span>)}</td><td>{currency(order.amount)}</td></tr>)}</tbody></table></div>
  </main>;
}

function exportCsv(rows: Order[]) {
  const header = ["日期", "门店", "城市", "渠道", "商品", "实付金额"];
  const csv = [header, ...rows.map((order) => [order.date, order.store, order.city, order.channel, order.items.map((item) => `${item.rawName}×${item.quantity}`).join("；"), order.amount.toFixed(2)])]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "heytea-king-orders.csv"; anchor.click(); URL.revokeObjectURL(url);
}

function PageMasthead({ eyebrow, title, subtitle, note }: { eyebrow: string; title: string; subtitle: string; note: string }) {
  return <header className="page-masthead"><p className="kicker">{eyebrow}</p><h1>{title}</h1><span>{subtitle}</span><div className="hairline" /><p>{note}</p></header>;
}

function SiteFooter() {
  return <footer><img src={`${import.meta.env.BASE_URL}assets/heytea-logo.png`} alt="" /><div><strong>Heytea King</strong><span>杯盏纪年 · 数据截至 {orders[0]?.date.replaceAll("-", ".")}</span></div><p>个人非商业数据档案。品牌与产品素材权利归原权利人所有。</p></footer>;
}

export default App;
