import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Pill,
  Settings,
  Users,
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/inbox', label: 'Inbox', icon: Inbox },
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/dashboard/medicines', label: 'Medicines', icon: Pill },
  { to: '/dashboard/patients', label: 'Patients', icon: Users },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const { pharmacy, clearPharmacy } = usePharmacy();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearPharmacy();
    navigate('/');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-950">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">BTBIZ Pharmacy</p>
              <p className="text-[10px] text-zinc-500">AI Assistant</p>
            </div>
          </div>
          {pharmacy ? (
            <p className="mt-3 truncate text-sm font-medium text-zinc-300">{pharmacy.name}</p>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="m-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
