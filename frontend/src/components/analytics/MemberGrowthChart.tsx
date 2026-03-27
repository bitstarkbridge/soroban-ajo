'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { MemberStat } from '@/hooks/useGroupAnalytics';

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
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

interface Props {
  data: MemberStat[];
}

export function MemberGrowthChart({ data }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
          Member Statistics
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">Growth and activity over time</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line)" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Line type="monotone" dataKey="totalMembers" stroke="var(--chart-primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Total Members" />
          <Line type="monotone" dataKey="activeMembers" stroke="var(--chart-secondary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Active Members" />
          <Line type="monotone" dataKey="newMembers" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} activeDot={{ r: 5 }} name="New Members" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
