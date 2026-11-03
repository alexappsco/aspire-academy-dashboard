/**
 * Turns a stored media path into a URL the browser can actually load.
 *
 * The backend returns uploaded files (videos, documents, receipts) in two
 * shapes: an absolute URL (`http://api-staging…/uploads/…`) or a path relative
 * to the API root (`/uploads/…` / `uploads/…`). Used as-is, the relative form
 * resolves against the dashboard origin and 404s, and an `http://` asset on an
 * `https://` page is blocked by the browser as mixed content.
 *
 * Same rules as `resolveReceiptUrl`, plus the mixed-content upgrade, so every
 * media preview behaves consistently.
 */
export function resolveMediaUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const url = String(rawUrl).trim();
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const isSecurePage =
    typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (/^https:\/\//i.test(url)) return url;

  // Only rewrite the scheme when the current page would otherwise block the
  // asset; on an http page the stored URL is left exactly as it is.
  if (/^http:\/\//i.test(url)) {
    return isSecurePage ? url.replace(/^http:/i, 'https:') : url;
  }

  // HOST_API already ends with /api/v1 — assets are served from its root.
  const base = (process.env.NEXT_PUBLIC_HOST_API || '')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '');
  if (!base) return url;
  return `${base}/${url.replace(/^\/+/, '')}`;
}
