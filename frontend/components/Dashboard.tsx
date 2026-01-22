'use client';

import { useEffect, useState } from 'react';
import { fetchUsers, User } from '@/src/services/userService';
 import {
    fetchTotalVisitors,
    fetchActiveTrainings,
    fetchAvgDailyAccess,
     fetchDailyActive,
   fetchMonthlyActive,
   } from '@/src/services/metricService';
import { KpiCard } from '@/components/ui/KpiCard';
import LineChartOne from '@/components/ui/charts/line/LineChartOne';
import BarChartOne from '@/components/ui/charts/bar/BarChartOne';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeCount {
  date: string;   // para daily, formato 'YYYY-MM-DD'
  month?: string; // para monthly, formato 'YYYY-MM'
  count: number;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [activeTrainings, setActiveTrainings] = useState<number | null>(null);
  const [avgAccess, setAvgAccess] = useState<number | null>(null);

  const [dailyActive, setDailyActive] = useState<TimeCount[] | null>(null);
  const [monthlyActive, setMonthlyActive] = useState<TimeCount[] | null>(null);

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

    fetchDailyActive(30)
      .then(setDailyActive)
      .catch((e) => setError(e.message));

    fetchMonthlyActive(6)
      .then(setMonthlyActive)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">Erro: {error}</div>;
  }

  const loading =
    users === null ||
    visitors === null ||
    activeTrainings === null ||
    avgAccess === null ||
    dailyActive === null ||
    monthlyActive === null;

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-md" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          title="Total Visitors"
          value={visitors!}
          subtitle="Últimos 30 dias"
          changePercent={((visitors! - 100) / 100) * 100}
          trendData={[visitors! * 0.8, visitors! * 0.9, visitors!]}
        />
        <KpiCard
          title="Active Users"
          value={users!.length}
          subtitle="Cadastrados"
          changePercent={((users!.length - 50) / 50) * 100}
          trendData={[users!.length - 5, users!.length - 2, users!.length]}
        />
        <KpiCard
          title="Active Trainings"
          value={activeTrainings!}
          subtitle="Únicos"
        />
        <KpiCard
          title="Avg Daily Access"
          value={avgAccess!.toFixed(1)}
          subtitle="Média 30 dias"
        />
      </div>

      {/* Gráficos de Atividade */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usuários ativos por dia */}
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Usuários Ativos por Dia (30d)</h4>
          <LineChartOne
            title="Usuários por dia"
            data={dailyActive!.map((t) => t.count)}
            labels={dailyActive!.map((t) => t.date)}
          />
        </div>

        {/* Usuários ativos por mês */}
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Usuários Ativos por Mês (6m)</h4>
          <BarChartOne
            title="Usuários por mês"
            data={monthlyActive!.map((t) => t.count)}
            labels={monthlyActive!.map((t) => t.month!)}
          />
        </div>
      </div>
    </div>
  );
}
