import React from 'react'
import { ContributionChart } from './ContributionChart'
import { MemberGrowthChart } from './MemberGrowthChart'
import { GroupChart } from './GroupChart'

/**
 * Example component demonstrating usage of all chart components
 * This can be used as a reference or integrated into the dashboard
 */
export const ChartExamples: React.FC = () => {
  // Sample data for ContributionChart
  const contributionData = [
    { date: 'Jan', amount: 4000, cumulative: 4000 },
    { date: 'Feb', amount: 3000, cumulative: 7000 },
    { date: 'Mar', amount: 5000, cumulative: 12000 },
    { date: 'Apr', amount: 4500, cumulative: 16500 },
    { date: 'May', amount: 6000, cumulative: 22500 },
    { date: 'Jun', amount: 5500, cumulative: 28000 },
  ]

  // Sample data for MemberGrowthChart
  const memberGrowthData = [
    { period: 'Week 1', newMembers: 5, totalMembers: 15, activeMembers: 12 },
    { period: 'Week 2', newMembers: 3, totalMembers: 18, activeMembers: 15 },
    { period: 'Week 3', newMembers: 7, totalMembers: 25, activeMembers: 20 },
    { period: 'Week 4', newMembers: 4, totalMembers: 29, activeMembers: 24 },
    { period: 'Week 5', newMembers: 6, totalMembers: 35, activeMembers: 28 },
  ]

  // Sample data for GroupChart
  const groupDistributionData = [
    { name: 'Active Groups', value: 12 },
    { name: 'Pending Groups', value: 5 },
    { name: 'Completed Groups', value: 8 },
    { name: 'Inactive Groups', value: 3 },
  ]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Chart Components Demo</h1>
        <p className="text-gray-600">
          Themed data visualization components using Recharts
        </p>
      </div>

      {/* Contribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <ContributionChart
            data={contributionData}
            title="Monthly Contributions"
            height={300}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ContributionChart
            data={contributionData}
            title="Contributions with Cumulative"
            height={300}
            showCumulative={true}
          />
        </div>
      </div>

      {/* Member Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <MemberGrowthChart
            data={memberGrowthData}
            title="Member Growth (Line Chart)"
            height={300}
            chartType="line"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <MemberGrowthChart
            data={memberGrowthData}
            title="Member Growth (Bar Chart)"
            height={300}
            chartType="bar"
            showActive={true}
          />
        </div>
      </div>

      {/* Group Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <GroupChart
            data={groupDistributionData}
            title="Group Status Distribution"
            height={300}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chart Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Responsive design with ResponsiveContainer</li>
              <li>✓ Custom tooltips with themed styling</li>
              <li>✓ Consistent colors from Tailwind config</li>
              <li>✓ Dark mode support via CSS variables</li>
              <li>✓ Accessible labels and legends</li>
              <li>✓ Smooth animations and transitions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
