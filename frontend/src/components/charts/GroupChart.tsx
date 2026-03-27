import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'

interface GroupData {
  name: string
  value: number
  color?: string
}

interface GroupChartProps {
  data: GroupData[]
  title?: string
  height?: number
}

const CHART_COLORS = [
  'var(--chart-primary)',
  'var(--chart-secondary)',
  'var(--chart-tertiary)',
  'var(--chart-quaternary)',
]

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
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
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm">
          Value: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export const GroupChart: React.FC<GroupChartProps> = ({ data, title, height = 300 }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
