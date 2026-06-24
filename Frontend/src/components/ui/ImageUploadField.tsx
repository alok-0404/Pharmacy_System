import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './input';
import { Label } from './label';
import { isResolvableMediaPath, resolveMediaUrl } from '../../utils/media';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function ImageUploadField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  onUpload,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const previewUrl = isResolvableMediaPath(value) ? resolveMediaUrl(value) : null;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a JPG, PNG, or WebP image');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      await onUpload(file);
    } catch {
      // Parent handles error toast.
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        className="mt-1.5 border-zinc-700 bg-zinc-950"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || uploading}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => void handleFileChange(e)}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload from device'}
        </button>
      </div>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt={label}
          className="mt-3 max-h-32 rounded-lg border border-zinc-800 object-contain"
        />
      ) : null}

      {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}
