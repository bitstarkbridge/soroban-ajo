import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts'

interface ContributionData {
  date: string
  amount: number
  cumulative?: number
}

interface ContributionChartProps {
  data: ContributionData[]
  title?: string
  height?: number
  showCumulative?: boolean
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--chart-tooltip-bg)',
          borderColor: 'var(--chart-tooltip-border)',
          color: 'var(--chart-tooltip-text)',
        }}
        className="rounded-lg border p-3 shadow-lg"
      >
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {entry.name}: <span className="font-bold">${entry.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const ContributionChart: React.FC<ContributionChartProps> = ({
  data,
  title,
  height = 300,
  showCumulative = false,
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
            </linearGradient>
            {showCumulative && (
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chart-grid-line)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--chart-primary)"
            fillOpacity={1}
            fill="url(#colorAmount)"
            name="Contribution"
          />
          {showCumulative && (
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--chart-secondary)"
              fillOpacity={1}
              fill="url(#colorCumulative)"
              name="Cumulative"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
