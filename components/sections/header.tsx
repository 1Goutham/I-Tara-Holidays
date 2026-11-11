'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { nav, site } from '@/lib/site';
import { getLenis, gsap, ScrollTrigger } from '@/lib/gsap';

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState('');

  // Hide on scroll down, show on scroll up.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        const y = s.scroll();
        setSolid(y > 60);
        setHidden(s.direction === 1 && y > 400);
      },
    });
    return () => st.kill();
  }, []);

  // Light text while a dark section sits under the header line (explicit ranges, no hit-testing).
  useEffect(() => {
    const over = new Set<Element>();
    const triggers = Array.from(document.querySelectorAll('[data-theme="dark"]')).map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 41px',
        end: 'bottom 41px',
        onToggle: (s) => {
          if (s.isActive) over.add(el);
          else over.delete(el);
          setDark(over.size > 0);
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  // Active nav item
  useEffect(() => {
    const sections = nav.map((n) =>
      ScrollTrigger.create({
        trigger: `#${n.id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => s.isActive && setActive(n.id),
        onLeaveBack: () => n.id === nav[0].id && setActive(''),
      }),
    );
    return () => sections.forEach((s) => s.kill());
  }, []);

  // Mobile menu
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      gsap.fromTo('.mmenu', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' });
      gsap.fromTo('.mmenu__link', { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.06, delay: 0.35 });
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
    lenis?.start();
  }, [open]);

  const close = () => {
    gsap.to('.mmenu', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut', onComplete: () => setOpen(false) });
  };

  return (
    <>
      <header className={`header${solid ? ' is-solid' : ''}${hidden && !open ? ' is-hidden' : ''}${dark && !open ? ' is-dark' : ''}`} id="top">
        <div className="header__bar">
          <a href="#top" className="brand" aria-label={`${site.legalName}, home`}>
            <Image src="/img/logo-nav.webp" alt="" width={420} height={382} priority sizes="96px" className="brand__dark" />
            <Image src="/img/logo-nav-light.webp" alt="" width={420} height={382} priority sizes="96px" className="brand__light" />
          </a>
          <nav className="nav" aria-label="Primary">
            {nav.map((n) => (
              <a key={n.id} href={n.href} className={active === n.id ? 'is-active' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="header__actions">
            <a href={site.phoneHref} className="header__phone">{site.phoneDisplay}</a>
            <a href="#contact" className="btn btn--sm magnetic"><span>Plan a journey</span></a>
            <button
              className="burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mmenu"
              onClick={() => (open ? close() : setOpen(true))}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mmenu" id="mmenu" data-theme="dark">
          <nav aria-label="Mobile">
            {nav.map((n, i) => (
              <a key={n.id} href={n.href} onClick={close} className="mmenu__item">
                <span className="mmenu__link"><small>0{i + 1}</small>{n.label}</span>
              </a>
            ))}
          </nav>
          <div className="mmenu__foot">
            <a href={site.phoneHref}>{site.phoneDisplay}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      )}
    </>
  );
}
