import { useEffect, useState } from 'react';
import { Loader2, MessageSquarePlus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createConversation } from '../api/conversations';
import { createPatient, getPatients } from '../api/patients';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import type { Patient } from '../types';

export function PatientsPage() {
  const navigate = useNavigate();
  const { pharmacyId } = usePharmacy();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', mobile: '', email: '' });

  const loadPatients = async () => {
    if (!pharmacyId) return;

    setLoading(true);
    setError(null);

    try {
      setPatients(await getPatients(pharmacyId));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, [pharmacyId]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyId) return;

    setSubmitting(true);
    setError(null);

    try {
      await createPatient(pharmacyId, {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim() || undefined,
      });
      setForm({ name: '', mobile: '', email: '' });
      await loadPatients();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to add patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async (patientId: string) => {
    if (!pharmacyId) return;

    setSubmitting(true);
    setError(null);

    try {
      await createConversation(pharmacyId, patientId);
      navigate('/dashboard/inbox');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to start conversation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-white">Patients</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add patients and start conversations while WhatsApp is not connected.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleAddPatient}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="mb-4 flex items-center gap-2 text-brand-700">
              <UserPlus size={20} />
              <h2 className="font-semibold">Add patient</h2>
            </div>

            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Patient name"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
              <input
                value={form.mobile}
                onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
                placeholder="Mobile (e.g. 919876543210)"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email (optional)"
                type="email"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
              Add patient
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Patient list</h2>

            {loading ? (
              <div className="flex justify-center py-8 text-slate-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : patients.length === 0 ? (
              <p className="text-sm text-slate-500">No patients yet.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.mobile}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleStartChat(patient._id)}
                      disabled={submitting}
                      className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                    >
                      <MessageSquarePlus size={14} />
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
      </div>
    </div>
  );
}
