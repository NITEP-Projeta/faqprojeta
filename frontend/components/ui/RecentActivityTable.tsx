// components/admin/RecentActivityTable.tsx
'use client';

import { FC } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface Activity { id: number; user: string; action: string; date: string; }

export const RecentActivityTable: FC<{ data: Activity[] }> = ({ data }) => (
  <DataTable value={data} paginator rows={5}>
    <Column field="user" header="Usuário" />
    <Column field="action" header="Ação" />
    <Column field="date" header="Data" />
  </DataTable>
);
