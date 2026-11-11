'use client';

import { useState, type FormEvent } from 'react';
import { emptyEnquiry, useSite, type EnquiryState } from '../providers';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { ClockIcon, MailIcon, PhoneIcon } from '../icons';
import { unsplash } from '@/lib/data';
import { site } from '@/lib/site';
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
    <section className="contact section" id="contact">
      <div className="container">
        <div className="contact__card">
          <div className="contact__bg" data-parallax="0.15">
            <Img src={unsplash('1507525428034-b723cf961d3e')} alt="" fill sizes="100vw" quality={70} />
          </div>
          <div className="contact__copy">
            <Reveal as="p" className="eyebrow eyebrow--light"><span className="dot" /> Let&apos;s go</Reveal>
            <SplitHeading lines={['Your next adventure', '*awaits.*']} />
            <Reveal as="p">
              Share a few details and a travel specialist will send a personalised, fully priced itinerary within 24 hours. There is no cost and no obligation.
            </Reveal>
            <Reveal as="ul" className="contact__list">
              <li><span className="ico-circle"><PhoneIcon /></span><a href={site.phoneHref}>{site.phoneDisplay}</a></li>
              <li><span className="ico-circle"><MailIcon /></span><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><span className="ico-circle"><ClockIcon /></span>{site.hours}</li>
            </Reveal>
          </div>

          <Reveal as="form" variant="right" className="enquiry" onSubmit={onSubmit} noValidate aria-label="Holiday enquiry">
            <h3>Plan my holiday</h3>
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
            <label className="ffield">
              <textarea rows={3} placeholder=" " value={f.message} onChange={(e) => set('message', e.target.value)} />
              <span>Tell us about your dream trip</span>
            </label>
            <label className={cls('consent', 'check')}>
              <input id="enq-consent" type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} />
              <span>I agree to be contacted by I Tara about my enquiry.</span>
            </label>
            <button className={`btn btn--primary btn--block magnetic${sending ? ' is-loading' : ''}`} type="submit" disabled={sending}>
              <span>{sending ? 'Sending' : 'Send enquiry'}</span>
              <i className="btn__arrow">→</i>
            </button>
            <p className="enquiry__note">We never share your details. Typical reply time is under 2 hours.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
