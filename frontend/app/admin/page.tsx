// app/admin/page.tsx
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import InteractiveSparkline from '@/components/InteractiveSparkline'
import { BarChart, DonutChart } from '@/components/ui/chart'

export default function AdminDashboard() {
  const [dateRange] = useState('Últimos 30 dias')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Métricas
  const [visitors, setVisitors] = useState<number | null>(null)
  const [avgDailyAccess, setAvgDailyAccess] = useState<number | null>(null)
  const [dailySeries, setDailySeries] = useState<Array<{ date: string; count: number }>>([])
  const [weeklySeries, setWeeklySeries] = useState<Array<{ label: string; count: number }>>([])
  const [roleSegments, setRoleSegments] = useState<Array<{ name: string; value: number }>>([])

  const sparklineValues = useMemo(() => dailySeries.map(d => d.count), [dailySeries])

  // Base da API (Render)
  const apiBase =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://faqprojeta-backend.onrender.com' // fallback padrão

  useEffect(() => {
    let cancelado = false

    const url = (path: string) => `${apiBase}${path}`

    const carregarMetricas = async () => {
      setLoading(true)
      try {
        const endpoints = [
          fetch(url('/metrics/visitors')),
          fetch(url('/metrics/avg-daily-access?days=30')),
          fetch(url('/metrics/daily-access?days=30')),
          fetch(url('/metrics/weekly-access?weeks=8')),
          fetch(url('/metrics/users-by-role')),
        ]

        const [vRes, mRes, dRes, wRes, rRes] = await Promise.all(endpoints)
        const [vJson, mJson, dJson, wJson, rJson] = await Promise.all([
          vRes.json().catch(() => null),
          mRes.json().catch(() => null),
          dRes.json().catch(() => null),
          wRes.json().catch(() => null),
          rRes.json().catch(() => null),
        ])

        if (cancelado) return

        if (!vRes.ok || !mRes.ok || !dRes.ok || !wRes.ok || !rRes.ok) {
          throw new Error('Falha ao carregar métricas do backend.')
        }

        setVisitors(vJson?.totalVisitors ?? null)
        setAvgDailyAccess(mJson?.averageDailyAccess ?? null)
        setDailySeries(Array.isArray(dJson?.days) ? dJson.days : [])
        setWeeklySeries(Array.isArray(wJson?.weeks) ? wJson.weeks : [])
        setRoleSegments(Array.isArray(rJson?.segments) ? rJson.segments : [])
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar métricas:', err)
        if (!cancelado) {
          setVisitors(null)
          setAvgDailyAccess(null)
          setDailySeries([])
          setWeeklySeries([])
          setRoleSegments([])
          setError('Erro de rede ou falha ao consultar o backend.')
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    carregarMetricas()
    return () => {
      cancelado = true
    }
  }, [apiBase])

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button variant="outline">{dateRange}</Button>
      </div>

      {error && (
        <div className="text-sm p-3 rounded-md border bg-yellow-50 text-yellow-900">
          {error} (API: {apiBase})
        </div>
      )}

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Usuários que acessaram</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? '—' : visitors ?? '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Média diária de acessos</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? '—' : avgDailyAccess != null ? avgDailyAccess.toFixed(1) : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Atividade Mensal</CardTitle>
              <CardDescription>Sparkline (média diária)</CardDescription>
            </div>
            <LineChartIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground relative">
              {!loading && sparklineValues.length > 0 ? (
                <InteractiveSparkline values={sparklineValues} />
              ) : (
                <span>{loading ? 'Carregando…' : 'Sem dados'}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Acessos por Semana</CardTitle>
              <CardDescription>Últimas 8 semanas</CardDescription>
            </div>
            <BarChartIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {!loading && weeklySeries.length > 0 ? (
                <BarChart
                  data={weeklySeries.map(w => ({ x: w.label, y: w.count }))}
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {loading ? 'Carregando…' : 'Sem dados'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Distribuição de Usuários</CardTitle>
              <CardDescription>Por perfil de acesso (exemplo)</CardDescription>
            </div>
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {!loading && roleSegments.length > 0 ? (
                <DonutChart data={roleSegments} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {loading ? 'Carregando…' : 'Sem dados'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
