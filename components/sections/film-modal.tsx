'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSite } from '../providers';

export function ModalTrigger({ id, children, ...rest }: { id: string; children: ReactNode; className?: string; 'aria-label'?: string }) {
  const { setModal } = useSite();
  return (
    <button type="button" {...rest} onClick={() => setModal(id)}>
      {children}
    </button>
  );
}

export function FilmModal() {
  const { modal, setModal } = useSite();
  const open = modal === 'film';
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      setMounted(true);
      document.body.style.overflow = 'hidden';
      const r = requestAnimationFrame(() => {
        setVisible(true);
        closeBtn.current?.focus();
      });
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setModal(null);
      document.addEventListener('keydown', onKey);
      return () => {
        cancelAnimationFrame(r);
        document.removeEventListener('keydown', onKey);
      };
    }
    setVisible(false);
    document.body.style.overflow = '';
    (lastFocus.current as HTMLElement | null)?.focus?.();
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
  }, [open, setModal]);

  if (!mounted) return null;
  return (
    <div
      className={`modal${visible ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Our story"
      onClick={(e) => e.target === e.currentTarget && setModal(null)}
    >
      <div className="modal__box">
        <button ref={closeBtn} className="modal__close" aria-label="Close" onClick={() => setModal(null)}>×</button>
        <div className="modal__frame">
          <Image src="/img/logo.webp" alt="" width={180} height={164} />
          <p>Our brand film is coming soon.<br />For now, let us plan a story of your own.</p>
          <a href="#contact" className="btn btn--primary" onClick={() => setModal(null)}>
            <span>Start planning</span>
            <i className="btn__arrow">→</i>
          </a>
        </div>
      </div>
    </div>
  );
}
