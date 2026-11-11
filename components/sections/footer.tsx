'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { useSite } from '../providers';
import { FacebookIcon, InstagramIcon, LinkedinIcon, WhatsappIcon, YoutubeIcon } from '../icons';
import { Wave } from '../illustrations';
import { nav, site } from '@/lib/site';
import { submitForm } from '@/lib/submit';

export function Footer() {
  const { toast } = useSite();
  const [email, setEmail] = useState('');

  const onSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast('Please enter a valid email', true);
      return;
    }
    try {
      await submitForm('newsletter', { email: email.trim() }, { mailtoFallback: false });
      setEmail('');
      toast('You are subscribed. Welcome aboard!');
    } catch {
      toast('Could not subscribe right now. Please try again.', true);
    }
  };

  return (
    <>
      <footer className="footer">
        <Wave className="footer__wave" />
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <Image src="/img/mark.png" alt="" width={72} height={72} />
              <p className="footer__word">I Tara</p>
              <p>Holidays planned with care, from Himalayan pilgrimages to tropical honeymoons.</p>
            </div>
            <div className="footer__news">
              <h4>Travel notes, once a month</h4>
              <p>Seasonal ideas and quiet deals. No spam.</p>
              <form className="news" onSubmit={onSubscribe} noValidate>
                <input type="email" placeholder="Your email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" aria-label="Subscribe">→</button>
              </form>
            </div>
          </div>

          <div className="footer__mid">
            <nav aria-label="Footer">
              {nav.map((n) => <a key={n.id} href={n.href}>{n.label}</a>)}
              <a href="#">Terms &amp; privacy</a>
            </nav>
            <div className="footer__contact">
              <a href={site.phoneHref}>{site.phoneDisplay}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
            <div className="socials">
              <a href={site.socials.instagram} aria-label="Instagram"><InstagramIcon /></a>
              <a href={site.socials.facebook} aria-label="Facebook"><FacebookIcon /></a>
              <a href={site.socials.youtube} aria-label="YouTube"><YoutubeIcon /></a>
              <a href={site.socials.linkedin} aria-label="LinkedIn"><LinkedinIcon /></a>
            </div>
          </div>

          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} {site.legalName}</span>
            <a href="#top" className="to-top">Back to top ↑</a>
          </div>
        </div>
      </footer>

      <a
        className="wa magnetic"
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi I Tara, I'd like to plan a holiday")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsappIcon />
      </a>
    </>
  );
}
