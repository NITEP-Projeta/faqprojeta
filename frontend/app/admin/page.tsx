// app/admin/page.tsx
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import Dashboard from '@/components/Dashboard';

export default function AdminPage() {
  return (
    <AdminLayout title="Painel Administrativo">
      <Dashboard />
    </AdminLayout>
  );
}
