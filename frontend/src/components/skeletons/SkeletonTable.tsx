/**
 * SkeletonTable - matches GroupsList table layout
 */
import React from 'react'

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

const columnWidths = ['w-32', 'w-16', 'w-20', 'w-24', 'w-16', 'w-20']

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 6 }) => {
  const cols = columnWidths.slice(0, columns)

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-200/80 dark:border-slate-700 overflow-hidden"
      aria-busy="true"
      aria-label="Loading table data"
    >
      <table className="table-premium">
        <thead>
          <tr>
            {cols.map((_, i) => (
              <th key={i} className="px-5 py-3.5">
                <div className="skeleton h-3 w-16 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className="relative overflow-hidden"
              style={{ animationDelay: `${rowIdx * 80}ms` }}
            >
              {cols.map((width, colIdx) => (
                <td key={colIdx} className="px-5 py-4">
                  {colIdx === 4 ? (
                    <div className="skeleton h-6 w-16 rounded-full" />
                  ) : colIdx === 5 ? (
                    <div className="skeleton h-8 w-20 rounded-lg" />
                  ) : (
                    <div className={`skeleton h-4 ${width} rounded-md`} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
