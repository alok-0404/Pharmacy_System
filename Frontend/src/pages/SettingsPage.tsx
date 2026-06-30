import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { updatePaymentSettings, updateStoreSettings, uploadPharmacyAsset } from '../api/pharmacy';
import { createFaq, deleteFaq, getFaqs } from '../api/faq';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import { GlassCard } from '../components/ui/glass-card';
import { SkeletonFaqList } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import type { Faq } from '../types';

export function SettingsPage() {
  const { pharmacy, pharmacyId, refreshPharmacy } = usePharmacy();
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('');
  const [paymentQrImageUrl, setPaymentQrImageUrl] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeHours, setStoreHours] = useState('');
  const [storeMapUrl, setStoreMapUrl] = useState('');
  const [storeLatitude, setStoreLatitude] = useState('');
  const [storeLongitude, setStoreLongitude] = useState('');
  const [greetingImageUrl, setGreetingImageUrl] = useState('');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', keywords: '' });
  const [saving, setSaving] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  const handleUploadGreetingImage = async (file: File) => {
    if (!pharmacyId) return;

    try {
      const updated = await uploadPharmacyAsset(pharmacyId, 'greeting_image', file);
      setGreetingImageUrl(updated.greetingImageUrl ?? '');
      await refreshPharmacy();
      toast.success('Welcome image uploaded');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to upload image');
      throw err;
    }
  };

  const handleUploadPaymentQr = async (file: File) => {
    if (!pharmacyId) return;

    try {
      const updated = await uploadPharmacyAsset(pharmacyId, 'payment_qr', file);
      setPaymentQrImageUrl(updated.paymentQrImageUrl ?? '');
      await refreshPharmacy();
      toast.success('QR image uploaded');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to upload QR image');
      throw err;
    }
  };

  useEffect(() => {
    if (pharmacy) {
      setPaymentLinkUrl(pharmacy.paymentLinkUrl ?? '');
      setPaymentQrImageUrl(pharmacy.paymentQrImageUrl ?? '');
      setStoreAddress(pharmacy.storeAddress ?? '');
      setStoreHours(pharmacy.storeHours ?? '');
      setStoreMapUrl(pharmacy.storeMapUrl ?? '');
      setStoreLatitude(
        pharmacy.storeLatitude != null ? String(pharmacy.storeLatitude) : '',
      );
      setStoreLongitude(
        pharmacy.storeLongitude != null ? String(pharmacy.storeLongitude) : '',
      );
      setGreetingImageUrl(pharmacy.greetingImageUrl ?? '/uploads/greeting/ayudha-welcome.png');
    }
  }, [pharmacy]);

  const loadFaqs = async () => {
    if (!pharmacyId) return;

    setLoadingFaqs(true);

    try {
      setFaqs(await getFaqs(pharmacyId));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to load FAQs');
    } finally {
      setLoadingFaqs(false);
    }
  };

  useEffect(() => {
    void loadFaqs();
  }, [pharmacyId]);

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

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const latText = storeLatitude.trim();
    const lngText = storeLongitude.trim();

    if (latText && Number.isNaN(Number(latText))) {
      toast.error('Latitude must be a valid number');
      setSaving(false);
      return;
    }

    if (lngText && Number.isNaN(Number(lngText))) {
      toast.error('Longitude must be a valid number');
      setSaving(false);
      return;
    }

    if ((latText && !lngText) || (!latText && lngText)) {
      toast.error('Enter both latitude and longitude for the map pin');
      setSaving(false);
      return;
    }

    try {
      await updateStoreSettings(pharmacyId, {
        storeAddress: storeAddress.trim(),
        storeHours: storeHours.trim(),
        storeMapUrl: storeMapUrl.trim(),
        storeLatitude: latText ? Number(latText) : null,
        storeLongitude: lngText ? Number(lngText) : null,
        greetingImageUrl: greetingImageUrl.trim(),
      });
      await refreshPharmacy();
      toast.success('Store settings saved');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to save store settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;

    setSaving(true);

    try {
      await createFaq(pharmacyId, {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        keywords: faqForm.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      });
      setFaqForm({ question: '', answer: '', keywords: '' });
      await loadFaqs();
      toast.success('FAQ added');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to add FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    try {
      await deleteFaq(pharmacyId, faqId);
      await loadFaqs();
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete FAQ');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500">Pharmacy profile, bot replies, and integrations.</p>
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
            <h2 className="font-semibold text-white">Store location & hours</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Shown when patients tap Store Location. If you add a Google Maps link or latitude/longitude,
              patients get an exact map link. With only an address, the bot auto-generates a Google Maps
              search link.
            </p>

            <form onSubmit={handleSaveStoreSettings} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="store-address">Store address</Label>
                <Input
                  id="store-address"
                  placeholder="123 Main Road, City"
                  className="mt-1.5 border-zinc-700 bg-zinc-950"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="store-hours">Store hours</Label>
                <Input
                  id="store-hours"
                  placeholder="Mon-Sat: 9 AM - 9 PM, Sun: 10 AM - 6 PM"
                  className="mt-1.5 border-zinc-700 bg-zinc-950"
                  value={storeHours}
                  onChange={(e) => setStoreHours(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="store-map">Google Maps link (optional)</Label>
                <Input
                  id="store-map"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  className="mt-1.5 border-zinc-700 bg-zinc-950"
                  value={storeMapUrl}
                  onChange={(e) => setStoreMapUrl(e.target.value)}
                />
                <p className="mt-1 text-xs text-zinc-600">
                  Open your store on Google Maps → right-click the pin → copy coordinates for the
                  fields below.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="store-latitude">Latitude (map pin)</Label>
                  <Input
                    id="store-latitude"
                    inputMode="decimal"
                    placeholder="28.4595"
                    className="mt-1.5 border-zinc-700 bg-zinc-950"
                    value={storeLatitude}
                    onChange={(e) => setStoreLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="store-longitude">Longitude (map pin)</Label>
                  <Input
                    id="store-longitude"
                    inputMode="decimal"
                    placeholder="77.0266"
                    className="mt-1.5 border-zinc-700 bg-zinc-950"
                    value={storeLongitude}
                    onChange={(e) => setStoreLongitude(e.target.value)}
                  />
                </div>
              </div>
              <ImageUploadField
                id="greeting-image"
                label="Welcome image (WhatsApp greeting)"
                placeholder="/uploads/greeting/ayudha-welcome.png"
                value={greetingImageUrl}
                onChange={setGreetingImageUrl}
                onUpload={handleUploadGreetingImage}
                disabled={saving}
                hint="Sent as the first image when a patient says Hi. Upload JPG, PNG, or WebP (max 5 MB)."
              />
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                Save store settings
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="border-zinc-800 bg-zinc-900/50">
            <h2 className="font-semibold text-white">FAQ support</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Bot matches patient questions to these FAQs. Keywords help matching (comma-separated).
            </p>

            <form onSubmit={handleAddFaq} className="mt-4 space-y-3">
              <Input
                placeholder="Question: Do you deliver?"
                className="border-zinc-700 bg-zinc-950"
                value={faqForm.question}
                onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
              />
              <Input
                placeholder="Answer: Yes, within 5km radius."
                className="border-zinc-700 bg-zinc-950"
                value={faqForm.answer}
                onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
              />
              <Input
                placeholder="Keywords: delivery, home delivery, deliver"
                className="border-zinc-700 bg-zinc-950"
                value={faqForm.keywords}
                onChange={(e) => setFaqForm((f) => ({ ...f, keywords: e.target.value }))}
              />
              <Button type="submit" disabled={saving}>
                <Plus size={16} />
                Add FAQ
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              {loadingFaqs ? (
                <SkeletonFaqList />
              ) : faqs.length === 0 ? (
                <p className="text-sm text-zinc-500">No FAQs yet. Add common patient questions above.</p>
              ) : (
                faqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{faq.question}</p>
                      <p className="mt-1 text-sm text-zinc-400">{faq.answer}</p>
                      {faq.keywords.length > 0 ? (
                        <p className="mt-1 text-xs text-zinc-600">
                          Keywords: {faq.keywords.join(', ')}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteFaq(faq._id)}
                      className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard className="border-zinc-800 bg-zinc-900/50">
            <h2 className="font-semibold text-white">Payment settings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Default payment link and QR sent when order status is Payment Pending.
            </p>

            <form onSubmit={handleSavePaymentSettings} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="payment-link">Payment link</Label>
                <Input
                  id="payment-link"
                  type="url"
                  placeholder="https://pay.example.com/..."
                  className="mt-1.5 border-zinc-700 bg-zinc-950"
                  value={paymentLinkUrl}
                  onChange={(e) => setPaymentLinkUrl(e.target.value)}
                />
              </div>
              <ImageUploadField
                id="payment-qr"
                label="QR code image (optional)"
                placeholder="https://... or /uploads/..."
                value={paymentQrImageUrl}
                onChange={setPaymentQrImageUrl}
                onUpload={handleUploadPaymentQr}
                disabled={saving}
                hint="Upload your UPI/payment QR from device, or paste an image URL. JPG, PNG, or WebP (max 5 MB)."
              />
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
                WhatsApp is connected. Bot service menu, FAQs, and order updates are active.
              </p>
              <p className="mt-2 text-xs text-emerald-100/60">
                Meta templates: set <code className="rounded bg-black/20 px-1">USE_META_TEMPLATES=true</code>{' '}
                in server env after Meta approves your templates (order_verified, order_accepted, etc.).
                Until then, order updates use session text messages from code.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <h2 className="font-semibold text-amber-200">WhatsApp integration</h2>
              <p className="mt-2 text-sm text-amber-100/80">
                Configure Meta tokens and WhatsApp Phone Number ID to enable bot replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
