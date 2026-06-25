import { MessageSquare } from 'lucide-react';
import type { Conversation } from '../../types';
import { formatRelative, getPatientFromConversation } from '../../utils/format';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center text-zinc-500">
        <MessageSquare className="mb-3 text-zinc-600" size={40} />
        <p className="font-medium text-zinc-300">No conversations yet</p>
        <p className="mt-1 text-sm">Patients appear here when they message on WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800">
      {conversations.map((conversation) => {
        const patient = getPatientFromConversation(conversation.patientId);
        const isSelected = conversation._id === selectedId;

        return (
          <button
            key={conversation._id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-800/80 ${
              isSelected ? 'bg-violet-500/15' : ''
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-white">{patient.name}</p>
                <span className="shrink-0 text-xs text-zinc-500">
                  {formatRelative(conversation.lastMessageAt)}
                </span>
              </div>
              <p className="truncate text-sm text-zinc-400">{patient.mobile}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  conversation.status === 'open'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {conversation.status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
