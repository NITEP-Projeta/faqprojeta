'use client'

import { useEffect, useState, useMemo } from 'react'
import { fetchUsers, User } from '@/src/services/userService'
import {
  fetchDailyActive,
  fetchMonthlyActive,
  fetchAvgActiveTime,   // 🚀 NOVO serviço (tempo médio ativo)
  fetchRealtimeActive,  // 🚀 NOVO serviço (ativos em tempo real)
} from '@/src/services/metricService'
import { KpiCard } from '@/components/ui/KpiCard'
import LineChartOne from '@/components/ui/charts/line/LineChartOne'
import BarChartOne from '@/components/ui/charts/bar/BarChartOne'
import { Skeleton } from '@/components/ui/skeleton'

interface DailyMetric {
  date: string
  count: number
}

interface MonthlyMetric {
  month: string
  count: number
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [dailyActive, setDailyActive] = useState<DailyMetric[]>([])
  const [monthlyActive, setMonthlyActive] = useState<MonthlyMetric[]>([])
  const [avgActiveTime, setAvgActiveTime] = useState<number>(0) // em minutos
  const [realtimeActive, setRealtimeActive] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ------------------------ Fetch Inicial ------------------------ */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, dailyRes, monthlyRes, avgRes] = await Promise.all([
          fetchUsers(),
          fetchDailyActive(30),
          fetchMonthlyActive(6),
          fetchAvgActiveTime(), // retorna tempo médio em minutos
        ])
        setUsers(usersRes)
        setDailyActive(dailyRes)
        setMonthlyActive(monthlyRes)
        setAvgActiveTime(avgRes)
      } catch (e: any) {
        setError(e.message ?? 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  /* ------------------------ Realtime Updates ------------------------ */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentActive = await fetchRealtimeActive()
        setRealtimeActive(currentActive)
      } catch {
        // evita crash se falhar
      }
    }, 5000) // atualiza a cada 5s
    return () => clearInterval(interval)
  }, [])

  /* ------------------------ KPIs ------------------------ */
  const kpis = useMemo(() => {
    const totalUsers = users.length
    const totalDaily = dailyActive.reduce((acc, cur) => acc + cur.count, 0)
    const totalMonthly = monthlyActive.reduce((acc, cur) => acc + cur.count, 0)

    return {
      totalUsers,
      totalDaily,
      totalMonthly,
      avgActiveTime,
      realtimeActive,
      userChangePercent: ((totalUsers - 50) / 50) * 100,
    }
  }, [users, dailyActive, monthlyActive, avgActiveTime, realtimeActive])

  /* ------------------------ Loading ------------------------ */
  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
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

  if (error) {
    return <div className="p-4 text-red-600">⚠️ Erro: {error}</div>
  }

  /* ------------------------ Render ------------------------ */
  return (
    <div className="space-y-8 p-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <KpiCard
          title="Usuários Cadastrados"
          value={kpis.totalUsers}
          subtitle="Total no sistema"
          changePercent={kpis.userChangePercent}
          trendData={[
            kpis.totalUsers - 5,
            kpis.totalUsers - 2,
            kpis.totalUsers,
          ]}
        />
        <KpiCard
          title="Usuários Ativos"
          value={kpis.totalDaily}
          subtitle="Últimos 30 dias"
        />
        <KpiCard
          title="Usuários Ativos"
          value={kpis.totalMonthly}
          subtitle="Últimos 6 meses"
        />
        <KpiCard
          title="Tempo Médio Ativo"
          value={`${kpis.avgActiveTime} min`}
          subtitle="Sessão média"
        />
        <KpiCard
          title="Ativos em Tempo Real"
          value={kpis.realtimeActive}
          subtitle="Conectados agora"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="mb-2 text-gray-600 font-medium">
            Usuários Ativos por Dia (30d)
          </h4>
          <LineChartOne
            title="Usuários por dia"
            data={dailyActive.map((t) => t.count)}
            labels={dailyActive.map((t) => t.date)}
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="mb-2 text-gray-600 font-medium">
            Usuários Ativos por Mês (6m)
          </h4>
          <BarChartOne
            title="Usuários por mês"
            data={monthlyActive.map((t) => t.count)}
            labels={monthlyActive.map((t) => t.month)}
          />
        </div>
      </div>
    </div>
  )
}
