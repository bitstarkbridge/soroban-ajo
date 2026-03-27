'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Users, Layers, DollarSign, CheckCircle } from 'lucide-react';
import { AnalyticsSummary } from '@/hooks/useGroupAnalytics';

interface Props {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  positive,
  gradient,
  isLoading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  positive?: boolean;
  gradient: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 animate-pulse">
        <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-slate-700 mb-3" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-7 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      {/* icon */}
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} mb-3`}>
        <span className="text-white w-4 h-4 flex items-center justify-center">{icon}</span>
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 leading-none">{value}</p>
      {sub && (
        <p className={`mt-1.5 text-xs font-semibold flex items-center gap-1 ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

export function AnalyticsSummaryCards({ summary, isLoading }: Props) {
  const cards = [
    {
      label: 'Total Savings',
      value: `$${summary.totalSavings.toLocaleString()}`,
      sub: `+${summary.savingsChangePercent}% this month`,
      positive: true,
      icon: <DollarSign className="w-4 h-4" />,
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      label: 'Total Contributions',
      value: `$${summary.totalContributions.toLocaleString()}`,
      sub: `+${summary.contributionsChangePercent}% vs last month`,
      positive: true,
      icon: <TrendingUp className="w-4 h-4" />,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Active Groups',
      value: String(summary.activeGroups),
      icon: <Layers className="w-4 h-4" />,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Total Members',
      value: String(summary.totalMembers),
      icon: <Users className="w-4 h-4" />,
      gradient: 'from-violet-500 to-fuchsia-600',
    },
    {
      label: 'Total Payouts',
      value: `$${summary.totalPayouts.toLocaleString()}`,
      icon: <DollarSign className="w-4 h-4" />,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Avg Completion Rate',
      value: `${summary.avgCompletionRate.toFixed(0)}%`,
      icon: <CheckCircle className="w-4 h-4" />,
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(({ label, value, sub, icon, positive, gradient }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          sub={sub}
          icon={icon}
          positive={positive}
          gradient={gradient}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
