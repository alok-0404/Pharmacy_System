import { useState } from 'react';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface SimulatePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => Promise<void>;
  sending: boolean;
}

const QUICK_MESSAGES = ['Hi', 'Menu', 'Order status', 'Upload prescription'];

export function SimulatePatientDialog({
  open,
  onOpenChange,
  onSubmit,
  sending,
}: SimulatePatientDialogProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    await onSubmit(trimmed);
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus size={20} className="text-violet-400" />
            Simulate patient message
          </DialogTitle>
          <DialogDescription>
            Test the inbox UI only. Real patient messages arrive via WhatsApp webhook — bot replies
            are not triggered from here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <Input
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hi, I need my order status"
              className="border-zinc-700 bg-zinc-900 text-white"
              disabled={sending}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((quick) => (
              <button
                key={quick}
                type="button"
                disabled={sending}
                onClick={() => setMessage(quick)}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition hover:border-violet-500 hover:text-violet-300 disabled:opacity-50"
              >
                {quick}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-zinc-400 hover:text-white"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sending || !message.trim()}>
              {sending ? <Loader2 className="animate-spin" size={16} /> : null}
              Send as patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
