import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardAnalytics, DashboardRange } from '../../types/dashboard';
import { SkeletonRevenueSection } from '../ui/skeleton';

const PIE_COLORS = ['#8b5cf6', '#22c55e', '#f59e0b', '#38bdf8'];

interface RevenueSectionProps {
  data: DashboardAnalytics;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

export function RevenueSection({ data, range, onRangeChange, loading }: RevenueSectionProps) {
  const { revenue, comparisons } = data;

  if (loading) {
    return <SkeletonRevenueSection />;
  }

  const periodCards = [
    { label: 'Today', value: revenue.daily, compare: comparisons.todayVsYesterday.revenue },
    { label: 'This Week', value: revenue.weekly, compare: comparisons.weekVsLastWeek.revenue },
    { label: 'This Month', value: revenue.monthly, compare: comparisons.monthVsLastMonth.revenue },
    { label: 'This Year', value: revenue.yearly, compare: comparisons.yearVsLastYear.revenue },
  ];

  const statusChartData = data.orders.statusBreakdown.map((item) => ({
    name: item.status.replace(/_/g, ' '),
    count: item.count,
  }));

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Revenue Analytics</h2>
          <p className="text-sm text-zinc-500">
            Growth {revenue.growthPercent}% · Loss {revenue.lossPercent}% · AOV{' '}
            {formatCurrency(revenue.averageOrderValue)}
          </p>
        </div>
        <div className="flex rounded-xl border border-zinc-800 p-1">
          {(['7d', '30d', '90d', 'year'] as DashboardRange[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRangeChange(item)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                range === item
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {item === 'year' ? '1Y' : item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {periodCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(card.value)}</p>
            <p
              className={`mt-1 text-xs ${
                card.compare.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              vs prev {card.compare.changePercent}%
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-300">Revenue trend</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue.trend}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #3f3f46' }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fill="url(#revenueFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-300">Orders trend</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue.trend}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #3f3f46' }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-300">Payment method breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenue.paymentBreakdown}
                  dataKey="amount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {revenue.paymentBreakdown.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #3f3f46' }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-300">Orders by status</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #3f3f46' }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
