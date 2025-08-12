// components/admin/Alerts.tsx
'use client';

import { FC } from 'react';

export const Alerts: FC<{ messages: string[] }> = ({ messages }) => (
  <div className="space-y-2">
    {messages.map((msg,i) => (
      <div key={i} className="bg-yellow-100 border-l-4 border-yellow-500 p-2">
        ⚠️ {msg}
      </div>
    ))}
  </div>
);
