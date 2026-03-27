import type { Meta, StoryObj } from '@storybook/react'
import { ContributionChart } from './ContributionChart'
import { MemberGrowthChart } from './MemberGrowthChart'
import { GroupChart } from './GroupChart'

// ContributionChart Stories
const contributionMeta: Meta<typeof ContributionChart> = {
  title: 'Charts/ContributionChart',
  component: ContributionChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default contributionMeta
type ContributionStory = StoryObj<typeof ContributionChart>

const contributionData = [
  { date: 'Jan', amount: 4000, cumulative: 4000 },
  { date: 'Feb', amount: 3000, cumulative: 7000 },
  { date: 'Mar', amount: 5000, cumulative: 12000 },
  { date: 'Apr', amount: 4500, cumulative: 16500 },
  { date: 'May', amount: 6000, cumulative: 22500 },
  { date: 'Jun', amount: 5500, cumulative: 28000 },
]

export const Default: ContributionStory = {
  args: {
    data: contributionData,
    title: 'Monthly Contributions',
    height: 300,
  },
}

export const WithCumulative: ContributionStory = {
  args: {
    data: contributionData,
    title: 'Contributions with Cumulative Total',
    height: 300,
    showCumulative: true,
  },
}

export const Compact: ContributionStory = {
  args: {
    data: contributionData,
    height: 200,
  },
}

// MemberGrowthChart Stories
const memberGrowthMeta: Meta<typeof MemberGrowthChart> = {
  title: 'Charts/MemberGrowthChart',
  component: MemberGrowthChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

type MemberGrowthStory = StoryObj<typeof MemberGrowthChart>

const memberData = [
  { period: 'Week 1', newMembers: 5, totalMembers: 15, activeMembers: 12 },
  { period: 'Week 2', newMembers: 3, totalMembers: 18, activeMembers: 15 },
  { period: 'Week 3', newMembers: 7, totalMembers: 25, activeMembers: 20 },
  { period: 'Week 4', newMembers: 4, totalMembers: 29, activeMembers: 24 },
  { period: 'Week 5', newMembers: 6, totalMembers: 35, activeMembers: 28 },
]

export const LineChart: MemberGrowthStory = {
  args: {
    data: memberData,
    title: 'Member Growth (Line)',
    height: 300,
    chartType: 'line',
  },
}

export const BarChart: MemberGrowthStory = {
  args: {
    data: memberData,
    title: 'Member Growth (Bar)',
    height: 300,
    chartType: 'bar',
  },
}

export const WithActiveMembers: MemberGrowthStory = {
  args: {
    data: memberData,
    title: 'Complete Member Metrics',
    height: 300,
    chartType: 'line',
    showActive: true,
  },
}

// GroupChart Stories
const groupMeta: Meta<typeof GroupChart> = {
  title: 'Charts/GroupChart',
  component: GroupChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

type GroupStory = StoryObj<typeof GroupChart>

const groupData = [
  { name: 'Active Groups', value: 12 },
  { name: 'Pending Groups', value: 5 },
  { name: 'Completed Groups', value: 8 },
  { name: 'Inactive Groups', value: 3 },
]

export const PieChart: GroupStory = {
  args: {
    data: groupData,
    title: 'Group Status Distribution',
    height: 300,
  },
}

export const SimpleDistribution: GroupStory = {
  args: {
    data: [
      { name: 'Active', value: 65 },
      { name: 'Inactive', value: 35 },
    ],
    title: 'Active vs Inactive',
    height: 250,
  },
}
