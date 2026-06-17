import { Star } from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';
import { GlassCard } from '../ui/glass-card';

const testimonials = [
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Pharmacy Owner',
    text: 'BTBIZ transformed how we handle patient queries. Our staff finally focuses on dispensing, not answering the same questions all day.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Store Manager',
    text: 'WhatsApp integration was seamless. Patients love checking medicine availability instantly. Response times dropped by 60%.',
    rating: 5,
  },
  {
    name: 'Amit Verma',
    role: 'Healthcare Chain Director',
    text: 'We deployed across 12 branches. The analytics dashboard gives us visibility we never had before. Enterprise-grade product.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-y border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">What Our Clients Say</h2>
        </SectionReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <SectionReveal key={t.name} delay={i * 0.1}>
              <GlassCard className="h-full">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
