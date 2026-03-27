# Chart Components

Themed data visualization components using Recharts with consistent styling from the Tailwind configuration.

## Components

### ContributionChart

Area chart for displaying contribution amounts over time.

```tsx
import { ContributionChart } from './components/charts'

const data = [
  { date: 'Jan', amount: 4000, cumulative: 4000 },
  { date: 'Feb', amount: 3000, cumulative: 7000 },
  { date: 'Mar', amount: 5000, cumulative: 12000 },
]

<ContributionChart 
  data={data}
  title="Monthly Contributions"
  height={300}
  showCumulative={true}
/>
```

Props:
- `data`: Array of `{ date: string, amount: number, cumulative?: number }`
- `title?`: Optional chart title
- `height?`: Chart height in pixels (default: 300)
- `showCumulative?`: Show cumulative line (default: false)

### MemberGrowthChart

Line or bar chart for tracking member growth metrics.

```tsx
import { MemberGrowthChart } from './components/charts'

const data = [
  { period: 'Week 1', newMembers: 5, totalMembers: 15, activeMembers: 12 },
  { period: 'Week 2', newMembers: 3, totalMembers: 18, activeMembers: 15 },
  { period: 'Week 3', newMembers: 7, totalMembers: 25, activeMembers: 20 },
]

<MemberGrowthChart 
  data={data}
  title="Member Growth"
  height={300}
  chartType="line"
  showActive={true}
/>
```

Props:
- `data`: Array of `{ period: string, newMembers: number, totalMembers: number, activeMembers?: number }`
- `title?`: Optional chart title
- `height?`: Chart height in pixels (default: 300)
- `chartType?`: 'line' or 'bar' (default: 'line')
- `showActive?`: Show active members metric (default: false)

### GroupChart

Pie chart for displaying group distribution data.

```tsx
import { GroupChart } from './components/charts'

const data = [
  { name: 'Active Groups', value: 12 },
  { name: 'Pending Groups', value: 5 },
  { name: 'Completed Groups', value: 8 },
]

<GroupChart 
  data={data}
  title="Group Status Distribution"
  height={300}
/>
```

Props:
- `data`: Array of `{ name: string, value: number, color?: string }`
- `title?`: Optional chart title
- `height?`: Chart height in pixels (default: 300)

## Theming

All charts use CSS variables defined in `src/styles/index.css`:

- `--chart-primary`: Primary color (Indigo #6366f1)
- `--chart-secondary`: Secondary color (Violet #8b5cf6)
- `--chart-tertiary`: Tertiary color (Pink #ec4899)
- `--chart-quaternary`: Quaternary color (Teal #14b8a6)
- `--chart-tooltip-bg`: Tooltip background
- `--chart-tooltip-border`: Tooltip border
- `--chart-tooltip-text`: Tooltip text color
- `--chart-grid-line`: Grid line color

These variables automatically adapt to dark mode via CSS media queries.

## Features

- Responsive design with ResponsiveContainer
- Custom tooltips with themed styling
- Consistent color palette from Tailwind config
- Dark mode support
- Accessible chart labels and legends
- Smooth animations and transitions
