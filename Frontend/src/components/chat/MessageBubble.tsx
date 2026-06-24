import type { SenderType } from '../../types';
import { isResolvableMediaPath } from '../../utils/media';
import { MediaAttachment } from './MediaAttachment';

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
  const hasMedia = (messageType === 'image' || messageType === 'document') && isResolvableMediaPath(content);

  const renderBody = () => {
    if (hasMedia) {
      return (
        <MediaAttachment
          content={content}
          alt={messageType === 'document' ? 'Prescription document' : 'Shared image'}
        />
      );
    }

    if ((messageType === 'image' || messageType === 'document') && !isResolvableMediaPath(content)) {
      return (
        <p className="text-sm italic text-slate-500">
          {content || 'Media unavailable — file may not have been saved.'}
        </p>
      );
    }

    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
  };

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
        {renderBody()}
        {time ? (
          <p className={`mt-1 text-[10px] ${isOutgoing ? 'text-white/70' : 'text-slate-400'}`}>
            {time}
          </p>
        ) : null}
      </div>
    </div>
  );
}
