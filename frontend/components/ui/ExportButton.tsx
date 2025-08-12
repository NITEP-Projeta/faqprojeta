// components/admin/ExportButton.tsx
'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { CSVLink } from 'react-csv';

export const ExportButton: FC<{ data: any[]; filename: string }> = ({ data, filename }) => (
  <CSVLink data={data} filename={filename}>
    <Button>Exportar CSV</Button>
  </CSVLink>
);
