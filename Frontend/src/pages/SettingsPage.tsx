import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updatePaymentSettings } from '../api/pharmacy';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import { GlassCard } from '../components/ui/glass-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function SettingsPage() {
  const { pharmacy, pharmacyId, refreshPharmacy } = usePharmacy();
  const [paymentLinkUrl, setPaymentLinkUrl] = useState(pharmacy?.paymentLinkUrl ?? '');
  const [paymentQrImageUrl, setPaymentQrImageUrl] = useState(pharmacy?.paymentQrImageUrl ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pharmacy) {
      setPaymentLinkUrl(pharmacy.paymentLinkUrl ?? '');
      setPaymentQrImageUrl(pharmacy.paymentQrImageUrl ?? '');
    }
  }, [pharmacy]);

  if (!pharmacy || !pharmacyId) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500">
        Pharmacy details not loaded.
      </div>
    );
  }

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updatePaymentSettings(pharmacyId, {
        paymentLinkUrl: paymentLinkUrl.trim(),
        paymentQrImageUrl: paymentQrImageUrl.trim(),
      });
      await refreshPharmacy();
      toast.success('Payment settings saved');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500">Pharmacy profile and integration status.</p>
          </div>
          <button
            type="button"
            onClick={() => void refreshPharmacy()}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <GlassCard className="border-zinc-800 bg-zinc-900/50">
            <h2 className="font-semibold text-white">Pharmacy details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ['Name', pharmacy.name],
                ['Email', pharmacy.email],
                ['Mobile', pharmacy.mobile],
                ['Pharmacy ID', pharmacyId],
                ['WhatsApp Phone Number ID', pharmacy.whatsappPhoneNumberId],
                ['Business Account ID', pharmacy.businessAccountId],
                ['Greeting image', pharmacy.greetingImageUrl || 'Not set'],
                ['Status', pharmacy.isActive ? 'Active' : 'Inactive'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-2">
                  <dt className="text-zinc-500">{label}</dt>
                  <dd className="col-span-2 break-all font-medium text-zinc-200">{value}</dd>
                </div>
              ))}
            </dl>

            {pharmacy.greetingImageUrl ? (
              <img
                src={pharmacy.greetingImageUrl}
                alt={pharmacy.name}
                className="mt-4 max-h-48 rounded-xl border border-zinc-700 object-cover"
              />
            ) : null}
          </GlassCard>

          <GlassCard className="border-zinc-800 bg-zinc-900/50">
            <h2 className="font-semibold text-white">Payment settings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Default payment link and QR code sent to patients when order status is Payment
              Pending. If only link is set, QR is auto-generated.
            </p>

            <form onSubmit={handleSavePaymentSettings} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="payment-link">Payment link (UPI / Razorpay / Paytm)</Label>
                <Input
                  id="payment-link"
                  type="url"
                  placeholder="https://pay.example.com/..."
                  className="mt-1.5 border-zinc-700 bg-zinc-950"
                  value={paymentLinkUrl}
                  onChange={(e) => setPaymentLinkUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payment-qr">QR code image URL (optional)</Label>
                <Input
                  id="payment-qr"
                  placeholder="https://... or /uploads/..."
                  className="mt-1.5 border-zinc-700 bg-zinc-950"
                  value={paymentQrImageUrl}
                  onChange={(e) => setPaymentQrImageUrl(e.target.value)}
                />
              </div>
              {paymentQrImageUrl ? (
                <img
                  src={paymentQrImageUrl}
                  alt="Payment QR preview"
                  className="max-h-40 rounded-xl border border-zinc-700 object-contain"
                />
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                Save payment settings
              </Button>
            </form>
          </GlassCard>

          {pharmacy.whatsappIntegration?.connected ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <h2 className="font-semibold text-emerald-200">WhatsApp integration</h2>
              <p className="mt-2 text-sm text-emerald-100/80">
                WhatsApp is connected. Incoming patient messages and pharmacist replies are
                delivered through the Meta WhatsApp Business API.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <h2 className="font-semibold text-amber-200">WhatsApp integration</h2>
              <p className="mt-2 text-sm text-amber-100/80">
                {!pharmacy.whatsappIntegration?.serverTokenConfigured
                  ? 'Meta access token is not configured on the server yet. Add META_ACCESS_TOKEN and META_VERIFY_TOKEN in your backend environment (Replit Secrets / .env).'
                  : !pharmacy.whatsappIntegration?.pharmacyNumberConfigured
                    ? 'Your pharmacy WhatsApp Phone Number ID is still pending. Update it in pharmacy settings with the ID from Meta Business Manager.'
                    : 'WhatsApp integration is not fully connected yet. The dashboard works with database-only messaging until setup is complete.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
