'use client';

import React from 'react';
import { TopContributor } from '@/hooks/useGroupAnalytics';

interface Props {
  data: TopContributor[];
}

export function TopContributorsTable({ data }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Top Contributors</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">Ranked by total amount contributed</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-slate-400">#</th>
              <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-slate-400">Member</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-slate-400">Contributed</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-slate-400">Groups</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-slate-400">On-time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member, i) => (
              <tr
                key={member.address}
                className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-3 text-gray-400 dark:text-slate-500 font-mono text-xs">{i + 1}</td>
                <td className="py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{member.displayName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">{member.address}</p>
                  </div>
                </td>
                <td className="py-3 text-right font-semibold text-gray-900 dark:text-slate-100">
                  ${member.totalContributed.toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-slate-400">{member.groupCount}</td>
                <td className="py-3 text-right">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      member.onTimeRate >= 95
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : member.onTimeRate >= 80
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {member.onTimeRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
