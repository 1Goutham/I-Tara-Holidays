/* I Tara — interactions */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIG — set a form endpoint (e.g. Formspree, Getform, your API)
     to receive enquiries. Left empty, forms fall back to opening the
     visitor's email client pre-filled to CONTACT_EMAIL.
     --------------------------------------------------------- */
  var CONFIG = {
    formEndpoint: '',
    contactEmail: 'hello@itaraholidays.com'
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var inr = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Broken image fallback (parents carry brand gradients) ---------- */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG') t.classList.add('is-broken');
  }, true);

  /* ---------- Render packages ---------- */
  var heart = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1.2 8.4 3.3 5 6.8 5c2 0 3.4 1.1 4.2 2.4h2C13.8 6.1 15.2 5 17.2 5c3.5 0 5.6 3.4 4.3 6.7C19.5 16.4 12 21 12 21Z"/></svg>';
  var pin = '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var favs = store.get('itara:favs') || [];

  var grid = $('#pkg-grid');
  if (grid && window.ITARA_PACKAGES) {
    grid.innerHTML = window.ITARA_PACKAGES.map(function (p, i) {
      var on = favs.indexOf(p.title) > -1;
      return '<article class="pkg reveal" data-cat="' + p.cat.join(' ') + '" style="--d:' + (i % 4) * 90 + 'ms">' +
        '<div class="pkg__media"><img src="' + p.img + '" alt="' + p.title + '" loading="lazy" />' +
        '<span class="pkg__tag">' + p.tag + '</span>' +
        '<button class="pkg__fav' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" aria-label="Save ' + p.title + '" data-fav="' + p.title + '">' + heart + '</button>' +
        '<span class="pkg__days">' + p.days + '</span></div>' +
        '<div class="pkg__body">' +
        '<div class="pkg__meta"><span>' + p.place + '</span><span class="pkg__rating"><i>★</i> ' + p.rating + ' <small>(' + p.reviews.toLocaleString('en-IN') + ')</small></span></div>' +
        '<h3>' + p.title + '</h3>' +
        '<ul class="pkg__perks">' + p.perks.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
        '<div class="pkg__foot"><div class="pkg__price"><small>Starting from / person</small><s>' + inr(p.was) + '</s><b>' + inr(p.price) + '</b></div>' +
        '<a href="#contact" class="pkg__go" data-enquire="' + p.title + '" aria-label="Enquire about ' + p.title + '">→</a></div>' +
        '</div></article>';
    }).join('');
  }

  /* ---------- Render destinations ---------- */
  var track = $('#dest-track');
  if (track && window.ITARA_DESTINATIONS) {
    track.innerHTML = window.ITARA_DESTINATIONS.map(function (d, i) {
      return '<a href="#contact" class="dcard reveal" style="--d:' + Math.min(i, 4) * 90 + 'ms" data-enquire="' + d.name + '" draggable="false">' +
        '<img src="' + d.img + '" alt="' + d.name + ', ' + d.region + '" loading="lazy" draggable="false" />' +
        '<span class="dcard__price">from <b>' + inr(d.from) + '</b></span>' +
        '<div class="dcard__body"><small>' + pin + ' ' + d.region + '</small><h3>' + d.name + '</h3>' +
        '<span class="dcard__cta">Plan this trip →</span></div></a>';
    }).join('');
  }

  /* ---------- Split text into words ---------- */
  var wordIndex = 0;
  function splitNode(node, parent) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var i = document.createElement('i'); i.textContent = part; i.style.setProperty('--i', wordIndex++);
          w.appendChild(i); frag.appendChild(w);
        });
        child.parentNode.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitNode(child);
      }
    });
  }
  $$('.split').forEach(function (el) {
    if (!el.previousElementSibling || !el.previousElementSibling.classList.contains('split')) wordIndex = 0;
    splitNode(el);
  });

  /* ---------- Reveal on scroll ---------- */
  $$('[data-delay]').forEach(function (el) { el.style.setProperty('--d', el.dataset.delay + 'ms'); });

  var io = null;
  function startReveals() {
    var targets = $$('.reveal, .split');
    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          el.classList.add('is-in');
          io.unobserve(el);
          // hand control back to hover transitions once the reveal has played
          if (el.classList.contains('reveal') && !el.classList.contains('reveal--clip')) {
            setTimeout(function () { el.classList.remove('reveal', 'reveal--right', 'is-in'); }, 1300 + (parseInt(getComputedStyle(el).getPropertyValue('--d'), 10) || 0));
          }
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || 0, 10);
    var suffix = el.dataset.suffix || '';
    var fmt = function (v) {
      return (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suffix;
    };
    if (reduce) { el.textContent = fmt(target); return; }
    var dur = 2000, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  } else {
    $$('[data-count]').forEach(animateCount);
  }

  /* ---------- Preloader ---------- */
  var preloader = $('.preloader');
  var released = false;
  function release() {
    if (released) return;
    released = true;
    if (preloader) preloader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    setTimeout(startReveals, reduce ? 0 : 350);
  }
  window.addEventListener('load', function () { setTimeout(release, reduce ? 0 : 900); });
  setTimeout(release, 3200); // never block on slow images

  /* ---------- Scroll: header, progress, parallax ---------- */
  var header = $('.header');
  var progress = $('.progress');
  var parallax = $$('[data-parallax]');
  var lastY = window.scrollY, ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    document.body.classList.toggle('is-scrolled', y > 400);
    if (header && !document.body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > 300);
    }
    lastY = y;
    if (!reduce) {
      parallax.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var speed = parseFloat(el.dataset.parallax);
        var offset = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) nio.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      $$('nav a', menu).forEach(function (a, i) { a.style.transitionDelay = (200 + i * 60) + 'ms'; });
    } else {
      menu.classList.remove('is-open');
      $$('nav a', menu).forEach(function (a) { a.style.transitionDelay = '0ms'; });
      setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 800);
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* ---------- Sliding pill tabs ---------- */
  function pillTabs(wrap, pillSel, onChange) {
    if (!wrap) return;
    var pill = $(pillSel, wrap);
    var btns = $$('button', wrap);
    function move(btn) {
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
        b.classList.add('is-active'); b.setAttribute('aria-selected', 'true');
        move(b);
        if (onChange) onChange(b);
      });
    });
    var sync = function () { var a = $('.is-active', wrap); if (a) move(a); };
    window.addEventListener('resize', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
    sync();
  }

  var tripType = 'Holiday';
  pillTabs($('.search__tabs'), '.search__pill', function (b) { tripType = b.dataset.type; });

  pillTabs($('.filters'), '.filters__pill', function (b) {
    var f = b.dataset.filter;
    var cards = $$('.pkg', grid);
    cards.forEach(function (c) { c.classList.add('is-out'); });
    setTimeout(function () {
      cards.forEach(function (c, i) {
        var show = f === 'all' || c.dataset.cat.split(' ').indexOf(f) > -1;
        c.style.display = show ? '' : 'none';
        c.classList.add('is-in');
      });
      requestAnimationFrame(function () {
        cards.forEach(function (c) { c.classList.remove('is-out'); });
      });
    }, reduce ? 0 : 320);
  });

  /* ---------- Favourites ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault();
    var t = b.dataset.fav, i = favs.indexOf(t);
    if (i > -1) favs.splice(i, 1); else favs.push(t);
    var on = i === -1;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
    store.set('itara:favs', favs);
    toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
  });

  /* ---------- Enquire shortcuts prefill the form ---------- */
  var enquiry = $('#enquiry');
  function prefill(dest, msg) {
    if (!enquiry) return;
    if (dest) enquiry.destination.value = dest;
    if (msg && !enquiry.message.value) enquiry.message.value = msg;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-enquire]');
    if (!a) return;
    if (track && track.dataset.dragged === '1') { e.preventDefault(); return; }
    prefill(a.dataset.enquire, 'I\'m interested in ' + a.dataset.enquire + '. Please share an itinerary and quote.');
  });

  /* ---------- Destinations: drag + arrows ---------- */
  if (track) {
    var down = false, startX = 0, startScroll = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startScroll = track.scrollLeft;
      track.dataset.dragged = '0';
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) { track.classList.add('is-drag'); track.dataset.dragged = '1'; }
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; track.classList.remove('is-drag');
      setTimeout(function () { track.dataset.dragged = '0'; }, 50);
    });
    $$('.dest__ctrl .arrow').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.dcard', track);
        var step = card ? card.offsetWidth + 22 : 300;
        track.scrollBy({ left: step * parseInt(b.dataset.dir, 10) * (window.innerWidth > 900 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') track.scrollBy({ left: 300, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') track.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }

  /* ---------- Accordion ---------- */
  $$('.acc__head').forEach(function (h) {
    h.addEventListener('click', function () {
      var item = h.parentElement;
      var open = !item.classList.contains('is-open');
      $$('.acc').forEach(function (a) { a.classList.remove('is-open'); $('.acc__head', a).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Testimonials ---------- */
  var quotes = $$('.quote');
  var dotsWrap = $('.quotes__dots');
  var qi = 0, qTimer = null;
  if (quotes.length && dotsWrap) {
    quotes.forEach(function (_, i) {
      var d = document.createElement('button');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Story ' + (i + 1));
      d.addEventListener('click', function () { showQuote(i); restart(); });
      dotsWrap.appendChild(d);
    });
    var dots = $$('button', dotsWrap);
    var showQuote = function (i) {
      qi = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, k) { q.classList.toggle('is-active', k === qi); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === qi); d.setAttribute('aria-selected', k === qi); });
    };
    var restart = function () {
      clearInterval(qTimer);
      if (!reduce) qTimer = setInterval(function () { showQuote(qi + 1); }, 6500);
    };
    $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { showQuote(qi + parseInt(b.dataset.q, 10)); restart(); }); });
    var qWrap = $('#quotes');
    qWrap.addEventListener('mouseenter', function () { clearInterval(qTimer); });
    qWrap.addEventListener('mouseleave', restart);
    showQuote(0); restart();
  }

  /* ---------- Marquee (duplicate for seamless loop) ---------- */
  $$('.marquee__row').forEach(function (row) { row.innerHTML += row.innerHTML; });

  /* ---------- Tilt cards ---------- */
  if (finePointer && !reduce) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Custom cursor ---------- */
  var cursor = $('.cursor');
  if (cursor && finePointer && !reduce) {
    var cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .dcard, .pkg, .style-card, input, select, textarea, label'));
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- Modal ---------- */
  var lastFocus = null;
  function openModal(m) {
    lastFocus = document.activeElement;
    m.hidden = false;
    requestAnimationFrame(function () { m.classList.add('is-open'); });
    $('.modal__close', m).focus();
    document.body.style.overflow = 'hidden';
  }
  function closeModal(m) {
    m.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { m.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-modal]').forEach(function (b) {
    b.addEventListener('click', function () { var m = document.getElementById(b.dataset.modal); if (m) openModal(m); });
  });
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('.modal__close') || e.target.closest('[data-close]')) closeModal(m);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) closeModal(m); });
  });

  /* ---------- Toast ---------- */
  var toastEl = $('.toast'), toastT;
  function toast(msg, isError) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 3600);
  }

  /* ---------- Forms ---------- */
  function submitData(subject, data) {
    if (CONFIG.formEndpoint) {
      return fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: subject }, data))
      }).then(function (r) { if (!r.ok) throw new Error('Network'); return r; });
    }
    var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
    window.location.href = 'mailto:' + CONFIG.contactEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return Promise.resolve();
  }
  function formData(form) {
    var out = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.type === 'checkbox') return;
      if (el.value.trim()) out[el.name] = el.value.trim();
    });
    return out;
  }

  // Trip search → prefill enquiry and scroll to it
  var search = $('#trip-search');
  if (search) {
    search.addEventListener('submit', function (e) {
      e.preventDefault();
      var dest = search.destination;
      var field = dest.closest('.field');
      if (!dest.value.trim()) {
        field.classList.add('is-invalid'); dest.focus();
        toast('Tell us where you would like to go', true);
        return;
      }
      field.classList.remove('is-invalid');
      var monthText = search.month.value ? new Date(search.month.value + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' }) : 'flexible dates';
      prefill(dest.value.trim());
      if (enquiry && search.month.value) enquiry.date.value = search.month.value;
      if (enquiry) enquiry.message.value = tripType + ' to ' + dest.value.trim() + ' · ' + search.travellers.value + ' · ' + monthText + ' · Budget: ' + search.budget.value + '.';
      $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { enquiry && enquiry.name.focus({ preventScroll: true }); }, 900);
      toast('Great choice! Add your details and we will plan it.');
    });
    search.destination.addEventListener('input', function () { this.closest('.field').classList.remove('is-invalid'); });
  }

  // Enquiry
  if (enquiry) {
    var validate = function (el) {
      var wrap = el.closest('.ffield, .check');
      var ok = el.checkValidity() && (el.type === 'checkbox' || !el.required || el.value.trim() !== '');
      if (wrap) wrap.classList.toggle('is-invalid', !ok);
      return ok;
    };
    $$('[required]', enquiry).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') validate(el); });
      el.addEventListener('input', function () { var w = el.closest('.ffield, .check'); if (w && w.classList.contains('is-invalid')) validate(el); });
      el.addEventListener('change', function () { validate(el); });
    });
    enquiry.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = $$('[required]', enquiry).filter(function (el) { return !validate(el); });
      if (invalid.length) {
        invalid[0].focus();
        toast('Please complete the highlighted fields', true);
        return;
      }
      var btn = $('button[type="submit"]', enquiry);
      btn.classList.add('is-loading'); $('span', btn).textContent = 'Sending';
      submitData('New holiday enquiry — ' + (enquiry.destination.value || 'General'), formData(enquiry))
        .then(function () {
          enquiry.reset();
          toast('Thank you! A travel expert will contact you shortly.');
        })
        .catch(function () { toast('Something went wrong. Please call or WhatsApp us.', true); })
        .then(function () { btn.classList.remove('is-loading'); $('span', btn).textContent = 'Send enquiry'; });
    });
  }

  // Newsletter
  var news = $('#newsletter');
  if (news) {
    news.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!news.email.checkValidity() || !news.email.value) { toast('Please enter a valid email', true); news.email.focus(); return; }
      var p = CONFIG.formEndpoint ? submitData('Newsletter signup', { email: news.email.value }) : Promise.resolve();
      p.then(function () { news.reset(); toast('You are subscribed. Welcome aboard!'); })
        .catch(function () { toast('Could not subscribe right now. Please try again.', true); });
    });
  }

  /* ---------- Misc ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
