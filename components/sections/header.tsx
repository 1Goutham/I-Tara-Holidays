'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { nav, site } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 320);
      setSolid(y > 40);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  useEffect(() => {
    if (!mounted) return setVisible(false);
    const r = requestAnimationFrame(() => setVisible(open));
    return () => cancelAnimationFrame(r);
  }, [mounted, open]);

  return (
    <>
      <header className={`header${solid ? ' is-solid' : ''}${hidden && !open ? ' is-hidden' : ''}${open ? ' is-menu' : ''}`} id="top">
        <div className="header__bar container">
          <a href="#top" className="brand" aria-label={`${site.legalName}, home`}>
            <Image src="/img/mark.png" alt="" width={44} height={44} priority />
            <span className="brand__text">
              <b>I Tara</b>
              <small>{site.tagline}</small>
            </span>
          </a>
          <nav className="nav" aria-label="Primary">
            {nav.map((n) => (
              <a key={n.id} href={n.href} className={active === n.id ? 'is-active' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="header__actions">
            <a href="#contact" className="btn btn--dark btn--sm magnetic">
              <span>Plan a trip</span>
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
              <small>0{i + 1}</small>
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
