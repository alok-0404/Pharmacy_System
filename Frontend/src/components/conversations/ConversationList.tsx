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
      <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-500">
        <MessageSquare className="mb-3 text-slate-300" size={40} />
        <p className="font-medium">No conversations yet</p>
        <p className="mt-1 text-sm">Add a patient and start a chat from the Patients page.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 overflow-y-auto">
      {conversations.map((conversation) => {
        const patient = getPatientFromConversation(conversation.patientId);
        const isSelected = conversation._id === selectedId;

        return (
          <button
            key={conversation._id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
              isSelected ? 'bg-brand-50' : ''
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-slate-900">{patient.name}</p>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatRelative(conversation.lastMessageAt)}
                </span>
              </div>
              <p className="truncate text-sm text-slate-500">{patient.mobile}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  conversation.status === 'open'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
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
