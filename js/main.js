/* ═══════════════════════════════════
   UTM PARAMETER HANDLING
═══════════════════════════════════ */
(function handleUTM() {
  var params = new URLSearchParams(window.location.search);
  var keys = ['utm_source', 'utm_medium', 'utm_campaign'];
  keys.forEach(function(key) {
    var val = params.get(key);
    if (val) sessionStorage.setItem(key, val);
  });

  var source = params.get('utm_source') || sessionStorage.getItem('utm_source');
  if (source) {
    if (typeof gtag === 'function') {
      gtag('event', 'utm_source_detected', {
        utm_source: source,
        utm_medium: params.get('utm_medium') || sessionStorage.getItem('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || ''
      });
    }
  }

  if (source === 'happymeal') {
    var hook = document.querySelector('.hero-sub-hook');
    if (hook) hook.textContent = 'You scanned a Happy Meal. Welcome to the real story.';
  }
})();

/* ═══════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver)
═══════════════════════════════════ */
(function initScrollAnimations() {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var elements = document.querySelectorAll('.animate-on-scroll');

  if (prefersReduced) {
    elements.forEach(function(el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var children = entry.target.querySelectorAll('.animate-on-scroll');
        entry.target.classList.add('is-visible');
        children.forEach(function(child, i) {
          setTimeout(function() {
            child.classList.add('is-visible');
          }, i * 100);
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function(el) { observer.observe(el); });
})();

/* ═══════════════════════════════════
   STAT COUNT-UP
═══════════════════════════════════ */
(function initCountUp() {
  var stats = document.querySelectorAll('.stat-number[data-target]');
  if (!stats.length) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-target'), 10);
      observer.unobserve(el);

      if (prefersReduced) {
        el.textContent = target;
        return;
      }

      var start = 0;
      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });

  stats.forEach(function(el) { observer.observe(el); });
})();

/* ═══════════════════════════════════
   SECTION VIEW TRACKING
═══════════════════════════════════ */
(function initSectionTracking() {
  var sections = document.querySelectorAll('section[id], header[id]');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        if (typeof gtag === 'function') {
          gtag('event', 'section_view', { section_id: entry.target.id });
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(function(s) { observer.observe(s); });
})();

/* ═══════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
═══════════════════════════════════ */
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;

  var targetId = link.getAttribute('href');
  if (targetId === '#') return;

  var target = document.querySelector(targetId);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (link.dataset.event && typeof gtag === 'function') {
    gtag('event', link.dataset.event);
  }
});

/* ═══════════════════════════════════
   CTA EVENT TRACKING
═══════════════════════════════════ */
document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-event]');
  if (!btn) return;
  if (btn.getAttribute('href') && btn.getAttribute('href').charAt(0) === '#') return;

  if (typeof gtag === 'function') {
    gtag('event', btn.dataset.event);
  }
});

/* ═══════════════════════════════════
   EXTERNAL LINK TRACKING
═══════════════════════════════════ */
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[target="_blank"]');
  if (!link) return;

  if (typeof gtag === 'function') {
    gtag('event', 'external_link_click', {
      link_url: link.href,
      link_text: link.textContent.trim().substring(0, 50)
    });
  }
});

/* ═══════════════════════════════════
   IMPACT RECEIPT VIEW TRACKING
═══════════════════════════════════ */
(function initReceiptTracking() {
  var receipt = document.querySelector('.receipt-card');
  if (!receipt) return;

  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      if (typeof gtag === 'function') {
        gtag('event', 'receipt_view');
      }
      observer.unobserve(receipt);
    }
  }, { threshold: 0.5 });

  observer.observe(receipt);
})();

/* ═══════════════════════════════════
   EMAIL FORM HANDLING
═══════════════════════════════════ */
(function initEmailForm() {
  var form = document.getElementById('emailForm');
  if (!form) return;

  var errorEl = form.querySelector('.form-error');
  var submitBtn = form.querySelector('.btn-submit');
  var successEl = document.getElementById('formSuccess');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    errorEl.textContent = '';

    var emailInput = form.querySelector('#email-input');
    var email = emailInput.value.trim();

    if (!email || !emailInput.validity.valid) {
      errorEl.textContent = 'Please enter a valid email address.';
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    /*
     * Mailchimp integration placeholder.
     * Replace MAILCHIMP_URL in the form action attribute and
     * uncomment the fetch below when the Mailchimp account is configured.
     *
     * For now, simulate a successful submission after 1 second.
     */
    setTimeout(function() {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      form.hidden = true;
      successEl.hidden = false;

      if (typeof gtag === 'function') {
        gtag('event', 'email_capture_submit', { email_domain: email.split('@')[1] });
      }
    }, 1000);

    /*
    // Real Mailchimp submission:
    var formData = new FormData(form);
    fetch(form.action, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    })
    .then(function() {
      submitBtn.classList.remove('is-loading');
      form.hidden = true;
      successEl.hidden = false;
      if (typeof gtag === 'function') {
        gtag('event', 'email_capture_submit', { email_domain: email.split('@')[1] });
      }
    })
    .catch(function() {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      errorEl.textContent = 'Something went wrong. Try again?';
      if (typeof gtag === 'function') {
        gtag('event', 'email_capture_error');
      }
    });
    */
  });
})();

/* ═══════════════════════════════════
   DONORBOX URL — APPEND UTM PARAMS
═══════════════════════════════════ */
(function appendUTMtoDonorbox() {
  var links = document.querySelectorAll('a[href*="donorbox.org"]');
  if (!links.length) return;

  var source = sessionStorage.getItem('utm_source');
  var medium = sessionStorage.getItem('utm_medium');
  var campaign = sessionStorage.getItem('utm_campaign');

  if (!source) return;

  links.forEach(function(link) {
    var url = new URL(link.href);
    if (source) url.searchParams.set('utm_source', source);
    if (medium) url.searchParams.set('utm_medium', medium);
    if (campaign) url.searchParams.set('utm_campaign', campaign);
    link.href = url.toString();
  });
})();
