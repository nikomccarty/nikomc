/* main.js — shared across all pages */
(function () {
  'use strict';

  /* --------------------------------------------------------
     Dark / light mode
     - Reads saved preference from localStorage.
     - Falls back to system preference (prefers-color-scheme).
     - Applies theme before first paint by setting data-theme
       on <html> immediately (no flash).
  -------------------------------------------------------- */
  var STORAGE_KEY = 'theme';

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /* Apply immediately on load */
  applyTheme(getPreferred());

  /* Wire up the toggle button once DOM is ready */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  /* --------------------------------------------------------
     Hamburger nav toggle (mobile)
  -------------------------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var nav       = document.getElementById('main-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.querySelector('.icon-open').style.display  = open ? 'none' : '';
      hamburger.querySelector('.icon-close').style.display = open ? ''     : 'none';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.querySelector('.icon-open').style.display  = '';
        hamburger.querySelector('.icon-close').style.display = 'none';
      }
    });
  }

  /* --------------------------------------------------------
     Post list filtering by tag + text search.

     On listing pages, <ul id="post-list"> carries a
     data-filter attribute ("essay" or "shortform") that
     hides items whose data-tag doesn't match.
     Search then narrows within the visible set.
  -------------------------------------------------------- */
  var searchInput = document.getElementById('search-input');
  var postList    = document.getElementById('post-list');
  var noResults   = document.getElementById('no-results');

  if (postList) {
    var requiredTag = postList.getAttribute('data-filter') || null;
    var items = Array.prototype.slice.call(postList.querySelectorAll('li[data-tag]'));

    items.forEach(function (li) {
      if (requiredTag && li.getAttribute('data-tag') !== requiredTag) {
        li.style.display = 'none';
        li.setAttribute('data-tag-hidden', 'true');
      }
    });

    function applySearch() {
      var query   = searchInput ? searchInput.value.toLowerCase().trim() : '';
      var visible = 0;

      items.forEach(function (li) {
        if (li.getAttribute('data-tag-hidden') === 'true') return;

        var title = (li.getAttribute('data-title') || '').toLowerCase();
        var text  = li.textContent.toLowerCase();
        var match = !query || title.indexOf(query) !== -1 || text.indexOf(query) !== -1;

        li.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      if (noResults) {
        noResults.style.display = visible === 0 ? '' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applySearch);
    }

    applySearch();
  }

  /* --------------------------------------------------------
     Mobile sidenotes — collect all sidenotes from .post-body
     and render them as a numbered list at the article footer.
     Only runs when the viewport is mobile-width (≤780px).
  -------------------------------------------------------- */
  function buildMobileSidenotes() {
    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    var sidenotes = Array.prototype.slice.call(postBody.querySelectorAll('.sidenote'));
    if (sidenotes.length === 0) return;

    var footer = document.querySelector('.sn-footer');
    if (footer) footer.parentNode.removeChild(footer);

    var section = document.createElement('div');
    section.className = 'sn-footer';

    var label = document.createElement('p');
    label.className = 'sn-footer-label';
    label.textContent = 'Notes';
    section.appendChild(label);

    var list = document.createElement('ol');
    list.className = 'sn-footer-list';

    sidenotes.forEach(function (sn, i) {
      var li = document.createElement('li');

      var num = document.createElement('span');
      num.className = 'sn-footer-num';
      num.textContent = (i + 1) + '.';

      var text = document.createElement('span');
      text.innerHTML = sn.innerHTML.replace(/^\d+\s*/, '');

      li.appendChild(num);
      li.appendChild(text);
      list.appendChild(li);
    });

    section.appendChild(list);
    postBody.appendChild(section);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.matchMedia('(max-width: 780px)').matches) {
      buildMobileSidenotes();
    }
  });

  /* --------------------------------------------------------
     Active nav link — essay / shortform sub-pages.
     Top-level pages set class="active" in markup.
     For posts in /essays/, derive from post-tag meta.
  -------------------------------------------------------- */
  if (nav) {
    var path    = window.location.pathname;
    var tagMeta = document.querySelector('meta[name="post-tag"]');
    var tag     = tagMeta ? tagMeta.getAttribute('content') : null;

    if (path.includes('/essays/')) {
      var targetHref = tag === 'shortform' ? 'shortform.html' : 'essays.html';
      nav.querySelectorAll('a').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href.endsWith(targetHref)) {
          a.classList.add('active');
        }
      });
    }
  }

}());
