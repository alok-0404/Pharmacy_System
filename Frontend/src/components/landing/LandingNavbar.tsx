import { Link } from 'react-router-dom';
import { MessageCircle, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';

interface LandingNavbarProps {
  onLogin: () => void;
  onRegister: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function LandingNavbar({
  onLogin,
  onRegister,
  darkMode,
  onToggleDark,
}: LandingNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">BTBIZ</p>
            <p className="text-[10px] text-zinc-500">Pharmacy AI</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How It Works
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="#faq" className="transition hover:text-white">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label="Toggle theme">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogin} className="hidden sm:inline-flex">
            Login
          </Button>
          <Button size="sm" onClick={onRegister}>
            Register Pharmacy
          </Button>
        </div>
      </div>
    </header>
  );
}
