import { SectionReveal } from '../ui/section-reveal';

const steps = [
  'Patient sends WhatsApp message',
  'AI Assistant responds instantly',
  'Prescription uploaded',
  'Pharmacy receives request',
  'Order prepared',
  'Delivery updates sent automatically',
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y border-white/5 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
        </SectionReveal>

        <div className="relative mt-14">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-violet-500 via-indigo-500 to-emerald-500 sm:left-1/2" />
          {steps.map((step, i) => (
            <SectionReveal key={step} delay={i * 0.1}>
              <div className="relative mb-8 flex items-center gap-6 sm:justify-center">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-500/50 bg-zinc-900 text-sm font-bold text-violet-300 shadow-lg shadow-violet-500/20">
                  {i + 1}
                </div>
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm sm:max-w-md">
                  <p className="font-medium text-white">{step}</p>
                </div>
              </div>
              {i < steps.length - 1 ? (
                <div className="mb-4 flex justify-center text-zinc-600">↓</div>
              ) : null}
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
