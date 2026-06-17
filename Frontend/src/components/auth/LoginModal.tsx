import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { loginPharmacy } from '../../api/auth';
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

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string;
}

export function LoginModal({ open, onOpenChange, initialEmail = '' }: LoginModalProps) {
  const navigate = useNavigate();
  const { setPharmacyId } = usePharmacy();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open && initialEmail) {
      setEmail(initialEmail);
    }
  }, [open, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await loginPharmacy({ email, password });
      await setPharmacyId(result.pharmacyId);
      toast.success(`Welcome back, ${result.pharmacyName}`);
      onOpenChange(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pharmacy Login</DialogTitle>
          <DialogDescription>Sign in to access your pharmacy dashboard.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              required
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Sign In
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
