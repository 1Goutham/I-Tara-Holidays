/* I Tara — content data. Edit packages & destinations here; the page renders them automatically. */
(function () {
  var U = function (id, w) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 800) + '&q=70';
  };

  window.ITARA_PACKAGES = [
    { title: 'Kashmir — Paradise on Earth', place: 'Srinagar · Gulmarg · Pahalgam', days: '6N / 7D', price: 32999, was: 38999, rating: 4.9, reviews: 1240, tag: 'Bestseller', cat: ['india', 'honeymoon'], img: U('1595815771614-ade9d652a65d'), perks: ['Houseboat stay', 'Shikara ride', 'Gondola'] },
    { title: 'Kerala Backwaters & Hills', place: 'Munnar · Thekkady · Alleppey', days: '5N / 6D', price: 24999, was: 29999, rating: 4.8, reviews: 980, tag: 'Popular', cat: ['india', 'honeymoon'], img: U('1593693397690-362cb9666fc2'), perks: ['Private houseboat', 'Tea estates', 'Ayurveda'] },
    { title: 'Royal Rajasthan', place: 'Jaipur · Udaipur · Jodhpur', days: '7N / 8D', price: 38499, was: 44999, rating: 4.8, reviews: 760, tag: 'Heritage', cat: ['india'], img: U('1477587458883-47145ed94245'), perks: ['Palace hotels', 'Desert camp', 'City tours'] },
    { title: 'Ladakh Road Expedition', place: 'Leh · Nubra · Pangong', days: '6N / 7D', price: 35999, was: 41999, rating: 4.9, reviews: 610, tag: 'Adventure', cat: ['india'], img: U('1581793745862-99fde7fa73d2'), perks: ['Khardung La', 'Lake camps', 'Oxygen support'] },
    { title: 'Maldives Overwater Bliss', place: 'North Malé Atoll', days: '4N / 5D', price: 89999, was: 104999, rating: 4.9, reviews: 540, tag: 'Luxury', cat: ['world', 'honeymoon'], img: U('1573843981267-be1999ff37cd'), perks: ['Water villa', 'Seaplane', 'All meals'] },
    { title: 'Bali Blissful Escape', place: 'Ubud · Seminyak · Nusa Penida', days: '6N / 7D', price: 54999, was: 62999, rating: 4.8, reviews: 1120, tag: 'Trending', cat: ['world', 'honeymoon'], img: U('1537996194471-e657df975ab4'), perks: ['Pool villa', 'Island hop', 'Swing & rice fields'] },
    { title: 'Dubai Dazzle', place: 'Dubai · Abu Dhabi', days: '4N / 5D', price: 46999, was: 52999, rating: 4.7, reviews: 1430, tag: 'Family pick', cat: ['world'], img: U('1512453979798-5ea266f8880c'), perks: ['Burj Khalifa', 'Desert safari', 'Visa included'] },
    { title: 'Swiss Alps & Paris', place: 'Lucerne · Interlaken · Paris', days: '9N / 10D', price: 189999, was: 214999, rating: 4.9, reviews: 420, tag: 'Signature', cat: ['world', 'honeymoon'], img: U('1527668752968-14dc70a27c95'), perks: ['Jungfraujoch', 'Swiss pass', 'Seine cruise'] }
  ];

  window.ITARA_DESTINATIONS = [
    { name: 'Kashmir', region: 'India', from: 32999, img: U('1595815771614-ade9d652a65d', 700) },
    { name: 'Kerala', region: 'India', from: 24999, img: U('1602216056096-3b40cc0c9944', 700) },
    { name: 'Rajasthan', region: 'India', from: 28999, img: U('1599661046289-e31897846e41', 700) },
    { name: 'Maldives', region: 'Indian Ocean', from: 89999, img: U('1514282401047-d79a71a590e8', 700) },
    { name: 'Thailand', region: 'Southeast Asia', from: 39999, img: U('1552465011-b4e21bf6e79a', 700) },
    { name: 'Bhutan', region: 'Himalayas', from: 49999, img: U('1553856622-d1b352e9a211', 700) },
    { name: 'Santorini', region: 'Greece', from: 149999, img: U('1570077188670-e3a8d69ac5ff', 700) },
    { name: 'Vietnam', region: 'Southeast Asia', from: 59999, img: U('1528127269322-539801943592', 700) },
    { name: 'Paris', region: 'France', from: 129999, img: U('1502602898657-3e91760cbb34', 700) },
    { name: 'Singapore', region: 'Southeast Asia', from: 52999, img: U('1525625293386-3f8f99389edd', 700) }
  ];
})();
