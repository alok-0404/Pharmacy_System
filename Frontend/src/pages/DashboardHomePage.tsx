import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  IndianRupee,
  MessageSquare,
  Package,
  Pill,
  Truck,
  Users,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { getConversations } from '../api/conversations';
import { getPatients } from '../api/patients';
import { getOrderActivity, getOrderStats, ORDER_STATUS_LABELS } from '../api/orders';
import { GlassCard } from '../components/ui/glass-card';
import { SectionReveal } from '../components/ui/section-reveal';
import type { OrderActivity } from '../types';

function formatRevenue(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${amount}`;
}

function formatActivityText(item: OrderActivity): string {
  const label = ORDER_STATUS_LABELS[item.status] ?? item.status;
  return `${item.patientName ?? 'Patient'} — ${label}`;
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
  const [patientCount, setPatientCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPrescriptions: 0,
    activeDeliveries: 0,
    revenue: 0,
  });
  const [activities, setActivities] = useState<OrderActivity[]>([]);

  useEffect(() => {
    if (!pharmacyId) return;

    void Promise.all([
      getPatients(pharmacyId),
      getConversations(pharmacyId),
      getOrderStats(pharmacyId),
      getOrderActivity(pharmacyId),
    ]).then(([patients, conversations, orderStats, activity]) => {
      setPatientCount(patients.length);
      setConversationCount(conversations.length);
      setStats(orderStats);
      setActivities(activity);
    });
  }, [pharmacyId]);

  const statCards = [
    { label: 'Total Orders', icon: Package, value: String(stats.totalOrders) },
    { label: 'Active Patients', icon: Users, value: String(patientCount) },
    { label: 'Pending Prescriptions', icon: Pill, value: String(stats.pendingPrescriptions) },
    { label: 'Active Deliveries', icon: Truck, value: String(stats.activeDeliveries) },
    { label: 'Revenue', icon: IndianRupee, value: formatRevenue(stats.revenue) },
  ];

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back{pharmacy ? `, ${pharmacy.name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Here&apos;s what&apos;s happening at your pharmacy today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat, i) => (
          <SectionReveal key={stat.label} delay={i * 0.05}>
            <GlassCard className="border-zinc-800 bg-zinc-900/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                <stat.icon size={20} />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </GlassCard>
          </SectionReveal>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionReveal>
          <GlassCard className="border-zinc-800 bg-zinc-900/50">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Activities</h2>
              <Activity size={18} className="text-zinc-500" />
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-zinc-500">No order activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {activities.map((a) => (
                  <li
                    key={a.orderId}
                    className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0"
                  >
                    <p className="text-sm text-zinc-300">{formatActivityText(a)}</p>
                    <span className="shrink-0 text-xs text-zinc-600">
                      {formatRelativeTime(a.updatedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <GlassCard className="border-zinc-800 bg-zinc-900/50">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">WhatsApp Conversations</h2>
              <Link
                to="/dashboard/inbox"
                className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <MessageSquare size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{conversationCount}</p>
                <p className="text-sm text-zinc-500">Active conversations</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Manage patient chats, send replies, and monitor bot interactions from the inbox.
            </p>
          </GlassCard>
        </SectionReveal>
      </div>
    </div>
  );
}
