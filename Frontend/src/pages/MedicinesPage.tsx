import { useEffect, useState } from 'react';
import { Loader2, Pill, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createMedicine, deleteMedicine, getMedicines } from '../api/medicines';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import { GlassCard } from '../components/ui/glass-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { Medicine } from '../types';

export function MedicinesPage() {
  const { pharmacyId } = usePharmacy();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    unit: 'strip',
    price: '',
    stockQuantity: '',
  });

  const loadMedicines = async () => {
    if (!pharmacyId) return;

    setLoading(true);

    try {
      setMedicines(await getMedicines(pharmacyId));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedicines();
  }, [pharmacyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyId || !form.name.trim()) return;

    setSaving(true);

    try {
      await createMedicine(pharmacyId, {
        name: form.name.trim(),
        unit: form.unit.trim() || 'strip',
        price: Number(form.price) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
      });
      setForm({ name: '', unit: 'strip', price: '', stockQuantity: '' });
      await loadMedicines();
      toast.success('Medicine added');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicineId: string) => {
    if (!pharmacyId) return;

    try {
      await deleteMedicine(pharmacyId, medicineId);
      await loadMedicines();
      toast.success('Medicine removed');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete medicine');
    }
  };

  if (!pharmacyId) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500">
        Pharmacy not loaded.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
            <Pill size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Medicines</h1>
            <p className="text-sm text-zinc-500">
              Stock catalog for WhatsApp medicine availability checks.
            </p>
          </div>
        </div>

        <GlassCard className="mt-6 border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold text-white">Add medicine</h2>
          <form onSubmit={handleAdd} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="med-name">Name</Label>
              <Input
                id="med-name"
                placeholder="Paracetamol 500mg"
                className="mt-1.5 border-zinc-700 bg-zinc-950"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="med-unit">Unit</Label>
              <Input
                id="med-unit"
                placeholder="strip"
                className="mt-1.5 border-zinc-700 bg-zinc-950"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="med-price">Price (₹)</Label>
              <Input
                id="med-price"
                type="number"
                min="0"
                step="0.01"
                className="mt-1.5 border-zinc-700 bg-zinc-950"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="med-stock">Stock quantity</Label>
              <Input
                id="med-stock"
                type="number"
                min="0"
                className="mt-1.5 border-zinc-700 bg-zinc-950"
                value={form.stockQuantity}
                onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Add medicine
              </Button>
            </div>
          </form>
        </GlassCard>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8 text-zinc-500">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : medicines.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No medicines yet. Add items patients can ask about on WhatsApp.
            </p>
          ) : (
            medicines.map((medicine) => (
              <div
                key={medicine._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{medicine.name}</p>
                  <p className="text-sm text-zinc-400">
                    ₹{medicine.price} / {medicine.unit} · Stock: {medicine.stockQuantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(medicine._id)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
