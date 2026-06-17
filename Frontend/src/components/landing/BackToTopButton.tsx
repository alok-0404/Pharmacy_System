import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-white backdrop-blur-xl transition hover:bg-zinc-800"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
