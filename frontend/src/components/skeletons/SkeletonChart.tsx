/**
 * SkeletonChart - matches GroupAnalytics chart layout
 */
import React from 'react'

interface SkeletonChartProps {
  /** 'area' for line/area charts, 'bar' for bar charts */
  type?: 'area' | 'bar'
  height?: number
  showLegend?: boolean
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  type = 'area',
  height = 256,
  showLegend = false,
}) => {
  const barHeights = [40, 65, 50, 80, 55, 70]
  const areaPoints = [60, 40, 55, 30, 50, 35, 45]

  return (
    <div
      className="relative overflow-hidden"
      style={{ height }}
      aria-busy="true"
      aria-label="Loading chart"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-3 w-8 rounded" />
        ))}
      </div>

      {/* Chart area */}
      <div className="absolute left-10 right-0 top-0 bottom-8">
        {type === 'bar' ? (
          <div className="flex items-end justify-around h-full gap-2 px-2">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="skeleton rounded-t flex-1"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        ) : (
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="skeletonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 ${areaPoints[0]}% ${areaPoints
                .map((p, i) => `L ${(i / (areaPoints.length - 1)) * 100}% ${p}%`)
                .join(' ')} L 100% 100% L 0 100% Z`}
              fill="url(#skeletonGrad)"
            />
          </svg>
        )}
      </div>

      {/* X-axis labels */}
      <div className="absolute left-10 right-0 bottom-0 flex justify-around">
        {[...Array(type === 'bar' ? 4 : 6)].map((_, i) => (
          <div key={i} className="skeleton h-3 w-8 rounded" />
        ))}
      </div>

      {showLegend && (
        <div className="absolute bottom-0 left-10 right-0 flex justify-center gap-4 pt-1">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      )}
    </div>
  )
}
