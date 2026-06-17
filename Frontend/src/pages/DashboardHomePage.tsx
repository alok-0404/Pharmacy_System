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
import { GlassCard } from '../components/ui/glass-card';
import { SectionReveal } from '../components/ui/section-reveal';

const statCards = [
  { key: 'orders', label: 'Total Orders', icon: Package, value: '128', trend: '+12%' },
  { key: 'patients', label: 'Active Patients', icon: Users, value: '0', trend: '+8%' },
  { key: 'prescriptions', label: 'Pending Prescriptions', icon: Pill, value: '14', trend: '-3%' },
  { key: 'deliveries', label: 'Deliveries', icon: Truck, value: '23', trend: '+5%' },
  { key: 'revenue', label: 'Revenue', icon: IndianRupee, value: '₹2.4L', trend: '+18%' },
];

const activities = [
  { text: 'New prescription uploaded by Rahul S.', time: '2 min ago' },
  { text: 'Order #2847 marked out for delivery', time: '15 min ago' },
  { text: 'AI bot responded to medicine query', time: '32 min ago' },
  { text: 'Refill reminder sent to 8 patients', time: '1 hr ago' },
];

export function DashboardHomePage() {
  const { pharmacy, pharmacyId } = usePharmacy();
  const [patientCount, setPatientCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);

  useEffect(() => {
    if (!pharmacyId) return;

    void Promise.all([getPatients(pharmacyId), getConversations(pharmacyId)]).then(
      ([patients, conversations]) => {
        setPatientCount(patients.length);
        setConversationCount(conversations.length);
      },
    );
  }, [pharmacyId]);

  const stats = statCards.map((s) =>
    s.key === 'patients' ? { ...s, value: String(patientCount) } : s,
  );

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
        {stats.map((stat, i) => (
          <SectionReveal key={stat.label} delay={i * 0.05}>
            <GlassCard className="border-zinc-800 bg-zinc-900/50">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                  <stat.icon size={20} />
                </div>
                <span className="text-xs font-medium text-emerald-400">{stat.trend}</span>
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
            <ul className="space-y-4">
              {activities.map((a) => (
                <li
                  key={a.text}
                  className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0"
                >
                  <p className="text-sm text-zinc-300">{a.text}</p>
                  <span className="shrink-0 text-xs text-zinc-600">{a.time}</span>
                </li>
              ))}
            </ul>
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
