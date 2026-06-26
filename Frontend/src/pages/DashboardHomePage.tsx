import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MessageSquare,
  Package,
  Pill,
  RefreshCw,
  Server,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { getDashboardAnalytics } from '../api/dashboard';
import { ApiClientError } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RevenueSection } from '../components/dashboard/RevenueSection';
import {
  DrilldownDialog,
  type DrilldownType,
} from '../components/dashboard/DrilldownDialog';
import type { DashboardAnalytics, DashboardRange } from '../types/dashboard';

const DASHBOARD_POLL_MS = 30_000;

function formatRevenue(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day ago`;
}

export function DashboardHomePage() {
  const { pharmacy, pharmacyId } = usePharmacy();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [range, setRange] = useState<DashboardRange>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drilldown, setDrilldown] = useState<DrilldownType>(null);

  const loadDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!pharmacyId) return;

      if (!options?.silent) {
        setLoading(true);
        setError(null);
      }

      try {
        setData(await getDashboardAnalytics(pharmacyId, range));
      } catch (err) {
        if (!options?.silent) {
          setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [pharmacyId, range],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  usePolling(() => loadDashboard({ silent: true }), DASHBOARD_POLL_MS, Boolean(pharmacyId));

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const quickActions = [
    { label: 'Open Inbox', href: '/dashboard/inbox', icon: MessageSquare },
    { label: 'Manage Orders', href: '/dashboard/orders', icon: Package },
    { label: 'Add Medicine', href: '/dashboard/medicines', icon: Pill },
    { label: 'Store Settings', href: '/dashboard/settings', icon: Zap },
  ];

  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-6 backdrop-blur lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Pharmacy Analytics
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Welcome back{pharmacy ? `, ${pharmacy.name}` : ''}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Live operations overview · updated {formatRelativeTime(data.generatedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          <KpiCard
            label="Total Orders"
            value={String(data.kpis.totalOrders.total)}
            icon={Package}
            changePercent={data.kpis.totalOrders.changePercent}
            hint="Click for order history"
            onClick={() => setDrilldown('orders')}
          />
          <KpiCard
            label="Active Patients"
            value={String(data.kpis.activePatients.total)}
            icon={Users}
            changePercent={data.kpis.activePatients.changePercent}
            accent="sky"
            hint="Click for patient list"
            onClick={() => setDrilldown('patients')}
          />
          <KpiCard
            label="Pending Prescriptions"
            value={String(data.kpis.pendingPrescriptions.total)}
            icon={Pill}
            changePercent={data.kpis.pendingPrescriptions.changePercent}
            accent="amber"
            hint="Click to continue reviews"
            onClick={() => setDrilldown('prescriptions')}
          />
          <KpiCard
            label="Active Deliveries"
            value={String(data.kpis.activeDeliveries.total)}
            icon={Truck}
            changePercent={data.kpis.activeDeliveries.changePercent}
            accent="emerald"
            hint="Click for delivery queue"
            onClick={() => setDrilldown('deliveries')}
          />
          <KpiCard
            label="Revenue"
            value={formatRevenue(data.kpis.revenue.total)}
            icon={IndianRupee}
            changePercent={data.kpis.revenue.changePercent}
            accent="rose"
            hint={`AOV ${formatRevenue(data.kpis.averageOrderValue.value)}`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Today vs Yesterday', ...data.comparisons.todayVsYesterday.orders },
            { label: 'Week vs Last Week', ...data.comparisons.weekVsLastWeek.orders },
            { label: 'Month vs Last Month', ...data.comparisons.monthVsLastMonth.orders },
            { label: 'Year vs Last Year', ...data.comparisons.yearVsLastYear.orders },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.current}</p>
              <p
                className={`mt-1 text-xs ${
                  item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.changePercent >= 0 ? '+' : ''}
                {item.changePercent}% vs previous
              </p>
            </div>
          ))}
        </div>

        <RevenueSection data={data} range={range} onRangeChange={setRange} />

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Activity Timeline</h2>
              <Activity size={18} className="text-zinc-500" />
            </div>
            {data.activity.length === 0 ? (
              <p className="text-sm text-zinc-500">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {data.activity.map((item) => (
                  <li key={item.id} className="flex gap-3 border-l border-violet-500/30 pl-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200">{item.title}</p>
                      <p className="truncate text-xs text-zinc-500">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-600">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="font-semibold text-white">Quick Actions</h2>
            <div className="mt-4 grid gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5"
                >
                  <action.icon size={16} className="text-violet-400" />
                  {action.label}
                </Link>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-medium text-zinc-300">Today&apos;s Tasks</h3>
            <ul className="mt-3 space-y-2">
              {data.tasks.today.map((task) => (
                <li key={task.id}>
                  <Link
                    to={task.href}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
                  >
                    <span>{task.label}</span>
                    <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-300">
                      {task.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              <h2 className="font-semibold text-white">Critical Alerts</h2>
            </div>
            {data.alerts.critical.length === 0 ? (
              <p className="text-sm text-zinc-500">No critical alerts.</p>
            ) : (
              <ul className="space-y-2">
                {data.alerts.critical.map((alert) => (
                  <li
                    key={alert.id}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-rose-200">{alert.title}</p>
                    <p className="text-xs text-rose-100/70">{alert.detail}</p>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-5 text-sm font-medium text-zinc-300">Low Stock</h3>
            <ul className="mt-2 space-y-2">
              {data.alerts.lowStock.length === 0 ? (
                <li className="text-sm text-zinc-500">Inventory looks healthy.</li>
              ) : (
                data.alerts.lowStock.map((item) => (
                  <li
                    key={item.medicineId}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-200">{item.name}</span>
                    <span className="text-amber-300">
                      {item.stockQuantity} {item.unit}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-400" />
              <h2 className="font-semibold text-white">WhatsApp Analytics</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="text-zinc-500">Total messages</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {data.whatsapp.totalMessages}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="text-zinc-500">Open chats</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {data.whatsapp.openConversations}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="text-zinc-500">Avg response</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {data.whatsapp.averageResponseTimeMinutes ?? '—'}
                  {data.whatsapp.averageResponseTimeMinutes ? ' min' : ''}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="text-zinc-500">Handoffs</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {data.whatsapp.handoffActive}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Patient {data.whatsapp.patientMessages} · Bot {data.whatsapp.botMessages} · Staff{' '}
              {data.whatsapp.pharmacistMessages}
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Server size={18} className="text-sky-400" />
              <h2 className="font-semibold text-white">System Health</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2">
                <span className="text-zinc-400">API</span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 size={14} />
                  {data.system.apiHealth}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2">
                <span className="text-zinc-400">Database</span>
                <span className="text-zinc-200">{data.system.database}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2">
                <span className="text-zinc-400">WhatsApp</span>
                <span className={data.system.whatsappConnected ? 'text-emerald-300' : 'text-amber-300'}>
                  {data.system.whatsappConnected ? 'Connected' : 'Not connected'}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2">
                <span className="text-zinc-400">Queue</span>
                <span className="text-zinc-200">{data.system.queueStatus}</span>
              </li>
            </ul>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Bot size={16} className="text-violet-400" />
                AI Bot Analytics
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Automated replies: {data.bot.automatedReplies} · Handoff rate:{' '}
                {data.bot.handoffRate}% · Approval rate: {data.kpis.prescriptionApprovalRate.rate}%
              </p>
            </div>
          </section>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>

      <DrilldownDialog
        type={drilldown}
        data={data}
        pharmacyName={pharmacy?.name}
        onClose={() => setDrilldown(null)}
      />
    </div>
  );
}
