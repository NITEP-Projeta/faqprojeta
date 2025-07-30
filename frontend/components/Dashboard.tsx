'use client';

import { useEffect, useState } from 'react';
import { fetchUsers, User } from '@/services/userService';
import { fetchTotalVisitors } from '@/services/metricsService';
import { KpiCard } from '@/components/ui/KpiCard';
import LineChartOne from '@/components/ui/charts/line/LineChartOne';
import BarChartOne from '@/components/ui/charts/bar/BarChartOne';

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [visitors, setVisitors] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message));

    fetchTotalVisitors()
      .then((data) => setVisitors(data.totalVisitors))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">Erro: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total Visitors"
          subtitle="Últimos 30 dias"
          value={visitors}
          changePercent={visitors >= 100 ? ((visitors - 100) * 100) / 100 : undefined}
          trendData={[80, 90, visitors]}
        />
        <KpiCard
          title="Active Users"
          subtitle="Desde a última semana"
          value={users.length}
          changePercent={users.length >= 50 ? ((users.length - 50) * 100) / 50 : undefined}
          trendData={[40, 55, users.length]}
        />
        <KpiCard
          title="Trainings Completed"
          subtitle="No mês atual"
          value={124}
          changePercent={+12.1}
          trendData={[110, 130, 124]}
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Atividade Mensal</h4>
          <LineChartOne
            title="Visualizações e Interações"
            data={[180, 190, 170, 160, 175, 165]}
            labels={['Jan','Feb','Mar','Apr','May','Jun']}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Treinamentos por Categoria</h4>
          <BarChartOne
            title="Distribuição Geral"
            data={[150,380,200,280,170,190]}
            labels={['Jan','Feb','Mar','Apr','May','Jun']}
          />
        </div>
      </div>
    </div>
  );
}
