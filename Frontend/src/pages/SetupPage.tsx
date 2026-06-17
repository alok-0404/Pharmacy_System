import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  KeyRound,
  Loader2,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { createPharmacy } from '../api/pharmacy';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';

type SetupMode = 'connect' | 'create';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100';

export function SetupPage() {
  const navigate = useNavigate();
  const { setPharmacyId, loading } = usePharmacy();
  const [mode, setMode] = useState<SetupMode>('create');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingId, setExistingId] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    whatsappPhoneNumberId: '',
    businessAccountId: '',
    greetingImageUrl: '',
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await setPharmacyId(existingId.trim());
      navigate('/inbox');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to connect pharmacy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const suffix = Date.now().toString(36);
      const pharmacy = await createPharmacy({
        ...form,
        whatsappPhoneNumberId: form.whatsappPhoneNumberId || `pending-wa-${suffix}`,
        businessAccountId: form.businessAccountId || `pending-biz-${suffix}`,
        greetingImageUrl: form.greetingImageUrl || undefined,
      });
      await setPharmacyId(pharmacy._id);
      navigate('/inbox');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to create pharmacy');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left — brand panel */}
      <aside className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <MessageCircle size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight">BTbiz Pharmacy</span>
          </div>

          <h1 className="max-w-sm text-3xl font-bold leading-tight tracking-tight">
            Patient messages, one place.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
            Register your pharmacy and manage WhatsApp conversations — secure,
            separate dashboard for every store.
          </p>
        </div>

        <ul className="relative space-y-4">
          {[
            { icon: Users, text: 'Patients & conversations in one inbox' },
            { icon: Sparkles, text: 'Smart bot greeting with your pharmacy name' },
            { icon: Shield, text: 'Isolated data per pharmacy — multi-tenant' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* Right — form panel */}
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile-only header */}
          <div className="mb-6 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <MessageCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">BTbiz Pharmacy</h2>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {mode === 'create' ? 'Register your pharmacy' : 'Welcome back'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {mode === 'create'
                ? 'A few details and your dashboard is ready.'
                : 'Connect with your saved Pharmacy ID.'}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
                mode === 'create'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 size={15} />
              New pharmacy
            </button>
            <button
              type="button"
              onClick={() => setMode('connect')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
                mode === 'connect'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <KeyRound size={15} />
              Existing ID
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {mode === 'connect' ? (
            <form onSubmit={handleConnect} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pharmacy ID
                </label>
                <input
                  value={existingId}
                  onChange={(e) => setExistingId(e.target.value)}
                  placeholder="e.g. 674a1b2c3d4e5f678901234"
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {(submitting || loading) && <Loader2 className="animate-spin" size={16} />}
                Open dashboard
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pharmacy name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Sharma Medical"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="contact@pharmacy.com"
                    type="email"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mobile
                  </label>
                  <input
                    value={form.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    placeholder="9876543210"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-200 px-3.5 py-2.5 text-sm text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
              >
                <span>WhatsApp & greeting (optional)</span>
                <ChevronDown
                  size={16}
                  className={`transition ${showAdvanced ? 'rotate-180' : ''}`}
                />
              </button>

              {showAdvanced ? (
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <input
                    value={form.whatsappPhoneNumberId}
                    onChange={(e) => updateField('whatsappPhoneNumberId', e.target.value)}
                    placeholder="WhatsApp Phone Number ID"
                    className={inputClass}
                  />
                  <input
                    value={form.businessAccountId}
                    onChange={(e) => updateField('businessAccountId', e.target.value)}
                    placeholder="Meta Business Account ID"
                    className={inputClass}
                  />
                  <input
                    value={form.greetingImageUrl}
                    onChange={(e) => updateField('greetingImageUrl', e.target.value)}
                    placeholder="Greeting image path (optional)"
                    className={inputClass}
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                Register & open dashboard
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">
            WhatsApp can be connected later — you can still use the dashboard now.
          </p>
        </div>
      </main>
    </div>
  );
}
