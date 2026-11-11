'use client';

import { useState, type FormEvent } from 'react';
import { emptyEnquiry, useSite, type EnquiryState } from '../providers';
import { site } from '@/lib/site';
import { destinationOptions } from '@/lib/data';
import { submitForm } from '@/lib/submit';

type Field = keyof EnquiryState;
const required: Field[] = ['name', 'phone', 'email', 'consent'];

function validate(f: EnquiryState): Partial<Record<Field, true>> {
  const e: Partial<Record<Field, true>> = {};
  if (!f.name.trim()) e.name = true;
  if (!/^[0-9+\-\s]{8,15}$/.test(f.phone.trim())) e.phone = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = true;
  if (!f.consent) e.consent = true;
  return e;
}

export function Contact() {
  const { enquiry: f, setEnquiry, toast } = useSite();
  const [errors, setErrors] = useState<Partial<Record<Field, true>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, true>>>({});
  const [sending, setSending] = useState(false);

  const set = <K extends Field>(k: K, v: EnquiryState[K]) => {
    const next = { ...f, [k]: v };
    setEnquiry(next);
    if (touched[k] || errors[k]) setErrors(validate(next));
  };
  const blur = (k: Field) => {
    setTouched((t) => ({ ...t, [k]: true }));
    if (f[k]) setErrors(validate(f));
  };
  const cls = (k: Field, base = 'ffield') => `${base}${errors[k] ? ' is-invalid' : ''}`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    const first = required.find((k) => errs[k]);
    if (first) {
      document.getElementById(`enq-${first}`)?.focus();
      toast('Please complete the highlighted fields', true);
      return;
    }
    setSending(true);
    const { consent: _consent, ...payload } = f;
    try {
      await submitForm('enquiry', payload);
      setEnquiry(emptyEnquiry);
      setTouched({});
      toast('Thank you! A travel expert will contact you shortly.');
    } catch {
      toast('Something went wrong. Please call or WhatsApp us.', true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact" id="contact" data-theme="dark">
      <div className="container contact__grid">
        <div className="contact__copy">
          <p className="label" data-fade>(08) Begin</p>
          <h2 className="h2" data-split>Tell us where you would like to <em>wake up.</em></h2>
          <p className="contact__lead" data-fade>
            Share a few details and a travel specialist will send a personalised, fully priced itinerary within 24 hours. There is no cost and no obligation.
          </p>
          <dl className="contact__list" data-fade>
            <div><dt>Call</dt><dd><a href={site.phoneHref}>{site.phoneDisplay}</a></dd></div>
            <div><dt>Write</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
            <div><dt>Hours</dt><dd>{site.hours}</dd></div>
          </dl>
        </div>

        <form className="enquiry" onSubmit={onSubmit} noValidate aria-label="Holiday enquiry" data-fade>
          <div className="enquiry__row">
            <label className={cls('name')}>
              <input id="enq-name" type="text" placeholder=" " autoComplete="name" required value={f.name} onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')} aria-invalid={!!errors.name} />
              <span>Full name</span>
            </label>
            <label className={cls('phone')}>
              <input id="enq-phone" type="tel" placeholder=" " autoComplete="tel" required value={f.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => blur('phone')} aria-invalid={!!errors.phone} />
              <span>Phone</span>
            </label>
          </div>
          <label className={cls('email')}>
            <input id="enq-email" type="email" placeholder=" " autoComplete="email" required value={f.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} aria-invalid={!!errors.email} />
            <span>Email</span>
          </label>
          <div className="enquiry__row">
            <label className="ffield">
              <input type="text" placeholder=" " list="dest-list" value={f.destination} onChange={(e) => set('destination', e.target.value)} />
              <span>Destination</span>
            </label>
            <label className="ffield">
              <input type="month" placeholder=" " value={f.date} onChange={(e) => set('date', e.target.value)} />
              <span className="is-up">Travel month</span>
            </label>
          </div>
          <datalist id="dest-list">
            {destinationOptions.map((d) => <option key={d} value={d} />)}
          </datalist>
          <label className="ffield">
            <textarea rows={3} placeholder=" " value={f.message} onChange={(e) => set('message', e.target.value)} />
            <span>Tell us about the trip you have in mind</span>
          </label>
          <label className={cls('consent', 'check')}>
            <input id="enq-consent" type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} />
            <span>I agree to be contacted by I Tara about my enquiry.</span>
          </label>
          <div className="enquiry__foot">
            <button className={`btn btn--light magnetic${sending ? ' is-loading' : ''}`} type="submit" disabled={sending}>
              <span>{sending ? 'Sending' : 'Send enquiry'}</span>
            </button>
            <p className="enquiry__note">We never share your details. Typical reply time is under two hours.</p>
          </div>
        </form>
      </div>
    </section>
  );
}
