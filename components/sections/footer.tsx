'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { useSite } from '../providers';
import { FacebookIcon, InstagramIcon, LinkedinIcon, WhatsappIcon, YoutubeIcon } from '../icons';
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
      toast('You are subscribed. Welcome aboard.');
    } catch {
      toast('Could not subscribe right now. Please try again.', true);
    }
  };

  return (
    <>
      <footer className="footer" data-theme="dark">
        <div className="container">
          <span className="rule rule--light" />
          <div className="footer__cols">
            <div>
              <h4>Explore</h4>
              <ul>{nav.map((n) => <li key={n.id}><a href={n.href}>{n.label}</a></li>)}</ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href={site.phoneHref}>{site.phoneDisplay}</a></li>
                <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                <li>{site.hours}</li>
              </ul>
            </div>
            <div>
              <h4>Follow</h4>
              <div className="socials">
                <a href={site.socials.instagram} aria-label="Instagram"><InstagramIcon /></a>
                <a href={site.socials.facebook} aria-label="Facebook"><FacebookIcon /></a>
                <a href={site.socials.youtube} aria-label="YouTube"><YoutubeIcon /></a>
                <a href={site.socials.linkedin} aria-label="LinkedIn"><LinkedinIcon /></a>
              </div>
            </div>
            <div className="footer__news">
              <h4>Travel notes</h4>
              <p>A short letter each month with seasonal ideas. No spam.</p>
              <form className="news" onSubmit={onSubscribe} noValidate>
                <input type="email" placeholder="Email address" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>
          <div className="footer__mark">
            <Image src="/img/wordmark-light.png" alt={site.legalName} width={900} height={264} sizes="(max-width: 900px) 90vw, 900px" />
          </div>
          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} {site.legalName}</span>
            <span><a href="#">Terms</a> · <a href="#">Privacy</a></span>
            <a href="#top">Back to top</a>
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
