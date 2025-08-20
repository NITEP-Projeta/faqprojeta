import { useEffect, useState } from 'react'
import {
    fetchDailyActive,
    fetchMonthlyActive,
} from '@/src/services/metricService'

export function useMetrics() {
    const [daily, setDaily] = useState<any[]>([])
    const [monthly, setMonthly] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetchDailyActive(30), fetchMonthlyActive(6)])
            .then(([dailyRes, monthlyRes]) => {
                setDaily(dailyRes)
                setMonthly(monthlyRes)
            })
            .finally(() => setLoading(false))
    }, [])

    return { daily, monthly, loading }
}
