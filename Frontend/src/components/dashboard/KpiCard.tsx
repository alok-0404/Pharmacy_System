import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  changePercent?: number;
  hint?: string;
  onClick?: () => void;
  accent?: 'violet' | 'emerald' | 'amber' | 'sky' | 'rose';
}

const accentMap = {
  violet: 'from-violet-500/20 to-violet-500/5 text-violet-300',
  emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
  amber: 'from-amber-500/20 to-amber-500/5 text-amber-300',
  sky: 'from-sky-500/20 to-sky-500/5 text-sky-300',
  rose: 'from-rose-500/20 to-rose-500/5 text-rose-300',
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  changePercent,
  hint,
  onClick,
  accent = 'violet',
}: KpiCardProps) {
  const positive = (changePercent ?? 0) >= 0;
  const Tag = onClick ? 'button' : 'div';

  return (
    <motion.div whileHover={onClick ? { y: -2 } : undefined} transition={{ duration: 0.15 }}>
      <Tag
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br p-5 text-left shadow-lg shadow-black/20',
          accentMap[accent],
          onClick && 'cursor-pointer hover:border-zinc-700',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/20">
            <Icon size={20} />
          </div>
          {changePercent !== undefined ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                positive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
              )}
            >
              {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(changePercent)}%
            </span>
          ) : null}
        </div>
        <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-sm text-zinc-400">{label}</p>
        {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
      </Tag>
    </motion.div>
  );
}
