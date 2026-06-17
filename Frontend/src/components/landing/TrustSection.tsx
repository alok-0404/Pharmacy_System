import { Award, Bot, Shield, Sparkles } from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';
import { GlassCard } from '../ui/glass-card';
import { AnimatedCounter } from '../ui/animated-counter';

const credentials = [
  { icon: Award, label: 'Meta Tech Partner' },
  { icon: Shield, label: 'ISO 9001 Certified' },
  { icon: Shield, label: 'ISO 27001 Certified' },
  { icon: Bot, label: 'AI Powered' },
  { icon: Sparkles, label: 'Enterprise Grade Security' },
];

const stats = [
  { value: 500, suffix: '+', label: 'Businesses' },
  { value: 99.99, suffix: '%', label: 'Uptime', decimals: 2 },
  { value: 24, suffix: '/7', label: 'Support' },
  { value: 15, suffix: '+', label: 'Countries' },
];

export function TrustSection() {
  return (
    <section className="border-y border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {credentials.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300"
              >
                <Icon size={14} className="text-violet-400" />
                {label}
              </div>
            ))}
          </div>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <SectionReveal key={stat.label} delay={i * 0.1}>
              <GlassCard className="text-center">
                <p className="text-3xl font-bold text-white">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                </p>
                <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
