(function () {
  'use strict';
  var A = window.__app || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ----- persistent color theme -----
  var themeToggle = $('[data-theme-toggle]');
  var themeToggleLabel = $('[data-theme-toggle-label]');
  function applyTheme(theme) {
    var dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (!themeToggle) return;
    themeToggle.checked = dark;
    var label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.setAttribute('aria-label', label);
    if (themeToggleLabel) themeToggleLabel.title = label;
  }
  if (themeToggle) {
    applyTheme(document.documentElement.dataset.theme);
    themeToggle.addEventListener('change', function () {
      var theme = themeToggle.checked ? 'dark' : 'light';
      applyTheme(theme);
      try { localStorage.setItem('pfm-theme', theme); }
      catch (error) { console.error('Theme changed, but the preference could not be saved.', error); }
    });
  }

  // ----- toasts -----
  window.toast = function (msg, type) {
    var box = $('#toasts'); if (!box) return;
    var t = document.createElement('div'); t.className = 'toast ' + (type || 'success');
    t.setAttribute('role', 'status'); t.textContent = msg; box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 320); }, type === 'error' ? 7000 : 4500);
  };
  (A.flash || []).forEach(function (f) { toast(f.msg, f.type); });

  // ----- modals -----
  // Opening a modal from an "Add" button must clear leftovers from an earlier "Edit" (hidden id, title).
  function prepModal(id) { var m = document.getElementById(id); if (!m) return; var f = $('form', m); if (f) { f.reset(); var h = $('input[type=hidden][name=id]', f); if (h) h.value = ''; } $$('[data-title]', m).forEach(function (t) { if (t.dataset.orig) t.textContent = t.dataset.orig; }); }
  window.openModal = function (id) { var m = document.getElementById(id); if (!m) return; m.hidden = false; document.body.style.overflow = 'hidden'; var f = $('input:not([type=hidden]),select,textarea', m); if (f && !('ontouchstart' in window)) setTimeout(function () { f.focus(); }, 40); };
  window.closeModal = function (m) { m.hidden = true; if (!$$('.modal:not([hidden])').length) document.body.style.overflow = ''; };
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-modal-open]'); if (o) { e.preventDefault(); prepModal(o.getAttribute('data-modal-open')); openModal(o.getAttribute('data-modal-open')); return; }
    var c = e.target.closest('[data-modal-close]'); if (c) { closeModal(c.closest('.modal')); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.modal:not([hidden])').forEach(closeModal); });
  if (A.openModal) openModal(A.openModal);

  // ----- confirm dialog for forms/buttons with data-confirm -----
  var pendingForm = null;
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.dataset.confirmed === '1') return;
    var msg = f.getAttribute('data-confirm');
    if (msg) {
      e.preventDefault(); pendingForm = f;
      $('#confirm-text').textContent = msg;
      $('#confirm-title').textContent = f.getAttribute('data-confirm-title') || 'Please confirm';
      $('#confirm-ok').textContent = f.getAttribute('data-confirm-ok') || 'Confirm';
      openModal('confirm-modal'); return;
    }
    // double-submit guard + loading indicator
    if (!f.hasAttribute('data-no-lock')) {
      var b = $('button[type=submit],button:not([type])', f);
      if (b) setTimeout(function () { b.classList.add('loading'); b.disabled = true; }, 0);
    }
  });
  var ok = $('#confirm-ok');
  if (ok) ok.addEventListener('click', function () { if (!pendingForm) return; closeModal($('#confirm-modal')); pendingForm.dataset.confirmed = '1'; pendingForm.requestSubmit ? pendingForm.requestSubmit() : pendingForm.submit(); });
  window.addEventListener('pageshow', function () { $$('button.loading').forEach(function (b) { b.classList.remove('loading'); b.disabled = false; }); });

  // ----- dropdowns -----
  var notificationToggle = $('[data-notification-toggle]');
  function notificationStorageKey() { return 'pfm-alerts-read-' + notificationToggle.dataset.alertUser; }
  function hideNotificationCount() {
    var count = $('[data-alert-count]', notificationToggle);
    if (count) count.hidden = true;
  }
  if (notificationToggle) {
    try {
      if (localStorage.getItem(notificationStorageKey()) === notificationToggle.dataset.alertKey) hideNotificationCount();
    } catch (error) {
      console.error('Notification read state could not be loaded.', error);
    }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-dropdown-toggle]');
    $$('[data-dropdown] .dropdown-menu').forEach(function (m) { var own = t && t.closest('[data-dropdown]') === m.closest('[data-dropdown]'); if (!own) m.hidden = true; });
    if (t) {
      var m = $('.dropdown-menu', t.closest('[data-dropdown]')); m.hidden = !m.hidden;
      if (t === notificationToggle && !m.hidden) {
        try {
          localStorage.setItem(notificationStorageKey(), notificationToggle.dataset.alertKey);
          hideNotificationCount();
        } catch (error) {
          console.error('Notification read state could not be saved.', error);
        }
      }
    }
  });

  // ----- sidebar (mobile) -----
  var sb = $('#sidebar'), sc = $('.scrim');
  function sbToggle(open) { if (!sb) return; sb.classList.toggle('open', open); sc.classList.toggle('show', open); }
  $$('[data-sidebar-open]').forEach(function (b) { b.addEventListener('click', function () { sbToggle(true); }); });
  $$('[data-sidebar-close]').forEach(function (b) { b.addEventListener('click', function () { sbToggle(false); }); });
  if (sb && document.body.classList.contains('sidebar-compact')) {
    function expandSidebar() { document.body.classList.add('sidebar-expanded'); }
    function collapseSidebar() { document.body.classList.remove('sidebar-expanded'); }
    sb.addEventListener('pointerenter', expandSidebar);
    sb.addEventListener('pointerleave', collapseSidebar);
    sb.addEventListener('focusin', expandSidebar);
    sb.addEventListener('focusout', function (e) {
      if (!sb.contains(e.relatedTarget)) collapseSidebar();
    });
    sb.addEventListener('click', function (e) {
      if (e.target.closest('.nav-item')) collapseSidebar();
    });
  }
  // ----- button ripple -----
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn'); if (!b) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement('span');
    d.className = 'ripple'; d.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(d); setTimeout(function () { d.remove(); }, 600);
  });

  // ----- spotlight on cards -----
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest('.card'); if (!c) return; var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // ----- animated numbers -----
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count')); if (isNaN(target)) return;
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10), t0 = null, dur = 700;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur), v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });

  // ----- tabs (client side) -----
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[data-tab]', wrap), panels = $$('[data-panel]', wrap.parentNode);
    function show(name) { tabs.forEach(function (t) { t.classList.toggle('on', t.dataset.tab === name); }); panels.forEach(function (p) { p.hidden = p.dataset.panel !== name; }); try { history.replaceState(null, '', '#' + name); } catch (e) {} }
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.tab); }); });
    var h = location.hash.slice(1); show(tabs.some(function (t) { return t.dataset.tab === h; }) ? h : tabs[0].dataset.tab);
  });

  // ----- range filter custom toggle -----
  $$('[data-custom-toggle]').forEach(function (b) { b.addEventListener('click', function (e) { var f = b.closest('form'), d = $('.custom-dates', f); if (!d.classList.contains('show')) { e.preventDefault(); d.classList.add('show'); $('input', d).focus(); } }); });

  // ----- fill edit modals from data-* attributes -----
  $$('[data-fill]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var m = document.getElementById(btn.getAttribute('data-fill')); if (!m) return;
      var data = JSON.parse(btn.getAttribute('data-values') || '{}');
      Object.keys(data).forEach(function (k) { var el = m.querySelector('[name="' + k + '"]'); if (!el) return; if (el.type === 'checkbox') el.checked = !!+data[k]; else el.value = data[k]; });
      $$('[data-title]', m).forEach(function (t) { if (!t.dataset.orig) t.dataset.orig = t.textContent; t.textContent = btn.getAttribute('data-title') || t.textContent; });
      openModal(m.id);
    });
  });

  // ----- generate password helper -----
  $$('[data-genpass]').forEach(function (b) { b.addEventListener('click', function () {
    var chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = new Uint32Array(10); crypto.getRandomValues(a);
    for (var i = 0; i < 10; i++) out += chars[a[i] % chars.length]; var t = document.getElementById(b.getAttribute('data-genpass')); t.type = 'text'; t.value = out; }); });

  // ----- global search -----
  var sWrap = $('[data-search]');
  if (sWrap) {
    var inp = $('[data-search-input]', sWrap), pop = $('[data-search-pop]', sWrap), timer = null, ctl = null, idx = -1;
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function suggestions() { pop.innerHTML = '<div class="sp-label">Quick actions</div>' + (A.suggestions || []).map(function (s) { return '<a class="sp-item" href="' + esc(s.url) + '">' + s.icon + '<span>' + esc(s.label) + '</span></a>'; }).join(''); pop.hidden = false; }
    function results(q) {
      if (ctl) ctl.abort(); ctl = new AbortController();
      pop.innerHTML = '<div class="sp-label">Searching…</div>'; pop.hidden = false;
      fetch(A.base + '/api/search.php?q=' + encodeURIComponent(q), { signal: ctl.signal, headers: { 'X-Requested-With': 'fetch' } }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d.groups.length) { pop.innerHTML = '<div class="sp-label">No matches for “' + esc(q) + '”</div>'; return; }
        pop.innerHTML = d.groups.map(function (g) { return '<div class="sp-label">' + esc(g.title) + '</div>' + g.items.map(function (i) { return '<a class="sp-item" href="' + esc(i.url) + '"><span>' + esc(i.label) + '</span><small>' + esc(i.meta || '') + '</small></a>'; }).join(''); }).join('');
      }).catch(function (e) { if (e.name !== 'AbortError') pop.innerHTML = '<div class="sp-label">Search is unavailable right now.</div>'; });
    }
    inp.addEventListener('focus', function () { if (!inp.value.trim()) suggestions(); });
    inp.addEventListener('input', function () { clearTimeout(timer); var v = inp.value.trim(); idx = -1; if (v.length < 1) { suggestions(); return; } timer = setTimeout(function () { results(v); }, 220); });
    inp.addEventListener('keydown', function (e) {
      var items = $$('.sp-item', pop); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(items.length, 1); items.forEach(function (i, n) { i.classList.toggle('hl', n === idx); }); }
      else if (e.key === 'Enter' && idx >= 0 && items[idx]) { e.preventDefault(); location.href = items[idx].href; }
      else if (e.key === 'Escape') { pop.hidden = true; inp.blur(); }
    });
    document.addEventListener('click', function (e) { if (!sWrap.contains(e.target)) pop.hidden = true; });
  }
})();
