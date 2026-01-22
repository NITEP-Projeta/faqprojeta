// components/admin/GoalCard.tsx
'use client';

import { FC } from 'react';

interface GoalCardProps { title: string; current: number; target: number; }

export const GoalCard: FC<GoalCardProps> = ({ title, current, target }) => {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div className="bg-white p-4 rounded shadow">
      <h5 className="text-sm text-gray-500">{title}</h5>
      <p className="text-2xl font-semibold">{current}/{target}</p>
      <div className="w-full bg-gray-200 h-2 rounded">
        <div className="bg-blue-600 h-2 rounded" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
    </div>
  );
};
