import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { registerPharmacy } from '../../api/auth';
import { ApiClientError } from '../../api/client';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: (email?: string) => void;
}

export function RegisterModal({ open, onOpenChange, onLoginClick }: RegisterModalProps) {
  const navigate = useNavigate();
  const { setPharmacyId } = usePharmacy();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pharmacyName: '',
    ownerName: '',
    email: '',
    mobile: '',
    city: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await registerPharmacy(form);
      await setPharmacyId(result.pharmacyId);
      toast.success('Pharmacy Registered Successfully');
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Registration failed';

      toast.error(msg);

      if (err instanceof ApiClientError && msg.toLowerCase().includes('log in')) {
        onOpenChange(false);
        onLoginClick?.(form.email);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Your Pharmacy</DialogTitle>
          <DialogDescription>
            Create your account and start managing patient communication on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {[
            ['pharmacyName', 'Pharmacy Name', 'text'],
            ['ownerName', 'Owner Name', 'text'],
            ['email', 'Email', 'email'],
            ['mobile', 'Mobile', 'tel'],
            ['city', 'City', 'text'],
            ['password', 'Password', 'password'],
          ].map(([key, label, type]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                required
                className="mt-1.5"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Create Account
          </Button>

          {onLoginClick ? (
            <p className="text-center text-sm text-zinc-400">
              Already registered?{' '}
              <button
                type="button"
                className="font-medium text-violet-400 hover:text-violet-300"
                onClick={() => {
                  onOpenChange(false);
                  onLoginClick(form.email);
                }}
              >
                Log in
              </button>
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
