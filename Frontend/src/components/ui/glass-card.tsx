import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function GlassCard({ className, glow, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.07]',
        glow && 'shadow-lg shadow-violet-500/10',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
