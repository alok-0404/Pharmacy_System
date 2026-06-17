import { useInView } from 'react-intersection-observer';
import { cn } from '../../lib/utils';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05, rootMargin: '40px' });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-100',
        className,
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
