import { NextResponse } from 'next/server';

const MAX = { name: 120, phone: 20, email: 160, destination: 160, date: 7, message: 2000 } as const;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const kind = body.kind === 'newsletter' ? 'newsletter' : 'enquiry';
  const data = {
    kind,
    name: clean(body.name, MAX.name),
    phone: clean(body.phone, MAX.phone),
    email: clean(body.email, MAX.email),
    destination: clean(body.destination, MAX.destination),
    date: clean(body.date, MAX.date),
    message: clean(body.message, MAX.message),
    submittedAt: new Date().toISOString(),
  };

  if (!emailRe.test(data.email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 422 });
  if (kind === 'enquiry' && (!data.name || !/^[0-9+\-\s]{8,15}$/.test(data.phone))) {
    return NextResponse.json({ error: 'Name and a valid phone number are required' }, { status: 422 });
  }

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: 'Form delivery is not configured' }, { status: 503 });

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (err) {
    console.error('[enquiry] delivery failed', err);
    return NextResponse.json({ error: 'Could not deliver your message' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
