'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { ContributionTrend } from '@/hooks/useGroupAnalytics';

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
          {entry.name}:{' '}
          <span className="font-bold">${Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

interface Props {
  data: ContributionTrend[];
}

export function ContributionTrendChart({ data }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
          Contribution Trends
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">Monthly contributions vs payouts</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPayouts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Area type="monotone" dataKey="contributions" stroke="var(--chart-primary)" fill="url(#gradContrib)" strokeWidth={2} name="Contributions" />
          <Area type="monotone" dataKey="payouts" stroke="var(--chart-secondary)" fill="url(#gradPayouts)" strokeWidth={2} name="Payouts" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
