export interface ChartDataset {
  label?: string;
  data: (number | null)[];
  backgroundColor?: string[] | string;
  borderColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}
