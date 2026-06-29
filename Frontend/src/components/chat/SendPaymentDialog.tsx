import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPharmacyAsset } from '../../api/pharmacy';
import { ApiClientError } from '../../api/client';
import { usePharmacy } from '../../context/PharmacyContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ImageUploadField } from '../ui/ImageUploadField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { Pharmacy, SendPaymentDetailsInput } from '../../types';

interface SendPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacy: Pharmacy | null;
  onSend: (data: SendPaymentDetailsInput) => Promise<void>;
  sending: boolean;
}

export function SendPaymentDialog({
  open,
  onOpenChange,
  pharmacy,
  onSend,
  sending,
}: SendPaymentDialogProps) {
  const { pharmacyId, refreshPharmacy } = usePharmacy();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('');
  const [paymentQrImageUrl, setPaymentQrImageUrl] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setPaymentAmount('');
    setPaymentLinkUrl(pharmacy?.paymentLinkUrl ?? '');
    setPaymentQrImageUrl(pharmacy?.paymentQrImageUrl ?? '');
  }, [open, pharmacy?.paymentLinkUrl, pharmacy?.paymentQrImageUrl]);

  const resolvedLink = paymentLinkUrl.trim() || pharmacy?.paymentLinkUrl || '';
  const resolvedQr = paymentQrImageUrl.trim() || pharmacy?.paymentQrImageUrl || '';
  const canSendQr = Boolean(resolvedQr);
  const canSendLink = Boolean(resolvedLink);

  const handleUploadPaymentQr = async (file: File) => {
    if (!pharmacyId) {
      return;
    }

    try {
      const updated = await uploadPharmacyAsset(pharmacyId, 'payment_qr', file);
      setPaymentQrImageUrl(updated.paymentQrImageUrl ?? '');
      await refreshPharmacy();
      toast.success('QR uploaded — ready to send');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to upload QR image');
      throw err;
    }
  };

  const handleSend = async (sendMode: 'link' | 'qr' | 'both') => {
    await onSend({
      paymentLinkUrl: resolvedLink || undefined,
      paymentQrImageUrl: resolvedQr || undefined,
      sendMode,
      paymentAmount: paymentAmount ? Number(paymentAmount) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee size={20} className="text-amber-400" />
            Send payment details
          </DialogTitle>
          <DialogDescription>
            Send payment link and/or QR to this patient on WhatsApp. Upload a QR from your device
            here or use saved defaults from Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Amount (₹, optional)</label>
            <Input
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="e.g. 110"
              type="number"
              min="0"
              className="border-zinc-700 bg-zinc-900 text-white"
              disabled={sending}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-400">Payment link</label>
            <Input
              value={paymentLinkUrl}
              onChange={(e) => setPaymentLinkUrl(e.target.value)}
              placeholder={pharmacy?.paymentLinkUrl ? 'From Settings' : 'https://pay.example.com/...'}
              className="border-zinc-700 bg-zinc-900 text-white"
              disabled={sending}
            />
          </div>

          <ImageUploadField
            id="inbox-payment-qr"
            label="QR code image"
            placeholder="/uploads/payment-qr/... or paste image URL"
            value={paymentQrImageUrl}
            onChange={setPaymentQrImageUrl}
            onUpload={handleUploadPaymentQr}
            disabled={sending || !pharmacyId}
            hint="Upload from device (JPG, PNG, WebP — max 5 MB) or paste a URL."
          />

          <Link
            to="/dashboard/settings"
            className="inline-block text-xs text-violet-400 hover:text-violet-300"
          >
            Change defaults in Settings →
          </Link>

          {!canSendLink && !canSendQr ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Add a payment link or upload a QR image above to send.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              disabled={sending || !canSendQr}
              onClick={() => void handleSend('qr')}
              className="bg-amber-600 hover:bg-amber-500"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : null}
              Send QR
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={sending || !canSendLink}
              onClick={() => void handleSend('link')}
              className="border-amber-500/40 text-amber-100 hover:bg-amber-500/20"
            >
              Send link
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={sending || (!canSendLink && !canSendQr)}
              onClick={() => void handleSend('both')}
              className="border-amber-500/40 text-amber-100 hover:bg-amber-500/20"
            >
              Send both
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
