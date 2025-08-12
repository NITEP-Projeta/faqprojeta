// components/admin/DistributionChart.tsx
'use client';

import { FC } from 'react';
import { Chart } from 'primereact/chart';

interface DistributionChartProps {
  data: number[];
  labels: string[];
}

export const DistributionChart: FC<DistributionChartProps> = ({ data, labels }) => (
  <Chart
    type="doughnut"
    data={{ labels, datasets:[{ data, backgroundColor:['#4F46E5','#10B981','#EF4444','#F59E0B'] }] }}
    options={{ plugins:{ legend:{ position:'bottom' } } }}
  />
);
