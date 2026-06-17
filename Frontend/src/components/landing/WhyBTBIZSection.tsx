import { Bot, Code, MessageSquare, Server, Settings, Workflow } from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';
import { GlassCard } from '../ui/glass-card';

const cards = [
  { icon: Workflow, title: 'AI Automation' },
  { icon: MessageSquare, title: 'WhatsApp Business API' },
  { icon: Bot, title: 'AI Chatbots' },
  { icon: Code, title: 'Custom Software' },
  { icon: Settings, title: 'CRM Integrations' },
  { icon: Server, title: 'Enterprise Applications' },
];

export function WhyBTBIZSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Powered by BTBIZ
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            BTBIZ develops enterprise-grade AI products, communication platforms, WhatsApp
            solutions, automation systems, custom software applications, and contact center
            technologies.
          </p>
        </SectionReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <SectionReveal key={c.title} delay={i * 0.08}>
              <GlassCard className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                  <c.icon size={22} />
                </div>
                <p className="font-semibold text-white">{c.title}</p>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
