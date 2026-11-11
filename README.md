# I Tara — A Holiday Company (website)

A static site with no build step. Upload this folder to any host (Netlify, Vercel, cPanel, S3, and so on).

## Before going live
- **Phone, email and WhatsApp** are placeholders: `+91 00000 00000`, `hello@itaraholidays.com`, `wa.me/910000000000`.
  Search and replace them in `index.html`, then set `contactEmail` in `assets/js/main.js`.
- **Enquiry form**: set `CONFIG.formEndpoint` in `assets/js/main.js` to a Formspree, Getform or your own API URL.
  If it is left empty, the forms open the visitor's email app with the enquiry filled in.
- **Domain**: update `canonical`, `og:*` and the JSON-LD block in the `<head>` of `index.html`.
- **Photos** are hotlinked from Unsplash. For production, swap in your own licensed images.
- **Packages and destinations** are edited in `assets/js/data.js`; the page renders them automatically.
- **Social links** in the footer currently point to `#`.

## Preview locally
```bash
python3 -m http.server 8000
```
