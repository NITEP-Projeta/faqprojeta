'use client';

import { useEffect, useState } from 'react';
import { fetchUsers, User } from '@/services/userService';
import {
  fetchTotalVisitors,
  fetchActiveTrainings,
  fetchAvgDailyAccess,
} from '@/services/metricsService';
import { KpiCard } from '@/components/ui/KpiCard';
import LineChartOne from '@/components/ui/charts/line/LineChartOne';
import BarChartOne from '@/components/ui/charts/bar/BarChartOne';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [activeTrainings, setActiveTrainings] = useState<number | null>(null);
  const [avgAccess, setAvgAccess] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e.message));

    fetchTotalVisitors()
      .then((d) => setVisitors(d.totalVisitors))
      .catch((e) => setError(e.message));

    fetchActiveTrainings()
      .then((d) => setActiveTrainings(d.activeTrainings))
      .catch((e) => setError(e.message));

    fetchAvgDailyAccess(30)
      .then((d) => setAvgAccess(d.averageDailyAccess))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="text-red-600 p-4">Erro: {error}</div>;
  }

  // enquanto carrega, mostre skeletons
  if (users === null || visitors === null || activeTrainings === null || avgAccess === null) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          title="Total Visitors"
          value={visitors}
          subtitle="Últimos 30 dias"
          changePercent={((visitors - 100) / 100) * 100}
          trendData={[visitors * 0.8, visitors * 0.9, visitors]}
        />
        <KpiCard
          title="Active Users"
          value={users.length}
          subtitle="Cadastrados"
          changePercent={((users.length - 50) / 50) * 100}
          trendData={[users.length - 5, users.length - 2, users.length]}
        />
        <KpiCard
          title="Active Trainings"
          value={activeTrainings}
          subtitle="Únicos"
        />
        <KpiCard
          title="Avg Daily Access"
          value={avgAccess.toFixed(1)}
          subtitle="Média 30 dias"
        />
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Atividade Mensal</h4>
          <LineChartOne
            title="Usuários ativos por mês"
            data={users.map((_, i) => Math.floor(Math.random() * 200))}
            labels={['Jan','Feb','Mar','Apr','May','Jun']}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Treinamentos por Categoria</h4>
          <BarChartOne
            title="Treinos concluídos"
            data={users.map(() => Math.floor(Math.random() * 100))}
            labels={users.map((u) => u.name)}
          />
        </div>
      </div>
    </div>
  );
}
