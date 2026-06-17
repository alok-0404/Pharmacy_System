import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ end, suffix = '', decimals = 0 }: AnimatedCounterProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(end * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [inView, end]);

  const display =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
