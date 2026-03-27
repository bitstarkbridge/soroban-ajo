'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { GroupPerformance } from '@/hooks/useGroupAnalytics';

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border p-3 shadow-lg text-sm"
      style={{
        backgroundColor: 'var(--chart-tooltip-bg)',
        borderColor: 'var(--chart-tooltip-border)',
        color: 'var(--chart-tooltip-text)',
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name}>
          {entry.name}: <span className="font-bold">${Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// Fallback demo data when no real groups are passed
const DEMO_DATA: GroupPerformance[] = [
  { id: '1', name: 'Alpha Savers', totalContributed: 4200, totalPayouts: 1400, memberCount: 8, completionRate: 85, isActive: true },
  { id: '2', name: 'Beta Circle', totalContributed: 3100, totalPayouts: 800, memberCount: 6, completionRate: 72, isActive: true },
  { id: '3', name: 'Gamma Fund', totalContributed: 2600, totalPayouts: 2600, memberCount: 5, completionRate: 100, isActive: false },
  { id: '4', name: 'Delta Pool', totalContributed: 1900, totalPayouts: 400, memberCount: 4, completionRate: 60, isActive: true },
];

interface Props {
  data: GroupPerformance[];
}

export function GroupPerformanceChart({ data }: Props) {
  const chartData = (data.length > 0 ? data : DEMO_DATA).map((g) => ({
    name: g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name,
    Contributed: g.totalContributed,
    Payouts: g.totalPayouts,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
          Group Performance
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">Contributions vs payouts per group</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-grid-line)', opacity: 0.4 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="Contributed" fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Payouts" fill="var(--chart-secondary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
