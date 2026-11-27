export interface PerformanceChartItem {
  day: string;
  date: string;
  value: number;
}

export interface DashboardPerformanceData {
  score: number;
  change: number;
  period: "7d" | "30d";
  chartData: PerformanceChartItem[];
}
