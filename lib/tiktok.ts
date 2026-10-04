export function trackTikTokEvent(
  event: string,
  properties: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;

  const ttq = (window as any).ttq;

  if (ttq && typeof ttq.track === 'function') {
    ttq.track(event, properties);
  }
}
