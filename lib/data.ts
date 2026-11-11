/* Content data — edit packages, destinations, styles and testimonials here. */
export const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export type Category = 'india' | 'world' | 'honeymoon';

export interface Package {
  title: string;
  place: string;
  days: string;
  price: number;
  was: number;
  rating: number;
  reviews: number;
  tag: string;
  cat: Category[];
  img: string;
  perks: string[];
}

export const packages: Package[] = [
  { title: 'Kashmir — Paradise on Earth', place: 'Srinagar · Gulmarg · Pahalgam', days: '6N / 7D', price: 32999, was: 38999, rating: 4.9, reviews: 1240, tag: 'Bestseller', cat: ['india', 'honeymoon'], img: unsplash('1595815771614-ade9d652a65d'), perks: ['Houseboat stay', 'Shikara ride', 'Gondola'] },
  { title: 'Kerala Backwaters & Hills', place: 'Munnar · Thekkady · Alleppey', days: '5N / 6D', price: 24999, was: 29999, rating: 4.8, reviews: 980, tag: 'Popular', cat: ['india', 'honeymoon'], img: unsplash('1593693397690-362cb9666fc2'), perks: ['Private houseboat', 'Tea estates', 'Ayurveda'] },
  { title: 'Royal Rajasthan', place: 'Jaipur · Udaipur · Jodhpur', days: '7N / 8D', price: 38499, was: 44999, rating: 4.8, reviews: 760, tag: 'Heritage', cat: ['india'], img: unsplash('1477587458883-47145ed94245'), perks: ['Palace hotels', 'Desert camp', 'City tours'] },
  { title: 'Ladakh Road Expedition', place: 'Leh · Nubra · Pangong', days: '6N / 7D', price: 35999, was: 41999, rating: 4.9, reviews: 610, tag: 'Adventure', cat: ['india'], img: unsplash('1581793745862-99fde7fa73d2'), perks: ['Khardung La', 'Lake camps', 'Oxygen support'] },
  { title: 'Maldives Overwater Bliss', place: 'North Malé Atoll', days: '4N / 5D', price: 89999, was: 104999, rating: 4.9, reviews: 540, tag: 'Luxury', cat: ['world', 'honeymoon'], img: unsplash('1573843981267-be1999ff37cd'), perks: ['Water villa', 'Seaplane', 'All meals'] },
  { title: 'Bali Blissful Escape', place: 'Ubud · Seminyak · Nusa Penida', days: '6N / 7D', price: 54999, was: 62999, rating: 4.8, reviews: 1120, tag: 'Trending', cat: ['world', 'honeymoon'], img: unsplash('1537996194471-e657df975ab4'), perks: ['Pool villa', 'Island hop', 'Swing & rice fields'] },
  { title: 'Dubai Dazzle', place: 'Dubai · Abu Dhabi', days: '4N / 5D', price: 46999, was: 52999, rating: 4.7, reviews: 1430, tag: 'Family pick', cat: ['world'], img: unsplash('1512453979798-5ea266f8880c'), perks: ['Burj Khalifa', 'Desert safari', 'Visa included'] },
  { title: 'Swiss Alps & Paris', place: 'Lucerne · Interlaken · Paris', days: '9N / 10D', price: 189999, was: 214999, rating: 4.9, reviews: 420, tag: 'Signature', cat: ['world', 'honeymoon'], img: unsplash('1527668752968-14dc70a27c95'), perks: ['Jungfraujoch', 'Swiss pass', 'Seine cruise'] },
];

export const destinations = [
  { name: 'Kashmir', region: 'India', from: 32999, img: unsplash('1595815771614-ade9d652a65d') },
  { name: 'Kerala', region: 'India', from: 24999, img: unsplash('1602216056096-3b40cc0c9944') },
  { name: 'Rajasthan', region: 'India', from: 28999, img: unsplash('1599661046289-e31897846e41') },
  { name: 'Maldives', region: 'Indian Ocean', from: 89999, img: unsplash('1514282401047-d79a71a590e8') },
  { name: 'Thailand', region: 'Southeast Asia', from: 39999, img: unsplash('1552465011-b4e21bf6e79a') },
  { name: 'Bhutan', region: 'Himalayas', from: 49999, img: unsplash('1553856622-d1b352e9a211') },
  { name: 'Santorini', region: 'Greece', from: 149999, img: unsplash('1570077188670-e3a8d69ac5ff') },
  { name: 'Vietnam', region: 'Southeast Asia', from: 59999, img: unsplash('1528127269322-539801943592') },
  { name: 'Paris', region: 'France', from: 129999, img: unsplash('1502602898657-3e91760cbb34') },
  { name: 'Singapore', region: 'Southeast Asia', from: 52999, img: unsplash('1525625293386-3f8f99389edd') },
];

