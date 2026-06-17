import { env } from '../config/env';

export const resolvePublicUrl = (urlOrPath: string): string => {
  if (/^https?:\/\//i.test(urlOrPath)) {
    return urlOrPath;
  }

  const base = env.APP_PUBLIC_URL.replace(/\/$/, '');
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;

  return `${base}${path}`;
};
