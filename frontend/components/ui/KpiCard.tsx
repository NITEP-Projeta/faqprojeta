// components/admin/KpiCard.tsx
'use client';

import { FC } from 'react';
import { Chart } from 'primereact/chart';

interface KpiCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  changePercent?: number;
  trendData?: number[]; // sparkline
}

export const KpiCard: FC<KpiCardProps> = ({
  title, subtitle, value, changePercent, trendData = []
}) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h5 className="text-sm text-gray-500">{title}</h5>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    <p className="text-3xl font-semibold my-2">{value}</p>
    {changePercent !== undefined && (
      <p className={changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
      </p>
    )}
    {trendData.length > 0 && (
      <Chart
        type="line"
        data={{ labels: trendData.map(() => ''), datasets:[{ data: trendData, fill:false, tension:0 }] }}
        options={{ plugins:{ legend:{ display:false } }, scales:{ x:{ display:false }, y:{ display:false } } }}
      />
    )}
  </div>
);
