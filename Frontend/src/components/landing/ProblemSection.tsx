import {
  AlertTriangle,
  Clock,
  HelpCircle,
  Phone,
  RefreshCw,
  Truck,
  Users,
} from 'lucide-react';
import { SectionReveal } from '../ui/section-reveal';

const problems = [
  { icon: Phone, text: 'Patients repeatedly call for medicine availability' },
  { icon: Users, text: 'Prescription management is manual' },
  { icon: HelpCircle, text: 'Staff spends time answering repetitive questions' },
  { icon: RefreshCw, text: 'Order tracking creates confusion' },
  { icon: Clock, text: 'Refill reminders are forgotten' },
  { icon: AlertTriangle, text: "Customers don't know store timings" },
  { icon: Truck, text: 'Delivery updates require manual follow-up' },
];

export function ProblemSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Challenges Modern Pharmacies Face
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Legacy workflows drain time and create friction for patients and staff alike.
          </p>
        </SectionReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((item, i) => (
            <SectionReveal key={item.text} delay={i * 0.05}>
              <div className="group rounded-2xl border border-red-500/20 bg-red-500/5 p-5 transition hover:border-red-500/40 hover:bg-red-500/10">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <item.icon size={20} />
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
