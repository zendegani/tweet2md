const ALLOWED_IMAGE_HOSTS = new Set([
  'pbs.twimg.com',
  'video.twimg.com',
  'abs.twimg.com',
  'abs-0.twimg.com',
]);

export function isAllowedImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

// Parse `raw` as a URL (resolving protocol-relative or path-relative forms
// against x.com when needed) and check whether its hostname exactly matches
// one of `hosts`. Substring checks like `url.includes('pbs.twimg.com')` are
// bypassable (CodeQL js/incomplete-url-substring-sanitization).
export function hostMatches(raw: string, ...hosts: string[]): boolean {
  if (!raw) return false;
  try {
    const { hostname } = new URL(raw, 'https://x.com');
    return hosts.includes(hostname);
  } catch {
    return false;
  }
}