export const travelStyles = [
  { title: 'Luxury Retreats', text: 'Overwater villas, palace hotels and private chefs.', img: unsplash('1540541338287-41700207dee6') },
  { title: 'Honeymoons', text: 'Candlelit dinners, sunset cruises and surprise upgrades.', img: unsplash('1514282401047-d79a71a590e8') },
  { title: 'Spiritual Journeys', text: 'Char Dham, Kailash, Bhutan and other sacred trails, made easy.', img: unsplash('1553856622-d1b352e9a211') },
  { title: 'Adventure', text: 'Ladakh road trips, Himalayan treks and scuba dives.', img: unsplash('1464822759023-fed622ff2c3b') },
  { title: 'Family & Groups', text: 'Kid-friendly pacing, fixed departures and plenty of room.', img: unsplash('1539635278303-d4002c07eae3') },
  { title: 'Wellness & Slow Travel', text: 'Ayurveda retreats, yoga mornings and digital detox.', img: unsplash('1544551763-46a013bb70d5') },
];

export const services = [
  { title: 'Custom itinerary planning', text: 'Tell us how you like to travel and we will design a day-by-day plan, changing it as many times as you need until it feels right.' },
  { title: 'Flights, hotels & transfers', text: 'Best-fare flights, hotels we have vetted and private chauffeured transfers, all managed from one place.' },
  { title: 'Visa & travel documentation', text: 'Help with visa applications, documents and appointments for 40+ countries, plus forex and travel insurance.' },
  { title: 'Group & fixed departures', text: 'Escorted group tours with a tour manager, Indian meals and carefully planned sightseeing, all at great group rates.' },
  { title: 'Corporate, MICE & weddings', text: 'Offsites, incentive trips, conferences and destination weddings, run end to end by a dedicated events team.' },
];

export const steps = [
  { title: 'Share your dream', text: 'Tell us where you want to go, when, and the kind of trip you have in mind.' },
  { title: 'Get a tailored plan', text: 'Within 24 hours a specialist sends a clear, fully priced itinerary.' },
  { title: 'Refine & confirm', text: 'Adjust anything you like, then lock in your trip with secure payment.' },
  { title: 'Travel worry-free', text: 'Enjoy the trip while we keep an eye on everything, around the clock.' },
];

export const testimonials = [
  { quote: 'Our Kashmir honeymoon was magical. The houseboat, the shikara at sunrise, even a cake waiting in our room. I Tara thought of things we never would have.', name: 'Ananya & Rohit', initials: 'AR', trip: 'Kashmir Honeymoon · 6N/7D' },
  { quote: 'I took my parents on the Char Dham Yatra and was nervous about the logistics. The team handled everything, helicopters included. My parents still talk about it.', name: 'Suresh Kumar', initials: 'SK', trip: 'Char Dham Yatra · Family' },
  { quote: 'Twelve days in Switzerland and Paris with two kids, and nothing went wrong. Hotels, trains and the Jungfrau tickets were all ready. Our travel manager answered within minutes, every time.', name: 'Meera Pillai', initials: 'MP', trip: 'Europe Family Tour · 11N/12D' },
];

export const gallery = [
  '1570077188670-e3a8d69ac5ff',
  '1524492412937-b28074a5d7da',
  '1528127269322-539801943592',
  '1530866495561-507c9faab2ed',
  '1599661046289-e31897846e41',
  '1531366936337-7c912a4589a7',
  '1519046904884-53103b34b206',
].map(unsplash);

export const destinationOptions = ['Kashmir', 'Kerala', 'Ladakh', 'Rajasthan', 'Goa', 'Andaman', 'Bali', 'Maldives', 'Dubai', 'Thailand', 'Singapore', 'Switzerland', 'Bhutan', 'Vietnam'];
