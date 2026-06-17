import { MessageCircle } from 'lucide-react';

export function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/919810887227"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-110 hover:bg-emerald-400"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
