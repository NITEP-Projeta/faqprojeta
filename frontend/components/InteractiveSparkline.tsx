"use client"
import { useMemo } from "react"
import { LineChart } from "./ui/chart"

type Props = {
  values: number[]
}

export default function InteractiveSparkline({ values }: Props) {
  const data = useMemo(() => values.map((y, i) => ({ x: i + 1, y })), [values])
  return <LineChart data={data} />
}


