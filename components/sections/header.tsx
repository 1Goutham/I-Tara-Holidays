'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { nav, site } from '@/lib/site';
import { PhoneIcon } from '../icons';

export function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // keeps the menu in the DOM during its close animation
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string>('');

  // Hide on scroll down, reveal on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 300);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section in view
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? '' : cur));
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    nav.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Mobile menu lifecycle
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      setMounted(true);
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
    const t = setTimeout(() => setMounted(false), 800);
    return () => clearTimeout(t);
  }, [open]);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!mounted) return setVisible(false);
    const r = requestAnimationFrame(() => setVisible(open));
    return () => cancelAnimationFrame(r);
  }, [mounted, open]);

  return (
    <>
      <header className={`header${hidden && !open ? ' is-hidden' : ''}`} id="top">
        <div className="header__bar container">
          <a href="#top" className="brand" aria-label={`${site.legalName}, home`}>
            <Image src="/img/mark.png" alt="" width={46} height={46} priority />
            <span className="brand__text">
              <b>I Tara</b>
              <small>{site.tagline}</small>
            </span>
          </a>
          <nav className="nav" aria-label="Primary">
            <ul>
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={n.href} className={active === n.id ? 'is-active' : undefined}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header__actions">
            <a href={site.phoneHref} className="header__call" aria-label="Call us">
              <span className="ico-circle"><PhoneIcon /></span>
              <span><small>Need help?</small>{site.phoneDisplay}</span>
            </a>
            <a href="#contact" className="btn btn--primary btn--sm magnetic">
              <span>Plan my trip</span>
              <i className="btn__arrow">→</i>
            </a>
            <button
              className="burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${visible ? ' is-open' : ''}`} id="mobile-menu" hidden={!mounted}>
        <nav aria-label="Mobile">
          {nav.map((n, i) => (
            <a key={n.id} href={n.href} onClick={() => setOpen(false)} style={{ transitionDelay: visible ? `${200 + i * 60}ms` : '0ms' }}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu__foot">
          <a href={site.phoneHref}>{site.phoneDisplay}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </>
  );
}
