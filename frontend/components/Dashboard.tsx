'use client'

import { useEffect, useState } from 'react'
import { fetchUsers, User } from '@/src/services/userService'
import {
  fetchDailyActive,
  fetchMonthlyActive,
} from '@/src/services/metricService'
import { KpiCard } from '@/components/ui/KpiCard'
import LineChartOne from '@/components/ui/charts/line/LineChartOne'
import BarChartOne from '@/components/ui/charts/bar/BarChartOne'
import { Skeleton } from '@/components/ui/skeleton'

interface TimeCount {
  date: string // para daily, formato 'YYYY-MM-DD'
  month?: string // para monthly, formato 'YYYY-MM'
  count: number
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [dailyActive, setDailyActive] = useState<TimeCount[]>([])
  const [monthlyActive, setMonthlyActive] = useState<TimeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchDailyActive(30),
      fetchMonthlyActive(6),
    ])
      .then(([usersRes, dailyRes, monthlyRes]) => {
        setUsers(usersRes)
        setDailyActive(dailyRes)
        setMonthlyActive(monthlyRes)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return <div className="p-4 text-red-600">Erro: {error}</div>
  }

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
    )
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Active Users"
          value={users.length}
          subtitle="Cadastrados"
          changePercent={((users.length - 50) / 50) * 100}
          trendData={[users.length - 5, users.length - 2, users.length]}
        />
        <KpiCard
          title="Usuários Ativos (30d)"
          value={dailyActive.reduce((acc, cur) => acc + cur.count, 0)}
          subtitle="Últimos 30 dias"
        />
        <KpiCard
          title="Usuários Ativos (6m)"
          value={monthlyActive.reduce((acc, cur) => acc + cur.count, 0)}
          subtitle="Últimos 6 meses"
        />
      </div>

      {/* Gráficos de Atividade */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usuários ativos por dia */}
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Usuários Ativos por Dia (30d)</h4>
          <LineChartOne
            title="Usuários por dia"
            data={dailyActive.map((t) => t.count)}
            labels={dailyActive.map((t) => t.date)}
          />
        </div>

        {/* Usuários ativos por mês */}
        <div className="bg-white p-4 rounded shadow">
          <h4 className="mb-2 text-gray-600">Usuários Ativos por Mês (6m)</h4>
          <BarChartOne
            title="Usuários por mês"
            data={monthlyActive.map((t) => t.count)}
            labels={monthlyActive.map((t) => t.month ?? '')}
          />
        </div>
      </div>
    </div>
  )
}
