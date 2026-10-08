import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const Chart = lazy(() => import("./charts"));

/** Loads the ECharts chunk only once the chart is about to enter the viewport. */
export function LazyChart({ option, style }: { option: object; style?: CSSProperties }) {
  const holder = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = holder.current;
    if (!node || typeof IntersectionObserver === "undefined") { setNear(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setNear(true); observer.disconnect(); }
    }, { rootMargin: "300px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holder} style={style}>
      {near && <Suspense fallback={null}><Chart option={option} style={{ height: "100%", width: "100%" }} /></Suspense>}
    </div>
  );
}
