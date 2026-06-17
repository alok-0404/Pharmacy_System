import { Check } from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';

const plans = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    features: ['1 Pharmacy branch', 'WhatsApp AI bot', '500 messages/mo', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₹12,999',
    period: '/month',
    features: [
      'Up to 5 branches',
      'Advanced AI assistant',
      'Unlimited messages',
      'Analytics dashboard',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited branches',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise option',
    ],
    highlighted: false,
  },
];

interface PricingSectionProps {
  onContact: () => void;
}

export function PricingSection({ onContact }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-zinc-400">Choose the plan that fits your pharmacy.</p>
        </SectionReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <SectionReveal key={plan.name} delay={i * 0.1}>
              <GlassCard
                className={`relative h-full ${plan.highlighted ? 'border-violet-500/50 shadow-xl shadow-violet-500/20' : ''}`}
              >
                {plan.highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500">{plan.period}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check size={16} className="shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={onContact}
                >
                  Contact Sales
                </Button>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
