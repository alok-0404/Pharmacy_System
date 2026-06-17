import {
  Bot,
  CheckCircle2,
  MessageSquare,
  Package,
  Pill,
  Truck,
  Upload,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface HeroSectionProps {
  onRegister: () => void;
  onDemo: () => void;
}

export function HeroSection({ onRegister, onDemo }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge className="mb-6">Flagship Product by BTBIZ</Badge>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Transform Your Pharmacy</span>
              <br />
              Communication with AI
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              The WhatsApp Communication Bridge Between Patients and Pharmacies. A WhatsApp-powered
              AI Assistant that connects patients and pharmacies, automates support, reduces staff
              workload, and improves customer experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" onClick={onDemo}>
                Book Demo
              </Button>
              <Button size="lg" variant="outline" onClick={onRegister}>
                Start Free Trial
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-zinc-500">Pharmacy Dashboard</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs text-emerald-400">
                    <MessageSquare size={14} /> WhatsApp Chats
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-zinc-800/80 px-3 py-2 text-xs text-zinc-300">
                      Hi, is Crocin available?
                    </div>
                    <div className="ml-4 rounded-lg bg-violet-600/30 px-3 py-2 text-xs text-violet-100">
                      Yes! 15 strips in stock. Need delivery?
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <Package size={14} /> Order #2847
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">Out for delivery</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <Upload size={14} /> Prescription
                    </div>
                    <p className="mt-1 text-sm text-zinc-300">Rx uploaded • Verified</p>
                  </div>
                </div>
              </div>
            </div>

            <FloatingCard
              icon={<Bot size={16} />}
              label="AI Assistant"
              className="animate-float -left-4 top-8 hidden sm:block"
            />
            <FloatingCard
              icon={<Truck size={16} />}
              label="Delivery tracking"
              className="animate-float-delayed -right-2 bottom-16 hidden sm:block"
            />
            <FloatingCard
              icon={<Pill size={16} />}
              label="Stock check"
              className="animate-float right-8 top-0 hidden lg:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-xl border border-white/10 bg-zinc-900/90 px-4 py-2.5 shadow-xl backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-white">
        <span className="text-violet-400">{icon}</span>
        {label}
        <CheckCircle2 size={12} className="text-emerald-400" />
      </div>
    </div>
  );
}
