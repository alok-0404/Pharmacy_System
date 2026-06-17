import { BarChart3, LayoutDashboard, MessageSquare, Truck } from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';
import { GlassCard } from '../ui/glass-card';

const products = [
  {
    icon: LayoutDashboard,
    title: 'Pharmacy Dashboard',
    desc: 'Manage orders and customers.',
    gradient: 'from-violet-600/20 to-indigo-600/20',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp AI Assistant',
    desc: 'Automated patient communication.',
    gradient: 'from-emerald-600/20 to-teal-600/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Business insights and reports.',
    gradient: 'from-blue-600/20 to-cyan-600/20',
  },
  {
    icon: Truck,
    title: 'Delivery Management',
    desc: 'Track deliveries in real-time.',
    gradient: 'from-amber-600/20 to-orange-600/20',
  },
];

export function ProductShowcaseSection() {
  return (
    <section className="border-y border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Product Showcase</h2>
        </SectionReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {products.map((p, i) => (
            <SectionReveal key={p.title} delay={i * 0.1}>
              <GlassCard glow className="overflow-hidden p-0">
                <div className={`bg-gradient-to-br ${p.gradient} p-6`}>
                  <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60">
                    <p.icon size={48} className="text-white/30" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{p.desc}</p>
                </div>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
