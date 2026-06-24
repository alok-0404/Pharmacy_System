/** Resolve relative upload paths for inbox media links. */
export function resolveMediaUrl(url: string): string {
  if (!url) return url;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }

  return `${window.location.origin}/${url}`;
}

export function isResolvableMediaPath(url: string): boolean {
  if (!url || url.startsWith('[')) {
    return false;
  }

  return url.startsWith('/') || /^https?:\/\//i.test(url);
}

export function getFileNameFromPath(url: string): string {
  const path = url.split('?')[0];
  const segment = path.split('/').pop();
  return segment || 'prescription';
}

export function isImagePath(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|bmp|heic|heif)(\?.*)?$/i.test(url);
}

export function isPdfPath(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url);
}
