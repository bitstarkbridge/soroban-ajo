import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'

interface MemberGrowthData {
  period: string
  newMembers: number
  totalMembers: number
  activeMembers?: number
}

interface MemberGrowthChartProps {
  data: MemberGrowthData[]
  title?: string
  height?: number
  chartType?: 'line' | 'bar'
  showActive?: boolean
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
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const MemberGrowthChart: React.FC<MemberGrowthChartProps> = ({
  data,
  title,
  height = 300,
  chartType = 'line',
  showActive = false,
}) => {
  const renderLineChart = () => (
    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line)" vertical={false} />
      <XAxis
        dataKey="period"
        tick={{ fill: '#64748b', fontSize: 12 }}
        axisLine={false}
        tickLine={false}
        dy={10}
      />
      <YAxis
        tick={{ fill: '#64748b', fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
      <Line
        type="monotone"
        dataKey="newMembers"
        stroke="var(--chart-primary)"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
        name="New Members"
      />
      <Line
        type="monotone"
        dataKey="totalMembers"
        stroke="var(--chart-secondary)"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
        name="Total Members"
      />
      {showActive && (
        <Line
          type="monotone"
          dataKey="activeMembers"
          stroke="var(--chart-tertiary)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Active Members"
        />
      )}
    </LineChart>
  )

  const renderBarChart = () => (
    <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line)" vertical={false} />
      <XAxis
        dataKey="period"
        tick={{ fill: '#64748b', fontSize: 12 }}
        axisLine={false}
        tickLine={false}
        dy={10}
      />
      <YAxis
        tick={{ fill: '#64748b', fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
      <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
      <Bar
        dataKey="newMembers"
        fill="var(--chart-primary)"
        radius={[4, 4, 0, 0]}
        name="New Members"
      />
      <Bar
        dataKey="totalMembers"
        fill="var(--chart-secondary)"
        radius={[4, 4, 0, 0]}
        name="Total Members"
      />
      {showActive && (
        <Bar
          dataKey="activeMembers"
          fill="var(--chart-tertiary)"
          radius={[4, 4, 0, 0]}
          name="Active Members"
        />
      )}
    </BarChart>
  )

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'line' ? renderLineChart() : renderBarChart()}
      </ResponsiveContainer>
    </div>
  )
}
