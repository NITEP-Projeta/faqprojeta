// components/admin/Heatmap.tsx
'use client';

import { FC } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface HeatmapProps {
  values: { date: string; count: number }[];
}

export const Heatmap: FC<HeatmapProps> = ({ values }) => (
  <CalendarHeatmap
    startDate={new Date(values[0].date)}
    endDate={new Date(values[values.length - 1].date)}
    values={values}
    classForValue={value =>
      !value || value.count === 0
        ? 'color-empty'
        : value.count < 5
        ? 'color-scale-1'
        : 'color-scale-2'
    }
  />
);
