/** Brand & contact details. Phone / email / WhatsApp are placeholders — replace before launch. */
export const site = {
  name: 'I Tara',
  legalName: 'I Tara — A Holiday Company',
  tagline: 'A Holiday Company',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.itaraholidays.com',
  description:
    'I Tara is a premium holiday company crafting handpicked domestic and international tour packages, honeymoons, pilgrimages, group departures and fully customised journeys.',
  phoneDisplay: '+91 00000 00000',
  phoneHref: 'tel:+910000000000',
  email: 'hello@itaraholidays.com',
  whatsapp: '910000000000',
  hours: 'Mon–Sat, 9:30am – 7:30pm IST',
  socials: {
    instagram: '#',
    facebook: '#',
    youtube: '#',
    linkedin: '#',
  },
} as const;

export const nav = [
  { href: '#packages', label: 'Packages', id: 'packages' },
  { href: '#destinations', label: 'Destinations', id: 'destinations' },
  { href: '#styles', label: 'Experiences', id: 'styles' },
  { href: '#services', label: 'Services', id: 'services' },
  { href: '#stories', label: 'Stories', id: 'stories' },
  { href: '#contact', label: 'Contact', id: 'contact' },
] as const;

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
