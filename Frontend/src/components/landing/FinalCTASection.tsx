import { SectionReveal } from '../ui/section-reveal';
import { Button } from '../ui/button';

interface FinalCTASectionProps {
  onRegister: () => void;
  onDemo: () => void;
}

export function FinalCTASection({ onRegister, onDemo }: FinalCTASectionProps) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-zinc-900 p-12 text-center sm:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.3),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Digitize Your Pharmacy?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-zinc-300">
                Let BTBIZ automate patient communication while your team focuses on care.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={onDemo}>
                  Schedule Demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open('https://wa.me/919810887227', '_blank')}
                >
                  Talk on WhatsApp
                </Button>
                <Button size="lg" variant="secondary" onClick={onRegister}>
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
