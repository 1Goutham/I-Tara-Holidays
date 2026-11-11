import { site } from './site';

/**
 * Posts a form to /api/enquiry. If the server has no webhook configured (503),
 * falls back to opening the visitor's email client with the details filled in.
 */
export async function submitForm(kind: 'enquiry' | 'newsletter', data: Record<string, string>, { mailtoFallback = true } = {}) {
  const res = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ...data }),
  }).catch(() => null);

  if (res?.ok) return;
  if (res?.status === 503 && mailtoFallback) {
    const subject = kind === 'enquiry' ? `New holiday enquiry — ${data.destination || 'General'}` : 'Newsletter signup';
    const body = Object.entries(data)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return;
  }
  throw new Error('Submission failed');
}
