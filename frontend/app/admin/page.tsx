// app/admin/page.tsx
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { BarChart, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AdminDashboard() {
  const [dateRange] = useState("Últimos 30 dias")

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-muted p-4 border-r hidden md:block">
        <h2 className="text-xl font-bold mb-6">Administração</h2>
        <nav className="flex flex-col gap-3">
          <a href="#" className="text-sm hover:text-primary">Dashboard</a>
          <a href="#" className="text-sm hover:text-primary">Gerenciar Usuários</a>
          <a href="#" className="text-sm hover:text-primary">Treinamentos</a>
          <a href="#" className="text-sm hover:text-primary">Métricas</a>
          <a href="#" className="text-sm hover:text-primary">Configurações</a>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Button variant="outline">Selecionar período</Button>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos</CardTitle>
              <CardDescription>Desde a última semana</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">342</p>
              <p className="text-green-500 mt-1">+8.4%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treinamentos Concluídos</CardTitle>
              <CardDescription>No mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">124</p>
              <p className="text-green-500 mt-1">+12.1%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acessos à Plataforma</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1.238</p>
              <p className="text-red-500 mt-1">-3.2%</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos simulados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Atividade Mensal</CardTitle>
                <CardDescription>Visualizações e Interações</CardDescription>
              </div>
              <LineChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                [Gráfico de Linhas aqui]
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Treinamentos por Categoria</CardTitle>
                <CardDescription>Distribuição geral</CardDescription>
              </div>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                [Gráfico de Barras aqui]
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
