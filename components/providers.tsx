'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export interface EnquiryState {
  name: string;
  phone: string;
  email: string;
  destination: string;
  date: string;
  message: string;
  consent: boolean;
}

export const emptyEnquiry: EnquiryState = { name: '', phone: '', email: '', destination: '', date: '', message: '', consent: false };

interface Ctx {
  ready: boolean;
  setReady: (v: boolean) => void;
  toast: (msg: string, error?: boolean) => void;
  toastState: { msg: string; error: boolean; show: boolean };
  enquiry: EnquiryState;
  setEnquiry: React.Dispatch<React.SetStateAction<EnquiryState>>;
  /** Prefill the enquiry form. Message is only set if empty unless `force` is true. */
  prefill: (p: Partial<EnquiryState>, force?: boolean) => void;
}

const SiteContext = createContext<Ctx | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <Providers>');
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [toastState, setToastState] = useState({ msg: '', error: false, show: false });
  const [enquiry, setEnquiry] = useState<EnquiryState>(emptyEnquiry);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((msg: string, error = false) => {
    setToastState({ msg, error, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastState((t) => ({ ...t, show: false })), 3600);
  }, []);

  const prefill = useCallback((p: Partial<EnquiryState>, force = false) => {
    setEnquiry((s) => ({
      ...s,
      ...p,
      message: p.message !== undefined && (force || !s.message) ? p.message : s.message,
    }));
  }, []);

  const value = useMemo(
    () => ({ ready, setReady, toast, toastState, enquiry, setEnquiry, prefill }),
    [ready, toast, toastState, enquiry, prefill],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
