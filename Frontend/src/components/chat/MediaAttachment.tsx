import { Download, ExternalLink, FileText } from 'lucide-react';
import { getFileNameFromPath, isImagePath, resolveMediaUrl } from '../../utils/media';

interface MediaAttachmentProps {
  content: string;
  alt?: string;
}

export function MediaAttachment({ content, alt = 'Attachment' }: MediaAttachmentProps) {
  const mediaUrl = resolveMediaUrl(content);
  const fileName = getFileNameFromPath(content);
  const isImage = isImagePath(content);

  return (
    <div className="space-y-2">
      {isImage ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-brand-300"
        >
          <img
            src={mediaUrl}
            alt={alt}
            className="max-h-72 max-w-full cursor-pointer object-contain"
          />
        </a>
      ) : (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-brand-300 hover:bg-brand-50/50"
        >
          <FileText size={22} className="shrink-0 text-brand-600" />
          <span className="truncate text-sm font-medium text-slate-700">{fileName}</span>
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href={mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
        >
          <ExternalLink size={13} />
          Open in new tab
        </a>
        <a
          href={mediaUrl}
          download={fileName}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download size={13} />
          Download
        </a>
      </div>
    </div>
  );
}
