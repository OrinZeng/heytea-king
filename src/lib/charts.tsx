import * as echarts from "echarts/core";
import { BarChart, EffectScatterChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import { GeoComponent, GridComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ReactEChartsCore from "echarts-for-react/lib/core";
import type { CSSProperties } from "react";

echarts.use([BarChart, LineChart, PieChart, HeatmapChart, EffectScatterChart, GridComponent, TooltipComponent, VisualMapComponent, GeoComponent, CanvasRenderer]);

export function registerMap(name: string, geoJson: Parameters<typeof echarts.registerMap>[1]) {
  echarts.registerMap(name, geoJson);
}

export default function Chart({ option, style }: { option: object; style?: CSSProperties }) {
  return <ReactEChartsCore echarts={echarts} option={option} style={style} />;
}
