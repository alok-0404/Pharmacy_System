import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { getConversations } from '../api/conversations';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import type { Conversation } from '../types';
import { ConversationList } from '../components/conversations/ConversationList';
import { ChatView } from '../components/chat/ChatView';

export function InboxPage() {
  const { pharmacyId } = usePharmacy();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    if (!pharmacyId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getConversations(pharmacyId);
      setConversations(data);

      if (data.length > 0) {
        setSelected((current) => {
          if (!current) return data[0];
          return data.find((item) => item._id === current._id) ?? data[0];
        });
      } else {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, [pharmacyId]);

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-zinc-950">
      <section className="flex h-full min-h-0 w-96 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <h1 className="text-lg font-semibold text-white">Inbox</h1>
          <button
            type="button"
            onClick={() => void loadConversations()}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedId={selected?._id ?? null}
              onSelect={setSelected}
            />
          </div>
        )}
      </section>

      <section className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {selected && pharmacyId ? (
          <ChatView pharmacyId={pharmacyId} conversation={selected} />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500">
            Select a conversation to start chatting
          </div>
        )}
      </section>
    </div>
  );
}
