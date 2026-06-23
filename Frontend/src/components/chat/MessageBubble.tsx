import type { SenderType } from '../../types';

interface MessageBubbleProps {
  content: string;
  senderType: SenderType;
  time?: string;
  messageType?: 'text' | 'image' | 'document';
}

const senderLabels: Record<SenderType, string> = {
  patient: 'Patient',
  pharmacist: 'You',
  bot: 'Bot',
};

export function MessageBubble({ content, senderType, time, messageType = 'text' }: MessageBubbleProps) {
  const isOutgoing = senderType === 'pharmacist' || senderType === 'bot';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          senderType === 'patient'
            ? 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200'
            : senderType === 'bot'
              ? 'rounded-br-md bg-slate-100 text-slate-700 ring-1 ring-slate-200'
              : 'rounded-br-md bg-brand-600 text-white'
        }`}
      >
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
          {senderLabels[senderType]}
        </p>
        {messageType === 'image' ? (
          <img src={content} alt="Shared image" className="max-h-48 rounded-lg object-contain" />
        ) : messageType === 'document' ? (
          <a href={content} target="_blank" rel="noreferrer" className="text-sm underline">
            View document
          </a>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        )}
        {time ? (
          <p className={`mt-1 text-[10px] ${isOutgoing ? 'text-white/70' : 'text-slate-400'}`}>
            {time}
          </p>
        ) : null}
      </div>
    </div>
  );
}
