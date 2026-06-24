import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { createMessage, getMessages } from '../../api/messages';
import { ApiClientError } from '../../api/client';
import { usePharmacy } from '../../context/PharmacyContext';
import type { Conversation, Message } from '../../types';
import { formatTime, getPatientFromConversation } from '../../utils/format';
import { MessageBubble } from './MessageBubble';
import { SimulatePatientDialog } from './SimulatePatientDialog';

interface ChatViewProps {
  pharmacyId: string;
  conversation: Conversation;
}

export function ChatView({ pharmacyId, conversation }: ChatViewProps) {
  const { pharmacy } = usePharmacy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateOpen, setSimulateOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const patient = getPatientFromConversation(conversation.patientId);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMessages(pharmacyId, conversation._id);
      setMessages([...data].reverse());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, [pharmacyId, conversation._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);

    try {
      const message = await createMessage(pharmacyId, {
        conversationId: conversation._id,
        senderType: 'pharmacist',
        content,
      });
      setMessages((prev) => [...prev, message]);
      setDraft('');

      if (pharmacy?.whatsappIntegration?.connected) {
        if (message.whatsappMessageId) {
          toast.success('Sent to patient on WhatsApp');
        } else {
          toast.warning('Saved in inbox — could not deliver on WhatsApp');
        }
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSimulatePatient = async (content: string) => {
    setSending(true);
    setError(null);

    try {
      const message = await createMessage(pharmacyId, {
        conversationId: conversation._id,
        senderType: 'patient',
        content,
      });
      setMessages((prev) => [...prev, message]);
      toast.success('Test message added to inbox');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to simulate message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#e5ddd5]">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-brand-700 px-5 py-4 text-white shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <UserRound size={20} />
        </div>
        <div>
          <h2 className="font-semibold">{patient.name}</h2>
          <p className="text-sm text-white/80">{patient.mobile}</p>
          {pharmacy?.whatsappIntegration?.connected ? (
            <p className="mt-0.5 text-xs text-emerald-200">WhatsApp connected · webhook active</p>
          ) : (
            <p className="mt-0.5 text-xs text-amber-200">WhatsApp not fully connected</p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="rounded-xl bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm">
              No messages yet. Use &quot;Simulate patient&quot; to test the chat.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                content={message.content}
                senderType={message.senderType}
                messageType={message.messageType}
                time={formatTime(message.createdAt)}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error ? (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="border-t border-slate-200 bg-white px-4 py-3">
        {!pharmacy?.whatsappIntegration?.connected ? (
          <p className="mb-2 text-xs text-amber-700">
            WhatsApp delivery pending — messages save to database only until integration is
            complete.
          </p>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSimulateOpen(true)}
            disabled={sending}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Simulate patient
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Type a reply as pharmacist..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !draft.trim()}
            className="flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <SimulatePatientDialog
        open={simulateOpen}
        onOpenChange={setSimulateOpen}
        onSubmit={handleSimulatePatient}
        sending={sending}
      />
    </div>
  );
}
