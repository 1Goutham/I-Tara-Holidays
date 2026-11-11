'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { useSite } from '../providers';
import { FacebookIcon, InstagramIcon, LinkedinIcon, WhatsappIcon, YoutubeIcon } from '../icons';
import { site } from '@/lib/site';
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
        <div className="footer__word" aria-hidden="true">I Tara</div>
        <div className="container footer__grid">
          <div className="footer__brand">
            <Image src="/img/logo.webp" alt={site.legalName} width={170} height={155} />
            <p>Holidays planned with care, from Himalayan pilgrimages to tropical honeymoons.</p>
            <div className="socials">
              <a href={site.socials.instagram} aria-label="Instagram"><InstagramIcon /></a>
              <a href={site.socials.facebook} aria-label="Facebook"><FacebookIcon /></a>
              <a href={site.socials.youtube} aria-label="YouTube"><YoutubeIcon /></a>
              <a href={site.socials.linkedin} aria-label="LinkedIn"><LinkedinIcon /></a>
            </div>
          </div>
          <div>
            <h4>Holidays</h4>
            <ul>
              <li><a href="#packages">India tours</a></li>
              <li><a href="#packages">International tours</a></li>
              <li><a href="#styles">Honeymoon packages</a></li>
              <li><a href="#styles">Pilgrimage tours</a></li>
              <li><a href="#services">Group departures</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#stories">Testimonials</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#">Terms &amp; privacy</a></li>
            </ul>
          </div>
          <div className="footer__news">
            <h4>Travel inspiration, monthly</h4>
            <p>Seasonal deals and destination guides. No spam.</p>
            <form className="news" onSubmit={onSubscribe} noValidate>
              <input type="email" placeholder="Your email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" aria-label="Subscribe">→</button>
            </form>
            <ul className="footer__contact">
              <li><a href={site.phoneHref}>{site.phoneDisplay}</a></li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="container footer__bottom">
          <span>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</span>
          <a href="#top" className="to-top">Back to top ↑</a>
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
