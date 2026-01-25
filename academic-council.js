(function () {
  'use strict';

  var ROUTE_PATH = '/about/academicouncil';
  var PDF_PATH = '/docs/ISL-Second-Acad-Council-MOM-26-July-2025.pdf';

  function getPdfUrl() {
    // When served from a web server, `/docs/...` is correct.
    // When opened via `file://` (local testing), leading `/` points to disk root,
    // so we switch to a relative path.
    if (window.location && window.location.protocol === 'file:') {
      return PDF_PATH.replace(/^\//, '');
    }
    return PDF_PATH;
  }

  function isAcademicCouncilRoute() {
    var path = window.location.pathname || '';
    return path === ROUTE_PATH || path === ROUTE_PATH + '/';
  }

  function getImageUrl(fileName) {
    if (window.location && window.location.protocol === 'file:') {
      return fileName;
    }
    return '/' + String(fileName).replace(/^\/+/, '');
  }

  function buildAcademicCouncilNode() {
    var pdfUrl = getPdfUrl();

    var container = document.createElement('div');
    container.className = 'pt-90 pb-90';

    var inner = document.createElement('div');
    inner.className = 'container';

    var row = document.createElement('div');
    row.className = 'row justify-content-center';

    var col = document.createElement('div');
    col.className = 'col-lg-10';

    var card = document.createElement('div');
    card.className = 'card shadow-sm';

    var body = document.createElement('div');
    body.className = 'card-body';

    var h4 = document.createElement('h4');
    h4.className = 'mb-20';
    h4.textContent = 'Academic Council';

    var p = document.createElement('p');
    p.className = 'mb-15 text-center';
    p.textContent = 'ISL Second Acad Council - MOM - 26 July 2025 (Signed Final)';

    var viewerWrap = document.createElement('div');
    viewerWrap.className = 'mt-20';
    viewerWrap.style.border = '1px solid rgba(0,0,0,0.12)';
    viewerWrap.style.borderRadius = '8px';
    viewerWrap.style.overflow = 'hidden';
    viewerWrap.style.height = '80vh';
    viewerWrap.style.minHeight = '600px';
    viewerWrap.style.background = '#fff';

    // Prefer <object> so browsers with built-in PDF viewer render inline.
    // Fallback content inside <object> will be shown if PDF preview is not supported.
    var object = document.createElement('object');
    object.setAttribute('data', pdfUrl);
    object.setAttribute('type', 'application/pdf');
    object.style.width = '100%';
    object.style.height = '100%';

    var fallback = document.createElement('div');
    fallback.className = 'p-20 text-center';

    var fallbackText = document.createElement('p');
    fallbackText.className = 'mb-10';
    fallbackText.textContent = 'PDF preview is not available in this browser.';

    var openLink = document.createElement('a');
    openLink.href = pdfUrl;
    openLink.target = '_blank';
    openLink.rel = 'noopener noreferrer';
    openLink.textContent = 'Open PDF in new tab';

    fallback.appendChild(fallbackText);
    fallback.appendChild(openLink);

    object.appendChild(fallback);
    viewerWrap.appendChild(object);

    var galleryWrap = document.createElement('div');
    galleryWrap.className = 'mt-25';
    galleryWrap.style.marginTop = '24px';

    var galleryTitle = document.createElement('h5');
    galleryTitle.className = 'mb-15 text-center';
    galleryTitle.style.marginBottom = '12px';
    galleryTitle.textContent = 'IMAGES OF ACADEMIC COUNCIL';

    var galleryGrid = document.createElement('div');
    galleryGrid.style.display = 'grid';
    galleryGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    galleryGrid.style.gap = '12px';

    var imageFiles = ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg'];
    for (var i = 0; i < imageFiles.length; i++) {
      var fileName = imageFiles[i];
      var src = getImageUrl(fileName);

      var link = document.createElement('a');
      link.href = src;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'block';
      link.style.borderRadius = '10px';
      link.style.overflow = 'hidden';
      link.style.border = '1px solid rgba(0,0,0,0.12)';
      link.style.background = '#fff';

      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Academic Council photo ' + (i + 1);
      img.loading = 'lazy';
      img.style.display = 'block';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'cover';

      // Keep thumbnails visually consistent where supported.
      img.style.aspectRatio = '4 / 3';

      link.appendChild(img);
      galleryGrid.appendChild(link);
    }

    galleryWrap.appendChild(galleryTitle);
    galleryWrap.appendChild(galleryGrid);

    var titleWrap = document.createElement('div');
    titleWrap.className = 'text-center';
    titleWrap.appendChild(h4);
    titleWrap.appendChild(p);

    body.appendChild(titleWrap);
    body.appendChild(viewerWrap);
    body.appendChild(galleryWrap);

    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);
    inner.appendChild(row);
    container.appendChild(inner);

    return container;
  }

  function replace404IfPresent() {
    if (!isAcademicCouncilRoute()) return;

    var root = document.getElementById('root');
    if (!root) return;

    // If we've already rendered our content, don't do it again.
    if (root.querySelector('[data-academic-council-page="true"]')) return;

    // 404 screen uses an image with src containing 404.png
    var notFoundImg = root.querySelector('img[alt="404"], img[src*="404.png"]');
    if (!notFoundImg) return;

    // Try to replace the section container that holds the 404 image.
    var section = notFoundImg.closest('.pt-90') || notFoundImg.closest('section') || notFoundImg.parentElement;
    if (!section) return;

    var page = buildAcademicCouncilNode();
    page.setAttribute('data-academic-council-page', 'true');

    section.replaceWith(page);
  }

  function onRouteChange() {
    // Let React render first, then replace 404 if needed.
    window.setTimeout(replace404IfPresent, 0);
  }

  function hookHistory() {
    var originalPushState = history.pushState;
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      onRouteChange();
    };

    var originalReplaceState = history.replaceState;
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      onRouteChange();
    };

    window.addEventListener('popstate', onRouteChange);
  }

  function observeRoot() {
    var root = document.getElementById('root');
    if (!root) return;

    var observer = new MutationObserver(function () {
      replace404IfPresent();
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function init() {
    hookHistory();

    // initial load
    replace404IfPresent();

    // in case React renders later
    observeRoot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
