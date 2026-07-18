'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function RevenueChart({
  data,
}: {
  data: Array<{ date: string; revenueInPence: number }>
}) {
  const chartData = data.map((point) => ({
    date: point.date.slice(5),
    revenue: point.revenueInPence / 100,
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee7de" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Revenue']} />
          <Line dataKey="revenue" stroke="#7f5700" strokeWidth={2} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
