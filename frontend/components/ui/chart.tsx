"use client"
import * as React from "react"
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart as RBarChart,
  Bar,
  PieChart as RPieChart,
  Pie,
  Cell,
} from "recharts"

export type LineChartProps = {
  data: Array<{ x: string | number; y: number }>
  stroke?: string
  height?: number
  grid?: boolean
}

export function LineChart({ data, stroke = "#1F4E5F", height = 160, grid = true }: LineChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          {grid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="x" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
          <RTooltip formatter={(v: any) => [Number(v).toFixed(2), "Média diária"]} />
          <Line type="monotone" dataKey="y" stroke={stroke} strokeWidth={2} dot={false} />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export type BarChartProps = {
  data: Array<{ x: string | number; y: number }>
  color?: string
  height?: number
  grid?: boolean
}

export function BarChart({ data, color = "#AF1B1B", height = 200, grid = true }: BarChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          {grid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="x" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
          <RTooltip formatter={(v: any) => [Number(v).toFixed(0), "Acessos"]} />
          <Bar dataKey="y" fill={color} radius={[4, 4, 0, 0]} />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export type DonutChartSlice = { name: string; value: number; color?: string }
export type DonutChartProps = {
  data: DonutChartSlice[]
  height?: number
  innerRadius?: number
  outerRadius?: number
}

export function DonutChart({ data, height = 220, innerRadius = 60, outerRadius = 80 }: DonutChartProps) {
  const defaultColors = ["#1F4E5F", "#AF1B1B", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"]
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <RTooltip formatter={(v: any) => [Number(v).toFixed(0), "Quantidade"]} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
        </RPieChart>
      </ResponsiveContainer>
    </div>
  )
}


