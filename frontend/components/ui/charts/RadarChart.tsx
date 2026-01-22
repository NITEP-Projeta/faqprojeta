// components/admin/RadarChart.tsx
'use client';

import { FC } from 'react';
import { Chart } from 'primereact/chart';

export const RadarChart: FC<DistributionChartProps> = ({ data, labels }) => (
  <Chart
    type="radar"
    data={{ labels, datasets:[{ data, fill:true, backgroundColor:'rgba(79,70,229,0.2)', borderColor:'#4F46E5' }] }}
    options={{ scales:{ r:{ beginAtZero:true } } }}
  />
);
