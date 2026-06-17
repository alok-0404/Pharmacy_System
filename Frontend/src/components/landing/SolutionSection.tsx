import {
  Bell,
  Bot,
  Clock,
  HelpCircle,
  MapPin,
  Package,
  Pill,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';
import { GlassCard } from '../ui/glass-card';

const features = [
  {
    icon: Pill,
    title: 'Medicine Availability',
    desc: 'Patient checks medicine stock instantly through WhatsApp.',
  },
  {
    icon: Upload,
    title: 'Prescription Receive',
    desc: 'Patients upload prescriptions directly on WhatsApp.',
  },
  {
    icon: Package,
    title: 'Order Status Tracking',
    desc: 'Real-time order updates.',
  },
  {
    icon: Bell,
    title: 'Refill Reminders',
    desc: 'Automated refill notifications.',
  },
  {
    icon: Clock,
    title: 'Store Timing & Location',
    desc: 'Instant store information.',
  },
  {
    icon: RefreshCw,
    title: 'Delivery Updates',
    desc: 'Automatic delivery tracking.',
  },
  {
    icon: Bot,
    title: 'Repeat Previous Orders',
    desc: 'One-click reorder functionality.',
  },
  {
    icon: HelpCircle,
    title: 'Basic Medicine Queries',
    desc: 'AI-powered responses.',
  },
  {
    icon: MapPin,
    title: 'FAQ Support',
    desc: '24/7 automated support.',
  },
];

export function SolutionSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One WhatsApp Bot Solves Everything
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            BTBIZ Pharmacy AI Assistant automates the entire patient communication lifecycle.
          </p>
        </SectionReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <SectionReveal key={f.title} delay={i * 0.05}>
              <GlassCard glow className="group h-full hover:scale-[1.02]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 text-violet-300">
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-white">✅ {f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
